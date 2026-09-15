import {
  mysqlTable,
  int,
  varchar,
  text,
  boolean,
  mysqlEnum,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

// Points at the same physical tables as the monolith's server/src/db/schema.ts
// (interim step — see migration plan step 4). `videos`, `likes`, `comments`,
// `commentLikes`, `watchHistory`, and `videoViews`/`videoMilestones` are
// read-only from User Service's perspective (dashboard analytics) — their
// owning services (Video/Comment/History) hold the writes. `users` (profile
// fields) and `subscriptions` are owned here for real.

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
    videoUserUnique: uniqueIndex("minitube_likes_video_user_unique").on(table.videoId, table.userId),
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
    userVideoUnique: uniqueIndex("minitube_watch_history_user_video_unique").on(table.userId, table.videoId),
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
    videoViewedAtIdx: index("minitube_video_views_video_viewed_at_idx").on(table.videoId, table.viewedAt),
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
