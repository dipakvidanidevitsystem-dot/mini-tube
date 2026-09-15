import type { ReactNode } from "react";
import MuiSwitch, { type SwitchProps as MuiSwitchProps } from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

export interface SwitchFieldProps extends MuiSwitchProps {
  label: ReactNode;
  description?: ReactNode;
  labelPlacement?: "start" | "end" | "top" | "bottom";
  className?: string;
}

export default function Switch({ label, description, labelPlacement = "end", className, ...props }: SwitchFieldProps) {
  return (
    <FormControlLabel
      className={className}
      labelPlacement={labelPlacement}
      control={<MuiSwitch {...props} />}
      label={
        description ? (
          <div>
            <p className="text-caption-strong text-foreground dark:text-foreground-dark">{label}</p>
            <p className="text-fine-print text-muted-foreground dark:text-muted-foreground-dark">{description}</p>
          </div>
        ) : (
          label
        )
      }
    />
  );
}
