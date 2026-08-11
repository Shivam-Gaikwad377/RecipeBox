import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { UserDocument } from "./user.model";
const commentSchema = new Schema(
  {
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, maxlength: 600 }
  },
  { timestamps: true }
);

commentSchema.index({ recipe: 1, author: 1 });

export type CommentDocument = InferSchemaType<typeof commentSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type PopulatedCommentDocument = CommentDocument & {
  author: UserDocument;
};

export const Comment: Model<CommentDocument> =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);