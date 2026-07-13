import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, index: true },
    name: { type: String, default: "Clerk User" },
    image: { type: String, default: "" },
    credits: { type: Number, default: 20, min: 0 },
  },
  { timestamps: true },
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
