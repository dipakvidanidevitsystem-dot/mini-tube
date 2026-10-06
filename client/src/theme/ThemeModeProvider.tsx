import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useAppSelector } from "../store/hooks";

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const mode = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  const theme = useMemo(() => {
    const isDark = mode === "dark";
    const displayFont = ["Newsreader", "Georgia", "serif"].join(",");
    return createTheme({
        palette: {
          mode,
          primary: {
            main: isDark ? "#D9B98A" : "#8A5A2B",
            contrastText: isDark ? "#1A1A1A" : "#FFFFFF",
          },
          secondary: {
            main: isDark ? "#332E26" : "#EFE8DA",
            contrastText: isDark ? "#F2EDE3" : "#2E2A24",
          },
          error: {
            main: isDark ? "#F97066" : "#B42318",
            contrastText: isDark ? "#1A1A1A" : "#FFFFFF",
          },
          background: {
            default: isDark ? "#17150F" : "#FAFAF8",
            paper: isDark ? "#211E18" : "#FFFEFA",
          },
          text: {
            primary: isDark ? "#F2EDE3" : "#1A1A1A",
            secondary: isDark ? "#B8AF9F" : "#4A4A4A",
          },
          divider: isDark ? "#3E382E" : "#D6CEBE",
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: ["Cabin", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"].join(","),
          h1: { fontFamily: displayFont, fontSize: "56px", fontWeight: 600, lineHeight: 1.07, letterSpacing: "-0.28px" },
          h2: { fontFamily: displayFont, fontSize: "40px", fontWeight: 600, lineHeight: 1.1, letterSpacing: "0" },
          h3: { fontFamily: displayFont, fontSize: "34px", fontWeight: 600, lineHeight: 1.47, letterSpacing: "-0.374px" },
          h4: { fontFamily: displayFont, fontSize: "28px", fontWeight: 400, lineHeight: 1.14, letterSpacing: "0.196px" },
          h5: { fontFamily: displayFont, fontSize: "21px", fontWeight: 600, lineHeight: 1.19, letterSpacing: "0.231px" },
          h6: { fontSize: "17px", fontWeight: 600, lineHeight: 1.24, letterSpacing: "-0.374px" },
          body1: { fontSize: "17px", fontWeight: 400, lineHeight: 1.47, letterSpacing: "-0.374px" },
          body2: { fontSize: "14px", fontWeight: 400, lineHeight: 1.43, letterSpacing: "-0.224px" },
          button: {
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: 1.29,
            letterSpacing: "-0.224px",
            textTransform: "none",
          },
          caption: { fontSize: "12px", fontWeight: 400, lineHeight: 1.0, letterSpacing: "-0.12px" },
        },
        components: {
          MuiSkeleton: {
            defaultProps: {
              animation: "wave",
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                textTransform: "none",
                fontWeight: 500,
                "&:active": { transform: "scale(0.95)" },
                "&:focus-visible": {
                  outline: `2px solid ${isDark ? "#F2EDE3" : "#1A1A1A"}`,
                  outlineOffset: 2,
                },
              },
              sizeSmall: ({ theme }) => ({
                padding: "6px 12px",
                fontSize: "13px",
                [theme.breakpoints.up("sm")]: {
                  padding: "7px 14px",
                  fontSize: "14px",
                },
              }),
              sizeMedium: ({ theme }) => ({
                padding: "8px 16px",
                fontSize: "14px",
                [theme.breakpoints.up("sm")]: {
                  padding: "11px 22px",
                  fontSize: "18px",
                },
              }),
              sizeLarge: ({ theme }) => ({
                padding: "10px 20px",
                fontSize: "15px",
                [theme.breakpoints.up("sm")]: {
                  padding: "13px 26px",
                  fontSize: "19px",
                },
              }),
            },
          },
          MuiCard: {
            styleOverrides: {
              root: ({ theme }) => ({
                borderRadius: 18,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: "none",
              }),
            },
          },
          MuiCardContent: {
            styleOverrides: {
              root: ({ theme }) => ({
                padding: "12px",
                "&:last-child": { paddingBottom: "12px" },
                [theme.breakpoints.up("sm")]: {
                  padding: "17px",
                  "&:last-child": { paddingBottom: "17px" },
                },
                [theme.breakpoints.up("lg")]: {
                  padding: "24px",
                  "&:last-child": { paddingBottom: "24px" },
                },
              }),
            },
          },
          MuiPaper: {
            styleOverrides: { root: { backgroundImage: "none" } },
            defaultProps: { elevation: 0 },
          },
          MuiOutlinedInput: {
            styleOverrides: { root: { borderRadius: 8 } },
          },
          MuiTextField: {
            defaultProps: { variant: "outlined" },
          },
          MuiChip: {
            styleOverrides: { root: { borderRadius: 9999, fontSize: "14px", fontWeight: 400 } },
          },
          MuiAvatar: {
            styleOverrides: { root: { borderRadius: 9999 } },
          },
          MuiTableCell: {
            styleOverrides: {
              head: { fontSize: "14px", fontWeight: 600, letterSpacing: "-0.224px" },
              root: { fontSize: "14px", letterSpacing: "-0.224px" },
            },
          },
          MuiMenu: {
            styleOverrides: {
              paper: ({ theme }) => ({
                borderRadius: 12,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: "none",
              }),
            },
          },
          MuiMenuItem: {
            styleOverrides: { root: { fontSize: "14px" } },
          },
        },
      });
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
