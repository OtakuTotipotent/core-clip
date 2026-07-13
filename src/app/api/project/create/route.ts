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

// Configure Cloudinary using existing credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize the modern Gemini SDK client
const ai = new GoogleGenAI({});

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

  let projectId: string | undefined;
  try {
    const uploadedImages = [] as string[];
    for (const image of images) {
      const file = image as File;
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const uploadResult = await cloudinary.uploader.upload(
        `data:${file.type};base64,${base64}`,
        { resource_type: "image" },
      );
      uploadedImages.push(uploadResult.secure_url);
    }

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
    projectId = String(project._id);

    // Cast explicitly to File items from form data array entries
    const file1 = images[0] as File;
    const file2 = images[1] as File;

    // Convert both buffers directly to base64 strings
    const image1Base64 = Buffer.from(await file1.arrayBuffer()).toString(
      "base64",
    );
    const image2Base64 = Buffer.from(await file2.arrayBuffer()).toString(
      "base64",
    );

    const promptText = `Combine the product and model into a realistic commercial ad. Aspect ratio should match ${aspectRatio}. ${productDescription}\n${userPrompt}`;

    // Execute the interaction block with the exact multimodal array types expected by the SDK
    const interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-image",
      input: [
        {
          type: "text",
          text: promptText,
        },
        {
          type: "image",
          data: image1Base64,
          mime_type: file1.type, // Strictly snake_case to prevent overload complaints
        },
        {
          type: "image",
          data: image2Base64,
          mime_type: file2.type, // Strictly snake_case to prevent overload complaints
        },
      ],
    });

    const generatedImage = interaction.output_image;
    if (!generatedImage || !generatedImage.data) {
      throw new Error(
        "Failed to receive valid generated image data from Gemini model workflow.",
      );
    }

    // Upload generated output to Cloudinary
    const generatedImageDataUri = `data:${generatedImage.mime_type || "image/png"};base64,${generatedImage.data}`;
    const uploadResult = await cloudinary.uploader.upload(
      generatedImageDataUri,
      { resource_type: "image" },
    );

    // Mark project generation complete and link final url
    await Project.findByIdAndUpdate(projectId, {
      generatedImage: uploadResult.secure_url,
      isGenerating: false,
      error: undefined,
    });

    return NextResponse.json({
      projectId,
      message: "Image generation completed",
    });
  } catch (error) {
    if (projectId) {
      await Project.findByIdAndUpdate(projectId, {
        isGenerating: false,
        error: (error as Error).message,
      });
    }
    await refundCredits(userId, CREDIT_PRICES.image);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 },
    );
  }
}
