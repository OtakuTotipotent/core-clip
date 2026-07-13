import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { CREDIT_PRICES } from "@/lib/credits";

export async function POST(req: NextRequest) {
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ message: "Missing Svix headers" }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SIGNING_SECRET || "");
  let evt: { type: string; data: Record<string, unknown> };
  try {
    evt = wh.verify(body, { "svix-id": svix_id, "svix-timestamp": svix_timestamp, "svix-signature": svix_signature }) as { type: string; data: Record<string, unknown> };
  } catch {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  await connectToDatabase();
  const { type, data } = evt;
  if (type === "user.created" || type === "user.updated") {
    await User.findOneAndUpdate(
      { id: data.id },
      {
        id: data.id,
        email: data.email_addresses?.[0]?.email_address || "",
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Clerk User",
        image: data.image_url || "",
        credits: CREDIT_PRICES.signup,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  } else if (type === "user.deleted") {
    await User.deleteOne({ id: data.id });
  } else if (type === "paymentAttempt.updated") {
    if ((data.charge_type === "recurring" || data.charge_type === "checkout") && data.status === "paid") {
      const planId = data.subscription_items?.[0]?.plan?.slug || data.subscription_item?.plan?.slug;
      const credits = planId === "premium" ? CREDIT_PRICES.premium : planId === "pro" ? CREDIT_PRICES.pro : 0;
      if (credits) {
        await User.findOneAndUpdate({ id: data.payer?.user_id }, { $inc: { credits } }, { upsert: true, new: true, setDefaultsOnInsert: true });
      }
    }
  }

  return NextResponse.json({ received: true, type });
}
