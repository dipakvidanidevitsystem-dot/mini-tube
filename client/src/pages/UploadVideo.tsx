import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../components/TextField";
import Select from "../components/Select";
import Button from "../components/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import LinearProgress from "@mui/material/LinearProgress";
import { CheckCircle, Globe, Lock, UploadSimple } from "@phosphor-icons/react";
import { useAppDispatch } from "../store/hooks";
import { videosApi } from "../store/api/videosApi";
import MediaDropzone from "../components/MediaDropzone";
import { uploadWithProgress } from "../lib/uploadWithProgress";
import { CATEGORIES } from "../constants";
import { notifySuccess } from "../lib/toast";
import type { Video, Visibility } from "../types";

type UploadPhase = "idle" | "uploading" | "done";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const TITLE_MAX = 100;
const DESCRIPTION_MAX = 5000;

export default function UploadVideo() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [error, setError] = useState("");

  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState(0);

  const submitting = phase !== "idle";
  const uploadFinished = phase === "uploading" && progress >= 100;

  // Video/thumbnail previews share the same object-URL pattern as MediaDropzone.
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!video) {
      setVideoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(video);
    setVideoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [video]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!video) {
      setError("Please select a video file.");
      return;
    }
    setError("");
    setPhase("uploading");
    setProgress(0);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("visibility", visibility);
    formData.append("video", video);
    if (thumbnail) formData.append("thumbnail", thumbnail);

    try {
      const created = await uploadWithProgress<Video>(`${API_URL}/videos`, formData, (e) => setProgress(e.percent));
      setPhase("done");
      dispatch(videosApi.util.invalidateTags([{ type: "VideoList", id: "LIST" }]));
      notifySuccess("Upload complete — we're processing your video now.");
      navigate(`/watch/${created.id}`);
    } catch (err) {
      setPhase("idle");
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    }
  };

  const primaryLabel = uploadFinished
    ? "Processing…"
    : phase === "uploading"
      ? `Uploading… ${progress}%`
      : phase === "done"
        ? "Published"
        : "Publish video";

  return (
    <div className="mx-auto max-w-screen-2xl p-md sm:p-lg">
      <div className="mb-lg">
        <h1 className="text-display-md text-foreground dark:text-foreground-dark">Upload video</h1>
        <p className="text-caption text-muted-foreground dark:text-muted-foreground-dark">
          Share your next video with your audience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-lg desktop:grid-cols-5">
        <div className="flex flex-col gap-lg desktop:col-span-3">
          <MediaDropzone
            kind="video"
            label="Video file"
            accept="video/*"
            maxSizeMB={2048}
            value={video}
            onChange={setVideo}
            disabled={submitting}
            helperText="MP4, WebM, MOV up to 2GB"
            size="lg"
          />

          <div className="flex flex-col gap-xs">
            <h2 className="text-caption-strong text-foreground dark:text-foreground-dark">Thumbnail</h2>
            {videoPreviewUrl && (
              <div className="overflow-hidden rounded-lg border border-border bg-muted dark:border-border-dark dark:bg-muted-dark">
                <video src={videoPreviewUrl} muted preload="metadata" className="aspect-video w-full object-cover" />
              </div>
            )}
            <MediaDropzone
              kind="image"
              label="Upload custom thumbnail"
              accept="image/*"
              maxSizeMB={10}
              value={thumbnail}
              onChange={setThumbnail}
              disabled={submitting}
              helperText="We'll generate one from your video automatically if you skip this step"
            />
          </div>
        </div>

        <div className="flex flex-col gap-lg desktop:col-span-2">
          <div className="flex flex-col gap-md">
            <h2 className="text-caption-strong text-foreground dark:text-foreground-dark">Video details</h2>

            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
              required
              disabled={submitting}
              inputProps={{ maxLength: TITLE_MAX }}
              helperText={`${title.length}/${TITLE_MAX}`}
              FormHelperTextProps={{ className: "!text-right" }}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX))}
              multiline
              minRows={3}
              disabled={submitting}
              inputProps={{ maxLength: DESCRIPTION_MAX }}
              helperText={`${description.length}/${DESCRIPTION_MAX}`}
              FormHelperTextProps={{ className: "!text-right" }}
            />
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={submitting}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <div className="flex flex-col gap-xs">
            <h2 className="text-caption-strong text-foreground dark:text-foreground-dark">Visibility</h2>
            <ToggleButtonGroup
              value={visibility}
              exclusive
              onChange={(_, next: Visibility | null) => next && setVisibility(next)}
              disabled={submitting}
              fullWidth
            >
              <ToggleButton value="public" className="!flex-col !items-start !gap-0.5 !py-sm !text-left !normal-case">
                <span className="flex items-center gap-1.5 text-caption-strong">
                  <Globe size={16} /> Public
                </span>
                <span className="text-fine-print font-normal text-muted-foreground dark:text-muted-foreground-dark">
                  Anyone can watch this video.
                </span>
              </ToggleButton>
              <ToggleButton value="private" className="!flex-col !items-start !gap-0.5 !py-sm !text-left !normal-case">
                <span className="flex items-center gap-1.5 text-caption-strong">
                  <Lock size={16} /> Private
                </span>
                <span className="text-fine-print font-normal text-muted-foreground dark:text-muted-foreground-dark">
                  Only you can watch this video.
                </span>
              </ToggleButton>
            </ToggleButtonGroup>
          </div>

          {phase === "uploading" && (
            <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3 dark:border-border-dark dark:bg-card-dark">
              <div className="flex items-center justify-between text-caption-strong text-foreground dark:text-foreground-dark">
                <span className="flex items-center gap-1.5">
                  <UploadSimple size={18} className="text-accent" />
                  {uploadFinished ? "Processing…" : "Uploading…"}
                </span>
                <span>{progress}%</span>
              </div>
              <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1, height: 6 }} />
              <p className="text-fine-print text-muted-foreground dark:text-muted-foreground-dark">
                {uploadFinished
                  ? "Almost there — preparing your video for processing."
                  : "Keep this tab open until the upload finishes."}
              </p>
            </div>
          )}

          {phase === "done" && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-caption-strong text-foreground dark:border-border-dark dark:bg-card-dark dark:text-foreground-dark">
              <CheckCircle size={20} weight="fill" className="text-accent" />
              Upload complete — taking you to your video…
            </div>
          )}

          {error && <p className="text-sm font-medium text-foreground dark:text-foreground-dark">{error}</p>}

          <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 -mx-md flex items-center gap-2 border-t border-border bg-card p-md desktop:static desktop:mx-0 desktop:border-0 desktop:bg-transparent desktop:p-0 dark:border-border-dark dark:bg-card-dark desktop:dark:bg-transparent">
            <Tooltip title="Coming soon">
              <span className="flex-1">
                <Button type="button" variant="outlined" disabled fullWidth>
                  Save draft
                </Button>
              </span>
            </Tooltip>
            <Button type="submit" variant="contained" disabled={submitting} className="!flex-1">
              {primaryLabel}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
