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
                colorPrimary: "#ec4899", // Tailwind pink-500 for Base button/link
                colorBackground: "#db2777", // Tailwind pink-600 for Entire card base
                colorText: "#000000",
              },
              elements: {
                pricingTableCardHeader: "bg-pink-600",
                pricingTableCardBody: "bg-pink-600",
                pricingTableCardFooterButton:
                  "!bg-pink-500 !hover:bg-pink-800 text-white !py-2.5 !border-none !text-white !text-sm",
              },
            }}
          />
        </div>
      </div>
    </section>
  );
}
