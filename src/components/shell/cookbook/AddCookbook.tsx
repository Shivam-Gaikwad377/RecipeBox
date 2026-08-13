"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FieldErrors, SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CookbookSchema, cookbookSchema } from '@/schemas/cookbook.schema'
import ApiResponse from '@/types/ApiResponse'
import axios from 'axios'
import { toast } from 'sonner'
import { useSession } from "next-auth/react"

const ALLOWED_COVER_TYPES = ["image/jpeg", "image/png"]
const MAX_COVER_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

interface AddCookbookProps {
    // If you're controlling visibility from a parent's state, pass onClose in.
    // Falls back to router.back() otherwise (e.g. intercepting-route modal).
    onClose?: () => void
}

const AddCookbook = ({ onClose }: AddCookbookProps) => {
    const router = useRouter()
    const { data: session, status } = useSession()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const form = useForm<CookbookSchema>({
        resolver: zodResolver(cookbookSchema),
        defaultValues: {
            title: '',
            description: '',
            author: session?.user?._id?.toString(),
        },
    })
    const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, getValues } = form
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isUploadingCover, setIsUploadingCover] = useState(false)

    const handleClose = () => {
        if (onClose) onClose()
        else router.back()
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    useEffect(() => {
        if (session?.user?._id) {
            setValue('author', session.user._id.toString(), { shouldValidate: true })
        }
    }, [session, setValue])

    const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = "" // reset now so re-selecting the same file still fires onChange
        if (!file) return

        if (!ALLOWED_COVER_TYPES.includes(file.type)) {
            toast.error("Only JPEG or PNG images are allowed")
            return
        }
        if (file.size > MAX_COVER_SIZE_BYTES) {
            toast.error("Cover image must be under 5MB")
            return
        }

        const previousFileId = getValues("coverImage.coverImageFileId") // read-at-call-time, not a stale watch() closure

        const formData = new FormData()
        formData.append("coverImage", file)
        if (previousFileId) formData.append("previousFileId", previousFileId)

        setIsUploadingCover(true)
        try {
            
            const response = await axios.post<ApiResponse>(`/api/users/${session?.user?._id}/cookbook/upload-cover`, formData)
            if (response.data.success) {
                setValue("coverImage", {
                    coverImageURL: response.data.data.coverImage.url,
                    coverImageFileId: response.data.data.coverImage.fileId,
                }, { shouldValidate: true })
                setPreviewUrl(response.data.data.coverImage.url)
            }
        } catch (err) {
            console.error("Cover image upload failed:", err)
            toast.error("Failed to upload cover image")
        } finally {
            setIsUploadingCover(false)
        }
    }

    const onSubmit: SubmitHandler<CookbookSchema> = async (data) => {
        try {
            const payload = {
            ...data,
            author: session?.user?._id?.toString()
        }
            const response = await axios.post(`/api/users/${session?.user?._id}/cookbook`, payload)
            // NOTE: verify this against your actual route contract — your upload-cover
            // endpoint returns { success, data: {...} }. If /api/cookbook follows the
            // same ApiResponse shape, prefer checking response.data.success over the
            // raw HTTP status, and response.data.cookbookId may actually need to be
            // response.data.data._id (or whatever field your route returns).
            if (response.status === 200) {
                toast.success("Cookbook added successfully!")
                router.push(`/cookbook/${response.data.cookbookId}`)
                handleClose()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message ?? "Failed to add cookbook")
        }
    }

    const onInvalid = (errors: FieldErrors<CookbookSchema>) => {
        console.error("Validation failed:", errors)
    }
    if (status === "loading") {
        return null; // Or a loading spinner
    }

    return (
        <div
            className="flex items-center justify-center w-full h-screen fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
        >
            <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
                <div
                    aria-labelledby="modal-title"
                    aria-modal="true"
                    className="relative m-10 w-full bg-surface-container-lowest rounded-xl shadow-[0_4px_40px_rgba(30,27,24,0.08)] transform transition-all overflow-hidden flex flex-col"
                    role="dialog"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="px-md py-md flex items-center justify-between border-b border-outline-variant/30"
                    >
                        <h2
                            className="font-headline-sm text-headline-sm text-on-surface"
                            id="modal-title"
                        >
                            New cookbook
                        </h2>
                        <button
                            aria-label="Close"
                            className="text-on-surface-variant hover:text-on-surface transition-colors duration-200 rounded-full p-2 hover:bg-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            type="button"
                            onClick={handleClose}
                        >
                            <span className="material-symbols-outlined" data-icon="close">close</span>
                        </button>
                    </div>
                    <div className="p-md space-y-md overflow-y-auto ">
                        <div className="space-y-sm">
                            <label className="block font-label-md text-label-md text-on-surface" htmlFor="coverImage">
                                Cover image
                            </label>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingCover}
                                className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center gap-sm border-2 border-dashed border-outline-variant rounded-lg bg-surface hover:bg-surface-container-low transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
                                style={previewUrl ? { backgroundImage: `url(${previewUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                            >
                                {!previewUrl && (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-colors duration-200">
                                            <span
                                                className="material-symbols-outlined text-2xl"
                                                data-icon="add_photo_alternate"
                                            >add_photo_alternate</span>
                                        </div>
                                        <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors duration-200">
                                            {isUploadingCover ? "Uploading..." : "Add cover image"}
                                        </span>
                                        <span className="font-label-sm text-label-sm text-tertiary hidden md:block">
                                            JPEG or PNG, max 5MB · 16:9 recommended
                                        </span>
                                    </>
                                )}
                                {previewUrl && isUploadingCover && (
                                    <span className="font-label-sm text-label-sm bg-black/50 text-white px-3 py-1 rounded-full">
                                        Uploading...
                                    </span>
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                id="coverImage"
                                type="file"
                                accept="image/jpeg,image/png"
                                className="hidden"
                                onChange={handleCoverImageChange}
                                disabled={isUploadingCover}
                            />
                        </div>
                        <div className="space-y-sm">
                            <label
                                className="block font-label-md text-label-md text-on-surface"
                                htmlFor="cookbook-title"
                            >Title</label>
                            <input
                                {...register("title")}
                                className="w-full bg-surface border-b-2 border-outline-variant rounded-t-lg border-x-0 border-t-0 px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:ring-0 focus:border-primary transition-colors duration-200 shadow-sm shadow-black/5"
                                id="cookbook-title"
                                placeholder="Sunday brunch favorites"
                                type="text"
                            />
                            {errors.title && (
                                <p className="font-label-sm text-label-sm text-error">{errors.title.message}</p>
                            )}
                        </div>
                        <div className="space-y-sm">
                            <label
                                className="block font-label-md text-label-md text-on-surface"
                                htmlFor="cookbook-desc"
                            >Description
                                <span className="text-on-surface-variant/60 font-normal ml-1"
                                >(Optional)</span></label>
                            <textarea
                                {...register("description")}
                                className="w-full bg-surface border-b-2 border-outline-variant rounded-t-lg border-x-0 border-t-0 px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:ring-0 focus:border-primary transition-colors duration-200 resize-none shadow-sm shadow-black/5"
                                id="cookbook-desc"
                                placeholder="What's this collection about?"
                                rows={3}
                            />
                            {errors.description && (
                                <p className="font-label-sm text-label-sm text-error">{errors.description.message}</p>
                            )}
                        </div>
                    </div>
                    <div
                        className="px-md py-md bg-surface-container-low border-t border-outline-variant/30 flex justify-end gap-sm items-center"
                    >
                        <button
                            className="px-6 py-2.5 rounded-full font-label-md text-label-md text-primary border border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200 bg-transparent"
                            type="button"
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-6 py-2.5 rounded-full font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={isSubmitting || isUploadingCover}
                        >
                            {isSubmitting ? "Creating..." : "Create cookbook"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default AddCookbook