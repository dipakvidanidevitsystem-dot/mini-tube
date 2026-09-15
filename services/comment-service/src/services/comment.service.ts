import { HttpError } from "../utils/HttpError.js";
import { mailerService, type MailerService } from "../utils/mailer.js";
import { commentRepository, type CommentRepository } from "../repositories/comment.repository.js";
import { videoRepository, type VideoRepository } from "../repositories/video.repository.js";
import { userRepository, type UserRepository } from "../repositories/user.repository.js";
import { socketService, type SocketService } from "../sockets/socket.service.js";
import { commentEmail } from "../templates/emails.js";

class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly videoRepository: VideoRepository,
    private readonly userRepository: UserRepository,
    private readonly mailerService: MailerService,
    private readonly socketService: SocketService
  ) {}

  async listForVideo(videoId: number, userId: number | undefined) {
    const rows = await this.commentRepository.listForVideo(videoId);

    if (!userId) {
      return rows.map((row) => ({ ...row, isLiked: false }));
    }

    const likedIds = await this.commentRepository.likedCommentIdsForVideo(videoId, userId);
    return rows.map((row) => ({ ...row, isLiked: likedIds.has(row.id) }));
  }

  async add(videoId: number, userId: number, comment: string, parentId: unknown) {
    if (!comment?.trim()) {
      throw new HttpError(400, "Comment text is required");
    }

    const insertId = await this.commentRepository.create({
      videoId,
      userId,
      parentId: parentId ? Number(parentId) : null,
      comment: comment.trim(),
    });

    const row = await this.commentRepository.findWithAuthorById(insertId);
    const result = { ...row, likeCount: 0, isLiked: false };

    this.socketService.broadcastToVideo(videoId, "comment-added", result);

    const video = await this.videoRepository.findById(videoId);
    if (video && video.userId !== userId && row) {
      const owner = await this.userRepository.findById(video.userId);
      if (owner?.notifyComment) {
        this.mailerService.sendMailFireAndForget({
          to: owner.email,
          ...commentEmail(owner.name, row.userName, video.title, `${process.env.CLIENT_URL}/watch/${video.id}`),
        });
      }
      if (owner) {
        this.socketService.broadcastToUser(owner.id, "notification", {
          type: "comment",
          videoId,
          videoTitle: video.title,
          actorName: row.userName,
        });
        this.socketService.invalidateDashboard(owner.id);
      }
    }

    return result;
  }

  async delete(id: number, userId: number, role: "user" | "admin") {
    const comment = await this.commentRepository.findById(id);
    if (!comment) throw new HttpError(404, "Comment not found");
    if (comment.userId !== userId && role !== "admin") {
      throw new HttpError(403, "You can only delete your own comments");
    }

    await this.commentRepository.delete(id);
  }

  async toggleLike(commentId: number, userId: number) {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new HttpError(404, "Comment not found");

    const existing = await this.commentRepository.findLike(commentId, userId);

    if (existing) {
      await this.commentRepository.deleteLike(existing.id);
    } else {
      await this.commentRepository.createLike(commentId, userId);
    }

    const likeCount = await this.commentRepository.countLikes(commentId);
    this.socketService.broadcastToVideo(comment.videoId, "comment-like-updated", { commentId, likeCount });

    return { liked: !existing, likeCount };
  }
}

export { CommentService };
export const commentService = new CommentService(
  commentRepository,
  videoRepository,
  userRepository,
  mailerService,
  socketService
);
