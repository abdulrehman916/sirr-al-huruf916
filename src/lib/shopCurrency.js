/**
 * Shop Currency System — Frontend-only
 * 
 * - Base price is always AED (stored in product.price_display).
 * - Converts displayed price to user's selected currency using live exchange rates.
 * - 24-hour rate caching in localStorage with offline fallback to static rates.
 * - Selected country persisted in localStorage for future sessions.
 * - Auto-detects country from browser locale/timezone on first launch.
 * - Does NOT modify stored prices, entities, backend, or routes.
 */

const STORAGE_KEY = "shop_currency_country";
const RATES_KEY = "shop_currency_rates";
const RATES_TS_KEY = "shop_currency_rates_ts";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const API_URL = "https://open.er-api.com/v6/latest/AED";

// ── Country → Currency Map (comprehensive, scalable) ──
export const COUNTRY_CURRENCY_MAP = {
  // Middle East
  AE: { currency: "AED", symbol: "د.إ", name: "United Arab Emirates" },
  SA: { currency: "SAR", symbol: "﷼", name: "Saudi Arabia" },
  QA: { currency: "QAR", symbol: "﷼", name: "Qatar" },
  KW: { currency: "KWD", symbol: "د.ك", name: "Kuwait" },
  BH: { currency: "BHD", symbol: ".د.ب", name: "Bahrain" },
  OM: { currency: "OMR", symbol: "﷼", name: "Oman" },
  JO: { currency: "JOD", symbol: "د.ا", name: "Jordan" },
  LB: { currency: "LBP", symbol: "ل.ل", name: "Lebanon" },
  IQ: { currency: "IQD", symbol: "ع.د", name: "Iraq" },
  EG: { currency: "EGP", symbol: "£", name: "Egypt" },
  TR: { currency: "TRY", symbol: "₺", name: "Turkey" },
  IR: { currency: "IRR", symbol: "﷼", name: "Iran" },
  IL: { currency: "ILS", symbol: "₪", name: "Israel" },
  YE: { currency: "YER", symbol: "﷼", name: "Yemen" },
  SY: { currency: "SYP", symbol: "£", name: "Syria" },
  PS: { currency: "ILS", symbol: "₪", name: "Palestine" },

  // South Asia
  IN: { currency: "INR", symbol: "₹", name: "India" },
  PK: { currency: "PKR", symbol: "₨", name: "Pakistan" },
  BD: { currency: "BDT", symbol: "৳", name: "Bangladesh" },
  LK: { currency: "LKR", symbol: "₨", name: "Sri Lanka" },
  NP: { currency: "NPR", symbol: "₨", name: "Nepal" },
  AF: { currency: "AFN", symbol: "؋", name: "Afghanistan" },
  MV: { currency: "MVR", symbol: "Rf", name: "Maldives" },

  // Southeast Asia
  ID: { currency: "IDR", symbol: "Rp", name: "Indonesia" },
  MY: { currency: "MYR", symbol: "RM", name: "Malaysia" },
  TH: { currency: "THB", symbol: "฿", name: "Thailand" },
  SG: { currency: "SGD", symbol: "S$", name: "Singapore" },
  PH: { currency: "PHP", symbol: "₱", name: "Philippines" },
  VN: { currency: "VND", symbol: "₫", name: "Vietnam" },
  MM: { currency: "MMK", symbol: "K", name: "Myanmar" },
  KH: { currency: "KHR", symbol: "៛", name: "Cambodia" },
  LA: { currency: "LAK", symbol: "₭", name: "Laos" },
  BN: { currency: "BND", symbol: "B$", name: "Brunei" },

  // East Asia
  CN: { currency: "CNY", symbol: "¥", name: "China" },
  JP: { currency: "JPY", symbol: "¥", name: "Japan" },
  KR: { currency: "KRW", symbol: "₩", name: "South Korea" },
  HK: { currency: "HKD", symbol: "HK$", name: "Hong Kong" },
  TW: { currency: "TWD", symbol: "NT$", name: "Taiwan" },
  MN: { currency: "MNT", symbol: "₮", name: "Mongolia" },

  // Americas
  US: { currency: "USD", symbol: "$", name: "United States" },
  CA: { currency: "CAD", symbol: "C$", name: "Canada" },
  MX: { currency: "MXN", symbol: "$", name: "Mexico" },
  BR: { currency: "BRL", symbol: "R$", name: "Brazil" },
  AR: { currency: "ARS", symbol: "$", name: "Argentina" },
  CO: { currency: "COP", symbol: "$", name: "Colombia" },
  CL: { currency: "CLP", symbol: "$", name: "Chile" },
  PE: { currency: "PEN", symbol: "S/", name: "Peru" },
  VE: { currency: "VES", symbol: "Bs", name: "Venezuela" },
  EC: { currency: "USD", symbol: "$", name: "Ecuador" },
  UY: { currency: "UYU", symbol: "$U", name: "Uruguay" },
  PY: { currency: "PYG", symbol: "₲", name: "Paraguay" },
  BO: { currency: "BOB", symbol: "Bs", name: "Bolivia" },
  CR: { currency: "CRC", symbol: "₡", name: "Costa Rica" },
  PA: { currency: "USD", symbol: "$", name: "Panama" },
  DO: { currency: "DOP", symbol: "RD$", name: "Dominican Republic" },
  GT: { currency: "GTQ", symbol: "Q", name: "Guatemala" },
  HN: { currency: "HNL", symbol: "L", name: "Honduras" },

  // Europe (Eurozone + others)
  GB: { currency: "GBP", symbol: "£", name: "United Kingdom" },
  DE: { currency: "EUR", symbol: "€", name: "Germany" },
  FR: { currency: "EUR", symbol: "€", name: "France" },
  IT: { currency: "EUR", symbol: "€", name: "Italy" },
  ES: { currency: "EUR", symbol: "€", name: "Spain" },
  NL: { currency: "EUR", symbol: "€", name: "Netherlands" },
  BE: { currency: "EUR", symbol: "€", name: "Belgium" },
  AT: { currency: "EUR", symbol: "€", name: "Austria" },
  PT: { currency: "EUR", symbol: "€", name: "Portugal" },
  IE: { currency: "EUR", symbol: "€", name: "Ireland" },
  GR: { currency: "EUR", symbol: "€", name: "Greece" },
  FI: { currency: "EUR", symbol: "€", name: "Finland" },
  LU: { currency: "EUR", symbol: "€", name: "Luxembourg" },
  SK: { currency: "EUR", symbol: "€", name: "Slovakia" },
  SI: { currency: "EUR", symbol: "€", name: "Slovenia" },
  EE: { currency: "EUR", symbol: "€", name: "Estonia" },
  LV: { currency: "EUR", symbol: "€", name: "Latvia" },
  LT: { currency: "EUR", symbol: "€", name: "Lithuania" },
  CY: { currency: "EUR", symbol: "€", name: "Cyprus" },
  MT: { currency: "EUR", symbol: "€", name: "Malta" },
  HR: { currency: "EUR", symbol: "€", name: "Croatia" },
  SE: { currency: "SEK", symbol: "kr", name: "Sweden" },
  NO: { currency: "NOK", symbol: "kr", name: "Norway" },
  DK: { currency: "DKK", symbol: "kr", name: "Denmark" },
  CH: { currency: "CHF", symbol: "Fr", name: "Switzerland" },
  PL: { currency: "PLN", symbol: "zł", name: "Poland" },
  CZ: { currency: "CZK", symbol: "Kč", name: "Czech Republic" },
  RO: { currency: "RON", symbol: "lei", name: "Romania" },
  HU: { currency: "HUF", symbol: "Ft", name: "Hungary" },
  BG: { currency: "BGN", symbol: "лв", name: "Bulgaria" },
  RU: { currency: "RUB", symbol: "₽", name: "Russia" },
  UA: { currency: "UAH", symbol: "₴", name: "Ukraine" },
  BY: { currency: "BYN", symbol: "Br", name: "Belarus" },
  RS: { currency: "RSD", symbol: "дин", name: "Serbia" },
  IS: { currency: "ISK", symbol: "kr", name: "Iceland" },

  // Africa
  ZA: { currency: "ZAR", symbol: "R", name: "South Africa" },
  NG: { currency: "NGN", symbol: "₦", name: "Nigeria" },
  KE: { currency: "KES", symbol: "KSh", name: "Kenya" },
  GH: { currency: "GHS", symbol: "₵", name: "Ghana" },
  ET: { currency: "ETB", symbol: "Br", name: "Ethiopia" },
  TZ: { currency: "TZS", symbol: "TSh", name: "Tanzania" },
  UG: { currency: "UGX", symbol: "USh", name: "Uganda" },
  MA: { currency: "MAD", symbol: "د.م.", name: "Morocco" },
  DZ: { currency: "DZD", symbol: "د.ج", name: "Algeria" },
  TN: { currency: "TND", symbol: "د.ت", name: "Tunisia" },
  SD: { currency: "SDG", symbol: "£", name: "Sudan" },
  RW: { currency: "RWF", symbol: "₣", name: "Rwanda" },
  SN: { currency: "XOF", symbol: "CFA", name: "Senegal" },
  CM: { currency: "XAF", symbol: "FCFA", name: "Cameroon" },
  CI: { currency: "XOF", symbol: "CFA", name: "Ivory Coast" },
  AO: { currency: "AOA", symbol: "Kz", name: "Angola" },
  MZ: { currency: "MZN", symbol: "MT", name: "Mozambique" },
  ZW: { currency: "ZWL", symbol: "Z$", name: "Zimbabwe" },
  LY: { currency: "LYD", symbol: "ل.د", name: "Libya" },
  MR: { currency: "MRU", symbol: "UM", name: "Mauritania" },

  // Oceania
  AU: { currency: "AUD", symbol: "A$", name: "Australia" },
  NZ: { currency: "NZD", symbol: "NZ$", name: "New Zealand" },
  FJ: { currency: "FJD", symbol: "FJ$", name: "Fiji" },
  PG: { currency: "PGK", symbol: "K", name: "Papua New Guinea" },
};

// ── Fallback Exchange Rates (AED base, approximate) ──
// Used when offline and no cached rates available. Overwritten by live rates.
export const FALLBACK_RATES = {
  AED: 1, USD: 0.2722, EUR: 0.2489, GBP: 0.2148, INR: 22.73,
  PKR: 75.85, BDT: 32.85, LKR: 89.5, NPR: 36.3, AFN: 19.2,
  SAR: 1.021, QAR: 0.991, KWD: 0.0837, BHD: 0.1024, OMR: 0.1047,
  JOD: 0.193, LBP: 24300, IQD: 355, EGP: 13.2, TRY: 9.32,
  IRR: 11450, ILS: 0.985, YER: 68, SYP: 3500, MVR: 4.19,
  IDR: 4220, MYR: 1.27, THB: 9.85, SGD: 0.367, PHP: 15.8,
  VND: 7000, MMK: 570, KHR: 1100, LAK: 5800, BND: 0.367,
  CNY: 1.97, JPY: 42.5, KRW: 376, HKD: 2.13, TWD: 8.75,
  MNT: 920, CAD: 0.372, MXN: 5.15, BRL: 1.52, ARS: 240,
  COP: 1100, CLP: 260, PEN: 1.02, VES: 15.5, UYU: 11.2,
  PYG: 2100, BOB: 1.88, CRC: 137, DOP: 16.5, GTQ: 2.1,
  HNL: 6.75, SEK: 2.85, NOK: 2.95, DKK: 1.85, CHF: 0.235,
  PLN: 1.08, CZK: 6.25, RON: 1.18, HUF: 98, BGN: 0.487,
  RUB: 24.8, UAH: 11.2, BYN: 0.89, RSD: 27.5, ISK: 38.5,
  ZAR: 5.05, NGN: 425, KES: 35.2, GHS: 4.25, ETB: 34,
  TZS: 720, UGX: 1040, MAD: 2.5, DZD: 36, TND: 0.84,
  SDG: 163, RWF: 355, XOF: 163, XAF: 163, AOA: 225,
  MZN: 17.5, ZWL: 98, LYD: 1.32, MRU: 10.8,
  AUD: 0.415, NZD: 0.455, FJD: 0.62, PGK: 1.08,
};

// Currencies with very large denominations — display without decimals
const ZERO_DECIMAL_THRESHOLD = 20; // if rate > 20, likely large denomination

// Timezone → Country mapping for auto-detection
const TZ_TO_COUNTRY = {
  "Asia/Dubai": "AE", "Asia/Riyadh": "SA", "Asia/Qatar": "QA",
  "Asia/Kuwait": "KW", "Asia/Bahrain": "BH", "Asia/Muscat": "OM",
  "Asia/Amman": "JO", "Asia/Beirut": "LB", "Asia/Baghdad": "IQ",
  "Africa/Cairo": "EG", "Europe/Istanbul": "TR", "Asia/Tehran": "IR",
  "Asia/Jerusalem": "IL", "Asia/Aden": "YE", "Asia/Damascus": "SY",
  "Asia/Kolkata": "IN", "Asia/Karachi": "PK", "Asia/Dhaka": "BD",
  "Asia/Colombo": "LK", "Asia/Kathmandu": "NP", "Asia/Kabul": "AF",
  "Asia/Jakarta": "ID", "Asia/Kuala_Lumpur": "MY", "Asia/Bangkok": "TH",
  "Asia/Singapore": "SG", "Asia/Manila": "PH", "Asia/Ho_Chi_Minh": "VN",
  "Asia/Shanghai": "CN", "Asia/Tokyo": "JP", "Asia/Seoul": "KR",
  "Asia/Hong_Kong": "HK", "Asia/Taipei": "TW",
  "America/New_York": "US", "America/Toronto": "CA", "America/Mexico_City": "MX",
  "America/Sao_Paulo": "BR", "America/Argentina/Buenos_Aires": "AR",
  "America/Bogota": "CO", "America/Santiago": "CL", "America/Lima": "PE",
  "Europe/London": "GB", "Europe/Berlin": "DE", "Europe/Paris": "FR",
  "Europe/Rome": "IT", "Europe/Madrid": "ES", "Europe/Amsterdam": "NL",
  "Europe/Brussels": "BE", "Europe/Vienna": "AT", "Europe/Lisbon": "PT",
  "Europe/Dublin": "IE", "Europe/Athens": "GR", "Europe/Helsinki": "FI",
  "Europe/Stockholm": "SE", "Europe/Oslo": "NO", "Europe/Copenhagen": "DK",
  "Europe/Zurich": "CH", "Europe/Warsaw": "PL", "Europe/Prague": "CZ",
  "Europe/Bucharest": "RO", "Europe/Budapest": "HU", "Europe/Sofia": "BG",
  "Europe/Moscow": "RU", "Europe/Kyiv": "UA", "Africa/Johannesburg": "ZA",
  "Africa/Lagos": "NG", "Africa/Nairobi": "KE", "Africa/Accra": "GH",
  "Africa/Addis_Ababa": "ET", "Africa/Casablanca": "MA", "Africa/Tunis": "TN",
  "Australia/Sydney": "AU", "Pacific/Auckland": "NZ", "Pacific/Fiji": "FJ",
};

// ── Module-level state (singleton pattern for cross-component sync) ──
let _country = null;
const _listeners = new Set();
let _ratesPromise = null;

// ── Country Selection ──
export function getSelectedCountry() {
  if (_country) return _country;
  try {
    _country = localStorage.getItem(STORAGE_KEY) || null;
  } catch { _country = null; }
  return _country;
}

export function setSelectedCountry(code) {
  _country = code;
  try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  _listeners.forEach(fn => fn(code));
}

export function subscribeCountry(fn) {
  _listeners.add(fn);
  return () => { _listeners.delete(fn); };
}

export function getCurrencyForCountry(countryCode) {
  return COUNTRY_CURRENCY_MAP[countryCode] || COUNTRY_CURRENCY_MAP["AE"];
}

export function getAllCountries() {
  return Object.entries(COUNTRY_CURRENCY_MAP)
    .map(([code, info]) => ({ code, ...info }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ── Auto-detection (first launch) ──
export function detectCountry() {
  // 1. Browser locale
  try {
    const locale = navigator.language || (navigator.languages && navigator.languages[0]) || "";
    const parts = locale.split(/[-_]/);
    if (parts.length >= 2) {
      const code = parts[1].toUpperCase();
      if (COUNTRY_CURRENCY_MAP[code]) return code;
    }
  } catch {}

  // 2. Timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TZ_TO_COUNTRY[tz] && COUNTRY_CURRENCY_MAP[TZ_TO_COUNTRY[tz]]) {
      return TZ_TO_COUNTRY[tz];
    }
  } catch {}

  // 3. Default
  return "AE";
}

export function initCountry() {
  const saved = getSelectedCountry();
  if (saved) return saved;
  const detected = detectCountry();
  setSelectedCountry(detected);
  return detected;
}

// ── Exchange Rate Caching ──
export function getCachedRates() {
  try {
    const rates = JSON.parse(localStorage.getItem(RATES_KEY) || "null");
    const ts = parseInt(localStorage.getItem(RATES_TS_KEY) || "0", 10);
    if (!rates || !ts) return null;
    const age = Date.now() - ts;
    if (age < CACHE_TTL_MS) {
      return { rates, timestamp: ts, source: "cache" };
    }
    // Stale cache — usable as offline fallback
    return { rates, timestamp: ts, source: "stale" };
  } catch {
    return null;
  }
}

export async function fetchExchangeRates() {
  // Deduplicate concurrent fetches
  if (_ratesPromise) return _ratesPromise;

  const cached = getCachedRates();

  // Fresh cache — no fetch needed
  if (cached && cached.source === "cache") {
    return cached;
  }

  _ratesPromise = (async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.result === "success" && data.rates) {
        try {
          localStorage.setItem(RATES_KEY, JSON.stringify(data.rates));
          localStorage.setItem(RATES_TS_KEY, String(Date.now()));
        } catch {}
        return { rates: data.rates, timestamp: Date.now(), source: "live" };
      }
      throw new Error("Invalid API response");
    } catch {
      // Offline / error — fall back to stale cache or static rates
      if (cached) return { rates: cached.rates, timestamp: cached.timestamp, source: "offline" };
      return { rates: FALLBACK_RATES, timestamp: 0, source: "fallback" };
    } finally {
      _ratesPromise = null;
    }
  })();

  return _ratesPromise;
}

// ── Conversion & Formatting ──
export function convertAED(aedAmount, targetCurrency, rates) {
  if (!aedAmount || isNaN(aedAmount) || !rates) return 0;
  const rate = rates[targetCurrency] || FALLBACK_RATES[targetCurrency] || 1;
  return aedAmount * rate;
}

export function formatPrice(aedAmount, targetCurrency, currencyInfo, rates) {
  if (!aedAmount || isNaN(aedAmount)) return null;
  const rate = (rates && (rates[targetCurrency] || FALLBACK_RATES[targetCurrency])) || 1;
  const converted = aedAmount * rate;
  const symbol = currencyInfo?.symbol || targetCurrency || "";
  const decimals = rate > ZERO_DECIMAL_THRESHOLD ? 0 : 2;
  const formatted = converted.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol} ${formatted}`;
}