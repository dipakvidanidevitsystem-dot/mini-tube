import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, EnvelopeSimple } from "@phosphor-icons/react";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { useForgotPasswordMutation } from "../store/api/authApi";
import { getRtkErrorMessage } from "../store/lib/getRtkErrorMessage";
import AuthLayout from "../components/AuthLayout";
import FormAlert from "../components/FormAlert";
import { validateEmail } from "../lib/validation";

export default function ForgotPassword() {
  const [forgotPassword, { isLoading: submitting }] = useForgotPasswordMutation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const nextEmailError = validateEmail(email);
    setEmailError(nextEmailError || "");
    if (nextEmailError) {
      document.getElementById("forgot-email")?.focus();
      return;
    }

    try {
      const result = await forgotPassword({ email }).unwrap();
      setMessage(result.message);
    } catch (err) {
      setError(getRtkErrorMessage(err));
    }
  };

  const backLink = (
    <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline">
      <ArrowLeft size={14} weight="bold" aria-hidden />
      Back to sign in
    </Link>
  );

  return (
    <AuthLayout
      title={message ? "Check your inbox" : "Reset your password"}
      subtitle={message ? undefined : "Enter the email you signed up with and we'll send you a reset link."}
      footer={backLink}
    >
      {message ? (
        <div className="flex flex-col items-center gap-sm rounded-lg border border-border bg-card p-lg text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <EnvelopeSimple size={28} weight="duotone" aria-hidden />
          </span>
          <p role="status" className="text-caption text-foreground">
            {message}
          </p>
          <p className="text-fine-print text-muted-foreground">
            Didn&apos;t get it? Check spam, or{" "}
            <button type="button" onClick={() => setMessage("")} className="font-semibold text-accent hover:underline">
              try another email
            </button>
            .
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-md">
          {error && <FormAlert>{error}</FormAlert>}
          <TextField
            id="forgot-email"
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
          <Button type="submit" variant="contained" size="large" loading={submitting} fullWidth>
            {submitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
