import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import { LockSimple, Play, Sparkle, WarningCircle } from "@phosphor-icons/react";
import type { Video } from "../types";
import { formatDate, formatDuration, formatViews } from "../lib/format";
import dayjs from "../lib/dayjs";
import OverflowTooltip from "./OverflowTooltip";

/** Dark scrim chip used on top of thumbnails; always scrim/on-scrim regardless of theme. */
const OVERLAY_CHIP = "rounded-sm bg-scrim/75 px-1.5 py-0.5 text-fine-print font-semibold text-on-scrim backdrop-blur-sm";

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
  const [imageFailed, setImageFailed] = useState(false);
  const ready = video.processingStatus === "ready";

  return (
    <Link
      to={`/watch/${video.id}`}
      className="group block rounded-lg outline-offset-4"
      aria-label={showDetails ? undefined : video.title}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted ring-1 ring-inset ring-border/60">
        {video.thumbnailUrl && !imageFailed ? (
          <img
            src={video.thumbnailUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-enter ease-out group-hover:scale-[1.03]"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground" aria-hidden>
            <Play size={32} weight="duotone" />
          </div>
        )}

        {ready && (
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-scrim/50 via-transparent to-transparent opacity-0 transition-opacity duration-enter group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            <span className="flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-accent-strong/95 text-on-accent shadow-glow-accent transition-transform duration-enter ease-out group-hover:scale-100">
              <Play size={20} weight="fill" />
            </span>
          </div>
        )}

        {video.processingStatus === "pending" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-scrim/65 text-on-scrim backdrop-blur-[2px]">
            <CircularProgress size={22} sx={{ color: "inherit" }} />
            <span className="text-fine-print font-semibold">Processing…</span>
          </div>
        )}
        {video.processingStatus === "failed" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-scrim/70 text-on-scrim">
            <WarningCircle size={22} weight="fill" className="text-destructive" aria-hidden />
            <span className="text-fine-print font-semibold">Processing failed</span>
          </div>
        )}

        <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-2">
          {isFeatured ? (
            <span className="inline-flex items-center gap-1 rounded-sm bg-accent-strong px-1.5 py-0.5 text-fine-print font-semibold text-on-accent">
              <Sparkle size={12} weight="fill" aria-hidden />
              Featured
            </span>
          ) : (
            <span />
          )}
          {video.visibility === "private" && (
            <span className={`inline-flex items-center gap-1 ${OVERLAY_CHIP}`}>
              <LockSimple size={12} weight="bold" aria-hidden />
              Private
            </span>
          )}
        </div>

        <span className={`tabular absolute bottom-2 right-2 ${OVERLAY_CHIP}`}>{formatDuration(video.duration)}</span>
      </div>

      {showDetails && (
        <div className="mt-sm flex gap-sm">
          {showAvatar && (
            <Avatar src={video.creatorImage || undefined} alt="" sx={{ width: 36, height: 36 }} className="mt-0.5 shrink-0">
              {video.creatorName?.[0]?.toUpperCase()}
            </Avatar>
          )}
          <div className="min-w-0 flex-1">
            <OverflowTooltip
              component="h3"
              lines={2}
              className="text-body-strong text-foreground transition-colors duration-fast group-hover:text-accent"
              title={video.title}
            >
              {video.title}
            </OverflowTooltip>
            {showCreatorName && (
              <OverflowTooltip component="p" lines={1} className="mt-0.5 text-caption text-muted-foreground" title={video.creatorName}>
                {video.creatorName}
              </OverflowTooltip>
            )}
            <p className="tabular mt-0.5 text-fine-print text-muted-foreground">
              <span title={`${video.views.toLocaleString()} views`}>{formatViews(video.views)}</span>
              <span aria-hidden> · </span>
              <time dateTime={video.createdAt} title={formatDate(video.createdAt)}>
                {dayjs(video.createdAt).fromNow()}
              </time>
            </p>
          </div>
        </div>
      )}
    </Link>
  );
}
