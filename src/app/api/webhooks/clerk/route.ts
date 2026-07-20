import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { CREDIT_PRICES } from "@/lib/credits";

export async function POST(req: NextRequest) {
  const headerPayload = await headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { message: "Missing Svix headers" },
      { status: 400 },
    );
  }

  const body = await req.text();

  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SIGNING_SECRET || "");

  let event: { type: string; data: Record<string, any> };

  try {
    event = webhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: Record<string, any> };
  } catch {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  await connectToDatabase();

  const { type, data } = event;

  console.log("Webhook:", type);
  console.dir(data, { depth: null });

  switch (type) {
    case "user.created":
    case "user.updated": {
      await User.findOneAndUpdate(
        { id: data.id },
        {
          $set: {
            id: data.id,
            email: data.email_addresses?.[0]?.email_address ?? "",
            name:
              `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() ||
              "Clerk User",
            image: data.image_url ?? "",
          },
          $setOnInsert: {
            credits: CREDIT_PRICES.signup,
            planSlug: "starter",
          },
        },
        {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        },
      );

      break;
    }

    case "user.deleted": {
      await User.deleteOne({ id: data.id });
      break;
    }

    case "subscriptionItem.active": {
      const clerkUserId = data.payer?.user_id;

      if (!clerkUserId) break;

      const slug = String(data.plan?.slug ?? "").toLowerCase();

      if (slug === "pro") {
        await User.findOneAndUpdate(
          { id: clerkUserId },
          {
            $set: {
              planSlug: "pro",
            },
            $inc: {
              credits: CREDIT_PRICES.pro,
            },
          },
          {
            returnDocument: "after",
          },
        );
      } else if (slug === "premium") {
        await User.findOneAndUpdate(
          { id: clerkUserId },
          {
            $set: {
              planSlug: "premium",
            },
            $inc: {
              credits: CREDIT_PRICES.premium,
            },
          },
          {
            returnDocument: "after",
          },
        );
      }

      break;
    }

    case "subscriptionItem.canceled":
    case "subscriptionItem.ended": {
      const clerkUserId = data.payer?.user_id;

      if (!clerkUserId) break;

      await User.findOneAndUpdate(
        { id: clerkUserId },
        {
          $set: {
            planSlug: "starter",
          },
        },
        {
          returnDocument: "after",
        },
      );

      break;
    }
  }

  return NextResponse.json({
    received: true,
  });
}
