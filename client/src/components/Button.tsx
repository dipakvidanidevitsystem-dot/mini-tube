import MuiButton from "@mui/material/Button";
import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import type { ElementType } from "react";

export interface ButtonProps extends MuiButtonProps {
  component?: ElementType;
  to?: string;
}

export default function Button({ ...props }: ButtonProps) {
  return <MuiButton {...props} />;
}
