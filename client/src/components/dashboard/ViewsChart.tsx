import { useId, useState } from "react";
import Skeleton from "@mui/material/Skeleton";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ChartLineUp } from "@phosphor-icons/react";
import Select from "../Select";
import { useGetDashboardQuery, useGetViewsSeriesQuery } from "../../store/api/usersApi";
import { useAppSelector } from "../../store/hooks";
import { tokenColor } from "../../theme/tokens";
import { formatCompact } from "../../lib/format";
import type { ChartPeriod } from "../../types";
import ErrorState from "../ErrorState";
import EmptyState from "../EmptyState";
import Panel from "../Panel";

const PERIOD_OPTIONS: { value: ChartPeriod; label: string }[] = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
  { value: "all", label: "All time" },
];

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value?: number | string }[];
  label?: string | number;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-elevated px-3 py-2 shadow-float">
      <p className="text-fine-print text-muted-foreground">{label}</p>
      <p className="tabular text-caption-strong text-foreground">{Number(payload[0].value).toLocaleString()} views</p>
    </div>
  );
}

export default function ViewsChart() {
  const [period, setPeriod] = useState<ChartPeriod>("month");
  const { data, isLoading: loading, isError: hasError, refetch } = useGetViewsSeriesQuery(period);
  const { data: stats } = useGetDashboardQuery();
  const mode = useAppSelector((state) => state.theme.mode);
  const gradientId = useId().replace(/:/g, "");
  const points = data?.points;
  const periodLabel = PERIOD_OPTIONS.find((opt) => opt.value === period)?.label.toLowerCase() ?? "yet";
  const total = points?.reduce((sum, p) => sum + p.views, 0) ?? 0;

  const accent = tokenColor(mode, "accent");
  const axis = tokenColor(mode, "muted-foreground");
  const grid = tokenColor(mode, "border", 0.7);

  return (
    <Panel
      id="views-analytics"
      title="Views"
      description={points && points.length > 0 ? `${total.toLocaleString()} views ${periodLabel}` : "Daily views over time"}
      icon={ChartLineUp}
      actions={
        <Select
          dense
          size="small"
          value={period}
          onChange={(e) => setPeriod(e.target.value as ChartPeriod)}
          options={PERIOD_OPTIONS}
          slotProps={{ htmlInput: { "aria-label": "Chart period" } }}
        />
      }
    >
      {stats && (
        <dl className="tabular mb-md grid grid-cols-3 gap-sm rounded-md bg-muted/50 p-sm">
          <div>
            <dt className="text-fine-print text-muted-foreground">Subscribers</dt>
            <dd className="text-body-strong text-foreground">{formatCompact(stats.subscriberCount)}</dd>
          </div>
          <div>
            <dt className="text-fine-print text-muted-foreground">Gained this month</dt>
            <dd className="text-body-strong text-success">+{formatCompact(stats.subscribersGainedThisMonth)}</dd>
          </div>
          <div>
            <dt className="text-fine-print text-muted-foreground">Watch time</dt>
            <dd className="text-body-strong text-foreground">{stats.watchTimeHours.toFixed(1)} h</dd>
          </div>
        </dl>
      )}

      {loading && <Skeleton variant="rounded" width="100%" height={260} />}
      {!loading && hasError && <ErrorState message="Couldn't load views data." onRetry={refetch} />}
      {!loading && !hasError && points && points.length === 0 && (
        <EmptyState icon={ChartLineUp} message={`No views ${periodLabel}. Publish a video to see trends here.`} />
      )}
      {!loading && !hasError && points && points.length > 0 && (
        <figure aria-label={`Area chart of views ${periodLabel}, ${total.toLocaleString()} total across ${points.length} data points.`}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={points} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={grid} />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: axis }} minTickGap={24} />
              <YAxis
                allowDecimals={false}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: axis }}
                tickFormatter={(v: number) => formatCompact(v)}
                width={48}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: axis, strokeDasharray: "4 4" }} />
              <Area
                type="monotone"
                dataKey="views"
                stroke={accent}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                activeDot={{ r: 5, strokeWidth: 2, stroke: tokenColor(mode, "card"), fill: accent }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </figure>
      )}
    </Panel>
  );
}
