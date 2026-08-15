import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const plannerItemSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe", required: true },
    date: { type: Date, required: true, index: true },
    mealSlot: {
      type: String,
      enum: ["Breakfast", "Lunch", "Dinner"],
      required: true
    }
  },
  { timestamps: true }
);

plannerItemSchema.index({ user: 1, date: 1, mealSlot: 1 }, { unique: true });

export type PlannerItemDocument = InferSchemaType<typeof plannerItemSchema>;

export const PlannerItem: Model<PlannerItemDocument> =
  mongoose.models.PlannerItem || mongoose.model("PlannerItem", plannerItemSchema);