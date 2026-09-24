import { useId, type ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";

/** Bordered surface with a consistent header row (title, optional description/icon, right-side actions). */
export default function Panel({
  title,
  description,
  icon: IconComponent,
  actions,
  children,
  id,
  className = "",
  bodyClassName = "",
  tone = "default",
}: {
  title?: ReactNode;
  description?: ReactNode;
  icon?: Icon;
  actions?: ReactNode;
  children: ReactNode;
  id?: string;
  className?: string;
  bodyClassName?: string;
  tone?: "default" | "danger";
}) {
  const headingId = useId();

  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={`rounded-lg border bg-card ${tone === "danger" ? "border-destructive/40" : "border-border"} ${className}`}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-x-md gap-y-xs px-md pt-md lg:px-lg lg:pt-lg">
          <div className="flex min-w-0 items-center gap-sm">
            {IconComponent && (
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                  tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-accent-soft text-accent"
                }`}
              >
                <IconComponent size={18} weight="duotone" aria-hidden />
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h2 id={headingId} className="text-body-strong text-foreground">
                  {title}
                </h2>
              )}
              {description && <p className="mt-0.5 text-fine-print text-muted-foreground">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-xs">{actions}</div>}
        </header>
      )}
      <div className={`p-md lg:p-lg ${title || actions ? "pt-sm lg:pt-md" : ""} ${bodyClassName}`}>{children}</div>
    </section>
  );
}
