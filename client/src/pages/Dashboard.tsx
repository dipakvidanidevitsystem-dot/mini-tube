import { useGetDashboardQuery } from "../store/api/usersApi";
import { useAppSelector } from "../store/hooks";
import KpiCard from "../components/dashboard/KpiCard";
import { KPI_DEFS } from "../components/dashboard/kpiDefs";
import QuickActionLinks from "../components/dashboard/QuickActionLinks";
import TopPerformerCard from "../components/dashboard/TopPerformerCard";
import ViewsChart from "../components/dashboard/ViewsChart";
import RecentContentList from "../components/dashboard/RecentContentList";
import RecentActivityPanel from "../components/dashboard/RecentActivityPanel";
import AudienceActivityPanel from "../components/dashboard/AudienceActivityPanel";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: stats, isLoading, isError } = useGetDashboardQuery();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-lg px-md pb-16 pt-lg sm:px-lg">
      <header className="flex flex-wrap items-end justify-between gap-md">
        <div>
          <p className="text-fine-print font-semibold uppercase tracking-wider text-accent">Creator studio</p>
          <h1 className="mt-1 text-display-md text-foreground">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-1 text-caption text-muted-foreground">Here&apos;s what&apos;s happening with your channel.</p>
        </div>
        <QuickActionLinks />
      </header>

      <section aria-label="Key metrics" className="grid grid-cols-2 gap-sm sm:gap-md lg:grid-cols-4">
        {KPI_DEFS.map((def) => (
          <KpiCard key={def.key} def={def} stats={stats} isLoading={isLoading} isError={isError} />
        ))}
      </section>

      <TopPerformerCard />

      <div className="grid grid-cols-1 items-start gap-lg desktop:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-lg">
          <ViewsChart />
          <RecentContentList />
        </div>
        <div className="flex min-w-0 flex-col gap-lg">
          <AudienceActivityPanel />
          <RecentActivityPanel />
        </div>
      </div>
    </div>
  );
}
