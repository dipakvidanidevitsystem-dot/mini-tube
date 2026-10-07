import { eq, desc, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { comments, videos, users } from "../db/schema.js";

// Read-only from User Service's perspective — Comment Service owns writes.
class CommentRepository {
  async countForUserVideos(userId: number) {
    const [{ totalComments }] = await db
      .select({ totalComments: sql<number>`count(*)`.mapWith(Number) })
      .from(comments)
      .innerJoin(videos, eq(comments.videoId, videos.id))
      .where(eq(videos.userId, userId));
    return totalComments;
  }

  async countForVideo(videoId: number) {
    const [{ commentCount }] = await db
      .select({ commentCount: sql<number>`count(*)`.mapWith(Number) })
      .from(comments)
      .where(eq(comments.videoId, videoId));
    return commentCount;
  }

  async recentForUserVideos(userId: number, limit: number) {
    return db
      .select({
        actorId: users.id,
        actorName: users.name,
        actorImage: users.profileImage,
        createdAt: comments.createdAt,
        videoId: videos.id,
        videoTitle: videos.title,
        commentExcerpt: comments.comment,
      })
      .from(comments)
      .innerJoin(videos, eq(comments.videoId, videos.id))
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(videos.userId, userId))
      .orderBy(desc(comments.createdAt))
      .limit(limit);
  }
}

export { CommentRepository };
export const commentRepository = new CommentRepository();
