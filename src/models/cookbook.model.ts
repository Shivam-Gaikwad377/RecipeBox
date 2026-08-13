import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const cookbookSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    recipes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
    coverImage: {
        coverImageURL: { type: String, required: true },
        coverImageFileId: { type: String, required: true },
    },
  },
  { timestamps: true }
);
  

export type CookbookDocument = InferSchemaType<typeof cookbookSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Cookbook: Model<CookbookDocument> =
  mongoose.models.Cookbook || mongoose.model("Cookbook", cookbookSchema);