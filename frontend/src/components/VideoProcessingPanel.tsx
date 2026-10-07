import CircularProgress from "@mui/material/CircularProgress";
import Button from "./Button";
import { WarningCircle, FilmSlate } from "@phosphor-icons/react";

export function VideoProcessingPanel({ thumbnailUrl }: { thumbnailUrl?: string | null }) {
  return (
    <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-lg bg-muted text-center dark:bg-muted-dark">
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-20 blur-sm"
        />
      )}
      <div className="relative flex flex-col items-center gap-3 px-6">
        <CircularProgress size={36} />
        <div className="flex items-center gap-2 text-foreground dark:text-foreground-dark">
          <FilmSlate size={20} />
          <p className="font-medium">Processing your video…</p>
        </div>
        <p className="max-w-sm text-sm text-muted-foreground dark:text-muted-foreground-dark">
          We're optimizing your upload for playback. This usually takes a minute or two — feel free to browse
          elsewhere, we'll let you know the moment it's ready.
        </p>
      </div>
    </div>
  );
}

export function VideoFailedPanel({ message, onRetry }: { message?: string | null; onRetry?: () => void }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg bg-muted text-center dark:bg-muted-dark">
      <div className="flex items-center gap-2 text-destructive dark:text-destructive-dark">
        <WarningCircle size={22} weight="fill" />
        <p className="font-medium">Video processing failed</p>
      </div>
      <p className="max-w-sm text-sm text-muted-foreground dark:text-muted-foreground-dark">
        {message || "Something went wrong while preparing this video. Please try uploading it again."}
      </p>
      {onRetry && (
        <Button variant="outlined" size="small" onClick={onRetry}>
          Refresh status
        </Button>
      )}
    </div>
  );
}
