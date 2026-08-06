import React from 'react'
type CommentCardProps = {
    userName: string
    userAvatarUrl: string
    commentText: string
    timeAgo: string
    likesCount?: number
    isAuthor?: boolean

}
const CommentCard = ({ userName, userAvatarUrl, commentText, timeAgo, likesCount, isAuthor }: CommentCardProps) => {
    return (
        <div className="flex gap-md group">
            <div className="flex-shrink-0">
                <div
                    className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden shadow-sm"
                >
                    <img
                        alt="User avatar"
                        className="w-full h-full object-cover"
                        data-alt="A portrait of a middle-aged man with a neat beard, smiling gently. The background is a blurred, brightly lit kitchen space. The color palette is composed of soft creams, warm wood tones, and hints of sage green, reflecting a communal, epicurean vibe."
                        src={userAvatarUrl}
                    />
                </div>
            </div>
            <div
                className="flex-grow bg-surface p-md rounded-xl border border-surface-container-high shadow-[0_4px_20px_rgba(30,27,24,0.04)]"
            >
                <div className="flex items-center justify-between mb-sm">
                    <div className="flex items-center gap-xs">
                        <span className="font-label-md text-label-md text-on-background"
                        >{userName}</span>
                        {isAuthor && (
                            <span
                                className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded"
                            >Author</span>
                        )}

                        <span
                            className="font-label-sm text-label-sm text-on-surface-variant"
                        >• {timeAgo}</span>
                    </div>
                </div>
                <p
                    className="font-body-md text-body-md text-on-surface-variant mb-sm"
                >
                    {commentText}

                </p>
                <div className="flex items-center gap-base">
                    <button
                        className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors"
                    >
                        <span
                            className="material-symbols-outlined text-lg filled text-primary"
                        >favorite</span>
                        <span className="font-label-sm text-label-sm">{likesCount}</span>
                    </button>

                </div>
            </div>
        </div>
    )
}

export default CommentCard