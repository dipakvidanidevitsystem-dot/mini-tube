import { useLocation } from "react-router-dom";

const TITLES: { prefix: string; label: string }[] = [
  { prefix: "/history", label: "History" },
  { prefix: "/watch-later", label: "Watch Later" },
  { prefix: "/settings", label: "Settings" },
  { prefix: "/admin", label: "Admin" },
  { prefix: "/upload", label: "Upload" },
  { prefix: "/edit", label: "Edit Video" },
  { prefix: "/channel", label: "Channel" },
];

const HIDDEN_PREFIXES = ["/watch/", "/login", "/register", "/forgot-password", "/reset-password"];

export default function SubNav() {
  const { pathname } = useLocation();

  if (HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))) {
    return null;
  }

  const label = TITLES.find((t) => pathname.startsWith(t.prefix))?.label;
  if (!label) return null;

  return (
    <div className="flex h-11 items-center border-b border-border bg-muted/80 px-3 backdrop-blur-md dark:border-border-dark dark:bg-card-dark/80 sm:px-4">
      <span className="text-lg font-semibold text-foreground dark:text-foreground-dark">{label}</span>
    </div>
  );
}
