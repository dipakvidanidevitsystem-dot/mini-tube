import { useEffect, useRef, type ReactNode } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";

/**
 * Form-level message (server error or success). Errors are announced via role="alert" and receive
 * focus so keyboard and screen-reader users land on the summary after a failed submit.
 */
export default function FormAlert({
  tone = "error",
  children,
  focusOnMount = tone === "error",
}: {
  tone?: "error" | "success";
  children: ReactNode;
  focusOnMount?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusOnMount) ref.current?.focus();
  }, [focusOnMount, children]);

  const Icon = tone === "error" ? WarningCircle : CheckCircle;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role={tone === "error" ? "alert" : "status"}
      className={`flex animate-fade-in items-start gap-xs rounded-md border px-sm py-2.5 text-caption outline-none ${
        tone === "error"
          ? "border-destructive/35 bg-destructive/10 text-foreground"
          : "border-success/35 bg-success/10 text-foreground"
      }`}
    >
      <Icon size={18} weight="fill" className={`mt-px shrink-0 ${tone === "error" ? "text-destructive" : "text-success"}`} aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
