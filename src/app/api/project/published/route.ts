import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { User } from "@/models/User";

export async function GET() {
  await connectToDatabase();
  const projects = await Project.find({ isPublished: true }).sort({ createdAt: -1 });
  const enrichedProjects = await Promise.all(
    projects.map(async (project) => {
      const user = await User.findOne({ id: project.userId });
      return {
        ...project.toObject(),
        id: String(project._id),
        user: { id: user?.id, name: user?.name || "Unknown", image: user?.image || "" },
      };
    }),
  );
  return NextResponse.json({ projects: enrichedProjects });
}
