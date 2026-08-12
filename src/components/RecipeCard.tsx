import React from 'react'
export type RecipeCardProps = {
  title: string;
  category: string;
  rating: number;
    prepTime: string;
    difficulty: string;
    src: string;
}
const RecipeCard = ({ title, category, rating, prepTime, difficulty, src }: RecipeCardProps) => {
  return (
    <article
          className="bg-surface-container-lowest rounded-xl overflow-hidden card-shadow hover-lift cursor-pointer flex flex-col h-full"
        >
          <div className="relative h-64 w-full">
            <img
              className="w-full h-full object-cover"
              data-alt="A beautiful, overhead shot of an artisan sourdough bread loaf resting on a rustic wooden board. The bread has a perfectly scored crust, dusted lightly with flour. Soft, warm natural sunlight streams across the scene, highlighting the texture of the crust. The background is a clean, minimalist cream marble surface, embodying a modern epicurean aesthetic."
              src={src}
            />
            <button
              className="absolute top-sm right-sm w-10 h-10 bg-surface-container-lowest/80 backdrop-blur-sm rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">favorite</span>
            </button>
          </div>
          <div className="p-md flex flex-col grow">
            <div className="flex justify-between items-start mb-sm">
              <span
                className="font-label-sm text-label-sm text-primary uppercase tracking-wider"
                >{category}</span>
              <div className="flex items-center gap-xs text-on-surface-variant">
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                  >star</span>
                <span className="font-label-sm text-label-sm">{rating}</span>
              </div>
            </div>
            <h3
              className="font-headline-sm text-headline-sm text-on-background mb-sm line-clamp-2"
            >
              {title}
            </h3>
            <div
              className="mt-auto flex items-center gap-md text-on-surface-variant font-label-sm text-label-sm"
            >
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px]"
                  >schedule</span>
                <span>{prepTime}</span>
              </div>
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">speed</span>
                <span>{difficulty}</span>
              </div>
            </div>
          </div>
        </article>
  )
}

export default RecipeCard