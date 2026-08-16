// components/Feed/RecipeCardSkeleton.tsx
export function RecipeCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200">
      <div className="aspect-[16/9] w-full animate-pulse bg-neutral-100" />
      <div className="flex items-center gap-3 p-4">
        <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-neutral-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/3 animate-pulse rounded bg-neutral-200" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}