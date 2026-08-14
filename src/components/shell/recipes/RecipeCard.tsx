// components/RecipeCard.tsx
"use client";

import { memo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SaveToCookbookModal from "@/components/shell/cookbook/SaveToCookbookModal";

type RecipeCardProps = {
  id: string;
  title: string;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  cookTimeMinutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
};

const FALLBACK_IMAGE = "/images/recipe-placeholder.png";

const RecipeCard = ({
  id,
  title,
  imageUrl,
  rating,
  reviewCount,
  cookTimeMinutes,
  difficulty,
}: RecipeCardProps) => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  return (
    <div className="group relative w-60">

      <Link
        href={`/recipe/${id}`}
        className="w-full bg-surface-container-lowest rounded-xl recipe-card-shadow flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      >
        <article className="flex flex-col grow">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsSaveModalOpen(true);
            }}
            aria-label="Save recipe to cookbook"
            className="absolute top-sm left-sm z-10 bg-black/60 flex items-center justify-center backdrop-blur-sm text-white p-1.5 rounded-lg hover:bg-black/80 transition-colors"
          >
            <span className="material-symbols-outlined text-lg leading-none" aria-hidden="true">
              bookmark_add
            </span>
          </button>
          <div className="relative aspect-4/3 overflow-hidden rounded-t-xl">
            <Image
              className="object-cover transition-transform duration-500 "
              src={imageUrl || FALLBACK_IMAGE}
              alt={title}
              fill
              sizes="(max-width: 768px) 50vw, 220px"
            />
            <div className="absolute top-sm right-sm bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center gap-1">
              <span
                className="material-symbols-outlined text-sm text-secondary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden="true"
              >
                star
              </span>
              <span className="text-xs font-semibold">
                {rating.toFixed(1)} ({reviewCount})
              </span>
            </div>
          </div>
          <div className="p-sm flex flex-col grow">
            <h3 className="font-headline-md text-on-surface line-clamp-2 mb-xs min-h-[4rem]">
              {title}
            </h3>
            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-center text-on-surface-variant gap-1">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  schedule
                </span>
                <span className="text-xs font-medium">{cookTimeMinutes} min</span>
              </div>
              <span className="px-3 py-1 bg-primary-fixed text-on-primary-fixed rounded-full text-xs font-semibold">
                {difficulty}
              </span>
            </div>
          </div>
        </article>
      </Link>

      {isSaveModalOpen && (
        <SaveToCookbookModal recipeId={id} onClose={() => setIsSaveModalOpen(false)} />
      )}
    </div>
  );
};

export default memo(RecipeCard);