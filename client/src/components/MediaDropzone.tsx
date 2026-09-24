import { useEffect, useId, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { FilmStrip, ImageSquare, UploadSimple, X, ArrowsClockwise, WarningCircle } from "@phosphor-icons/react";

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
  const errorId = useId();
  const helpId = useId();
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
    <div className="flex flex-col gap-xs">
      <label htmlFor={inputId} className="text-caption-strong text-foreground">
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
        <div className="flex animate-fade-in items-center gap-sm rounded-lg border border-border bg-card p-sm">
          {kind === "image" && previewUrl ? (
            <img
              src={previewUrl}
              alt="Thumbnail preview"
              className="aspect-video h-16 shrink-0 rounded-md object-cover ring-1 ring-inset ring-border"
            />
          ) : kind === "video" && previewUrl ? (
            <video
              src={previewUrl}
              muted
              preload="metadata"
              className="aspect-video h-16 shrink-0 rounded-md bg-scrim object-cover"
            />
          ) : (
            <div className="flex aspect-video h-16 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <FilmStrip size={24} aria-hidden />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-caption-strong text-foreground">{value.name}</p>
            <p className="tabular text-fine-print text-muted-foreground">
              {formatFileSize(value.size)} · {value.type || kind}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-xs">
            <button
              type="button"
              onClick={openPicker}
              disabled={disabled}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-button-utility text-accent transition-colors duration-fast hover:bg-accent-soft disabled:opacity-50"
            >
              <ArrowsClockwise size={16} aria-hidden />
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              aria-label="Remove file"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors duration-fast hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={`Upload ${label}`}
          aria-describedby={[helperText ? helpId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined}
          aria-invalid={!!error}
          onClick={openPicker}
          onKeyDown={handleKeyDown}
          onDragEnter={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            e.preventDefault();
            // Ignore leave events fired when moving over the zone's own children.
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsDragging(false);
          }}
          onDrop={handleDrop}
          className={`group/drop relative flex cursor-pointer flex-col items-center justify-center gap-xs rounded-lg border-2 border-dashed text-center transition-all duration-enter ${
            size === "lg" ? "min-h-[300px] p-xl" : "min-h-[140px] p-lg"
          } ${disabled ? "cursor-not-allowed opacity-50" : ""} ${
            isDragging
              ? "scale-[1.01] border-accent bg-accent-soft shadow-glow-accent"
              : error
                ? "border-destructive/60 bg-destructive/5"
                : "border-border bg-muted/40 hover:border-accent/60 hover:bg-muted/70"
          }`}
        >
          <span
            className={`flex items-center justify-center rounded-xl transition-colors duration-enter ${
              size === "lg" ? "h-16 w-16" : "h-12 w-12"
            } ${isDragging ? "bg-accent-strong text-on-accent" : "bg-card text-accent ring-1 ring-inset ring-border group-hover/drop:ring-accent/40"}`}
            aria-hidden
          >
            {isDragging ? (
              <UploadSimple size={size === "lg" ? 30 : 22} weight="bold" />
            ) : kind === "video" ? (
              <FilmStrip size={size === "lg" ? 30 : 22} weight="duotone" />
            ) : (
              <ImageSquare size={size === "lg" ? 30 : 22} weight="duotone" />
            )}
          </span>
          <p className={size === "lg" ? "text-body-strong text-foreground" : "text-caption-strong text-foreground"}>
            {isDragging ? (
              "Drop to upload"
            ) : (
              <>
                <span className="text-accent">Click to upload</span> or drag and drop
              </>
            )}
          </p>
          {helperText && (
            <p id={helpId} className="text-fine-print text-muted-foreground">
              {helperText}
            </p>
          )}
        </div>
      )}

      {error && (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-fine-print text-destructive">
          <WarningCircle size={14} weight="fill" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
