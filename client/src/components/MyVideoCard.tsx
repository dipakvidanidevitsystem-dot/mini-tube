import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import { DotsThreeVertical, Eye, PencilSimple, ShareNetwork, Trash } from "@phosphor-icons/react";
import type { Video } from "../types";
import { notifyApiError, notifySuccess } from "../lib/toast";
import VideoCard from "./VideoCard";

export default function MyVideoCard({
  video,
  onDeleteClick,
}: {
  video: Video;
  onDeleteClick: (video: Video) => void;
}) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const closeMenu = () => setAnchorEl(null);

  const handleShare = async () => {
    closeMenu();
    const shareUrl = `${window.location.origin}/watch/${video.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: video.title, url: shareUrl });
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") notifyApiError(err);
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      notifySuccess("Link copied to clipboard.");
    } catch {
      notifyApiError(new Error("Couldn't copy the link. Please copy it from the address bar."));
    }
  };

  return (
    <div className="group relative">
      <VideoCard video={video} showAvatar={false} showCreatorName={false} />
      <div className="absolute bottom-2 left-2 opacity-100 transition-opacity duration-fast sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <Tooltip title="Video actions">
          <IconButton
            size="small"
            aria-label={`Actions for ${video.title}`}
            aria-haspopup="menu"
            onClick={(e) => {
              e.preventDefault();
              setAnchorEl(e.currentTarget);
            }}
            className="!h-9 !w-9 !bg-scrim/60 !text-on-scrim backdrop-blur-sm hover:!bg-scrim/80"
          >
            <DotsThreeVertical size={18} weight="bold" />
          </IconButton>
        </Tooltip>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
          <MenuItem
            onClick={() => {
              closeMenu();
              navigate(`/watch/${video.id}`);
            }}
          >
            <ListItemIcon className="!text-muted-foreground">
              <Eye size={20} />
            </ListItemIcon>
            <ListItemText>View</ListItemText>
          </MenuItem>
          <MenuItem component={Link} to={`/edit/${video.id}`} onClick={closeMenu}>
            <ListItemIcon className="!text-muted-foreground">
              <PencilSimple size={20} />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleShare}>
            <ListItemIcon className="!text-muted-foreground">
              <ShareNetwork size={20} />
            </ListItemIcon>
            <ListItemText>Share</ListItemText>
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              closeMenu();
              onDeleteClick(video);
            }}
            className="!text-destructive"
          >
            <ListItemIcon className="!text-destructive">
              <Trash size={20} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
}
