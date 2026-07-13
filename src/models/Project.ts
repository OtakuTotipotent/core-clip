import mongoose, { Schema } from "mongoose";

const ProjectSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, default: "New Project" },
    productName: { type: String, required: true },
    productDescription: { type: String },
    userPrompt: { type: String },
    aspectRatio: { type: String, enum: ["9:16", "16:9", "1:1"], default: "9:16" },
    targetLength: { type: Number, default: 5 },
    uploadedImages: [{ type: String }],
    generatedImage: { type: String },
    generatedVideo: { type: String },
    isGenerating: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: false, index: true },
    error: { type: String },
  },
  { timestamps: true },
);

export const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
