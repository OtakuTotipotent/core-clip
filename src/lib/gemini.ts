import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function generateImageWithGemini(params: {
  prompt: string;
  image1: string;
  image2: string;
  aspectRatio?: string;
}) {
  if (!ai) {
    throw new Error("Google AI API key is not configured");
  }

  const model = "gemini-2.0-flash-preview-image-generation";
  const response = await ai.models.generateContent({
    model,
    contents: [
      { inlineData: { mimeType: "image/png", data: params.image1 } },
      { inlineData: { mimeType: "image/png", data: params.image2 } },
      { text: params.prompt },
    ],
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: params.aspectRatio || "9:16",
        imageSize: "1K",
      },
    },
  });

  const parts = response?.candidates?.[0]?.content?.parts ?? [];
  const inlineImage = parts.find((part) => part.inlineData?.data);
  if (!inlineImage?.inlineData?.data) {
    throw new Error("The image generator returned no image data.");
  }

  return `data:image/png;base64,${inlineImage.inlineData.data}`;
}
