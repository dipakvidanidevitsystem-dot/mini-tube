import { Link, useLocation } from "react-router-dom";
import { SignIn } from "@phosphor-icons/react";
import { useAppSelector } from "../../store/hooks";
import { PRIMARY_NAV, STUDIO_NAV, isNavActive, type NavItem } from "./navItems";

function RailLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      aria-current={active ? "page" : undefined}
      className={`group relative flex h-10 items-center gap-3 rounded-md px-3 text-caption transition-colors duration-fast ${
        active
          ? "bg-accent-soft font-semibold text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {active && <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-accent" />}
      <Icon size={20} weight={active ? "fill" : "regular"} className={active ? "text-accent" : undefined} aria-hidden />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

/** Persistent left navigation for ≥1200px. Tablets use NavDrawer and phones use MobileTabBar instead. */
export default function SideRail() {
  const user = useAppSelector((state) => state.auth.user);
  const { pathname } = useLocation();

  const studio = STUDIO_NAV.filter((item) => !item.adminOnly || user?.role === "admin");

  return (
    <aside
      aria-label="Primary"
      className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 flex-col gap-lg overflow-y-auto border-r border-border px-3 py-md desktop:flex"
    >
      <nav className="flex flex-col gap-0.5">
        {PRIMARY_NAV.filter((item) => user || item.exact).map((item) => (
          <RailLink key={item.to} item={item} active={isNavActive(item, pathname)} />
        ))}
      </nav>

      {user ? (
        <nav aria-label="Studio" className="flex flex-col gap-0.5">
          <p className="px-3 pb-1 text-fine-print font-semibold uppercase tracking-wider text-muted-foreground">Studio</p>
          {studio.map((item) => (
            <RailLink key={item.to} item={item} active={isNavActive(item, pathname)} />
          ))}
        </nav>
      ) : (
        <div className="rounded-lg border border-border bg-card p-md">
          <p className="text-caption text-muted-foreground">Sign in to like videos, comment, and build your watch history.</p>
          <Link
            to="/login"
            className="mt-sm inline-flex h-9 items-center gap-2 rounded-full border border-accent/50 px-4 text-caption-strong text-accent transition-colors duration-fast hover:bg-accent-soft"
          >
            <SignIn size={18} aria-hidden />
            Sign in
          </Link>
        </div>
      )}

      <p className="mt-auto px-3 text-fine-print text-muted-foreground">© {new Date().getFullYear()} MiniTube</p>
    </aside>
  );
}
