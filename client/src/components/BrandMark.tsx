import { Link } from "react-router-dom";
import { Play } from "@phosphor-icons/react";

export default function BrandMark({ compact = false, onClick }: { compact?: boolean; onClick?: () => void }) {
  return (
    <Link to="/" onClick={onClick} aria-label="MiniTube home" className="group flex shrink-0 items-center gap-2 rounded-md">
      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-accent-strong text-on-accent shadow-glow-accent transition-transform duration-fast group-hover:scale-105">
        <Play size={16} weight="fill" aria-hidden />
      </span>
      {!compact && (
        <span className="font-heading text-[19px] font-bold tracking-tight text-foreground">
          Mini<span className="text-accent">Tube</span>
        </span>
      )}
    </Link>
  );
}
