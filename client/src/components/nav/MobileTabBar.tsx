import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Menu from "@mui/material/Menu";
import Avatar from "@mui/material/Avatar";
import { House, VideoCamera, Plus, BookmarkSimple } from "@phosphor-icons/react";
import { useAppSelector } from "../../store/hooks";
import AccountMenuItems from "./AccountMenuItems";

function TabLink({
  to,
  label,
  icon,
  active,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-nav-link ${
        active
          ? "text-accent dark:text-accent-dark"
          : "text-muted-foreground dark:text-muted-foreground-dark"
      }`}
    >
      {icon}
      <span className="max-w-full truncate whitespace-nowrap px-0.5">{label}</span>
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
    pathname === `/channel/${user.id}`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch justify-around border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden dark:border-border-dark dark:bg-card-dark">
      <TabLink to="/" label="Browse" icon={<House size={22} weight={pathname === "/" ? "fill" : "regular"} />} active={pathname === "/"} />
      <TabLink
        to="/my-videos"
        label="My Videos"
        icon={<VideoCamera size={22} weight={pathname.startsWith("/my-videos") ? "fill" : "regular"} />}
        active={pathname.startsWith("/my-videos")}
      />
      <Link to="/upload" aria-label="Upload video" className="flex flex-1 flex-col items-center justify-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-foreground bg-accent p-2 text-on-accent shadow-ink-sm dark:border-black dark:bg-accent-dark dark:text-on-accent-dark dark:shadow-ink-sm-dark">
          <Plus size={22} weight="bold" />
        </span>
      </Link>
      <TabLink
        to="/watch-later"
        label="Saved"
        icon={<BookmarkSimple size={22} weight={pathname.startsWith("/watch-later") ? "fill" : "regular"} />}
        active={pathname.startsWith("/watch-later")}
      />
      <button
        type="button"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-nav-link ${
          youActive ? "text-accent dark:text-accent-dark" : "text-muted-foreground dark:text-muted-foreground-dark"
        }`}
      >
        <Avatar src={user.profileImage || undefined} sx={{ width: 22, height: 22 }}>
          {user.name?.[0]?.toUpperCase()}
        </Avatar>
        <span className="max-w-full truncate whitespace-nowrap px-0.5">You</span>
      </button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <AccountMenuItems onNavigate={closeMenu} includeNotifications includePrimaryDestinations={false} includeHistory />
      </Menu>
    </nav>
  );
}
