"use client";

import { useEffect, useState, useCallback, use } from "react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import { DownloadIcon, GlobeIcon, LockIcon, CopyIcon } from "lucide-react";
import type { ProjectRecord } from "@/types";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ResultPage({ params }: PageProps) {
  const { projectId } = use(params);
  const { getToken } = useAuth();
  const [project, setProject] = useState<ProjectRecord | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/user/projects/${projectId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      return data.project || null;
    } catch {
      return null;
    }
  }, [getToken, projectId]);

  useEffect(() => {
    fetchProject().then((proj) => {
      if (proj) {
        setProject({ ...proj, id: proj._id || proj.id });
      }
    });
  }, [fetchProject]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (project?.isGenerating) {
      interval = setInterval(async () => {
        const updatedProject = await fetchProject();
        if (updatedProject) {
          const normalized = {
            ...updatedProject,
            id: updatedProject._id || updatedProject.id,
          };
          setProject(normalized);

          if (!normalized.isGenerating) {
            if (
              normalized.error &&
              !normalized.generatedImageA &&
              !normalized.generatedImageB &&
              !normalized.generatedImageC
            ) {
              toast.error(`Generation failed: ${normalized.error}`);
            } else {
              toast.success("Ad variants initialized successfully!");
            }
            clearInterval(interval);
          }
        }
      }, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [project?.isGenerating, fetchProject]);

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
      toast.success("Asset download initiated");
    } catch {
      toast.error("Failed to download composition image");
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Ad workspace copied!");
    }
  };

  const togglePublish = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/user/publish/${projectId}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setProject((prev) =>
        prev ? { ...prev, isPublished: data.isPublished } : null,
      );
      toast.success(
        data.isPublished ? "Visible in Gallery!" : "Removed from Gallery",
      );
    } catch {
      toast.error("Visibility configuration failed.");
    }
  };

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-32 flex items-center justify-center text-pink-500 font-medium animate-pulse">
        Synchronizing triple-engine asset matrix...
      </div>
    );
  }

  const containerAspect =
    project.aspectRatio === "16:9"
      ? "aspect-video"
      : project.aspectRatio === "1:1"
        ? "aspect-square"
        : "aspect-[9/16]";

  // Helper renderer to render each image container dynamically
  const renderConceptCard = (
    imageSrc: string | undefined,
    label: string,
    variantKey: string,
  ) => {
    // If generation finished and this image doesn't exist, render nothing (making it optional)
    if (!project.isGenerating && !imageSrc) return null;

    return (
      <div className="rounded-3xl border border-white/10 bg-black/40 p-6 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h2 className="text-lg font-semibold text-white">{label}</h2>
            <p className="text-xs text-gray-400">
              Engine Concept: {variantKey}
            </p>
          </div>
          {imageSrc && (
            <button
              onClick={() =>
                handleDownload(
                  imageSrc,
                  `${project.productName}-${variantKey}.jpg`,
                )
              }
              className="text-pink-500 hover:text-white bg-pink-500/10 hover:bg-pink-500 rounded-full transition-all p-2.5"
            >
              <DownloadIcon size={18} />
            </button>
          )}
        </div>

        <div
          className={`relative w-full rounded-2xl overflow-hidden border border-white/5 bg-neutral-900 flex items-center justify-center ${containerAspect}`}
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={`${project.productName} ${label}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <span className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
              <span className="text-xs uppercase tracking-widest text-pink-500 font-medium animate-pulse">
                Rendering...
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-pink-500 font-semibold mb-1 block">
            Studio Output Workspace
          </span>
          <h1 className="text-3xl font-bold text-white mb-2">
            {project.productName}
          </h1>
          <p className="text-gray-400 max-w-xl">
            {project.productDescription ||
              "Commercial ad concepts distributed across variant layers."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition-colors cursor-pointer"
          >
            <CopyIcon size={14} /> Copy Link
          </button>
          <button
            onClick={togglePublish}
            disabled={project.isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-pink-500 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            {project.isPublished ? (
              <GlobeIcon size={14} />
            ) : (
              <LockIcon size={14} />
            )}
            {project.isPublished ? "Public" : "Private"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
        {renderConceptCard(
          project.generatedImageA,
          "Concept Master Alpha",
          "Flux-Realism",
        )}
        {renderConceptCard(
          project.generatedImageB,
          "Concept Master Beta",
          "Flux-Base",
        )}
        {renderConceptCard(
          project.generatedImageC,
          "Concept Master Gamma",
          "Turbo-Engine",
        )}
      </div>
    </div>
  );
}
