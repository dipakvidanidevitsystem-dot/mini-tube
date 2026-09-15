import { useState } from "react";
import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { Bell } from "@phosphor-icons/react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { markAllRead, clearAll } from "../store/slices/notificationsSlice";
import dayjs from "../lib/dayjs";

function timeAgo(iso: string) {
  return dayjs(iso).fromNow();
}

export default function NotificationBell({
  variant = "icon",
  onTriggerClick,
}: {
  variant?: "icon" | "menuItem";
  onTriggerClick?: () => void;
}) {
  const items = useAppSelector((state) => state.notifications.items);
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    onTriggerClick?.();
    setAnchorEl(e.currentTarget);
    if (unreadCount > 0) dispatch(markAllRead());
  };

  return (
    <>
      {variant === "menuItem" ? (
        <MenuItem onClick={handleOpen} sx={{ py: 0.75 }}>
          <ListItemIcon>
            <Badge badgeContent={unreadCount} color="error" max={9}>
              <Bell size={20} />
            </Badge>
          </ListItemIcon>
          <ListItemText>Notifications</ListItemText>
        </MenuItem>
      ) : (
        <IconButton
          aria-label="notifications"
          onClick={handleOpen}
          size="small"
          className="!text-muted-foreground dark:!text-muted-foreground-dark"
        >
          <Badge badgeContent={unreadCount} color="error" max={9}>
            <Bell size={18} />
          </Badge>
        </IconButton>
      )}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { className: "min-w-[320px] max-w-[380px]" } }}
      >
        <Box className="flex items-center justify-between px-3 py-2">
          <Typography variant="subtitle2" fontWeight={600}>
            Notifications
          </Typography>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => dispatch(clearAll())}
              className="text-fine-print text-accent hover:underline"
            >
              Clear all
            </button>
          )}
        </Box>
        <Divider />
        {items.length === 0 ? (
          <Box className="px-3 py-6 text-center">
            <Typography variant="body2" className="text-muted-foreground dark:text-muted-foreground-dark">
              You're all caught up.
            </Typography>
          </Box>
        ) : (
          <Box className="max-h-[360px] overflow-y-auto">
            {items.map((item) => {
              const content = (
                <Box className="flex flex-col gap-0.5 px-3 py-2.5 hover:bg-muted dark:hover:bg-muted-dark">
                  <Typography variant="body2" className="text-foreground dark:text-foreground-dark">
                    {item.message}
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground dark:text-muted-foreground-dark">
                    {timeAgo(item.createdAt)}
                  </Typography>
                </Box>
              );
              return item.videoId ? (
                <Link key={item.id} to={`/watch/${item.videoId}`} onClick={() => setAnchorEl(null)} className="block">
                  {content}
                </Link>
              ) : (
                <Box key={item.id}>{content}</Box>
              );
            })}
          </Box>
        )}
      </Menu>
    </>
  );
}
