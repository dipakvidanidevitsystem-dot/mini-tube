import { eq, and, desc, sql } from "drizzle-orm";
import dayjs from "dayjs";
import { db } from "../db/index.js";
import { watchHistory, videos, users } from "../db/schema.js";

class WatchHistoryRepository {
  async find(userId: number, videoId: number) {
    const [existing] = await db
      .select()
      .from(watchHistory)
      .where(and(eq(watchHistory.userId, userId), eq(watchHistory.videoId, videoId)));
    return existing;
  }

  async touch(id: number) {
    await db.update(watchHistory).set({ watchedAt: dayjs().toDate() }).where(eq(watchHistory.id, id));
  }

  async create(userId: number, videoId: number) {
    await db.insert(watchHistory).values({ userId, videoId });
  }

  async listForUser(userId: number) {
    return db
      .select({
        id: videos.id,
        userId: videos.userId,
        title: videos.title,
        description: videos.description,
        videoUrl: videos.videoUrl,
        thumbnailUrl: videos.thumbnailUrl,
        category: videos.category,
        visibility: videos.visibility,
        views: videos.views,
        createdAt: videos.createdAt,
        creatorName: users.name,
        creatorImage: users.profileImage,
        watchedAt: watchHistory.watchedAt,
      })
      .from(watchHistory)
      .innerJoin(videos, eq(watchHistory.videoId, videos.id))
      .innerJoin(users, eq(videos.userId, users.id))
      .where(eq(watchHistory.userId, userId))
      .orderBy(desc(watchHistory.watchedAt));
  }

  async removeForUser(userId: number, videoId: number) {
    await db.delete(watchHistory).where(and(eq(watchHistory.userId, userId), eq(watchHistory.videoId, videoId)));
  }

  async clearForUser(userId: number) {
    await db.delete(watchHistory).where(eq(watchHistory.userId, userId));
  }

  async topViewersForChannel(channelId: number, limit: number) {
    return db
      .select({
        id: users.id,
        name: users.name,
        profileImage: users.profileImage,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(watchHistory)
      .innerJoin(videos, eq(watchHistory.videoId, videos.id))
      .innerJoin(users, eq(watchHistory.userId, users.id))
      .where(eq(videos.userId, channelId))
      .groupBy(users.id, users.name, users.profileImage)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);
  }
}

export { WatchHistoryRepository };
export const watchHistoryRepository = new WatchHistoryRepository();
