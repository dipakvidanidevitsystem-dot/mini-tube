import { Link } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import { Play, WarningCircle } from "@phosphor-icons/react";
import type { Video } from "../types";
import { formatDate, formatDuration } from "../lib/format";
import OverflowTooltip from "./OverflowTooltip";

export default function VideoCard({
  video,
  showAvatar = true,
  showCreatorName = true,
  showDetails = true,
  isFeatured = false,
}: {
  video: Video;
  showAvatar?: boolean;
  showCreatorName?: boolean;
  showDetails?: boolean;
  isFeatured?: boolean;
}) {
  return (
    <Link to={`/watch/${video.id}`} className="block group">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/60 bg-muted transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md dark:border-border-dark/60 dark:bg-muted-dark">
        {video.thumbnailUrl && (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="h-full w-full object-cover group-hover:opacity-90"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.style.visibility = "hidden";
            }}
          />
        )}
        {video.processingStatus === "ready" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/20 group-hover:opacity-100">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-primary shadow-md">
              <Play size={22} weight="fill" />
            </span>
          </div>
        )}
        {video.processingStatus === "pending" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 text-white">
            <CircularProgress size={20} sx={{ color: "inherit" }} />
            <span className="text-xs font-medium">Processing…</span>
          </div>
        )}
        {video.processingStatus === "failed" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 text-white">
            <WarningCircle size={20} weight="fill" />
            <span className="text-xs font-medium">Processing failed</span>
          </div>
        )}
        {video.visibility === "private" && (
          <span className="absolute right-2 top-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
            Private
          </span>
        )}
        {isFeatured && (
          <span className="absolute left-2 top-2 rounded bg-white/90 px-2 py-0.5 text-xs font-semibold text-primary shadow-sm">
            Featured
          </span>
        )}
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {formatDuration(video.duration)}
        </span>
      </div>
      {showDetails && (
        <div className="mt-2 flex gap-2">
          {showAvatar && (
            <Avatar
              src={video.creatorImage || undefined}
              sx={{ width: 36, height: 36 }}
              className="mt-0.5 shrink-0"
            >
              {video.creatorName?.[0]?.toUpperCase()}
            </Avatar>
          )}
          <div className="min-w-0 flex-1">
            <OverflowTooltip
              component="h3"
              lines={2}
              className="text-body-strong text-foreground dark:text-foreground-dark"
              title={video.title}
            >
              {video.title}
            </OverflowTooltip>
            {showCreatorName && (
              <OverflowTooltip
                component="p"
                lines={1}
                className="text-caption text-foreground dark:text-foreground-dark"
                title={video.creatorName}
              >
                {video.creatorName}
              </OverflowTooltip>
            )}
            <p className="text-fine-print text-muted-foreground dark:text-muted-foreground-dark">
              {video.views.toLocaleString()} views &middot; {formatDate(video.createdAt)}
            </p>
          </div>
        </div>
      )}
    </Link>
  );
}
