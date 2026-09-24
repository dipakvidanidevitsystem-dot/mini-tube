import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "../components/Button";
import Skeleton from "@mui/material/Skeleton";
import { MagnifyingGlass, PencilSimple, Check, Bell, Sparkle, Play, CalendarBlank, Eye, UsersThree } from "@phosphor-icons/react";
import Select from "../components/Select";
import { VideoGridSkeleton } from "../components/VideoCardSkeleton";
import { useGetChannelQuery, useToggleSubscribeMutation } from "../store/api/usersApi";
import { useAppSelector } from "../store/hooks";
import { notifyApiError, notifySuccess } from "../lib/toast";
import { formatCompact, formatDate } from "../lib/format";
import VideoGrid from "../components/VideoGrid";
import VideoCard from "../components/VideoCard";
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

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-md py-lg sm:px-lg" aria-busy>
        <Skeleton variant="rounded" className="!h-40 w-full !rounded-xl sm:!h-52" />
        <div className="-mt-10 flex items-end gap-md px-md">
          <Skeleton variant="circular" width={112} height={112} />
          <div className="flex-1 pb-2">
            <Skeleton variant="text" width={220} sx={{ fontSize: "28px" }} />
            <Skeleton variant="text" width={280} />
          </div>
        </div>
        <div className="mt-xl">
          <VideoGridSkeleton count={8} />
        </div>
      </div>
    );
  }

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
  const stats = [
    { label: channel.subscriberCount === 1 ? "subscriber" : "subscribers", value: channel.subscriberCount },
    { label: channel.videoCount === 1 ? "video" : "videos", value: channel.videoCount },
    { label: totalViews === 1 ? "view" : "views", value: totalViews },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-lg px-md pb-16 pt-md sm:px-lg sm:pt-lg">
      <section aria-label="Channel header">
        <div className="relative h-36 overflow-hidden rounded-xl bg-accent-soft ring-1 ring-inset ring-border sm:h-52">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgb(var(--c-accent)/0.55),transparent_55%),radial-gradient(90%_120%_at_100%_100%,rgb(var(--c-info)/0.45),transparent_60%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgb(var(--c-foreground)/0.18)_1px,transparent_1px)] [background-size:18px_18px]"
          />
        </div>

        <div className="relative -mt-12 flex flex-col gap-md px-xs sm:-mt-14 sm:flex-row sm:items-end sm:justify-between sm:px-lg">
          <div className="flex flex-col items-center gap-md text-center sm:flex-row sm:items-end sm:text-left">
            <Avatar
              src={channel.profileImage || undefined}
              alt=""
              sx={{ width: { xs: 104, sm: 128 }, height: { xs: 104, sm: 128 }, fontSize: 40 }}
              className="shadow-float ring-4 ring-background"
            >
              {channel.name?.[0]?.toUpperCase()}
            </Avatar>
            <div className="min-w-0 pb-1">
              <h1 className="text-display-md text-foreground [overflow-wrap:anywhere]">{channel.name}</h1>
              <ul className="tabular mt-xs flex flex-wrap justify-center gap-xs sm:justify-start">
                {stats.map((stat) => (
                  <li
                    key={stat.label}
                    title={`${stat.value.toLocaleString()} ${stat.label}`}
                    className="rounded-full bg-muted px-3 py-1 text-fine-print text-muted-foreground"
                  >
                    <span className="font-semibold text-foreground">{formatCompact(stat.value)}</span> {stat.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-center pb-1 sm:justify-end">
            {isOwner ? (
              <Button component={Link} to="/settings" variant="outlined" startIcon={<PencilSimple size={16} />} className="!rounded-full">
                Edit channel
              </Button>
            ) : (
              user && (
                <Button
                  variant={channel.isSubscribed ? "outlined" : "contained"}
                  onClick={handleSubscribe}
                  aria-pressed={channel.isSubscribed}
                  startIcon={channel.isSubscribed ? <Check size={16} weight="bold" /> : <Bell size={16} />}
                  className="!rounded-full !px-5"
                >
                  {channel.isSubscribed ? "Subscribed" : "Subscribe"}
                </Button>
              )
            )}
          </div>
        </div>
      </section>

      <div role="tablist" aria-label="Channel sections" className="flex gap-1 border-b border-border">
        {(["videos", "about"] as const).map((tab) => (
          <button
            key={tab}
            id={`channel-tab-${tab}`}
            role="tab"
            type="button"
            aria-selected={activeTab === tab}
            aria-controls={`channel-panel-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`relative h-11 px-4 text-caption-strong capitalize transition-colors duration-fast ${
              activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && <span aria-hidden className="absolute inset-x-2 -bottom-px h-[3px] rounded-full bg-accent" />}
          </button>
        ))}
      </div>

      {activeTab === "videos" ? (
        <div id="channel-panel-videos" role="tabpanel" aria-labelledby="channel-tab-videos" className="flex flex-col gap-xl">
          {featuredVideo && (
            <section
              aria-label="Featured video"
              className="grid gap-md rounded-xl border border-border bg-card p-sm sm:p-md md:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] md:items-center md:gap-lg"
            >
              <VideoCard video={featuredVideo} showDetails={false} isFeatured />
              <div className="flex min-w-0 flex-col justify-center gap-xs px-xs md:py-sm">
                <p className="inline-flex items-center gap-1.5 text-fine-print font-semibold uppercase tracking-wider text-accent">
                  <Sparkle size={14} weight="fill" aria-hidden />
                  Most popular
                </p>
                <h2 className="line-clamp-2 text-lead text-foreground font-heading">{featuredVideo.title}</h2>
                <p className="tabular text-caption text-muted-foreground">
                  {pluralize(featuredVideo.views, "view")} · {formatDate(featuredVideo.createdAt)}
                </p>
                {featuredVideo.description && (
                  <p className="line-clamp-3 text-caption text-foreground">{featuredVideo.description}</p>
                )}
                <Button
                  component={Link}
                  to={`/watch/${featuredVideo.id}`}
                  variant="contained"
                  startIcon={<Play size={14} weight="fill" />}
                  className="!mt-xs w-fit !rounded-full"
                >
                  Watch now
                </Button>
              </div>
            </section>
          )}

          <section aria-labelledby="channel-videos-heading" className="flex flex-col gap-md">
            <div className="flex flex-col gap-sm lg:flex-row lg:items-center lg:justify-between">
              <h2 id="channel-videos-heading" className="flex items-center gap-2 text-tagline text-foreground">
                Videos
                <span className="tabular rounded-full bg-muted px-2 py-0.5 text-fine-print font-semibold text-muted-foreground">
                  {visibleVideos.length}
                </span>
              </h2>
              <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
                {isOwner && (
                  <div
                    role="group"
                    className="inline-flex h-10 w-fit rounded-full bg-muted p-1"
                    aria-label="Filter channel videos by visibility"
                  >
                    {(["all", "public", "private"] as const).map((visibility) => (
                      <button
                        key={visibility}
                        type="button"
                        aria-pressed={visibilityFilter === visibility}
                        onClick={() => setVisibilityFilter(visibility)}
                        className={`rounded-full px-3.5 text-button-utility capitalize transition-colors duration-fast ${
                          visibilityFilter === visibility
                            ? "bg-card text-foreground shadow-float-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {visibility}
                      </button>
                    ))}
                  </div>
                )}

                <label className="relative block min-w-0 sm:w-64">
                  <span className="sr-only">Search this channel</span>
                  <MagnifyingGlass
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search this channel"
                    className="h-10 w-full rounded-full border border-border bg-muted/60 pl-10 pr-4 text-caption text-foreground outline-none transition-colors duration-fast placeholder:text-muted-foreground focus:border-ring focus:bg-card"
                  />
                </label>

                <Select
                  dense
                  size="small"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as ChannelSort)}
                  options={[
                    { value: "recent", label: "Recently added" },
                    { value: "popular", label: "Most viewed" },
                    { value: "oldest", label: "Oldest first" },
                  ]}
                  slotProps={{ htmlInput: { "aria-label": "Sort channel videos" } }}
                />
              </div>
            </div>

            <VideoGrid
              videos={visibleVideos}
              emptyMessage={searchQuery ? "No videos match this channel search." : "No videos to show yet."}
              showAvatar={false}
              showCreatorName={false}
            />
          </section>
        </div>
      ) : (
        <section
          id="channel-panel-about"
          role="tabpanel"
          aria-labelledby="channel-tab-about"
          className="grid gap-md lg:grid-cols-[minmax(0,1fr)_320px]"
        >
          <div className="rounded-xl border border-border bg-card p-md sm:p-lg">
            <h2 className="text-tagline text-foreground">About</h2>
            <p className="mt-sm max-w-xl text-caption text-muted-foreground">
              Developer and creator sharing projects, tutorials, and experiments.
            </p>
          </div>
          <dl className="flex flex-col gap-sm rounded-xl border border-border bg-card p-md sm:p-lg">
            <h3 className="text-body-strong text-foreground">Stats</h3>
            <div className="flex items-center gap-sm text-caption">
              <CalendarBlank size={18} className="text-muted-foreground" aria-hidden />
              <dt className="sr-only">Joined</dt>
              <dd className="text-foreground">Joined {formatDate(channel.createdAt)}</dd>
            </div>
            <div className="flex items-center gap-sm text-caption">
              <Eye size={18} className="text-muted-foreground" aria-hidden />
              <dt className="sr-only">Views</dt>
              <dd className="tabular text-foreground">{pluralize(totalViews, "view")}</dd>
            </div>
            <div className="flex items-center gap-sm text-caption">
              <UsersThree size={18} className="text-muted-foreground" aria-hidden />
              <dt className="sr-only">Subscribers</dt>
              <dd className="tabular text-foreground">{pluralize(channel.subscriberCount, "subscriber")}</dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
}
