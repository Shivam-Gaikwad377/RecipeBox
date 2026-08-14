"use client"
import React from 'react'
import AddCookbook from '@/components/shell/cookbook/AddCookbook'
import { usePathname } from 'next/navigation';
import useFetch from '@/hooks/useFetch';
import { useState } from 'react'
import { CookbookDocument } from '@/models/cookbook.model';
import { RecipeDocument } from '@/models/recipe.model';
import RecipeSection from '@/components/shell/profile/RecipeSection';
import { useSession } from "next-auth/react";
import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SecondaryButton from '@/components/SecondaryButton';
import PrimaryButton from '@/components/PrimaryButton';
import axios from "axios";
import { useRouter } from 'next/navigation';
import { updateCookbookSchema, UpdateCookbookSchema } from '@/schemas/updateCookbook.schema';
const page = () => {
  const pathname = usePathname();
  const router = useRouter();
  const id = pathname.split("/").pop();
  const { data: session } = useSession();
  const [cookbook, setCookbooks] = useState<CookbookDocument | null>(null);
  const { loading, error } = useFetch<CookbookDocument | null>(`/api/users/${session?.user?._id}/cookbook/${id}`, {}, setCookbooks);
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateCookbookSchema>({
    resolver: zodResolver(updateCookbookSchema),
    defaultValues: {
      title: cookbook?.title || "",
      description: cookbook?.description || "",     
    },
  });

  const onSubmit = async (data: UpdateCookbookSchema) => {
    try {
      const response = await axios.patch(`/api/users/${session?.user?._id}/cookbook/${id}`, data);
      if (response.status === 200) {
        setCookbooks(response.data);
        router.refresh(); // Refresh the page to reflect the updated data
      }
    } catch (error) {
      console.error("Error updating cookbook:", error);
    }
  };

  return (

    <div
      className="bg-surface text-on-surface font-body-md antialiased min-h-screen pb-xl"
    >

      <nav
        className="w-full px-margin-mobile md:px-margin-desktop py-4 mx-auto flex items-center bg-surface sticky top-0 "
      >
        <a
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors duration-200"
          href="#"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: '"FILL" 0' }}
          >
            arrow_back
          </span>
          <span className="font-label-md text-label-md">My cookbooks</span>
        </a>
      </nav>
      <main className="mx-auto px-margin-mobile md:px-margin-desktop pt-md">

        <form onSubmit={handleSubmit(onSubmit)}>
          <section className="mb-lg">
            <div
              className="w-full h-50 md:h-75 rounded-xl overflow-hidden mb-6 relative shadow-sm"
            >
              <img
                alt="Fresh ingredients on a wooden kitchen counter"
                className="w-full h-full object-cover"
                src={cookbook?.coverImage?.coverImageURL || "/images/cookbook-cover-placeholder.jpg"}
              />
            </div>
            <div
              className="flex flex-col md:flex-row md:justify-between md:items-start gap-4"
            >
              <div className="flex-1">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      className="form-input-text   text-on-surface mb-2 bg-transparent border-none focus:outline-none"
                      defaultValue={cookbook?.title }
                      {...register("title")}
                      placeholder="Enter cookbook title"
                    />
                    {errors.title && (<p className="text-error text-sm">{errors.title.message}</p>)}
                  </>
                ) : (
                  <h1 className="font-headline-md text-headline-md text-on-surface mb-2">
                    {cookbook?.title || "My Cookbook"}
                  </h1>
                )}
                {isEditing ? (
                  <>
                    <textarea
                      className="form-input-text font-body-md text-body-md text-on-surface-variant mb-4 bg-transparent border-none focus:outline-none"
                      defaultValue={cookbook?.description || "A collection of my favorite recipes."}
                      {...register("description")}
                      placeholder="Enter cookbook description"
                    />
                    {errors.description && (<p className="text-error text-sm">{errors.description.message}</p>)}
                  </>
                ) : (
                  <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                    {cookbook?.description || "A collection of my favorite recipes."}
                  </p>
                )}
                <div className="flex items-center justify-between gap-2 text-primary">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]"
                    >menu_book</span>
                    <span className="font-label-sm text-label-sm">{cookbook?.recipes?.length || 0} recipes</span>
                  </div>
                  {isEditing && (
                    <div className="flex items-center justify-center gap-md">
                      <SecondaryButton type="button"  onClick={() => setIsEditing(false)} label="Cancel" fontSize="medium"/>
                       
                      <PrimaryButton type="submit" label="Save" fontSize="medium" />
                        
                    </div>
                    )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  aria-label="Edit cookbook"
                  className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-200"
                >
                  <span className="material-symbols-outlined" onClick={() => setIsEditing(!isEditing)}>
                    edit
                  </span>
                </button>
                <button
                  aria-label="Delete cookbook"
                  className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors duration-200"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </section>
        </form>
        <hr className="border-outline-variant/30 mb-lg" />

        <section>
          <RecipeSection recipes={cookbook?.recipes || [] as RecipeDocument[]} isOwnProfile={true} loading={loading} />
        </section>
      </main>
    </div>
  )
}

export default page