import { PrimaryButton } from "@/components/Buttons";

const plans = [
  { name: "Starter", price: "$10", credits: 25, description: "Try the platform at no cost.", popular: false },
  { name: "Pro", price: "$29", credits: 80, description: "Creators & small teams.", popular: true },
  { name: "Premium", price: "$99", credits: 240, description: "Scale across teams & agencies.", popular: false },
];

export default function PlansPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold text-white mb-4">Plans</h1>
      <p className="text-pink-300 mb-8">Choose a plan and keep creating with CoreClip.</p>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className={`rounded-3xl border p-8 ${plan.popular ? "border-pink-500 bg-pink-950/30" : "border-white/10 bg-black/30"}`}>
            <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
            <p className="mt-3 text-pink-300">{plan.description}</p>
            <div className="mt-6 text-4xl font-semibold text-white">{plan.price}</div>
            <p className="mt-2 text-sm text-pink-400">{plan.credits} monthly credits</p>
            <PrimaryButton className="mt-8 w-full">Choose plan</PrimaryButton>
          </div>
        ))}
      </div>
    </div>
  );
}
