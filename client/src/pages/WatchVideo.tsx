import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "../components/TextField";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import { ThumbsUp, BookmarkSimple, ShareNetwork, Flag, DotsThreeVertical } from "@phosphor-icons/react";
import {
  useGetVideoQuery,
  useToggleLikeMutation,
  useReportVideoMutation,
  useReportWatchProgressMutation,
  videosApi,
} from "../store/api/videosApi";
import { commentsApi } from "../store/api/commentsApi";
import { useGetChannelQuery, useToggleSubscribeMutation } from "../store/api/usersApi";
import { useRecordViewMutation } from "../store/api/historyApi";
import { useListSavedQuery, useToggleSavedMutation } from "../store/api/savedApi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { notifyApiError, notifySuccess } from "../lib/toast";
import { formatDate } from "../lib/format";
import { getSocket } from "../store/socket";
import VideoPlayer from "../components/VideoPlayer";
import CommentList from "../components/CommentList";
import Loading from "../components/Loading";
import ErrorState from "../components/ErrorState";
import { VideoProcessingPanel, VideoFailedPanel } from "../components/VideoProcessingPanel";
import type { Comment } from "../types";

export default function WatchVideo() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const {
    data: video,
    isLoading: videoLoading,
    isError,
    refetch,
  } = useGetVideoQuery(id!, { skip: !id });
  const { data: channel } = useGetChannelQuery(video?.userId ?? 0, { skip: !video });
  const { data: savedRows } = useListSavedQuery(undefined, { skip: !user });
  const saved = !!savedRows?.some((v) => String(v.id) === String(id));

  const [toggleLike] = useToggleLikeMutation();
  const [toggleSaved] = useToggleSavedMutation();
  const [toggleSubscribe] = useToggleSubscribeMutation();
  const [recordView] = useRecordViewMutation();
  const [reportVideo] = useReportVideoMutation();
  const [reportWatchProgress] = useReportWatchProgressMutation();

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [moreAnchorEl, setMoreAnchorEl] = useState<HTMLElement | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [canExpandDesc, setCanExpandDesc] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!id || !user) return;
    recordView(id).catch(() => {
      // non-blocking: history is a convenience feature, not critical to watching
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  useEffect(() => {
    if (!id) return;
    const videoIdNum = Number(id);
    const socket = getSocket();

    socket.emit("join-video", videoIdNum);

    const onViewUpdated = (payload: { videoId: number; views: number }) => {
      if (payload.videoId !== videoIdNum) return;
      dispatch(
        videosApi.util.updateQueryData("getVideo", id, (draft) => {
          draft.views = payload.views;
        })
      );
    };

    const onLikeUpdated = (payload: { videoId: number; likeCount: number }) => {
      if (payload.videoId !== videoIdNum) return;
      dispatch(
        videosApi.util.updateQueryData("getVideo", id, (draft) => {
          draft.likeCount = payload.likeCount;
        })
      );
    };

    const onCommentAdded = (payload: Comment & { videoId: number }) => {
      if (payload.videoId !== videoIdNum) return;
      dispatch(
        commentsApi.util.updateQueryData("listComments", id, (draft) => {
          if (draft.some((c) => c.id === payload.id)) return;
          draft.unshift(payload);
        })
      );
    };

    const onCommentLikeUpdated = (payload: { commentId: number; likeCount: number }) => {
      dispatch(
        commentsApi.util.updateQueryData("listComments", id, (draft) => {
          const target = draft.find((c) => c.id === payload.commentId);
          if (target) target.likeCount = payload.likeCount;
        })
      );
    };

    socket.on("view-updated", onViewUpdated);
    socket.on("like-updated", onLikeUpdated);
    socket.on("comment-added", onCommentAdded);
    socket.on("comment-like-updated", onCommentLikeUpdated);

    return () => {
      socket.emit("leave-video", videoIdNum);
      socket.off("view-updated", onViewUpdated);
      socket.off("like-updated", onLikeUpdated);
      socket.off("comment-added", onCommentAdded);
      socket.off("comment-like-updated", onCommentLikeUpdated);
    };
  }, [id, dispatch]);

  useLayoutEffect(() => {
    const el = descRef.current;
    if (!el) return;
    setDescExpanded(false);
    setCanExpandDesc(el.scrollHeight > el.clientHeight);
  }, [video?.description]);

  const handleProgress = useCallback(
    (seconds: number) => {
      if (!id || !video?.videoViewId || seconds <= 0) return;
      reportWatchProgress({ id, videoViewId: video.videoViewId, seconds }).catch(() => {
        // best-effort telemetry: watch-time is a KPI, not required for playback
      });
    },
    [id, video?.videoViewId, reportWatchProgress]
  );

  const handleUnload = useCallback(
    (seconds: number) => {
      if (!id || !video?.videoViewId || seconds <= 0 || !navigator.sendBeacon) return;
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const blob = new Blob([JSON.stringify({ videoViewId: video.videoViewId, seconds })], {
        type: "application/json",
      });
      navigator.sendBeacon(`${baseUrl}/videos/${id}/watch-progress`, blob);
    },
    [id, video?.videoViewId]
  );

  const handleLike = async () => {
    if (!id) return;
    try {
      await toggleLike(id).unwrap();
    } catch (err) {
      notifyApiError(err);
    }
  };

  const handleToggleSaved = async () => {
    if (!id) return;
    try {
      const result = await toggleSaved(id).unwrap();
      notifySuccess(result.saved ? "Saved to Watch Later." : "Removed from Watch Later.");
    } catch (err) {
      notifyApiError(err);
    }
  };

  const handleSubscribe = async () => {
    if (!channel) return;
    try {
      await toggleSubscribe(channel.id).unwrap();
    } catch (err) {
      notifyApiError(err);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: video?.title, url: shareUrl });
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          notifyApiError(err);
        }
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      notifySuccess("Link copied to clipboard.");
    } catch {
      notifyApiError(new Error("Couldn't copy the link. Please copy it from the address bar."));
    }
  };

  const handleReportSubmit = async () => {
    if (!id || !reportReason.trim()) return;
    setReportSubmitting(true);
    try {
      await reportVideo({ id, reason: reportReason.trim() }).unwrap();
      notifySuccess("Report submitted. Thank you for helping keep MiniTube safe.");
      setReportOpen(false);
      setReportReason("");
    } catch (err) {
      notifyApiError(err);
    } finally {
      setReportSubmitting(false);
    }
  };

  if (videoLoading) return <Loading />;

  if (isError) {
    return (
      <ErrorState
        message="We couldn't load this video. It may have been removed, or the connection may be down."
        onRetry={refetch}
      />
    );
  }

  if (!video) return null;

  return (
    <div className="mx-auto max-w-4xl py-md">
      <div className="px-0 sm:px-md">
        {video.processingStatus === "pending" && <VideoProcessingPanel thumbnailUrl={video.thumbnailUrl} />}
        {video.processingStatus === "failed" && (
          <VideoFailedPanel message={video.processingError} onRetry={refetch} />
        )}
        {video.processingStatus === "ready" && (
          <VideoPlayer
            src={video.videoUrl}
            poster={video.thumbnailUrl}
            onProgress={handleProgress}
            onUnload={handleUnload}
          />
        )}
      </div>

      <div className="px-md">
        <h1 className="mt-md text-tagline">{video.title}</h1>

        {video.processingStatus !== "ready" && (
          <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground-dark">
            {video.processingStatus === "pending"
              ? "Likes, comments and sharing will unlock once processing finishes."
              : "This video couldn't be processed."}
          </p>
        )}

        {video.processingStatus === "ready" && (
          <>
            <p className="mt-xxs text-caption text-muted-foreground dark:text-muted-foreground-dark">
              {video.views.toLocaleString()} views · {formatDate(video.createdAt)}
            </p>

            <div className="mt-sm flex items-center gap-xs">
              {user && (
                <Button
                  startIcon={<ThumbsUp size={18} weight={video.isLiked ? "fill" : "regular"} />}
                  color={video.isLiked ? "primary" : "inherit"}
                  onClick={handleLike}
                >
                  {video.likeCount}
                </Button>
              )}
              {user && (
                <Button
                  startIcon={<BookmarkSimple size={18} weight={saved ? "fill" : "regular"} />}
                  color={saved ? "primary" : "inherit"}
                  onClick={handleToggleSaved}
                >
                  Save
                </Button>
              )}
              <Button startIcon={<ShareNetwork size={18} />} color="inherit" onClick={handleShare}>
                Share
              </Button>
              {user && (
                <>
                  <IconButton aria-label="more options" onClick={(e) => setMoreAnchorEl(e.currentTarget)}>
                    <DotsThreeVertical size={20} weight="bold" />
                  </IconButton>
                  <Menu anchorEl={moreAnchorEl} open={!!moreAnchorEl} onClose={() => setMoreAnchorEl(null)}>
                    <MenuItem
                      onClick={() => {
                        setMoreAnchorEl(null);
                        setReportOpen(true);
                      }}
                    >
                      <Flag size={18} style={{ marginRight: 8 }} /> Report
                    </MenuItem>
                  </Menu>
                </>
              )}
            </div>

            {channel && (
              <div className="mt-md flex items-center justify-between border-y border-border py-sm dark:border-border-dark">
                <Link to={`/channel/${channel.id}`} className="flex min-w-0 items-center gap-sm">
                  <Avatar src={channel.profileImage || undefined} sx={{ width: 40, height: 40 }}>
                    {channel.name?.[0]?.toUpperCase()}
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-caption-strong">{channel.name}</p>
                    <p className="text-caption text-muted-foreground dark:text-muted-foreground-dark">
                      {channel.subscriberCount.toLocaleString()} subscribers
                    </p>
                  </div>
                </Link>
                {user && user.id !== channel.id && (
                  <Button
                    variant={channel.isSubscribed ? "outlined" : "contained"}
                    onClick={handleSubscribe}
                  >
                    {channel.isSubscribed ? "Subscribed" : "Subscribe"}
                  </Button>
                )}
              </div>
            )}

            {video.description && (
              <div className="mt-md">
                <p className="text-caption-strong">Description</p>
                <p
                  ref={descRef}
                  className={`mt-xxs whitespace-pre-line text-caption text-foreground dark:text-foreground-dark ${
                    descExpanded ? "" : "line-clamp-3"
                  }`}
                >
                  {video.description}
                </p>
                {canExpandDesc && (
                  <button
                    type="button"
                    onClick={() => setDescExpanded((v) => !v)}
                    className="mt-xs text-caption-strong text-muted-foreground hover:text-foreground dark:text-muted-foreground-dark dark:hover:text-foreground-dark"
                  >
                    {descExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
            )}

            <div className="mt-lg">
              <CommentList videoId={video.id} />
            </div>
          </>
        )}
      </div>

      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Report this video</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            placeholder="Tell us why you're reporting this video"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            disabled={reportSubmitting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportOpen(false)} disabled={reportSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReportSubmit}
            disabled={reportSubmitting || !reportReason.trim()}
          >
            {reportSubmitting ? "Submitting..." : "Submit report"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
