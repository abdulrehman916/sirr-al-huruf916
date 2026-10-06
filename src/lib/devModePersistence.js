/**
 * Dev-Mode Persistence Utility
 *
 * In Base44 Preview (dev mode): stores values in BOTH localStorage AND a cookie
 * for cross-rebuild redundancy. If localStorage is cleared on a rebuild, the
 * cookie backup ensures acceptance state survives — no more re-accepting rules
 * after every preview refresh.
 *
 * In production: uses localStorage only — behavior is identical to before this
 * utility was introduced. No production logic is changed.
 */

const IS_DEV = import.meta.env.DEV;

// ── Cookie helpers ──
function setCookie(name, value, days = 365) {
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    // Dev preview runs in a cross-origin iframe — SameSite=Lax cookies are blocked
    // there. SameSite=None;Secure works in HTTPS preview AND localhost (Chrome
    // treats localhost as a secure context). Production never calls this.
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=None;Secure`;
  } catch { /* ignore */ }
}

function getCookie(name) {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  } catch { return null; }
}

function deleteCookie(name) {
  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  } catch { /* ignore */ }
}

// ── Persistence API ──

/**
 * Reads a persisted value.
 * Dev mode: checks localStorage first, then cookie backup.
 * Production: checks localStorage only.
 */
export function persistGet(key) {
  try {
    const ls = localStorage.getItem(key);
    if (ls !== null) return ls;
  } catch { /* ignore */ }
  if (IS_DEV) return getCookie(key);
  return null;
}

/**
 * Writes a persisted value.
 * Dev mode: writes to localStorage AND cookie.
 * Production: writes to localStorage only.
 */
export function persistSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
  if (IS_DEV) setCookie(key, value);
}

/**
 * Removes a persisted value.
 * Dev mode: removes from localStorage AND cookie.
 * Production: removes from localStorage only.
 */
export function persistRemove(key) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
  if (IS_DEV) deleteCookie(key);
}

/** Session storage helpers (used by SplashScreen in production) */
export function sessionGet(key) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

export function sessionSet(key, value) {
  try { sessionStorage.setItem(key, value); } catch { /* ignore */ }
}

/** True when running in Base44 Preview / Vite dev server */
export const isDevMode = IS_DEV;