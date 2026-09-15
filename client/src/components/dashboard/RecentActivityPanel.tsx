import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { useGetRecentActivityQuery } from "../../store/api/usersApi";
import type { ActivityItem } from "../../types";
import ErrorState from "../ErrorState";
import EmptyState from "../EmptyState";

function describeActivity(item: ActivityItem): string {
  switch (item.type) {
    case "subscribe":
      return `${item.actorName} subscribed to your channel`;
    case "comment":
      return `${item.actorName} commented on ${item.videoTitle}`;
    case "like":
      return `${item.actorName} liked ${item.videoTitle}`;
    case "milestone":
      return `Your video "${item.videoTitle}" reached ${item.milestone?.toLocaleString()} views`;
  }
}

function activityLink(item: ActivityItem): string | null {
  if (item.videoId) return `/watch/${item.videoId}`;
  if (item.type === "subscribe" && item.actorId) return `/channel/${item.actorId}`;
  return null;
}

const ROW_CLASS =
  "flex items-start gap-3 rounded-sm border-b border-border px-2 -mx-2 py-3 transition-colors last:border-b-0 last:pb-0 first:pt-0 dark:border-border-dark";
const ROW_INTERACTIVE_CLASS = "hover:bg-muted dark:hover:bg-card-dark";

export default function RecentActivityPanel() {
  const { data: activity, isLoading: loading, isError: hasError, refetch } = useGetRecentActivityQuery();
  const visibleActivity = activity?.slice(0, 5);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="body2" fontWeight={600} className="mb-2">
          Recent Activity
        </Typography>

        {loading && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-start gap-3 py-1">
                <Skeleton variant="circular" width={30} height={30} />
                <div className="flex-1">
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="30%" height={16} />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && hasError && <ErrorState message="Couldn't load recent activity." onRetry={refetch} />}
        {!loading && !hasError && visibleActivity && visibleActivity.length === 0 && (
          <EmptyState message="No recent activity yet." />
        )}
        {!loading && !hasError && visibleActivity && visibleActivity.length > 0 && (
          <div>
            {visibleActivity.map((item, index) => {
              const content = (
                <>
                  <Avatar src={item.actorImage || undefined} sx={{ width: 30, height: 30 }}>
                    {item.actorName?.[0]?.toUpperCase() ?? "🎬"}
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground dark:text-foreground-dark">{describeActivity(item)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground dark:text-muted-foreground-dark">
                      {dayjs(item.createdAt).format("MMM D, YYYY h:mm A")}
                    </p>
                  </div>
                </>
              );
              const key = `${item.type}-${item.createdAt}-${index}`;
              const to = activityLink(item);

              return to ? (
                <Link key={key} to={to} className={`${ROW_CLASS} ${ROW_INTERACTIVE_CLASS}`}>
                  {content}
                </Link>
              ) : (
                <div key={key} className={ROW_CLASS}>
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
