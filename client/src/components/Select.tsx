import type { ReactNode } from "react";
import MenuItem from "@mui/material/MenuItem";
import TextField, { type TextFieldProps } from "./TextField";

export interface SelectOption {
  value: string;
  label: ReactNode;
}

export interface SelectProps extends Omit<TextFieldProps, "select"> {
  options?: SelectOption[];
  /** Compact pill style for label-less toolbar dropdowns (e.g. a sort control next to filter chips). */
  dense?: boolean;
}

const DENSE_SX = {
  "& .MuiOutlinedInput-root": { borderRadius: 9999 },
  "& .MuiSelect-select": {
    paddingTop: "5px !important",
    paddingBottom: "5px !important",
    paddingLeft: "14px",
    fontSize: "14px",
  },
};

export default function Select({ options, children, dense, sx, ...props }: SelectProps) {
  return (
    <TextField select {...props} sx={dense ? [DENSE_SX, ...(Array.isArray(sx) ? sx : [sx])] : sx}>
      {options
        ? options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))
        : children}
    </TextField>
  );
}
