import { useEffect, useState } from "react";
import Button from "./Button";
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
      className="flex items-center gap-3 rounded-lg border border-border-dark bg-foreground px-4 py-3 text-sm text-foreground-dark"
      style={{ opacity: toast.visible ? 1 : 0 }}
    >
      <span>{message}</span>
      <Button
        size="small"
        onClick={onUndo}
        sx={{ color: "#fff", fontWeight: 600, minWidth: "auto" }}
      >
        Undo ({remaining}s)
      </Button>
    </div>
  );
}
