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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function callFreeEngineWithFallback(
  promptText: string,
  width: number,
  height: number,
  preferredModel: string,
  fallbackModels: string[] = ["flux-realism", "flux", "turbo"],
): Promise<string> {
  const sanitizedPrompt = promptText.replace(/https?:\/\/[^\s]+/g, "").trim();
  const encodedPrompt = encodeURIComponent(sanitizedPrompt);

  // Combine all engine candidates into an ordered array
  const modelsToTry = [
    preferredModel,
    ...fallbackModels.filter((m) => m !== preferredModel),
  ];

  for (const currentModel of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      // 45-second extended timeout to avoid premature "Aborted" errors during heavy API loads
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      const randomSeed = Math.floor(Math.random() * 999999);

      try {
        console.log(
          `Pipeline hitting Engine: ${currentModel} (Attempt ${attempt}/2)`,
        );

        const response = await fetch(
          `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${randomSeed}&model=${currentModel}&enhance=false`,
          {
            signal: controller.signal,
            headers: {
              Accept: "image/webp,image/*",
              "User-Agent": `CoreClipEngine/2.0-${currentModel}`,
            },
          },
        );

        clearTimeout(timeoutId);

        if (response.status === 429) {
          console.warn(
            `Engine ${currentModel} rate limited (429). Retrying with backoff...`,
          );
          clearTimeout(timeoutId);
          await delay(3000 * attempt);
          continue;
        }

        if (!response.ok) {
          throw new Error(`Engine status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength < 1000) {
          throw new Error("Invalid or empty image byte payload returned");
        }

        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const uploadResult = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${base64}`,
          { resource_type: "image", folder: "coreclip_ads" },
        );

        return uploadResult.secure_url;
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn(
          `Engine ${currentModel} failed on attempt ${attempt}:`,
          (error as Error).message,
        );

        // Wait before trying the next model variant
        await delay(2000);
      }
    }
    console.log(
      `Switching from failed engine ${currentModel} to next fallback model option...`,
    );
  }
  throw new Error("All backup rendering channels exhausted.");
}

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

    const contextualBase = `High-end commercial ad for [${productName}: ${productDesc}]. Context: ${userPrompt}. Focus composition cleanly around item details from source asset: ${productImageUrl}.`;

    const promptA = `Professional studio product photograph, sharp clean product presentation display stand placement, dynamic lighting, dramatic soft shadows, high-end 8k commercial resolution. ${contextualBase}`;
    const promptB = `Vibrant luxury lifestyle editorial look, natural light beams bouncing, beautiful deep depth of field rendering, clean advertising agency copy space alignment. ${contextualBase}`;
    const promptC = `Futuristic technological catalog presentation layout, minimalist premium floating block design platform, clean ambient soft colored lighting details. ${contextualBase}`;

    const updatePayload: any = { isGenerating: false };

    // Run calls sequentially with a staggered delay to prevent rate-limiting on the server IP
    try {
      updatePayload.generatedImageA = await callFreeEngineWithFallback(
        promptA,
        width,
        height,
        "flux-realism",
      );
    } catch (err) {
      console.error("Concept A failed completely:", (err as Error).message);
    }

    await delay(2500); // Wait for the server queue to clear before making the next call

    try {
      updatePayload.generatedImageB = await callFreeEngineWithFallback(
        promptB,
        width,
        height,
        "flux",
      );
    } catch (err) {
      console.error("Concept B failed completely:", (err as Error).message);
    }

    await delay(2500);

    try {
      updatePayload.generatedImageC = await callFreeEngineWithFallback(
        promptC,
        width,
        height,
        "turbo",
      );
    } catch (err) {
      console.error("Concept C failed completely:", (err as Error).message);
    }

    // Verify at least one image was successfully generated so the user isn't left with empty results
    if (
      !updatePayload.generatedImageA &&
      !updatePayload.generatedImageB &&
      !updatePayload.generatedImageC
    ) {
      throw new Error("All three image generation channels failed.");
    }

    await connectToDatabase();
    await Project.findByIdAndUpdate(projectId, updatePayload);
    console.log("Triple-variant generation successfully saved to workspace!");
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
