"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth, useClerk, getToken } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const plans = [
  {
    slug: "starter",
    name: "Free / Starter",
    price: "$0",
    credits: 20,
    description: "Explore the triple-engine generation workspace at no cost.",
    popular: false,
  },
  {
    slug: "pro",
    name: "Pro Creator",
    price: "$9",
    credits: 80,
    description: "Ideal for growing brands and content creators.",
    popular: false,
  },
  {
    slug: "premium",
    name: "Premium Agency",
    price: "$29",
    credits: 240,
    description: "High-volume generation built for full scale campaigns.",
    popular: true,
  },
];

export default function PlansPage() {
  const { isLoaded, userId, getToken } = useAuth();
  const { openUserProfile } = useClerk();
  const router = useRouter();
  const [activePlan, setActivePlan] = useState<string>("starter");
  const [planSynced, setPlanSynced] = useState<boolean>(false);

  const loading = !isLoaded || (!!userId && !planSynced);

  const fetchCurrentPlan = useCallback(
    async (isFormallyLoading: boolean) => {
      try {
        const token = await getToken();

        if (!token) {
          setActivePlan("starter");
          return;
        }

        const res = await fetch("/api/user/credits", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();

        setActivePlan(data.planSlug ?? "starter");
      } catch (err) {
        console.error(err);
      } finally {
        if (isFormallyLoading) {
          setPlanSynced(true);
        }
      }
    },
    [getToken],
  );

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const handleWindowFocus = () => {
      void fetchCurrentPlan(false);
    };

    const initialSync = window.setTimeout(() => {
      void fetchCurrentPlan(true);
    }, 0);

    window.addEventListener("focus", handleWindowFocus);
    return () => {
      window.clearTimeout(initialSync);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [isLoaded, userId, fetchCurrentPlan]);

  const handleSelectPlan = (slug: string) => {
    if (!isLoaded) return;

    if (!userId) {
      toast.error("Please sign in to manage account packages.");
      router.push("/sign-in");
      return;
    }

    if (slug === activePlan) {
      toast.success("This tier is currently active on your account!");
      return;
    }

    openUserProfile({
      group: "billing",
    });

    setTimeout(() => {
      void fetchCurrentPlan(false);
    }, 1500);
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

      {loading ? (
        <div className="text-center py-12 text-gray-500 animate-pulse">
          Syncing backend payment matrix...
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 items-stretch">
          {plans.map((plan) => {
            const isActive = activePlan === plan.slug;

            return (
              <div
                key={plan.slug}
                className={`rounded-3xl border p-8 flex flex-col justify-between shadow-xl transition-all duration-300 relative ${
                  isActive
                    ? "border-pink-500 bg-pink-950/20 ring-1 ring-pink-500/40"
                    : plan.popular
                      ? "border-white/20 bg-linear-to-b from-neutral-900 to-black/40"
                      : "border-white/10 bg-black/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                      {plan.name}
                    </h2>
                    {isActive ? (
                      <span className="text-[10px] uppercase tracking-wider font-extrabold bg-pink-600 text-white px-2.5 py-0.5 rounded-full shadow-md">
                        Current Plan
                      </span>
                    ) : plan.slug === "premium" ? (
                      <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white/10 text-pink-400 px-2.5 py-0.5 rounded-full border border-pink-500/20">
                        Top Value
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="my-6">
                    <div className="text-4xl font-extrabold text-pink-500">
                      {plan.price}
                      <span className="text-xs text-gray-400 font-normal select-none">
                        /mo
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400 uppercase tracking-wide">
                      Clerk Billed Profile
                    </p>
                  </div>
                </div>

                <div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3 mb-6 text-center">
                    <span className="text-xs text-gray-300 block">
                      Yield Token Pack
                    </span>
                    <span className="text-lg font-bold text-white">
                      +{plan.credits} CoreCredits / mo
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan.slug)}
                    className={`w-full rounded-full py-3 font-semibold text-sm transition-all cursor-pointer shadow-md ${
                      isActive
                        ? "bg-neutral-800 text-pink-500 border border-pink-500/30 font-bold"
                        : plan.slug === "premium"
                          ? "bg-pink-600 hover:bg-pink-700 text-white shadow-pink-600/10"
                          : "bg-white text-black hover:bg-gray-200"
                    }`}
                  >
                    {isActive ? "Currently Provisioned" : "Modify Subscription"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
