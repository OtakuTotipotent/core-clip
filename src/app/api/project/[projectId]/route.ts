import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/models/Project";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  await connectToDatabase();
  await Project.deleteOne({ _id: projectId, userId });
  return NextResponse.json({ message: "Project deleted" });
}
