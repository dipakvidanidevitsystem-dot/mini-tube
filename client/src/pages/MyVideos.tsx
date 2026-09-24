import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import TextField from "../components/TextField";
import Select from "../components/Select";
import Button from "../components/Button";
import Skeleton from "@mui/material/Skeleton";
import { MagnifyingGlass, Trash, UploadSimple, VideoCamera } from "@phosphor-icons/react";
import PageHeader from "../components/PageHeader";
import { useGetChannelQuery, usersApi } from "../store/api/usersApi";
import { useDeleteVideoMutation } from "../store/api/videosApi";
import type { Video } from "../types";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { notifyApiError } from "../lib/toast";
import MyVideoCard from "../components/MyVideoCard";
import UndoToast from "../components/UndoToast";
import { MY_VIDEO_GRID_CLASS, MyVideoGridSkeleton } from "../components/VideoCardSkeleton";
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
      <div className="mx-auto w-full max-w-[1600px] px-md pb-16 pt-lg sm:px-lg" aria-busy>
        <div className="mb-lg flex items-center justify-between">
          <Skeleton variant="text" width={200} sx={{ fontSize: "28px" }} />
          <Skeleton variant="rounded" width={140} height={40} />
        </div>
        <Skeleton variant="rounded" height={44} className="mb-lg" />
        <MyVideoGridSkeleton />
      </div>
    );
  }

  if (hasError) {
    return <ErrorState message="We couldn't load your videos. Please try again." onRetry={refetch} />;
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-md pb-16 pt-lg sm:px-lg">
      <PageHeader
        icon={VideoCamera}
        title="My videos"
        description={`${videos.length} ${videos.length === 1 ? "video" : "videos"} on your channel`}
        actions={
          <Button component={Link} to="/upload" variant="contained" startIcon={<UploadSimple size={18} weight="bold" />}>
            Upload
          </Button>
        }
      />

      {videos.length > 0 && (
        <div className="mb-lg flex flex-col gap-sm sm:flex-row sm:items-center">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">Search your videos</span>
            <MagnifyingGlass
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search your videos"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-full border border-border bg-muted/60 pl-10 pr-4 text-caption text-foreground outline-none transition-colors duration-fast placeholder:text-muted-foreground focus:border-ring focus:bg-card"
            />
          </label>
          <div className="flex items-center gap-sm">
            {search && (
              <span className="tabular text-caption text-muted-foreground" role="status">
                {visibleVideos.length} {visibleVideos.length === 1 ? "match" : "matches"}
              </span>
            )}
            <Select
              dense
              size="small"
              value={sort}
              onChange={(e) => setSort(e.target.value as "recent" | "views")}
              options={[
                { value: "recent", label: "Recently added" },
                { value: "views", label: "Most viewed" },
              ]}
              slotProps={{ htmlInput: { "aria-label": "Sort videos" } }}
            />
          </div>
        </div>
      )}

      {videos.length === 0 ? (
        <EmptyState
          title="Your channel is ready"
          message="You haven't uploaded any videos yet. Your uploads will appear here."
          action={
            <Button component={Link} to="/upload" variant="contained" startIcon={<UploadSimple size={18} weight="bold" />}>
              Upload your first video
            </Button>
          }
        />
      ) : visibleVideos.length === 0 ? (
        <EmptyState icon={MagnifyingGlass} message="No videos match your search." />
      ) : (
        <ul className={MY_VIDEO_GRID_CLASS}>
          {visibleVideos.map((video, i) => (
            <li key={video.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 11) * 30}ms` }}>
              <MyVideoCard video={video} onDeleteClick={openDeleteDialog} />
            </li>
          ))}
        </ul>
      )}

      <Dialog open={pendingDelete !== null} onClose={closeDeleteDialog} fullWidth maxWidth="sm">
        <DialogTitle className="flex items-center gap-2">
          <Trash size={20} className="text-destructive" aria-hidden />
          Delete this video?
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div" className="!text-caption">
            <p>
              You&apos;ll have 10 seconds to undo. After that, the video, its comments and stats are removed permanently.
            </p>
            <p className="mt-sm">
              Type <strong className="text-foreground">{pendingDelete?.title}</strong> to confirm.
            </p>
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            className="!mt-md"
            label="Video title"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canConfirmDelete && handleConfirmDelete()}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete} disabled={!canConfirmDelete}>
            Delete video
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
