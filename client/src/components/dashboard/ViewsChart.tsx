import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Select from "../Select";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useGetDashboardQuery, useGetViewsSeriesQuery } from "../../store/api/usersApi";
import type { ChartPeriod } from "../../types";
import ErrorState from "../ErrorState";
import EmptyState from "../EmptyState";

const PERIOD_OPTIONS: { value: ChartPeriod; label: string }[] = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
];

export default function ViewsChart() {
  const [period, setPeriod] = useState<ChartPeriod>("month");
  const { data, isLoading: loading, isError: hasError, refetch } = useGetViewsSeriesQuery(period);
  const { data: stats } = useGetDashboardQuery();
  const points = data?.points;
  const theme = useTheme();
  const periodLabel = PERIOD_OPTIONS.find((opt) => opt.value === period)?.label.toLowerCase() ?? "yet";

  return (
    <Card variant="outlined" id="views-analytics">
      <CardContent>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <Typography variant="body2" fontWeight={600}>
            Views Analytics
          </Typography>
          <Select
            size="small"
            value={period}
            onChange={(e) => setPeriod(e.target.value as ChartPeriod)}
            options={PERIOD_OPTIONS}
          />
        </div>

        {stats && (
          <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-caption text-muted-foreground dark:text-muted-foreground-dark">
            <span>{stats.subscriberCount.toLocaleString()} subscribers</span>
            <span>+{stats.subscribersGainedThisMonth.toLocaleString()} this month</span>
            <span>{stats.watchTimeHours.toFixed(1)} hrs watch time</span>
          </div>
        )}

        {loading && <Skeleton variant="rounded" width="100%" height={260} />}
        {!loading && hasError && <ErrorState message="Couldn't load views data." onRetry={refetch} />}
        {!loading && !hasError && points && points.length === 0 && (
          <EmptyState message={`No views yet ${periodLabel} — publish a video to see trends here.`} />
        )}
        {!loading && !hasError && points && points.length > 0 && (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={points}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="date" fontSize={12} tick={{ fill: theme.palette.text.secondary }} />
              <YAxis allowDecimals={false} fontSize={12} tick={{ fill: theme.palette.text.secondary }} />
              <Tooltip
                contentStyle={{
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.primary,
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke={theme.palette.primary.main}
                fill={theme.palette.primary.main}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
