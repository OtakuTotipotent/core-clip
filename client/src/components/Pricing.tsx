import Title from "./Title";
import { PricingTable } from "@clerk/react";

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-white/3 border-t border-white/6">
      <div className="max-w-6xl mx-auto px-4">
        <Title
          title="Pricing"
          heading="Pricing plans suitable for you"
          description="Our pricing plans are simple, transparent and flexible. Choose the plan that best suits your needs the best."
        />

        <div className="flex flex-wrap items-center justify-center max-w-5xl mx-auto">
          <PricingTable
            appearance={{
              variables: {
                colorBackground: "none",
                colorForeground: "#ec4899",
              },
              elements: {
                pricingTableCardBody: "bg-white/8",
                pricingTableCardHeader: "bg-white/10",
                switchThumb: "bg-pink-500",
                pricingTableCardFooterButton:
                  "!bg-pink-500 !py-2.5 !outline-0 !border-none",
              },
            }}
          />
        </div>
      </div>
    </section>
  );
}
