import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/models/Project";

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  await connectToDatabase();
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  const updated = await Project.findByIdAndUpdate(projectId, { isPublished: !project.isPublished }, { new: true });
  return NextResponse.json({ isPublished: updated?.isPublished, project: { ...updated?.toObject(), id: String(updated?._id) } });
}
