import Skeleton from "@mui/material/Skeleton";
import type { DashboardStats } from "../../types";
import { formatCompact } from "../../lib/format";
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
  const noData = value !== undefined && def.noDataWhenZero && value === 0;

  return (
    <div className="relative snap-start overflow-hidden rounded-lg border border-border bg-card p-md transition-colors duration-fast hover:border-foreground/20 lg:p-lg">
      <span aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/10 blur-2xl" />
      <div className="flex items-center justify-between gap-sm">
        <p className="text-caption text-muted-foreground">{def.label}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
          <Icon size={18} weight="duotone" aria-hidden />
        </span>
      </div>

      <div className="mt-sm min-h-9">
        {isLoading && <Skeleton variant="text" width={80} sx={{ fontSize: "28px" }} />}
        {!isLoading && isError && (
          <p className="text-display-md text-muted-foreground" aria-label="Unavailable">
            —
          </p>
        )}
        {!isLoading && !isError && noData && <p className="pt-1.5 text-caption text-muted-foreground">No data yet</p>}
        {!isLoading && !isError && value !== undefined && !noData && (
          <p
            className="tabular truncate font-heading text-[26px] font-bold leading-9 tracking-tight text-foreground lg:text-[30px]"
            title={value.toLocaleString()}
          >
            {def.format ? def.format(value) : formatCompact(value)}
          </p>
        )}
      </div>
    </div>
  );
}
