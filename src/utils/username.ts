export const USERNAME_REGEX = /^(?![.])(?!.*[.]$)(?!.*\.{2})[a-z0-9._]{3,30}$/;
export const USERNAME_ALLOWED_REGEX = /^[a-z0-9._]{3,30}$/;
export const USERNAME_START_DOT_REGEX = /^\./;
export const USERNAME_END_DOT_REGEX = /\.$/;
export const USERNAME_DOUBLE_DOT_REGEX = /\.\./;
export const USERNAME_ERROR_ALLOWED =
	"Username deve conter letras minúsculas, números, pontos(.) e underscores(_)";
export const USERNAME_ERROR_EDGE_DOT =
	"Username não pode começar/terminar com ponto";
export const USERNAME_ERROR_DOUBLE_DOT =
	"Username não pode ter pontos em sequência";
export function sanitizeUsername(input: string): string {
	const v = String(input || "")
		.toLowerCase()
		.replace(/[^a-z0-9._]/g, "");
	return v;
}
export function isValidUsernameFormat(u: string): boolean {
	const v = String(u || "");
	if (!USERNAME_ALLOWED_REGEX.test(v)) {
		return false;
	}
	if (USERNAME_START_DOT_REGEX.test(v) || USERNAME_END_DOT_REGEX.test(v)) {
		return false;
	}
	if (USERNAME_DOUBLE_DOT_REGEX.test(v)) {
		return false;
	}
	return true;
}
export function normalizeUsernameForLookup(input: string): string {
	const s = sanitizeUsername(input);
	return s.replace(/^\.+|\.+$/g, "");
}
export function getUsernameFormatError(u: string): string | null {
	const v = String(u || "");
	if (!USERNAME_ALLOWED_REGEX.test(v)) {
		return USERNAME_ERROR_ALLOWED;
	}
	if (USERNAME_START_DOT_REGEX.test(v) || USERNAME_END_DOT_REGEX.test(v)) {
		return USERNAME_ERROR_EDGE_DOT;
	}
	if (USERNAME_DOUBLE_DOT_REGEX.test(v)) {
		return USERNAME_ERROR_DOUBLE_DOT;
	}
	return null;
}
