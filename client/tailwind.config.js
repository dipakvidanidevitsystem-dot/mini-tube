/** @type {import('tailwindcss').Config} */

// Studio Night: every color resolves to a CSS variable emitted by ThemeModeProvider from
// src/theme/tokens.ts, so one class (e.g. `bg-card`) is correct in both light and dark mode.
const tokenNames = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "elevated",
  "muted",
  "muted-foreground",
  "border",
  "accent",
  "accent-strong",
  "accent-hover",
  "on-accent",
  "accent-soft",
  "primary",
  "on-primary",
  "secondary",
  "on-secondary",
  "info",
  "success",
  "warning",
  "destructive",
  "on-destructive",
  "ring",
  "scrim",
  "on-scrim",
];

const colors = Object.fromEntries(tokenNames.map((name) => [name, `rgb(var(--c-${name}) / <alpha-value>)`]));

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "480px",
        desktop: "1200px",
        wide: "1600px",
      },
      colors,
      borderRadius: {
        none: "0px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        full: "9999px",
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "80px",
      },
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "-apple-system", "'Segoe UI'", "sans-serif"],
        heading: ["'Space Grotesk'", "'DM Sans'", "system-ui", "sans-serif"],
      },
      fontSize: {
        "hero-display": ["48px", { lineHeight: "1.08", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg": ["36px", { lineHeight: "1.12", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-md": ["28px", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "600" }],
        lead: ["22px", { lineHeight: "1.35", letterSpacing: "-0.01em", fontWeight: "500" }],
        "lead-airy": ["20px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        tagline: ["18px", { lineHeight: "1.35", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-strong": ["16px", { lineHeight: "1.4", letterSpacing: "-0.005em", fontWeight: "600" }],
        body: ["16px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        "dense-link": ["16px", { lineHeight: "2", letterSpacing: "0", fontWeight: "400" }],
        caption: ["14px", { lineHeight: "1.45", letterSpacing: "0", fontWeight: "400" }],
        "caption-strong": ["14px", { lineHeight: "1.35", letterSpacing: "0", fontWeight: "600" }],
        "button-large": ["16px", { lineHeight: "1", letterSpacing: "0", fontWeight: "600" }],
        "button-utility": ["14px", { lineHeight: "1.2", letterSpacing: "0", fontWeight: "500" }],
        "fine-print": ["12px", { lineHeight: "1.35", letterSpacing: "0.005em", fontWeight: "400" }],
        "micro-legal": ["11px", { lineHeight: "1.3", letterSpacing: "0.01em", fontWeight: "400" }],
        "nav-link": ["12px", { lineHeight: "1", letterSpacing: "0.01em", fontWeight: "500" }],
      },
      boxShadow: {
        float: "0 12px 32px -12px rgb(0 0 0 / 0.35), 0 2px 6px -2px rgb(0 0 0 / 0.2)",
        "float-sm": "0 4px 14px -6px rgb(0 0 0 / 0.3)",
        "glow-accent": "0 0 0 1px rgb(var(--c-accent) / 0.35), 0 8px 24px -8px rgb(var(--c-accent) / 0.55)",
        "glow-ring": "0 0 0 3px rgb(var(--c-ring) / 0.35)",
      },
      transitionDuration: {
        fast: "150ms",
        enter: "200ms",
        exit: "140ms",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
        in: "cubic-bezier(0.4, 0, 1, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "progress-indeterminate": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(300%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 200ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 200ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".text-glow": { textShadow: "0 0 12px currentColor" },
        ".tabular": { fontVariantNumeric: "tabular-nums" },
        ".scrollbar-none": { scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } },
        ".pb-safe": { paddingBottom: "env(safe-area-inset-bottom)" },
      });
    },
  ],
};
