// OWNER: FE-1
// PURPOSE: Token management with dual cookie and localStorage persistence

const TOKEN_KEY = 'sms_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  const local = localStorage.getItem(TOKEN_KEY);
  if (local) return local;

  const match = document.cookie.match(new RegExp('(^|;\\s*)sms_token=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `sms_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = 'sms_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
}
