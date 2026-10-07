import Button from "./Button";
import { WarningCircle } from "@phosphor-icons/react";

export default function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex justify-center py-16">
      <div className="flex max-w-sm flex-col items-center gap-sm rounded-xl border border-border bg-card p-xl text-center dark:border-border-dark dark:bg-card-dark">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive dark:bg-destructive-dark/10 dark:text-destructive-dark">
          <WarningCircle size={22} weight="bold" />
        </span>
        <p className="text-caption text-muted-foreground dark:text-muted-foreground-dark">{message}</p>
        {onRetry && (
          <Button variant="outlined" size="small" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
