import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { comments, users } from "../db/schema.js";

// Read-only — Comment Service owns writes.
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
