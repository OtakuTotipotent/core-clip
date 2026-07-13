import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { deductCredits, refundCredits, CREDIT_PRICES } from "@/lib/credits";

async function generateVideoTask(projectId: string, userId: string) {
  try {
    // TODO: Replace this sleep with your actual 3rd-party Video AI Model SDK call
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Placeholder URL - replace with the result from your AI provider
    const generatedVideoUrl =
      "https://res.cloudinary.com/demo/video/upload/v1743600000/sample.mp4";

    await connectToDatabase();
    await Project.findByIdAndUpdate(projectId, {
      generatedVideo: generatedVideoUrl,
      isGenerating: false,
      error: undefined,
    });
  } catch (error) {
    await connectToDatabase();
    await Project.findByIdAndUpdate(projectId, {
      isGenerating: false,
      error: (error as Error).message,
    });
    await refundCredits(userId, CREDIT_PRICES.video);
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const body = await request.json();
  const { projectId } = body;

  if (!projectId) {
    return NextResponse.json(
      { message: "Project ID is required" },
      { status: 400 },
    );
  }

  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  if (project.isGenerating) {
    return NextResponse.json(
      { message: "Project is already processing." },
      { status: 409 },
    );
  }

  if (!project.generatedImage) {
    return NextResponse.json(
      { message: "Generated image not found. Cannot create video." },
      { status: 400 },
    );
  }

  const deducted = await deductCredits(userId, CREDIT_PRICES.video);
  if (!deducted) {
    return NextResponse.json(
      { message: "Insufficient credits" },
      { status: 402 },
    );
  }

  await Project.findByIdAndUpdate(projectId, {
    isGenerating: true,
    error: undefined,
  });

  // Fire and forget the background task
  void generateVideoTask(projectId, userId);

  return NextResponse.json(
    {
      message: "Video generation started. Please wait.",
      status: "processing",
    },
    { status: 202 },
  );
}
