import { useState } from "react";
import Button from "../Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import { CaretDown, Play } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { useGetDashboardHighlightsQuery } from "../../store/api/usersApi";
import type { ChartPeriod } from "../../types";
import { formatDate } from "../../lib/format";
import ErrorState from "../ErrorState";
import EmptyState from "../EmptyState";
import OverflowTooltip from "../OverflowTooltip";

const PERIOD_OPTIONS: { value: ChartPeriod; label: string; eyebrow: string }[] = [
  { value: "week", label: "This week", eyebrow: "Your best video this week" },
  { value: "month", label: "This month", eyebrow: "Your best video this month" },
  { value: "year", label: "This year", eyebrow: "Your best video this year" },
  { value: "all", label: "All time", eyebrow: "Your best video of all time" },
];

export default function TopPerformerCard() {
  const [period, setPeriod] = useState<ChartPeriod>("month");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { data, isLoading: loading, isError: hasError, refetch } = useGetDashboardHighlightsQuery(period);

  const selected = PERIOD_OPTIONS.find((opt) => opt.value === period)!;
  const video = data?.topPerformer ?? null;

  const periodMenu = (
    <>
      <button
        type="button"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1.5 text-xs text-foreground dark:border-border-dark dark:bg-muted-dark dark:text-foreground-dark"
      >
        {selected.label}
        <CaretDown size={16} />
      </button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {PERIOD_OPTIONS.map((opt) => (
          <MenuItem
            key={opt.value}
            selected={opt.value === period}
            onClick={() => {
              setPeriod(opt.value);
              setAnchorEl(null);
            }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );

  if (loading) {
    return (
      <Card variant="outlined">
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Skeleton variant="rounded" className="aspect-video w-full sm:w-48" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton variant="text" width={140} height={20} />
              <Skeleton variant="text" width="80%" height={28} />
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="rounded" width={100} height={32} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card variant="outlined">
        <CardContent>
          <ErrorState message="Couldn't load your top performer." onRetry={refetch} />
        </CardContent>
      </Card>
    );
  }

  if (!video) {
    return (
      <Card variant="outlined">
        <CardContent>
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-sm font-semibold text-accent">{selected.eyebrow}</span>
            <span className="shrink-0">{periodMenu}</span>
          </div>
          <EmptyState message="No video performance yet for this period." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full shrink-0 sm:w-48">
          <img
            src={video.thumbnailUrl}
            alt=""
            className="aspect-video w-full rounded-sm object-cover"
          />
          <span className="absolute left-2 top-2 rounded-sm bg-accent px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-on-accent">
            Top Performer
          </span>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80">
              <Play className="text-primary" weight="fill" />
            </span>
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-sm font-semibold text-accent">{selected.eyebrow}</span>
            <span className="shrink-0">{periodMenu}</span>
          </div>
          <OverflowTooltip
            component="h3"
            className="w-full text-lg font-semibold text-foreground dark:text-foreground-dark sm:text-xl"
            title={video.title}
            lines={2}
          >
            {video.title}
          </OverflowTooltip>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground dark:text-muted-foreground-dark sm:gap-x-6">
            <span>{video.views.toLocaleString()} views</span>
            <span>{video.likeCount.toLocaleString()} likes</span>
            <span>{video.commentCount.toLocaleString()} comments</span>
            <span>Published {formatDate(video.createdAt)}</span>
          </div>
          <Button component={Link} to={`/watch/${video.id}`} variant="contained" size="small" className="w-full sm:w-fit">
            Watch video
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
