import type { Video } from "../types";
import VideoCard from "./VideoCard";
import EmptyState from "./EmptyState";

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
    <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} showAvatar={showAvatar} showCreatorName={showCreatorName} />
      ))}
    </div>
  );
}
