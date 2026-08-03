import React from 'react'

type RecipeCardProps1 = {
    title: string;
    imageUrl: string | undefined;
    rating: number;
    reviewCount: number;
    cookTime: string;
    difficulty: "Easy" | "Medium" | "Hard";
};
const RecipeCard = ({ title, imageUrl, rating, reviewCount, cookTime, difficulty }: RecipeCardProps1) => {
    return (
        <article className="group bg-surface-container-lowest rounded-xl recipe-card-shadow w-50  flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative h-50 aspect-4/3 ">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" data-alt="A vibrant and appetizing roasted veggie bowl with sweet potatoes, kale, chickpeas, and a drizzle of tahini sauce. The lighting is soft and natural, emphasizing the rich textures and organic colors of the vegetables. The dish is presented on a minimalist ceramic plate against a warm parchment-toned wooden table, creating an airy and modern gourmet magazine aesthetic." src={imageUrl} />
                <div className="absolute top-sm right-sm bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center space-x-1">
                    <span className="material-symbols-outlined text-[14px] text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-xs font-semibold">{rating} ({reviewCount})</span>
                </div>
            </div>
            <div className="p-sm flex flex-col grow">
                <h3 className="font-headline-md text-on-surface line-clamp-2 mb-xs min-h-[4rem]">{title}</h3>
                <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center text-on-surface-variant space-x-1">
                        <span className="material-symbols-outlined text-sm" data-icon="schedule">schedule</span>
                        <span className="text-xs font-medium">{cookTime}</span>
                    </div>
                    <span className="px-3 py-1 bg-primary-fixed text-on-primary-fixed rounded-full text-xs font-semibold">{difficulty}</span>
                </div>
            </div>
        </article>
    )
}

export default RecipeCard