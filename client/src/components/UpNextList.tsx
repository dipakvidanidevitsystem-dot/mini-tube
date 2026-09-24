import { Link } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import type { Video } from "../types";
import { formatDuration, formatViews } from "../lib/format";
import dayjs from "../lib/dayjs";
import OverflowTooltip from "./OverflowTooltip";

/** Compact horizontal video rows for the watch page's side rail (stacks below the player on small screens). */
export default function UpNextList({ videos, loading }: { videos: Video[]; loading?: boolean }) {
  return (
    <aside aria-labelledby="up-next-heading">
      <h2 id="up-next-heading" className="mb-sm text-body-strong text-foreground">
        Up next
      </h2>

      {loading ? (
        <ul className="flex flex-col gap-sm" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex gap-sm">
              <Skeleton variant="rounded" className="!aspect-video !h-auto w-40 shrink-0 !rounded-md" />
              <div className="flex-1">
                <Skeleton variant="text" width="95%" />
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" width="45%" />
              </div>
            </li>
          ))}
        </ul>
      ) : videos.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-md text-caption text-muted-foreground">
          More videos will appear here as creators upload.
        </p>
      ) : (
        <ul className="flex flex-col gap-xs">
          {videos.map((video) => (
            <li key={video.id}>
              <Link
                to={`/watch/${video.id}`}
                className="group -mx-1.5 flex gap-sm rounded-md p-1.5 transition-colors duration-fast hover:bg-muted"
              >
                <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-inset ring-border/60">
                  {video.thumbnailUrl && (
                    <img
                      src={video.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-enter ease-out group-hover:scale-[1.04]"
                    />
                  )}
                  <span className="tabular absolute bottom-1 right-1 rounded-sm bg-scrim/75 px-1 py-px text-[11px] font-semibold text-on-scrim">
                    {formatDuration(video.duration)}
                  </span>
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <OverflowTooltip
                    component="h3"
                    lines={2}
                    title={video.title}
                    className="text-caption-strong text-foreground transition-colors duration-fast group-hover:text-accent"
                  >
                    {video.title}
                  </OverflowTooltip>
                  <p className="mt-1 truncate text-fine-print text-muted-foreground">{video.creatorName}</p>
                  <p className="tabular text-fine-print text-muted-foreground">
                    {formatViews(video.views)} · {dayjs(video.createdAt).fromNow()}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
