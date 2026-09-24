/**
 * Studio Night design tokens — the single source of truth for every color in the client.
 * ThemeModeProvider emits these as CSS variables (RGB channels) consumed by Tailwind
 * (`bg-background`, `text-accent`, ...) and builds the MUI palette from the same values.
 * No other file in src/ should contain a raw hex color.
 */

export type ThemeMode = "light" | "dark";

export const colorTokens = {
  dark: {
    background: "#0B0D12",
    foreground: "#F4F6FA",
    card: "#12151C",
    "card-foreground": "#F4F6FA",
    elevated: "#1A1E27",
    muted: "#1F2430",
    "muted-foreground": "#9AA3B2",
    border: "#262B38",
    accent: "#F0529C",
    "accent-strong": "#BE185D",
    "accent-hover": "#9D174D",
    "on-accent": "#FFFFFF",
    "accent-soft": "#2A1623",
    primary: "#F4F6FA",
    "on-primary": "#0B0D12",
    secondary: "#2A1623",
    "on-secondary": "#F9A8D4",
    info: "#60A5FA",
    success: "#34D399",
    warning: "#FBBF24",
    destructive: "#F87171",
    "on-destructive": "#0B0D12",
    ring: "#F472B6",
    scrim: "#000000",
    "on-scrim": "#FFFFFF",
  },
  light: {
    background: "#F7F8FA",
    foreground: "#0E1116",
    card: "#FFFFFF",
    "card-foreground": "#0E1116",
    elevated: "#FFFFFF",
    muted: "#EEF0F4",
    "muted-foreground": "#525B6B",
    border: "#E1E4EA",
    accent: "#BE185D",
    "accent-strong": "#BE185D",
    "accent-hover": "#9D174D",
    "on-accent": "#FFFFFF",
    "accent-soft": "#FCE7F3",
    primary: "#0E1116",
    "on-primary": "#FFFFFF",
    secondary: "#FCE7F3",
    "on-secondary": "#9D174D",
    info: "#1D4ED8",
    success: "#047857",
    warning: "#B45309",
    destructive: "#DC2626",
    "on-destructive": "#FFFFFF",
    ring: "#BE185D",
    scrim: "#000000",
    "on-scrim": "#FFFFFF",
  },
} as const;

export type ColorToken = keyof (typeof colorTokens)["dark"];

export const colorTokenNames = Object.keys(colorTokens.dark) as ColorToken[];

export const fonts = {
  heading: ["'Space Grotesk'", "'DM Sans'", "system-ui", "sans-serif"].join(", "),
  body: ["'DM Sans'", "system-ui", "-apple-system", "'Segoe UI'", "sans-serif"].join(", "),
} as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24 } as const;

export const motion = {
  fast: "150ms",
  enter: "200ms",
  exit: "140ms",
  easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
} as const;

/** "#RRGGBB" -> "R G B" so Tailwind can apply `/<alpha>` modifiers via rgb(var(--c-x) / a). */
export function hexToChannels(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export function cssVariables(mode: ThemeMode): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const name of colorTokenNames) {
    vars[`--c-${name}`] = hexToChannels(colorTokens[mode][name]);
  }
  return vars;
}

/** Recharts and other libraries that take a plain color string rather than a class. */
export function tokenColor(mode: ThemeMode, name: ColorToken, alpha = 1): string {
  return alpha === 1 ? colorTokens[mode][name] : `rgb(${hexToChannels(colorTokens[mode][name])} / ${alpha})`;
}
