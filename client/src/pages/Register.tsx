import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Circle } from "@phosphor-icons/react";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { useRegisterMutation } from "../store/api/authApi";
import { getRtkErrorMessage } from "../store/lib/getRtkErrorMessage";
import PasswordField from "../components/PasswordField";
import AuthLayout from "../components/AuthLayout";
import FormAlert from "../components/FormAlert";
import { NAME_MAX, validateEmail, validateMaxLength, validatePassword, validateRequired } from "../lib/validation";

const PASSWORD_RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: "8+ characters", test: (v) => v.length >= 8 },
  { label: "Uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "Lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "Number", test: (v) => /\d/.test(v) },
];

export default function Register() {
  const [register, { isLoading: submitting }] = useRegisterMutation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateName = (value: string) => validateRequired(value, "Name") || validateMaxLength(value, NAME_MAX, "Name");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const nextNameError = validateName(name);
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    setNameError(nextNameError || "");
    setEmailError(nextEmailError || "");
    setPasswordError(nextPasswordError || "");
    if (nextNameError || nextEmailError || nextPasswordError) {
      const firstInvalid = nextNameError ? "register-name" : nextEmailError ? "register-email" : "register-password";
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    try {
      await register({ name, email, password }).unwrap();
      navigate("/");
    } catch (err) {
      setError(getRtkErrorMessage(err));
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start watching, uploading and building your channel."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-md">
        {error && <FormAlert>{error}</FormAlert>}
        <TextField
          id="register-name"
          label="Name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name && setNameError(validateName(name) || "")}
          error={!!nameError}
          helperText={nameError}
          disabled={submitting}
          required
          fullWidth
        />
        <TextField
          id="register-email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => email && setEmailError(validateEmail(email) || "")}
          error={!!emailError}
          helperText={emailError}
          disabled={submitting}
          required
          fullWidth
        />
        <div>
          <PasswordField
            id="register-password"
            label="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(validatePassword(e.target.value) || "");
            }}
            onBlur={() => password && setPasswordError(validatePassword(password) || "")}
            error={!!passwordError}
            helperText={passwordError}
            disabled={submitting}
            required
            fullWidth
            slotProps={{ htmlInput: { "aria-describedby": "password-rules" } }}
          />
          <ul id="password-rules" aria-label="Password requirements" className="mt-xs grid grid-cols-2 gap-x-sm gap-y-1">
            {PASSWORD_RULES.map((rule) => {
              const met = rule.test(password);
              return (
                <li
                  key={rule.label}
                  className={`flex items-center gap-1.5 text-fine-print transition-colors duration-fast ${
                    met ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  {met ? <CheckCircle size={14} weight="fill" aria-hidden /> : <Circle size={14} aria-hidden />}
                  {rule.label}
                  <span className="sr-only">{met ? "(met)" : "(not met)"}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <Button type="submit" variant="contained" size="large" loading={submitting} fullWidth>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
