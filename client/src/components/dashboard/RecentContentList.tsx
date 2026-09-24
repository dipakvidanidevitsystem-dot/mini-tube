import { useState } from "react";
import Skeleton from "@mui/material/Skeleton";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, ListNumbers, ThumbsUp } from "@phosphor-icons/react";
import Select from "../Select";
import { useGetTopVideosQuery } from "../../store/api/usersApi";
import type { TablePeriod } from "../../types";
import { formatCompact, formatDate } from "../../lib/format";
import ErrorState from "../ErrorState";
import EmptyState from "../EmptyState";
import OverflowTooltip from "../OverflowTooltip";
import Panel from "../Panel";

const PERIOD_OPTIONS: { value: TablePeriod; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "month", label: "This month" },
  { value: "week", label: "This week" },
];

export default function RecentContentList() {
  const [period, setPeriod] = useState<TablePeriod>("all");
  const { data: rows, isLoading: loading, isError: hasError, refetch } = useGetTopVideosQuery(period);
  const visibleRows = rows?.slice(0, 5);

  return (
    <Panel
      title="Top content"
      description="Ranked by views"
      icon={ListNumbers}
      actions={
        <Select
          dense
          size="small"
          value={period}
          onChange={(e) => setPeriod(e.target.value as TablePeriod)}
          options={PERIOD_OPTIONS}
          slotProps={{ htmlInput: { "aria-label": "Period" } }}
        />
      }
    >
      {loading && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <Skeleton variant="rounded" width={80} height={45} />
              <div className="flex-1">
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" width="40%" />
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
        <>
          <ol>
            {visibleRows.map((row) => (
              <li key={row.id}>
                <Link
                  to={`/watch/${row.id}`}
                  className="-mx-2 flex items-center gap-sm rounded-md px-2 py-2 transition-colors duration-fast hover:bg-muted"
                >
                  <span
                    className={`tabular w-5 shrink-0 text-center font-heading text-caption-strong ${
                      row.rank === 1 ? "text-accent" : "text-muted-foreground"
                    }`}
                  >
                    {row.rank}
                  </span>
                  <img
                    src={row.thumbnailUrl}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-20 shrink-0 rounded-sm bg-muted object-cover ring-1 ring-inset ring-border"
                  />
                  <div className="min-w-0 flex-1">
                    <OverflowTooltip title={row.title} className="block text-caption-strong text-foreground">
                      {row.title}
                    </OverflowTooltip>
                    <p className="tabular mt-0.5 flex items-center gap-2 text-fine-print text-muted-foreground">
                      <span>{formatDate(row.createdAt)}</span>
                      <span className="inline-flex items-center gap-0.5">
                        <ThumbsUp size={12} aria-hidden />
                        <span className="sr-only">Likes:</span>
                        {formatCompact(row.likeCount)}
                      </span>
                    </p>
                  </div>
                  <span className="tabular inline-flex shrink-0 items-center gap-1 text-caption-strong text-foreground" title={`${row.views.toLocaleString()} views`}>
                    <Eye size={14} className="text-muted-foreground" aria-hidden />
                    {formatCompact(row.views)}
                    <span className="sr-only"> views</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <Link
            to="/my-videos"
            className="mt-sm inline-flex items-center gap-1 text-caption-strong text-accent transition-colors duration-fast hover:text-accent-hover"
          >
            View all videos
            <ArrowRight size={14} weight="bold" aria-hidden />
          </Link>
        </>
      )}
    </Panel>
  );
}
