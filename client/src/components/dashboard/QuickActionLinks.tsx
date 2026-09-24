import { Link } from "react-router-dom";
import { UploadSimple, ChartLineUp, FilmSlate } from "@phosphor-icons/react";

const LINK_CLASS =
  "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-card px-3.5 text-caption-strong text-foreground transition-colors duration-fast hover:border-accent/50 hover:text-accent";

export default function QuickActionLinks() {
  const scrollToAnalytics = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("views-analytics")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="flex flex-wrap items-center gap-xs">
      <Link to="/upload" className={`${LINK_CLASS} !border-transparent !bg-accent-strong !text-on-accent hover:!bg-accent-hover`}>
        <UploadSimple size={16} weight="bold" aria-hidden />
        Upload video
      </Link>
      <button type="button" onClick={scrollToAnalytics} className={LINK_CLASS}>
        <ChartLineUp size={16} aria-hidden />
        View analytics
      </button>
      <Link to="/my-videos" className={LINK_CLASS}>
        <FilmSlate size={16} aria-hidden />
        Manage videos
      </Link>
    </div>
  );
}
