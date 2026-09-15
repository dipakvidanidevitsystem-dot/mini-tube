import { Eye, ThumbsUp, ChatCircle, ClockCounterClockwise, type Icon } from "@phosphor-icons/react";
import { formatDuration } from "../../lib/format";
import type { DashboardStats } from "../../types";

export interface KpiDef {
  key: keyof DashboardStats;
  label: string;
  icon: Icon;
  format?: (value: number) => string;
  noDataWhenZero?: boolean;
}

export const KPI_DEFS: KpiDef[] = [
  { key: "totalViews", label: "Views", icon: Eye },
  { key: "totalLikes", label: "Likes", icon: ThumbsUp },
  { key: "totalComments", label: "Comments", icon: ChatCircle },
  {
    key: "avgViewDurationSeconds",
    label: "Watch",
    icon: ClockCounterClockwise,
    format: formatDuration,
    noDataWhenZero: true,
  },
];
