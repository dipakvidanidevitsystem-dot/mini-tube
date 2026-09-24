import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import { ArrowSquareOut, PencilSimple } from "@phosphor-icons/react";
import TextField from "../components/TextField";
import Select from "../components/Select";
import Button from "../components/Button";
import { useGetVideoQuery, useUpdateVideoMutation } from "../store/api/videosApi";
import { getRtkErrorMessage } from "../store/lib/getRtkErrorMessage";
import { CATEGORIES } from "../constants";
import ErrorState from "../components/ErrorState";
import MediaDropzone from "../components/MediaDropzone";
import PageHeader from "../components/PageHeader";
import Panel from "../components/Panel";
import FormAlert from "../components/FormAlert";
import VisibilityPicker from "../components/VisibilityPicker";
import { notifySuccess } from "../lib/toast";
import type { Visibility } from "../types";
import { DESCRIPTION_MAX, TITLE_MAX, validateMaxLength, validateRequired } from "../lib/validation";

export default function EditVideo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: video, isLoading: loading, isError: hasLoadError, refetch } = useGetVideoQuery(id!, { skip: !id });
  const [updateVideo, { isLoading: submitting }] = useUpdateVideoMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [titleError, setTitleError] = useState("");

  useEffect(() => {
    if (!video) return;
    setTitle(video.title);
    setDescription(video.description || "");
    setCategory(video.category || CATEGORIES[0]);
    setVisibility(video.visibility);
  }, [video]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const nextTitleError = validateRequired(title, "Title") || validateMaxLength(title, TITLE_MAX, "Title");
    setTitleError(nextTitleError || "");
    if (nextTitleError) {
      document.getElementById("edit-title")?.focus();
      return;
    }

    setError("");
    try {
      await updateVideo({
        id,
        data: { title, description, category, visibility, thumbnail: thumbnail || undefined },
      }).unwrap();
      notifySuccess("Video updated.");
      navigate(`/watch/${id}`);
    } catch (err) {
      setError(getRtkErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-md py-lg sm:px-lg" aria-busy>
        <Skeleton variant="text" width={200} sx={{ fontSize: "28px" }} />
        <div className="mt-lg grid gap-lg lg:grid-cols-[minmax(0,1fr)_360px]">
          <Skeleton variant="rounded" height={420} />
          <Skeleton variant="rounded" height={300} />
        </div>
      </div>
    );
  }

  if (hasLoadError) {
    return <ErrorState message="We couldn't load this video's details. Please try again." onRetry={refetch} />;
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-md pb-16 pt-lg sm:px-lg">
      <PageHeader
        icon={PencilSimple}
        title="Edit video"
        description={video ? `Update the details for “${video.title}”.` : undefined}
        actions={
          <Button component={Link} to={`/watch/${id}`} variant="outlined" size="small" startIcon={<ArrowSquareOut size={16} />}>
            View video
          </Button>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="grid gap-lg lg:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="Details">
          <div className="flex flex-col gap-md">
            {error && <FormAlert>{error}</FormAlert>}
            <TextField
              id="edit-title"
              label="Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
              onBlur={() => setTitleError(validateRequired(title, "Title") || validateMaxLength(title, TITLE_MAX, "Title") || "")}
              error={!!titleError}
              helperText={titleError || `${title.length}/${TITLE_MAX}`}
              slotProps={{ formHelperText: { className: titleError ? undefined : "!text-right tabular" } }}
              disabled={submitting}
              fullWidth
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX))}
              multiline
              minRows={5}
              helperText={`${description.length}/${DESCRIPTION_MAX}`}
              slotProps={{ formHelperText: { className: "!text-right tabular" } }}
              disabled={submitting}
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

        <div className="flex flex-col gap-lg lg:sticky lg:top-20 lg:self-start">
          <Panel title="Thumbnail">
            <div className="flex flex-col gap-md">
              {video?.thumbnailUrl && !thumbnail && (
                <img
                  src={video.thumbnailUrl}
                  alt="Current thumbnail"
                  className="aspect-video w-full rounded-md object-cover ring-1 ring-inset ring-border"
                />
              )}
              <MediaDropzone
                kind="image"
                label="Replace thumbnail (optional)"
                accept="image/*"
                maxSizeMB={10}
                value={thumbnail}
                onChange={setThumbnail}
                disabled={submitting}
                helperText="JPG, PNG or WebP, up to 10MB"
              />
            </div>
          </Panel>

          <div className="flex gap-xs">
            <Button component={Link} to={`/watch/${id}`} variant="outlined" disabled={submitting} className="!flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="contained" loading={submitting} className="!flex-1">
              {submitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
