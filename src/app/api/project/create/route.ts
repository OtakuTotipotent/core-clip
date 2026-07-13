import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import {
  ensureUserRecord,
  deductCredits,
  refundCredits,
  CREDIT_PRICES,
} from "@/lib/credits";
import { Project } from "@/models/Project";
import { v2 as cloudinary } from "cloudinary";
import { GoogleGenAI } from "@google/genai";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize the modern Gemini SDK client
const ai = new GoogleGenAI({});

// Detached background task for AI Image Generation
async function generateImageTask(
  projectId: string,
  userId: string,
  promptText: string,
  image1: { base64: string; mimeType: string },
  image2: { base64: string; mimeType: string },
) {
  try {
    // 1. Call Gemini Interactions API
    const interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-image",
      input: [
        {
          type: "text",
          text: promptText,
        },
        {
          type: "image",
          data: image1.base64,
          mime_type: image1.mimeType,
        },
        {
          type: "image",
          data: image2.base64,
          mime_type: image2.mimeType,
        },
      ],
    });

    const generatedImage = interaction.output_image;
    if (!generatedImage || !generatedImage.data) {
      throw new Error(
        "Failed to receive valid generated image data from Gemini model workflow.",
      );
    }

    // 2. Upload generated output to Cloudinary
    const generatedImageDataUri = `data:${generatedImage.mime_type || "image/png"};base64,${generatedImage.data}`;
    const uploadResult = await cloudinary.uploader.upload(
      generatedImageDataUri,
      { resource_type: "image" },
    );

    // 3. Mark project generation complete and link final url
    await connectToDatabase();
    await Project.findByIdAndUpdate(projectId, {
      generatedImage: uploadResult.secure_url,
      isGenerating: false,
      error: undefined,
    });
  } catch (error) {
    await connectToDatabase();
    await Project.findByIdAndUpdate(projectId, {
      isGenerating: false,
      error: (error as Error).message,
    });
    // Refund credits if generation fails
    await refundCredits(userId, CREDIT_PRICES.image);
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const user = await ensureUserRecord(userId);
  if (!user || (user.credits ?? 0) < CREDIT_PRICES.image) {
    return NextResponse.json(
      { message: "Insufficient credits" },
      { status: 402 },
    );
  }

  const formData = await request.formData();
  const images = formData.getAll("images");
  const productName = formData.get("productName")?.toString() || "New Project";
  const productDescription =
    formData.get("productDescription")?.toString() || "";
  const userPrompt = formData.get("userPrompt")?.toString() || "";
  const aspectRatio = formData.get("aspectRatio")?.toString() || "9:16";
  const name = formData.get("name")?.toString() || "New Project";

  if (images.length < 2) {
    return NextResponse.json(
      { message: "Please upload at least 2 images" },
      { status: 400 },
    );
  }

  const deducted = await deductCredits(userId, CREDIT_PRICES.image);
  if (!deducted) {
    return NextResponse.json(
      { message: "Insufficient credits" },
      { status: 402 },
    );
  }

  try {
    // Process input images to Base64 buffers concurrently to save execution time
    const file1 = images[0] as File;
    const file2 = images[1] as File;

    const [buffer1, buffer2] = await Promise.all([
      file1.arrayBuffer(),
      file2.arrayBuffer(),
    ]);

    const base64_1 = Buffer.from(buffer1).toString("base64");
    const base64_2 = Buffer.from(buffer2).toString("base64");

    // Upload user images to Cloudinary concurrently
    const [upload1, upload2] = await Promise.all([
      cloudinary.uploader.upload(`data:${file1.type};base64,${base64_1}`, {
        resource_type: "image",
      }),
      cloudinary.uploader.upload(`data:${file2.type};base64,${base64_2}`, {
        resource_type: "image",
      }),
    ]);

    const uploadedImages = [upload1.secure_url, upload2.secure_url];

    // Create the project in MongoDB tracking generation state
    const project = await Project.create({
      userId,
      name,
      productName,
      productDescription,
      userPrompt,
      aspectRatio,
      uploadedImages,
      isGenerating: true,
    });

    const projectId = String(project._id);
    const promptText = `Combine the product and model into a realistic commercial ad. Aspect ratio should match ${aspectRatio}. ${productDescription}\n${userPrompt}`;

    // Fire and forget the background task
    void generateImageTask(
      projectId,
      userId,
      promptText,
      { base64: base64_1, mimeType: file1.type },
      { base64: base64_2, mimeType: file2.type },
    );

    // Return immediately to unblock the frontend UI
    return NextResponse.json(
      {
        projectId,
        message: "Image generation started",
        status: "processing",
      },
      { status: 202 },
    );
  } catch (error) {
    await refundCredits(userId, CREDIT_PRICES.image);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 },
    );
  }
}
