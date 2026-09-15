import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { useLoginMutation } from "../store/api/authApi";
import { getRtkErrorMessage } from "../store/lib/getRtkErrorMessage";
import PasswordField from "../components/PasswordField";

export default function Login() {
  const [login, { isLoading: submitting }] = useLoginMutation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password }).unwrap();
      navigate("/");
    } catch (err) {
      setError(getRtkErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold">Log in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={submitting}
        />
        <PasswordField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={submitting}
        />
        {error && <p className="text-sm font-medium text-foreground dark:text-foreground-dark">{error}</p>}
        <Button type="submit" variant="contained" disabled={submitting}>
          Log in
        </Button>
      </form>
      <p className="mt-4 text-sm">
        No account? <Link to="/register">Register</Link>
      </p>
      <p className="mt-2 text-sm">
        <Link to="/forgot-password">Forgot password?</Link>
      </p>
    </div>
  );
}
