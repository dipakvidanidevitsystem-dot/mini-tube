import { useState } from "react";
import { Link } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Skeleton from "@mui/material/Skeleton";
import { ClockCounterClockwise, Trash } from "@phosphor-icons/react";
import Button from "../components/Button";
import { useListHistoryQuery, useClearHistoryMutation } from "../store/api/historyApi";
import { notifyApiError, notifySuccess } from "../lib/toast";
import VideoGrid from "../components/VideoGrid";
import { VideoGridSkeleton } from "../components/VideoCardSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";

export default function History() {
  const { data: videos = [], isLoading: loading, isError: hasError, refetch } = useListHistoryQuery();
  const [clearHistory, { isLoading: clearing }] = useClearHistoryMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleClear = async () => {
    try {
      await clearHistory().unwrap();
      notifySuccess("Watch history cleared.");
      setConfirmOpen(false);
    } catch (err) {
      notifyApiError(err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-md pb-16 pt-lg sm:px-lg" aria-busy>
        <Skeleton variant="text" sx={{ fontSize: "28px" }} width={220} className="mb-lg" />
        <VideoGridSkeleton />
      </div>
    );
  }

  if (hasError) {
    return <ErrorState message="We couldn't load your watch history. Please try again." onRetry={refetch} />;
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-md pb-16 pt-lg sm:px-lg">
      <PageHeader
        icon={ClockCounterClockwise}
        title="Watch history"
        description={videos.length > 0 ? `${videos.length} ${videos.length === 1 ? "video" : "videos"} watched` : undefined}
        actions={
          videos.length > 0 && (
            <Button variant="outlined" color="error" size="small" startIcon={<Trash size={16} />} onClick={() => setConfirmOpen(true)}>
              Clear history
            </Button>
          )
        }
      />

      {videos.length === 0 ? (
        <EmptyState
          icon={ClockCounterClockwise}
          title="Nothing here yet"
          message="Videos you watch will show up here so you can find them again."
          action={
            <Button component={Link} to="/" variant="contained">
              Browse videos
            </Button>
          }
        />
      ) : (
        <VideoGrid videos={videos} />
      )}

      <Dialog open={confirmOpen} onClose={() => !clearing && setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Clear watch history?</DialogTitle>
        <DialogContent>
          <DialogContentText className="!text-caption">
            This removes every video from your history. It can&apos;t be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmOpen(false)} disabled={clearing}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleClear} loading={clearing}>
            Clear history
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
