"use client";

import React from "react";
import Link from "next/link";
import EmptyState from "@/components/shell/profile/EmptyState";
import GridSkeleton from "@/components/shell/skeletons/GridSkeleton";
import RecipeCard from "@/components/shell/recipes/RecipeCard";
import { RecipeDocument } from "@/models/recipe.model";
import mongoose from "mongoose";

const AddRecipeTile = () => (
  <Link
    href="/recipe/new"
    aria-label="Add a new recipe"
    className="w-40 md:w-60 h-65 rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-xs text-on-surface-variant hover:text-primary hover:border-primary hover-lift transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
  >
    <span className="material-symbols-outlined text-[28px]">add</span>
    <span className="text-label-md">Add Recipe</span>
  </Link>
);

const RecipeSection = ({
  recipes,
  loading,
  isOwnProfile,
}: {
  recipes: RecipeDocument[] | mongoose.Types.ObjectId[] | undefined;
  loading: boolean;
  isOwnProfile: boolean;
}) => {
  if (loading) return <GridSkeleton />;
  if (!Array.isArray(recipes) || recipes.length === 0) {
    return (
      <EmptyState
        icon="restaurant"
        title={isOwnProfile ? "No recipes yet" : "No recipes to show"}
        description={
          isOwnProfile ? "Recipes you publish will show up here." : undefined
        }
        actionHref={isOwnProfile ? "/recipe/new" : undefined}
        actionLabel={isOwnProfile ? "Add recipe" : undefined}
      />
    );
  }

  return (
    <div className="flex flex-wrap w-full gap-md">
      {(recipes as RecipeDocument[]).map((recipe : RecipeDocument) => (
          <RecipeCard
          key={recipe?._id?.toString()}
          id={recipe?._id?.toString()}
          title={recipe?.title}
          imageUrl={recipe?.coverImage?.coverImageURL}
          rating={recipe?.ratingAverage}
          reviewCount={recipe?.ratingCount}
          cookTimeMinutes={recipe?.cookTime}
          difficulty={recipe?.difficulty}
          />
        ))}
        {isOwnProfile && <AddRecipeTile />}
    </div>
  );
};

export default RecipeSection;