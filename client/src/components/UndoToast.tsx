import { useEffect, useState } from "react";
import { ArrowCounterClockwise } from "@phosphor-icons/react";
import type { Toast } from "react-hot-toast";

export default function UndoToast({
  toast,
  message,
  seconds,
  onUndo,
  onExpire,
}: {
  toast: Toast;
  message: string;
  seconds: number;
  onUndo: () => void;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire();
      return;
    }
    const timer = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative flex min-w-[280px] items-center gap-3 overflow-hidden rounded-md bg-foreground py-2.5 pl-4 pr-2 text-caption text-background shadow-float transition-opacity duration-fast"
      style={{ opacity: toast.visible ? 1 : 0 }}
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onUndo}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-sm px-3 text-caption-strong text-background transition-colors duration-fast hover:bg-background/15"
      >
        <ArrowCounterClockwise size={16} aria-hidden />
        Undo <span className="tabular opacity-70">{remaining}s</span>
      </button>
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-0.5 bg-accent transition-[width] duration-1000 ease-linear"
        style={{ width: `${(remaining / seconds) * 100}%` }}
      />
    </div>
  );
}
