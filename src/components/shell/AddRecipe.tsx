"use client"

import React, { useState, useEffect } from "react"
import { useForm, useFieldArray, type SubmitHandler, FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import PrimaryButton from "@/components/PrimaryButton"
import SecondaryButton from "@/components/SecondaryButton"
import { recipeSchema, type Recipe } from "@/schemas/recipe.schema"
import axios from "axios"
import { toast } from "sonner"
const TITLE_MAX_LENGTH = 150

// ⚠️ placeholder shapes — align these to your actual Ingredient/Instruction
// types in recipe.schema.ts before wiring the selects below


const AddRecipe = () => {
    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<Recipe>({
        resolver: zodResolver(recipeSchema),
        defaultValues: {
            title: "",
            description: "",
            ingredients: [],
            instructions: [],
            prepTime: 0,
            cookTime: 0,
            servings: 4,
            tags: [],
            nutritionalInfo: { calories: 0, protein: 0, fat: 0, carbs: 0 },
            difficulty: "Easy",
        },
    })

    const {
        fields: ingredientFields,
        append: appendIngredient,
        remove: removeIngredient,
    } = useFieldArray<Recipe>({ control, name: "ingredients" })

    const {
        fields: instructionFields,
        append: appendInstruction,
        remove: removeInstruction,
    } = useFieldArray<Recipe>({ control, name: "instructions" })

    const title = watch("title") ?? ""
    const servings = watch("servings") ?? 1
    const tags = watch("tags") ?? []
    const coverImageFiles = watch("image")

    const [tagDraft, setTagDraft] = useState("")
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    // object URL cleanup — without this you leak a blob URL on every file swap

    const addTag = () => {
        const value = tagDraft.trim()
        if (!value || tags.includes(value)) return
        setValue("tags", [...tags, value], { shouldValidate: true })
        setTagDraft("")
    }

    const removeTag = (tag: string) => {
        setValue(
            "tags",
            tags.filter((t) => t !== tag),
            { shouldValidate: true }
        )
    }

    const onSubmit: SubmitHandler<Recipe> = async (data: Recipe) => {
        try {
            const response = await axios.post("/api/recipe", data)
            if (response.status === 200) {
                toast.success("Recipe added successfully!")
            }

        } catch (error: any) {
            toast.error(`Failed to add recipe: ${error.message}`)
        }
    }
    const onInvalid = (errors: FieldErrors<Recipe>) => {
        console.error("Validation failed:", errors)
    }
    return (
        <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
            <main className="max-w-7xl mx-auto px-margin-desktop py-md">
                <div className="mb-lg">
                    <h1 className="font-display-lg text-display-lg text-on-surface">Add Recipe</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-gutter">
                    <div className="w-full lg:w-7/12 flex flex-col gap-lg">

                        <section className="recipe-card p-md">
                            <div className="mb-6">
                                <div className="flex justify-between items-baseline mb-2">
                                    <label className="form-label" htmlFor="title">Recipe Title</label>
                                    <span
                                        className={`font-label-sm text-label-sm ${title.length > TITLE_MAX_LENGTH ? "text-error" : "text-on-surface-variant"
                                            }`}
                                    >
                                        {title.length}/{TITLE_MAX_LENGTH}
                                    </span>
                                </div>
                                <input
                                    id="title"
                                    className="form-input-text"
                                    placeholder="e.g. Grandma's Apple Pie"
                                    {...register("title")}
                                />
                                {errors.title && (
                                    <p className="mt-2 font-label-sm text-label-sm text-error flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">error</span>
                                        {errors.title.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="form-label" htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    className="form-input-text font-body-md text-body-md resize-none"
                                    placeholder="Share the story behind your recipe..."
                                    rows={4}
                                    {...register("description")}
                                />
                                {errors.description && (
                                    <p className="mt-2 font-label-sm text-label-sm text-error">{errors.description.message}</p>
                                )}
                            </div>
                        </section>

                        <section className="recipe-card p-md">
                            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-6">Ingredients</h2>
                            <div className="flex flex-col gap-sm mb-6">
                                {ingredientFields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="flex items-center gap-sm bg-surface-container-low p-2 rounded-lg group hover:bg-surface-container transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-outline-variant group-hover:text-tertiary cursor-move">
                                            drag_indicator
                                        </span>
                                        <input
                                            className="form-input-text grow"
                                            placeholder="Ingredient (e.g. Flour)"
                                            {...register(`ingredients.${index}.name`)}
                                        />
                                        {errors.ingredients?.[index]?.name && (
                                            <p className="mt-2 font-label-sm text-label-sm text-error">
                                                {errors.ingredients[index]?.name?.message}
                                            </p>
                                        )}
                                        <input
                                            className="form-input-text w-24"
                                            placeholder="Qty"
                                            type="number"
                                            step="any"
                                            {...register(`ingredients.${index}.quantity`, { valueAsNumber: true })}
                                        />
                                        {errors.ingredients?.[index]?.quantity && (
                                            <p className="mt-2 font-label-sm text-label-sm text-error">
                                                {errors.ingredients[index]?.quantity?.message}
                                            </p>
                                        )}
                                        <select className="form-input-text w-32" {...register(`ingredients.${index}.unit`)}>
                                            <option value="cups">Cups</option>
                                            <option value="tbsp">Tbsp</option>
                                            <option value="g">Grams</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => removeIngredient(index)}
                                            className="p-2 text-outline-variant hover:text-error transition-colors rounded-full hover:bg-surface-bright"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => appendIngredient({ name: "", quantity: 0, unit: "cups" })}
                                className="w-full py-3 border-2 border-dashed border-primary-fixed-dim text-primary rounded-lg font-label-md text-label-md hover:bg-surface-bright transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">add</span> Add Ingredient
                            </button>
                        </section>

                        <section className="recipe-card p-md">
                            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-6">Instructions</h2>
                            <div className="flex flex-col gap-md mb-6">
                                {instructionFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-sm group">
                                        <div className="flex flex-col items-center pt-2 gap-1">
                                            <span className="material-symbols-outlined text-outline-variant cursor-move">drag_indicator</span>
                                            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-label-md">
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div className="grow">
                                            <textarea
                                                className="form-input-text font-body-md text-body-md resize-none"
                                                placeholder="Explain this step..."
                                                rows={3}
                                                {...register(`instructions.${index}.text`)}
                                            />
                                        </div>
                                        {errors.instructions?.[index]?.text && (
                                            <p className="mt-2 font-label-sm text-label-sm text-error">
                                                {errors.instructions[index]?.text?.message}
                                            </p>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeInstruction(index)}
                                            className="p-2 text-outline-variant hover:text-error transition-colors rounded-full h-fit mt-8 hover:bg-surface-bright opacity-0 group-hover:opacity-100"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => appendInstruction({ order: instructionFields.length + 1, text: "" })}
                                className="w-full py-3 border-2 border-dashed border-primary-fixed-dim text-primary rounded-lg font-label-md text-label-md hover:bg-surface-bright transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">add</span> Add Step
                            </button>
                        </section>
                    </div>

                    <div className="w-full lg:w-5/12 flex flex-col gap-lg">
                        <div className="sticky top-32 flex flex-col gap-lg">

                            <section className="recipe-card overflow-hidden">
                                <label
                                    htmlFor="coverImage"
                                    className="aspect-video bg-surface-container-low border-2 border-dashed border-outline-variant m-4 rounded-lg flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer group overflow-hidden"
                                    style={previewUrl ? { backgroundImage: `url(${previewUrl})`, backgroundSize: "cover" } : undefined}
                                >
                                    {/* {!previewUrl && (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-surface-bright flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-primary">add_a_photo</span>
                                            </div>
                                            <span className="font-label-md text-label-md">Upload Cover Image</span>
                                            <span className="font-label-sm text-label-sm text-outline mt-1">16:9 ratio recommended</span>
                                        </>
                                    )} */}
                                </label>
                                {/* <input id="coverImage" type="file" accept="image/*" className="hidden" {...register("image")} /> */}
                            </section>

                            <section className="recipe-card p-md">
                                <h3 className="font-label-md text-label-md text-on-surface mb-4">Recipe Details</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-surface-container-low p-3 rounded-lg">
                                        <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Prep Time</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                className="form-input-text py-1 px-2 w-16"
                                                type="number"
                                                {...register("prepTime", { valueAsNumber: true })}
                                            />
                                            <span className="font-body-md text-body-md">min</span>
                                            {errors.prepTime && (
                                                <p className="mt-2 font-label-sm text-label-sm text-error">
                                                    {errors.prepTime.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-surface-container-low p-3 rounded-lg">
                                        <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Cook Time</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                className="form-input-text py-1 px-2 w-16"
                                                type="number"
                                                {...register("cookTime", { valueAsNumber: true })}
                                            />
                                            <span className="font-body-md text-body-md">min</span>
                                            {errors.cookTime && (
                                                <p className="mt-2 font-label-sm text-label-sm text-error">
                                                    {errors.cookTime.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-surface-container-low p-3 rounded-lg">
                                        <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1" htmlFor="difficulty">
                                            Difficulty
                                        </label>
                                        <select
                                            id="difficulty"
                                            className="form-input-text"
                                            {...register("difficulty")}
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                        {errors.difficulty && (
                                            <p className="mt-2 font-label-sm text-label-sm text-error">
                                                {errors.difficulty.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="bg-surface-container-low p-3 rounded-lg col-span-2">
                                        <label className="font-label-sm text-label-sm text-on-surface-variant block mb-2">Servings</label>
                                        <div className="flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => setValue("servings", Math.max(1, servings - 1), { shouldValidate: true })}
                                                className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:border-primary text-primary transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">remove</span>
                                            </button>
                                            <span className="font-headline-sm text-headline-sm">{servings}</span>
                                            <button
                                                type="button"
                                                onClick={() => setValue("servings", servings + 1, { shouldValidate: true })}
                                                className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:border-primary text-primary transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">add</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="recipe-card p-md">
                                <h3 className="font-label-md text-label-md text-on-surface mb-4">Tags</h3>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        className="form-input-text grow"
                                        placeholder="Add tags (e.g. Vegan, Dessert)"
                                        value={tagDraft}
                                        onChange={(e) => setTagDraft(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault()
                                                addTag()
                                            }
                                        }}
                                    />
                                    <SecondaryButton
                                        onClick={addTag}
                                        label="Add"
                                        icon=""
                                        fontSize="small"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            onClick={() => removeTag(tag)}
                                            className="px-3 py-1 bg-surface-container rounded-full font-label-sm text-label-sm text-on-surface flex items-center gap-1 cursor-pointer hover:bg-outline-variant transition-colors"
                                        >
                                            {tag}
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </span>

                                    ))}
                                </div>
                            </section>

                            <section className="recipe-card p-md relative overflow-hidden">
                                <div className="bg-surface-container-low p-4">
                                    <h3 className="font-label-md text-on-surface mb-4">Nutritional Info</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between border-b items-center border-outline-variant pb-1">
                                            <span>Calories</span>
                                            <input
                                                className="form-input-text w-16 py-2!"
                                                type="number"
                                                {...register("nutritionalInfo.calories", { valueAsNumber: true })}
                                            />
                                        </div>
                                        <div className="flex justify-between border-b items-center border-outline-variant pb-1">
                                            <span>Protein</span>
                                            <input
                                                className="form-input-text w-16 py-2!"
                                                type="number"
                                                {...register("nutritionalInfo.protein", { valueAsNumber: true })}
                                            />
                                        </div><div className="flex justify-between border-b items-center border-outline-variant pb-1">
                                            <span>Fats</span>
                                            <input
                                                className="form-input-text w-16 py-2!"
                                                type="number"
                                                {...register("nutritionalInfo.fat", { valueAsNumber: true })}
                                            />
                                        </div>
                                        <div className="flex justify-between border-b items-center border-outline-variant pb-1">
                                            <span>Carbs</span>
                                            <input
                                                className="form-input-text w-16 py-2!"
                                                type="number"
                                                {...register("nutritionalInfo.carbs", { valueAsNumber: true })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="flex w-full justify-center items-center gap-4 mt-4">
                                <SecondaryButton label="Cancel" icon="" onClick={() => { }} fontSize="medium" />
                                <PrimaryButton
                                    label={isSubmitting ? "Saving..." : "Save Recipe"}
                                    icon=""
                                    fontSize="medium"
                                    type="submit"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </form>
    )
}

export default AddRecipe