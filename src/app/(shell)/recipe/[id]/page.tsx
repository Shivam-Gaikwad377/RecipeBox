"use client"
import React from 'react'
import PrimaryButton from '@/components/PrimaryButton'
import SecondaryButton from '@/components/SecondaryButton'
import { RecipeDocument } from "@/models/recipe.model";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import ApiResponse from "@/types/ApiResponse";
import axios from "axios";
import Image from 'next/image';
import { UserDocument } from '@/models/user.model';

const page = () => {
    const [recipe, setRecipe] = useState<RecipeDocument | null>(null);
    const pathname = usePathname();
    const id = pathname.split("/").pop(); // Extract the recipe ID from the URL
    const [author, setAuthor] = useState<UserDocument | null>(null);
    const [followers, setFollowers] = useState<number>(0);
    useEffect(() => {
        const fetchRecipe = async () => {
            try {

                const response = await axios.get<ApiResponse>(`/api/recipe/${id}`);
                setRecipe(response?.data?.data);
                setAuthor(response?.data?.data?.author);
            } catch (error) {
                console.error("Error fetching recipe:", error);
            }
        };

        fetchRecipe();
    }, []);
    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                if (recipe && author) {
                    const response = await axios.get<ApiResponse>(`/api/users/${author?._id}/followers`);
                    setFollowers(response?.data?.data?.count);
                }
            } catch (error) {
                console.error("Error fetching followers:", error);
            }
        }
        fetchFollowers();
    }, [recipe])

    console.log("Recipe data:", recipe); // Log the recipe data to the console
    return (
        <main
            className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop pt-6 md:pt-12 pb-xl"  >
            <article
                className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden mb-12" >
                <div className="w-full h-64 md:h-120 bg-surface-variant relative">
                    <img
                        className="w-full h-full object-cover"
                        data-alt="A high-fidelity, professional food photography shot of a whole charred lemon and herb roast chicken on a rustic wooden board, garnished with fresh rosemary and roasted lemon halves, soft natural lighting, gourmet kitchen setting, 8k resolution, appetizing and premium."
                        src={recipe?.coverImage?.coverImageURL}
                    />
                </div>
                <div className="p-6 md:p-8">
                    <h1
                        className="text-display-lg-mobile md:text-display-lg font-display-lg text-on-surface mb-4" >
                        {recipe?.title}
                    </h1>
                    <div
                        className="flex flex-wrap items-center gap-6 text-on-surface-variant text-label-sm font-label-sm mb-8"  >
                        <div className="flex items-center gap-2">
                            <span
                                className="material-symbols-outlined text-[18px]"
                                data-icon="schedule">schedule</span>
                            <span className="">{recipe?.prepTime} min prep</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className="material-symbols-outlined text-[18px]"
                                data-icon="local_fire_department">local_fire_department</span>
                            <span className="">{recipe?.cookTime} min cook</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className="material-symbols-outlined text-[18px]"
                                data-icon="bar_chart">bar_chart</span>
                            <span className="">{recipe?.difficulty}</span>
                        </div>


                    </div>

                    <div
                        className="flex flex-col md:flex-row md:items-center justify-between py-6 border-t border-outline-variant/50 gap-6" >
                        <div className="flex items-center gap-4">
                            <Image
                                alt="user avatar"
                                className="w-12 h-12 rounded-full"
                                src={author?.avatar?.avatarUrl ?? 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                                width={48}
                                height={48}
                            />
                            <div>
                                <p className="font-body-md font-semibold text-on-surface">
                                    {author?.name}
                                </p>
                                <p className="text-label-sm font-label-sm text-on-surface-variant">
                                    {followers} followers
                                </p>
                            </div>
                            <button
                                className="ml-4 px-4 py-1.5 border border-outline rounded-full text-label-sm font-label-sm font-semibold hover:bg-surface-variant transition-colors">
                                Follow
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className="material-symbols-outlined text-primary-container"
                                data-icon="star"
                                data-weight="fill"
                                style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                            <span className="font-semibold text-body-md">4.6</span>
                            <span className="text-on-surface-variant text-label-sm">(214 ratings)</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-6">
                        <PrimaryButton
                            fontSize='medium'
                            icon="bookmark_add"
                            label="Save to Cookbook"
                        />
                        <SecondaryButton
                            fontSize='medium'
                            icon="calendar_add_on"
                            label="Add to meal plan"
                        />



                    </div>
                </div>
            </article>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-xl">

                <section className="md:col-span-5">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-headline-sm font-headline-sm text-on-surface">
                                Ingredients
                            </h2>
                            <div className="flex items-center gap-3 bg-surface-container rounded-full px-2 py-1">
                                <span
                                    className="material-symbols-outlined text-on-surface-variant"
                                    data-icon="scale">restaurant</span>
                                <span className="text-label-sm font-label-sm text-on-surface-variant">
                                    {recipe?.servings} servings
                                </span>
                            </div>
                        </div>

                        {/* overflow-x-auto: table can clip on narrow viewports otherwise */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-body-md text-on-surface">
                                <caption className="sr-only">List of recipe ingredients with quantity and unit</caption>
                                <thead>
                                    <tr className="text-left text-label-md text-on-surface-variant border-b border-outline-variant">
                                        <th scope="col" className="py-2 pr-4 font-medium">Ingredient</th>
                                        <th scope="col" className="py-2 pr-4 font-medium">Quantity</th>
                                        <th scope="col" className="py-2 font-medium">Unit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recipe?.ingredients.map((ing, index) => (
                                        // index as key is fine here — your schema uses array
                                        // position as the source of truth, no subdocument _ids
                                        <tr key={index} className="border-b border-outline-variant last:border-0">
                                            <td className="py-3 pr-4">{ing.name}</td>
                                            <td className="py-3 pr-4 text-on-surface-variant">
                                                {ing.quantity ?? ing.note ?? '—'}
                                            </td>
                                            <td className="py-3 text-on-surface-variant">{ing.unit ?? ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </section>

                <section className="md:col-span-7">
                    <h2 className="text-headline-sm font-headline-sm text-on-surface mb-6">
                        Instructions
                    </h2>
                    <ol className="space-y-6">
                        {recipe?.instructions.map((step, index) => (
                            <li key={index} className="flex  items-center  gap-4">
                                <p className="font-headline-sm text-primary-container">{step?.order}.</p>
                                <p className="text-body-md text-on-surface ">
                                    {step?.text}
                                </p>
                            </li>))}
                    </ol>
                </section>
            </div>

            <section
                className="mb-xl relative rounded-xl border border-outline-variant/30 overflow-hidden bg-surface-container-lowest p-8"
            >
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <h2 className="text-headline-sm font-headline-sm text-on-surface">
                        Nutritional info
                    </h2>
                </div>
                <div className="relative">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div>
                            <p className="text-label-sm text-on-surface-variant mb-1">Calories</p>
                            <p className="text-headline-md font-headline-md text-on-surface">
                                {recipe?.nutritionalInfo?.calories ?? '—'}kcal
                            </p>
                        </div>
                        <div>
                            <p className="text-label-sm text-on-surface-variant mb-1">Protein</p>
                            <p className="text-headline-md font-headline-md text-on-surface">
                                {recipe?.nutritionalInfo?.protein ?? '—'}g
                            </p>
                        </div>
                        <div>
                            <p className="text-label-sm text-on-surface-variant mb-1">Carbs</p>
                            <p className="text-headline-md font-headline-md text-on-surface">
                                {recipe?.nutritionalInfo?.carbs ?? '—'}g
                            </p>
                        </div>
                        <div>
                            <p className="text-label-sm text-on-surface-variant mb-1">Fat</p>
                            <p className="text-headline-md font-headline-md text-on-surface">
                                {recipe?.nutritionalInfo?.fat ?? '—'}g
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            <section className="mb-xl border-t border-outline-variant/50 pt-12">
                <h2 className="text-headline-sm font-headline-sm text-on-surface mb-8">
                    Ratings and comments
                </h2>
                <div className="flex flex-col md:flex-row gap-12 mb-12">

                    <div className="shrink-0 text-center md:text-left">
                        <div className="text-display-lg font-display-lg text-on-surface">
                            4.6
                        </div>
                        <div className="text-label-sm text-on-surface-variant mt-2">
                            214 ratings
                        </div>
                    </div>

                    <div className="grow space-y-2 max-w-md">
                        <div className="flex items-center gap-4">
                            <span className="text-label-sm text-on-surface-variant w-4">5</span>
                            <div
                                className="grow h-2 bg-surface-variant rounded-full overflow-hidden"
                            >
                                <div className="h-full bg-primary" style={{ width: "70%" }}></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-label-sm text-on-surface-variant w-4">4</span>
                            <div
                                className="grow h-2 bg-surface-variant rounded-full overflow-hidden"
                            >
                                <div className="h-full bg-primary" style={{ width: "20%" }}></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-label-sm text-on-surface-variant w-4">3</span>
                            <div
                                className="grow h-2 bg-surface-variant rounded-full overflow-hidden"
                            >
                                <div className="h-full bg-primary" style={{ width: "5%" }}></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-label-sm text-on-surface-variant w-4">2</span>
                            <div
                                className="grow h-2 bg-surface-variant rounded-full overflow-hidden"
                            ></div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-label-sm text-on-surface-variant w-4">1</span>
                            <div
                                className="grow h-2 bg-surface-variant rounded-full overflow-hidden"></div>
                        </div>
                    </div>
                </div>

                <div
                    className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30"
                >
                    <div className="flex items-start gap-4">
                        <div
                            className="w-10 h-10 rounded-full bg-surface-variant shrink-0"
                        ></div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-label-sm font-semibold text-on-surface">Amit K</span>
                                <span className="text-label-sm text-on-surface-variant">• 2 days ago</span>
                            </div>
                            <p className="text-body-md text-on-surface">
                                Turned out perfectly, added extra thyme.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-headline-sm font-headline-sm text-on-surface mb-6">
                    More from Rhea
                </h2>
                <div
                    className="flex overflow-x-auto gap-6 pb-4 scroll-hide -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0"
                >

                    <div
                        className="shrink-0 w-64 rounded-xl border border-outline-variant/30 overflow-hidden bg-surface-container-lowest group cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="h-40 bg-surface-variant relative">
                            <img
                                className="w-full h-full object-cover"
                                data-alt="A close up shot of garlic butter shrimp in a cast iron skillet, garnished with fresh parsley and a slice of lemon. Warm lighting, rustic background, appetizing food photography."
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdgxA28fg4-6ZCIDblm9AU--nPBFetxF2s2iB5OxVzln3OuSYsQj70YTJKn9eokKNzVfsy6NaXjE9HvQgegg2AJclBPx0SJDRHnwlLSSPPeavu8wKeDckpH1kI7pFAMCXB9Mil5HwnOgaYtjSyPej989ZgpZGD-9pSecCj0kI554iLbiurBeoqYpNsx6y15tg6WgbcVB6SIZ1SJp7Dl76azCcIgTMiymlYABtUIQdjMuffZ4Wr0oPi"
                            />
                        </div>
                        <div className="p-4">
                            <h3
                                className="font-label-md text-on-surface group-hover:text-primary transition-colors"
                            >
                                Garlic butter shrimp
                            </h3>
                        </div>
                    </div>

                    <div
                        className="shrink-0 w-64 rounded-xl border border-outline-variant/30 overflow-hidden bg-surface-container-lowest group cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="h-40 bg-surface-variant relative">
                            <img
                                className="w-full h-full object-cover"
                                data-alt="A beautifully plated miso glazed salmon fillet on a bed of steamed white rice, sprinkled with sesame seeds and green onions. Clean, minimalist styling, bright lighting."
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEwOFx3lxbG4mAVjWh-VMHbe7D8AeEvo2TzO1rwZC1rzelGo46kKgxjb-KuJ6QFXlWxNgY0ixly5w-DtBpSRbtlOWQ2huuGl1vwI9ow497QrxKp4EuZPwxsvgTDxKd0tjUrPzEPhn7hOwY02ylT7PR3ucVxg2_zFm6kg9fj02Go9vOSwXuV8H11RBhKLK3LdoMWQIzspMGK1idzutI367f_Utqdo8E9-YYxdTBLhg6gS7-aKWDE2Rr"
                            />
                        </div>
                        <div className="p-4">
                            <h3
                                className="font-label-md text-on-surface group-hover:text-primary transition-colors"
                            >
                                Miso glazed salmon
                            </h3>
                        </div>
                    </div>

                    <div
                        className="shrink-0 w-64 rounded-xl border border-outline-variant/30 overflow-hidden bg-surface-container-lowest group cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="h-40 bg-surface-variant relative">
                            <img
                                className="w-full h-full object-cover"
                                data-alt="A vibrant roasted vegetable bowl featuring sweet potatoes, broccoli, chickpeas, and a creamy tahini dressing drizzle. Served in a shallow ceramic bowl on a wooden table. Healthy, fresh, bright food photography."
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA91Zh70WvzOX2U9fPyQIxoXl7lTCQ3qLlH7zaH_iQNp0bOEhiIMQT4wLR6HVREy2GefXUpNB5Z7Ett1pJULP074eN1__NPpHe35uD_M0zwTeQ24B_pYEodCECZaSrz-5C8cDKrICogUPn_TaquTKDwJ-bGKX_Hop1s6_RSl1pDHFXZlHA98wBeW6dVZINVnBMGqG0V2DpmljG1T4LPzE3zH4FhWhZGP5D4RHwIDD4Jcf4cXvpLrmB6"
                            />
                        </div>
                        <div className="p-4">
                            <h3
                                className="font-label-md text-on-surface group-hover:text-primary transition-colors"
                            >
                                Roasted veg bowl
                            </h3>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default page