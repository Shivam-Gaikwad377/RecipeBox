import { CookbookDocument } from "@/models/cookbook.model";
import GridSkeleton from "../skeletons/GridSkeleton";
import EmptyState from "../profile/EmptyState";

import React from 'react'

const CookbookSection = ({
  cookbooks,
  loading,
  isOwnProfile,
}: {
  cookbooks: CookbookDocument[] | undefined;
  loading: boolean;
  isOwnProfile: boolean;
}) => {
    if (loading) return <GridSkeleton />;
    
  if (cookbooks?.length === 0 && !loading) {
    return (
      <EmptyState
        icon="menu_book"
        title={isOwnProfile ? "No cookbooks yet" : "No cookbooks to show"}
        description={
          isOwnProfile
            ? "Group your saved recipes into cookbooks."
            : undefined
        }
        actionHref={isOwnProfile ? "/cookbooks/new" : undefined}
        actionLabel={isOwnProfile ? "New cookbook" : undefined}
      />
    );
  }
  return (
     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-gutter">
    {cookbooks?.map((cookbook) => (
      <a
        key={cookbook?._id?.toString()}
        href={`/cookbook/${cookbook._id}`}
        className="rounded-xl overflow-hidden bg-surface-container-lowest paper-shadow hover-lift transition-transform"
      >
        <div className="aspect-square   bg-surface-dim">
            {cookbook.coverImage?.coverImageURL ? (
                <img
                    src={cookbook.coverImage.coverImageURL}
                    alt={cookbook.title}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[48px]">menu_book</span>
                </div>
            )}
        </div>
        <div className="p-sm">
        </div>
        <div className="p-sm">
          <p className="text-label-md text-on-surface truncate">
            {cookbook.title}
          </p>
          <p className="text-label-sm text-on-surface-variant mt-xs">
            {cookbook?.recipes?.length} {cookbook.recipes?.length === 1 ? "recipe" : "recipes"}
          </p>
        </div>
      </a>
    ))}
    
  </div>
  )
}

export default CookbookSection
