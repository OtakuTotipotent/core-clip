import { User } from "@/models/User";

export const CREDIT_PRICES = {
  image: 5,
  video: 10,
  signup: 20,
  pro: 80,
  premium: 240,
} as const;

export async function ensureUserRecord(userId: string) {
  const user = await User.findOneAndUpdate(
    { id: userId },
    {
      $setOnInsert: {
        id: userId,
        email: `${userId}@no-reply.clerk`,
        name: "Clerk User",
        image: "",
        credits: CREDIT_PRICES.signup,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return user;
}

export async function deductCredits(userId: string, amount: number) {
  const user = await User.findOneAndUpdate(
    { id: userId, credits: { $gte: amount } },
    { $inc: { credits: -amount } },
    { new: true },
  );

  return user;
}

export async function refundCredits(userId: string, amount: number) {
  const user = await User.findOneAndUpdate(
    { id: userId },
    { $inc: { credits: amount } },
    { new: true },
  );

  return user;
}
