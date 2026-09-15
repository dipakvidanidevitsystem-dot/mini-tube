export type Role = "user" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  profileImage: string | null;
  role: Role;
  disabled: boolean;
  notifyNewSubscriber: boolean;
  notifyVideoUploaded: boolean;
  notifyComment: boolean;
  notifyLike: boolean;
  createdAt: string;
}

export type NotificationPreferences = Pick<
  User,
  "notifyNewSubscriber" | "notifyVideoUploaded" | "notifyComment" | "notifyLike"
>;

export type Visibility = "public" | "private";

export type ProcessingStatus = "pending" | "ready" | "failed";

export interface Video {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string;
  category: string | null;
  visibility: Visibility;
  views: number;
  duration: number;
  createdAt: string;
  creatorName: string;
  creatorImage: string | null;
  processingStatus: ProcessingStatus;
  processingError?: string | null;
}

export interface VideoDetail extends Video {
  likeCount: number;
  isLiked: boolean;
  videoViewId: number | null;
}

export interface HistoryVideo extends Video {
  watchedAt: string;
}

export interface SavedVideo extends Video {
  savedAt: string;
}

export interface Comment {
  id: number;
  videoId: number;
  userId: number;
  parentId: number | null;
  comment: string;
  createdAt: string;
  userName: string;
  userImage: string | null;
  likeCount: number;
  isLiked: boolean;
}

export interface ChannelProfile {
  id: number;
  name: string;
  profileImage: string | null;
  createdAt: string;
  subscriberCount: number;
  videoCount: number;
  videos: Video[];
  isSubscribed: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type SortOption = "latest" | "views" | "likes";

export interface DashboardStats {
  videoCount: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  subscriberCount: number;
  subscribersGainedThisMonth: number;
  watchTimeHours: number;
  avgViewDurationSeconds: number;
}

export interface TopPerformerVideo extends Video {
  likeCount: number;
  commentCount: number;
}

export interface RankedUser {
  id: number;
  name: string;
  profileImage: string | null;
  count: number;
}

export interface RankedSubscriber {
  id: number;
  name: string;
  profileImage: string | null;
  subscribedAt: string;
}

export interface DashboardHighlights {
  topPerformer: TopPerformerVideo | null;
  topViewers: RankedUser[];
  topSubscribers: RankedSubscriber[];
}

export interface AudienceActivity {
  returningViewers: number;
  newViewers: number;
}

export type ChartPeriod = "week" | "month" | "year" | "all";

export interface ViewsSeries {
  period: ChartPeriod;
  points: { date: string; views: number }[];
}

export type TablePeriod = "all" | "month" | "week";

export interface TopVideo {
  rank: number;
  id: number;
  title: string;
  thumbnailUrl: string;
  createdAt: string;
  likeCount: number;
  views: number;
}

export type ActivityType = "subscribe" | "comment" | "like" | "milestone";

export interface ActivityItem {
  type: ActivityType;
  actorId?: number;
  actorName?: string;
  actorImage?: string | null;
  createdAt: string;
  videoId?: number;
  videoTitle?: string;
  commentExcerpt?: string;
  milestone?: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  disabled: boolean;
  createdAt: string;
}

export interface AdminVideo {
  id: number;
  title: string;
  userId: number;
  visibility: Visibility;
  views: number;
  createdAt: string;
  creatorName: string;
}

export interface AdminComment {
  id: number;
  comment: string;
  videoId: number;
  userId: number;
  createdAt: string;
  userName: string;
}

export type ReportStatus = "pending" | "reviewed";

export interface AdminReport {
  id: number;
  videoId: number;
  videoTitle: string;
  reporterId: number;
  reporterName: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}
