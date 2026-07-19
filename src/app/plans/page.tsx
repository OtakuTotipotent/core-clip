"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const plans = [
  {
    slug: "starter",
    name: "Starter Account",
    price: "$0",
    credits: 20,
    description: "Explore the triple-engine generation workspace.",
    popular: false,
    actionText: "Default Starter Pack",
  },
  {
    slug: "pro",
    name: "Pro Creator",
    price: "$29",
    credits: 80,
    description: "Ideal for growing brands and content creators.",
    popular: true,
    actionText: "Purchase Pro Tier",
  },
  {
    slug: "premium",
    name: "Premium Agency",
    price: "$99",
    credits: 240,
    description: "High-volume generation fits for full scale campaigns.",
    popular: false,
    actionText: "Purchase Premium Pack",
  },
];

export default function PlansPage() {
  // isLoaded is extracted cleanly directly from useAuth hook
  const { isLoaded, userId, getToken } = useAuth();
  const router = useRouter();
  const [purchasingSlug, setPurchasingSlug] = useState<string | null>(null);

  // Removed unused price parameter to fix ESLint failure
  const handleSelectPlan = async (slug: string) => {
    if (!isLoaded) return;

    // Force a redirect to sign-in if an unauthenticated user attempts to checkout
    if (!userId) {
      toast.error("Please sign in to modify account packages.");
      router.push("/sign-in");
      return;
    }

    if (slug === "starter") {
      toast.success("You are currently enjoying the free tier credits!");
      return;
    }

    setPurchasingSlug(slug);
    const updateToast = toast.loading("Connecting to checkout engine...");

    try {
      const token = await getToken();
      const res = await fetch("/api/user/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ planSlug: slug }),
      });

      const data = await res.json();
      toast.dismiss(updateToast);

      if (!res.ok) throw new Error(data.message || "Transaction failed");

      toast.success(
        `Package synchronized! Total credits: ${data.currentCredits}`,
      );

      // Force a soft refresh to trigger the Navbar's useEffect credit loader
      window.location.reload();
    } catch (err) {
      toast.dismiss(updateToast);
      toast.error((err as Error).message);
    } finally {
      setPurchasingSlug(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center md:text-left border-b border-white/10 pb-6 mb-8">
        <span className="text-xs uppercase tracking-widest text-pink-500 font-bold mb-1 block">
          Account Tokenization
        </span>
        <h1 className="text-3xl font-bold text-white mb-2">
          CoreClip Plans & Topups
        </h1>
        <p className="text-gray-400">
          Scale your advertising throughput. Each commercial run requests 3
          separate rendering channels for 5 credits.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.slug}
            className={`rounded-3xl border p-8 flex flex-col justify-between shadow-xl transition-all duration-300 ${
              plan.popular
                ? "border-pink-500 bg-linear-to-b from-pink-950/20 to-black/40 ring-1 ring-pink-500/20"
                : "border-white/10 bg-black/30"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                {plan.popular && (
                  <span className="text-[10px] uppercase tracking-wider font-extrabold bg-pink-600 text-white px-2.5 py-0.5 rounded-full">
                    Popular Pack
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                {plan.description}
              </p>

              <div className="my-6">
                <div className="text-4xl font-extrabold text-pink-500">
                  {plan.price}
                </div>
                <p className="mt-1 text-xs text-gray-400 uppercase tracking-wide">
                  One-time package activation
                </p>
              </div>
            </div>

            <div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 mb-6 text-center">
                <span className="text-xs text-gray-300 block">
                  Yield Token Pack
                </span>
                <span className="text-lg font-bold text-white">
                  +{plan.credits} CoreCredits
                </span>
              </div>

              <button
                onClick={() => handleSelectPlan(plan.slug)}
                disabled={purchasingSlug !== null}
                className={`w-full rounded-full py-3 font-semibold text-sm transition-all cursor-pointer shadow-md ${
                  plan.slug === "starter"
                    ? "bg-neutral-800 text-gray-400 border border-white/5 cursor-not-allowed"
                    : plan.popular
                      ? "bg-pink-600 hover:bg-pink-700 text-white shadow-pink-600/10"
                      : "bg-white text-black hover:bg-gray-200"
                } disabled:opacity-40`}
              >
                {purchasingSlug === plan.slug
                  ? "Synchronizing ledger..."
                  : plan.actionText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
