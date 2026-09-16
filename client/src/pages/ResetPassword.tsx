import { useState, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Button from "../components/Button";
import { useResetPasswordMutation } from "../store/api/authApi";
import { getRtkErrorMessage } from "../store/lib/getRtkErrorMessage";
import PasswordField from "../components/PasswordField";
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
    if (nextPasswordError || nextConfirmPasswordError) return;

    setError("");
    try {
      await resetPassword({ token, password }).unwrap();
      navigate("/login");
    } catch (err) {
      setError(getRtkErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold">Reset password</h1>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <PasswordField
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordError(validatePassword(password) || "")}
          error={!!passwordError}
          helperText={passwordError}
          disabled={submitting}
        />
        <PasswordField
          label="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => setConfirmPasswordError(validateMatch(confirmPassword, password, "Passwords") || "")}
          error={!!confirmPasswordError}
          helperText={confirmPasswordError}
          disabled={submitting}
        />
        {error && <p className="text-sm font-medium text-foreground dark:text-foreground-dark">{error}</p>}
        <Button type="submit" variant="contained" disabled={submitting}>
          Reset password
        </Button>
      </form>
      <p className="mt-4 text-sm">
        <Link to="/login">Back to log in</Link>
      </p>
    </div>
  );
}
