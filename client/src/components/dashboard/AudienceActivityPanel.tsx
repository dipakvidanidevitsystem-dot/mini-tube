import Skeleton from "@mui/material/Skeleton";
import { UsersThree } from "@phosphor-icons/react";
import { useGetAudienceActivityQuery } from "../../store/api/usersApi";
import ErrorState from "../ErrorState";
import EmptyState from "../EmptyState";
import Panel from "../Panel";

function ProportionRow({
  label,
  count,
  percent,
  barClass,
}: {
  label: string;
  count: number;
  percent: number;
  barClass: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2 text-caption">
        <span className="flex items-center gap-2 text-foreground">
          <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${barClass}`} />
          {label}
        </span>
        <span className="tabular text-muted-foreground">
          {count.toLocaleString()} <span className="text-foreground">· {percent.toFixed(0)}%</span>
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
      >
        <div className={`h-full rounded-full ${barClass} transition-[width] duration-enter`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function AudienceActivityPanel() {
  const { data, isLoading: loading, isError: hasError, refetch } = useGetAudienceActivityQuery();

  const total = (data?.returningViewers ?? 0) + (data?.newViewers ?? 0);
  const returningPercent = total > 0 ? ((data?.returningViewers ?? 0) / total) * 100 : 0;
  const newPercent = total > 0 ? ((data?.newViewers ?? 0) / total) * 100 : 0;

  return (
    <Panel title="Audience" description="Returning vs. new viewers" icon={UsersThree}>
      {loading && (
        <div className="flex flex-col gap-md">
          {[0, 1].map((i) => (
            <div key={i}>
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="rounded" width="100%" height={8} />
            </div>
          ))}
        </div>
      )}
      {!loading && hasError && <ErrorState message="Couldn't load audience activity." onRetry={refetch} />}
      {!loading && !hasError && total === 0 && <EmptyState icon={UsersThree} message="Not enough viewer data yet." />}
      {!loading && !hasError && total > 0 && (
        <div className="flex flex-col gap-md">
          <ProportionRow label="Returning viewers" count={data!.returningViewers} percent={returningPercent} barClass="bg-accent" />
          <ProportionRow label="New viewers" count={data!.newViewers} percent={newPercent} barClass="bg-info" />
        </div>
      )}
    </Panel>
  );
}
