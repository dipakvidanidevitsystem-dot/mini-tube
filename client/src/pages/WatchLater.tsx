import Skeleton from "@mui/material/Skeleton";
import { useListSavedQuery } from "../store/api/savedApi";
import VideoGrid from "../components/VideoGrid";
import { VideoGridSkeleton } from "../components/VideoCardSkeleton";
import ErrorState from "../components/ErrorState";

export default function WatchLater() {
  const { data: videos = [], isLoading: loading, isError: hasError, refetch } = useListSavedQuery();

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton variant="text" sx={{ fontSize: "1.5rem" }} width={180} className="mb-4" />
        <VideoGridSkeleton />
      </div>
    );
  }

  if (hasError) {
    return <ErrorState message="We couldn't load your saved videos. Please try again." onRetry={refetch} />;
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">Watch Later</h1>
      <VideoGrid videos={videos} emptyMessage="You haven't saved any videos yet." />
    </div>
  );
}
