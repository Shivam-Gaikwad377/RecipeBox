import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { required } from "zod/mini";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      sparse: true,
    },
    passwordHash: {
       type: String, 
       required: true,
      },
    avatarUrl: { 
      type: String,  
    },
    bio: { 
      type: String, 
      default: "" 
    },
      isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    pendingEmail: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    ExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // Default to 10 minutes from now
    },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model("User", userSchema);
