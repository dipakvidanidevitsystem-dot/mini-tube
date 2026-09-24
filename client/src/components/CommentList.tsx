import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ChatCircleDots } from "@phosphor-icons/react";
import CommentComposer from "./CommentComposer";
import {
  useListCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useToggleCommentLikeMutation,
} from "../store/api/commentsApi";
import type { Comment as CommentType } from "../types";
import { useAppSelector } from "../store/hooks";
import { getRtkErrorMessage } from "../store/lib/getRtkErrorMessage";
import { notifyApiError, notifySuccess } from "../lib/toast";
import Comment from "./Comment";
import Loading from "./Loading";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { COMMENT_MAX, validateMaxLength, validateRequired } from "../lib/validation";

export default function CommentList({ videoId }: { videoId: string | number }) {
  const user = useAppSelector((state) => state.auth.user);
  const { data: comments = [], isLoading: loading, isError: hasLoadError, refetch } = useListCommentsQuery(videoId);
  const [addComment, { isLoading: submitting }] = useAddCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [toggleCommentLike] = useToggleCommentLikeMutation();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [textError, setTextError] = useState("");

  const { topLevel, repliesByParent } = useMemo(() => {
    const top: CommentType[] = [];
    const byParent = new Map<number, CommentType[]>();
    for (const c of comments) {
      if (c.parentId) {
        const list = byParent.get(c.parentId) || [];
        list.push(c);
        byParent.set(c.parentId, list);
      } else {
        top.push(c);
      }
    }
    return { topLevel: top, repliesByParent: byParent };
  }, [comments]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextTextError = validateRequired(text, "Comment") || validateMaxLength(text, COMMENT_MAX, "Comment");
    setTextError(nextTextError || "");
    if (nextTextError) return;

    setError("");
    try {
      await addComment({ videoId, comment: text.trim() }).unwrap();
      setText("");
      setTextError("");
      notifySuccess("Comment added.");
    } catch (err) {
      setError(getRtkErrorMessage(err));
    }
  };

  const handleReply = async (parentId: number, replyText: string) => {
    try {
      await addComment({ videoId, comment: replyText, parentId }).unwrap();
    } catch (err) {
      notifyApiError(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteComment({ id, videoId }).unwrap();
    } catch (err) {
      notifyApiError(err);
    }
  };

  const handleToggleLike = async (id: number) => {
    try {
      await toggleCommentLike(id).unwrap();
    } catch (err) {
      notifyApiError(err);
    }
  };

  return (
    <section aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="mb-md flex items-center gap-2 text-tagline text-foreground">
        Comments
        <span className="tabular rounded-full bg-muted px-2 py-0.5 text-fine-print font-semibold text-muted-foreground">
          {comments.length}
        </span>
      </h2>

      {user ? (
        <div className="mb-md">
          <CommentComposer
            avatarSrc={user.profileImage}
            avatarLabel={user.name}
            value={text}
            onChange={(value) => {
              setText(value);
              if (textError) setTextError("");
            }}
            error={textError || error}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        </div>
      ) : (
        <p className="mb-md rounded-md border border-dashed border-border px-md py-sm text-caption text-muted-foreground">
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      {loading ? (
        <Loading label="Loading comments" />
      ) : hasLoadError ? (
        <ErrorState message="We couldn't load comments. Please try again." onRetry={refetch} />
      ) : topLevel.length === 0 ? (
        <EmptyState icon={ChatCircleDots} message="No comments yet. Be the first to share your thoughts." />
      ) : (
        <ul className="divide-y divide-border">
          {topLevel.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              replies={repliesByParent.get(comment.id)}
              onDelete={handleDelete}
              onToggleLike={handleToggleLike}
              onReply={handleReply}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
