const ACCESS_TOKEN_KEY = "mywallet.accessToken";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Persist JWT from BE auth responses (`accessToken`). */
export function saveSessionToken(accessToken: string): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

/** Read JWT, or `null` when missing / invalid. */
export function getSessionToken(): string | null {
  if (!canUseStorage()) return null;
  const value = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  if (value == null || value.trim() === "") return null;
  return value;
}

/** Clear JWT (logout / invalid session). */
export function clearSessionToken(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}
