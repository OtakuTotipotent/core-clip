import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/models/Project";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  await connectToDatabase();

  // Verify ownership of the project before changing visibility options
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  // Toggle state inversion
  project.isPublished = !project.isPublished;
  await project.save();

  return NextResponse.json({
    message: project.isPublished
      ? "Published to community"
      : "Hidden from community",
    isPublished: project.isPublished,
  });
}
