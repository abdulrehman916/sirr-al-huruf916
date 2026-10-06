/**
 * Code Duration Utilities — Central source of truth for all duration types,
 * expiry computation, remaining time formatting, and status determination.
 *
 * Supports: Minutes, Hours, Days, Weeks, Months, Years, Lifetime, Custom Date+Time.
 * All expiry values are ISO 8601 timestamps (date + exact time).
 */

export const DURATION_TYPES = [
  { value: 'MINUTES',  label: 'Minutes',  ms: 60000 },
  { value: 'HOURS',    label: 'Hours',    ms: 3600000 },
  { value: 'DAYS',     label: 'Days',     ms: 86400000 },
  { value: 'WEEKS',    label: 'Weeks',    ms: 604800000 },
  { value: 'MONTHS',   label: 'Months',   ms: 2592000000 },
  { value: 'YEARS',    label: 'Years',    ms: 31536000000 },
  { value: 'LIFETIME', label: 'Lifetime', ms: null },
  { value: 'CUSTOM',   label: 'Custom Date & Time', ms: null },
];

// Preset duration options for quick selection (backward compatible with existing UI)
export const DURATION_OPTIONS = [
  { value: "30_MIN",    label: "30 Min",     days: null, duration_ms: 1800000 },
  { value: "2_HOURS",   label: "2 Hours",    days: null, duration_ms: 7200000 },
  { value: "12_HOURS",  label: "12 Hours",   days: null, duration_ms: 43200000 },
  { value: "1_DAY",     label: "1 Day",      days: 1,    duration_ms: 86400000 },
  { value: "7_DAYS",    label: "7 Days",     days: 7,    duration_ms: 604800000 },
  { value: "1_MONTH",   label: "1 Month",    days: 30,   duration_ms: 2592000000 },
  { value: "6_MONTHS",  label: "6 Months",   days: 180,  duration_ms: 15552000000 },
  { value: "1_YEAR",    label: "1 Year",     days: 365,  duration_ms: 31536000000 },
  { value: "LIFETIME",  label: "Lifetime",   days: null, duration_ms: null },
  { value: "CUSTOM",    label: "Custom",     days: null, duration_ms: null },
];

// Quick preset buttons for common durations
export const DURATION_PRESETS = [
  { label: '30 min',    type: 'MINUTES', count: 30 },
  { label: '2 hours',   type: 'HOURS',   count: 2 },
  { label: '12 hours',  type: 'HOURS',   count: 12 },
  { label: '1 day',     type: 'DAYS',    count: 1 },
  { label: '7 days',    type: 'DAYS',    count: 7 },
  { label: '1 month',   type: 'MONTHS',  count: 1 },
  { label: '6 months',  type: 'MONTHS',  count: 6 },
  { label: '1 year',    type: 'YEARS',   count: 1 },
  { label: 'Lifetime',  type: 'LIFETIME',count: null },
];

/**
 * Compute expiry ISO timestamp from duration type + count.
 * @param {string} type — DURATION_TYPES value
 * @param {number} count — duration count
 * @param {string} customDate — ISO datetime string (for CUSTOM type)
 * @param {Date} fromTime — base time (default: now)
 * @returns {string|null} ISO 8601 timestamp or null for Lifetime
 */
export function computeExpiry(type, count, customDate, fromTime = new Date()) {
  if (type === 'LIFETIME') return null;
  if (type === 'CUSTOM') return customDate ? new Date(customDate).toISOString() : null;
  const meta = DURATION_TYPES.find(t => t.value === type);
  if (!meta?.ms) return null;
  return new Date(fromTime.getTime() + (parseInt(count) || 0) * meta.ms).toISOString();
}

/**
 * Convert duration type + count to milliseconds.
 */
export function durationToMs(type, count) {
  if (type === 'LIFETIME') return null;
  const meta = DURATION_TYPES.find(t => t.value === type);
  if (!meta?.ms) return null;
  return (parseInt(count) || 0) * meta.ms;
}

/**
 * Format a human-readable duration label.
 */
export function formatDurationLabel(type, count) {
  if (type === 'LIFETIME') return 'Lifetime';
  if (type === 'CUSTOM') return 'Custom';
  const meta = DURATION_TYPES.find(t => t.value === type);
  if (!meta) return type;
  const unit = meta.label.toLowerCase();
  return `${count} ${count === 1 ? unit.replace(/s$/, '') : unit}`;
}

/**
 * Format remaining time as a short string: "2M 5D 18h 42m"
 */
export function formatRemaining(expiryDate) {
  if (!expiryDate) return '∞ Lifetime';
  const diff = new Date(expiryDate).getTime() - Date.now();
  if (diff <= 0) return 'Expired';

  const years = Math.floor(diff / 31536000000);
  const months = Math.floor((diff % 31536000000) / 2592000000);
  const days = Math.floor((diff % 2592000000) / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  const parts = [];
  if (years > 0) parts.push(`${years}Y`);
  if (months > 0) parts.push(`${months}M`);
  if (days > 0) parts.push(`${days}D`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  return parts.join(' ') || '<1m';
}

/**
 * Format remaining time as a long string: "2 Months 5 Days 18 Hours 42 Minutes"
 */
export function formatRemainingLong(expiryDate) {
  if (!expiryDate) return 'Lifetime';
  const diff = new Date(expiryDate).getTime() - Date.now();
  if (diff <= 0) return 'Expired';

  const years = Math.floor(diff / 31536000000);
  const months = Math.floor((diff % 31536000000) / 2592000000);
  const days = Math.floor((diff % 2592000000) / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  const parts = [];
  if (years > 0) parts.push(`${years} Year${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} Month${months > 1 ? 's' : ''}`);
  if (days > 0) parts.push(`${days} Day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} Hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} Minute${minutes > 1 ? 's' : ''}`);
  return parts.join(' ') || 'Less than a minute';
}

/**
 * Get computed status of a code based on current time.
 * Returns { label, color, value }
 */
export function getCodeStatus(code) {
  if (code.is_disabled) return { label: 'Disabled', color: '#6b7280', value: 'disabled' };
  if (code.expiry_date && new Date(code.expiry_date) < new Date()) return { label: 'Expired', color: '#ef4444', value: 'expired' };
  if ((code.use_count || 0) >= (code.max_uses || 1)) return { label: 'Used', color: '#f59e0b', value: 'used' };
  return { label: 'Active', color: '#22c55e', value: 'active' };
}

export function isLifetime(code) {
  return !code.expiry_date;
}

export function isExpiringToday(code) {
  if (!code.expiry_date) return false;
  const now = new Date();
  const expiry = new Date(code.expiry_date);
  return expiry.toDateString() === now.toDateString() && expiry > now;
}

export function isExpiringTomorrow(code) {
  if (!code.expiry_date) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return new Date(code.expiry_date).toDateString() === tomorrow.toDateString();
}

export function isExpiringWithin7Days(code) {
  if (!code.expiry_date) return false;
  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 86400000);
  const expiry = new Date(code.expiry_date);
  return expiry > now && expiry <= sevenDays;
}

export function isRecentlyRedeemed(code, hours = 24) {
  if (!code.used_at) return false;
  return new Date(code.used_at).getTime() > Date.now() - hours * 3600000;
}

export function isRecentlyRenewed(code, hours = 24) {
  if (!code.renewal_history || code.renewal_history.length === 0) return false;
  const last = code.renewal_history[code.renewal_history.length - 1];
  return new Date(last.renewed_at).getTime() > Date.now() - hours * 3600000;
}

/**
 * Format an ISO timestamp for display: "03 Jul 2026, 14:30"
 */
export function fmtDateTime(d) {
  if (!d) return '∞ Lifetime';
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function fmtDate(d) {
  if (!d) return '∞ Lifetime';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * P2.5: Compute the authoritative code-level expiry_date from per-page durations.
 * Returns the latest FINITE page expiry, or null when ALL pages are lifetime
 * (or no durations are set). Lifetime pages are ignored for the code-level so a
 * mixed code never over-grants finite pages to lifetime. This keeps the code-level
 * expiry synchronized with the actual per-page expiries and removes the previous
 * null-even-when-finite inconsistency.
 */
/**
 * Compute a single page's feature-aware expiry timestamp.
 * Mirrors redeemCodeGuest.buildPermissions exactly so the client, the
 * validateCodeStatus backend, and the admin EditCodeModal all derive the
 * same per-page expiry. Returns an ISO timestamp or null (Lifetime).
 *
 * @param {string} path - page_path
 * @param {object} pageDur - page_durations[path] entry
 * @param {string[]} subFeats - sub_features for this page
 * @param {object} featureDurations - full feature_durations map
 * @param {number} baseTimeMs - grant base time (ms)
 */
export function computePageExpiry(path, pageDur, subFeats, featureDurations, baseTimeMs = Date.now()) {
  const base = baseTimeMs;
  let pageExpiryMs = null;
  let pageIsLifetime = false;
  if (pageDur) {
    if (pageDur.value === 'LIFETIME') pageIsLifetime = true;
    else if (pageDur.value === 'CUSTOM' && pageDur.custom_date) pageExpiryMs = new Date(pageDur.custom_date).getTime();
    else if (pageDur.duration_ms) pageExpiryMs = base + pageDur.duration_ms;
    else if (pageDur.days) pageExpiryMs = base + pageDur.days * 86400000;
  }
  let latestFeatureMs = null;
  let hasLifetimeFeature = false;
  let hasFeatureDurations = false;
  (subFeats || []).forEach((featId) => {
    const fd = featureDurations ? featureDurations[`${path}:${featId}`] : null;
    if (fd) {
      hasFeatureDurations = true;
      const featBase = fd.added_at ? new Date(fd.added_at).getTime() : base;
      if (fd.is_lifetime) hasLifetimeFeature = true;
      else if (fd.duration_ms) { const e = featBase + fd.duration_ms; if (latestFeatureMs === null || e > latestFeatureMs) latestFeatureMs = e; }
      else if (fd.duration_days) { const e = featBase + fd.duration_days * 86400000; if (latestFeatureMs === null || e > latestFeatureMs) latestFeatureMs = e; }
    }
  });
  if (hasFeatureDurations) {
    if (hasLifetimeFeature) return null;
    return latestFeatureMs !== null ? new Date(latestFeatureMs).toISOString() : null;
  }
  return pageIsLifetime ? null : (pageExpiryMs !== null ? new Date(pageExpiryMs).toISOString() : null);
}

/**
 * Build a per-page grant record { granted_at, expires_at, duration_label }.
 * Used by CreateCodeForm / EditCodeModal to write AccessCode.page_grants[path].
 */
export function buildPageGrant(path, pageDur, subFeats, featureDurations, grantedAtMs = Date.now()) {
  return {
    granted_at: new Date(grantedAtMs).toISOString(),
    expires_at: computePageExpiry(path, pageDur, subFeats, featureDurations, grantedAtMs),
    duration_label: pageDur?.label || '',
  };
}

export function computeCodeLevelExpiry(pageDurations, fromTime = new Date()) {
  if (!pageDurations) return null;
  let latest = null;
  let finiteCount = 0;
  let lifetimeCount = 0;
  for (const path of Object.keys(pageDurations)) {
    const d = pageDurations[path];
    if (!d) continue;
    if (d.value === 'LIFETIME') { lifetimeCount++; continue; }
    let t = null;
    if (d.value === 'CUSTOM' && d.custom_date) t = new Date(d.custom_date).getTime();
    else if (d.duration_ms) t = fromTime.getTime() + d.duration_ms;
    else if (d.days) t = fromTime.getTime() + d.days * 86400000;
    if (t !== null) { finiteCount++; if (latest === null || t > latest) latest = t; }
  }
  if (finiteCount === 0 && lifetimeCount > 0) return null; // all pages lifetime
  return latest ? new Date(latest).toISOString() : null;
}