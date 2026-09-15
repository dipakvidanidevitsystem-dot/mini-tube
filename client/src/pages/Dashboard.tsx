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
    <div className="mx-auto flex max-w-screen-2xl flex-col gap-md p-sm sm:gap-lg sm:p-md desktop:p-lg">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div>
          <h1 className="text-display-md text-foreground dark:text-foreground-dark">
            {getGreeting()}, {firstName}.
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground-dark">Here's what's happening with your channel.</p>
        </div>
        <QuickActionLinks />
      </div>

      <div className="grid grid-cols-2 gap-sm sm:gap-md md:grid-cols-4">
        {KPI_DEFS.map((def) => (
          <KpiCard key={def.key} def={def} stats={stats} isLoading={isLoading} isError={isError} />
        ))}
      </div>

      <TopPerformerCard />

      <div className="grid grid-cols-1 items-start gap-lg desktop:grid-cols-5">
        <div className="flex flex-col gap-lg desktop:col-span-3">
          <ViewsChart />
          <AudienceActivityPanel />
        </div>
        <div className="desktop:col-span-2">
          <RecentActivityPanel />
        </div>
      </div>

      <RecentContentList />
    </div>
  );
}
