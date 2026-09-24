import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { useAppSelector } from "../store/hooks";
import { colorTokens, cssVariables, fonts, motion, radius, tokenColor } from "./tokens";

const globalVars = {
  ":root": cssVariables("light"),
  ":root.dark": cssVariables("dark"),
};

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const mode = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  const theme = useMemo(() => {
    const c = colorTokens[mode];
    const focusRing = { outline: `2px solid ${c.ring}`, outlineOffset: 2 };
    const transition = `background-color ${motion.fast} ${motion.easeOut}, color ${motion.fast} ${motion.easeOut}, border-color ${motion.fast} ${motion.easeOut}, box-shadow ${motion.fast} ${motion.easeOut}, transform ${motion.fast} ${motion.easeOut}`;

    return createTheme({
      palette: {
        mode,
        primary: { main: c["accent-strong"], dark: c["accent-hover"], light: c.accent, contrastText: c["on-accent"] },
        secondary: { main: c.secondary, contrastText: c["on-secondary"] },
        error: { main: c.destructive, contrastText: c["on-destructive"] },
        warning: { main: c.warning },
        success: { main: c.success },
        info: { main: c.info },
        background: { default: c.background, paper: c.card },
        text: { primary: c.foreground, secondary: c["muted-foreground"] },
        divider: c.border,
        action: {
          hover: tokenColor(mode, "foreground", 0.06),
          selected: tokenColor(mode, "accent", 0.12),
          focus: tokenColor(mode, "ring", 0.18),
        },
      },
      shape: { borderRadius: radius.md },
      typography: {
        fontFamily: fonts.body,
        h1: { fontFamily: fonts.heading, fontSize: "48px", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.02em" },
        h2: { fontFamily: fonts.heading, fontSize: "36px", fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.02em" },
        h3: { fontFamily: fonts.heading, fontSize: "28px", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.015em" },
        h4: { fontFamily: fonts.heading, fontSize: "22px", fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.01em" },
        h5: { fontFamily: fonts.heading, fontSize: "18px", fontWeight: 600, lineHeight: 1.35, letterSpacing: "-0.01em" },
        h6: { fontSize: "16px", fontWeight: 600, lineHeight: 1.4 },
        body1: { fontSize: "16px", fontWeight: 400, lineHeight: 1.5 },
        body2: { fontSize: "14px", fontWeight: 400, lineHeight: 1.45 },
        button: { fontSize: "14px", fontWeight: 600, lineHeight: 1.2, textTransform: "none", letterSpacing: 0 },
        caption: { fontSize: "12px", fontWeight: 400, lineHeight: 1.35 },
      },
      transitions: {
        duration: { shortest: 120, shorter: 150, short: 180, standard: 200, complex: 280, enteringScreen: 200, leavingScreen: 140 },
        easing: { easeOut: motion.easeOut, easeIn: motion.easeIn },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: { body: { backgroundColor: c.background, color: c.foreground } },
        },
        MuiSkeleton: {
          defaultProps: { animation: "wave" },
          styleOverrides: { root: { backgroundColor: c.muted } },
        },
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: {
            root: {
              borderRadius: radius.md,
              textTransform: "none",
              fontWeight: 600,
              minHeight: 40,
              transition,
              "&:active": { transform: "scale(0.97)" },
              "&.Mui-focusVisible": focusRing,
              "&.Mui-disabled": { opacity: 0.5 },
            },
            containedPrimary: {
              "&:hover": { backgroundColor: c["accent-hover"], boxShadow: `0 8px 24px -10px ${tokenColor(mode, "accent", 0.6)}` },
            },
            outlined: {
              borderColor: c.border,
              color: c.foreground,
              "&:hover": { borderColor: tokenColor(mode, "foreground", 0.3), backgroundColor: tokenColor(mode, "foreground", 0.04) },
            },
            outlinedError: {
              borderColor: tokenColor(mode, "destructive", 0.5),
              color: c.destructive,
              "&:hover": { borderColor: c.destructive, backgroundColor: tokenColor(mode, "destructive", 0.08) },
            },
            text: {
              "&:hover": { backgroundColor: tokenColor(mode, "foreground", 0.06) },
            },
            textPrimary: { color: c.accent },
            sizeSmall: { minHeight: 32, padding: "6px 12px", fontSize: "13px" },
            sizeMedium: ({ theme }) => ({
              padding: "8px 16px",
              [theme.breakpoints.up("sm")]: { padding: "10px 18px", fontSize: "14px" },
            }),
            sizeLarge: { minHeight: 48, padding: "12px 22px", fontSize: "16px" },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              transition,
              "&:hover": { backgroundColor: tokenColor(mode, "foreground", 0.08) },
              "&:active": { transform: "scale(0.94)" },
              "&.Mui-focusVisible": focusRing,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: radius.lg,
              border: `1px solid ${c.border}`,
              backgroundColor: c.card,
              boxShadow: "none",
            },
          },
        },
        MuiCardContent: {
          styleOverrides: {
            root: ({ theme }) => ({
              padding: "16px",
              "&:last-child": { paddingBottom: "16px" },
              [theme.breakpoints.up("lg")]: {
                padding: "24px",
                "&:last-child": { paddingBottom: "24px" },
              },
            }),
          },
        },
        MuiPaper: {
          defaultProps: { elevation: 0 },
          styleOverrides: { root: { backgroundImage: "none" } },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: radius.xl,
              border: `1px solid ${c.border}`,
              backgroundColor: c.elevated,
              boxShadow: `0 24px 64px -16px ${tokenColor(mode, "scrim", 0.5)}`,
            },
          },
        },
        MuiBackdrop: {
          styleOverrides: {
            root: {
              "&:not(.MuiBackdrop-invisible)": {
                backgroundColor: tokenColor(mode, "scrim", mode === "dark" ? 0.7 : 0.45),
                backdropFilter: "blur(4px)",
              },
            },
          },
        },
        MuiDialogTitle: {
          styleOverrides: { root: { fontFamily: fonts.heading, fontWeight: 600, fontSize: "20px" } },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: radius.sm + 2,
              backgroundColor: tokenColor(mode, "muted", mode === "dark" ? 0.5 : 0.6),
              transition,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: c.border },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: tokenColor(mode, "foreground", 0.3) },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: c.ring, borderWidth: 2 },
              "&.Mui-error .MuiOutlinedInput-notchedOutline": { borderColor: c.destructive },
            },
          },
        },
        MuiInputLabel: {
          styleOverrides: { root: { "&.Mui-focused": { color: c.accent } } },
        },
        MuiFormHelperText: {
          styleOverrides: { root: { marginLeft: 2, fontSize: "12.5px" } },
        },
        MuiTextField: {
          defaultProps: { variant: "outlined" },
        },
        MuiChip: {
          styleOverrides: {
            root: { borderRadius: 9999, fontSize: "14px", fontWeight: 500, transition },
            outlined: { borderColor: c.border },
          },
        },
        MuiAvatar: {
          styleOverrides: { root: { borderRadius: 9999, backgroundColor: c.muted, color: c.foreground, fontWeight: 600 } },
        },
        MuiTooltip: {
          defaultProps: { arrow: false, enterDelay: 300 },
          styleOverrides: {
            tooltip: {
              backgroundColor: c.foreground,
              color: c.background,
              fontSize: "12px",
              fontWeight: 500,
              borderRadius: radius.sm,
              padding: "6px 10px",
            },
          },
        },
        MuiTabs: {
          styleOverrides: {
            root: { minHeight: 44 },
            indicator: { height: 3, borderRadius: 3, backgroundColor: c.accent },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              minHeight: 44,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "14px",
              color: c["muted-foreground"],
              "&.Mui-selected": { color: c.foreground },
              "&.Mui-focusVisible": focusRing,
            },
          },
        },
        MuiSwitch: {
          styleOverrides: {
            switchBase: {
              "&.Mui-checked": { color: c["on-accent"] },
              "&.Mui-checked + .MuiSwitch-track": { backgroundColor: c["accent-strong"], opacity: 1 },
              "&.Mui-focusVisible .MuiSwitch-thumb": { outline: `2px solid ${c.ring}`, outlineOffset: 2 },
            },
            track: { backgroundColor: tokenColor(mode, "muted-foreground", 0.5), opacity: 1 },
          },
        },
        MuiLinearProgress: {
          styleOverrides: {
            root: { borderRadius: 9999, height: 6, backgroundColor: c.muted },
            bar: { borderRadius: 9999 },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: { fontSize: "14px", borderColor: c.border },
            head: { fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: c["muted-foreground"] },
          },
        },
        MuiTableRow: {
          styleOverrides: { root: { "&.MuiTableRow-hover:hover": { backgroundColor: tokenColor(mode, "foreground", 0.03) } } },
        },
        MuiMenu: {
          styleOverrides: {
            paper: {
              borderRadius: radius.md,
              border: `1px solid ${c.border}`,
              backgroundColor: c.elevated,
              boxShadow: `0 16px 40px -12px ${tokenColor(mode, "scrim", 0.45)}`,
              marginTop: 6,
            },
            list: { padding: 6 },
          },
        },
        MuiPopover: {
          styleOverrides: {
            paper: {
              borderRadius: radius.lg,
              border: `1px solid ${c.border}`,
              backgroundColor: c.elevated,
              boxShadow: `0 16px 40px -12px ${tokenColor(mode, "scrim", 0.45)}`,
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              fontSize: "14px",
              borderRadius: radius.sm,
              minHeight: 40,
              gap: 10,
              "&:hover": { backgroundColor: tokenColor(mode, "foreground", 0.06) },
              "&.Mui-selected": { backgroundColor: tokenColor(mode, "accent", 0.12) },
            },
          },
        },
        MuiDivider: {
          styleOverrides: { root: { borderColor: c.border } },
        },
        MuiDrawer: {
          styleOverrides: { paper: { backgroundColor: c.card, borderColor: c.border } },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={globalVars} />
      {children}
    </ThemeProvider>
  );
}
