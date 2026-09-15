import { eq, desc, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { watchHistory, videos, users } from "../db/schema.js";

// Read-only from User Service's perspective — History Service owns writes.
class WatchHistoryRepository {
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
