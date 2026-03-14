import { UploadIcon, VideoIcon, ZapIcon } from "lucide-react";
import product1 from "./product1.png";
import model1 from "./model1.png";
import generated1 from "./generated1.png";
import generatedVideo1 from "./generatedVideo1.mp4";

export const assets = {};

export const dummyGenerations = [
  {
    id: "gen_1",
    aspectRatio: "16:9",
    productDescription: "Sky Colored Trolly Bag",
    productName: "Trolly Bag",
    targetLength: 5,
    uploadedImages: [product1, model1],
    userId: "user_1",
    userPrompt: "Create the video where center of attraction is a trolly bag",
    generatedImage: generated1,
    generatedVideo: generatedVideo1,
    isGenerating: false,
    isPublished: false,
    createdAt: "2023-03-15T00:00:00.000Z",
    updatedAt: "",
  },
  {
    id: "gen_2",
    aspectRatio: "16:9",
    productDescription: "Sky Colored Trolly Bag",
    productName: "Trolly Bag",
    targetLength: 5,
    uploadedImages: [product1, model1],
    userId: "user_1",
    userPrompt: "Create the video where center of attraction is a trolly bag",
    generatedImage: generated1,
    generatedVideo: generatedVideo1,
    isGenerating: false,
    isPublished: true,
    createdAt: "2023-03-15T00:00:00.000Z",
    updatedAt: "",
  },
  {
    id: "gen_3",
    aspectRatio: "16:9",
    productDescription: "Sky Colored Trolly Bag",
    productName: "Trolly Bag",
    targetLength: 5,
    uploadedImages: [product1, model1],
    userId: "user_1",
    userPrompt: "Create the video where center of attraction is a trolly bag",
    generatedImage: generated1,
    generatedVideo: generatedVideo1,
    isGenerating: true,
    isPublished: true,
    createdAt: "2023-03-15T00:00:00.000Z",
    updatedAt: "",
  },
  {
    id: "gen_4",
    aspectRatio: "16:9",
    productDescription: "Sky Colored Trolly Bag",
    productName: "Trolly Bag",
    targetLength: 5,
    uploadedImages: [product1, model1],
    userId: "user_1",
    userPrompt: "Create the video where center of attraction is a trolly bag",
    generatedImage: generated1,
    generatedVideo: generatedVideo1,
    isGenerating: true,
    isPublished: false,
    createdAt: "2023-03-15T00:00:00.000Z",
    updatedAt: "",
  },
  {
    id: "gen_5",
    aspectRatio: "16:9",
    productDescription: "Sky Colored Trolly Bag",
    productName: "Trolly Bag",
    targetLength: 5,
    uploadedImages: [product1, model1],
    userId: "user_1",
    userPrompt: "Create the video where center of attraction is a trolly bag",
    generatedImage: generated1,
    generatedVideo: generatedVideo1,
    isGenerating: false,
    isPublished: true,
    createdAt: "2023-03-15T00:00:00.000Z",
    updatedAt: "",
  },
];

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

export const faqData = [
  {
    question: "How does the AI generation work?",
    answer:
      "We leverage state-of-the-art diffusion models trained on millions of product images to blend your product into realistic scenes while preserving details, lighting & reflections.",
  },
  {
    question: "Do I own the generated images?",
    answer:
      "Yes - you receive full commercial rights to any images and videos generated on the platform. Use them for ads, ecommerce, social media and more.",
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
      { name: "Home", url: "#" },
      { name: "Features", url: "#" },
      { name: "Pricing", url: "#" },
      { name: "FAQ", url: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", url: "#" },
      { name: "Terms of Service", url: "#" },
    ],
  },
  {
    title: "Socials",
    links: [
      { name: "Twitter/X", url: "#" },
      { name: "LinkedIn", url: "#" },
      { name: "GitHub", url: "#" },
    ],
  },
];
