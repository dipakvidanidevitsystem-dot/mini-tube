import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { useLoginMutation } from "../store/api/authApi";
import { getRtkErrorMessage } from "../store/lib/getRtkErrorMessage";
import PasswordField from "../components/PasswordField";
import AuthLayout from "../components/AuthLayout";
import FormAlert from "../components/FormAlert";
import { validateEmail, validateRequired } from "../lib/validation";

export default function Login() {
  const [login, { isLoading: submitting }] = useLoginMutation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validateRequired(password, "Password");
    setEmailError(nextEmailError || "");
    setPasswordError(nextPasswordError || "");
    if (nextEmailError || nextPasswordError) {
      document.getElementById(nextEmailError ? "login-email" : "login-password")?.focus();
      return;
    }

    try {
      await login({ email, password }).unwrap();
      navigate("/");
    } catch (err) {
      setError(getRtkErrorMessage(err));
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={
        <>
          New to MiniTube?{" "}
          <Link to="/register" className="font-semibold text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-md">
        {error && <FormAlert>{error}</FormAlert>}
        <TextField
          id="login-email"
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
            id="login-password"
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => password && setPasswordError(validateRequired(password, "Password") || "")}
            error={!!passwordError}
            helperText={passwordError}
            disabled={submitting}
            required
            fullWidth
          />
          <div className="mt-xs text-right">
            <Link to="/forgot-password" className="text-caption-strong text-accent hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" variant="contained" size="large" loading={submitting} fullWidth>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
