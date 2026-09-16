import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { useRegisterMutation } from "../store/api/authApi";
import { getRtkErrorMessage } from "../store/lib/getRtkErrorMessage";
import PasswordField from "../components/PasswordField";
import { NAME_MAX, validateEmail, validateMaxLength, validatePassword, validateRequired } from "../lib/validation";

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
    if (nextNameError || nextEmailError || nextPasswordError) return;

    try {
      await register({ name, email, password }).unwrap();
      navigate("/");
    } catch (err) {
      setError(getRtkErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold">Create an account</h1>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setNameError(validateName(name) || "")}
          error={!!nameError}
          helperText={nameError}
          disabled={submitting}
        />
        <TextField
          label="Email"
          type="text"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailError(validateEmail(email) || "")}
          error={!!emailError}
          helperText={emailError}
          disabled={submitting}
        />
        <PasswordField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordError(validatePassword(password) || "")}
          error={!!passwordError}
          helperText={passwordError}
          disabled={submitting}
        />
        {error && <p className="text-sm font-medium text-foreground dark:text-foreground-dark">{error}</p>}
        <Button type="submit" variant="contained" disabled={submitting}>
          Register
        </Button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
