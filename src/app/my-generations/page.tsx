"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import type { ProjectRecord } from "@/types";
import Image from "next/image";

export default function MyGenerationsPage() {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/user/projects", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data: {
          projects?: Array<Partial<ProjectRecord> & { _id?: string }>;
        } = await res.json();

        // Normalize MongoDB identifiers safely
        const standardList = (data.projects || []).map(
          (p: Partial<ProjectRecord> & { _id?: string }) =>
            ({
              ...p,
              id: p._id ?? p.id,
            }) as ProjectRecord,
        );
        setProjects(standardList);
      } catch {
        toast.error("Failed to load user asset collection.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [getToken]);

  const togglePublish = async (projectId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/user/publish/${projectId}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      toast.success(
        data.isPublished
          ? "Added to Community Gallery"
          : "Removed from Gallery",
      );

      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? { ...project, isPublished: data.isPublished }
            : project,
        ),
      );
    } catch {
      toast.error("Could not modify visibility settings.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold text-pink-500 mb-2">
        My Generations
      </h1>
      <p className="text-gray-400 mb-8">
        Track and distribute your custom marketing campaigns.
      </p>

      {loading ? (
        <div className="text-gray-500 py-12 text-center animate-pulse">
          Syncing personal dashboard catalog...
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center rounded-3xl border border-dashed border-white/10 p-16 bg-white/5">
          <p className="text-gray-400 mb-4">No ad assets generated yet.</p>
          <Link
            href="/generate"
            className="rounded-full bg-pink-600 px-6 py-2.5 font-medium text-white hover:bg-pink-700 transition"
          >
            Create First Ad Concept
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl border border-white/10 bg-black/40 p-4 flex flex-col justify-between shadow-lg backdrop-blur-sm hover:border-white/20 transition-all"
            >
              <div>
                {project.generatedImageA ? (
                  <div className="mb-4 aspect-video relative rounded-xl overflow-hidden border border-white/5 bg-neutral-900">
                    <Image
                      src={project.generatedImageA}
                      alt={project.productName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="mb-4 aspect-video rounded-xl bg-pink-950/20 flex flex-col items-center justify-center border border-dashed border-pink-500/20 gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
                    <span className="text-xs text-pink-500 font-medium uppercase tracking-wider">
                      Rendering...
                    </span>
                  </div>
                )}

                <h2 className="text-lg font-semibold text-white line-clamp-1">
                  {project.productName}
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${project.isGenerating ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}
                  />
                  <p className="text-xs text-gray-400">
                    {project.isGenerating
                      ? "In Production Pipeline"
                      : "Ready for Deployment"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3 border-t border-white/5 pt-4">
                <Link
                  href={`/result/${project.id}`}
                  className="rounded-full bg-pink-600 px-5 py-2 text-xs font-semibold text-white hover:bg-pink-500 transition text-center flex-1"
                >
                  Open Board
                </Link>
                <button
                  onClick={() => void togglePublish(project.id)}
                  disabled={project.isGenerating}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-pink-500 hover:bg-white/5 transition disabled:opacity-40"
                >
                  {project.isPublished ? "Unpublish" : "Publish Link"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
