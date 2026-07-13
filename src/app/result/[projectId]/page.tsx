// CoreClip/src/app/result/[projectId]
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import type { ProjectRecord } from "@/types";

export default function ResultPage() {
  const params = useParams<{ projectId: string }>();
  const { getToken } = useAuth();
  const [project, setProject] = useState<ProjectRecord | null>(null);

  useEffect(() => {
    const load = async () => {
      const token = await getToken();
      const res = await fetch(`/api/user/projects/${params.projectId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await res.json();
      setProject(data.project || null);
    };
    void load();
  }, [getToken, params.projectId]);

  const generateVideo = async () => {
    const token = await getToken();
    const res = await fetch("/api/project/video", { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ projectId: params.projectId }) });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || "Video generation failed");
      return;
    }
    toast.success("Video generation started");
  };

  if (!project) return <div className="max-w-6xl mx-auto px-4 py-16 text-pink-300">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold text-white mb-4">{project.productName}</h1>
      <p className="text-pink-300 mb-8">Review your generated asset and start a video variant.</p>
      <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
          {project.generatedImage ? <Image src={project.generatedImage} alt={project.productName} width={800} height={500} className="w-full rounded-2xl" /> : <div className="aspect-video rounded-2xl bg-pink-950/40" />}
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
          <h2 className="text-xl font-semibold text-white">Details</h2>
          <p className="mt-3 text-sm text-pink-300">{project.productDescription}</p>
          <button onClick={() => void generateVideo()} className="mt-6 rounded-full bg-pink-600 px-6 py-3 text-white">Generate video</button>
        </div>
      </div>
    </div>
  );
}
