import { useState, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import Button from "../components/Button";
import { useResetPasswordMutation } from "../store/api/authApi";
import { getRtkErrorMessage } from "../store/lib/getRtkErrorMessage";
import PasswordField from "../components/PasswordField";
import AuthLayout from "../components/AuthLayout";
import FormAlert from "../components/FormAlert";
import { notifySuccess } from "../lib/toast";
import { validateMatch, validatePassword } from "../lib/validation";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [resetPassword, { isLoading: submitting }] = useResetPasswordMutation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const nextPasswordError = validatePassword(password);
    const nextConfirmPasswordError = validateMatch(confirmPassword, password, "Passwords");
    setPasswordError(nextPasswordError || "");
    setConfirmPasswordError(nextConfirmPasswordError || "");
    if (nextPasswordError || nextConfirmPasswordError) {
      document.getElementById(nextPasswordError ? "reset-password" : "reset-confirm")?.focus();
      return;
    }

    setError("");
    try {
      await resetPassword({ token, password }).unwrap();
      notifySuccess("Password updated. Sign in with your new password.");
      navigate("/login");
    } catch (err) {
      setError(getRtkErrorMessage(err));
    }
  };

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Use at least 8 characters with an uppercase letter, a lowercase letter and a number."
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline">
          <ArrowLeft size={14} weight="bold" aria-hidden />
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-md">
        {error && <FormAlert>{error}</FormAlert>}
        <PasswordField
          id="reset-password"
          label="New password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => password && setPasswordError(validatePassword(password) || "")}
          error={!!passwordError}
          helperText={passwordError}
          disabled={submitting}
          required
          fullWidth
        />
        <PasswordField
          id="reset-confirm"
          label="Confirm password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => confirmPassword && setConfirmPasswordError(validateMatch(confirmPassword, password, "Passwords") || "")}
          error={!!confirmPasswordError}
          helperText={confirmPasswordError}
          disabled={submitting}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" size="large" loading={submitting} fullWidth>
          {submitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
