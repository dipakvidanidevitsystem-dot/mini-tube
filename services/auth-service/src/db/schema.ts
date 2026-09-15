import { mysqlTable, int, varchar, boolean, mysqlEnum, timestamp } from "drizzle-orm/mysql-core";

// Points at the same physical tables as the monolith's server/src/db/schema.ts.
// This is an interim step (migration plan step 4 covers the actual "database
// per service" split, including a `users` credentials/profile field split
// with the User Service) — for now Auth Service just gets its own process
// and its own DB connection pool onto the shared MySQL instance.

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

export const passwordResets = mysqlTable("minitube_password_resets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
