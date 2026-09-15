import { Link, useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import {
  VideoCamera,
  UploadSimple,
  ClockCounterClockwise,
  BookmarkSimple,
  SquaresFour,
  Gear,
  ShieldCheck,
  SignOut,
  Sun,
  Moon,
} from "@phosphor-icons/react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout as logoutAction } from "../../store/slices/authSlice";
import { toggleMode as toggleModeAction } from "../../store/slices/themeSlice";
import NotificationBell from "../NotificationBell";

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

  if (!user) return null;

  const handleLogout = () => {
    onNavigate();
    dispatch(logoutAction());
    navigate("/");
  };

  return (
    <>
      <MenuItem
        onClick={() => {
          dispatch(toggleModeAction());
          onNavigate();
        }}
        sx={{ py: 0.75 }}
      >
        <ListItemIcon>{mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}</ListItemIcon>
        <ListItemText>{mode === "dark" ? "Light Mode" : "Dark Mode"}</ListItemText>
      </MenuItem>
      {includeNotifications && <NotificationBell variant="menuItem" onTriggerClick={onNavigate} />}
      <Divider className="my-1" />
      <MenuItem component={Link} to={`/channel/${user.id}`} onClick={onNavigate} sx={{ py: 0.75 }}>
        <ListItemIcon>
          <Avatar sx={{ width: 20, height: 20 }} src={user.profileImage || undefined}>
            {user.name?.[0]?.toUpperCase()}
          </Avatar>
        </ListItemIcon>
        <ListItemText>My Channel</ListItemText>
      </MenuItem>
      {includePrimaryDestinations && (
        <>
          <MenuItem component={Link} to="/my-videos" onClick={onNavigate} sx={{ py: 0.75 }}>
            <ListItemIcon>
              <VideoCamera size={20} />
            </ListItemIcon>
            <ListItemText>My Videos</ListItemText>
          </MenuItem>
          <MenuItem component={Link} to="/upload" onClick={onNavigate} sx={{ py: 0.75 }}>
            <ListItemIcon>
              <UploadSimple size={20} />
            </ListItemIcon>
            <ListItemText>Upload</ListItemText>
          </MenuItem>
          <MenuItem component={Link} to="/watch-later" onClick={onNavigate} sx={{ py: 0.75 }}>
            <ListItemIcon>
              <BookmarkSimple size={20} weight="fill" />
            </ListItemIcon>
            <ListItemText>Watch Later</ListItemText>
          </MenuItem>
        </>
      )}
      {includeHistory && (
        <MenuItem component={Link} to="/history" onClick={onNavigate} sx={{ py: 0.75 }}>
          <ListItemIcon>
            <ClockCounterClockwise size={20} />
          </ListItemIcon>
          <ListItemText>History</ListItemText>
        </MenuItem>
      )}
      <MenuItem component={Link} to="/dashboard" onClick={onNavigate} sx={{ py: 0.75 }}>
        <ListItemIcon>
          <SquaresFour size={20} />
        </ListItemIcon>
        <ListItemText>Dashboard</ListItemText>
      </MenuItem>
      {user.role === "admin" && (
        <MenuItem component={Link} to="/admin" onClick={onNavigate} sx={{ py: 0.75 }}>
          <ListItemIcon>
            <ShieldCheck size={20} />
          </ListItemIcon>
          <ListItemText>Admin Dashboard</ListItemText>
        </MenuItem>
      )}
      <MenuItem component={Link} to="/settings" onClick={onNavigate} sx={{ py: 0.75 }}>
        <ListItemIcon>
          <Gear size={20} />
        </ListItemIcon>
        <ListItemText>Settings</ListItemText>
      </MenuItem>
      <Divider className="my-1" />
      <MenuItem onClick={handleLogout} sx={{ py: 0.75 }}>
        <ListItemIcon>
          <SignOut size={20} />
        </ListItemIcon>
        <ListItemText>Logout</ListItemText>
      </MenuItem>
    </>
  );
}
