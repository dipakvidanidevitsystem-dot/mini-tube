import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { comments, users } from "../db/schema.js";

// Comment Service owns this table for real now — the monolith keeps only the
// read used by the still-monolithic admin domain (comment-service has its
// own full copy for everything else).
class CommentRepository {
  async listAllWithAuthor() {
    return db
      .select({
        id: comments.id,
        comment: comments.comment,
        videoId: comments.videoId,
        userId: comments.userId,
        createdAt: comments.createdAt,
        userName: users.name,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .orderBy(desc(comments.createdAt));
  }
}

export { CommentRepository };
export const commentRepository = new CommentRepository();
