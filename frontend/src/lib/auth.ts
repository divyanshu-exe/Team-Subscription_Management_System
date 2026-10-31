// OWNER: FE-1
// PURPOSE: Token storage helpers (dual cookie + localStorage for client and middleware)

const TOKEN_KEY = 'sms_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Try reading cookie first
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${TOKEN_KEY})=([^;]*)`));
  if (match && match[3]) {
    return decodeURIComponent(match[3]);
  }

  // Fallback to localStorage
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (_) {
    return null;
  }
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;

  // Store in localStorage
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (_) {}

  // Store in cookie (path=/, max-age 7 days, SameSite=Lax)
  const maxAge = 7 * 24 * 60 * 60;
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (_) {}

  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}
