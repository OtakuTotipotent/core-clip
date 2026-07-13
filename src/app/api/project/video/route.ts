import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { deductCredits, refundCredits, CREDIT_PRICES } from "@/lib/credits";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const body = await request.json();
  const { projectId } = body;

  if (!projectId) {
    return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
  }

  const deducted = await deductCredits(userId, CREDIT_PRICES.video);
  if (!deducted) {
    return NextResponse.json({ message: "Insufficient credits" }, { status: 402 });
  }

  try {
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      await refundCredits(userId, CREDIT_PRICES.video);
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    if (!project.generatedImage) {
      await refundCredits(userId, CREDIT_PRICES.video);
      return NextResponse.json({ message: "Generated image not found" }, { status: 400 });
    }

    await Project.findByIdAndUpdate(projectId, { isGenerating: true, error: undefined });

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const demoVideoUrl = "https://res.cloudinary.com/demo/video/upload/v1743600000/sample.mp4";
      await Project.findByIdAndUpdate(projectId, { generatedVideo: demoVideoUrl, isGenerating: false, error: undefined });
      return NextResponse.json({ message: "Video generation completed", videoUrl: demoVideoUrl });
    } catch (error) {
      await refundCredits(userId, CREDIT_PRICES.video);
      await Project.findByIdAndUpdate(projectId, { isGenerating: false, error: (error as Error).message });
      return NextResponse.json({ message: (error as Error).message }, { status: 500 });
    }
  } catch (error) {
    await refundCredits(userId, CREDIT_PRICES.video);
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
