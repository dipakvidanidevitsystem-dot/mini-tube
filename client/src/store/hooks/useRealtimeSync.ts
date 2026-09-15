import { useEffect } from "react";
import { connectSocket, disconnectSocket, getSocket } from "../socket";
import { useAppDispatch, useAppSelector } from "../hooks";
import { notificationReceived, type NotificationPayload } from "../slices/notificationsSlice";
import { usersApi } from "../api/usersApi";
import { videosApi } from "../api/videosApi";
import { notifySuccess, notifyError } from "../../lib/toast";

interface VideoReadyPayload {
  videoId: number;
  video?: { videoUrl?: string; thumbnailUrl?: string; processingStatus?: string; title?: string };
}

interface VideoFailedPayload {
  videoId: number;
  message?: string;
}

export function useRealtimeSync() {
  const userId = useAppSelector((state) => state.auth.user?.id);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userId) {
      disconnectSocket();
      return;
    }

    connectSocket();
    const socket = getSocket();

    const onNotification = (payload: NotificationPayload) => {
      dispatch(notificationReceived(payload));
    };

    const onDashboardInvalidate = () => {
      dispatch(usersApi.util.invalidateTags(["Dashboard"]));
    };

    const onVideoReady = (payload: VideoReadyPayload) => {
      dispatch(
        videosApi.util.updateQueryData("getVideo", String(payload.videoId), (draft) => {
          if (payload.video?.videoUrl) draft.videoUrl = payload.video.videoUrl;
          if (payload.video?.thumbnailUrl) draft.thumbnailUrl = payload.video.thumbnailUrl;
          draft.processingStatus = "ready";
        })
      );
      dispatch(videosApi.util.invalidateTags([{ type: "VideoList", id: "LIST" }, "Channel"]));
      dispatch(notificationReceived({ type: "video-ready", videoId: payload.videoId, videoTitle: payload.video?.title }));
      notifySuccess(`"${payload.video?.title ?? "Your video"}" is ready to watch!`);
    };

    const onVideoFailed = (payload: VideoFailedPayload) => {
      dispatch(
        videosApi.util.updateQueryData("getVideo", String(payload.videoId), (draft) => {
          draft.processingStatus = "failed";
          draft.processingError = payload.message ?? null;
        })
      );
      dispatch(videosApi.util.invalidateTags([{ type: "VideoList", id: "LIST" }, "Channel"]));
      dispatch(notificationReceived({ type: "video-failed", videoId: payload.videoId, message: payload.message }));
      notifyError(payload.message || "Video processing failed. Please try re-uploading.");
    };

    socket.on("notification", onNotification);
    socket.on("dashboard-invalidate", onDashboardInvalidate);
    socket.on("video-ready", onVideoReady);
    socket.on("video-failed", onVideoFailed);

    return () => {
      socket.off("notification", onNotification);
      socket.off("dashboard-invalidate", onDashboardInvalidate);
      socket.off("video-ready", onVideoReady);
      socket.off("video-failed", onVideoFailed);
    };
  }, [userId, dispatch]);
}
