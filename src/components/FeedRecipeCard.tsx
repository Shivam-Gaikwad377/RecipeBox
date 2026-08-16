// components/Feed/FeedRecipeCard.tsx
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { FeedRecipe } from "@/hooks/useFeed";

export function FeedRecipeCard({ recipe }: { recipe: FeedRecipe }) {
  return (
    <Link
      href={`/recipes/${recipe._id}`}
      className="group block overflow-hidden rounded-xl border border-neutral-200 transition hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full bg-neutral-100">
        {recipe.coverImage && (
          <Image
            src={recipe.coverImage}
            alt={recipe.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        )}
      </div>

      <div className="flex items-center gap-3 p-4">
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-neutral-200">
          {recipe.author.avatar && (
            <Image
              src={recipe.author.avatar}
              alt={recipe.author.name}
              fill
              className="object-cover"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-neutral-900">{recipe.title}</p>
          <p className="truncate text-sm text-neutral-500">{recipe.author.name}</p>
        </div>

        {recipe.ratingCount > 0 && (
          <div className="flex shrink-0 items-center gap-1 text-sm text-neutral-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {recipe.avgRating.toFixed(1)}
          </div>
        )}
      </div>
    </Link>
  );
}