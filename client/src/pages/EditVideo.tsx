import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TextField from "../components/TextField";
import Select from "../components/Select";
import Switch from "../components/Switch";
import Button from "../components/Button";
import { useGetVideoQuery, useUpdateVideoMutation } from "../store/api/videosApi";
import { getRtkErrorMessage } from "../store/lib/getRtkErrorMessage";
import { CATEGORIES } from "../constants";
import Loading from "../components/Loading";
import ErrorState from "../components/ErrorState";
import MediaDropzone from "../components/MediaDropzone";
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
    if (nextTitleError) return;

    setError("");
    try {
      await updateVideo({
        id,
        data: { title, description, category, visibility, thumbnail: thumbnail || undefined },
      }).unwrap();
      navigate(`/watch/${id}`);
    } catch (err) {
      setError(getRtkErrorMessage(err));
    }
  };

  if (loading) return <Loading />;

  if (hasLoadError) {
    return (
      <ErrorState
        message="We couldn't load this video's details. Please try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-lg p-4">
      <h1 className="mb-6 text-2xl font-semibold">Edit video</h1>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
          onBlur={() => setTitleError(validateRequired(title, "Title") || validateMaxLength(title, TITLE_MAX, "Title") || "")}
          error={!!titleError}
          helperText={titleError}
          disabled={submitting}
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX))}
          multiline
          minRows={3}
          disabled={submitting}
        />
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={submitting}
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
        />

        <Switch
          checked={visibility === "private"}
          onChange={(e) => setVisibility(e.target.checked ? "private" : "public")}
          disabled={submitting}
          label={visibility === "private" ? "Private (only you can view)" : "Public (visible to everyone)"}
        />

        <MediaDropzone
          kind="image"
          label="Replace thumbnail (optional)"
          accept="image/*"
          maxSizeMB={10}
          value={thumbnail}
          onChange={setThumbnail}
          disabled={submitting}
          helperText="JPG, PNG, WebP up to 10MB"
        />

        {error && <p className="text-sm font-medium text-foreground dark:text-foreground-dark">{error}</p>}
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
