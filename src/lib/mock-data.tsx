import { UploadIcon, VideoIcon, ZapIcon } from "lucide-react";

export const featuresData = [
  {
    icon: <UploadIcon className="w-6 h-6" />,
    title: "Smart Upload",
    desc: "Drag & drop your assets. We auto-optimize formats and sizes.",
  },
  {
    icon: <ZapIcon className="w-6 h-6" />,
    title: "Instant Generation",
    desc: "Optimized models deliver output in seconds with great fidelity.",
  },
  {
    icon: <VideoIcon className="w-6 h-6" />,
    title: "Video Synthesis",
    desc: "Bring product shots to life with short-form, social-ready videos.",
  },
];

export const faqData = [
  {
    question: "How does the AI generation work?",
    answer:
      "We leverage state-of-the-art diffusion models trained on millions of product images to blend your product into realistic scenes while preserving details, lighting & reflections.",
  },
  {
    question: "Do I own the generated images?",
    answer:
      "Yes - you receive full commercial rights to any images and videos generated on the platform. Use them for ads, ecom, social media and more.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes - you can cancel from your dashboard. You will retain access through the end of your billing period.",
  },
  {
    question: "What input formats do you support?",
    answer:
      "We accept JPG, PNG, and WEBP. Outputs are high resolution PNGs and MP4s optimized for social platforms.",
  },
];

export const footerLinks = [
  {
    title: "Quick Links",
    links: [
      { name: "Home", url: "/" },
      { name: "Features", url: "/#features" },
      { name: "Pricing", url: "/#pricing" },
      { name: "FAQ", url: "/#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", url: "/" },
      { name: "Terms of Service", url: "/" },
    ],
  },
  {
    title: "Socials",
    links: [
      { name: "Twitter/X", url: "/" },
      { name: "LinkedIn", url: "/" },
      { name: "GitHub", url: "/" },
    ],
  },
];
