import { Link } from "react-router-dom";
import { VideoCamera, ChartBar, FilmSlate } from "@phosphor-icons/react";

const LINK_CLASS =
  "inline-flex items-center gap-1.5 whitespace-nowrap text-caption-strong text-foreground transition-colors hover:text-accent dark:text-foreground-dark dark:hover:text-accent";

export default function QuickActionLinks() {
  const scrollToAnalytics = () => {
    document.getElementById("views-analytics")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <Link to="/upload" className={LINK_CLASS}>
        <VideoCamera size={18} />
        Upload video
      </Link>
      <button type="button" onClick={scrollToAnalytics} className={LINK_CLASS}>
        <ChartBar size={18} />
        View analytics
      </button>
      <Link to="/my-videos" className={LINK_CLASS}>
        <FilmSlate size={18} />
        Manage videos
      </Link>
    </div>
  );
}
