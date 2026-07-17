import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/models/Project";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const projects = await Project.find({ userId }).sort({ createdAt: -1 });
  return NextResponse.json({
    projects: projects.map((project) => ({
      ...project.toObject(),
      id: String(project._id),
    })),
  });
}
