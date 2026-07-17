"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import { DownloadIcon, GlobeIcon, LockIcon } from "lucide-react";
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

  useEffect(() => {
    fetchProject().then(setProject);
  }, [fetchProject]);

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
            toast.success("Ad concepts generated successfully!");
          }
          clearInterval(interval);
        }
      }, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [project?.isGenerating, fetchProject]);

  // Download handler forces browser download via Blob
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success("Download started");
    } catch {
      toast.error("Failed to download image");
    }
  };

  // Toggle Publish to Community
  const togglePublish = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/user/publish/${params.projectId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      setProject((prev) =>
        prev ? { ...prev, isPublished: data.isPublished } : null,
      );
      toast.success(
        data.isPublished ? "Published to Community!" : "Removed from Community",
      );
    } catch {
      toast.error("Failed to update visibility");
    }
  };

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-pink-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-pink-500 mb-2">
            {project.productName}
          </h1>
          <p className="text-gray-300">
            {project.productDescription ||
              "Review your AI-generated ad concepts."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={togglePublish}
            disabled={project.isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-pink-300 transition-colors disabled:opacity-50"
          >
            {project.isPublished ? (
              <GlobeIcon size={16} />
            ) : (
              <LockIcon size={16} />
            )}
            {project.isPublished ? "Public" : "Private"}
          </button>
          <div className="text-sm px-4 py-2 bg-white/10 rounded-full text-pink-500">
            Status:{" "}
            {project.isGenerating ? "Generating Concepts..." : "Complete"}
          </div>
        </div>
      </div>

      {/* Grid Layout Fix: Align items to start so they don't stretch vertically */}
      <div className="grid gap-8 md:grid-cols-2 items-start">
        {/* Concept A */}
        <div className="rounded-3xl border border-white/10 bg-black/40 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-pink-500">Concept A</h2>
            {project.generatedImageA && (
              <button
                onClick={() =>
                  handleDownload(
                    project.generatedImageA!,
                    `${project.productName}-A.jpg`,
                  )
                }
                className="text-pink-300 hover:text-white transition-colors p-2"
                title="Download Concept A"
              >
                <DownloadIcon size={20} />
              </button>
            )}
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden border border-white/5 bg-black/60 flex items-center justify-center min-h-100">
            {project.generatedImageA ? (
              <Image
                src={project.generatedImageA}
                alt={`${project.productName} Concept A`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <span className="text-pink-500 animate-pulse">Processing...</span>
            )}
          </div>
        </div>

        {/* Concept B */}
        <div className="rounded-3xl border border-white/10 bg-black/40 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-pink-500">Concept B</h2>
            {project.generatedImageB && (
              <button
                onClick={() =>
                  handleDownload(
                    project.generatedImageB!,
                    `${project.productName}-B.jpg`,
                  )
                }
                className="text-pink-300 hover:text-white transition-colors p-2"
                title="Download Concept B"
              >
                <DownloadIcon size={20} />
              </button>
            )}
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden border border-white/5 bg-black/60 flex items-center justify-center min-h-100">
            {project.generatedImageB ? (
              <Image
                src={project.generatedImageB}
                alt={`${project.productName} Concept B`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <span className="text-pink-500 animate-pulse">Processing...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
