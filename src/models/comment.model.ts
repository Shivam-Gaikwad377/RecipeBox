import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const commentSchema = new Schema(
  {
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, maxlength: 600 }
  },
  { timestamps: true }
);

commentSchema.index({ recipe: 1, author: 1 }, { unique: true });

export type CommentDocument = InferSchemaType<typeof commentSchema>;

export const Comment: Model<CommentDocument> =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);