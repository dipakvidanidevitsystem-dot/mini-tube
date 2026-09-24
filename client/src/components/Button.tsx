import MuiButton from "@mui/material/Button";
import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import type { ElementType } from "react";

export interface ButtonProps extends MuiButtonProps {
  component?: ElementType;
  to?: string;
  /** Shows a spinner in place of the start icon and disables the button while an async action runs. */
  loading?: boolean;
}

export default function Button({ loading, disabled, startIcon, children, ...props }: ButtonProps) {
  return (
    <MuiButton
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
    >
      {children}
    </MuiButton>
  );
}
