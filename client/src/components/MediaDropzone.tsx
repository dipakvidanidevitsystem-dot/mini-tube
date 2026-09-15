import { useEffect, useId, useRef, useState, type DragEvent, type KeyboardEvent } from "react";

interface MediaDropzoneProps {
  kind: "video" | "image";
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  accept: string;
  maxSizeMB?: number;
  helperText?: string;
  disabled?: boolean;
  error?: string;
  size?: "sm" | "lg";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function VideoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2.5" y="5" width="14" height="14" rx="3" />
      <path d="M16.5 10.5 21 8v8l-4.5-2.5" strokeLinejoin="round" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2.5" y="4" width="19" height="16" rx="3" />
      <circle cx="8.5" cy="10" r="1.75" />
      <path d="M21.5 16.5 16 11l-4 4-2.5-2.5-4.5 4.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

export default function MediaDropzone({
  kind,
  label,
  value,
  onChange,
  accept,
  maxSizeMB,
  helperText,
  disabled,
  error: externalError,
  size = "sm",
}: MediaDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [kind, value]);

  const error = externalError || localError;

  const validateAndSet = (file: File) => {
    const mimePrefix = kind === "video" ? "video/" : "image/";
    if (!file.type.startsWith(mimePrefix)) {
      setLocalError(`Please choose a ${kind} file.`);
      return;
    }
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      setLocalError(`File is too large. Max size is ${maxSizeMB}MB.`);
      return;
    }
    setLocalError("");
    onChange(file);
  };

  const handleFiles = (files: FileList | null) => {
    if (disabled || !files || files.length === 0) return;
    validateAndSet(files[0]);
  };

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalError("");
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-xxs">
      <label htmlFor={inputId} className="text-caption-strong text-foreground dark:text-foreground-dark">
        {label}
      </label>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
        className="sr-only"
      />

      {value ? (
        <div className="flex items-center gap-sm rounded-lg border border-border bg-card p-sm dark:border-border-dark dark:bg-card-dark">
          {kind === "image" && previewUrl ? (
            <img
              src={previewUrl}
              alt="Thumbnail preview"
              className="h-14 w-24 shrink-0 rounded-md object-cover"
            />
          ) : kind === "video" && previewUrl ? (
            <video
              src={previewUrl}
              muted
              preload="metadata"
              className="h-14 w-24 shrink-0 rounded-md bg-muted object-cover dark:bg-muted-dark"
            />
          ) : (
            <div className="flex h-14 w-24 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground dark:bg-muted-dark dark:text-muted-foreground-dark">
              <VideoIcon />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-caption-strong text-foreground dark:text-foreground-dark">{value.name}</p>
            <p className="text-fine-print text-muted-foreground dark:text-muted-foreground-dark">
              {formatFileSize(value.size)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-xs">
            <button
              type="button"
              onClick={openPicker}
              disabled={disabled}
              className="rounded-md px-xs py-xxs text-button-utility text-accent hover:bg-muted disabled:opacity-50 dark:hover:bg-muted-dark"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              aria-label="Remove file"
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive disabled:opacity-50 dark:text-muted-foreground-dark dark:hover:bg-muted-dark dark:hover:text-destructive-dark"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={`Upload ${label}`}
          onClick={openPicker}
          onKeyDown={handleKeyDown}
          onDragEnter={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-xxs rounded-lg border-2 border-dashed text-center transition-colors ${
            size === "lg" ? "min-h-[280px] p-xl" : "p-lg"
          } ${disabled ? "cursor-not-allowed opacity-50" : ""} ${
            isDragging
              ? "border-accent bg-accent/5 shadow-glow-accent"
              : "border-border bg-muted/40 hover:border-accent/60 hover:bg-muted dark:border-border-dark dark:bg-muted-dark/40 dark:hover:bg-muted-dark"
          } ${error ? "border-destructive dark:border-destructive-dark" : ""}`}
        >
          <div className={`text-muted-foreground dark:text-muted-foreground-dark ${size === "lg" ? "scale-150" : ""}`}>
            {kind === "video" ? <VideoIcon /> : <ImageIcon />}
          </div>
          <p className={size === "lg" ? "text-body-strong text-foreground dark:text-foreground-dark" : "text-caption-strong text-foreground dark:text-foreground-dark"}>
            <span className="text-accent">Click to upload</span> or drag and drop
          </p>
          {helperText && (
            <p className="text-fine-print text-muted-foreground dark:text-muted-foreground-dark">{helperText}</p>
          )}
        </div>
      )}

      {error && <p className="text-fine-print text-destructive dark:text-destructive-dark">{error}</p>}
    </div>
  );
}
