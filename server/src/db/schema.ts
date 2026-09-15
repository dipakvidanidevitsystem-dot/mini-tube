import { relations } from "drizzle-orm";
import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  index,
  boolean,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("minitube_users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  profileImage: varchar("profile_image", { length: 500 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  disabled: boolean("disabled").default(false).notNull(),
  notifyNewSubscriber: boolean("notify_new_subscriber").default(true).notNull(),
  notifyVideoUploaded: boolean("notify_video_uploaded").default(true).notNull(),
  notifyComment: boolean("notify_comment").default(true).notNull(),
  notifyLike: boolean("notify_like").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videos = mysqlTable("minitube_videos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  videoUrl: varchar("video_url", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }),
  visibility: mysqlEnum("visibility", ["public", "private"]).default("public").notNull(),
  views: int("views").default(0).notNull(),
  duration: int("duration").default(0).notNull(),
  processingStatus: mysqlEnum("processing_status", ["pending", "ready", "failed"]).default("ready").notNull(),
  processingError: text("processing_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = mysqlTable("minitube_comments", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  parentId: int("parent_id"),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const likes = mysqlTable(
  "minitube_likes",
  {
    id: int("id").autoincrement().primaryKey(),
    videoId: int("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    videoUserUnique: uniqueIndex("minitube_likes_video_user_unique").on(
      table.videoId,
      table.userId
    ),
  })
);

export const subscriptions = mysqlTable(
  "minitube_subscriptions",
  {
    id: int("id").autoincrement().primaryKey(),
    subscriberId: int("subscriber_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    channelId: int("channel_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    subscriberChannelUnique: uniqueIndex("minitube_subscriptions_subscriber_channel_unique").on(
      table.subscriberId,
      table.channelId
    ),
  })
);

export const passwordResets = mysqlTable("minitube_password_resets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const refreshTokens = mysqlTable("minitube_refresh_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const watchHistory = mysqlTable(
  "minitube_watch_history",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    videoId: int("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    watchedAt: timestamp("watched_at").defaultNow().notNull(),
  },
  (table) => ({
    userVideoUnique: uniqueIndex("minitube_watch_history_user_video_unique").on(
      table.userId,
      table.videoId
    ),
  })
);

export const videoViews = mysqlTable(
  "minitube_video_views",
  {
    id: int("id").autoincrement().primaryKey(),
    videoId: int("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    userId: int("user_id").references(() => users.id, { onDelete: "set null" }),
    viewedAt: timestamp("viewed_at").defaultNow().notNull(),
    watchedSeconds: int("watched_seconds").default(0).notNull(),
  },
  (table) => ({
    videoViewedAtIdx: index("minitube_video_views_video_viewed_at_idx").on(
      table.videoId,
      table.viewedAt
    ),
  })
);

export const videoMilestones = mysqlTable(
  "minitube_video_milestones",
  {
    id: int("id").autoincrement().primaryKey(),
    videoId: int("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    milestone: int("milestone").notNull(),
    reachedAt: timestamp("reached_at").defaultNow().notNull(),
  },
  (table) => ({
    videoMilestoneUnique: uniqueIndex("minitube_video_milestones_video_milestone_unique").on(
      table.videoId,
      table.milestone
    ),
  })
);

export const savedVideos = mysqlTable(
  "minitube_saved_videos",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    videoId: int("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userVideoUnique: uniqueIndex("minitube_saved_videos_user_video_unique").on(
      table.userId,
      table.videoId
    ),
  })
);

export const commentLikes = mysqlTable(
  "minitube_comment_likes",
  {
    id: int("id").autoincrement().primaryKey(),
    commentId: int("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    commentUserUnique: uniqueIndex("minitube_comment_likes_comment_user_unique").on(
      table.commentId,
      table.userId
    ),
  })
);

export const reports = mysqlTable("minitube_reports", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  reporterId: int("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  status: mysqlEnum("status", ["pending", "reviewed"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  videos: many(videos),
  comments: many(comments),
  likes: many(likes),
  subscriptionsMade: many(subscriptions, { relationName: "subscriber" }),
  subscribers: many(subscriptions, { relationName: "channel" }),
  passwordResets: many(passwordResets),
  refreshTokens: many(refreshTokens),
  watchHistory: many(watchHistory),
  savedVideos: many(savedVideos),
  commentLikes: many(commentLikes),
  reports: many(reports),
  videoViews: many(videoViews),
}));

export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, { fields: [passwordResets.userId], references: [users.id] }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  user: one(users, { fields: [videos.userId], references: [users.id] }),
  comments: many(comments),
  likes: many(likes),
  watchedBy: many(watchHistory),
  savedBy: many(savedVideos),
  reports: many(reports),
  views: many(videoViews),
  milestones: many(videoMilestones),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  video: one(videos, { fields: [comments.videoId], references: [videos.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  likes: many(commentLikes),
}));

export const watchHistoryRelations = relations(watchHistory, ({ one }) => ({
  user: one(users, { fields: [watchHistory.userId], references: [users.id] }),
  video: one(videos, { fields: [watchHistory.videoId], references: [videos.id] }),
}));

export const savedVideosRelations = relations(savedVideos, ({ one }) => ({
  user: one(users, { fields: [savedVideos.userId], references: [users.id] }),
  video: one(videos, { fields: [savedVideos.videoId], references: [videos.id] }),
}));

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  comment: one(comments, { fields: [commentLikes.commentId], references: [comments.id] }),
  user: one(users, { fields: [commentLikes.userId], references: [users.id] }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  video: one(videos, { fields: [reports.videoId], references: [videos.id] }),
  reporter: one(users, { fields: [reports.reporterId], references: [users.id] }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  video: one(videos, { fields: [likes.videoId], references: [videos.id] }),
  user: one(users, { fields: [likes.userId], references: [users.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  subscriber: one(users, {
    fields: [subscriptions.subscriberId],
    references: [users.id],
    relationName: "subscriber",
  }),
  channel: one(users, {
    fields: [subscriptions.channelId],
    references: [users.id],
    relationName: "channel",
  }),
}));

export const videoViewsRelations = relations(videoViews, ({ one }) => ({
  video: one(videos, { fields: [videoViews.videoId], references: [videos.id] }),
  user: one(users, { fields: [videoViews.userId], references: [users.id] }),
}));

export const videoMilestonesRelations = relations(videoMilestones, ({ one }) => ({
  video: one(videos, { fields: [videoMilestones.videoId], references: [videos.id] }),
}));
