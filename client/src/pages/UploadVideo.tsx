import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../components/TextField";
import Select from "../components/Select";
import Button from "../components/Button";
import Tooltip from "@mui/material/Tooltip";
import LinearProgress from "@mui/material/LinearProgress";
import { CheckCircle, UploadSimple } from "@phosphor-icons/react";
import PageHeader from "../components/PageHeader";
import Panel from "../components/Panel";
import FormAlert from "../components/FormAlert";
import VisibilityPicker from "../components/VisibilityPicker";
import { useAppDispatch } from "../store/hooks";
import { videosApi } from "../store/api/videosApi";
import MediaDropzone from "../components/MediaDropzone";
import { uploadWithProgress } from "../lib/uploadWithProgress";
import { CATEGORIES } from "../constants";
import { notifySuccess } from "../lib/toast";
import type { Video, Visibility } from "../types";
import { DESCRIPTION_MAX, TITLE_MAX, validateMaxLength, validateRequired } from "../lib/validation";

type UploadPhase = "idle" | "uploading" | "done";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

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
  const [titleError, setTitleError] = useState("");
  const [videoError, setVideoError] = useState("");

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

    const nextTitleError = validateRequired(title, "Title") || validateMaxLength(title, TITLE_MAX, "Title");
    setTitleError(nextTitleError || "");
    if (nextTitleError) return;

    if (!video) {
      setVideoError("Please select a video file.");
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

  const steps = [
    { label: "Choose video", done: !!video },
    { label: "Add details", done: !!title.trim() },
    { label: "Publish", done: phase === "done" },
  ];
  const currentStep = steps.findIndex((s) => !s.done);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-md pb-16 pt-lg sm:px-lg">
      <PageHeader
        icon={UploadSimple}
        title="Upload video"
        description="Share your next video with your audience."
        actions={
          <ol aria-label="Upload progress" className="flex items-center gap-1">
            {steps.map((step, i) => (
              <li key={step.label} className="flex items-center gap-1">
                <span
                  aria-current={i === currentStep ? "step" : undefined}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-fine-print font-semibold transition-colors duration-fast ${
                    step.done
                      ? "bg-success/10 text-success"
                      : i === currentStep
                        ? "bg-accent-soft text-accent"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.done ? (
                    <CheckCircle size={14} weight="fill" aria-hidden />
                  ) : (
                    <span className="tabular" aria-hidden>
                      {i + 1}
                    </span>
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sr-only">{step.done ? " (complete)" : ""}</span>
                </span>
                {i < steps.length - 1 && <span aria-hidden className="h-px w-3 bg-border sm:w-5" />}
              </li>
            ))}
          </ol>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-lg desktop:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-lg">
          <Panel title="Media" description="Your video and an optional custom thumbnail">
            <div className="flex flex-col gap-lg">
              <MediaDropzone
                kind="video"
                label="Video file"
                accept="video/*"
                maxSizeMB={2048}
                value={video}
                onChange={(file) => {
                  setVideo(file);
                  if (file) setVideoError("");
                }}
                error={videoError}
                disabled={submitting}
                helperText="MP4, WebM or MOV, up to 2GB"
                size="lg"
              />

              {videoPreviewUrl && (
                <div className="overflow-hidden rounded-lg bg-scrim ring-1 ring-inset ring-border">
                  <video src={videoPreviewUrl} muted controls preload="metadata" className="aspect-video w-full object-contain" />
                </div>
              )}

              <MediaDropzone
                kind="image"
                label="Custom thumbnail (optional)"
                accept="image/*"
                maxSizeMB={10}
                value={thumbnail}
                onChange={setThumbnail}
                disabled={submitting}
                helperText="Skip this and we'll generate one from your video automatically."
              />
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-lg desktop:sticky desktop:top-20 desktop:self-start">
          <Panel title="Details" description="Help viewers find your video">
            <div className="flex flex-col gap-md">
              <TextField
                label="Title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
                onBlur={() =>
                  title && setTitleError(validateRequired(title, "Title") || validateMaxLength(title, TITLE_MAX, "Title") || "")
                }
                error={!!titleError}
                disabled={submitting}
                helperText={titleError || `${title.length}/${TITLE_MAX}`}
                slotProps={{ formHelperText: { className: titleError ? undefined : "!text-right tabular" } }}
                fullWidth
              />
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX))}
                multiline
                minRows={4}
                disabled={submitting}
                helperText={`${description.length}/${DESCRIPTION_MAX}`}
                slotProps={{ formHelperText: { className: "!text-right tabular" } }}
                placeholder="Tell viewers what your video is about"
                fullWidth
              />
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={submitting}
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                fullWidth
              />
              <VisibilityPicker value={visibility} onChange={setVisibility} disabled={submitting} />
            </div>
          </Panel>

          {phase === "uploading" && (
            <div role="status" aria-live="polite" className="flex flex-col gap-xs rounded-lg border border-border bg-card p-md">
              <div className="flex items-center justify-between text-caption-strong text-foreground">
                <span className="flex items-center gap-1.5">
                  <UploadSimple size={18} className="text-info" aria-hidden />
                  {uploadFinished ? "Processing…" : "Uploading…"}
                </span>
                <span className="tabular">{progress}%</span>
              </div>
              <LinearProgress
                variant={uploadFinished ? "indeterminate" : "determinate"}
                value={progress}
                color="info"
                aria-label="Upload progress"
              />
              <p className="text-fine-print text-muted-foreground">
                {uploadFinished
                  ? "Almost there, preparing your video for processing."
                  : "Keep this tab open until the upload finishes."}
              </p>
            </div>
          )}

          {phase === "done" && (
            <FormAlert tone="success">Upload complete. Taking you to your video…</FormAlert>
          )}

          {error && <FormAlert>{error}</FormAlert>}

          <div className="pb-safe sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 -mx-md flex items-center gap-xs border-t border-border bg-elevated/95 p-md backdrop-blur-xl md:bottom-0 desktop:static desktop:mx-0 desktop:border-0 desktop:bg-transparent desktop:p-0 desktop:backdrop-blur-none">
            <Tooltip title="Coming soon">
              <span className="flex-1">
                <Button type="button" variant="outlined" disabled fullWidth>
                  Save draft
                </Button>
              </span>
            </Tooltip>
            <Button type="submit" variant="contained" loading={submitting} className="!flex-1" size="large">
              {primaryLabel}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
