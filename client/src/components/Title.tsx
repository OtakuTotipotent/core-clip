import { motion } from "framer-motion";

interface TitleProps {
  title?: string;
  heading?: string;
  description?: string;
}

export default function Title({ title, heading, description }: TitleProps) {
  return (
    <div className="text-center mb-16">
      {title && (
        <motion.p
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
          className="text-sm font-medium text-gray-300 bg-pink-500 w-fit m-auto px-8 py-2 rounded-full uppercase tracking-wide mb-3"
        >
          {title}
        </motion.p>
      )}
      {heading && (
        <motion.h2
          className="text-2xl md:text-4xl text-pink-500 font-semibold"
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 70,
            mass: 1,
            delay: 0.1,
          }}
        >
          {heading}
        </motion.h2>
      )}
      {description && (
        <motion.p
          className="max-w-md mx-auto text-sm text-pink-300 my-3"
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
          {description}
        </motion.p>
      )}
    </div>
  );
}
