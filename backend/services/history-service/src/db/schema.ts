import { mysqlTable, int, varchar, text, boolean, mysqlEnum, timestamp, uniqueIndex } from "drizzle-orm/mysql-core";

// Points at the same physical tables as the monolith's server/src/db/schema.ts
// (interim step — see migration plan step 4). `users` and `videos` are
// read-only from History/Saved Service's perspective: User/Video Service own writes.

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
    userVideoUnique: uniqueIndex("minitube_saved_videos_user_video_unique").on(table.userId, table.videoId),
  })
);
