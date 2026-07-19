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
  const [productImage, setProductImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!productImage) {
      toast.error("Please provide a product photograph asset.");
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
    formData.append("images", productImage);

    try {
      const res = await fetch("/api/project/create", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Pipeline initialization failed.");
        setLoading(false);
        return;
      }

      toast.success("Triple-engine generation active!");
      router.push(`/result/${data.projectId}`);
    } catch {
      toast.error("An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold text-pink-500 mb-4">
        Generate Commercial Ad Space
      </h1>
      <p className="text-gray-400 mb-8">
        Upload your item visual asset. CoreClip distributes rendering contexts
        across 3 professional studio pipelines.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-white/10 bg-black/40 p-8 shadow-xl backdrop-blur-md"
      >
        <div className="grid gap-6 md:grid-cols-2 text-gray-300">
          <label className="text-sm font-medium text-pink-500">
            Campaign Reference Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-pink-500 focus:outline-none transition-colors"
            />
          </label>
          <label className="text-sm font-medium text-pink-500">
            Target Product Name *
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-pink-500 focus:outline-none transition-colors"
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-pink-500">
          Product Details & Features (Optional)
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            rows={2}
            placeholder="Describe features, colors, textures or premium look highlights..."
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-pink-500 focus:outline-none transition-colors placeholder:text-gray-600"
          />
        </label>

        <label className="block text-sm font-medium text-pink-500">
          Target Theme or Ad Background Prompt (Optional)
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            rows={2}
            placeholder="E.g., Positioned on a luxury dark marble countertop with clean bokeh highlights..."
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-pink-500 focus:outline-none transition-colors placeholder:text-gray-600"
          />
        </label>

        <div className="grid gap-6 md:grid-cols-2 items-end">
          <label className="text-sm font-medium text-pink-500 w-full">
            Ad Layout Dimensions
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-white focus:border-pink-500 focus:outline-none transition-colors appearance-none"
            >
              <option value="9:16">9:16 (Vertical Reel / Story)</option>
              <option value="16:9">16:9 (Horizontal Wide Display)</option>
              <option value="1:1">1:1 (Square Social Post)</option>
            </select>
          </label>

          <div className="flex flex-col w-full">
            <span className="text-sm font-medium text-pink-500 mb-2">
              Upload Product Image *
            </span>
            <div className="relative rounded-xl border border-dashed border-white/20 bg-white/5 p-3.5 text-center hover:border-pink-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProductImage(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <p className="text-xs text-gray-400 truncate">
                {productImage
                  ? `Selected: ${productImage.name}`
                  : "Drop your product photo asset here"}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-pink-600 px-8 py-3.5 font-semibold text-white disabled:opacity-50 hover:bg-pink-700 transition-colors w-full md:w-auto shadow-lg shadow-pink-600/20 cursor-pointer"
          >
            {loading
              ? "Generating 3 Commercial Layouts..."
              : "Generate 3 Ad Concepts (5 Credits)"}
          </button>
        </div>
      </form>
    </div>
  );
}
