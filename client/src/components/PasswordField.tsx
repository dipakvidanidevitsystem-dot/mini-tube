import { useState } from "react";
import TextField, { type TextFieldProps } from "./TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { Eye, EyeSlash } from "@phosphor-icons/react";

export default function PasswordField(props: Omit<TextFieldProps, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      slotProps={{
        ...props.slotProps,
        input: {
          ...props.slotProps?.input,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                onClick={() => setVisible((v) => !v)}
                edge="end"
                size="small"
                className="!text-muted-foreground hover:!text-foreground"
              >
                {visible ? <EyeSlash size={20} /> : <Eye size={20} />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
