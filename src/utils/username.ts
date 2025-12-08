export const USERNAME_REGEX = /^(?![.])(?!.*[.]$)[a-z0-9._]{3,30}$/;
export const USERNAME_FORMAT_ERROR = "Username deve conter apenas letras minúsculas, números, pontos(.) e underscores(_) e não pode começar nem terminar com ponto";
export function sanitizeUsername(input: string): string {
  const v = String(input || "").toLowerCase().replace(/[^a-z0-9._]/g, "");
  return v;
}
export function isValidUsernameFormat(u: string): boolean {
  return USERNAME_REGEX.test(String(u || ""));
}
export function normalizeUsernameForLookup(input: string): string {
  const s = sanitizeUsername(input);
  return s.replace(/^\.+|\.+$/g, "");
}
