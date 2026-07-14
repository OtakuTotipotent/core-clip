import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { User } from "@/models/User";

export default async function CommunityPage() {
  await connectToDatabase();
  const projects = await Project.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .limit(12);
  const projectsWithUsers = await Promise.all(
    projects.map(async (project) => {
      const user = await User.findOne({ id: project.userId });
      return {
        ...project.toObject(),
        id: String(project._id),
        user: { name: user?.name || "Unknown", image: user?.image || "" },
      };
    }),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold text-pink-500 mb-4">
        Community Gallery
      </h1>
      <p className="text-gray-300 mb-8">
        Published ads from creators using CoreClip.
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {projectsWithUsers.map((project) => (
          <Link
            key={project.id}
            href={`/result/${project.id}`}
            className="rounded-2xl border border-white/10 bg-black/40 p-4"
          >
            <div className="mb-4 aspect-video rounded-xl bg-pink-950/40" />
            <h2 className="text-lg text-pink-500">{project.productName}</h2>
            <p className="text-sm text-gray-300">{project.user?.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
