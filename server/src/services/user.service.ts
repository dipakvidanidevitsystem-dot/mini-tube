import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { sql } from "drizzle-orm";
import { HttpError } from "../utils/HttpError.js";
import { CloudinaryService } from "../utils/cloudinary.js";
import { mailerService, type MailerService } from "../utils/mailer.js";
import { userRepository, type UserRepository } from "../repositories/user.repository.js";
import { videoRepository, type VideoRepository } from "../repositories/video.repository.js";
import { subscriptionRepository, type SubscriptionRepository } from "../repositories/subscription.repository.js";
import { likeRepository, type LikeRepository } from "../repositories/like.repository.js";
import { commentRepository, type CommentRepository } from "../repositories/comment.repository.js";
import { watchHistoryRepository, type WatchHistoryRepository } from "../repositories/watchHistory.repository.js";
import { videoViewRepository, type VideoViewRepository } from "../repositories/videoView.repository.js";
import { socketService, type SocketService } from "../sockets/socket.service.js";
import { newSubscriberEmail, passwordChangedEmail } from "../templates/emails.js";
import { videoViews } from "../db/schema.js";
import type { users } from "../db/schema.js";

type User = typeof users.$inferSelect;
type MulterFiles = { [fieldname: string]: Express.Multer.File[] } | undefined;

function toPublicUser(user: User) {
  const { password, ...publicUser } = user;
  return publicUser;
}

function periodStart(period: unknown) {
  if (period === "week") return dayjs().subtract(7, "day").toDate();
  if (period === "month") return dayjs().subtract(30, "day").toDate();
  if (period === "year") return dayjs().subtract(365, "day").toDate();
  return null;
}

const ACTIVITY_LIMIT = 20;
const ACTIVITY_FEED_SIZE = 15;

type ActivityItem = {
  type: "subscribe" | "comment" | "like" | "milestone";
  actorId?: number;
  actorName?: string;
  actorImage?: string | null;
  createdAt: Date;
  videoId?: number;
  videoTitle?: string;
  commentExcerpt?: string;
  milestone?: number;
};

class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly videoRepository: VideoRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly likeRepository: LikeRepository,
    private readonly commentRepository: CommentRepository,
    private readonly watchHistoryRepository: WatchHistoryRepository,
    private readonly videoViewRepository: VideoViewRepository,
    private readonly cloudinaryService: typeof CloudinaryService,
    private readonly mailerService: MailerService,
    private readonly socketService: SocketService
  ) {}

  async getUser(id: number, viewerId: number | undefined) {
    const user = await this.userRepository.findProfileById(id);
    if (!user) throw new HttpError(404, "User not found");

    const subscriberCount = await this.subscriptionRepository.countForChannel(id);

    const isOwnChannel = viewerId === id;
    const userVideos = await this.videoRepository.findByUser(id, !isOwnChannel);

    let isSubscribed = false;
    if (viewerId) {
      const existing = await this.subscriptionRepository.find(viewerId, id);
      isSubscribed = Boolean(existing);
    }

    return {
      ...user,
      subscriberCount,
      videoCount: userVideos.length,
      videos: userVideos,
      isSubscribed,
    };
  }

  async toggleSubscribe(channelId: number, subscriberId: number) {
    if (channelId === subscriberId) {
      throw new HttpError(400, "You cannot subscribe to your own channel");
    }

    const existing = await this.subscriptionRepository.find(subscriberId, channelId);

    if (existing) {
      await this.subscriptionRepository.delete(existing.id);
    } else {
      await this.subscriptionRepository.create(subscriberId, channelId);

      const channel = await this.userRepository.findById(channelId);
      const subscriber = await this.userRepository.findById(subscriberId);
      if (channel?.notifyNewSubscriber && subscriber) {
        this.mailerService.sendMailFireAndForget({
          to: channel.email,
          ...newSubscriberEmail(channel.name, subscriber.name),
        });
      }
      if (channel && subscriber) {
        this.socketService.broadcastToUser(channel.id, "notification", {
          type: "subscribe",
          actorName: subscriber.name,
        });
        this.socketService.invalidateDashboard(channel.id);
      }
    }

    const subscriberCount = await this.subscriptionRepository.countForChannel(channelId);
    return { subscribed: !existing, subscriberCount };
  }

  async updatePreferences(
    userId: number,
    notifyNewSubscriber: unknown,
    notifyVideoUploaded: unknown,
    notifyComment: unknown,
    notifyLike: unknown
  ) {
    await this.userRepository.update(userId, {
      notifyNewSubscriber: Boolean(notifyNewSubscriber),
      notifyVideoUploaded: Boolean(notifyVideoUploaded),
      notifyComment: Boolean(notifyComment),
      notifyLike: Boolean(notifyLike),
    });

    const user = await this.userRepository.findById(userId);
    return toPublicUser(user!);
  }

  async updateProfile(userId: number, name: string | undefined, files: MulterFiles) {
    const avatarFile = files?.profileImage?.[0];

    const updates: { name?: string; profileImage?: string } = {};
    if (name?.trim()) updates.name = name.trim();

    if (avatarFile) {
      const upload = await this.cloudinaryService.uploadStream(avatarFile.buffer, {
        resourceType: "image",
        folder: "minitube/avatars",
      });
      updates.profileImage = upload.secure_url;
    }

    if (Object.keys(updates).length > 0) {
      await this.userRepository.update(userId, updates);
    }

    const user = await this.userRepository.findById(userId);
    return toPublicUser(user!);
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    if (!currentPassword || !newPassword) {
      throw new HttpError(400, "Current and new password are required");
    }
    if (newPassword.length < 6) {
      throw new HttpError(400, "New password must be at least 6 characters");
    }

    const user = await this.userRepository.findById(userId);
    const valid = await bcrypt.compare(currentPassword, user!.password);
    if (!valid) {
      throw new HttpError(401, "Current password is incorrect");
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user!.id, { password: hashed });

    this.mailerService.sendMailFireAndForget({ to: user!.email, ...passwordChangedEmail(user!.name) });

    return { message: "Password updated successfully" };
  }

  async getDashboard(userId: number) {
    const { videoCount, totalViews } = await this.videoRepository.countAndSumViewsForUser(userId);
    const totalLikes = await this.likeRepository.countForUserVideos(userId);
    const totalComments = await this.commentRepository.countForUserVideos(userId);
    const subscriberCount = await this.subscriptionRepository.countForChannel(userId);

    const monthStart = dayjs().startOf("month").toDate();
    const subscribersGainedThisMonth = await this.subscriptionRepository.countGainedSince(userId, monthStart);

    const { totalWatchedSeconds, avgWatchedSeconds } = await this.videoViewRepository.watchStatsForUser(userId);

    return {
      videoCount,
      totalViews,
      totalLikes,
      totalComments,
      subscriberCount,
      subscribersGainedThisMonth,
      watchTimeHours: totalWatchedSeconds / 3600,
      avgViewDurationSeconds: avgWatchedSeconds,
    };
  }

  async getDashboardHighlights(userId: number, period: unknown) {
    let topVideoId: number | null = null;
    let periodViews: number | null = null;

    if (period === "all") {
      topVideoId = await this.videoRepository.topVideoIdAllTime(userId);
    } else {
      const start = periodStart(period) ?? dayjs(0).toDate();
      const topVideo = await this.videoViewRepository.topVideoForPeriod(userId, start);
      topVideoId = topVideo?.id ?? null;
      periodViews = topVideo?.cnt ?? null;
    }

    let topPerformer = null;
    if (topVideoId) {
      const topVideo = await this.videoRepository.findById(topVideoId);
      const likeCount = await this.likeRepository.countForVideo(topVideoId);
      const commentCount = await this.commentRepository.countForVideo(topVideoId);

      topPerformer = {
        ...topVideo,
        views: periodViews ?? topVideo!.views,
        likeCount,
        commentCount,
      };
    }

    const topViewers = await this.watchHistoryRepository.topViewersForChannel(userId, 5);
    const topSubscribers = await this.subscriptionRepository.topSubscribers(userId, 5);

    return { topPerformer, topViewers, topSubscribers };
  }

  async getViewsSeries(userId: number, period: unknown) {
    const resolvedPeriod = typeof period === "string" ? period : "month";
    const start = periodStart(resolvedPeriod);
    const bucket =
      resolvedPeriod === "year" || resolvedPeriod === "all"
        ? sql`date_format(${videoViews.viewedAt}, '%Y-%m')`
        : sql`date(${videoViews.viewedAt})`;

    const rows = await this.videoViewRepository.viewsSeriesForUser(userId, bucket, start);
    return { period: resolvedPeriod, points: rows };
  }

  async getTopVideos(userId: number, period: unknown) {
    const resolvedPeriod = typeof period === "string" ? period : "all";

    const rows =
      resolvedPeriod === "all"
        ? await this.videoRepository.topVideosAllTime(userId, 10)
        : await this.videoViewRepository.topVideosForPeriod(userId, periodStart(resolvedPeriod) ?? dayjs(0).toDate(), 10);

    return rows.map((row, index) => ({ rank: index + 1, ...row }));
  }

  async getRecentActivity(userId: number) {
    const [newSubscribers, newComments, newLikes, newMilestones] = await Promise.all([
      this.subscriptionRepository.recentForChannel(userId, ACTIVITY_LIMIT),
      this.commentRepository.recentForUserVideos(userId, ACTIVITY_LIMIT),
      this.likeRepository.recentForUserVideos(userId, ACTIVITY_LIMIT),
      this.videoViewRepository.recentMilestonesForUser(userId, ACTIVITY_LIMIT),
    ]);

    const activity: ActivityItem[] = [
      ...newSubscribers.map((row) => ({ type: "subscribe" as const, ...row })),
      ...newComments.map((row) => ({ type: "comment" as const, ...row })),
      ...newLikes.map((row) => ({ type: "like" as const, ...row })),
      ...newMilestones.map((row) => ({ type: "milestone" as const, ...row })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, ACTIVITY_FEED_SIZE);

    return activity;
  }

  async getAudienceActivity(userId: number) {
    return this.videoViewRepository.audienceActivityForUser(userId);
  }
}

export { UserService };
export const userService = new UserService(
  userRepository,
  videoRepository,
  subscriptionRepository,
  likeRepository,
  commentRepository,
  watchHistoryRepository,
  videoViewRepository,
  CloudinaryService,
  mailerService,
  socketService
);
