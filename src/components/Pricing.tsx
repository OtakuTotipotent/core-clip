import Title from "./Title";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$0",
    credits: 20,
    description: "Try out CoreClip at no cost upon account activation.",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    credits: 80,
    description: "Best for individual creators and growing digital brands.",
    popular: true,
  },
  {
    name: "Premium",
    price: "$99",
    credits: 240,
    description: "Scale across creative teams and studio design agencies.",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-white/1 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        <Title
          title="Pricing Models"
          heading="Simple, Transparent Packages"
          description="Purchase credit tiers safely. Every ad generation distributes rendering tasks across 3 dedicated engines."
        />

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto mt-12 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? "border-pink-500 bg-pink-950/20 shadow-lg shadow-pink-500/5 scale-[1.01]"
                  : "border-white/10 bg-black/30 shadow-md"
              }`}
            >
              <div>
                <h3 className="text-xl font-bold text-white">
                  {plan.name} Plan
                </h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  {plan.description}
                </p>

                <div className="mt-6">
                  <div className="text-4xl font-extrabold text-pink-500">
                    {plan.price}
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    {plan.credits} production tokens included
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/plans"
                  className={`block w-full text-center rounded-full py-2.5 text-sm font-semibold transition-all ${
                    plan.popular
                      ? "bg-pink-600 hover:bg-pink-700 text-white"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  }`}
                >
                  View Activation Plan
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
