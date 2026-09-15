import Button from "../components/Button";
import Skeleton from "@mui/material/Skeleton";
import { useListHistoryQuery, useClearHistoryMutation } from "../store/api/historyApi";
import { notifyApiError, notifySuccess } from "../lib/toast";
import VideoGrid from "../components/VideoGrid";
import { VideoGridSkeleton } from "../components/VideoCardSkeleton";
import ErrorState from "../components/ErrorState";

export default function History() {
  const { data: videos = [], isLoading: loading, isError: hasError, refetch } = useListHistoryQuery();
  const [clearHistory] = useClearHistoryMutation();

  const handleClear = async () => {
    try {
      await clearHistory().unwrap();
      notifySuccess("Watch history cleared.");
    } catch (err) {
      notifyApiError(err);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton variant="text" sx={{ fontSize: "1.5rem" }} width={220} />
        </div>
        <VideoGridSkeleton />
      </div>
    );
  }

  if (hasError) {
    return <ErrorState message="We couldn't load your watch history. Please try again." onRetry={refetch} />;
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Watch History</h1>
        {videos.length > 0 && (
          <Button size="small" color="error" onClick={handleClear}>
            Clear all
          </Button>
        )}
      </div>
      <VideoGrid videos={videos} emptyMessage="You haven't watched any videos yet." />
    </div>
  );
}
