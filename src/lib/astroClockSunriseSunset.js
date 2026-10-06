/**
 * ASTRO CLOCK — SUNRISE/SUNSET CALCULATIONS
 * NOAA solar position algorithm for accurate sunrise/sunset
 * Astro Clock module only — completely isolated
 */

// ─────────────────────────────────────────────────────────────────────────────
// PRE-CONFIGURED LOCATIONS (LAT/LNG)
// ─────────────────────────────────────────────────────────────────────────────
export const KNOWN_LOCATIONS = {
  dubai: { lat: 25.2048, lng: 55.2708, name: "Dubai, UAE", tz: "Asia/Dubai" },
  abu_dhabi: { lat: 24.4539, lng: 54.3773, name: "Abu Dhabi, UAE", tz: "Asia/Dubai" },
  mecca: { lat: 21.4225, lng: 39.8262, name: "Mecca, Saudi Arabia", tz: "Asia/Riyadh" },
  medina: { lat: 24.5247, lng: 39.5692, name: "Medina, Saudi Arabia", tz: "Asia/Riyadh" },
  riyadh: { lat: 24.7136, lng: 46.6753, name: "Riyadh, Saudi Arabia", tz: "Asia/Riyadh" },
  cairo: { lat: 30.0444, lng: 31.2357, name: "Cairo, Egypt", tz: "Africa/Cairo" },
  istanbul: { lat: 41.0082, lng: 28.9784, name: "Istanbul, Turkey", tz: "Europe/Istanbul" },
  delhi: { lat: 28.6139, lng: 77.2090, name: "Delhi, India", tz: "Asia/Kolkata" },
  mumbai: { lat: 19.0760, lng: 72.8777, name: "Mumbai, India", tz: "Asia/Kolkata" },
  kochi: { lat: 9.9312, lng: 76.2673, name: "Kochi, India", tz: "Asia/Kolkata" },
  london: { lat: 51.5074, lng: -0.1278, name: "London, UK", tz: "Europe/London" },
  new_york: { lat: 40.7128, lng: -74.0060, name: "New York, USA", tz: "America/New_York" }
};

// ─────────────────────────────────────────────────────────────────────────────
// IANA TIMEZONE OFFSET RESOLVER (DST-aware)
// Returns the UTC offset in HOURS for the given IANA timezone (e.g. "America/New_York")
// at the given instant, with Daylight Saving Time applied by the browser's built-in
// Intl tz database. This is the authoritative civil offset — no external API, no
// manual DST tables. Returns null if the timezone name is invalid/unsupported.
// ─────────────────────────────────────────────────────────────────────────────
export function getTzOffsetHours(ianaTz, date) {
  if (!ianaTz) return null;
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: ianaTz, hour12: false,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    const map = {};
    dtf.formatToParts(date).forEach((p) => { map[p.type] = p.value; });
    // Reinterpret the target-tz wall clock as UTC, then diff against the true UTC instant.
    // tz ahead of UTC (e.g. +4) → wall clock is later → asUTC > date.getTime() → +offset. ✓
    const asUTC = Date.UTC(
      +map.year, +map.month - 1, +map.day,
      (+map.hour) % 24, +map.minute, +map.second
    );
    return (asUTC - date.getTime()) / 3600000;
  } catch (_) { return null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATE SUNRISE/SUNSET
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Calculate sunrise and sunset times using NOAA algorithm
 * @param {Date} date - Date to calculate for
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} timezone - Timezone offset (e.g., 4 for Dubai)
 * @returns {Object} { sunrise: number, sunset: number } (decimal hours)
 */
export function calculateSunriseSunset(date, lat, lng, timezone) {
  const dayOfYear = getDayOfYear(date);
  
  // Convert to radians
  const latRad = lat * Math.PI / 180;
  
  // Calculate the sun's mean anomaly
  const M = (357.5291 + 0.98560028 * (dayOfYear - 1)) % 360;
  const MRad = M * Math.PI / 180;
  
  // Calculate the equation of center
  const C = 1.9148 * Math.sin(MRad) + 0.0200 * Math.sin(2 * MRad) + 0.0003 * Math.sin(3 * MRad);
  
  // Calculate the sun's ecliptic longitude
  // +180° converts from perihelion-referenced mean anomaly to vernal-equinox-referenced
  // ecliptic longitude. Without this, the declination has the wrong sign (winter values
  // in summer). Total offset = 180 + 102.9372 = 282.9372.
  const lambda = (M + C + 282.9372) % 360;
  const lambdaRad = lambda * Math.PI / 180;
  
  // Calculate the sun's declination
  const sinDec = Math.sin(lambdaRad) * Math.sin(23.44 * Math.PI / 180);
  const decRad = Math.asin(sinDec);
  
  // Calculate the hour angle (90.833° for official sunrise/sunset)
  const sunriseAngle = 90.833;
  const cosHA = (Math.cos(sunriseAngle * Math.PI / 180) - Math.sin(latRad) * sinDec) / 
                (Math.cos(latRad) * Math.cos(decRad));
  
  // Check for polar day/night
  if (cosHA > 1) {
    return { sunrise: null, sunset: null, polarNight: true };
  }
  if (cosHA < -1) {
    return { sunrise: null, sunset: null, polarDay: true };
  }
  
  const HA = Math.acos(cosHA) * 180 / Math.PI;
  
  // Calculate sunrise and sunset in UTC minutes from midnight
  const sunriseUTC = 720 - 4 * (lng + HA) - getEquationOfTime(dayOfYear);
  const sunsetUTC = 720 - 4 * (lng - HA) - getEquationOfTime(dayOfYear);
  
  // Convert to local time (decimal hours)
  const sunriseLocal = (sunriseUTC / 60 + timezone) % 24;
  const sunsetLocal = (sunsetUTC / 60 + timezone) % 24;
  
  // Normalize to 0-24 range
  const sunriseNorm = sunriseLocal < 0 ? sunriseLocal + 24 : sunriseLocal;
  const sunsetNorm = sunsetLocal < 0 ? sunsetLocal + 24 : sunsetLocal;
  
  return {
    sunrise: sunriseNorm,
    sunset: sunsetNorm,
    dayLength: (sunsetNorm - sunriseNorm + 24) % 24,
    nightLength: 24 - ((sunsetNorm - sunriseNorm + 24) % 24)
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET DAY OF YEAR
// ─────────────────────────────────────────────────────────────────────────────
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// ─────────────────────────────────────────────────────────────────────────────
// GET EQUATION OF TIME
// ─────────────────────────────────────────────────────────────────────────────
function getEquationOfTime(dayOfYear) {
  const B = 360 * (dayOfYear - 81) / 365;
  return 9.87 * Math.sin(2 * B * Math.PI / 180) - 7.53 * Math.cos(B * Math.PI / 180) - 1.5 * Math.sin(B * Math.PI / 180);
}

// ─────────────────────────────────────────────────────────────────────────────
// GET USER LOCATION (AUTO-DETECT OR DEFAULT)
// ─────────────────────────────────────────────────────────────────────────────
export function getUserLocation() {
  // Real GPS / manual location persisted by the astroClockGeolocation store.
  // Synchronous read — Dubai is only the last-resort fallback when nothing is
  // saved (GPS unavailable/denied and no manual selection).
  try {
    const raw = localStorage.getItem("astro_clock_location");
    if (raw) {
      const loc = JSON.parse(raw);
      if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") return loc;
    }
  } catch (_) {}
  return { lat: 25.2048, lng: 55.2708, timezone: 4, name: "Dubai, UAE", isDefault: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMAT DECIMAL HOUR TO TIME STRING
// ─────────────────────────────────────────────────────────────────────────────
export function formatDecimalTime(decimalHour) {
  if (decimalHour === null) return "N/A";
  const hours = Math.floor(decimalHour);
  const minutes = Math.round((decimalHour - hours) * 60);
  const h = hours >= 24 ? hours - 24 : hours < 0 ? hours + 24 : hours;
  const hDisplay = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const ampm = hours >= 0 && hours < 12 ? 'AM' : 'PM';
  return `${hDisplay}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMAT DURATION WITH MINUTES AND SECONDS
// ─────────────────────────────────────────────────────────────────────────────
export function formatDurationDetailed(decimalHours) {
  if (decimalHours === null) return "N/A";
  const totalMinutes = decimalHours * 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = Math.round((totalMinutes - Math.floor(totalMinutes)) * 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE STATUS
// ─────────────────────────────────────────────────────────────────────────────
export const SUNRISE_SUNSET_STATUS = {
  version: "1.0.0",
  initialized: true,
  features: [
    "NOAA solar calculation algorithm",
    "Location-based sunrise/sunset",
    "Auto-detect user timezone",
    "12 known locations pre-configured",
    "Polar day/night detection",
    "Duration in minutes and seconds"
  ],
  note: "Sunrise/sunset engine ready — calculates based on actual location and date"
};