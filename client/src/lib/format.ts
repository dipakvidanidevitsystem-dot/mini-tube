import dayjs from "dayjs";

export function formatDate(iso: string) {
  return dayjs(iso).format("MMM D, YYYY");
}

export function formatDuration(totalSeconds: number) {
  const seconds = Number.isFinite(totalSeconds) ? Math.max(0, Math.round(totalSeconds)) : 0;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

const compactNumber = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });

/** 1234 -> "1.2K", for dense meta rows (full value belongs in a title/aria-label). */
export function formatCompact(value: number) {
  return compactNumber.format(Number.isFinite(value) ? value : 0);
}

export function formatViews(views: number) {
  return `${formatCompact(views)} ${views === 1 ? "view" : "views"}`;
}
