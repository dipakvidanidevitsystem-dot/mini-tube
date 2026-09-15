import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { videos, users, likes } from "../db/schema.js";

// Read-only from User Service's perspective — Video Service owns writes.
function likeCountExpr() {
  return sql<number>`(select count(*) from ${likes} where ${likes.videoId} = ${videos.id})`;
}

class VideoRepository {
  async findById(id: number) {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async findByUser(userId: number, publicOnly: boolean) {
    const whereClause = publicOnly
      ? and(eq(videos.userId, userId), eq(videos.visibility, "public"))
      : eq(videos.userId, userId);
    return db.select().from(videos).where(whereClause).orderBy(desc(videos.createdAt));
  }

  async countAndSumViewsForUser(userId: number) {
    const [{ videoCount, totalViews }] = await db
      .select({
        videoCount: sql<number>`count(*)`.mapWith(Number),
        totalViews: sql<number>`coalesce(sum(${videos.views}), 0)`.mapWith(Number),
      })
      .from(videos)
      .where(eq(videos.userId, userId));
    return { videoCount, totalViews };
  }

  async topVideoIdAllTime(userId: number) {
    const [topVideo] = await db
      .select({ id: videos.id })
      .from(videos)
      .where(eq(videos.userId, userId))
      .orderBy(desc(videos.views))
      .limit(1);
    return topVideo?.id ?? null;
  }

  async topVideosAllTime(userId: number, limit: number) {
    return db
      .select({
        id: videos.id,
        title: videos.title,
        thumbnailUrl: videos.thumbnailUrl,
        createdAt: videos.createdAt,
        likeCount: likeCountExpr().mapWith(Number),
        views: videos.views,
      })
      .from(videos)
      .where(eq(videos.userId, userId))
      .orderBy(desc(videos.views))
      .limit(limit);
  }
}

export { VideoRepository, likeCountExpr };
export const videoRepository = new VideoRepository();
