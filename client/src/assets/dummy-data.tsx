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

export const plansData = [
  {
    id: "starter",
    name: "Starter",
    price: "$10",
    desc: "Try the platform at no cost.",
    credits: 25,
    features: [
      "25 Credits",
      "Standard Quality",
      "No watermark",
      "Slower generation speed",
      "Email Support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    desc: "Creators & small teams.",
    credits: 80,
    features: [
      "80 Credits",
      "HD Quality",
      "NO watermark",
      "Video Generation",
      "Priority Support",
    ],
    popular: true,
  },
  {
    id: "ultra",
    name: "Ultra",
    price: "$99",
    desc: "Scale across teams & agencies",
    credits: "300",
    features: [
      "300 Credits",
      "FHD Quality",
      "No watermark",
      "Fast generation speed",
      "Chat + Email Support",
    ],
  },
];

export const footerLinks = [
  {
    title: "title",
    links: [
      { name: "link", url: "#" },
      { name: "link", url: "#" },
      { name: "link", url: "#" },
      { name: "link", url: "#" },
    ],
  },
  {
    title: "title",
    links: [
      { name: "link", url: "#" },
      { name: "link", url: "#" },
      { name: "link", url: "#" },
      { name: "link", url: "#" },
    ],
  },
  {
    title: "title",
    links: [
      { name: "link", url: "#" },
      { name: "link", url: "#" },
      { name: "link", url: "#" },
      { name: "link", url: "#" },
    ],
  },
];
