import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
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
      <div className="absolute left-2 top-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <Tooltip title="Video actions">
          <IconButton
            size="small"
            aria-label="video actions"
            onClick={(e) => {
              e.preventDefault();
              setAnchorEl(e.currentTarget);
            }}
            className="!bg-black/35 !text-white backdrop-blur-sm transition-colors hover:!bg-black/70"
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
            sx={{ py: 0.75 }}
          >
            <ListItemIcon>
              <Eye size={20} />
            </ListItemIcon>
            <ListItemText>View</ListItemText>
          </MenuItem>
          <MenuItem component={Link} to={`/edit/${video.id}`} onClick={closeMenu} sx={{ py: 0.75 }}>
            <ListItemIcon>
              <PencilSimple size={20} />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleShare} sx={{ py: 0.75 }}>
            <ListItemIcon>
              <ShareNetwork size={20} />
            </ListItemIcon>
            <ListItemText>Share</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              closeMenu();
              onDeleteClick(video);
            }}
            sx={{ py: 0.75 }}
          >
            <ListItemIcon>
              <Trash size={20} className="text-destructive dark:text-destructive-dark" />
            </ListItemIcon>
            <ListItemText className="text-destructive dark:text-destructive-dark">Delete</ListItemText>
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
}
