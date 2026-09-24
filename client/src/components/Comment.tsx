import { useState, type FormEvent } from "react";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Trash, ThumbsUp, DotsThreeVertical, ArrowBendDownRight, CaretDown } from "@phosphor-icons/react";
import type { Comment as CommentType } from "../types";
import { useAppSelector } from "../store/hooks";
import { COMMENT_MAX, validateMaxLength, validateRequired } from "../lib/validation";
import { formatDate } from "../lib/format";
import dayjs from "../lib/dayjs";
import CommentComposer from "./CommentComposer";

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
  canInteract: boolean;
  onDelete: (id: number) => void;
  onToggleLike: (id: number) => void;
  onReplyClick?: () => void;
}

function CommentRow({ data, isReply, isOwner, canInteract, onDelete, onToggleLike, onReplyClick }: CommentRowProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const size = isReply ? 28 : 36;

  return (
    <div className="group/comment flex items-start gap-sm">
      <Avatar src={data.userImage || undefined} alt="" sx={{ width: size, height: size, fontSize: isReply ? 12 : 14 }}>
        {data.userName?.[0]?.toUpperCase()}
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-caption-strong text-foreground">{data.userName}</span>
          <time dateTime={data.createdAt} title={formatDate(data.createdAt)} className="text-fine-print text-muted-foreground">
            {dayjs(data.createdAt).fromNow()}
          </time>
        </p>
        <p className="mt-0.5 whitespace-pre-wrap text-caption text-foreground [overflow-wrap:anywhere]">{data.comment}</p>
        <div className="-ml-2 mt-1 flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleLike(data.id)}
            disabled={!canInteract}
            aria-pressed={data.isLiked}
            aria-label={`${data.isLiked ? "Unlike" : "Like"} comment${data.likeCount ? `, ${data.likeCount} likes` : ""}`}
            className={`inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-fine-print font-semibold transition-colors duration-fast disabled:cursor-default disabled:opacity-70 ${
              data.isLiked ? "text-accent hover:bg-accent-soft" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <ThumbsUp size={16} weight={data.isLiked ? "fill" : "regular"} aria-hidden />
            {data.likeCount > 0 && <span className="tabular">{data.likeCount}</span>}
          </button>
          {!isReply && onReplyClick && (
            <button
              type="button"
              onClick={onReplyClick}
              className="inline-flex h-8 items-center rounded-full px-3 text-fine-print font-semibold text-muted-foreground transition-colors duration-fast hover:bg-muted hover:text-foreground"
            >
              Reply
            </button>
          )}
        </div>
      </div>
      {isOwner && (
        <>
          <IconButton
            size="small"
            aria-label="Comment options"
            aria-haspopup="menu"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            className="!text-muted-foreground sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover/comment:opacity-100"
          >
            <DotsThreeVertical size={18} weight="bold" />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={!!menuAnchor}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                onDelete(data.id);
              }}
              className="!text-destructive"
            >
              <ListItemIcon className="!min-w-0 !text-destructive">
                <Trash size={18} />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
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
  const [showReplies, setShowReplies] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replyTextError, setReplyTextError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReplySubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextReplyTextError =
      validateRequired(replyText, "Reply") || validateMaxLength(replyText, COMMENT_MAX, "Reply");
    setReplyTextError(nextReplyTextError || "");
    if (nextReplyTextError) return;

    setSubmitting(true);
    try {
      await onReply(comment.id, replyText.trim());
      setReplyText("");
      setReplyTextError("");
      setReplying(false);
      setShowReplies(true);
    } finally {
      setSubmitting(false);
    }
  };

  const replyCount = replies?.length ?? 0;

  return (
    <li className="py-sm">
      <CommentRow
        data={comment}
        isReply={false}
        isOwner={isOwner}
        canInteract={!!user}
        onDelete={onDelete}
        onToggleLike={onToggleLike}
        onReplyClick={user ? () => setReplying((r) => !r) : undefined}
      />

      <div className="ml-12">
        {replying && user && (
          <div className="mt-2">
            <CommentComposer
              compact
              autoFocus
              avatarSrc={user.profileImage}
              avatarLabel={user.name}
              placeholder={`Reply to ${comment.userName}…`}
              value={replyText}
              onChange={setReplyText}
              error={replyTextError}
              submitting={submitting}
              submitLabel="Reply"
              onSubmit={handleReplySubmit}
              onCancel={() => {
                setReplying(false);
                setReplyText("");
                setReplyTextError("");
              }}
            />
          </div>
        )}

        {replyCount > 0 && (
          <>
            <button
              type="button"
              onClick={() => setShowReplies((s) => !s)}
              aria-expanded={showReplies}
              className="-ml-3 mt-1 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-fine-print font-semibold text-accent transition-colors duration-fast hover:bg-accent-soft"
            >
              <CaretDown
                size={14}
                weight="bold"
                className={`transition-transform duration-fast ${showReplies ? "rotate-180" : ""}`}
                aria-hidden
              />
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </button>
            {showReplies && (
              <ul className="mt-1 flex flex-col">
                {replies!.map((reply) => (
                  <li key={reply.id} className="flex gap-1.5 py-xs">
                    <ArrowBendDownRight size={14} className="mt-2 shrink-0 text-muted-foreground/60" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <CommentRow
                        data={reply}
                        isReply
                        isOwner={user?.id === reply.userId}
                        canInteract={!!user}
                        onDelete={onDelete}
                        onToggleLike={onToggleLike}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </li>
  );
}
