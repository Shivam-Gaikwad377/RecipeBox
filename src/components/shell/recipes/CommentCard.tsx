import React, { useState } from 'react'
import { getTimeAgo } from '@/helpers/getTimeAgo'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import PrimaryButton from '@/components/PrimaryButton'
import SecondaryButton from '@/components/SecondaryButton'
import { useRouter } from 'next/navigation'
type CommentCardProps = {
    userName: string
    userAvatarUrl: string
    commentText: string
    timeAgo: string
    likesCount?: number
    isAuthor?: boolean
    recipe?: string
    commentID?: string
    commentAuthorId?: string
}

const CommentCard = ({ userName, userAvatarUrl, commentText, timeAgo, likesCount, isAuthor, recipe, commentID, commentAuthorId }: CommentCardProps) => {
    const { data: session } = useSession()
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [editedComment, setEditedComment] = useState(commentText)
    const router = useRouter()
    const handleSubmitEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const response = await axios.put(`/api/recipe/${recipe}/comment/${commentID}`, {
            body: editedComment.trim(),
        })

        if (response.data.success) {
            setIsEditing(false)
            router.refresh() // Refresh the page to show the updated comment
        }
    }

    return (
        // FIX 1: Removed 'flex' from the form so it naturally spans 100% width
        <form onSubmit={handleSubmitEdit} className="w-full">
            {/* FIX 2: Added 'w-full' to this wrapper */}
            <div className="w-full flex gap-md group">
                <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden shadow-sm">
                        <img
                            alt="User avatar"
                            className="w-full h-full object-cover"
                            src={userAvatarUrl}
                        />
                    </div>
                </div>

                <div className="grow bg-surface p-md rounded-xl border border-surface-container-high shadow-[0_4px_20px_rgba(30,27,24,0.04)]">
                    <div className="flex items-center justify-between mb-sm">
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-xs">
                                <span className="font-label-md text-label-md text-on-background">
                                    {userName}
                                </span>
                                {isAuthor && (
                                    <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
                                        Author
                                    </span>
                                )}
                                <span className="font-label-sm text-label-sm text-on-surface-variant">
                                    • {getTimeAgo(timeAgo)}
                                </span>
                                
                            </div>
                            <div>
                                {session?.user?._id === commentAuthorId && (
                                
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="font-label-md material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-primary"
                                    >
                                        edit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="flex flex-col gap-sm">
                            <textarea
                                value={editedComment}
                                onChange={(e) => setEditedComment(e.target.value)}
                                className="w-full font-body-md text-body-md text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-lg p-sm focus:ring-1 focus:ring-primary focus:border-primary"
                                rows={3}
                            />
                            {/* FIX 4: Moved buttons inside the editing block so they appear directly under the textarea */}
                            <div className="flex items-center gap-xs">
                                <PrimaryButton
                                    label="Save Changes"
                                    type="submit"
                                    fontSize="small"
                                />
                                <SecondaryButton
                                    label="Cancel"
                                    onClick={() => {
                                        setIsEditing(false)
                                        setEditedComment(commentText)
                                    }}
                                    fontSize="small"
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="font-body-md text-body-md text-on-surface-variant mb-sm">
                            {commentText}
                        </p>
                    )}

                    {!isEditing && (
                        <div className="flex items-center gap-base">
                            <button
                                type="button"
                                className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg filled text-primary">
                                    favorite
                                </span>
                                <span className="font-label-sm text-label-sm">{likesCount}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </form>
    )
}

export default CommentCard