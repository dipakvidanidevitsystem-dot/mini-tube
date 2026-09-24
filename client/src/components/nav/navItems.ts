import {
  House,
  VideoCamera,
  UploadSimple,
  ClockCounterClockwise,
  BookmarkSimple,
  SquaresFour,
  Gear,
  ShieldCheck,
  type Icon,
} from "@phosphor-icons/react";

export interface NavItem {
  to: string;
  label: string;
  icon: Icon;
  /** Match the route exactly (used for "/") instead of by prefix. */
  exact?: boolean;
  adminOnly?: boolean;
}

/** Top-level destinations: browsing and the viewer's own library. */
export const PRIMARY_NAV: NavItem[] = [
  { to: "/", label: "Browse", icon: House, exact: true },
  { to: "/history", label: "History", icon: ClockCounterClockwise },
  { to: "/watch-later", label: "Watch Later", icon: BookmarkSimple },
];

/** Creator/account destinations, shown in a separate group below the primary nav. */
export const STUDIO_NAV: NavItem[] = [
  { to: "/my-videos", label: "My Videos", icon: VideoCamera },
  { to: "/upload", label: "Upload", icon: UploadSimple },
  { to: "/dashboard", label: "Dashboard", icon: SquaresFour },
  { to: "/admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
  { to: "/settings", label: "Settings", icon: Gear },
];

export function isNavActive(item: Pick<NavItem, "to" | "exact">, pathname: string): boolean {
  return item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
}
