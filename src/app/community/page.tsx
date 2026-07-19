import Link from "next/link";
import Image from "next/image";
import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { User } from "@/models/User";

export const revalidate = 60; // Refresh view every 60 seconds

export default async function CommunityPage() {
  await connectToDatabase();

  // Find only complete projects that have been explicitly published to the gallery
  const projects = await Project.find({
    isPublished: true,
    generatedImageA: { $exists: true, $ne: "" },
  })
    .sort({ createdAt: -1 })
    .limit(18);

  const projectsWithUsers = await Promise.all(
    projects.map(async (project) => {
      const user = await User.findOne({ id: project.userId });

      // Clean up fallback names if Clerk metadata hasn't fully populated yet
      let creatorName = "Global Creator";
      if (user?.name && user.name !== "Clerk User" && user.name.trim() !== "") {
        creatorName = user.name;
      }

      return {
        ...project.toObject(),
        id: String(project._id),
        user: {
          name: creatorName,
          image: user?.image || "",
        },
      };
    }),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Header Profile Section */}
      <div className="border-b border-white/10 pb-6 mb-10">
        <span className="text-xs uppercase tracking-widest text-pink-500 font-bold mb-1.5 block">
          Showcase Hub
        </span>
        <h1 className="text-3xl font-bold text-white mb-2">
          Community Campaign Gallery
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Discover performance-driven visual ads, prompt blueprints, and
          marketing compositions generated across parallel AI rendering engines.
        </p>
      </div>

      {projectsWithUsers.length === 0 ? (
        <div className="text-center py-20 text-gray-500 rounded-3xl border border-dashed border-white/10 bg-white/5">
          No campaign components shared publicly yet. Check back shortly!
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projectsWithUsers.map((project) => (
            <Link
              key={project.id}
              href={`/result/${project.id}`}
              className="group rounded-3xl border border-white/10 bg-black/40 p-5 flex flex-col justify-between hover:border-pink-500/40 hover:bg-black/60 transition-all shadow-xl hover:-translate-y-1 duration-300"
            >
              <div>
                {/* Advanced Multi-Aspect Adaptive Container */}
                <div className="mb-4 aspect-video relative rounded-2xl overflow-hidden border border-white/5 bg-neutral-900">
                  <Image
                    src={project.generatedImageA}
                    alt={project.productName}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                  />

                  {/* Floating Layout Pill */}
                  <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-wider uppercase text-pink-400 px-2.5 py-1 rounded-full">
                    Layout: {project.aspectRatio || "9:16"}
                  </div>
                </div>

                {/* Core Descriptive Context Space */}
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-white group-hover:text-pink-500 transition-colors line-clamp-1">
                    {project.productName}
                  </h2>

                  {project.productDescription && (
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {project.productDescription}
                    </p>
                  )}

                  {/* Blueprint Prompt Insight Box */}
                  {project.userPrompt && (
                    <div className="mt-3 bg-white/5 rounded-xl p-2.5 border border-white/5 group-hover:border-white/10 transition-colors">
                      <span className="text-[10px] uppercase font-bold text-pink-500 block mb-0.5 tracking-wider">
                        Style Prompt
                      </span>
                      <p className="text-[11px] text-gray-400 italic line-clamp-1">
                        &quot;{project.userPrompt}&quot;
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Creator Metadata Box */}
              <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-2">
                  {project.user?.image ? (
                    <Image
                      src={project.user.image}
                      alt={project.user.name}
                      width={24}
                      height={24}
                      className="rounded-full border border-white/20 shadow-sm"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-pink-500/10 text-pink-500 text-[10px] font-extrabold flex items-center justify-center border border-pink-500/20">
                      CC
                    </div>
                  )}
                  <p className="text-xs text-gray-300 font-semibold line-clamp-1">
                    {project.user?.name}
                  </p>
                </div>

                <span className="text-[11px] font-medium text-pink-500 bg-pink-500/10 px-3 py-1 rounded-full group-hover:bg-pink-600 group-hover:text-white transition-all">
                  View Setup
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
