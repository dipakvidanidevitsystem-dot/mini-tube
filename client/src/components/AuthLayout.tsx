import type { ReactNode } from "react";
import { ChatsCircle, Lightning, PlayCircle, type Icon } from "@phosphor-icons/react";
import BrandMark from "./BrandMark";

const HIGHLIGHTS: { icon: Icon; title: string; body: string }[] = [
  { icon: PlayCircle, title: "Watch anything", body: "Stream creator videos in a distraction-free theater view." },
  { icon: Lightning, title: "Upload in minutes", body: "Drag, drop and publish. We handle the processing." },
  { icon: ChatsCircle, title: "Join the conversation", body: "Comment, reply and follow the channels you love." },
];

/** Split-screen auth shell: brand story on large screens, a focused form card everywhere. */
export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden overflow-hidden border-r border-border bg-card lg:flex lg:flex-col lg:justify-between lg:p-xxl">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(80%_60%_at_10%_0%,rgb(var(--c-accent)/0.28),transparent_60%),radial-gradient(70%_60%_at_100%_100%,rgb(var(--c-info)/0.22),transparent_60%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgb(var(--c-foreground)/0.2)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <div className="relative">
          <BrandMark />
        </div>
        <div className="relative max-w-md">
          <h2 className="text-display-lg text-foreground">
            Your stage for <span className="text-accent">every story.</span>
          </h2>
          <ul className="mt-xl flex flex-col gap-lg">
            {HIGHLIGHTS.map(({ icon: HighlightIcon, title: t, body }) => (
              <li key={t} className="flex gap-md">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent ring-1 ring-inset ring-accent/20">
                  <HighlightIcon size={20} weight="duotone" aria-hidden />
                </span>
                <div>
                  <p className="text-body-strong text-foreground">{t}</p>
                  <p className="text-caption text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-fine-print text-muted-foreground">© {new Date().getFullYear()} MiniTube</p>
      </aside>

      <div className="flex items-start justify-center px-md py-xl sm:items-center sm:py-xxl">
        <div className="w-full max-w-[420px] animate-fade-up">
          <div className="mb-lg">
            <h1 className="text-display-md text-foreground">{title}</h1>
            {subtitle && <p className="mt-xs text-caption text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="mt-lg border-t border-border pt-md text-center text-caption text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
