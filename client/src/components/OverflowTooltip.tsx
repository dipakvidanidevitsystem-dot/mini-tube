import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Tooltip from "@mui/material/Tooltip";

type OverflowTooltipComponent = "span" | "h3" | "p";

interface OverflowTooltipProps {
  children: ReactNode;
  title?: ReactNode;
  className?: string;
  component?: OverflowTooltipComponent;
  /** Number of lines before truncating. 1 (default) = single-line ellipsis, >1 = multi-line clamp. */
  lines?: number;
}

function clampStyle(lines: number): CSSProperties {
  if (lines <= 1) {
    return { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
  }
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };
}

export default function OverflowTooltip({
  children,
  title,
  className,
  component = "span",
  lines = 1,
}: OverflowTooltipProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      setIsOverflowing(el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight);
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children, lines]);

  const Component = component as "span";

  return (
    <Tooltip title={title ?? children} disableHoverListener={!isOverflowing} arrow>
      <Component ref={ref as React.Ref<HTMLSpanElement>} className={className} style={clampStyle(lines)}>
        {children}
      </Component>
    </Tooltip>
  );
}
