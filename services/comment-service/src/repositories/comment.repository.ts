import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { comments, users, commentLikes, videos } from "../db/schema.js";

type NewComment = typeof comments.$inferInsert;

function commentShape() {
  return {
    id: comments.id,
    videoId: comments.videoId,
    userId: comments.userId,
    parentId: comments.parentId,
    comment: comments.comment,
    createdAt: comments.createdAt,
    userName: users.name,
    userImage: users.profileImage,
  };
}

class CommentRepository {
  async listForVideo(videoId: number) {
    return db
      .select({
        ...commentShape(),
        likeCount: sql<number>`(select count(*) from ${commentLikes} where ${commentLikes.commentId} = ${comments.id})`.mapWith(
          Number
        ),
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.videoId, videoId))
      .orderBy(desc(comments.createdAt));
  }

  async likedCommentIdsForVideo(videoId: number, userId: number) {
    const rows = await db
      .select({ commentId: commentLikes.commentId })
      .from(commentLikes)
      .innerJoin(comments, eq(commentLikes.commentId, comments.id))
      .where(and(eq(comments.videoId, videoId), eq(commentLikes.userId, userId)));
    return new Set(rows.map((r) => r.commentId));
  }

  async create(data: NewComment) {
    const [result] = await db.insert(comments).values(data);
    return result.insertId;
  }

  async findWithAuthorById(id: number) {
    const [row] = await db
      .select(commentShape())
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.id, id));
    return row;
  }

  async findById(id: number) {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }

  async delete(id: number) {
    await db.delete(comments).where(eq(comments.id, id));
  }

  async findLike(commentId: number, userId: number) {
    const [existing] = await db
      .select()
      .from(commentLikes)
      .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)));
    return existing;
  }

  async createLike(commentId: number, userId: number) {
    await db.insert(commentLikes).values({ commentId, userId });
  }

  async deleteLike(id: number) {
    await db.delete(commentLikes).where(eq(commentLikes.id, id));
  }

  async countLikes(commentId: number) {
    const [{ likeCount }] = await db
      .select({ likeCount: sql<number>`count(*)`.mapWith(Number) })
      .from(commentLikes)
      .where(eq(commentLikes.commentId, commentId));
    return likeCount;
  }

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
