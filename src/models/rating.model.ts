import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ratingSchema = new Schema(
  {
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    value: { type: Number, required: true, enum: [1, 2, 3, 4, 5] }, // Rating value between 1 and 5
  },
  { timestamps: true }
);

ratingSchema.index({ recipe: 1, user: 1 }, { unique: true });

export type RatingDocument = InferSchemaType<typeof ratingSchema>;

export const Rating: Model<RatingDocument> =
  mongoose.models.Rating || mongoose.model("Rating", ratingSchema);