/**
 * Shared device detection and country inference utilities.
 * Used by Onboarding, OTPLogin, and other auth pages.
 */
export function detectDevice() {
  const ua = (navigator.userAgent || "").toLowerCase();
  if (/mobi|android/.test(ua)) return "mobile";
  if (/tablet|ipad/.test(ua)) return "tablet";
  return "desktop";
}

export function getCountry() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.startsWith("Asia/Dubai") || tz.startsWith("Asia/Muscat")) return "AE";
    if (tz.startsWith("Asia/Kolkata") || tz.startsWith("Asia/Calcutta")) return "IN";
    if (tz.startsWith("America/")) return "US";
    if (tz.startsWith("Europe/London")) return "GB";
    return tz.split("/")[0] === "Asia"
      ? "AE"
      : (tz.split("/")[1] || "").substring(0, 2).toUpperCase() || "";
  } catch {
    return "";
  }
}