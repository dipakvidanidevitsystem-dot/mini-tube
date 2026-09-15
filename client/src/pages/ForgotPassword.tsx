import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { useForgotPasswordMutation } from "../store/api/authApi";
import { getRtkErrorMessage } from "../store/lib/getRtkErrorMessage";

export default function ForgotPassword() {
  const [forgotPassword, { isLoading: submitting }] = useForgotPasswordMutation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await forgotPassword({ email }).unwrap();
      setMessage(result.message);
    } catch (err) {
      setError(getRtkErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold">Forgot password</h1>

      {message ? (
        <p className="text-sm text-foreground dark:text-foreground-dark">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={submitting}
          />
          {error && <p className="text-sm font-medium text-foreground dark:text-foreground-dark">{error}</p>}
          <Button type="submit" variant="contained" disabled={submitting}>
            Send reset link
          </Button>
        </form>
      )}

      <p className="mt-4 text-sm">
        <Link to="/login">Back to log in</Link>
      </p>
    </div>
  );
}
