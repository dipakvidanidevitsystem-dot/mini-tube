import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { videos, users } from "../db/schema.js";

// Read-only — Video Service owns writes.
class VideoRepository {
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

export { VideoRepository };
export const videoRepository = new VideoRepository();
