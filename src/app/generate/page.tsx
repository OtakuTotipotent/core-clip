// src/app/generate/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function GeneratePage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [name, setName] = useState("New Project");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("9:16");

  // Replaced generic FileList with discrete file states
  const [productImage, setProductImage] = useState<File | null>(null);
  const [modelImage, setModelImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  // Replaced deprecated FormEvent with SyntheticEvent
  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!productImage || !modelImage) {
      toast.error("Please upload both a product image and a model image.");
      return;
    }

    setLoading(true);
    const token = await getToken();
    const formData = new FormData();

    formData.append("name", name);
    formData.append("productName", productName);
    formData.append("productDescription", productDescription);
    formData.append("userPrompt", userPrompt);
    formData.append("aspectRatio", aspectRatio);

    // Appending both discrete files to the same 'images' key to prevent breaking the backend
    formData.append("images", productImage);
    formData.append("images", modelImage);

    try {
      const res = await fetch("/api/project/create", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Generation failed");
        setLoading(false);
        return;
      }

      toast.success("Image generation started");
      router.push(`/result/${data.projectId}`);
    } catch (error) {
      toast.error("An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold text-white mb-4">
        Create a new ad concept
      </h1>
      <p className="text-pink-300 mb-8">
        Upload your product and model images, and let CoreClip generate a
        polished ad shot.
      </p>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-white/10 bg-black/40 p-8"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <label className="text-sm text-pink-200">
            Project name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:border-pink-500 focus:outline-none transition-colors"
            />
          </label>
          <label className="text-sm text-pink-200">
            Product name
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:border-pink-500 focus:outline-none transition-colors"
            />
          </label>
        </div>
        <label className="block text-sm text-pink-200">
          Product description (Optional)
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:border-pink-500 focus:outline-none transition-colors"
          />
        </label>
        <label className="block text-sm text-pink-200">
          Prompt (Optional)
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:border-pink-500 focus:outline-none transition-colors"
          />
        </label>

        {/* Isolated aspect ratio for better layout flow */}
        <div className="w-full md:w-1/2 md:pr-3">
          <label className="text-sm text-pink-200">
            Aspect ratio
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 text-white focus:border-pink-500 focus:outline-none transition-colors appearance-none"
            >
              <option value="9:16" className="bg-neutral-900 text-white">
                9:16 (Portrait)
              </option>
              <option value="16:9" className="bg-neutral-900 text-white">
                16:9 (Landscape)
              </option>
            </select>
          </label>
        </div>

        {/* Separated Image Upload Fields */}
        <div className="grid gap-6 md:grid-cols-2">
          <label className="text-sm text-pink-200">
            Product Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProductImage(e.target.files?.[0] || null)}
              className="mt-2 block w-full rounded-xl border border-dashed border-white/10 bg-white/10 px-4 py-3 text-white file:mr-4 file:rounded-full file:border-0 file:bg-pink-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-pink-700 transition-all cursor-pointer"
            />
          </label>
          <label className="text-sm text-pink-200">
            Model Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setModelImage(e.target.files?.[0] || null)}
              className="mt-2 block w-full rounded-xl border border-dashed border-white/10 bg-white/10 px-4 py-3 text-white file:mr-4 file:rounded-full file:border-0 file:bg-pink-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-pink-700 transition-all cursor-pointer"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-pink-600 px-6 py-3 font-medium text-white disabled:opacity-60 hover:bg-pink-700 transition-colors w-full md:w-auto"
        >
          {loading ? "Generating Concept..." : "Generate Ad Concept"}
        </button>
      </form>
    </div>
  );
}
