import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";

/** Consistent page top: optional icon tile, h1 title, supporting text and right-aligned actions. */
export default function PageHeader({
  title,
  description,
  actions,
  icon: IconComponent,
  className = "",
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: Icon;
  className?: string;
}) {
  return (
    <header className={`mb-lg flex flex-col gap-md sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="flex min-w-0 items-start gap-sm">
        {IconComponent && (
          <span className="mt-0.5 hidden h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent xs:flex">
            <IconComponent size={22} weight="duotone" aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-display-md text-foreground">{title}</h1>
          {description && <p className="mt-1 text-caption text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-xs">{actions}</div>}
    </header>
  );
}
