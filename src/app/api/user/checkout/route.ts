import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { CREDIT_PRICES } from "@/lib/credits";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { planSlug } = await request.json();

    // Map the incoming tier requests to your currency parameters
    let creditIncrement = 0;
    if (planSlug === "pro") creditIncrement = CREDIT_PRICES.pro;
    else if (planSlug === "premium") creditIncrement = CREDIT_PRICES.premium;
    else {
      return NextResponse.json(
        { message: "Invalid subscription type" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Update user balance in the database
    const updatedUser = await User.findOneAndUpdate(
      { id: userId },
      { $inc: { credits: creditIncrement } },
      { new: true },
    );

    return NextResponse.json({
      success: true,
      message: `Successfully provisioned ${creditIncrement} credits!`,
      currentCredits: updatedUser?.credits ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 },
    );
  }
}
