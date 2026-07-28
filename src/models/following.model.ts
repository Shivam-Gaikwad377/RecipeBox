import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const followSchema = new Schema(
  {
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Uniqueness constraint + doubles as the isFollowing existence check
followSchema.index({ follower: 1, following: 1 }, { unique: true });
// Followers list, newest first: find({ following }).sort({ createdAt: -1 })
followSchema.index({ following: 1, createdAt: -1 });
// Following list, newest first: find({ follower }).sort({ createdAt: -1 })
followSchema.index({ follower: 1, createdAt: -1 });


export type FollowDocument = InferSchemaType<typeof followSchema>;
export const Follow: Model<FollowDocument> =
  mongoose.models.Follow || mongoose.model("Follow", followSchema);