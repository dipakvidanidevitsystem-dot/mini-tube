import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import TextField from "../components/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Select from "../components/Select";
import Button from "../components/Button";
import Skeleton from "@mui/material/Skeleton";
import { MagnifyingGlass, VideoCamera } from "@phosphor-icons/react";
import { useGetChannelQuery, usersApi } from "../store/api/usersApi";
import { useDeleteVideoMutation } from "../store/api/videosApi";
import type { Video } from "../types";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { notifyApiError } from "../lib/toast";
import MyVideoCard from "../components/MyVideoCard";
import UndoToast from "../components/UndoToast";
import { MyVideoGridSkeleton } from "../components/VideoCardSkeleton";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

export default function MyVideos() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const {
    data: channel,
    isLoading: loading,
    isError: hasError,
    refetch,
  } = useGetChannelQuery(user?.id ?? 0, { skip: !user });
  const [deleteVideo] = useDeleteVideoMutation();
  const videos = channel?.videos ?? [];

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "views">("recent");

  const visibleVideos = useMemo(() => {
    const query = search.trim().toLowerCase();
    return videos
      .filter((v) => (query ? v.title.toLowerCase().includes(query) : true))
      .sort((a, b) =>
        sort === "views"
          ? b.views - a.views
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [videos, search, sort]);

  const [pendingDelete, setPendingDelete] = useState<Video | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const pendingDeletions = useRef(new Map<number, { undo: () => void }>());

  const openDeleteDialog = (video: Video) => {
    setPendingDelete(video);
    setConfirmText("");
  };

  const closeDeleteDialog = () => {
    setPendingDelete(null);
    setConfirmText("");
  };

  const handleUndo = (videoId: number, toastId: string) => {
    const patchResult = pendingDeletions.current.get(videoId);
    pendingDeletions.current.delete(videoId);
    toast.dismiss(toastId);
    patchResult?.undo();
  };

  const handleExpire = (videoId: number, toastId: string) => {
    const patchResult = pendingDeletions.current.get(videoId);
    pendingDeletions.current.delete(videoId);
    toast.dismiss(toastId);
    if (!patchResult) return;

    deleteVideo(videoId)
      .unwrap()
      .catch((err) => {
        patchResult.undo();
        notifyApiError(err);
      });
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete || !user) return;
    const video = pendingDelete;
    closeDeleteDialog();

    const patchResult = dispatch(
      usersApi.util.updateQueryData("getChannel", user.id, (draft) => {
        draft.videos = draft.videos.filter((v) => v.id !== video.id);
      })
    );
    pendingDeletions.current.set(video.id, patchResult);

    const toastId = `undo-delete-${video.id}`;
    toast.custom(
      (t) => (
        <UndoToast
          toast={t}
          message={`"${video.title}" deleted.`}
          seconds={10}
          onUndo={() => handleUndo(video.id, t.id)}
          onExpire={() => handleExpire(video.id, t.id)}
        />
      ),
      { id: toastId, duration: Infinity }
    );
  };

  const canConfirmDelete = pendingDelete !== null && confirmText.trim() === pendingDelete.title;

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-md sm:p-lg">
        <div className="mb-lg flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <Skeleton variant="text" width={180} sx={{ fontSize: "2.125rem" }} />
            <Skeleton variant="rounded" width={140} height={36} />
          </div>
          <Skeleton variant="rounded" height={44} />
        </div>
        <MyVideoGridSkeleton />
      </div>
    );
  }

  if (hasError) {
    return <ErrorState message="We couldn't load your videos. Please try again." onRetry={refetch} />;
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-md sm:p-lg">
      <div className="mb-lg flex flex-col gap-md">
        <div className="flex flex-wrap items-center justify-between gap-sm">
          <div className="flex items-baseline gap-sm">
            <h1 className="text-display-md text-foreground dark:text-foreground-dark">My Videos</h1>
            <span className="text-caption text-muted-foreground dark:text-muted-foreground-dark">
              &middot; {videos.length} {videos.length === 1 ? "video" : "videos"}
            </span>
          </div>
          {videos.length > 0 && (
            <Select
              size="small"
              value={sort}
              onChange={(e) => setSort(e.target.value as "recent" | "views")}
              className="min-w-[170px]"
              options={[
                { value: "recent", label: "Recently added" },
                { value: "views", label: "Most viewed" },
              ]}
            />
          )}
        </div>

        {videos.length > 0 && (
          <TextField
            size="small"
            placeholder="Search your videos"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MagnifyingGlass size={18} />
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      </div>

      {videos.length === 0 ? (
        <EmptyState
          message="You haven't uploaded any videos yet."
          action={
            <Button
              component={Link}
              to="/upload"
              variant="contained"
              startIcon={<VideoCamera size={18} weight="bold" />}
            >
              Upload your first video
            </Button>
          }
        />
      ) : visibleVideos.length === 0 ? (
        <EmptyState message="No videos match your search." />
      ) : (
        <div className="grid gap-lg [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {visibleVideos.map((video) => (
            <MyVideoCard key={video.id} video={video} onDeleteClick={openDeleteDialog} />
          ))}
        </div>
      )}

      <Dialog open={pendingDelete !== null} onClose={closeDeleteDialog} fullWidth maxWidth="sm">
        <DialogTitle>Delete this video?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This cannot be undone once the countdown ends. To confirm, type the exact video title:{" "}
            <strong>{pendingDelete?.title}</strong>
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            className="mt-4"
            placeholder="Enter the video title"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDelete} disabled={!canConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
