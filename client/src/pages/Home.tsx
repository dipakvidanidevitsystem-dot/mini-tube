import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Select from "../components/Select";
import Button from "../components/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import { WarningCircle } from "@phosphor-icons/react";
import { useListVideosQuery, useSearchVideosQuery } from "../store/api/videosApi";
import { getRtkErrorMessage } from "../store/lib/getRtkErrorMessage";
import { CATEGORIES, SORT_OPTIONS } from "../constants";
import type { SortOption, Video } from "../types";
import VideoGrid from "../components/VideoGrid";
import { VideoGridSkeleton } from "../components/VideoCardSkeleton";
import ErrorState from "../components/ErrorState";

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-sm py-xxs text-button-utility transition-colors ${
        active
          ? "border-accent bg-accent text-on-accent"
          : "border-border text-foreground hover:border-accent/60 dark:border-border-dark dark:text-foreground-dark dark:hover:border-accent/60"
      }`}
    >
      {label}
    </button>
  );
}

export default function Home() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string>("");
  const [sort, setSort] = useState<SortOption>("latest");
  const [allItems, setAllItems] = useState<Video[]>([]);
  const hasLoadedOnce = useRef(false);

  const params = { category: category || undefined, sort, page };

  const listResult = useListVideosQuery(params, { skip: !!query });
  const searchResult = useSearchVideosQuery({ q: query, ...params }, { skip: !query });
  const { data, isFetching, isError, error } = query ? searchResult : listResult;

  // Reset accumulated items when filters/search change (back to page 1).
  useEffect(() => {
    setPage(1);
    setAllItems([]);
    hasLoadedOnce.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, sort]);

  useEffect(() => {
    if (!data) return;
    hasLoadedOnce.current = true;
    setAllItems((prev) => (data.page > 1 ? [...prev, ...data.items] : data.items));
  }, [data]);

  const loading = isFetching && page === 1 && !hasLoadedOnce.current;
  const loadingMore = isFetching && page > 1;
  const errorMessage = isError ? getRtkErrorMessage(error) : "";
  const total = data?.total ?? 0;

  if (loading) {
    return (
      <div className="p-md sm:p-lg pb-16">
        <div className="mb-md">
          <Skeleton variant="text" width={160} sx={{ fontSize: "2rem" }} />
          <Skeleton variant="text" width={220} sx={{ fontSize: "0.875rem" }} />
        </div>
        <div className="mb-md flex flex-wrap items-center gap-sm">
          <Skeleton variant="rounded" width={40} height={28} sx={{ borderRadius: "9999px" }} />
          {CATEGORIES.map((c) => (
            <Skeleton
              key={c}
              variant="rounded"
              width={Math.min(40 + c.length * 6, 100)}
              height={28}
              sx={{ borderRadius: "9999px" }}
            />
          ))}
          <Skeleton variant="rounded" width={110} height={32} className="ml-auto" />
        </div>
        <VideoGridSkeleton />
      </div>
    );
  }

  if (errorMessage && allItems.length === 0) {
    return (
      <ErrorState
        message="We couldn't load videos right now. Please check your connection and try again."
        onRetry={() => setPage(1)}
      />
    );
  }

  const hasMore = allItems.length < total;

  return (
    <div className="p-md sm:p-lg pb-16">
      {query ? (
        <h1 className="mb-lg text-body-strong text-foreground dark:text-foreground-dark">
          Search results for &quot;{query}&quot;
        </h1>
      ) : (
        <div className="mb-md">
          <h1 className="text-display-md text-foreground dark:text-foreground-dark">Browse</h1>
          <p className="text-caption text-muted-foreground dark:text-muted-foreground-dark">
            Explore videos across MiniTube.
          </p>
        </div>
      )}

      <div className="mb-md flex flex-nowrap items-center gap-sm overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
        <FilterChip label="All" active={category === ""} onClick={() => setCategory("")} />
        {CATEGORIES.map((c) => (
          <FilterChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
        ))}
        <Select
          size="small"
          dense
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="ml-auto shrink-0"
          options={SORT_OPTIONS}
        />
      </div>

      <div className="mb-2 h-1">{loading && <LinearProgress />}</div>

      {errorMessage && allItems.length > 0 && (
        <div className="mb-md flex items-center gap-xxs rounded-lg border border-destructive/30 bg-destructive/5 px-sm py-xxs text-fine-print font-medium text-destructive dark:border-destructive-dark/30 dark:bg-destructive-dark/10 dark:text-destructive-dark">
          <WarningCircle size={16} weight="bold" />
          Couldn't refresh results: {errorMessage}
        </div>
      )}

      <div className={loading ? "pointer-events-none opacity-60 transition-opacity" : "transition-opacity"}>
        <VideoGrid
          videos={allItems}
          showAvatar={false}
          emptyMessage={
            query || category ? `No results found. Try a different search or category.` : "No videos to show yet."
          }
        />
      </div>

      {hasMore && (
        <div className="mt-xl flex justify-center">
          <Button variant="outlined" onClick={() => setPage((p) => p + 1)} disabled={loadingMore}>
            {loadingMore ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
