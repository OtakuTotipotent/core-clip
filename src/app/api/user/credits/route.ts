import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureUserRecord } from "@/lib/credits";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const user = await ensureUserRecord(userId);

  // Directly access the underlying object property or fall back cleanly
  const rawUser = typeof user.toObject === "function" ? user.toObject() : user;

  return NextResponse.json({
    credits: rawUser.credits ?? 0,
    planSlug: rawUser.planSlug ?? "starter",
    userId: rawUser.id,
  });
}
