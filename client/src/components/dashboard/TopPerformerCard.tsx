import { useState } from "react";
import Button from "../Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import { CaretDown, ChatCircle, Eye, Play, ThumbsUp, Trophy } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { useGetDashboardHighlightsQuery } from "../../store/api/usersApi";
import type { ChartPeriod } from "../../types";
import { formatCompact, formatDate } from "../../lib/format";
import ErrorState from "../ErrorState";
import EmptyState from "../EmptyState";
import OverflowTooltip from "../OverflowTooltip";

const PERIOD_OPTIONS: { value: ChartPeriod; label: string; eyebrow: string }[] = [
  { value: "week", label: "This week", eyebrow: "Top performer this week" },
  { value: "month", label: "This month", eyebrow: "Top performer this month" },
  { value: "year", label: "This year", eyebrow: "Top performer this year" },
  { value: "all", label: "All time", eyebrow: "Top performer of all time" },
];

const SHELL = "relative overflow-hidden rounded-lg border border-border bg-card p-md lg:p-lg";

export default function TopPerformerCard() {
  const [period, setPeriod] = useState<ChartPeriod>("month");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { data, isLoading: loading, isError: hasError, refetch } = useGetDashboardHighlightsQuery(period);

  const selected = PERIOD_OPTIONS.find((opt) => opt.value === period)!;
  const video = data?.topPerformer ?? null;

  const header = (
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex min-w-0 items-center gap-1.5 text-fine-print font-semibold uppercase tracking-wider text-accent">
        <Trophy size={14} weight="fill" aria-hidden />
        <span className="truncate">{selected.eyebrow}</span>
      </span>
      <button
        type="button"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorEl)}
        aria-label={`Period: ${selected.label}`}
        className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-border bg-muted/60 px-3 text-fine-print font-semibold text-foreground transition-colors duration-fast hover:border-foreground/25"
      >
        {selected.label}
        <CaretDown size={12} weight="bold" aria-hidden />
      </button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
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
    </div>
  );

  if (loading) {
    return (
      <div className={SHELL}>
        <div className="flex flex-col gap-md sm:flex-row sm:items-center">
          <Skeleton variant="rounded" className="!aspect-video !h-auto w-full sm:!w-64" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton variant="text" width={160} />
            <Skeleton variant="text" width="80%" sx={{ fontSize: "22px" }} />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="rounded" width={120} height={36} />
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={SHELL}>
        <ErrorState message="Couldn't load your top performer." onRetry={refetch} />
      </div>
    );
  }

  if (!video) {
    return (
      <div className={SHELL}>
        {header}
        <EmptyState icon={Trophy} message="No video performance yet for this period." />
      </div>
    );
  }

  const stats = [
    { icon: Eye, label: "views", value: video.views },
    { icon: ThumbsUp, label: "likes", value: video.likeCount },
    { icon: ChatCircle, label: "comments", value: video.commentCount },
  ];

  return (
    <div className={SHELL}>
      <span aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative flex flex-col gap-md sm:flex-row sm:items-center lg:gap-lg">
        <Link
          to={`/watch/${video.id}`}
          aria-label={`Watch ${video.title}`}
          className="group relative block w-full shrink-0 overflow-hidden rounded-md ring-1 ring-inset ring-border sm:w-64"
        >
          <img
            src={video.thumbnailUrl}
            alt=""
            className="aspect-video w-full object-cover transition-transform duration-enter ease-out group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-scrim/20 opacity-0 transition-opacity duration-enter group-hover:opacity-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-strong text-on-accent shadow-glow-accent">
              <Play size={18} weight="fill" aria-hidden />
            </span>
          </span>
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-sm">
          {header}
          <OverflowTooltip component="h3" className="w-full text-lead text-foreground font-heading" title={video.title} lines={2}>
            {video.title}
          </OverflowTooltip>
          <ul className="tabular flex flex-wrap gap-x-md gap-y-1 text-caption text-muted-foreground">
            {stats.map(({ icon: StatIcon, label, value }) => (
              <li key={label} className="inline-flex items-center gap-1.5" title={`${value.toLocaleString()} ${label}`}>
                <StatIcon size={16} aria-hidden />
                <span className="font-semibold text-foreground">{formatCompact(value)}</span> {label}
              </li>
            ))}
            <li>Published {formatDate(video.createdAt)}</li>
          </ul>
          <Button
            component={Link}
            to={`/watch/${video.id}`}
            variant="contained"
            size="small"
            startIcon={<Play size={14} weight="fill" />}
            className="w-full sm:w-fit"
          >
            Watch video
          </Button>
        </div>
      </div>
    </div>
  );
}
