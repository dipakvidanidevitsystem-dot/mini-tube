import { Link, useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { SignOut, Sun, Moon } from "@phosphor-icons/react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout as logoutAction } from "../../store/slices/authSlice";
import { toggleMode as toggleModeAction } from "../../store/slices/themeSlice";
import { useLogoutMutation } from "../../store/api/authApi";
import NotificationBell from "../NotificationBell";
import { PRIMARY_NAV, STUDIO_NAV, type NavItem } from "./navItems";

const byPath = (path: string) => [...PRIMARY_NAV, ...STUDIO_NAV].find((item) => item.to === path) as NavItem;

function NavMenuItem({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const Icon = item.icon;
  return (
    <MenuItem component={Link} to={item.to} onClick={onNavigate}>
      <ListItemIcon className="!min-w-0 !text-muted-foreground">
        <Icon size={20} aria-hidden />
      </ListItemIcon>
      <ListItemText>{item.label}</ListItemText>
    </MenuItem>
  );
}

export default function AccountMenuItems({
  onNavigate,
  includeNotifications = false,
  includePrimaryDestinations = true,
  includeHistory = includePrimaryDestinations,
}: {
  onNavigate: () => void;
  includeNotifications?: boolean;
  includePrimaryDestinations?: boolean;
  includeHistory?: boolean;
}) {
  const user = useAppSelector((state) => state.auth.user);
  const mode = useAppSelector((state) => state.theme.mode);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();

  if (!user) return null;

  const handleLogout = () => {
    onNavigate();
    logoutMutation().finally(() => dispatch(logoutAction()));
    navigate("/");
  };

  return (
    <>
      <MenuItem component={Link} to={`/channel/${user.id}`} onClick={onNavigate}>
        <ListItemIcon className="!min-w-0">
          <Avatar sx={{ width: 22, height: 22, fontSize: 11 }} src={user.profileImage || undefined} alt="">
            {user.name?.[0]?.toUpperCase()}
          </Avatar>
        </ListItemIcon>
        <ListItemText>Your channel</ListItemText>
      </MenuItem>
      {includeNotifications && <NotificationBell variant="menuItem" onTriggerClick={onNavigate} />}

      {(includePrimaryDestinations || includeHistory) && <Divider sx={{ my: 0.5 }} />}
      {includePrimaryDestinations && (
        <>
          <NavMenuItem item={byPath("/my-videos")} onNavigate={onNavigate} />
          <NavMenuItem item={byPath("/upload")} onNavigate={onNavigate} />
          <NavMenuItem item={byPath("/watch-later")} onNavigate={onNavigate} />
        </>
      )}
      {includeHistory && <NavMenuItem item={byPath("/history")} onNavigate={onNavigate} />}

      <Divider sx={{ my: 0.5 }} />
      <NavMenuItem item={byPath("/dashboard")} onNavigate={onNavigate} />
      {user.role === "admin" && <NavMenuItem item={byPath("/admin")} onNavigate={onNavigate} />}
      <NavMenuItem item={byPath("/settings")} onNavigate={onNavigate} />

      <MenuItem
        onClick={() => {
          dispatch(toggleModeAction());
          onNavigate();
        }}
      >
        <ListItemIcon className="!min-w-0 !text-muted-foreground">
          {mode === "dark" ? <Sun size={20} aria-hidden /> : <Moon size={20} aria-hidden />}
        </ListItemIcon>
        <ListItemText>{mode === "dark" ? "Light theme" : "Dark theme"}</ListItemText>
      </MenuItem>

      <Divider sx={{ my: 0.5 }} />
      <MenuItem onClick={handleLogout} className="!text-destructive">
        <ListItemIcon className="!min-w-0 !text-destructive">
          <SignOut size={20} aria-hidden />
        </ListItemIcon>
        <ListItemText>Sign out</ListItemText>
      </MenuItem>
    </>
  );
}
