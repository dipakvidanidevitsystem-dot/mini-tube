import Skeleton from "@mui/material/Skeleton";

/** Shared responsive grid so skeletons and real cards occupy identical tracks (no layout shift). */
export const VIDEO_GRID_CLASS =
  "grid grid-cols-1 gap-x-md gap-y-lg xs:grid-cols-2 lg:grid-cols-3 desktop:grid-cols-4 wide:grid-cols-5";

export const MY_VIDEO_GRID_CLASS = "grid gap-x-md gap-y-lg [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]";

export default function VideoCardSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton variant="rounded" className="!aspect-video !h-auto w-full !rounded-lg" />
      <div className="mt-sm flex gap-sm">
        <Skeleton variant="circular" width={36} height={36} className="mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <Skeleton variant="text" sx={{ fontSize: "16px" }} width="92%" />
          <Skeleton variant="text" sx={{ fontSize: "16px" }} width="58%" />
          <Skeleton variant="text" sx={{ fontSize: "14px" }} width="40%" />
        </div>
      </div>
    </div>
  );
}

export function VideoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={VIDEO_GRID_CLASS} role="status" aria-label="Loading videos">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function MyVideoCardSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton variant="rounded" className="!aspect-video !h-auto w-full !rounded-lg" />
      <div className="mt-sm">
        <Skeleton variant="text" sx={{ fontSize: "16px" }} width="88%" />
        <Skeleton variant="text" sx={{ fontSize: "14px" }} width="45%" />
      </div>
    </div>
  );
}

export function MyVideoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={MY_VIDEO_GRID_CLASS} role="status" aria-label="Loading videos">
      {Array.from({ length: count }).map((_, i) => (
        <MyVideoCardSkeleton key={i} />
      ))}
    </div>
  );
}
