import { useState } from "react";
import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Badge from "@mui/material/Badge";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import { Bell, BellSimpleSlash, PlayCircle } from "@phosphor-icons/react";
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
  const close = () => setAnchorEl(null);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    onTriggerClick?.();
    setAnchorEl(e.currentTarget);
    if (unreadCount > 0) dispatch(markAllRead());
  };

  const label = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  return (
    <>
      {/* Announces new notifications without moving focus. */}
      <span className="sr-only" role="status" aria-live="polite">
        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : ""}
      </span>

      {variant === "menuItem" ? (
        <MenuItem onClick={handleOpen}>
          <ListItemIcon>
            <Badge badgeContent={unreadCount} color="primary" max={9}>
              <Bell size={20} />
            </Badge>
          </ListItemIcon>
          <ListItemText>Notifications</ListItemText>
        </MenuItem>
      ) : (
        <Tooltip title="Notifications">
          <IconButton
            aria-label={label}
            aria-haspopup="dialog"
            aria-expanded={Boolean(anchorEl)}
            onClick={handleOpen}
            className="!text-muted-foreground hover:!text-foreground"
          >
            <Badge badgeContent={unreadCount} color="primary" max={9}>
              <Bell size={20} weight={anchorEl ? "fill" : "regular"} />
            </Badge>
          </IconButton>
        </Tooltip>
      )}

      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { className: "!mt-2 w-[min(380px,calc(100vw-24px))]", role: "dialog", "aria-label": "Notifications" } }}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-body-strong text-foreground">Notifications</h2>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => dispatch(clearAll())}
              className="rounded-sm px-2 py-1 text-fine-print font-semibold text-accent transition-colors duration-fast hover:bg-accent-soft"
            >
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <BellSimpleSlash size={22} aria-hidden />
            </span>
            <p className="text-caption-strong text-foreground">You're all caught up</p>
            <p className="text-fine-print text-muted-foreground">New uploads and replies will show up here.</p>
          </div>
        ) : (
          <ul className="max-h-[400px] overflow-y-auto p-1.5">
            {items.map((item) => {
              const content = (
                <div className="flex gap-3 rounded-md px-2.5 py-2.5 transition-colors duration-fast hover:bg-muted">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <PlayCircle size={18} weight="fill" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-caption text-foreground">{item.message}</p>
                    <p className="mt-0.5 text-fine-print text-muted-foreground">{timeAgo(item.createdAt)}</p>
                  </div>
                </div>
              );
              return (
                <li key={item.id}>
                  {item.videoId ? (
                    <Link to={`/watch/${item.videoId}`} onClick={close} className="block rounded-md">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Popover>
    </>
  );
}
