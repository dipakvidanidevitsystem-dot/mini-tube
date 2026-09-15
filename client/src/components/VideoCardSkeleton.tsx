import Skeleton from "@mui/material/Skeleton";

export default function VideoCardSkeleton() {
  return (
    <div>
      <Skeleton variant="rectangular" className="aspect-video w-full rounded-lg" />
      <div className="mt-2 flex gap-2">
        <Skeleton variant="circular" width={36} height={36} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <Skeleton variant="text" sx={{ fontSize: "1rem" }} width="95%" />
          <Skeleton variant="text" sx={{ fontSize: "1rem" }} width="60%" />
          <Skeleton variant="text" sx={{ fontSize: "0.875rem" }} width="40%" />
          <Skeleton variant="text" sx={{ fontSize: "0.875rem" }} width="55%" />
        </div>
      </div>
    </div>
  );
}

export function VideoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function MyVideoCardSkeleton() {
  return (
    <div>
      <Skeleton variant="rectangular" className="aspect-video w-full rounded-lg" />
      <div className="mt-2">
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} width="90%" />
        <Skeleton variant="text" sx={{ fontSize: "0.875rem" }} width="45%" />
      </div>
    </div>
  );
}

export function MyVideoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-lg [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
      {Array.from({ length: count }).map((_, i) => (
        <MyVideoCardSkeleton key={i} />
      ))}
    </div>
  );
}
