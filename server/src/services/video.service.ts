import { HttpError } from "../utils/HttpError.js";
import { CloudinaryService } from "../utils/cloudinary.js";
import { mailerService, type MailerService } from "../utils/mailer.js";
import { videoRepository, type VideoRepository } from "../repositories/video.repository.js";
import { likeRepository, type LikeRepository } from "../repositories/like.repository.js";
import { reportRepository, type ReportRepository } from "../repositories/report.repository.js";
import { videoViewRepository, type VideoViewRepository } from "../repositories/videoView.repository.js";
import { userRepository, type UserRepository } from "../repositories/user.repository.js";
import { socketService, type SocketService } from "../sockets/socket.service.js";
import { videoProcessingService, type VideoProcessingService } from "./videoProcessing.service.js";
import { likeEmail } from "../templates/emails.js";

type MulterFiles = { [fieldname: string]: Express.Multer.File[] } | undefined;

function watchUrl(videoId: number) {
  return `${process.env.CLIENT_URL}/watch/${videoId}`;
}

function resolveVisibility(value: unknown, fallback: "public" | "private" = "public") {
  return value === "private" ? "private" : value === "public" ? "public" : fallback;
}

class VideoService {
  constructor(
    private readonly videoRepository: VideoRepository,
    private readonly likeRepository: LikeRepository,
    private readonly reportRepository: ReportRepository,
    private readonly videoViewRepository: VideoViewRepository,
    private readonly userRepository: UserRepository,
    private readonly mailerService: MailerService,
    private readonly socketService: SocketService,
    private readonly videoProcessingService: VideoProcessingService
  ) {}

  async list(category: string | undefined, sort: unknown, limit: number, offset: number) {
    return this.videoRepository.listPublic(category, sort, limit, offset);
  }

  async search(q: string, category: string | undefined, sort: unknown, limit: number, offset: number) {
    if (!q) return { rows: [], total: 0 };
    return this.videoRepository.searchPublic(q, category, sort, limit, offset);
  }

  async getById(id: number, userId: number | undefined) {
    const existingVideo = await this.videoRepository.findById(id);
    if (!existingVideo) throw new HttpError(404, "Video not found");
    if (existingVideo.visibility === "private" && existingVideo.userId !== userId) {
      throw new HttpError(404, "Video not found");
    }

    if (existingVideo.processingStatus !== "ready") {
      const pendingVideo = await this.videoRepository.findWithCreatorById(id);
      if (!pendingVideo) throw new HttpError(404, "Video not found");
      return { ...pendingVideo, likeCount: 0, isLiked: false, videoViewId: null };
    }

    const [viewResult] = await Promise.all([
      this.videoViewRepository.insertView(id, userId ?? null),
      this.videoRepository.incrementViews(id),
    ]);

    const video = await this.videoRepository.findWithCreatorById(id);
    if (!video) throw new HttpError(404, "Video not found");

    this.videoViewRepository.checkMilestones(id, video.views).catch(() => {});
    this.socketService.broadcastToVideo(id, "view-updated", { videoId: id, views: video.views });

    const likeCount = await this.likeRepository.countForVideo(id);

    let isLiked = false;
    if (userId) {
      const existing = await this.likeRepository.find(id, userId);
      isLiked = Boolean(existing);
    }

    return { ...video, likeCount, isLiked, videoViewId: viewResult.insertId };
  }

  async reportWatchProgress(videoId: number, videoViewId: number, seconds: number, userId: number | undefined) {
    if (!Number.isFinite(videoViewId) || !Number.isFinite(seconds) || seconds < 0) {
      throw new HttpError(400, "Invalid watch progress payload");
    }

    await this.videoViewRepository.updateWatchProgress(videoViewId, videoId, Math.floor(seconds), userId);

    const video = await this.videoRepository.findById(videoId);
    if (video) this.videoViewRepository.checkMilestones(videoId, video.views).catch(() => {});
  }

  async create(
    userId: number,
    title: string,
    description: string | undefined,
    category: string | undefined,
    visibility: unknown,
    files: MulterFiles
  ) {
    const videoFile = files?.video?.[0];
    const thumbnailFile = files?.thumbnail?.[0];

    if (!title || !videoFile) {
      throw new HttpError(400, "Title and video are required");
    }

    const video = await this.videoRepository.create({
      userId,
      title,
      description: description || null,
      category: category || null,
      visibility: resolveVisibility(visibility),
      videoUrl: "",
      thumbnailUrl: "",
      processingStatus: "pending",
    });

    this.videoProcessingService
      .processAsync(video.id, userId, videoFile.buffer, thumbnailFile?.buffer)
      .catch((err) => console.error("Video processing failed to start:", err));

    return video;
  }

  async update(
    id: number,
    userId: number,
    title: string | undefined,
    description: string | undefined,
    category: string | undefined,
    visibility: unknown,
    files: MulterFiles
  ) {
    const video = await this.videoRepository.findById(id);
    if (!video) throw new HttpError(404, "Video not found");
    if (video.userId !== userId) {
      throw new HttpError(403, "You can only edit your own videos");
    }

    const thumbnailFile = files?.thumbnail?.[0];

    const updates: {
      title: string;
      description: string | null;
      category: string | null;
      visibility: "public" | "private";
      thumbnailUrl?: string;
    } = {
      title: title ?? video.title,
      description: description ?? video.description,
      category: category ?? video.category,
      visibility: resolveVisibility(visibility, video.visibility),
    };

    if (thumbnailFile) {
      const thumbnailUpload = await CloudinaryService.uploadStream(thumbnailFile.buffer, {
        resourceType: "image",
        folder: "minitube/thumbnails",
      });
      updates.thumbnailUrl = thumbnailUpload.secure_url;
    }

    await this.videoRepository.update(id, updates);
    return this.videoRepository.findById(id);
  }

  async delete(id: number, userId: number, role: "user" | "admin") {
    const video = await this.videoRepository.findById(id);
    if (!video) throw new HttpError(404, "Video not found");
    if (video.userId !== userId && role !== "admin") {
      throw new HttpError(403, "You can only delete your own videos");
    }

    await this.videoRepository.delete(id);
  }

  async toggleLike(videoId: number, userId: number) {
    const existing = await this.likeRepository.find(videoId, userId);

    if (existing) {
      await this.likeRepository.delete(existing.id);
    } else {
      await this.likeRepository.create(videoId, userId);

      const video = await this.videoRepository.findById(videoId);
      if (video && video.userId !== userId) {
        const owner = await this.userRepository.findById(video.userId);
        const liker = await this.userRepository.findById(userId);
        if (owner?.notifyLike && liker) {
          this.mailerService.sendMailFireAndForget({
            to: owner.email,
            ...likeEmail(owner.name, liker.name, video.title, watchUrl(video.id)),
          });
        }
        if (owner) {
          this.socketService.broadcastToUser(owner.id, "notification", {
            type: "like",
            videoId,
            videoTitle: video.title,
          });
          this.socketService.invalidateDashboard(owner.id);
        }
      }
    }

    const likeCount = await this.likeRepository.countForVideo(videoId);
    this.socketService.broadcastToVideo(videoId, "like-updated", { videoId, likeCount });

    return { liked: !existing, likeCount };
  }

  async report(videoId: number, reporterId: number, reason: string) {
    if (!reason?.trim()) {
      throw new HttpError(400, "Please describe the reason for reporting this video");
    }

    const video = await this.videoRepository.findById(videoId);
    if (!video) throw new HttpError(404, "Video not found");

    await this.reportRepository.create({ videoId, reporterId, reason: reason.trim() });
  }
}

export { VideoService };
export const videoService = new VideoService(
  videoRepository,
  likeRepository,
  reportRepository,
  videoViewRepository,
  userRepository,
  mailerService,
  socketService,
  videoProcessingService
);
