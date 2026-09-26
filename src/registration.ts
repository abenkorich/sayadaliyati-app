// Match the API's Unicode code-point length rule without trimming passwords.
export function registrationError(input: {
  firstName: string;
  lastName: string;
  password: string;
}): string | null {
  const length = [...input.password].length;
  if (length < 15)
    return 'Your password is too short. Use at least 15 characters.';
  if (length > 128)
    return 'Your password is too long. Use no more than 128 characters.';
  if (/[\uD800-\uDFFF]/u.test(input.password))
    return 'Your password contains an unsupported character. Please re-enter it.';
  for (const [label, value] of [
    ['First name', input.firstName],
    ['Last name', input.lastName],
  ]) {
    if (!value!.trim()) return `Enter your ${label!.toLowerCase()}.`;
    if (value!.trim().length > 100)
      return `${label} must be 100 characters or fewer.`;
  }
  return null;
}
