import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import { Link } from "react-router-dom";
import { ChatCircle, Heart, Lightning, Trophy, UserPlus, type Icon } from "@phosphor-icons/react";
import dayjs from "../../lib/dayjs";
import { useGetRecentActivityQuery } from "../../store/api/usersApi";
import type { ActivityItem } from "../../types";
import ErrorState from "../ErrorState";
import EmptyState from "../EmptyState";
import Panel from "../Panel";

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

const TYPE_ICON: Record<ActivityItem["type"], { icon: Icon; className: string }> = {
  subscribe: { icon: UserPlus, className: "bg-info text-on-accent" },
  comment: { icon: ChatCircle, className: "bg-foreground text-background" },
  like: { icon: Heart, className: "bg-accent-strong text-on-accent" },
  milestone: { icon: Trophy, className: "bg-warning text-on-primary" },
};

function activityLink(item: ActivityItem): string | null {
  if (item.videoId) return `/watch/${item.videoId}`;
  if (item.type === "subscribe" && item.actorId) return `/channel/${item.actorId}`;
  return null;
}

const ROW_CLASS = "-mx-2 flex items-start gap-sm rounded-md px-2 py-2.5 transition-colors duration-fast";

export default function RecentActivityPanel() {
  const { data: activity, isLoading: loading, isError: hasError, refetch } = useGetRecentActivityQuery();
  const visibleActivity = activity?.slice(0, 5);

  return (
    <Panel title="Recent activity" description="Latest interactions on your channel" icon={Lightning}>
      {loading && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-start gap-3 py-1">
              <Skeleton variant="circular" width={34} height={34} />
              <div className="flex-1">
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="30%" />
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && hasError && <ErrorState message="Couldn't load recent activity." onRetry={refetch} />}
      {!loading && !hasError && visibleActivity && visibleActivity.length === 0 && (
        <EmptyState icon={Lightning} message="No recent activity yet." />
      )}
      {!loading && !hasError && visibleActivity && visibleActivity.length > 0 && (
        <ul>
          {visibleActivity.map((item, index) => {
            const { icon: TypeIcon, className: typeClass } = TYPE_ICON[item.type];
            const content = (
              <>
                <span className="relative shrink-0">
                  <Avatar src={item.actorImage || undefined} alt="" sx={{ width: 34, height: 34, fontSize: 13 }}>
                    {item.actorName?.[0]?.toUpperCase()}
                  </Avatar>
                  <span
                    aria-hidden
                    className={`absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full ring-2 ring-card ${typeClass}`}
                  >
                    <TypeIcon size={10} weight="fill" />
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="text-caption text-foreground">{describeActivity(item)}</p>
                  <time
                    dateTime={item.createdAt}
                    title={dayjs(item.createdAt).format("MMM D, YYYY h:mm A")}
                    className="mt-0.5 block text-fine-print text-muted-foreground"
                  >
                    {dayjs(item.createdAt).fromNow()}
                  </time>
                </div>
              </>
            );
            const key = `${item.type}-${item.createdAt}-${index}`;
            const to = activityLink(item);

            return (
              <li key={key}>
                {to ? (
                  <Link to={to} className={`${ROW_CLASS} hover:bg-muted`}>
                    {content}
                  </Link>
                ) : (
                  <div className={ROW_CLASS}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
