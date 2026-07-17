import Link from "next/link";
import Image from "next/image";
import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { User } from "@/models/User";

export const revalidate = 60; // Refresh view every 60 seconds

export default async function CommunityPage() {
  await connectToDatabase();
  const projects = await Project.find({
    isPublished: true,
    generatedImageA: { $exists: true, $ne: "" },
  })
    .sort({ createdAt: -1 })
    .limit(18);

  const projectsWithUsers = await Promise.all(
    projects.map(async (project) => {
      const user = await User.findOne({ id: project.userId });
      return {
        ...project.toObject(),
        id: String(project._id),
        user: {
          name: user?.name || "Global Creator",
          image: user?.image || "",
        },
      };
    }),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="border-b border-white/10 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-pink-500 mb-2">
          Community Campaign Gallery
        </h1>
        <p className="text-gray-400">
          Discover performance-optimized visual layouts designed by creators
          around the globe.
        </p>
      </div>

      {projectsWithUsers.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No campaign components shared publicly yet.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {projectsWithUsers.map((project) => (
            <Link
              key={project.id}
              href={`/result/${project.id}`}
              className="group rounded-2xl border border-white/10 bg-black/40 p-4 flex flex-col justify-between hover:border-pink-500/40 transition-all shadow-lg hover:-translate-y-0.5 duration-200"
            >
              <div>
                <div className="mb-4 aspect-video relative rounded-xl overflow-hidden border border-white/5 bg-neutral-900">
                  <Image
                    src={project.generatedImageA}
                    alt={project.productName}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <h2 className="text-lg font-semibold text-white group-hover:text-pink-500 transition-colors line-clamp-1">
                  {project.productName}
                </h2>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-3">
                {project.user?.image ? (
                  <Image
                    src={project.user.image}
                    alt={project.user.name}
                    width={20}
                    height={20}
                    className="rounded-full border border-white/20"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-pink-500/10 text-pink-500 text-[10px] font-bold flex items-center justify-center">
                    CC
                  </div>
                )}
                <p className="text-xs text-gray-400 font-medium line-clamp-1">
                  by {project.user?.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
