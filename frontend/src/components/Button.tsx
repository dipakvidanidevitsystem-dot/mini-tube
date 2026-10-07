import MuiButton from "@mui/material/Button";
import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import type { ElementType } from "react";

export interface ButtonProps extends MuiButtonProps {
  component?: ElementType;
  to?: string;
}

const CONTAINED_CLASSES =
  "!border-[1.5px] !border-solid !border-foreground !shadow-ink-sm transition-[transform,box-shadow] !duration-150 active:translate-x-[1px] active:translate-y-[1px] active:!shadow-none dark:!border-black dark:!shadow-ink-sm-dark";

export default function Button({ className, variant, disableElevation, ...props }: ButtonProps) {
  const isContained = variant === "contained";
  const merged = isContained ? [CONTAINED_CLASSES, className].filter(Boolean).join(" ") : className;
  return (
    <MuiButton
      variant={variant}
      className={merged}
      disableElevation={isContained || disableElevation}
      {...props}
    />
  );
}
