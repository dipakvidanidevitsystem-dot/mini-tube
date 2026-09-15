import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { likes, videos, users } from "../db/schema.js";

class LikeRepository {
  async find(videoId: number, userId: number) {
    const [existing] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.videoId, videoId), eq(likes.userId, userId)));
    return existing;
  }

  async create(videoId: number, userId: number) {
    await db.insert(likes).values({ videoId, userId });
  }

  async delete(id: number) {
    await db.delete(likes).where(eq(likes.id, id));
  }

  async countForVideo(videoId: number) {
    const [{ likeCount }] = await db
      .select({ likeCount: sql<number>`count(*)`.mapWith(Number) })
      .from(likes)
      .where(eq(likes.videoId, videoId));
    return likeCount;
  }

  async countForUserVideos(userId: number) {
    const [{ totalLikes }] = await db
      .select({ totalLikes: sql<number>`count(*)`.mapWith(Number) })
      .from(likes)
      .innerJoin(videos, eq(likes.videoId, videos.id))
      .where(eq(videos.userId, userId));
    return totalLikes;
  }

  async recentForUserVideos(userId: number, limit: number) {
    return db
      .select({
        actorId: users.id,
        actorName: users.name,
        actorImage: users.profileImage,
        createdAt: likes.createdAt,
        videoId: videos.id,
        videoTitle: videos.title,
      })
      .from(likes)
      .innerJoin(videos, eq(likes.videoId, videos.id))
      .innerJoin(users, eq(likes.userId, users.id))
      .where(eq(videos.userId, userId))
      .orderBy(desc(likes.createdAt))
      .limit(limit);
  }
}

export { LikeRepository };
export const likeRepository = new LikeRepository();
