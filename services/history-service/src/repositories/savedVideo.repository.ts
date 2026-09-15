import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { savedVideos, videos, users } from "../db/schema.js";

class SavedVideoRepository {
  async find(userId: number, videoId: number) {
    const [existing] = await db
      .select()
      .from(savedVideos)
      .where(and(eq(savedVideos.userId, userId), eq(savedVideos.videoId, videoId)));
    return existing;
  }

  async create(userId: number, videoId: number) {
    await db.insert(savedVideos).values({ userId, videoId });
  }

  async delete(id: number) {
    await db.delete(savedVideos).where(eq(savedVideos.id, id));
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
        savedAt: savedVideos.createdAt,
      })
      .from(savedVideos)
      .innerJoin(videos, eq(savedVideos.videoId, videos.id))
      .innerJoin(users, eq(videos.userId, users.id))
      .where(eq(savedVideos.userId, userId))
      .orderBy(desc(savedVideos.createdAt));
  }
}

export { SavedVideoRepository };
export const savedVideoRepository = new SavedVideoRepository();
