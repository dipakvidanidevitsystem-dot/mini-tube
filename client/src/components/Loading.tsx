import CircularProgress from "@mui/material/CircularProgress";

export default function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex animate-fade-in justify-center py-16 text-accent">
      <CircularProgress size={32} thickness={4} color="inherit" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
