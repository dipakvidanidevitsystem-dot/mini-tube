import { useState, type FormEvent } from "react";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Button from "./Button";
import TextField from "./TextField";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Trash, ThumbsUp, DotsThreeVertical } from "@phosphor-icons/react";
import type { Comment as CommentType } from "../types";
import { useAppSelector } from "../store/hooks";

interface Props {
  comment: CommentType;
  replies?: CommentType[];
  onDelete: (id: number) => void;
  onToggleLike: (id: number) => void;
  onReply: (parentId: number, text: string) => Promise<void>;
}

interface CommentRowProps {
  data: CommentType;
  isReply: boolean;
  isOwner: boolean;
  onDelete: (id: number) => void;
  onToggleLike: (id: number) => void;
  onReplyClick?: () => void;
}

function CommentRow({ data, isReply, isOwner, onDelete, onToggleLike, onReplyClick }: CommentRowProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  return (
    <div className="flex items-start gap-3">
      <Avatar src={data.userImage || undefined} sx={{ width: isReply ? 28 : 32, height: isReply ? 28 : 32 }}>
        {data.userName?.[0]?.toUpperCase()}
      </Avatar>
      <div className="flex-1">
        <p className="text-sm font-medium">{data.userName}</p>
        <p className="text-sm text-foreground dark:text-foreground-dark">{data.comment}</p>
        <div className="mt-1 flex items-center gap-1">
          <IconButton size="small" aria-label="like comment" onClick={() => onToggleLike(data.id)}>
            <ThumbsUp size={20} weight={data.isLiked ? "fill" : "regular"} />
          </IconButton>
          {data.likeCount > 0 && (
            <span className="text-xs text-muted-foreground dark:text-muted-foreground-dark">{data.likeCount}</span>
          )}
          {!isReply && onReplyClick && (
            <Button size="small" onClick={onReplyClick}>
              Reply
            </Button>
          )}
        </div>
      </div>
      {isOwner && (
        <>
          <IconButton size="small" aria-label="comment options" onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <DotsThreeVertical size={18} weight="bold" />
          </IconButton>
          <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                onDelete(data.id);
              }}
            >
              <Trash size={16} style={{ marginRight: 8 }} /> Delete
            </MenuItem>
          </Menu>
        </>
      )}
    </div>
  );
}

export default function Comment({ comment, replies, onDelete, onToggleLike, onReply }: Props) {
  const user = useAppSelector((state) => state.auth.user);
  const isOwner = user?.id === comment.userId;
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReplySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onReply(comment.id, replyText.trim());
      setReplyText("");
      setReplying(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-xs">
      <CommentRow
        data={comment}
        isReply={false}
        isOwner={isOwner}
        onDelete={onDelete}
        onToggleLike={onToggleLike}
        onReplyClick={user ? () => setReplying((r) => !r) : undefined}
      />

      {replying && (
        <form onSubmit={handleReplySubmit} className="ml-11 mt-2 flex items-start gap-2">
          <TextField
            size="small"
            fullWidth
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={submitting}
          />
          <Button type="submit" size="small" variant="contained" disabled={submitting || !replyText.trim()}>
            Post
          </Button>
        </form>
      )}

      {replies && replies.length > 0 && (
        <div className="ml-11 mt-2 divide-y divide-border border-l border-border pl-3 dark:divide-border-dark dark:border-border-dark">
          {replies.map((reply) => (
            <div key={reply.id} className="py-xs">
              <CommentRow
                data={reply}
                isReply
                isOwner={user?.id === reply.userId}
                onDelete={onDelete}
                onToggleLike={onToggleLike}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
