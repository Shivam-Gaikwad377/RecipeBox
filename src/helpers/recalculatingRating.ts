import mongoose from "mongoose";
import { Rating } from "@/models/rating.model";
import { Recipe } from "@/models/recipe.model";

export async function recalculateRecipeRating(recipeId: string) {
  const [summary] = await Rating.aggregate([
    { $match: { recipeId: new mongoose.Types.ObjectId(recipeId) } },
    { $group: { _id: null, avgRating: { $avg: "$value" }, ratingCount: { $sum: 1 } } },
  ]);

  const avgRating = summary?.avgRating ?? 0;
  const ratingCount = summary?.ratingCount ?? 0;

  await Recipe.findByIdAndUpdate(recipeId, { avgRating, ratingCount });
  return { avgRating, ratingCount };
}