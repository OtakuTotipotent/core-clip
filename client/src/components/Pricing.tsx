import { PricingTable } from "@clerk/react";
import Title from "./Title";

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-white/3 border-t border-white/6">
      <div className="max-w-6xl mx-auto px-4">
        <Title
          title="Pricing"
          heading="Efficient, transparent pricing"
          description="Flexible agency packages designed to fit startups, growing teams and established brands."
        />

        <div className="flex flex-wrap items-center justify-center max-w-5xl mx-auto">
          <PricingTable
            appearance={{
              variables: {
                colorBackground: "none",
                colorPrimaryForeground: "#ffffff",
              },
              elements: {
                pricingTableCardBody: "bg-white/5",
                pricingTableCardHeader: "bg-white/10",
                switchThumb: "bg-white",
              },
            }}
          />
        </div>
      </div>
    </section>
  );
}
