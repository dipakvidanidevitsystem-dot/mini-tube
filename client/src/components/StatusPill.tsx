import type { ReactNode } from "react";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral" | "accent";

const TONES: Record<StatusTone, string> = {
  success: "bg-success/10 text-success ring-success/25",
  warning: "bg-warning/10 text-warning ring-warning/25",
  danger: "bg-destructive/10 text-destructive ring-destructive/25",
  info: "bg-info/10 text-info ring-info/25",
  accent: "bg-accent-soft text-accent ring-accent/25",
  neutral: "bg-muted text-muted-foreground ring-border",
};

/** Compact status label. Always pairs color with text (and an optional dot) so meaning is never color-only. */
export default function StatusPill({
  tone = "neutral",
  children,
  dot = true,
  className = "",
}: {
  tone?: StatusTone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-fine-print font-semibold ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      {dot && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
