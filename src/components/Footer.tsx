"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { footerLinks } from "@/lib/mock-data";
import Image from "next/image";

export default function Footer() {
  return (
    <motion.footer
      className="bg-pink-900/10 border-t border-pink-500/10 pt-10 text-gray-400"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-pink-500/10">
          <div>
            <Image
              src="/logo.svg"
              alt="logo"
              className="h-14 w-auto"
              style={{
                width: "auto",
                height: "56px",
              }}
              width={120}
              height={56}
              priority
            />
            <p className="max-w-102.5 mt-6 text-sm leading-relaxed">
              Create beautiful imagery & targeted ads. Upload images of model &
              product photos - Our AI instantly produces professional lifestyle
              imagery.
            </p>
          </div>

          <div className="flex flex-wrap justify-between w-full md:w-[45%] gap-5">
            {footerLinks.map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold text-base text-pink-500 md:mb-5 mb-2">
                  {section.title}
                </h3>
                <ul className="text-sm space-y-1">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <Link
                        href={link.url}
                        className="hover:text-pink-500 transition"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="py-4 text-center text-sm text-pink-500">
          © {new Date().getFullYear()} <Link href="/">CoreClips</Link>. All
          rights reserved.
        </p>
      </div>
    </motion.footer>
  );
}
