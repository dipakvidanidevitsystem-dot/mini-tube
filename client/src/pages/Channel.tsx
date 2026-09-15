import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "../components/Button";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useGetChannelQuery, useToggleSubscribeMutation } from "../store/api/usersApi";
import { useAppSelector } from "../store/hooks";
import { notifyApiError, notifySuccess } from "../lib/toast";
import { formatDate } from "../lib/format";
import VideoGrid from "../components/VideoGrid";
import VideoCard from "../components/VideoCard";
import Loading from "../components/Loading";
import ErrorState from "../components/ErrorState";
import type { Video, Visibility } from "../types";

type ChannelTab = "videos" | "about";
type ChannelSort = "recent" | "popular" | "oldest";
type VisibilityFilter = "all" | Visibility;

function pluralize(count: number, word: string) {
  return `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;
}

export default function Channel() {
  const { id } = useParams<{ id: string }>();
  const user = useAppSelector((state) => state.auth.user);
  const { data: channel, isLoading: loading, isError: hasError, refetch } = useGetChannelQuery(id!, { skip: !id });
  const [toggleSubscribe] = useToggleSubscribeMutation();
  const [activeTab, setActiveTab] = useState<ChannelTab>("videos");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<ChannelSort>("recent");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");

  const handleSubscribe = async () => {
    if (!channel) return;
    try {
      const result = await toggleSubscribe(channel.id).unwrap();
      notifySuccess(result.subscribed ? "Subscribed to this channel." : "Unsubscribed from this channel.");
    } catch (err) {
      notifyApiError(err);
    }
  };

  const featuredVideo = useMemo(() => {
    if (!channel) return undefined;
    return [...channel.videos]
      .filter((video) => video.processingStatus === "ready")
      .sort((first, second) => second.views - first.views || Date.parse(second.createdAt) - Date.parse(first.createdAt))[0];
  }, [channel]);

  const visibleVideos = useMemo(() => {
    if (!channel) return [];
    const query = searchQuery.trim().toLowerCase();

    return [...channel.videos]
      .filter((video) => visibilityFilter === "all" || video.visibility === visibilityFilter)
      .filter((video) => {
        if (!query) return true;
        return [video.title, video.description, video.category]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(query));
      })
      .sort((first: Video, second: Video) => {
        if (sortBy === "popular") return second.views - first.views;
        if (sortBy === "oldest") return Date.parse(first.createdAt) - Date.parse(second.createdAt);
        return Date.parse(second.createdAt) - Date.parse(first.createdAt);
      });
  }, [channel, searchQuery, sortBy, visibilityFilter]);

  if (loading) return <Loading />;

  if (hasError) {
    return (
      <ErrorState
        message="We couldn't load this channel. It may not exist, or the connection may be down."
        onRetry={refetch}
      />
    );
  }

  if (!channel) return null;

  const isOwner = user?.id === channel.id;
  const totalViews = channel.videos.reduce((sum, video) => sum + video.views, 0);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-lg px-4 py-lg sm:px-6 sm:py-xl">
      <section className="overflow-hidden rounded-lg border border-border bg-card dark:border-border-dark dark:bg-card-dark">
        <div className="h-28 bg-secondary bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_16px)] sm:h-36">
          <div className="h-full w-full bg-[linear-gradient(90deg,rgba(15,15,35,0.14),transparent_65%)]" />
        </div>

        <div className="-mt-10 flex flex-col gap-md px-4 pb-lg sm:-mt-12 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="flex flex-col items-center gap-sm text-center sm:flex-row sm:items-end sm:text-left">
            <Avatar
              src={channel.profileImage || undefined}
              sx={{ width: 112, height: 112, border: "4px solid", borderColor: "background.paper" }}
              className="shadow-md"
            >
              {channel.name?.[0]?.toUpperCase()}
            </Avatar>
            <div className="min-w-0 pb-1">
              <h1 className="break-words text-display-md text-foreground dark:text-foreground-dark">{channel.name}</h1>
              <p className="mt-1 text-caption text-muted-foreground dark:text-muted-foreground-dark">
                {pluralize(channel.subscriberCount, "subscriber")} &middot; {pluralize(channel.videoCount, "video")} &middot;{" "}
                {pluralize(totalViews, "total view")}
              </p>
            </div>
          </div>

          <div className="flex justify-center pb-1 sm:justify-end">
            {isOwner ? (
              <Button component={Link} to="/settings" variant="outlined">
                Edit channel
              </Button>
            ) : (
              user && (
                <Button variant={channel.isSubscribed ? "outlined" : "contained"} onClick={handleSubscribe}>
                  {channel.isSubscribed ? "Subscribed" : "Subscribe"}
                </Button>
              )
            )}
          </div>
        </div>
      </section>

      <nav className="flex gap-2 border-b border-border dark:border-border-dark" aria-label="Channel sections">
        {(["videos", "about"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-3 py-3 text-caption-strong capitalize transition-colors sm:px-4 ${
              activeTab === tab
                ? "border-primary text-foreground dark:border-ring-dark dark:text-foreground-dark"
                : "border-transparent text-muted-foreground hover:text-foreground dark:text-muted-foreground-dark dark:hover:text-foreground-dark"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === "videos" ? (
        <>
          {featuredVideo && (
            <section className="grid gap-md border-b border-border pb-lg dark:border-border-dark md:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] md:items-center">
              <VideoCard video={featuredVideo} showDetails={false} isFeatured />
              <div className="flex min-w-0 flex-col justify-center gap-xs md:py-sm">
                <p className="text-caption-strong uppercase tracking-wide text-accent">Featured</p>
                <h2 className="line-clamp-2 text-tagline text-foreground dark:text-foreground-dark">{featuredVideo.title}</h2>
                <p className="text-caption text-muted-foreground dark:text-muted-foreground-dark">
                  {pluralize(featuredVideo.views, "view")} &middot; {formatDate(featuredVideo.createdAt)}
                </p>
                {featuredVideo.description && (
                  <p className="line-clamp-3 text-caption text-foreground dark:text-foreground-dark">
                    {featuredVideo.description}
                  </p>
                )}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-md">
            <div className="flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
              <h2 className="text-tagline text-foreground dark:text-foreground-dark">Videos</h2>
              <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
                <label className="relative block min-w-0 sm:w-64">
                  <MagnifyingGlass
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search this channel"
                    className="h-10 w-full rounded-md border border-border bg-card pl-10 pr-3 text-caption text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-border-dark dark:bg-card-dark dark:text-foreground-dark dark:focus:border-ring-dark"
                  />
                </label>

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as ChannelSort)}
                  className="h-10 rounded-md border border-border bg-card px-3 text-caption text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-border-dark dark:bg-card-dark dark:text-foreground-dark dark:focus:border-ring-dark"
                  aria-label="Sort channel videos"
                >
                  <option value="recent">Recently added</option>
                  <option value="popular">Most viewed</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>

            <div className="inline-flex w-fit overflow-hidden rounded-md border border-border bg-muted/60 dark:border-border-dark dark:bg-muted-dark" aria-label="Filter channel videos by visibility">
              {(["all", "public", "private"] as const).map((visibility) => (
                <button
                  key={visibility}
                  type="button"
                  onClick={() => setVisibilityFilter(visibility)}
                  className={`px-3 py-2 text-caption capitalize transition-colors sm:px-4 ${
                    visibilityFilter === visibility
                      ? "bg-card text-foreground shadow-sm dark:bg-card-dark dark:text-foreground-dark"
                      : "text-muted-foreground hover:text-foreground dark:text-muted-foreground-dark dark:hover:text-foreground-dark"
                  }`}
                >
                  {visibility}
                </button>
              ))}
            </div>

            <VideoGrid
              videos={visibleVideos}
              emptyMessage={searchQuery ? "No videos match this channel search." : "No videos to show yet."}
              showAvatar={false}
              showCreatorName={false}
            />
          </section>
        </>
      ) : (
        <section className="max-w-2xl py-sm">
          <h2 className="text-tagline text-foreground dark:text-foreground-dark">About</h2>
          <div className="mt-md space-y-sm text-caption text-foreground dark:text-foreground-dark">
            <p className="text-body-strong">{channel.name}</p>
            <p className="max-w-xl text-muted-foreground dark:text-muted-foreground-dark">
              Developer and creator sharing projects, tutorials, and experiments.
            </p>
            <p>Joined {formatDate(channel.createdAt)}</p>
            <p className="text-muted-foreground dark:text-muted-foreground-dark">
              {pluralize(channel.videoCount, "video")} &middot; {pluralize(channel.subscriberCount, "subscriber")}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
