export const NAME_MAX = 100;
export const TITLE_MAX = 200;
export const DESCRIPTION_MAX = 5000;
export const COMMENT_MAX = 2000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function validateRequired(value: string, label: string): string | null {
  return value.trim() ? null : `${label} is required.`;
}

export function validateEmail(value: string): string | null {
  if (!value.trim()) return "Email is required.";
  return EMAIL_REGEX.test(value.trim()) ? null : "Enter a valid email address.";
}

export function validatePassword(value: string): string | null {
  if (!value) return "Password is required.";
  return PASSWORD_REGEX.test(value)
    ? null
    : "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.";
}

export function validateMaxLength(value: string, max: number, label: string): string | null {
  return value.length > max ? `${label} must be ${max} characters or fewer.` : null;
}

export function validateMatch(value: string, other: string, label: string): string | null {
  return value === other ? null : `${label} do not match.`;
}
