import Button from "./Button";
import { ArrowClockwise, WarningCircle } from "@phosphor-icons/react";

export default function ErrorState({
  message,
  title = "Something went wrong",
  onRetry,
}: {
  message: string;
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="flex animate-fade-up justify-center px-4 py-16">
      <div className="flex max-w-sm flex-col items-center gap-sm text-center">
        <span className="mb-xs flex h-16 w-16 items-center justify-center rounded-xl bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20">
          <WarningCircle size={28} weight="duotone" aria-hidden />
        </span>
        <h2 className="text-tagline text-foreground">{title}</h2>
        <p className="text-caption text-muted-foreground">{message}</p>
        {onRetry && (
          <Button variant="outlined" size="small" onClick={onRetry} startIcon={<ArrowClockwise size={16} />} className="!mt-xs">
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
