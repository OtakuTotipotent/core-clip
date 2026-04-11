import { ArrowRightIcon } from "lucide-react";
import { GhostButton } from "./Buttons";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="py-20 2xl:pb-32 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="rounded-3xl bg-linear-to-b from-pink-900/20 to-pink-900/5 border border-pink-500/20 p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20" />
          <div className="relative z-10">
            <motion.h2
              className="text-2xl sm:text-4xl text-pink-500 font-semibold mb-6"
              initial={{ y: 60, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 70,
                mass: 1,
              }}
            >
              Ready To Transform Your Content?
            </motion.h2>
            <motion.p
              className="max-sm:text-sm text-pink-300 mb-10 max-w-xl mx-auto"
              initial={{ y: 60, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 70,
                mass: 1,
                delay: 0.2,
              }}
            >
              Join thousands of brands creating viral reels & imagery with AI.
              No credit card required. Start creating now.
            </motion.p>
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 70,
                mass: 1,
                delay: 0.3,
              }}
            >
              <GhostButton className="px-8 py-3 gap-2 text-pink-500">
                Start Creating Now <ArrowRightIcon size={20} />
              </GhostButton>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
