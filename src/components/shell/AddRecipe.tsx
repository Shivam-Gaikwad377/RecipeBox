"use client"
import React from 'react'
import PrimaryButton from "@/components/PrimaryButton"
import SecondaryButton from "@/components/SecondaryButton"
const AddRecipe = () => {
    return (
        <main className="max-w-7xl mx-auto px-margin-desktop py-md">

            <div className="mb-lg">

                <h1 className="font-display-lg text-display-lg text-on-surface">
                    Add Recipe
                </h1>
            </div>
            <div className="flex flex-col lg:flex-row gap-gutter">

                <div className="w-full lg:w-7/12 flex flex-col gap-lg">

                    <section className="recipe-card p-md">
                        <div className="mb-6">
                            <div className="flex justify-between items-baseline mb-2">
                                <label className="form-label"
                                >Recipe Title</label>
                                <span className="font-label-sm text-label-sm text-error"
                                >11/150</span>
                            </div>
                            <input
                                className="form-input-text"
                                placeholder="e.g. Grandma's Apple Pie"
                                type="text"
                                value="Chocolate"
                            />
                            <p
                                className="mt-2 font-label-sm text-label-sm text-error flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[14px]">error</span>
                                Recipe title is required
                            </p>
                        </div>
                        <div>
                            <label
                                className="form-label"
                            >Description</label>
                            <textarea
                                className="form-input-text font-body-md text-body-md resize-none"
                                placeholder="Share the story behind your recipe..."
                                rows={4}
                            ></textarea>
                        </div>
                    </section>

                    <section className="recipe-card p-md">
                        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-6">
                            Ingredients
                        </h2>
                        <div className="flex flex-col gap-sm mb-6">

                            <div
                                className="flex items-center gap-sm bg-surface-container-low p-2 rounded-lg group hover:bg-surface-container transition-colors cursor-move"
                            >
                                <span
                                    className="material-symbols-outlined text-outline-variant group-hover:text-tertiary"
                                >drag_indicator</span>
                                <input
                                    className="form-input-text grow"
                                    placeholder="Ingredient (e.g. Flour)"
                                    type="text"
                                />
                                <input className="form-input-text w-24" placeholder="Qty" type="text" />
                                <select className="form-input-text w-32">
                                    <option>Cups</option>
                                    <option>Tbsp</option>
                                    <option>Grams</option>
                                </select>
                                <button
                                    className="p-2 text-outline-variant hover:text-error transition-colors rounded-full hover:bg-surface-bright"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>

                            <div
                                className="flex items-center gap-sm bg-surface-container-low p-2 rounded-lg group hover:bg-surface-container transition-colors cursor-move"
                            >
                                <span
                                    className="material-symbols-outlined text-outline-variant group-hover:text-tertiary"
                                >drag_indicator</span>
                                <input
                                    className="form-input-text grow"
                                    placeholder="Ingredient"
                                    type="text"
                                />
                                <input className="form-input-text w-24" placeholder="Qty" type="text" />
                                <select className="form-input-text w-32">
                                    <option>Unit</option>
                                </select>
                                <button
                                    className="p-2 text-outline-variant hover:text-error transition-colors rounded-full hover:bg-surface-bright"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                        <button
                            className="w-full py-3 border-2 border-dashed border-primary-fixed-dim text-primary rounded-lg font-label-md text-label-md hover:bg-surface-bright transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span> Add Ingredient
                        </button>
                    </section>

                    <section className="recipe-card p-md">
                        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-6">
                            Instructions
                        </h2>
                        <div className="flex flex-col gap-md mb-6">

                            <div className="flex gap-sm group cursor-move">
                                <div className="flex flex-col items-center pt-2">

                                    <div
                                        className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-label-md"
                                    >
                                        1
                                    </div>
                                </div>
                                <div className="grow">
                                    <textarea
                                        className="form-input-text font-body-md text-body-md resize-none"
                                        placeholder="Explain this step..."
                                        rows={3}
                                    ></textarea>
                                </div>
                                <button
                                    className="p-2 text-outline-variant hover:text-error transition-colors rounded-full h-fit mt-8 hover:bg-surface-bright opacity-0 group-hover:opacity-100"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                        <button
                            className="w-full py-3 border-2 border-dashed border-primary-fixed-dim text-primary rounded-lg font-label-md text-label-md hover:bg-surface-bright transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span> Add Step
                        </button>
                    </section>
                </div>

                <div className="w-full lg:w-5/12 flex flex-col gap-lg">
                    <div className="sticky top-32 flex flex-col gap-lg">

                        <section className="recipe-card overflow-hidden">
                            <div
                                className="aspect-video bg-surface-container-low border-2 border-dashed border-outline-variant m-4 rounded-lg flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer group"
                            >
                                <div
                                    className="w-12 h-12 rounded-full bg-surface-bright flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
                                >
                                    <span className="material-symbols-outlined text-primary"
                                    >add_a_photo</span>
                                </div>
                                <span className="font-label-md text-label-md"
                                >Upload Cover Image</span>
                                <span className="font-label-sm text-label-sm text-outline mt-1"
                                >16:9 ratio recommended</span>
                            </div>
                        </section>

                        <section className="recipe-card p-md">
                            <h3 className="font-label-md text-label-md text-on-surface mb-4">
                                Recipe Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">

                                <div className="bg-surface-container-low p-3 rounded-lg">
                                    <label
                                        className="font-label-sm text-label-sm text-on-surface-variant block mb-1"
                                    >Prep Time</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            className="form-input-text py-1 px-2 w-16"
                                            placeholder="0"
                                            type="number"
                                        />
                                        <span className="font-body-md text-body-md">min</span>
                                    </div>
                                </div>

                                <div className="bg-surface-container-low p-3 rounded-lg">
                                    <label
                                        className="font-label-sm text-label-sm text-on-surface-variant block mb-1"
                                    >Cook Time</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            className="form-input-text py-1 px-2 w-16"
                                            placeholder="0"
                                            type="number"
                                        />
                                        <span className="font-body-md text-body-md">min</span>
                                    </div>
                                </div>

                                <div className="bg-surface-container-low p-3 rounded-lg col-span-2">
                                    <label
                                        className="font-label-sm text-label-sm text-on-surface-variant block mb-2"
                                    >Servings</label>
                                    <div className="flex items-center justify-between">
                                        <button
                                            className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:border-primary text-primary transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]"
                                            >remove</span>
                                        </button>
                                        <span className="font-headline-sm text-headline-sm">4</span>
                                        <button
                                            className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:border-primary text-primary transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]"
                                            >add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="recipe-card p-md">
                            <h3 className="font-label-md text-label-md text-on-surface mb-4">
                                Tags
                            </h3>
                            <input
                                className="form-input-text mb-4"
                                placeholder="Add tags (e.g. Vegan, Dessert)"
                                type="text"
                            />
                            <div className="flex flex-wrap gap-2">
                                <span
                                    className="px-3 py-1 bg-surface-container rounded-full font-label-sm text-label-sm text-on-surface flex items-center gap-1 cursor-pointer hover:bg-outline-variant transition-colors"
                                >
                                    Breakfast
                                    <span className="material-symbols-outlined text-[14px]"
                                    >close</span>
                                </span>
                                <span
                                    className="px-3 py-1 bg-primary-fixed rounded-full font-label-sm text-label-sm text-on-primary-fixed cursor-pointer hover:bg-primary-fixed-dim transition-colors"
                                >
                                    + Quick &amp; Easy
                                </span>
                                <span
                                    className="px-3 py-1 bg-surface-container rounded-full font-label-sm text-label-sm text-on-surface cursor-pointer hover:bg-outline-variant transition-colors"
                                >
                                    + Healthy
                                </span>
                            </div>
                        </section>

                        <section
                            className="recipe-card p-md relative overflow-hidden  "
                        >

                            <div className="bg-surface-container-low p-4 ">
                                <h3 className="font-label-md bg-surface-container-low text-label-md text-on-surface mb-4">
                                    Nutritional Info
                                </h3>
                                <div className="space-y-2">
                                    <div
                                        className="flex justify-between border-b items-center border-outline-variant pb-1"
                                    >
                                        <span>Calories</span><span><input className="form-input-text w-16 py-2!" placeholder="0" type="number" /></span>
                                    </div>
                                    <div
                                        className="flex justify-between border-b items-center border-outline-variant pb-1"
                                    >
                                        <span>Protein</span><span><input className="form-input-text w-16 py-2!" placeholder="0" type="number" /></span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="flex w-full justif-center items-center gap-4 mt-4">
                            <SecondaryButton
                                label="Cancel"
                                icon=""
                                onClick={() => { }}
                                fontSize='medium'


                            />


                            <PrimaryButton
                                label="Save Recipe"
                                icon=""
                                onClick={() => { }}
                                fontSize='medium'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default AddRecipe