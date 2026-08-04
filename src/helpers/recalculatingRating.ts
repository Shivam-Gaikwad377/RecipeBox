import mongoose from "mongoose";
import { Rating } from "@/models/rating.model";
import { Recipe } from "@/models/recipe.model";

export async function recalculateRecipeRating(recipeId: string) {
  const [summary] = await Rating.aggregate([
    { $match: { recipe: new mongoose.Types.ObjectId(recipeId) } },
    { $group: { _id: null, ratingAverage: { $avg: "$value" }, ratingCount: { $sum: 1 } } },
  ]);

  const ratingAverage = summary?.ratingAverage ?? 0;
  const ratingCount = summary?.ratingCount ?? 0;

  await Recipe.findByIdAndUpdate(recipeId, { ratingAverage, ratingCount });
  return { ratingAverage, ratingCount };
}