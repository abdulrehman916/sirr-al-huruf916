const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const IS_DEV = import.meta.env.DEV;

// ── Dev-mode token cookie backup ──────────────────────────────
// The Base44 SDK stores the access token in localStorage. On Preview
// iframe recreation (every code build), localStorage is cleared and the
// token is lost — forcing a Google re-login on every refresh. In dev
// mode only, we back up the token to a cookie and restore it on the next
// load so the Owner session survives preview rebuilds.
// Production is completely unaffected: IS_DEV is false in prod builds.
function devSetCookie(name, value, days = 365) {
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=None;Secure`;
  } catch { /* ignore */ }
}
function devGetCookie(name) {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  } catch { return null; }
}
function devDeleteCookie(name) {
  try { document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`; }
  catch { /* ignore */ }
}

// Restore token from cookie BEFORE getAppParams() reads localStorage
if (IS_DEV && !isNode) {
  const TOKEN_KEY = 'base44_access_token';
  const TOKEN_COOKIE = 'base44_dev_token';
  const urlParams = new URLSearchParams(window.location.search);
  const isLoggingOut = urlParams.get('clear_access_token') === 'true';
  const lsToken = storage.getItem(TOKEN_KEY);
  if (isLoggingOut) {
    // Explicit logout — clear cookie backup so token is NOT restored
    devDeleteCookie(TOKEN_COOKIE);
  } else if (lsToken) {
    // Token exists in localStorage — back up to cookie
    devSetCookie(TOKEN_COOKIE, lsToken);
  } else {
    // localStorage cleared (preview rebuild) — restore from cookie
    const cookieToken = devGetCookie(TOKEN_COOKIE);
    if (cookieToken) storage.setItem(TOKEN_KEY, cookieToken);
  }
}

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
}

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		storage.removeItem('base44_access_token');
		storage.removeItem('token');
	}
	return {
		appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
		appBaseUrl: getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL }),
	}
}


export const appParams = {
	...getAppParams()
}