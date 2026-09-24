import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Select from "../components/Select";
import Button from "../components/Button";
import Skeleton from "@mui/material/Skeleton";
import { ArrowDown, MagnifyingGlass, WarningCircle } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
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
      aria-pressed={active}
      className={`h-9 shrink-0 rounded-sm px-3.5 text-button-utility transition-colors duration-fast ${
        active
          ? "bg-foreground text-background"
          : "bg-muted text-foreground hover:bg-foreground/10"
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
  const { data, isFetching, isError, error, refetch } = query ? searchResult : listResult;

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

  const chipBar = (
    <div className="sticky top-16 z-20 -mx-md mb-md bg-background/85 px-md py-sm backdrop-blur-xl sm:-mx-lg sm:px-lg">
      <div className="flex items-center gap-sm">
        <div
          role="group"
          aria-label="Filter by category"
          className="scrollbar-none -my-1 flex min-w-0 flex-1 items-center gap-xs overflow-x-auto py-1 [mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)]"
        >
          <FilterChip label="All" active={category === ""} onClick={() => setCategory("")} />
          {CATEGORIES.map((c) => (
            <FilterChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
          ))}
        </div>
        <Select
          size="small"
          dense
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="shrink-0"
          options={SORT_OPTIONS}
          slotProps={{ htmlInput: { "aria-label": "Sort videos" } }}
        />
      </div>
    </div>
  );

  const pageHeader = query ? (
    <div className="mb-sm flex flex-wrap items-center gap-x-sm gap-y-1">
      <h1 className="flex items-center gap-2 text-tagline text-foreground">
        <MagnifyingGlass size={20} className="text-muted-foreground" aria-hidden />
        Results for &ldquo;{query}&rdquo;
      </h1>
      {data && (
        <span className="tabular text-caption text-muted-foreground">
          {total.toLocaleString()} {total === 1 ? "video" : "videos"}
        </span>
      )}
      <Link to="/" className="ml-auto text-caption-strong text-accent hover:underline">
        Clear search
      </Link>
    </div>
  ) : (
    <h1 className="sr-only">Browse videos</h1>
  );

  if (loading) {
    return (
      <div className="px-md pb-16 pt-xs sm:px-lg">
        {pageHeader}
        <div className="mb-md flex items-center gap-xs overflow-hidden py-sm">
          {[48, ...CATEGORIES.map((c) => Math.min(44 + c.length * 7, 110))].map((w, i) => (
            <Skeleton key={i} variant="rounded" width={w} height={36} className="shrink-0" />
          ))}
        </div>
        <VideoGridSkeleton count={12} />
      </div>
    );
  }

  if (errorMessage && allItems.length === 0) {
    return (
      <ErrorState
        message="We couldn't load videos right now. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  const hasMore = allItems.length < total;

  return (
    <div className="px-md pb-16 pt-xs sm:px-lg">
      {pageHeader}
      {chipBar}

      {errorMessage && allItems.length > 0 && (
        <div
          role="alert"
          className="mb-md flex items-center gap-xs rounded-md border border-destructive/30 bg-destructive/5 px-sm py-xs text-fine-print font-medium text-destructive"
        >
          <WarningCircle size={16} weight="bold" aria-hidden />
          Couldn't refresh results: {errorMessage}
        </div>
      )}

      <div
        aria-busy={isFetching}
        className={`transition-opacity duration-enter ${isFetching && !loadingMore ? "pointer-events-none opacity-60" : ""}`}
      >
        <VideoGrid
          videos={allItems}
          emptyMessage={
            query || category ? "No results found. Try a different search or category." : "No videos to show yet."
          }
        />
      </div>

      {hasMore && (
        <div className="mt-xl flex flex-col items-center gap-xs">
          <Button
            variant="outlined"
            onClick={() => setPage((p) => p + 1)}
            loading={loadingMore}
            startIcon={<ArrowDown size={16} />}
            className="!rounded-full !px-6"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </Button>
          <p className="tabular text-fine-print text-muted-foreground">
            Showing {allItems.length.toLocaleString()} of {total.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
