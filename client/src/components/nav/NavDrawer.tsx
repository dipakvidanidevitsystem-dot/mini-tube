import { Link, useNavigate } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import {
  House,
  VideoCamera,
  UploadSimple,
  ClockCounterClockwise,
  BookmarkSimple,
  SquaresFour,
  Gear,
  ShieldCheck,
  SignOut,
} from "@phosphor-icons/react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout as logoutAction } from "../../store/slices/authSlice";
import { useLogoutMutation } from "../../store/api/authApi";

export default function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();

  if (!user) return null;

  const handleLogout = () => {
    onClose();
    logoutMutation().finally(() => dispatch(logoutAction()));
    navigate("/");
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box className="w-[260px]" role="presentation">
        <List>
          <ListItemButton component={Link} to="/" onClick={onClose} sx={{ py: 0.75 }}>
            <ListItemIcon>
              <House size={20} />
            </ListItemIcon>
            <ListItemText>Browse</ListItemText>
          </ListItemButton>
          <ListItemButton component={Link} to="/my-videos" onClick={onClose} sx={{ py: 0.75 }}>
            <ListItemIcon>
              <VideoCamera size={20} />
            </ListItemIcon>
            <ListItemText>My Videos</ListItemText>
          </ListItemButton>
          <ListItemButton component={Link} to="/upload" onClick={onClose} sx={{ py: 0.75 }}>
            <ListItemIcon>
              <UploadSimple size={20} />
            </ListItemIcon>
            <ListItemText>Upload</ListItemText>
          </ListItemButton>
          <ListItemButton component={Link} to="/history" onClick={onClose} sx={{ py: 0.75 }}>
            <ListItemIcon>
              <ClockCounterClockwise size={20} />
            </ListItemIcon>
            <ListItemText>History</ListItemText>
          </ListItemButton>
          <ListItemButton component={Link} to="/watch-later" onClick={onClose} sx={{ py: 0.75 }}>
            <ListItemIcon>
              <BookmarkSimple size={20} weight="fill" />
            </ListItemIcon>
            <ListItemText>Watch Later</ListItemText>
          </ListItemButton>
        </List>
        <Divider />
        <List>
          <ListItemButton component={Link} to={`/channel/${user.id}`} onClick={onClose} sx={{ py: 0.75 }}>
            <ListItemIcon>
              <Avatar sx={{ width: 20, height: 20 }} src={user.profileImage || undefined}>
                {user.name?.[0]?.toUpperCase()}
              </Avatar>
            </ListItemIcon>
            <ListItemText>My Channel</ListItemText>
          </ListItemButton>
          <ListItemButton component={Link} to="/dashboard" onClick={onClose} sx={{ py: 0.75 }}>
            <ListItemIcon>
              <SquaresFour size={20} />
            </ListItemIcon>
            <ListItemText>Dashboard</ListItemText>
          </ListItemButton>
          {user.role === "admin" && (
            <ListItemButton component={Link} to="/admin" onClick={onClose} sx={{ py: 0.75 }}>
              <ListItemIcon>
                <ShieldCheck size={20} />
              </ListItemIcon>
              <ListItemText>Admin Dashboard</ListItemText>
            </ListItemButton>
          )}
          <ListItemButton component={Link} to="/settings" onClick={onClose} sx={{ py: 0.75 }}>
            <ListItemIcon>
              <Gear size={20} />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </ListItemButton>
        </List>
        <Divider />
        <List>
          <ListItemButton onClick={handleLogout} sx={{ py: 0.75 }}>
            <ListItemIcon>
              <SignOut size={20} />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}
