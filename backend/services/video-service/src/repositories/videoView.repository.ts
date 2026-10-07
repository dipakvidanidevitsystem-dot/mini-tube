import { eq, and, or, isNull, isNotNull, gte, desc, sql, type SQL } from "drizzle-orm";
import { db } from "../db/index.js";
import { videoViews, videoMilestones, videos } from "../db/schema.js";
import { likeCountExpr } from "./video.repository.js";

const VIEW_MILESTONES = [10, 50, 100, 500, 1000, 5001, 10000, 50000, 100000];

class VideoViewRepository {
  async insertView(videoId: number, userId: number | null) {
    const [result] = await db.insert(videoViews).values({ videoId, userId });
    return result;
  }

  async updateWatchProgress(videoViewId: number, videoId: number, seconds: number, userId?: number) {
    const ownerCondition = userId
      ? or(eq(videoViews.userId, userId), isNull(videoViews.userId))
      : isNull(videoViews.userId);

    await db
      .update(videoViews)
      .set({ watchedSeconds: sql`greatest(${videoViews.watchedSeconds}, ${seconds})` })
      .where(and(eq(videoViews.id, videoViewId), eq(videoViews.videoId, videoId), ownerCondition));
  }

  async checkMilestones(videoId: number, views: number) {
    const crossed = VIEW_MILESTONES.filter((m) => views >= m);
    if (crossed.length === 0) return;

    const existing = await db
      .select({ milestone: videoMilestones.milestone })
      .from(videoMilestones)
      .where(eq(videoMilestones.videoId, videoId));
    const existingSet = new Set(existing.map((row) => row.milestone));
    const missing = crossed.filter((m) => !existingSet.has(m));

    await Promise.all(
      missing.map((milestone) =>
        db
          .insert(videoMilestones)
          .values({ videoId, milestone })
          .catch(() => {})
      )
    );
  }

  async watchStatsForUser(userId: number) {
    const [{ totalWatchedSeconds, avgWatchedSeconds }] = await db
      .select({
        totalWatchedSeconds: sql<number>`coalesce(sum(${videoViews.watchedSeconds}), 0)`.mapWith(Number),
        avgWatchedSeconds: sql<number>`coalesce(avg(${videoViews.watchedSeconds}), 0)`.mapWith(Number),
      })
      .from(videoViews)
      .innerJoin(videos, eq(videoViews.videoId, videos.id))
      .where(eq(videos.userId, userId));
    return { totalWatchedSeconds, avgWatchedSeconds };
  }

  async topVideoForPeriod(userId: number, start: Date) {
    const [topVideo] = await db
      .select({ id: videos.id, cnt: sql<number>`count(*)`.mapWith(Number) })
      .from(videoViews)
      .innerJoin(videos, eq(videoViews.videoId, videos.id))
      .where(and(eq(videos.userId, userId), gte(videoViews.viewedAt, start)))
      .groupBy(videos.id)
      .orderBy(desc(sql`count(*)`))
      .limit(1);
    return topVideo;
  }

  async viewsSeriesForUser(userId: number, bucket: SQL, start: Date | null) {
    const conditions = [eq(videos.userId, userId)];
    if (start) conditions.push(gte(videoViews.viewedAt, start));

    return db
      .select({
        date: sql<string>`${bucket}`,
        views: sql<number>`count(*)`.mapWith(Number),
      })
      .from(videoViews)
      .innerJoin(videos, eq(videoViews.videoId, videos.id))
      .where(and(...conditions))
      .groupBy(sql`${bucket}`)
      .orderBy(sql`${bucket}`);
  }

  async topVideosForPeriod(userId: number, start: Date, limit: number) {
    return db
      .select({
        id: videos.id,
        title: videos.title,
        thumbnailUrl: videos.thumbnailUrl,
        createdAt: videos.createdAt,
        likeCount: likeCountExpr().mapWith(Number),
        views: sql<number>`count(*)`.mapWith(Number),
      })
      .from(videoViews)
      .innerJoin(videos, eq(videoViews.videoId, videos.id))
      .where(and(eq(videos.userId, userId), gte(videoViews.viewedAt, start)))
      .groupBy(videos.id, videos.title, videos.thumbnailUrl, videos.createdAt)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);
  }

  async recentMilestonesForUser(userId: number, limit: number) {
    return db
      .select({
        createdAt: videoMilestones.reachedAt,
        videoId: videos.id,
        videoTitle: videos.title,
        milestone: videoMilestones.milestone,
      })
      .from(videoMilestones)
      .innerJoin(videos, eq(videoMilestones.videoId, videos.id))
      .where(eq(videos.userId, userId))
      .orderBy(desc(videoMilestones.reachedAt))
      .limit(limit);
  }

  async audienceActivityForUser(userId: number) {
    const viewerCounts = db
      .select({ userId: videoViews.userId, viewCount: sql<number>`count(*)`.mapWith(Number).as("viewCount") })
      .from(videoViews)
      .innerJoin(videos, eq(videoViews.videoId, videos.id))
      .where(and(eq(videos.userId, userId), isNotNull(videoViews.userId)))
      .groupBy(videoViews.userId)
      .as("viewerCounts");

    const [{ returningViewers, newViewers }] = await db
      .select({
        returningViewers: sql<number>`coalesce(sum(case when ${viewerCounts.viewCount} > 1 then 1 else 0 end), 0)`.mapWith(Number),
        newViewers: sql<number>`coalesce(sum(case when ${viewerCounts.viewCount} = 1 then 1 else 0 end), 0)`.mapWith(Number),
      })
      .from(viewerCounts);

    return { returningViewers, newViewers };
  }
}

export { VideoViewRepository };
export const videoViewRepository = new VideoViewRepository();
