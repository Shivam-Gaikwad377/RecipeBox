"use client"
import React from 'react'
import PrimaryButton from '@/components/PrimaryButton'
import SecondaryButton from '@/components/SecondaryButton'
import { RecipeDocument } from "@/models/recipe.model";
import { useState, useEffect } from "react";
import { updateRecipeSchema, UpdateRecipeInput, UpdateRecipeOutput } from "@/schemas/updateRecipe.schema";
import { usePathname } from "next/navigation";
import ApiResponse from "@/types/ApiResponse";
import axios from "axios";
import Image from 'next/image';
import { UserDocument } from '@/models/user.model';
import RecipeCard from '@/components/shell/recipes/RecipeCard';
import { useForm, useFieldArray, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
const page = () => {
    const [recipe, setRecipe] = useState<RecipeDocument | null>(null);
    const { data: session } = useSession();
    const pathname = usePathname();
    const id = pathname.split("/").pop(); // Extract the recipe ID from the URL
    const [author, setAuthor] = useState<UserDocument | null>(null);
    const [followers, setFollowers] = useState<number>(0);
    const [isEditing, setIsEditing] = useState(false)
    const [moreRecipes, setMoreRecipes] = useState<RecipeDocument[]>([])
    const [isFollowing, setIsFollowing] = useState<boolean>(false)
    const form = useForm<UpdateRecipeInput, unknown, UpdateRecipeOutput>({
        resolver: zodResolver(updateRecipeSchema),
        defaultValues: {
            title: recipe?.title,
            description: recipe?.description,
            coverImage: recipe?.coverImage ?? undefined,
            ingredients: recipe?.ingredients,
            instructions: recipe?.instructions,
            nutritionalInfo: recipe?.nutritionalInfo ?? undefined,
            tags: recipe?.tags,
            prepTime: recipe?.prepTime,
            cookTime: recipe?.cookTime,
            difficulty: recipe?.difficulty,
        },
    });
    const { register, handleSubmit, control, formState: { errors } } = form;
    const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
        control,
        name: "ingredients",
    });
    const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
        control,
        name: "instructions",
    });
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

    useEffect(() => {
        const fetchMoreRecipes = async () => {
            try {
                if (author) {
                    const response = await axios.get<ApiResponse>(`/api/users/${author?._id}/recipes`);
                    setMoreRecipes(response?.data?.data?.recipes);
                }
            } catch (error) {
                console.error("Error fetching more recipes:", error);
            }
        }
        fetchMoreRecipes();
    }, [author])
    useEffect(() => {
        const fetchFollowStatus = async () => {
            if (!author?._id || !session?.user?._id) return;
            try {
                const response = await axios.get<ApiResponse>(`/api/users/${author?._id}/follow/${session?.user?._id}`);
                setIsFollowing(response.data.data.isFollowing);
            } catch (error) {
                console.error(error, "Failed to fetch follow status.");
            }
        }
        fetchFollowStatus();
    }, [author?._id, session?.user?._id]);
    const handleFollow = async () => {
        if (!session?.user?._id) {
            toast.error("You must be logged in to follow users.");
            return;
        }
        const response = await axios.post<ApiResponse>(`/api/users/${author?._id}/follow`);
        setIsFollowing(true);
    };
    const handleUnfollow = async () => {
        if (!session?.user?._id) {
            toast.error("You must be logged in to unfollow users.");
            return;
        }
        const response = await axios.delete<ApiResponse>(`/api/users/${author?._id}/follow`);
        setIsFollowing(false);
    }
    useEffect(() => {
        if (!recipe) return;
        form.reset({
            title: recipe.title,
            description: recipe.description,
            coverImage: recipe.coverImage ?? undefined,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            nutritionalInfo: recipe.nutritionalInfo ?? undefined,
            tags: recipe.tags,
            prepTime: recipe.prepTime,
            cookTime: recipe.cookTime,
            difficulty: recipe.difficulty,
        });
    }, [recipe, form]);
    const onSubmit = async (data: UpdateRecipeInput) => {
        try {
            const response = await axios.patch<ApiResponse>(`/api/recipe/${id}`, data);
            if (response.status === 200) {
                setRecipe(response.data.data);
                toast.success("Recipe updated successfully!");
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error updating recipe:", error);
            toast.error("Failed to update recipe. Please try again.");
        }
    };
    const onInvalid = (errors: FieldErrors<UpdateRecipeInput>) => {
        console.error("Validation failed:", errors)
    }

    return (
        <main
            className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop pt-6 md:pt-12 pb-xl"  >
            <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
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
                                {isEditing ? (<input
                                    className="form-input-number px-2 w-16"
                                    type="number"
                                    placeholder="0"
                                    {...register("prepTime", { valueAsNumber: true })}
                                />) : (<span className="">{recipe?.prepTime} min prep</span>)}
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className="material-symbols-outlined text-[18px]"
                                    data-icon="local_fire_department">local_fire_department</span>
                                {isEditing ? (<input
                                    className="form-input-number px-2 w-16"
                                    type="number"
                                    placeholder="0"
                                    {...register("cookTime", { valueAsNumber: true })}
                                />) : (<span className="">{recipe?.cookTime} min cook</span>)}
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className="material-symbols-outlined text-[18px]"
                                    data-icon="bar_chart">bar_chart</span>
                                {isEditing ? (<select
                                    id="difficulty"
                                    className="form-input-text"
                                    {...register("difficulty")}
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>) : (<span className="">{recipe?.difficulty}</span>)}
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
                                {session?.user?.id === author?._id && (
                                    isFollowing ? (
                                        <SecondaryButton
                                            fontSize="small"
                                            icon="person_remove"
                                            label="Unfollow"
                                            onClick={handleUnfollow} />
                                    ) : (
                                        <PrimaryButton
                                            fontSize="small"
                                            icon="person_add"
                                            label="Follow"
                                            onClick={handleFollow} />
                                    )
                                )}
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
                            {session?.user?._id === author?._id && (
                                isEditing ? (<>
                                    <PrimaryButton
                                        fontSize="medium"
                                        icon="save"
                                        label="Save Changes"
                                        type="submit"
                                    />
                                    <SecondaryButton
                                        fontSize="medium"
                                        icon="cancel"
                                        label="Cancel"
                                        onClick={() => setIsEditing(false)}
                                    />
                                </>) :
                                    (<SecondaryButton
                                        fontSize="medium"
                                        icon="edit"
                                        label="Edit Recipe"
                                        onClick={() => setIsEditing(true)}
                                    />)
                            )}



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
                                        {ingredientFields?.map((ing, index) => (
                                            // index as key is fine here — your schema uses array
                                            // position as the source of truth, no subdocument _ids
                                            <tr key={index} className="border-b border-outline-variant last:border-0">
                                                {isEditing ? (
                                                    <>
                                                        <td className="py-3 pr-4"><input
                                                            className="form-input-text grow"
                                                            placeholder="Ingredient (e.g. Flour)"
                                                            defaultValue={ing.name}
                                                            {...register(`ingredients.${index}.name`)}
                                                        />
                                                        </td>
                                                        <td className="py-3 pr-4 text-on-surface-variant">
                                                            <input
                                                                className="form-input-text w-24"
                                                                placeholder="Qty"
                                                                type="number"
                                                                step="any"
                                                                defaultValue={ing?.quantity as number | undefined}
                                                                {...register(`ingredients.${index}.quantity`, { valueAsNumber: true })}
                                                            />
                                                        </td>
                                                        <td className="py-3 text-on-surface-variant">
                                                            <select className="form-input-text w-32 pr-4" {...register(`ingredients.${index}.unit`)}>
                                                                <option value="cups">Cups</option>
                                                                <option value="tbsp">Tbsp</option>
                                                                <option value="g">Grams</option>
                                                            </select>
                                                        </td>
                                                        <td className="py-3 text-on-surface-variant">
                                                            <button
                                                                type="button"
                                                                className="text-error-container hover:text-error"
                                                                onClick={() => removeIngredient(index)}
                                                            >
                                                                <span className="material-symbols-outlined">delete</span>
                                                            </button>
                                                        </td>
                                                    </>
                                                )
                                                    : (
                                                        <>
                                                            <td className="py-3 pr-4">{ing.name}</td>
                                                            <td className="py-3 pr-4 text-on-surface-variant">
                                                                {ing.quantity as number | undefined ?? ''}
                                                            </td>
                                                            <td className="py-3 text-on-surface-variant">{ing.unit ?? ''}</td>
                                                        </>
                                                    )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {isEditing && (
                                    <PrimaryButton
                                        fontSize="small"
                                        icon="add"
                                        label="Add Ingredient"
                                        onClick={() => appendIngredient({ name: "", quantity: undefined, unit: "" })}
                                    />
                                )}
                            </div>
                        </div>

                    </section>

                    <section className="md:col-span-7">
                        <h2 className="text-headline-sm font-headline-sm text-on-surface mb-6">
                            Instructions
                        </h2>
                        <ol className="space-y-6 w-full">
                            {instructionFields.map((step, index) => (
                                isEditing ? (
                                    <li key={index} className="flex  items-center  gap-4">
                                        <p className="font-headline-sm text-primary-container">{index + 1}.</p>
                                        <p className="text-body-md text-on-surface ">
                                            <textarea
                                                className="form-input-text font-body-md text-body-md w-full! resize-none"
                                                placeholder="Explain this step..."
                                                rows={2}
                                                defaultValue={step?.text}
                                                {...register(`instructions.${index}.text`)}
                                            />
                                        </p>
                                    </li>
                                ) : (

                                    <li key={index} className="flex  items-center  gap-4">
                                        <p className="font-headline-sm text-primary-container">{index + 1}.</p>
                                        <p className="text-body-md text-on-surface ">
                                            {step?.text}
                                        </p>
                                    </li>)))}
                        </ol>
                        {isEditing && (<PrimaryButton
                            fontSize='small'
                            onClick={() => appendInstruction({ order: instructionFields.length + 1, text: '' })}
                            icon='add'
                            label='Add Instruction'
                        />)}
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
                                {isEditing ? (
                                    <input
                                        className="form-input-number px-2 w-16"
                                        type="number"
                                        placeholder="0"
                                        {...register("nutritionalInfo.calories", { valueAsNumber: true })}
                                    />
                                ) : (
                                    <p className="text-headline-md font-headline-md text-on-surface">
                                        {recipe?.nutritionalInfo?.calories ?? '—'}kcal
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-label-sm text-on-surface-variant mb-1">Protein</p>
                                {isEditing ? (
                                    <input
                                        className="form-input-number px-2 w-16"
                                        type="number"
                                        placeholder="0"
                                        {...register("nutritionalInfo.protein", { valueAsNumber: true })}
                                    />
                                ) : (
                                    <p className="text-headline-md font-headline-md text-on-surface">
                                        {recipe?.nutritionalInfo?.protein ?? '—'}g
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-label-sm text-on-surface-variant mb-1">Carbs</p>
                                {isEditing ? (
                                    <input
                                        className="form-input-number px-2 w-16"
                                        type="number"
                                        placeholder="0"
                                        {...register("nutritionalInfo.carbs", { valueAsNumber: true })}
                                    />
                                ) : (
                                    <p className="text-headline-md font-headline-md text-on-surface">
                                        {recipe?.nutritionalInfo?.carbs ?? '—'}g
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-label-sm text-on-surface-variant mb-1">Fat</p>
                                {isEditing ? (
                                    <input
                                        className="form-input-number px-2 w-16"
                                        type="number"
                                        placeholder="0"
                                        {...register("nutritionalInfo.fat", { valueAsNumber: true })}
                                    />
                                ) : (
                                    <p className="text-headline-md font-headline-md text-on-surface">
                                        {recipe?.nutritionalInfo?.fat ?? '—'}g
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>
                </section>
            </form>

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
                    More from {author?.name}
                </h2>
                <div
                    className="flex overflow-x-auto overflow-auto h-auto gap-6 pb-4 scrollbar-hide w-auto -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0"
                >

                    {
                        moreRecipes.map((recipe) => (
                            <RecipeCard key={recipe?._id.toString()} title={recipe.title} rating={4.5} imageUrl={recipe?.coverImage?.coverImageURL} reviewCount={120} cookTime={`${recipe?.cookTime} min`} difficulty={recipe?.difficulty} />
                        ))
                    }
                </div>
            </section>
        </main >
    )
}

export default page