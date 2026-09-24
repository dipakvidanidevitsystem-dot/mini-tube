import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Menu from "@mui/material/Menu";
import Avatar from "@mui/material/Avatar";
import { House, VideoCamera, Plus, BookmarkSimple, type Icon } from "@phosphor-icons/react";
import { useAppSelector } from "../../store/hooks";
import AccountMenuItems from "./AccountMenuItems";

const TAB_CLASS =
  "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-nav-link transition-colors duration-fast";

function TabLink({ to, label, icon: IconComponent, active }: { to: string; label: string; icon: Icon; active: boolean }) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`${TAB_CLASS} ${active ? "text-foreground" : "text-muted-foreground"}`}
    >
      {active && <span aria-hidden className="absolute top-0 h-[3px] w-8 rounded-b-full bg-accent" />}
      <IconComponent size={22} weight={active ? "fill" : "regular"} className={active ? "text-accent" : undefined} aria-hidden />
      <span className="max-w-full truncate px-0.5">{label}</span>
    </Link>
  );
}

export default function MobileTabBar() {
  const user = useAppSelector((state) => state.auth.user);
  const { pathname } = useLocation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const closeMenu = () => setAnchorEl(null);

  if (!user) return null;

  const youActive =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/history") ||
    pathname === `/channel/${user.id}`;

  return (
    <nav
      aria-label="Tabs"
      className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border bg-elevated/90 backdrop-blur-xl md:hidden"
    >
      <div className="flex h-16 items-stretch">
        <TabLink to="/" label="Home" icon={House} active={pathname === "/"} />
        <TabLink to="/my-videos" label="My videos" icon={VideoCamera} active={pathname.startsWith("/my-videos")} />
        <Link to="/upload" aria-label="Upload video" className="flex flex-1 items-center justify-center">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-md bg-accent-strong text-on-accent shadow-glow-accent transition-transform duration-fast active:scale-95 ${
              pathname.startsWith("/upload") ? "ring-2 ring-accent/50 ring-offset-2 ring-offset-elevated" : ""
            }`}
          >
            <Plus size={22} weight="bold" aria-hidden />
          </span>
        </Link>
        <TabLink to="/watch-later" label="Saved" icon={BookmarkSimple} active={pathname.startsWith("/watch-later")} />
        <button
          type="button"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchorEl)}
          className={`${TAB_CLASS} ${youActive ? "text-foreground" : "text-muted-foreground"}`}
        >
          {youActive && <span aria-hidden className="absolute top-0 h-[3px] w-8 rounded-b-full bg-accent" />}
          <Avatar
            src={user.profileImage || undefined}
            alt=""
            sx={{ width: 24, height: 24, fontSize: 11 }}
            className={youActive ? "ring-2 ring-accent" : undefined}
          >
            {user.name?.[0]?.toUpperCase()}
          </Avatar>
          <span className="max-w-full truncate px-0.5">You</span>
        </button>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "bottom", horizontal: "right" }}
        slotProps={{ paper: { className: "min-w-[240px] !-mt-2" } }}
      >
        <AccountMenuItems onNavigate={closeMenu} includeNotifications includePrimaryDestinations={false} includeHistory />
      </Menu>
    </nav>
  );
}
