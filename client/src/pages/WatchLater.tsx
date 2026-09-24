import { Link } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import { BookmarkSimple } from "@phosphor-icons/react";
import { useListSavedQuery } from "../store/api/savedApi";
import Button from "../components/Button";
import VideoGrid from "../components/VideoGrid";
import { VideoGridSkeleton } from "../components/VideoCardSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";

export default function WatchLater() {
  const { data: videos = [], isLoading: loading, isError: hasError, refetch } = useListSavedQuery();

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-md pb-16 pt-lg sm:px-lg" aria-busy>
        <Skeleton variant="text" sx={{ fontSize: "28px" }} width={200} className="mb-lg" />
        <VideoGridSkeleton />
      </div>
    );
  }

  if (hasError) {
    return <ErrorState message="We couldn't load your saved videos. Please try again." onRetry={refetch} />;
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-md pb-16 pt-lg sm:px-lg">
      <PageHeader
        icon={BookmarkSimple}
        title="Watch later"
        description={videos.length > 0 ? `${videos.length} saved ${videos.length === 1 ? "video" : "videos"}` : undefined}
      />
      {videos.length === 0 ? (
        <EmptyState
          icon={BookmarkSimple}
          title="No saved videos"
          message="Tap Save on any video to keep it here for later."
          action={
            <Button component={Link} to="/" variant="contained">
              Find something to watch
            </Button>
          }
        />
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}
