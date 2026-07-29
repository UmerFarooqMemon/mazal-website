/**
 * Matches Laravel backend: Password::min(10)->letters()->numbers()
 * (RegisterRequest / ResetPasswordRequest / ChangePasswordRequest)
 */
export const PASSWORD_MIN_LENGTH = 10;

export type PasswordValidationError =
  | "required"
  | "min"
  | "letters"
  | "numbers";

export function getPasswordValidationError(
  password: string,
): PasswordValidationError | null {
  if (!password.trim()) return "required";
  if (password.length < PASSWORD_MIN_LENGTH) return "min";
  // Laravel Password::letters() / numbers() use Unicode letter/number props
  if (!/\p{L}/u.test(password)) return "letters";
  if (!/\p{N}/u.test(password)) return "numbers";
  return null;
}

export function passwordMeetsRequirements(password: string) {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    hasLetter: /\p{L}/u.test(password),
    hasNumber: /\p{N}/u.test(password),
  };
}
