import { mysqlTable, int, varchar, text, boolean, mysqlEnum, timestamp } from "drizzle-orm/mysql-core";

// Points at the same physical tables as the monolith's server/src/db/schema.ts
// (interim step — see migration plan step 4). All four tables here are
// read-only from Admin Service's perspective except `users.disabled`
// (moderation) — Auth/User/Video/Comment Service own the rest of the writes.

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
