import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Select from "../Select";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { Link } from "react-router-dom";
import { useGetTopVideosQuery } from "../../store/api/usersApi";
import type { TablePeriod } from "../../types";
import { formatDate } from "../../lib/format";
import ErrorState from "../ErrorState";
import EmptyState from "../EmptyState";
import OverflowTooltip from "../OverflowTooltip";

const PERIOD_OPTIONS: { value: TablePeriod; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "month", label: "This Month" },
  { value: "week", label: "This Week" },
];

export default function RecentContentList() {
  const [period, setPeriod] = useState<TablePeriod>("all");
  const { data: rows, isLoading: loading, isError: hasError, refetch } = useGetTopVideosQuery(period);
  const visibleRows = rows?.slice(0, 5);

  return (
    <Card variant="outlined">
      <CardContent>
        <div className="mb-2 flex items-center justify-between">
          <Typography variant="body2" fontWeight={600}>
            Recent Content
          </Typography>
          <Select
            size="small"
            value={period}
            onChange={(e) => setPeriod(e.target.value as TablePeriod)}
            options={PERIOD_OPTIONS}
          />
        </div>

        {loading && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <Skeleton variant="rounded" width={64} height={40} />
                <div className="flex-1">
                  <Skeleton variant="text" width="70%" height={20} />
                  <Skeleton variant="text" width="40%" height={16} />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && hasError && <ErrorState message="Couldn't load top videos." onRetry={refetch} />}
        {!loading && !hasError && visibleRows && visibleRows.length === 0 && (
          <EmptyState message="No views recorded for this period yet." />
        )}
        {!loading && !hasError && visibleRows && visibleRows.length > 0 && (
          <div>
            {visibleRows.map((row) => (
              <Link
                key={row.id}
                to={`/watch/${row.id}`}
                className="flex items-center gap-3 rounded-sm border-b border-border px-2 -mx-2 py-3 transition-colors last:border-b-0 last:pb-0 first:pt-0 hover:bg-muted dark:border-border-dark dark:hover:bg-card-dark"
              >
                <span className="w-4 shrink-0 text-xs font-medium text-muted-foreground dark:text-muted-foreground-dark">
                  {row.rank}
                </span>
                <img
                  src={row.thumbnailUrl}
                  alt=""
                  className="h-10 w-16 shrink-0 rounded-sm bg-border object-cover dark:bg-border-dark"
                />
                <div className="min-w-0 flex-1">
                  <OverflowTooltip title={row.title} className="text-sm font-semibold text-foreground dark:text-foreground-dark">
                    {row.title}
                  </OverflowTooltip>
                  <p className="mt-0.5 text-xs text-muted-foreground dark:text-muted-foreground-dark">
                    {formatDate(row.createdAt)} · {row.likeCount.toLocaleString()}{" "}
                    {row.likeCount === 1 ? "like" : "likes"}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-foreground dark:text-foreground-dark">
                  {row.views.toLocaleString()} views
                </span>
              </Link>
            ))}
            <Link to="/my-videos" className="mt-2 block text-right text-sm text-accent">
              View all →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
