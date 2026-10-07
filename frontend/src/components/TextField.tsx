import MuiTextField, { type TextFieldProps } from "@mui/material/TextField";

export type { TextFieldProps };

export default function TextField(props: TextFieldProps) {
  return <MuiTextField {...props} />;
}
