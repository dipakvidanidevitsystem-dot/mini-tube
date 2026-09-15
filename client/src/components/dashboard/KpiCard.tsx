import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import type { DashboardStats } from "../../types";
import type { KpiDef } from "./kpiDefs";

export default function KpiCard({
  def,
  stats,
  isLoading,
  isError,
}: {
  def: KpiDef;
  stats: DashboardStats | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  const Icon = def.icon;
  const value = stats?.[def.key];

  return (
    <Card variant="outlined" className="snap-start">
      <CardContent className="flex items-center gap-sm sm:gap-md">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Icon size={20} weight="bold" />
        </span>
        <div className="min-w-0">
          <Typography variant="caption" className="text-muted-foreground dark:text-muted-foreground-dark">
            {def.label}
          </Typography>

          {isLoading && <Skeleton variant="text" width={64} height={28} />}
          {!isLoading && isError && (
            <Typography variant="h6" fontWeight={600} className="text-muted-foreground dark:text-muted-foreground-dark">
              —
            </Typography>
          )}
          {!isLoading && !isError && value !== undefined && def.noDataWhenZero && value === 0 && (
            <Typography variant="body2" className="text-muted-foreground dark:text-muted-foreground-dark">
              No data yet
            </Typography>
          )}
          {!isLoading &&
            !isError &&
            value !== undefined &&
            !(def.noDataWhenZero && value === 0) && (
              <Typography variant="h6" fontWeight={600} noWrap sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                {def.format ? def.format(value) : value.toLocaleString()}
              </Typography>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
