// components/Feed/Feed.tsx
"use client";

import { useEffect, useRef } from "react";
import { useFeed } from "@/hooks/useFeed";
import { FeedRecipeCard } from "@/components/FeedRecipeCard";
import { RecipeCardSkeleton } from "@/components/FeedRecipeCardSkeleton";

export function Feed() {
    const { recipes, isLoading, error, hasMore, initialized, loadMore, retry } =
        useFeed();
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { rootMargin: "400px" } // start fetching before the user hits bottom
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loadMore]);

    const isEmpty =
        initialized && !isLoading && recipes.length === 0 && !error;

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-lg font-medium text-neutral-800">
                    Your feed is empty
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                    Follow people to see the recipes they post here.
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-6">
            <div className="grid gap-6">
                {recipes.map((recipe) => (
                    <FeedRecipeCard key={recipe._id} recipe={recipe} />
                ))}

                {isLoading &&
                    Array.from({ length: recipes.length === 0 ? 3 : 2 }).map((_, i) => (
                        <RecipeCardSkeleton key={`skeleton-${i}`} />
                    ))}
            </div>

            {error && (
                <div className="mt-6 flex flex-col items-center gap-2 text-center">
                    <p className="text-sm text-red-600">{error}</p>
                    <button
                        onClick={retry}
                        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
                    >
                        Retry
                    </button>
                </div>
            )}

            <div ref={sentinelRef} className="h-1" />
        </div>
    );
}