import { Link, useLocation, useNavigate } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { SignOut, X } from "@phosphor-icons/react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout as logoutAction } from "../../store/slices/authSlice";
import { useLogoutMutation } from "../../store/api/authApi";
import BrandMark from "../BrandMark";
import { PRIMARY_NAV, STUDIO_NAV, isNavActive, type NavItem } from "./navItems";

function DrawerLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`relative flex h-11 items-center gap-3 rounded-md px-3 text-caption transition-colors duration-fast ${
        active ? "bg-accent-soft font-semibold text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {active && <span aria-hidden className="absolute inset-y-2.5 left-0 w-[3px] rounded-full bg-accent" />}
      <Icon size={20} weight={active ? "fill" : "regular"} className={active ? "text-accent" : undefined} aria-hidden />
      {item.label}
    </Link>
  );
}

export default function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [logoutMutation] = useLogoutMutation();

  if (!user) return null;

  const handleLogout = () => {
    onClose();
    logoutMutation().finally(() => dispatch(logoutAction()));
    navigate("/");
  };

  const studio = STUDIO_NAV.filter((item) => !item.adminOnly || user.role === "admin");

  return (
    <Drawer anchor="left" open={open} onClose={onClose} slotProps={{ paper: { className: "!border-r !border-border" } }}>
      <div className="flex h-full w-[272px] flex-col" role="navigation" aria-label="Main menu">
        <div className="flex h-16 items-center justify-between border-b border-border px-3">
          <BrandMark onClick={onClose} />
          <IconButton aria-label="Close navigation menu" onClick={onClose} className="!text-muted-foreground">
            <X size={20} />
          </IconButton>
        </div>

        <div className="flex flex-1 flex-col gap-lg overflow-y-auto px-3 py-md">
          <div className="flex flex-col gap-0.5">
            {PRIMARY_NAV.map((item) => (
              <DrawerLink key={item.to} item={item} active={isNavActive(item, pathname)} onClick={onClose} />
            ))}
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="px-3 pb-1 text-fine-print font-semibold uppercase tracking-wider text-muted-foreground">Studio</p>
            {studio.map((item) => (
              <DrawerLink key={item.to} item={item} active={isNavActive(item, pathname)} onClick={onClose} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border p-3">
          <Link to={`/channel/${user.id}`} onClick={onClose} className="flex min-w-0 flex-1 items-center gap-3 rounded-md p-1">
            <Avatar src={user.profileImage || undefined} alt="" sx={{ width: 36, height: 36 }}>
              {user.name?.[0]?.toUpperCase()}
            </Avatar>
            <span className="min-w-0">
              <span className="block truncate text-caption-strong text-foreground">{user.name}</span>
              <span className="block truncate text-fine-print text-muted-foreground">View channel</span>
            </span>
          </Link>
          <IconButton aria-label="Sign out" onClick={handleLogout} className="!text-destructive">
            <SignOut size={20} />
          </IconButton>
        </div>
      </div>
    </Drawer>
  );
}
