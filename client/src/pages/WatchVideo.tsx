import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "../components/TextField";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { ThumbsUp, BookmarkSimple, ShareNetwork, Flag, DotsThree, Bell, Check } from "@phosphor-icons/react";
import {
  useGetVideoQuery,
  useToggleLikeMutation,
  useReportVideoMutation,
  useReportWatchProgressMutation,
  useListVideosQuery,
  videosApi,
} from "../store/api/videosApi";
import { commentsApi } from "../store/api/commentsApi";
import { useGetChannelQuery, useToggleSubscribeMutation } from "../store/api/usersApi";
import { useRecordViewMutation } from "../store/api/historyApi";
import { useListSavedQuery, useToggleSavedMutation } from "../store/api/savedApi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { notifyApiError, notifySuccess } from "../lib/toast";
import { formatCompact, formatDate } from "../lib/format";
import dayjs from "../lib/dayjs";
import { getSocket } from "../store/socket";
import VideoPlayer from "../components/VideoPlayer";
import CommentList from "../components/CommentList";
import ErrorState from "../components/ErrorState";
import { VideoProcessingPanel, VideoFailedPanel } from "../components/VideoProcessingPanel";
import type { Comment } from "../types";
import UpNextList from "../components/UpNextList";

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
  const { data: related, isLoading: relatedLoading } = useListVideosQuery(
    { category: video?.category || undefined, sort: "latest", page: 1 },
    { skip: !video }
  );
  const upNext = (related?.items ?? [])
    .filter((v) => String(v.id) !== String(id) && v.processingStatus === "ready")
    .slice(0, 12);

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

  if (videoLoading) {
    return (
      <div
        className="mx-auto grid w-full max-w-[1760px] gap-lg px-0 py-md sm:px-md lg:grid-cols-[minmax(0,1fr)_380px] lg:px-lg"
        aria-busy
      >
        <div>
          <Skeleton variant="rounded" className="!aspect-video !h-auto w-full sm:!rounded-lg" />
          <div className="px-md sm:px-0">
            <Skeleton variant="text" width="70%" sx={{ fontSize: "24px", mt: 2 }} />
            <div className="mt-sm flex items-center gap-sm">
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width={160} />
            </div>
          </div>
        </div>
        <UpNextList videos={[]} loading />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="We couldn't load this video. It may have been removed, or the connection may be down."
        onRetry={refetch}
      />
    );
  }

  if (!video) return null;

  const ready = video.processingStatus === "ready";
  const pill =
    "inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-muted px-4 text-button-utility text-foreground transition-colors duration-fast hover:bg-foreground/10 active:scale-[0.97] disabled:opacity-50";

  return (
    <div className="mx-auto grid w-full max-w-[1760px] gap-x-lg gap-y-xl px-0 pb-16 pt-0 sm:px-md sm:pt-md lg:grid-cols-[minmax(0,1fr)_380px] lg:px-lg">
      <div className="min-w-0">
        <div className="sm:overflow-hidden sm:rounded-lg">
          {video.processingStatus === "pending" && <VideoProcessingPanel thumbnailUrl={video.thumbnailUrl} />}
          {video.processingStatus === "failed" && <VideoFailedPanel message={video.processingError} onRetry={refetch} />}
          {ready && (
            <VideoPlayer src={video.videoUrl} poster={video.thumbnailUrl} onProgress={handleProgress} onUnload={handleUnload} />
          )}
        </div>

        <div className="px-md sm:px-0">
          <h1 className="mt-md text-lead text-foreground [overflow-wrap:anywhere]">{video.title}</h1>

          {!ready && (
            <p className="mt-1 text-caption text-muted-foreground">
              {video.processingStatus === "pending"
                ? "Likes, comments and sharing will unlock once processing finishes."
                : "This video couldn't be processed."}
            </p>
          )}

          {ready && (
            <>
              <div className="mt-sm flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
                {channel && (
                  <div className="flex min-w-0 items-center gap-sm">
                    <Link to={`/channel/${channel.id}`} className="flex min-w-0 items-center gap-sm rounded-md">
                      <Avatar src={channel.profileImage || undefined} alt="" sx={{ width: 42, height: 42 }}>
                        {channel.name?.[0]?.toUpperCase()}
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-body-strong text-foreground hover:text-accent">{channel.name}</p>
                        <p className="tabular text-fine-print text-muted-foreground">
                          {formatCompact(channel.subscriberCount)}{" "}
                          {channel.subscriberCount === 1 ? "subscriber" : "subscribers"}
                        </p>
                      </div>
                    </Link>
                    {user && user.id !== channel.id && (
                      <Button
                        variant={channel.isSubscribed ? "outlined" : "contained"}
                        onClick={handleSubscribe}
                        startIcon={channel.isSubscribed ? <Check size={16} weight="bold" /> : <Bell size={16} />}
                        aria-pressed={channel.isSubscribed}
                        className="!ml-xs !rounded-full"
                      >
                        {channel.isSubscribed ? "Subscribed" : "Subscribe"}
                      </Button>
                    )}
                  </div>
                )}

                <div className="scrollbar-none -mx-md flex items-center gap-xs overflow-x-auto px-md md:mx-0 md:px-0">
                  {user && (
                    <button
                      type="button"
                      onClick={handleLike}
                      aria-pressed={video.isLiked}
                      aria-label={`${video.isLiked ? "Unlike" : "Like"} this video, ${video.likeCount.toLocaleString()} likes`}
                      className={`${pill} ${video.isLiked ? "!bg-accent-soft !text-accent" : ""}`}
                    >
                      <ThumbsUp size={18} weight={video.isLiked ? "fill" : "regular"} aria-hidden />
                      <span className="tabular">{formatCompact(video.likeCount)}</span>
                    </button>
                  )}
                  {user && (
                    <button
                      type="button"
                      onClick={handleToggleSaved}
                      aria-pressed={saved}
                      className={`${pill} ${saved ? "!bg-accent-soft !text-accent" : ""}`}
                    >
                      <BookmarkSimple size={18} weight={saved ? "fill" : "regular"} aria-hidden />
                      {saved ? "Saved" : "Save"}
                    </button>
                  )}
                  <button type="button" onClick={handleShare} className={pill}>
                    <ShareNetwork size={18} aria-hidden />
                    Share
                  </button>
                  {user && (
                    <>
                      <button
                        type="button"
                        aria-label="More actions"
                        aria-haspopup="menu"
                        aria-expanded={!!moreAnchorEl}
                        onClick={(e) => setMoreAnchorEl(e.currentTarget)}
                        className={`${pill} !w-10 !justify-center !px-0`}
                      >
                        <DotsThree size={20} weight="bold" aria-hidden />
                      </button>
                      <Menu
                        anchorEl={moreAnchorEl}
                        open={!!moreAnchorEl}
                        onClose={() => setMoreAnchorEl(null)}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                      >
                        <MenuItem
                          onClick={() => {
                            setMoreAnchorEl(null);
                            setReportOpen(true);
                          }}
                        >
                          <ListItemIcon className="!min-w-0 !text-muted-foreground">
                            <Flag size={18} />
                          </ListItemIcon>
                          <ListItemText>Report</ListItemText>
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-md rounded-lg bg-muted/70 p-sm sm:p-md">
                <p className="tabular flex flex-wrap items-center gap-x-1.5 text-caption-strong text-foreground">
                  <span>{video.views.toLocaleString()} views</span>
                  <span className="text-muted-foreground" aria-hidden>
                    ·
                  </span>
                  <time dateTime={video.createdAt} title={formatDate(video.createdAt)}>
                    {dayjs(video.createdAt).fromNow()}
                  </time>
                  {video.category && (
                    <span className="ml-1 inline-flex rounded-sm bg-accent-soft px-1.5 py-0.5 text-fine-print font-semibold text-accent">
                      {video.category}
                    </span>
                  )}
                </p>
                {video.description ? (
                  <>
                    <p
                      ref={descRef}
                      id="video-description"
                      className={`mt-xs whitespace-pre-line text-caption text-foreground [overflow-wrap:anywhere] ${
                        descExpanded ? "" : "line-clamp-3"
                      }`}
                    >
                      {video.description}
                    </p>
                    {canExpandDesc && (
                      <button
                        type="button"
                        onClick={() => setDescExpanded((v) => !v)}
                        aria-expanded={descExpanded}
                        aria-controls="video-description"
                        className="mt-xs text-caption-strong text-foreground hover:text-accent"
                      >
                        {descExpanded ? "Show less" : "…more"}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="mt-xs text-caption text-muted-foreground">No description provided.</p>
                )}
              </div>

              <div className="mt-lg hidden lg:block">
                <CommentList videoId={video.id} />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="min-w-0 px-md sm:px-0">
        <UpNextList videos={upNext} loading={relatedLoading} />
        {ready && (
          <div className="mt-xl lg:hidden">
            <CommentList videoId={video.id} />
          </div>
        )}
      </div>

      <Dialog open={reportOpen} onClose={() => !reportSubmitting && setReportOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle className="flex items-center gap-2">
          <Flag size={20} className="text-destructive" aria-hidden />
          Report this video
        </DialogTitle>
        <DialogContent>
          <p className="mb-sm text-caption text-muted-foreground">
            Reports are reviewed by moderators. Tell us what is wrong so we can act quickly.
          </p>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Reason"
            placeholder="e.g. spam, misleading content, harassment…"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            disabled={reportSubmitting}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setReportOpen(false)} disabled={reportSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReportSubmit}
            loading={reportSubmitting}
            disabled={!reportReason.trim()}
          >
            {reportSubmitting ? "Submitting…" : "Submit report"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
