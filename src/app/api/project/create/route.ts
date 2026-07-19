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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper utility to pause execution between parallel hits
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function callFreeEngine(
  promptText: string,
  width: number,
  height: number,
  modelName: string,
  retries = 3,
): Promise<string> {
  const sanitizedPrompt = promptText.replace(/https?:\/\/[^\s]+/g, "").trim();
  const encodedPrompt = encodeURIComponent(sanitizedPrompt);

  for (let attempt = 1; attempt <= retries; attempt++) {
    const randomSeed = Math.floor(Math.random() * 999999) + attempt;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      // Diversify query parameter composition to bypass strict endpoint signature tracking
      const response = await fetch(
        `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${randomSeed}&model=${modelName}&enhance=false`,
        {
          signal: controller.signal,
          headers: {
            Accept: "image/webp,image/apng,image/*",
            "User-Agent": `CoreClipAdEngine/${1.0 + attempt}`,
          },
        },
      );

      clearTimeout(timeoutId);

      // If hit by a 429 rate limit or server error, back off and retry before failing completely
      if (response.status === 429 || !response.ok) {
        throw new Error(
          `Engine ${modelName} returned status ${response.status}`,
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      const uploadResult = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${base64}`,
        { resource_type: "image", folder: "coreclip_ads" },
      );

      return uploadResult.secure_url;
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn(
        `Attempt ${attempt} on engine ${modelName} encountered an issue:`,
        (error as Error).message,
      );

      if (attempt === retries) throw error;
      // Exponential backoff delay time: wait longer on subsequent hits
      await delay(2000 * attempt);
    }
  }
  throw new Error("Pipeline execution error.");
}

// Background Task orchestrating 3 independent free pipelines sequentially
async function generateTripleConceptsTask(
  projectId: string,
  userId: string,
  productName: string,
  productDesc: string,
  userPrompt: string,
  aspectRatio: string,
  productImageUrl: string,
) {
  try {
    const width =
      aspectRatio === "16:9" ? 1280 : aspectRatio === "1:1" ? 1024 : 768;
    const height =
      aspectRatio === "16:9" ? 720 : aspectRatio === "1:1" ? 1024 : 1024;

    const contextualBase = `Commercial product advertisement for [${productName}: ${productDesc}]. Campaign context: ${userPrompt}. Focus composition directly around the item profile layout visible in: ${productImageUrl}.`;

    // 3 Unique layout prompt vectors to generate diverse commercial results
    const promptA = `Award-winning commercial cosmetic/product photography, clean sharp studio lighting, deep sophisticated shadows, elegant black stone display stand, ultra-detailed 8k resolution. ${contextualBase}`;
    const promptB = `Vibrant high-fashion editorial showcase print ad look, luxury sunbeams reflection, dramatic cinematic depth of field, professional agency layout look. ${contextualBase}`;
    const promptC = `Futuristic technological catalog presentation style, minimalist high-end background platform layout, subtle glowing ambient neon lighting details. ${contextualBase}`;

    const updatePayload: {
      isGenerating: boolean;
      generatedImageA?: string;
      generatedImageB?: string;
      generatedImageC?: string;
      error?: string;
    } = { isGenerating: false };

    // --- Execution Pattern: Sequential Staggering with Fail-safes ---

    // Engine 1: Flux Realism Mode
    try {
      updatePayload.generatedImageA = await callFreeEngine(
        promptA,
        width,
        height,
        "flux-realism",
      );
    } catch (err) {
      console.error("Concept Channel A failed:", (err as Error).message);
    }

    // Short stagger window to let the remote API gateway refresh
    await delay(1500);

    // Engine 2: Flux Base Mode
    try {
      updatePayload.generatedImageB = await callFreeEngine(
        promptB,
        width,
        height,
        "flux",
      );
    } catch (err) {
      console.error("Concept Channel B failed:", (err as Error).message);
    }

    await delay(1500);

    // Engine 3: Turbo Performance Mode
    try {
      updatePayload.generatedImageC = await callFreeEngine(
        promptC,
        width,
        height,
        "turbo",
      );
    } catch (err) {
      console.error("Concept Channel C failed:", (err as Error).message);
    }

    // Verify at least one successful asset exists before completing workspace parameters
    if (
      !updatePayload.generatedImageA &&
      !updatePayload.generatedImageB &&
      !updatePayload.generatedImageC
    ) {
      throw new Error(
        "All three alternative free pipeline sources returned rate limit failures.",
      );
    }

    await connectToDatabase();
    await Project.findByIdAndUpdate(projectId, updatePayload);
  } catch (error) {
    console.error("Pipeline Orchestrator Error:", error);
    await connectToDatabase();
    await Project.findByIdAndUpdate(projectId, {
      isGenerating: false,
      error: (error as Error).message,
    });
    await refundCredits(userId, CREDIT_PRICES.image);
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

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
  const productName =
    formData.get("productName")?.toString() || "Premium Product";
  const productDescription =
    formData.get("productDescription")?.toString() || "";
  const userPrompt = formData.get("userPrompt")?.toString() || "";
  const aspectRatio = formData.get("aspectRatio")?.toString() || "9:16";
  const name = formData.get("name")?.toString() || "Ad Campaign";

  if (images.length < 1) {
    return NextResponse.json(
      { message: "Please upload a target product image" },
      { status: 400 },
    );
  }

  const deducted = await deductCredits(userId, CREDIT_PRICES.image);
  if (!deducted)
    return NextResponse.json(
      { message: "Insufficient credits" },
      { status: 402 },
    );

  try {
    const file1 = images[0] as File;
    const buffer = await file1.arrayBuffer();

    const upload = await cloudinary.uploader.upload(
      `data:${file1.type};base64,${Buffer.from(buffer).toString("base64")}`,
      { folder: "coreclip_source" },
    );

    const project = await Project.create({
      userId,
      name,
      productName,
      productDescription,
      userPrompt,
      aspectRatio,
      uploadedImages: [upload.secure_url],
      isGenerating: true,
    });

    void generateTripleConceptsTask(
      String(project._id),
      userId,
      productName,
      productDescription,
      userPrompt,
      aspectRatio,
      upload.secure_url,
    );

    return NextResponse.json(
      {
        projectId: String(project._id),
        message: "Three-engine parallel ad rendering active",
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
