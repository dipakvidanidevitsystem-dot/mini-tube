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

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#E11D48",
            contrastText: "#FFFFFF",
          },
          secondary: {
            main: mode === "dark" ? "#1E1B4B" : "#EEF2FF",
            contrastText: mode === "dark" ? "#FFFFFF" : "#1E1B4B",
          },
          error: {
            main: mode === "dark" ? "#EF4444" : "#DC2626",
            contrastText: mode === "dark" ? "#000000" : "#FFFFFF",
          },
          background: {
            default: mode === "dark" ? "#000000" : "#FBF7F2",
            paper: mode === "dark" ? "#0C0C0D" : "#FFFFFF",
          },
          text: {
            primary: mode === "dark" ? "#F8FAFC" : "#0F0F23",
            secondary: mode === "dark" ? "#94A3B8" : "#6B6155",
          },
          divider: mode === "dark" ? "#312E81" : "#E2E8F0",
        },
        shape: { borderRadius: 10 },
        typography: {
          fontFamily: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"].join(","),
          h1: { fontSize: "56px", fontWeight: 600, lineHeight: 1.07, letterSpacing: "-0.28px" },
          h2: { fontSize: "40px", fontWeight: 600, lineHeight: 1.1, letterSpacing: "0" },
          h3: { fontSize: "34px", fontWeight: 600, lineHeight: 1.47, letterSpacing: "-0.374px" },
          h4: { fontSize: "28px", fontWeight: 400, lineHeight: 1.14, letterSpacing: "0.196px" },
          h5: { fontSize: "21px", fontWeight: 600, lineHeight: 1.19, letterSpacing: "0.231px" },
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
                borderRadius: 10,
                textTransform: "none",
                fontWeight: 500,
                "&:active": { transform: "scale(0.95)" },
                "&:focus-visible": {
                  outline: `2px solid ${mode === "dark" ? "#FFFFFF" : "#0F0F23"}`,
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
                borderRadius: 14,
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
                borderRadius: 10,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: "none",
              }),
            },
          },
          MuiMenuItem: {
            styleOverrides: { root: { fontSize: "14px" } },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
