// CoreClip/src/app/result/[projectId]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import type { ProjectRecord } from "@/types";

export default function ResultPage() {
  const params = useParams<{ projectId: string }>();
  const { getToken } = useAuth();
  const [project, setProject] = useState<ProjectRecord | null>(null);

  const fetchProject = useCallback(async () => {
    const token = await getToken();
    const res = await fetch(`/api/user/projects/${params.projectId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    return data.project || null;
  }, [getToken, params.projectId]);

  // Initial load
  useEffect(() => {
    fetchProject().then(setProject);
  }, [fetchProject]);

  // Polling mechanism
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (project?.isGenerating) {
      interval = setInterval(async () => {
        const updatedProject = await fetchProject();
        setProject(updatedProject);

        if (updatedProject && !updatedProject.isGenerating) {
          if (updatedProject.error) {
            toast.error(`Generation failed: ${updatedProject.error}`);
          } else {
            toast.success("Generation complete!");
          }
          clearInterval(interval);
        }
      }, 4000); // Poll every 4 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [project?.isGenerating, fetchProject]);

  const generateVideo = async () => {
    const token = await getToken();

    // Optimistically update UI to prevent double-clicking
    setProject((prev) => (prev ? { ...prev, isGenerating: true } : null));

    const res = await fetch("/api/project/video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ projectId: params.projectId }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Video generation failed");
      // Revert optimistic update on failure
      setProject((prev) => (prev ? { ...prev, isGenerating: false } : null));
      return;
    }

    toast.success("Video generation started. This may take a few minutes.");
  };

  if (!project)
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-pink-500">
        Loading...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold text-pink-500 mb-4">
        {project.productName}
      </h1>
      <p className="text-gray-300 mb-8">
        Review your generated asset and start a video variant.
      </p>

      <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-6 flex flex-col gap-4">
          {/* Display Generated Video if available, otherwise show Image */}
          {project.generatedVideo ? (
            <video
              src={project.generatedVideo}
              controls
              autoPlay
              loop
              className="w-full rounded-2xl"
            />
          ) : project.generatedImage ? (
            <Image
              src={project.generatedImage}
              alt={project.productName}
              width={800}
              height={500}
              className="w-full rounded-2xl"
            />
          ) : (
            <div className="aspect-video rounded-2xl bg-pink-950/40 flex items-center justify-center">
              <span className="text-pink-500">No media available</span>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 p-6 h-fit">
          <h2 className="text-xl font-semibold text-pink-500">Details</h2>
          <p className="mt-3 text-sm text-gray-300">
            {project.productDescription || "No description provided."}
          </p>

          <button
            onClick={() => void generateVideo()}
            disabled={project.isGenerating || !!project.generatedVideo}
            className="mt-6 w-full rounded-full bg-pink-600 px-6 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {project.isGenerating
              ? "Generating..."
              : project.generatedVideo
                ? "Video Created"
                : "Generate video (10 credits)"}
          </button>
        </div>
      </div>
    </div>
  );
}
