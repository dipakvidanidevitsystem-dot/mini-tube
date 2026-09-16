import { useMemo, useState, type FormEvent } from "react";
import TextField from "./TextField";
import Button from "./Button";
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
    <div>
      <h2 className="font-medium mb-3">Comments ({comments.length})</h2>

      {user && (
        <form onSubmit={handleSubmit} noValidate className="flex items-start gap-2 mb-4">
          <TextField
            size="small"
            fullWidth
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            error={!!textError}
            helperText={textError}
            disabled={submitting}
          />
          <Button type="submit" variant="contained" disabled={submitting}>
            Post
          </Button>
        </form>
      )}
      {error && <p className="mb-2 text-sm font-medium text-foreground dark:text-foreground-dark">{error}</p>}

      {loading ? (
        <Loading />
      ) : hasLoadError ? (
        <ErrorState message="We couldn't load comments. Please try again." onRetry={refetch} />
      ) : topLevel.length === 0 ? (
        <EmptyState message="No comments yet. Be the first to comment." />
      ) : (
        <div className="divide-y divide-border dark:divide-border-dark">
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
        </div>
      )}
    </div>
  );
}
