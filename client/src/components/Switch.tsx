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
      sx={{ alignItems: description ? "flex-start" : "center", gap: 0.5, mx: 0 }}
      control={<MuiSwitch {...props} sx={description ? { mt: -0.5 } : undefined} />}
      label={
        description ? (
          <div className="py-0.5">
            <p className="text-caption-strong text-foreground">{label}</p>
            <p className="mt-0.5 text-fine-print text-muted-foreground">{description}</p>
          </div>
        ) : (
          <span className="text-caption text-foreground">{label}</span>
        )
      }
    />
  );
}
