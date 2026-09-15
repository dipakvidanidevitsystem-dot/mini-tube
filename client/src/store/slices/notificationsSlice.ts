import { createSlice, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type NotificationType = "subscribe" | "comment" | "like" | "video-ready" | "video-failed";

export interface NotificationPayload {
  type: NotificationType;
  actorName?: string;
  videoId?: number;
  videoTitle?: string;
  message?: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  videoId?: number;
  createdAt: string;
  read: boolean;
}

interface NotificationsState {
  items: NotificationItem[];
  unreadCount: number;
}

const initialState: NotificationsState = { items: [], unreadCount: 0 };

function buildMessage(payload: NotificationPayload): string {
  switch (payload.type) {
    case "subscribe":
      return `${payload.actorName ?? "Someone"} subscribed to your channel`;
    case "comment":
      return `${payload.actorName ?? "Someone"} commented on "${payload.videoTitle ?? "your video"}"`;
    case "like":
      return `${payload.actorName ?? "Someone"} liked "${payload.videoTitle ?? "your video"}"`;
    case "video-ready":
      return `"${payload.videoTitle ?? "Your video"}" is ready to watch`;
    case "video-failed":
      return payload.message || `We couldn't process "${payload.videoTitle ?? "your video"}"`;
    default:
      return payload.message || "You have a new notification";
  }
}

const MAX_ITEMS = 50;

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    notificationReceived: {
      reducer(state, action: PayloadAction<NotificationItem>) {
        state.items.unshift(action.payload);
        state.items = state.items.slice(0, MAX_ITEMS);
        state.unreadCount += 1;
      },
      prepare(payload: NotificationPayload) {
        return {
          payload: {
            id: nanoid(),
            type: payload.type,
            message: buildMessage(payload),
            videoId: payload.videoId,
            createdAt: new Date().toISOString(),
            read: false,
          } satisfies NotificationItem,
        };
      },
    },
    markAllRead(state) {
      state.items.forEach((item) => {
        item.read = true;
      });
      state.unreadCount = 0;
    },
    clearAll(state) {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const { notificationReceived, markAllRead, clearAll } = notificationsSlice.actions;
export default notificationsSlice.reducer;
