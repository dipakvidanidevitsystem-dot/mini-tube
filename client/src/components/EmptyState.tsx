import type { ReactNode } from "react";
import { VideoCamera, type Icon } from "@phosphor-icons/react";

export default function EmptyState({
  message,
  title,
  action,
  icon: IconComponent = VideoCamera,
}: {
  message: string;
  title?: string;
  action?: ReactNode;
  icon?: Icon;
}) {
  return (
    <div className="flex animate-fade-up justify-center px-4 py-16">
      <div className="flex max-w-sm flex-col items-center gap-sm text-center">
        <span className="mb-xs flex h-16 w-16 items-center justify-center rounded-xl bg-accent-soft text-accent ring-1 ring-inset ring-accent/20">
          <IconComponent size={28} weight="duotone" aria-hidden />
        </span>
        {title && <h2 className="text-tagline text-foreground">{title}</h2>}
        <p className="text-caption text-muted-foreground">{message}</p>
        {action && <div className="mt-xs">{action}</div>}
      </div>
    </div>
  );
}
