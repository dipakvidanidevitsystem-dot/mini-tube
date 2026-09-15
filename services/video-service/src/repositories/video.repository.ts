import { eq, desc, or, like, sql, and, type SQL } from "drizzle-orm";
import { db } from "../db/index.js";
import { videos, users, likes } from "../db/schema.js";

type NewVideo = typeof videos.$inferInsert;
type VideoUpdate = Partial<NewVideo>;

function videoWithCreator() {
  return {
    id: videos.id,
    userId: videos.userId,
    title: videos.title,
    description: videos.description,
    videoUrl: videos.videoUrl,
    thumbnailUrl: videos.thumbnailUrl,
    category: videos.category,
    visibility: videos.visibility,
    views: videos.views,
    duration: videos.duration,
    createdAt: videos.createdAt,
    creatorName: users.name,
    creatorImage: users.profileImage,
    processingStatus: videos.processingStatus,
    processingError: videos.processingError,
  };
}

function likeCountExpr() {
  return sql<number>`(select count(*) from ${likes} where ${likes.videoId} = ${videos.id})`;
}

function resolveOrderBy(sort: unknown) {
  if (sort === "views") return desc(videos.views);
  if (sort === "likes") return desc(likeCountExpr());
  return desc(videos.createdAt);
}

class VideoRepository {
  async listPublic(category: string | undefined, sort: unknown, limit: number, offset: number) {
    const conditions = [eq(videos.visibility, "public"), eq(videos.processingStatus, "ready")];
    if (category) conditions.push(eq(videos.category, category));
    const whereClause = and(...conditions);

    const [rows, [{ total }]] = await Promise.all([
      db
        .select(videoWithCreator())
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(whereClause)
        .orderBy(resolveOrderBy(sort))
        .limit(limit)
        .offset(offset),
      db.select({ total: sql<number>`count(*)`.mapWith(Number) }).from(videos).where(whereClause),
    ]);

    return { rows, total };
  }

  async searchPublic(q: string, category: string | undefined, sort: unknown, limit: number, offset: number) {
    const pattern = `%${q}%`;
    const conditions = [
      eq(videos.visibility, "public"),
      eq(videos.processingStatus, "ready"),
      or(like(videos.title, pattern), like(videos.description, pattern)) as SQL,
    ];
    if (category) conditions.push(eq(videos.category, category));
    const whereClause = and(...conditions);

    const [rows, [{ total }]] = await Promise.all([
      db
        .select(videoWithCreator())
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(whereClause)
        .orderBy(resolveOrderBy(sort))
        .limit(limit)
        .offset(offset),
      db.select({ total: sql<number>`count(*)`.mapWith(Number) }).from(videos).where(whereClause),
    ]);

    return { rows, total };
  }

  async findById(id: number) {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async findWithCreatorById(id: number) {
    const [video] = await db
      .select(videoWithCreator())
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.id))
      .where(eq(videos.id, id));
    return video;
  }

  async incrementViews(id: number) {
    await db.update(videos).set({ views: sql`${videos.views} + 1` }).where(eq(videos.id, id));
  }

  async create(data: NewVideo) {
    const [result] = await db.insert(videos).values(data);
    return this.findById(result.insertId) as Promise<NonNullable<Awaited<ReturnType<VideoRepository["findById"]>>>>;
  }

  async update(id: number, data: VideoUpdate) {
    await db.update(videos).set(data).where(eq(videos.id, id));
  }

  async delete(id: number) {
    await db.delete(videos).where(eq(videos.id, id));
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

  async listAllWithCreatorSummary() {
    return db
      .select({
        id: videos.id,
        title: videos.title,
        userId: videos.userId,
        visibility: videos.visibility,
        views: videos.views,
        createdAt: videos.createdAt,
        creatorName: users.name,
      })
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.id))
      .orderBy(desc(videos.createdAt));
  }
}

export { VideoRepository, videoWithCreator, likeCountExpr };
export const videoRepository = new VideoRepository();
