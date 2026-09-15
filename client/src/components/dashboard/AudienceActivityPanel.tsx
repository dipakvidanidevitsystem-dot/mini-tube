import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { useGetAudienceActivityQuery } from "../../store/api/usersApi";
import ErrorState from "../ErrorState";
import EmptyState from "../EmptyState";

function ProportionRow({
  label,
  count,
  percent,
  filled,
}: {
  label: string;
  count: number;
  percent: number;
  filled: boolean;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-foreground dark:text-foreground-dark">{label}</span>
        <span className="text-muted-foreground dark:text-muted-foreground-dark">
          {count.toLocaleString()} ({percent.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border dark:bg-border-dark">
        <div
          className={filled ? "h-full rounded-full bg-accent" : "h-full rounded-full bg-border dark:bg-muted-foreground-dark"}
          style={{ width: `${percent}%` }}
        />
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
    <Card variant="outlined">
      <CardContent>
        <Typography variant="body2" fontWeight={600} className="mb-3">
          Audience Activity
        </Typography>

        {loading && (
          <div className="flex flex-col gap-4">
            {[0, 1].map((i) => (
              <div key={i}>
                <Skeleton variant="text" width="50%" height={20} />
                <Skeleton variant="rounded" width="100%" height={8} />
              </div>
            ))}
          </div>
        )}
        {!loading && hasError && (
          <ErrorState message="Couldn't load audience activity." onRetry={refetch} />
        )}
        {!loading && !hasError && total === 0 && <EmptyState message="Not enough viewer data yet." />}
        {!loading && !hasError && total > 0 && (
          <div className="flex flex-col gap-4">
            <ProportionRow
              label="Returning viewers"
              count={data!.returningViewers}
              percent={returningPercent}
              filled
            />
            <ProportionRow label="New viewers" count={data!.newViewers} percent={newPercent} filled={false} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
