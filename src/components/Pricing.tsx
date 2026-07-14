import Title from "./Title";

const plans = [
  {
    name: "Starter",
    price: "$10",
    credits: 25,
    description: "Try the platform at no cost.",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    credits: 80,
    description: "Creators & small teams.",
    popular: true,
  },
  {
    name: "Premium",
    price: "$99",
    credits: 240,
    description: "Scale across teams & agencies.",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-white/3 border-t border-white/6">
      <div className="max-w-6xl mx-auto px-4">
        <Title
          title="Pricing"
          heading="Pricing plans suitable for you"
          description="Our pricing plans are simple, transparent and flexible. Choose the plan that best suits your needs the best."
        />

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border p-8 ${plan.popular ? "border-pink-500 bg-pink-950/30" : "border-white/10 bg-black/30"} hover:opacity-80 cursor-default`}
            >
              <h3 className="text-xl font-semibold text-pink-500">
                {plan.name}
              </h3>
              <p className="mt-3 text-gray-300">{plan.description}</p>
              <div className="mt-6 text-4xl font-semibold text-pink-500">
                {plan.price}
              </div>
              <p className="mt-2 text-sm text-gray-400">
                {plan.credits} monthly credits
              </p>
              <button className="mt-8 w-full rounded-full bg-pink-600 px-4 py-2 text-white">
                Choose plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
