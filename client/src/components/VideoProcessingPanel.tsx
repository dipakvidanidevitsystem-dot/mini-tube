import Button from "./Button";
import { WarningCircle, FilmSlate, ArrowClockwise } from "@phosphor-icons/react";

export function VideoProcessingPanel({ thumbnailUrl }: { thumbnailUrl?: string | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-scrim text-center text-on-scrim ring-1 ring-inset ring-border"
    >
      {thumbnailUrl && (
        <img src={thumbnailUrl} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-md" />
      )}
      <div className="relative flex max-w-md flex-col items-center gap-sm px-6">
        <span className="relative flex h-14 w-14 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent/25 motion-reduce:hidden" aria-hidden />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent-strong text-on-accent">
            <FilmSlate size={26} weight="duotone" aria-hidden />
          </span>
        </span>
        <p className="text-body-strong">Processing your video…</p>
        <div className="h-1 w-48 overflow-hidden rounded-full bg-on-scrim/20" aria-hidden>
          <div className="h-full w-1/3 animate-[progress-indeterminate_1.4s_ease-in-out_infinite] rounded-full bg-info motion-reduce:w-full motion-reduce:animate-none" />
        </div>
        <p className="text-caption opacity-80">
          We're optimizing your upload for playback. This usually takes a minute or two. Feel free to browse elsewhere;
          we'll notify you the moment it's ready.
        </p>
      </div>
    </div>
  );
}

export function VideoFailedPanel({ message, onRetry }: { message?: string | null; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex aspect-video w-full flex-col items-center justify-center gap-sm rounded-lg bg-card px-6 text-center ring-1 ring-inset ring-destructive/30"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <WarningCircle size={28} weight="fill" aria-hidden />
      </span>
      <p className="text-body-strong text-foreground">Video processing failed</p>
      <p className="max-w-sm text-caption text-muted-foreground">
        {message || "Something went wrong while preparing this video. Please try uploading it again."}
      </p>
      {onRetry && (
        <Button variant="outlined" size="small" onClick={onRetry} startIcon={<ArrowClockwise size={16} />}>
          Refresh status
        </Button>
      )}
    </div>
  );
}
