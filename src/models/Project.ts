import mongoose, { Schema } from "mongoose";

const ProjectSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, default: "New Project" },
    productName: { type: String, required: true },
    productDescription: { type: String, default: "" },
    userPrompt: { type: String, default: "" },
    aspectRatio: {
      type: String,
      enum: ["9:16", "16:9", "1:1"],
      default: "9:16",
    },
    uploadedImages: [{ type: String }],
    generatedImageA: { type: String, default: "" },
    generatedImageB: { type: String, default: "" },
    isGenerating: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: false, index: true },
    error: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Project =
  mongoose.models.Project || mongoose.model("Project", ProjectSchema);
