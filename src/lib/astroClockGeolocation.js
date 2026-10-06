/**
 * ASTRO CLOCK — LOCATION STORE (real GPS + manual fallback)
 * Single source of truth for the user's geographic location.
 *
 *   getUserLocation()           — synchronous read of the persisted location
 *                                  (GPS or manual). Dubai default ONLY when
 *                                  nothing is saved (last-resort fallback).
 *   requestLocationPermission() — async; asks the browser for GPS once;
 *                                  saves + notifies subscribers.
 *   startLocationWatch()        — continuous GPS (travel → recalculate),
 *                                  throttled to ~1 km (0.01°) to avoid drift noise.
 *   stopLocationWatch()          — clear the watch.
 *   setManualLocation(loc)      — manual override (fallback when GPS denied).
 *   subscribeLocation(fn)       — reactivity; consumers recompute on change.
 *   getLocationVersion()        — version counter for memo deps.
 *
 * Timezone = device offset (DST-aware via getTimezoneOffset), NOT a longitude
 * estimate. No calculation formulas live here — only the location SOURCE.
 */
import tzLookup from "tz-lookup";

const STORAGE_KEY = "astro_clock_location";

const DUBAI_DEFAULT = Object.freeze({
  lat: 25.2048,
  lng: 55.2708,
  timezone: 4,
  tz: "Asia/Dubai",
  name: "Dubai, UAE (Default)",
  isDefault: true,
  source: "default",
});

let _version = 0;
const _listeners = new Set();
let _watchId = null;
let _lastWatch = null;
let _inflight = null;

function readPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const loc = JSON.parse(raw);
      if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") return loc;
    }
  } catch (_) {}
  return null;
}

function writePersisted(loc) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(loc)); } catch (_) {}
}

function deviceTimezone() {
  // Browser offset in minutes (DST-aware) → hours. Dubai = +4, no DST.
  try { return -new Date().getTimezoneOffset() / 60; } catch (_) { return 0; }
}

function deviceIana() {
  // Authoritative IANA timezone of the device (e.g. "Asia/Dubai", "America/New_York").
  // Used so GPS and manual presets resolve offsets through the same Intl path →
  // identical astronomical results for the same coordinates and date.
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (_) { return undefined; }
}

// Location-aware timezone from longitude (solar/nautical offset). Used ONLY as
// a last-resort numeric fallback when no IANA timezone can be resolved.
export function timezoneFromLng(lng) {
  if (typeof lng !== "number" || !isFinite(lng)) return 0;
  return Math.round(lng / 15);
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFLINE LAT/LNG → IANA TIMEZONE RESOLVER (tz-lookup spatial tz database)
// Returns the authoritative IANA timezone name (e.g. "America/New_York",
// "Europe/London", "Asia/Kolkata") for ANY coordinate on Earth — no network,
// no API, no manual offset tables. The browser's built-in Intl tz database then
// applies the correct historical + current DST rules for that zone at the
// selected date. This is the single source of truth used by GPS, preset cities,
// and free-form manual coordinates alike, so identical (lat, lng, date) always
// resolve to the identical timezone and identical astronomical results.
// ─────────────────────────────────────────────────────────────────────────────
export function ianaFromCoords(lat, lng) {
  try {
    const tz = tzLookup(lat, lng);
    return (typeof tz === "string" && tz) ? tz : undefined;
  } catch (_) { return undefined; }
}

function notify() {
  _version++;
  _listeners.forEach((fn) => { try { fn(); } catch (_) {} });
}

function buildGpsLoc(latitude, longitude) {
  // Resolve IANA tz from the GPS coordinates (spatial tz database). This is the
  // SAME resolver used for manual coords → identical coords produce identical tz.
  // Device IANA is kept only as a fallback if the spatial lookup fails.
  return {
    lat: latitude,
    lng: longitude,
    timezone: deviceTimezone(),
    tz: ianaFromCoords(latitude, longitude) || deviceIana(),
    name: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
    isDefault: false,
    source: "gps",
  };
}

// ── Synchronous read — the single source used by every calculation ──
export function getUserLocation() {
  const persisted = readPersisted();
  if (persisted) return persisted;
  return DUBAI_DEFAULT;
}

export function getLocationVersion() { return _version; }

export function subscribeLocation(fn) {
  _listeners.add(fn);
  return () => { _listeners.delete(fn); };
}

export function setManualLocation(loc) {
  if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") return;
  // Resolve IANA tz: an explicit tz from a preset wins; otherwise resolve from
  // the coordinates via the spatial tz database so any free-form coordinate gets
  // the correct DST-aware civil timezone. Numeric offset is a last-resort fallback.
  const tz = (typeof loc.tz === "string" && loc.tz) ? loc.tz : ianaFromCoords(loc.lat, loc.lng);
  const numericOffset = (typeof loc.timezone === "number") ? loc.timezone : timezoneFromLng(loc.lng);
  const next = { ...loc, tz, timezone: numericOffset, isDefault: false, source: "manual" };
  writePersisted(next);
  notify();
}

// Free-form manual location from raw coordinates — supports ANY place on Earth,
// not only the preset city list. IANA timezone is resolved from the coordinates
// via the spatial tz database (DST-aware); numeric offset is the fallback.
export function setManualLocationByCoords(lat, lng, name) {
  if (typeof lat !== "number" || typeof lng !== "number") return;
  setManualLocation({
    lat, lng,
    tz: ianaFromCoords(lat, lng),
    timezone: timezoneFromLng(lng),
    name: name || `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
    source: "manual",
  });
}

// Ask the browser for GPS once. Idempotent — concurrent callers share one prompt.
export function requestLocationPermission() {
  if (_inflight) return _inflight;
  _inflight = new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = buildGpsLoc(position.coords.latitude, position.coords.longitude);
        writePersisted(loc);
        notify();
        resolve(loc);
      },
      () => { resolve(null); }, // denied/unavailable — keep existing (manual or default)
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
  _inflight.finally(() => { _inflight = null; });
  return _inflight;
}

// Continuous GPS — recalculate on travel. Throttled to ~1 km.
export function startLocationWatch() {
  if (typeof navigator === "undefined" || !navigator.geolocation) return;
  if (_watchId !== null) return;
  _watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      if (_lastWatch) {
        if (Math.abs(latitude - _lastWatch.lat) < 0.01 && Math.abs(longitude - _lastWatch.lng) < 0.01) return;
      }
      _lastWatch = { lat: latitude, lng: longitude };
      const loc = buildGpsLoc(latitude, longitude);
      writePersisted(loc);
      notify();
    },
    () => { /* ignore watch errors — keep last known location */ },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
  );
}

export function stopLocationWatch() {
  if (_watchId !== null && typeof navigator !== "undefined" && navigator.geolocation) {
    try { navigator.geolocation.clearWatch(_watchId); } catch (_) {}
  }
  _watchId = null;
}

// ── Legacy compat ──
export function getUserLocationFromBrowser() {
  return new Promise((resolve) => {
    requestLocationPermission().then((loc) => resolve(loc || DUBAI_DEFAULT));
  });
}

export function getTimezoneOffset() {
  return deviceTimezone();
}

export const GEOLOCATION_STATUS = {
  supported: typeof navigator !== "undefined" && !!navigator.geolocation,
};