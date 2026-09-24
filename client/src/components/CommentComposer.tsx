import { useId, useState, type FormEvent } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "./Button";
import { COMMENT_MAX } from "../lib/validation";

/** Avatar + auto-growing textarea with a live character count. Actions appear once the field is engaged. */
export default function CommentComposer({
  avatarSrc,
  avatarLabel,
  value,
  onChange,
  onSubmit,
  onCancel,
  error,
  submitting,
  placeholder = "Add a comment…",
  submitLabel = "Comment",
  compact = false,
  autoFocus = false,
}: {
  avatarSrc?: string | null;
  avatarLabel?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel?: () => void;
  error?: string;
  submitting?: boolean;
  placeholder?: string;
  submitLabel?: string;
  compact?: boolean;
  autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(autoFocus);
  const errorId = useId();
  const countId = useId();
  const engaged = focused || value.length > 0 || !!error;
  const remaining = COMMENT_MAX - value.length;
  const size = compact ? 28 : 36;

  return (
    <form onSubmit={onSubmit} noValidate className="flex items-start gap-sm">
      <Avatar src={avatarSrc || undefined} alt="" sx={{ width: size, height: size, fontSize: compact ? 12 : 14 }} className="mt-1">
        {avatarLabel?.[0]?.toUpperCase()}
      </Avatar>
      <div className="min-w-0 flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit(e as unknown as FormEvent);
            if (e.key === "Escape" && onCancel) onCancel();
          }}
          placeholder={placeholder}
          aria-label={placeholder.replace(/…$/, "")}
          aria-invalid={!!error}
          aria-describedby={`${error ? errorId : ""} ${countId}`.trim()}
          autoFocus={autoFocus}
          disabled={submitting}
          rows={1}
          className={`block min-h-10 w-full resize-none border-0 border-b-2 bg-transparent px-0 py-2 text-caption text-foreground outline-none transition-colors duration-fast [field-sizing:content] placeholder:text-muted-foreground focus-visible:outline-none disabled:opacity-60 ${
            error ? "border-destructive" : "border-border focus:border-accent"
          }`}
        />
        {error && (
          <p id={errorId} role="alert" className="mt-1 text-fine-print text-destructive">
            {error}
          </p>
        )}
        <div
          className={`flex items-center justify-between gap-2 overflow-hidden transition-all duration-enter ${
            engaged ? "mt-2 max-h-12 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <span
            id={countId}
            className={`tabular text-fine-print ${remaining < 0 ? "text-destructive" : remaining < 50 ? "text-warning" : "text-muted-foreground"}`}
          >
            {value.length}/{COMMENT_MAX}
          </span>
          <div className="flex gap-1.5">
            <Button
              size="small"
              onClick={() => {
                setFocused(false);
                if (onCancel) onCancel();
                else onChange("");
              }}
              disabled={submitting}
              tabIndex={engaged ? 0 : -1}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="small"
              variant="contained"
              loading={submitting}
              disabled={!value.trim()}
              tabIndex={engaged ? 0 : -1}
              className="!rounded-full"
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
