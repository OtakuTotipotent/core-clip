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

  useEffect(() => {
    const load = async () => {
      const token = await getToken();
      const res = await fetch("/api/user/projects", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setProjects(data.projects || []);
    };
    void load();
  }, [getToken]);

  const togglePublish = async (projectId: string) => {
    const token = await getToken();
    const res = await fetch(`/api/user/publish/${projectId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    toast.success(data.isPublished ? "Published" : "Unpublished");
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, isPublished: data.isPublished }
          : project,
      ),
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold text-pink-500 mb-4">
        My Generations
      </h1>
      <p className="text-gray-300 mb-8">Track and manage your generated ads.</p>
      <div className="grid gap-6 md:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-2xl border border-white/10 bg-black/40 p-4"
          >
            {/* Show thumbnail if ready, otherwise placeholder */}
            {project.generatedImageA ? (
              <div className="mb-4 aspect-video relative rounded-xl overflow-hidden border border-white/5">
                <Image
                  src={project.generatedImageA}
                  alt={project.productName}
                  className="w-full h-full object-cover"
                  // width={800}
                  // height={500}
                />
              </div>
            ) : (
              <div className="mb-4 aspect-video rounded-xl bg-pink-950/40 flex items-center justify-center border border-dashed border-pink-500/20">
                <span className="text-xs text-pink-500">Generating...</span>
              </div>
            )}

            <h2 className="text-lg font-medium text-pink-500 line-clamp-1">
              {project.productName}
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              {project.isGenerating ? "In Progress" : "Ready"}
            </p>

            <div className="mt-4 flex gap-3">
              <Link
                href={`/result/${project.id}`}
                className="rounded-full bg-pink-600 px-4 py-2 text-sm text-white hover:bg-pink-500 transition"
              >
                Open
              </Link>
              <button
                onClick={() => void togglePublish(project.id)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-pink-500 hover:bg-white/5 transition"
              >
                {project.isPublished ? "Unpublish" : "Publish"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
