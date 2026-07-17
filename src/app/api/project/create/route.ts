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

// --- Keyless AI Image Generator with Retries ---
async function generateAdConcept(
  promptText: string,
  width = 1024,
  height = 1024,
  retries = 3, // Add retry parameter
): Promise<string> {
  const sanitizedPrompt = promptText.replace(/https?:\/\/[^\s]+/g, "").trim();
  const encodedPrompt = encodeURIComponent(sanitizedPrompt);
  const randomSeed = Math.floor(Math.random() * 100000);

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(
        `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${randomSeed}`,
        { signal: controller.signal },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      const uploadResult = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${base64}`,
        {
          resource_type: "image",
          folder: "coreclip_ads",
        },
      );

      return uploadResult.secure_url;
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn(`Attempt ${attempt} failed for ad concept. Error:`, error);

      if (attempt === retries) {
        throw new Error(
          "Image generation engine failed after maximum retries.",
        );
      }

      // Wait for 2 seconds before retrying to let the server breathe
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error("Unexpected generation failure.");
}

// --- Detached Background Task Orchestrator ---
async function generateDualConceptsTask(
  projectId: string,
  userId: string,
  productName: string,
  productDesc: string,
  userPrompt: string,
  aspectRatio: string,
) {
  try {
    const width =
      aspectRatio === "16:9" ? 1280 : aspectRatio === "1:1" ? 1024 : 768;
    const height =
      aspectRatio === "16:9" ? 720 : aspectRatio === "1:1" ? 1024 : 1365;

    // Notice we are NOT passing the raw image URLs into the text prompt anymore.
    const baseContext = `Product: ${productName}. ${productDesc}. ${userPrompt}.`;

    const promptA = `Professional advertising photography. High-end studio lighting, dramatic shadows, sharp focus, 8k resolution, commercial magazine ad style. ${baseContext} Include stylish typography layout space.`;
    const promptB = `Cinematic lifestyle photography. Natural lighting, candid, award-winning commercial campaign, depth of field, highly detailed fashion editorial style. ${baseContext}`;

    const [resultA, resultB] = await Promise.allSettled([
      generateAdConcept(promptA, width, height),
      generateAdConcept(promptB, width, height),
    ]);

    const updatePayload: {
      isGenerating: boolean;
      generatedImageA?: string;
      generatedImageB?: string;
    } = { isGenerating: false };

    if (resultA.status === "fulfilled")
      updatePayload.generatedImageA = resultA.value;
    else console.error("Concept A failed:", resultA.reason);

    if (resultB.status === "fulfilled")
      updatePayload.generatedImageB = resultB.value;
    else console.error("Concept B failed:", resultB.reason);

    if (resultA.status === "rejected" && resultB.status === "rejected") {
      throw new Error(
        "Both AI generation engines failed to produce an ad concept.",
      );
    }

    await connectToDatabase();
    await Project.findByIdAndUpdate(projectId, updatePayload);
  } catch (error) {
    console.error("Generation Pipeline Error:", error);
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
  const productName = formData.get("productName")?.toString() || "New Product";
  const productDescription =
    formData.get("productDescription")?.toString() || "";
  const userPrompt = formData.get("userPrompt")?.toString() || "";
  const aspectRatio = formData.get("aspectRatio")?.toString() || "9:16";
  const name = formData.get("name")?.toString() || "Ad Campaign";

  if (images.length < 2) {
    return NextResponse.json(
      { message: "Please upload at least 2 images" },
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
    const file2 = images[1] as File;

    const [buffer1, buffer2] = await Promise.all([
      file1.arrayBuffer(),
      file2.arrayBuffer(),
    ]);

    const base64_1 = Buffer.from(buffer1).toString("base64");
    const base64_2 = Buffer.from(buffer2).toString("base64");

    const [upload1, upload2] = await Promise.all([
      cloudinary.uploader.upload(`data:${file1.type};base64,${base64_1}`, {
        resource_type: "image",
      }),
      cloudinary.uploader.upload(`data:${file2.type};base64,${base64_2}`, {
        resource_type: "image",
      }),
    ]);

    const project = await Project.create({
      userId,
      name,
      productName,
      productDescription,
      userPrompt,
      aspectRatio,
      uploadedImages: [upload1.secure_url, upload2.secure_url],
      isGenerating: true,
    });

    const projectId = String(project._id);

    // Fire task without injecting the URLs directly into the text propmt
    void generateDualConceptsTask(
      projectId,
      userId,
      productName,
      productDescription,
      userPrompt,
      aspectRatio,
    );

    return NextResponse.json(
      {
        projectId,
        message: "Dual-engine ad generation started",
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
