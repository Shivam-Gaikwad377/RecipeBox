import { useState, useEffect, FormEvent } from "react";
import { PopulatedCommentDocument } from "@/models/comment.model";
import useFetch from "@/hooks/useFetch";
import CommentCard from "@/components/shell/recipes/CommentCard";
import axios from "axios";
import {UserDocument} from "@/models/user.model";
import { useSession } from "next-auth/react";
type CommentSectionProps = {
  recipeId: string;
  authorId?: string; // Optional author prop, if needed for future use
};

type CommentsResponse = {
  comments: PopulatedCommentDocument[];
  total: number;
};

const MAX_COMMENT_LENGTH = 500;

const CommentSection = ({ recipeId, authorId }: CommentSectionProps) => {
  const [comments, setComments] = useState<CommentsResponse | null>(null);
  const { data: session } = useSession();
  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserDocument | null>(null);
  const { error, loading } = useFetch<CommentsResponse>(
    `/api/recipe/${recipeId}/comment`,
    { limit, offset },
    setComments
  );
  const { error: userError, loading: userLoading } = useFetch<UserDocument>(
    `/api/profile/${session?.user?.username}`,
    {},
    setUserData
  );

  useEffect(() => {
    setOffset(0);
  }, [recipeId]);

  const trimmedLength = commentText.trim().length;
  const isValid = trimmedLength > 0 && commentText.length <= MAX_COMMENT_LENGTH;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await axios.post(`/api/recipe/${recipeId}/comment`, {
        body: commentText.trim(),
      });

      if (response.data.success) {
        const newComment: PopulatedCommentDocument = response.data.data;
        setComments((prev) =>
          prev
            ? { comments: [newComment, ...prev.comments], total: prev.total + 1 }
            : { comments: [newComment], total: 1 }
        );
        setCommentText("");
      } else {
        setSubmitError("Couldn't post your comment. Try again.");
      }
    } catch {
      setSubmitError("Something went wrong posting your comment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen">
      <main className="w-full px-margin-mobile md:px-margin-desktop py-xl">
        <div className="flex items-center justify-between mb-lg border-b border-surface-variant pb-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-background">
            Comments {comments?.total ? `(${comments.total})` : ""}
          </h2>
          {/* NOTE: original had an empty group-hover dropdown here with no
              trigger element and no content — dead UI. Left out; if you have
              a menu planned, it needs a visible trigger (e.g. an icon button)
              to hover/click. */}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-md mb-xl">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant shadow-sm">
              <img
                alt="Current user avatar"
                className="w-full h-full object-cover"
                src={userData?.avatar?.avatarUrl || "-OMvGI"}
              />
            </div>
          </div>
          <div className="flex-grow flex flex-col gap-sm">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={MAX_COMMENT_LENGTH}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm font-body-md text-body-md text-on-background focus:ring-1 focus:ring-primary focus:border-primary resize-y min-h-[100px] transition-all"
              placeholder="Share your thoughts or variations on this recipe..."
            />
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {commentText.length} / {MAX_COMMENT_LENGTH}
              </span>
              <button
                type="submit"
                disabled={!isValid || submitting}
                className="px-6 py-2 rounded-full bg-surface-container-high text-tertiary font-label-md text-label-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
            {submitError && (
              <span className="font-label-sm text-label-sm text-error">
                {submitError}
              </span>
            )}
          </div>
        </form>

        {error && (
          <p className="font-label-sm text-label-sm text-error mb-md">
            Couldn't load comments. Please try again.
          </p>
        )}

        <div className="space-y-lg">
          {comments?.comments.map((comment) => (
            <CommentCard
              key={comment._id.toString()}
              userName={comment.author?.username}
              userAvatarUrl={comment.author?.avatar?.avatarUrl ?? ""}
              commentText={comment.body}
              timeAgo={new Date(comment.createdAt).toLocaleDateString()}
              isAuthor={authorId ? comment.author?._id.toString() === authorId : false}
            />
          ))}
        </div>

        <div className="mt-xl flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((prevLimit) => prevLimit + 5)}
            className="px-8 py-3 rounded-full border border-primary text-primary font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-colors duration-200 shadow-sm flex items-center gap-xs"
          >
            Load more comments
            <span className="material-symbols-outlined text-[18px]">
              expand_more
            </span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default CommentSection;