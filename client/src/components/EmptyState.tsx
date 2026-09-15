import type { ReactNode } from "react";
import { VideoCamera } from "@phosphor-icons/react";

export default function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex justify-center py-16">
      <div className="flex max-w-sm flex-col items-center gap-sm rounded-xl border border-border bg-card p-xl text-center dark:border-border-dark dark:bg-card-dark">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
          <VideoCamera size={22} weight="bold" />
        </span>
        <p className="text-caption text-muted-foreground dark:text-muted-foreground-dark">{message}</p>
        {action}
      </div>
    </div>
  );
}
