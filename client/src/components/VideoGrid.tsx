import type { Video } from "../types";
import VideoCard from "./VideoCard";
import EmptyState from "./EmptyState";
import { VIDEO_GRID_CLASS } from "./VideoCardSkeleton";

export default function VideoGrid({
  videos,
  emptyMessage = "No videos to show yet.",
  showAvatar = true,
  showCreatorName = true,
}: {
  videos: Video[];
  emptyMessage?: string;
  showAvatar?: boolean;
  showCreatorName?: boolean;
}) {
  if (videos.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <ul className={VIDEO_GRID_CLASS}>
      {videos.map((video, i) => (
        // Short 30ms stagger on the first rows only; disabled under reduced motion by the global reset.
        <li key={video.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 11) * 30}ms` }}>
          <VideoCard video={video} showAvatar={showAvatar} showCreatorName={showCreatorName} />
        </li>
      ))}
    </ul>
  );
}
