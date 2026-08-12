import React from 'react'
import EmptyState from '@/components/shell/profile/EmptyState'
import GridSkeleton from '@/components/shell/skeletons/GridSkeleton'
import RecipeCard from '@/components/shell/recipes/RecipeCard'
import { RecipeDocument } from '@/models/recipe.model'
const RecipeSection = ({
    recipes,
    loading,
    isOwnProfile,
}: {
    recipes: RecipeDocument[] | null;
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
                actionHref={isOwnProfile ? "/recipes/new" : undefined}
                actionLabel={isOwnProfile ? "Add recipe" : undefined}
            />
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 w-full lg:grid-cols-4 gap-gutter">
            {recipes?.map((recipe) => (
                <RecipeCard key={recipe?._id.toString()} title={recipe?.title} imageUrl={recipe?.coverImage?.coverImageURL} rating={recipe?.ratingAverage} reviewCount={recipe?.ratingCount} cookTime={recipe?.cookTime} difficulty={recipe?.difficulty} />
            ))}
        </div>
    );
}

export default RecipeSection




