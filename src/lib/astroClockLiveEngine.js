/**
 * ASTRO CLOCK LIVE ENGINE — Planetary Hour Calculations
 * Real-time planetary hour system with sunrise/sunset based calculations
 * Astro Clock module only — completely isolated
 * Arabic Terminology Preservation Rule: Implemented
 */

import { TAHA_HOUR_TABLE_DAY, TAHA_WEEKDAY_RULERS } from './astroClockTahaData.js';
import { PLANETARY_DAY_RULERS } from './astroClockData.js';
import { applyManuscriptPlanetOverrides, applyManuscriptWeekdayOverrides } from './manuscriptRuleEngine.js';

// ─────────────────────────────────────────────────────────────────────────────
// PLANET DATA — Combined from all sources with detailed actions
// ─────────────────────────────────────────────────────────────────────────────
export const PLANET_INFO = {
  sun: { 
    name_en: "Sun", 
    name_ar: "الشمس",
    name_en_transliteration: "Al-Shams",
    name_ml_reading: "അൽ-ശംസ്",
    name_ml_equivalent: "സൂര്യൻ", 
    symbol: "☉", 
    nature_ml: "ഗ്രഹങ്ങളുടെ രാജാവ്", 
    nature_en: "King of Planets",
    benefits_ml: ["നേതൃത്വം", "ഐശ്വര്യം", "ഉദ്യോഗ ഉന്നതി"],
    benefits_en: ["Leadership", "Wealth", "Career Success"],
    warnings_ml: ["തുലാം രാശിയിൽ ദുർബലൻ"],
    warnings_en: ["Weak in Libra"],
    goodActions_ml: ["സർക്കാർ ജോലി", "സ്വർണ്ണ വ്യാപാരം", "നേതൃത്വ പദവികൾ", "ആരോഗ്യ മെച്ചപ്പെടുത്തൽ"],
    goodActions_en: ["Government work", "Gold trading", "Leadership roles", "Health improvement"],
    badActions_ml: ["രഹസ്യ പ്രവർത്തനങ്ങൾ", "താഴ്മ കാണിക്കൽ"],
    badActions_en: ["Secret operations", "Showing humility"],
    spiritualOperations_ml: ["സൂര്യ ദേവതകളെ വിളിക്കുക", "ശക്തിക്കും വിജയത്തിനും പ്രാർത്ഥന"],
    spiritualOperations_en: ["Invoke Solar deities", "Prayers for power and success"],
    source: "Havâss'ın Derinlikleri, p.50"
  },
  moon: { 
    name_en: "Moon", 
    name_ar: "القمر",
    name_en_transliteration: "Al-Qamar",
    name_ml_reading: "അൽ-ഖമർ",
    name_ml_equivalent: "ചന്ദ്രൻ", 
    symbol: "☽", 
    nature_ml: "ഏറ്റവും ശക്തമായ ഗ്രഹം", 
    nature_en: "Most Influential Planet",
    benefits_ml: ["മാനസിക ശാന്തത", "ആരോഗ്യം", "ഗൃഹ ഐശ്വര്യം"],
    benefits_en: ["Mental Peace", "Health", "Domestic Harmony"],
    warnings_ml: ["വൃശ്ചികത്തിൽ നീചം (3°)"],
    warnings_en: ["Debilitated in Scorpio (3°)"],
    goodActions_ml: ["യാത്രകൾ", "ജല സംബന്ധിത കാര്യങ്ങൾ", "പ്രണയം", "മാനസിക ശാന്തത"],
    goodActions_en: ["Travel", "Water-related matters", "Romance", "Mental peace"],
    badActions_ml: ["യുദ്ധം", "കലഹം"],
    badActions_en: ["Warfare", "Conflict"],
    spiritualOperations_ml: ["ചന്ദ്ര ധ്യാനം", "മാനസിക സന്തുലിതാവസ്ഥയ്ക്ക്"],
    spiritualOperations_en: ["Moon meditation", "For emotional balance"],
    source: "Havâss'ın Derinlikleri, p.50"
  },
  mars: { 
    name_en: "Mars", 
    name_ar: "المريخ",
    name_en_transliteration: "Al-Mirrikh",
    name_ml_reading: "അൽ-മിർരീഖ്",
    name_ml_equivalent: "ചൊവ്വ", 
    symbol: "♂", 
    nature_ml: "ദ്രോഹ ഗ്രഹം", 
    nature_en: "Malefic Planet",
    benefits_ml: ["ധൈര്യം", "ശക്തി", "വിജയം"],
    benefits_en: ["Courage", "Strength", "Victory"],
    warnings_ml: ["ദാമ്പത്യ ക്ലേശം സാധ്യത"],
    warnings_en: ["May cause marital discord"],
    goodActions_ml: ["സൈനിക വിജയം", "ശത്രുക്കളെ നേരിടൽ", "ധൈര്യ പ്രവർത്തനങ്ങൾ"],
    goodActions_en: ["Military success", "Confronting enemies", "Courageous acts"],
    badActions_ml: ["വിവാഹം", "സമാധാന ചർച്ചകൾ"],
    badActions_en: ["Marriage", "Peaceful negotiations"],
    spiritualOperations_ml: ["ചൊവ്വ മന്ത്രങ്ങൾ", "ശക്തിക്കും സംരക്ഷണത്തിനും"],
    spiritualOperations_en: ["Mars mantras", "For strength and protection"],
    source: "Havâss'ın Derinlikleri, p.50"
  },
  mercury: { 
    name_en: "Mercury", 
    name_ar: "عطارد",
    name_en_transliteration: "Utarid",
    name_ml_reading: "ഉത്വാരിദ്",
    name_ml_equivalent: "ബുധൻ", 
    symbol: "☿", 
    nature_ml: "ഐശ്വര്യ ഗ്രഹം", 
    nature_en: "Planet of Wealth",
    benefits_ml: ["ജ്ഞാനം", "വ്യാപാരം", "ആശയ വ്യക്തത"],
    benefits_en: ["Knowledge", "Business", "Clear Communication"],
    warnings_ml: ["ദ്രോഹ ഗ്രഹത്തോടൊപ്പം ദ്രോഹ ഫലം"],
    warnings_en: ["Malefic when with malefic planets"],
    goodActions_ml: ["വ്യാപാരം", "എഴുത്ത്", "ആശയ വിനിമയം", "പഠനം"],
    goodActions_en: ["Business", "Writing", "Communication", "Learning"],
    badActions_ml: ["വഞ്ചന", "ചൂതാട്ടം"],
    badActions_en: ["Deception", "Gambling"],
    spiritualOperations_ml: ["ബുധ മന്ത്രങ്ങൾ", "ജ്ഞാനത്തിനും ബുദ്ധിക്കും"],
    spiritualOperations_en: ["Mercury mantras", "For knowledge and wisdom"],
    source: "Havâss'ın Derinlikleri, p.50"
  },
  jupiter: { 
    name_en: "Jupiter", 
    name_ar: "المشتري",
    name_en_transliteration: "Al-Mushtari",
    name_ml_reading: "അൽ-മുശ്തരീ",
    name_ml_equivalent: "ഗുരു", 
    symbol: "♃", 
    nature_ml: "ഏറ്റവും ശുഭ ഗ്രഹം", 
    nature_en: "Most Benefic Planet",
    benefits_ml: ["ആദ്ധ്യാത്മിക ഉന്നതി", "ഐശ്വര്യം", "ജ്ഞാനം"],
    benefits_en: ["Spiritual Growth", "Wealth", "Wisdom"],
    warnings_ml: [],
    warnings_en: [],
    goodActions_ml: ["വിദ്യാഭ്യാസം", "സാമ്പത്തിക ഇടപാടുകൾ", "ആദ്ധ്യാത്മിക പ്രവർത്തനങ്ങൾ", "വിവാഹം"],
    goodActions_en: ["Education", "Finance", "Spiritual work", "Marriage"],
    badActions_ml: ["അനീതി", "ദ്രോഹ പ്രവർത്തനങ്ങൾ"],
    badActions_en: ["Dishonesty", "Harmful activities"],
    spiritualOperations_ml: ["ഗുരു പ്രാർത്ഥനകൾ", "ജ്ഞാനത്തിനും ഐശ്വര്യത്തിനും"],
    spiritualOperations_en: ["Jupiter prayers", "For wisdom and prosperity"],
    source: "Havâss'ın Derinlikleri, p.51"
  },
  venus: { 
    name_en: "Venus", 
    name_ar: "الزهرة",
    name_en_transliteration: "Al-Zuhra",
    name_ml_reading: "അൽ-സുഹറ",
    name_ml_equivalent: "ശുക്രൻ", 
    symbol: "♀", 
    nature_ml: "പ്രേമ-ഭക്തി ഗ്രഹം", 
    nature_en: "Planet of Love",
    benefits_ml: ["പ്രണയം", "ആകർഷണം", "കലകൾ"],
    benefits_en: ["Love", "Attraction", "Arts"],
    warnings_ml: ["കന്നിയിൽ ദുർബലൻ"],
    warnings_en: ["Weak in Virgo"],
    goodActions_ml: ["പ്രണയം", "കലകൾ", "സൗന്ദര്യം", "വിനോദം", "വിവാഹം"],
    goodActions_en: ["Love", "Arts", "Beauty", "Entertainment", "Marriage"],
    badActions_ml: ["കലഹം", "കഠിനമായ സംസാരം"],
    badActions_en: ["Conflict", "Harsh speech"],
    spiritualOperations_ml: ["ശുക്ര മന്ത്രങ്ങൾ", "പ്രണയത്തിനും ആകർഷണത്തിനും"],
    spiritualOperations_en: ["Venus mantras", "For love and attraction"],
    source: "Havâss'ın Derinlikleri, p.51"
  },
  saturn: { 
    name_en: "Saturn", 
    name_ar: "زحل",
    name_en_transliteration: "Zuhal",
    name_ml_reading: "സുഹൽ",
    name_ml_equivalent: "ശനി", 
    symbol: "♄", 
    nature_ml: "മഹാ ദ്രോഹ ഗ്രഹം", 
    nature_en: "Greater Malefic",
    benefits_ml: ["ദ്രോഹ ദൂരീകരണം"],
    benefits_en: ["Obstacle Removal"],
    warnings_ml: ["ഒന്നാം, 4, 7, 10 ഭവനത്തിൽ ദ്രോഹ ഫലം"],
    warnings_en: ["Malefic in 1st, 4th, 7th, 10th houses"],
    goodActions_ml: ["ശിക്ഷണം", "ദീർഘകാല ആസൂത്രണം", "റിയൽ എസ്റ്റേറ്റ്"],
    goodActions_en: ["Discipline", "Long-term planning", "Real estate"],
    badActions_ml: ["പുതിയ സംരംഭങ്ങൾ", "പ്രണയം", "വിനോദം"],
    badActions_en: ["New ventures", "Romance", "Entertainment"],
    spiritualOperations_ml: ["ശനി മന്ത്രങ്ങൾ", "കർമ്മ ശുദ്ധീകരണത്തിന്"],
    spiritualOperations_en: ["Saturn mantras", "For karmic cleansing"],
    source: "Havâss'ın Derinlikleri, p.51"
  }
};

// ── MANUSCRIPT-ONLY INTERPRETATION (audit 2026-07-28, unified 2026-07-28) ──
// SINGLE shared manuscript interpretation layer: manuscriptRuleEngine.js.
// Both Astro Clock and Ritual Timing import the same overrides from there.
// No Western, no AI-generated, no generic astrology. Astronomical calculations
// below are unchanged.
applyManuscriptPlanetOverrides(PLANET_INFO);

// ─────────────────────────────────────────────────────────────────────────────
// DAY DATA
// ─────────────────────────────────────────────────────────────────────────────
export const DAY_INFO = {
  0: { // Sunday
    name_ml: "ഞായർ",
    name_en: "Sunday",
    ruler: "sun",
    benefits_ml: ["പണം", "പ്രതീക്ഷ", "നേതൃക്കളിൽ നിന്ന് അംഗീകാരം", "സൗഹൃദം", "ശാരീരിക ശക്തി"],
    benefits_en: ["Money", "Hope", "Favor from Leaders", "Friendship", "Physical Strength"],
    warnings_ml: ["അഹങ്കാരം ഒഴിവാക്കുക"],
    warnings_en: ["Avoid Arrogance"]
  },
  1: { // Monday
    name_ml: "തിങ്കൾ",
    name_en: "Monday",
    ruler: "moon",
    benefits_ml: ["യാത്രകൾ", "പ്രണയം", "ജല സംബന്ധിത കാര്യങ്ങൾ", "സ്വപ്നങ്ങൾ", "സഹജാവബോധം"],
    benefits_en: ["Travel", "Love", "Water-related Matters", "Dreams", "Intuition"],
    warnings_ml: []
  },
  2: { // Tuesday
    name_ml: "ചൊവ്വ",
    name_en: "Tuesday",
    ruler: "mars",
    benefits_ml: ["ധൈര്യം", "സൈനിക വിജയം", "ശത്രുക്കളെ നേരിടൽ"],
    benefits_en: ["Courage", "Military Success", "Confronting Enemies"],
    warnings_ml: ["പുതിയ കാര്യങ്ങൾ ആരംഭിക്കാൻ ഉചിതമല്ല"],
    warnings_en: ["Not suitable for new beginnings"]
  },
  3: { // Wednesday
    name_ml: "ബുധൻ",
    name_en: "Wednesday",
    ruler: "mercury",
    benefits_ml: ["ആശയ വിനിമയം", "വ്യാപാരം", "കലകൾ", "ശാസ്ത്രം"],
    benefits_en: ["Communication", "Business", "Arts", "Science"],
    warnings_ml: []
  },
  4: { // Thursday
    name_ml: "വ്യാഴം",
    name_en: "Thursday",
    ruler: "jupiter",
    benefits_ml: ["ഐശ്വര്യം", "സൗഹൃദം", "ആരോഗ്യം", "ജ്ഞാനം"],
    benefits_en: ["Wealth", "Friendship", "Health", "Knowledge"],
    warnings_ml: []
  },
  5: { // Friday
    name_ml: "വെള്ളി",
    name_en: "Friday",
    ruler: "venus",
    benefits_ml: ["പ്രണയം", "സൗഹൃദം", "യാത്ര", "വിനോദം"],
    benefits_en: ["Love", "Friendship", "Travel", "Entertainment"],
    warnings_ml: []
  },
  6: { // Saturday
    name_ml: "ശനി",
    name_en: "Saturday",
    ruler: "saturn",
    benefits_ml: ["ആദ്ധ്യാത്മിക കൃത്യങ്ങൾ", "സ്ഥിരത", "ദീർഘകാല ആസൂത്രണം"],
    benefits_en: ["Spiritual Work", "Stability", "Long-term Planning"],
    warnings_ml: ["പുതിയ സംരംഭങ്ങൾ ഒഴിവാക്കുക"],
    warnings_en: ["Avoid New Ventures"]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PLANETARY HOUR SEQUENCE (Chaldean Order)
// ─────────────────────────────────────────────────────────────────────────────
export const PLANET_SEQUENCE = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'];

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE WEEKDAY RESOLVER — Manuscript day-boundary rule (SINGLE SOURCE OF TRUTH)
// ─────────────────────────────────────────────────────────────────────────────
// Source: Kashf al-Haqa'iq li-man jahala al-Tara'iq (Omani manuscript), p.65:
//   "الحساب للأيام يكون المراد به الليلة السابقة له والنهار التالي"
//   The planetary day = the PRECEDING night + the FOLLOWING daytime.
//   "فلو أردنا يوم الجمعة ... نقصد به يوم الخميس مساءً (ليلة الجمعة)"
//   Friday = Thursday evening (night of Friday) + Friday daytime.
//
// Therefore the active weekday changes at SUNSET, not civil midnight.
// After today's sunset the active weekday is the following civil weekday.
// Between midnight and sunrise the night continues and the civil weekday
// already matches the active manuscript day.
//
// This is the SINGLE source of truth for the active planetary weekday.
// Every module that needs "today's" weekday must call this function —
// do NOT call date.getDay() directly for the active planetary day.
export function getActiveWeekday(date, sunrise, sunset) {
  const currentHour = date.getHours() + date.getMinutes() / 60;
  return currentHour >= sunset
    ? (date.getDay() + 1) % 7
    : date.getDay();
}

// ─────────────────────────────────────────────────────────────────────────────
// GET PLANETARY HOUR FOR CURRENT TIME
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Calculate current planetary hour
 * @param {Date} date - Current date/time
 * @param {number} sunrise - Sunrise hour (e.g., 6.5 for 6:30 AM)
 * @param {number} sunset - Sunset hour (e.g., 18.25 for 6:15 PM)
 * @returns {Object} Current hour info
 */
export function getCurrentPlanetaryHour(date, sunrise = 6.5, sunset = 18.25) {
  const currentHour = date.getHours() + date.getMinutes() / 60;
  const dayOfWeek = getActiveWeekday(date, sunrise, sunset);
  
  const dayDuration = sunset - sunrise;
  const nightDuration = 24 - dayDuration;
  
  const dayHourDuration = dayDuration / 12;
  const nightHourDuration = nightDuration / 12;
  
  const isDay = currentHour >= sunrise && currentHour < sunset;
  
  let hourIndex;
  let hourDuration;
  let hourStart;
  let hourEnd;
  
  if (isDay) {
    hourIndex = Math.floor((currentHour - sunrise) / dayHourDuration);
    hourDuration = dayHourDuration;
    hourStart = sunrise + hourIndex * dayHourDuration;
    hourEnd = hourStart + dayHourDuration;
  } else {
    let nightStart = sunset;
    if (currentHour < sunrise) {
      nightStart = sunset - 24;
    }
    hourIndex = Math.floor((currentHour - nightStart) / nightHourDuration);
    hourDuration = nightHourDuration;
    hourStart = nightStart + hourIndex * nightHourDuration;
    hourEnd = hourStart + nightHourDuration;
    
    if (hourIndex < 0) hourIndex += 12;
    if (hourIndex >= 12) hourIndex -= 12;
  }
  
  const dayRuler = getDayRuler(dayOfWeek);
  
  // Manuscript Night offset (GECE SAATLERİ TABLOSU): Night Saat 1 = Day Saat 1
  // shifted +2 in the Chaldean sequence (e.g. Sunday Day Saat 1 = Sun, Sunday
  // Night Saat 1 = Mercury). Day hours use no offset.
  const nightOffset = isDay ? 0 : 2;
  const planetIndex = (dayRuler.index + nightOffset + hourIndex) % 7;
  const planet = PLANET_SEQUENCE[planetIndex];
  
  const remainingMinutes = (hourEnd - currentHour) * 60;
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMins = Math.floor(remainingMinutes % 60);
  
  return {
    hourNumber: hourIndex + 1,
    planet,
    planetInfo: PLANET_INFO[planet],
    isDay,
    hourStart: formatTime(hourStart),
    hourEnd: formatTime(hourEnd),
    duration: formatDuration(hourDuration),
    durationMinutes: Math.round(hourDuration * 60),
    remainingTime: `${remainingHours}h ${remainingMins}m`,
    dayRuler: PLANET_SEQUENCE[dayRuler.index],
    dayOfWeek,
    nextPlanet: PLANET_SEQUENCE[(planetIndex + 1) % 7]
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET DAY RULER
// ─────────────────────────────────────────────────────────────────────────────
export function getDayRuler(dayOfWeek) {
  const rulers = {
    0: { planet: 'sun', index: 3 },      // Sunday
    1: { planet: 'moon', index: 6 },     // Monday
    2: { planet: 'mars', index: 2 },     // Tuesday
    3: { planet: 'mercury', index: 5 },  // Wednesday
    4: { planet: 'jupiter', index: 1 },  // Thursday
    5: { planet: 'venus', index: 4 },    // Friday
    6: { planet: 'saturn', index: 0 }    // Saturday
  };
  return rulers[dayOfWeek];
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMAT TIME
// ─────────────────────────────────────────────────────────────────────────────
function formatTime(decimalHour) {
  const hours = Math.floor(decimalHour);
  const minutes = Math.round((decimalHour - hours) * 60);
  const h = hours >= 24 ? hours - 24 : hours;
  const hDisplay = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const ampm = hours >= 12 && hours < 24 ? 'PM' : 'AM';
  return `${hDisplay}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMAT DURATION
// ─────────────────────────────────────────────────────────────────────────────
function formatDuration(decimalHours) {
  const minutes = Math.round(decimalHours * 60);
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMAT COUNTDOWN (for time remaining/until start)
// ─────────────────────────────────────────────────────────────────────────────
function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL 24 HOURS FOR A DAY
// ─────────────────────────────────────────────────────────────────────────────
export function getAllPlanetaryHours(date, sunrise = 6.5, sunset = 18.25) {
  // Use date (location timezone) — never new Date() (browser timezone).
  // This ensures current time matches the sunrise/sunset values.
  const currentHours = date.getHours() + date.getMinutes() / 60;
  const isBeforeSunrise = currentHours < sunrise;
  const isAfterSunset = currentHours >= sunset;
  const isNighttime = isBeforeSunrise || isAfterSunset;
  const isDaytime = !isNighttime;

  const dayOfWeek = date.getDay();
  // ── Manuscript weekday rule (Havâss p.51/54, Kashf p.65) ──
  // Daytime begins at sunrise; the night after a sunset belongs to the FOLLOWING
  // day (laylat al-<next>). Three viewing windows:
  //   • Daytime  [sunrise → sunset]:  Day Hours = today (current/upcoming).
  //                                  Night Hours = tomorrow's night (upcoming).
  //   • After sunset [sunset → midnight]: Day Hours = today (just completed).
  //                                      Night Hours = tomorrow's night (current).
  //   • Before sunrise [midnight → sunrise]: Day Hours = PREVIOUS day (completed
  //     daytime — the daylight that just ended belongs to yesterday, not today).
  //     Night Hours = TODAY's night (current — laylat al-<today>, the night that
  //     began at the previous sunset and is still in progress).
  // This keeps the completed daytime attributed to the day that actually owned it
  // and prevents the next weekday's daytime from appearing "completed" before its
  // sunrise (Havâss p.51: each day's first hour begins at sunrise).
  const dayRuler = getDayRuler(isBeforeSunrise ? (dayOfWeek - 1 + 7) % 7 : dayOfWeek);
  const nightDayRuler = getDayRuler(isBeforeSunrise ? dayOfWeek : (dayOfWeek + 1) % 7);
  
  const dayDuration = sunset - sunrise;
  const nightDuration = 24 - dayDuration;
  const dayHourDuration = dayDuration / 12;
  const nightHourDuration = nightDuration / 12;
  
  const hours = [];
  
  // Day hours (1-12)
  for (let i = 0; i < 12; i++) {
    const planetIndex = (dayRuler.index + i) % 7;
    const planet = PLANET_SEQUENCE[planetIndex];
    const start = sunrise + i * dayHourDuration;
    const end = start + dayHourDuration;
    
    // Calculate countdown for each hour
    const startMs = start * 60 * 60 * 1000;
    const endMs = end * 60 * 60 * 1000;
    const nowMs = currentHours * 60 * 60 * 1000;
    let timeRemaining = null;
    let timeUntilStart = null;
    let status = 'upcoming';
    
    if (isNighttime) {
      // Nighttime: ALL Day Sahaths are COMPLETED — the previous daylight period
      // is finished. They stay expandable and clickable (status only affects styling).
      status = 'past';
    } else if (nowMs >= startMs && nowMs < endMs) {
      // Current hour
      timeRemaining = formatCountdown(endMs - nowMs);
      status = 'current';
    } else if (nowMs < startMs) {
      // Upcoming hour
      timeUntilStart = formatCountdown(startMs - nowMs);
    } else {
      // Past hour
      status = 'past';
    }
    
    hours.push({
      hourNumber: i + 1,
      period: 'day',
      planet,
      planetInfo: PLANET_INFO[planet],
      startTime: formatTime(start),
      endTime: formatTime(end),
      startTimeDecimal: start,
      endTimeDecimal: end,
      duration: formatDuration(dayHourDuration),
      durationMinutes: Math.round(dayHourDuration * 60),
      durationSeconds: Math.round((dayHourDuration * 60 - Math.floor(dayHourDuration * 60)) * 60),
      timeRemaining,
      timeUntilStart,
      status,
      goodActions: PLANET_INFO[planet]?.goodActions_en || [],
      badActions: PLANET_INFO[planet]?.badActions_en || [],
      spiritualOperations: PLANET_INFO[planet]?.spiritualOperations_en || [],
      source: PLANET_INFO[planet]?.source || "Traditional sources"
    });
  }
  
  // ══ NIGHT HOURS (13-24) — SUNRISE/SUNSET BOUNDARY ONLY ══
  // Night Sahaths span from sunset through midnight to the next sunrise.
  // Crossing midnight must NOT reset or complete remaining night Sahaths.
  // The ONLY valid Day/Night transition is: Sunrise → Day, Sunset → Night.
  // Calendar date change at 12:00 AM has NO effect on Sahath status.
  //
  // METHOD: Use UNADJUSTED start/end times (may be >= 24) for chronological comparison.
  // When current time is before sunrise (after midnight, in the previous day's night),
  // nightCurrentHours = currentHours + 24 for correct comparison across midnight.
  //
  // Status rules (per Sahath, compared individually):
  //   nightNow < start       → Upcoming
  //   start ≤ nightNow < end → Active
  //   nightNow ≥ end         → Completed
  //
  // Night ruler: isBeforeSunrise ? current day : next day (defined above as nightDayRuler).
  // Night Saat 1 = nightDayRuler + 2 (Chaldean offset). Night hour 13 = Night Saat 1.
  const firstNightPlanetIndex = (nightDayRuler.index + 2) % 7;

  // MIDNIGHT CROSSING: If current time is before sunrise, we're in the night
  // that started at the PREVIOUS day's sunset. Shift current time +24 for
  // chronological comparison against night hour intervals that start at sunset
  // (e.g., 19.2) and extend past midnight (e.g., up to 30.5 = next sunrise).
  // This uses ONLY the sunrise boundary — never calendar date or midnight.
  const nightCurrentHours = isBeforeSunrise ? currentHours + 24 : currentHours;

  for (let i = 0; i < 12; i++) {
    const planetIndex = (firstNightPlanetIndex + i) % 7;
    const planet = PLANET_SEQUENCE[planetIndex];
    const start = sunset + i * nightHourDuration;
    const end = start + nightHourDuration;
    
    // For DISPLAY: adjust times to 0-24 range
    const startAdjusted = start >= 24 ? start - 24 : start;
    const endAdjusted = end >= 24 ? end - 24 : end;

    // For COMPARISON: use UNADJUSTED start/end (may be >= 24) with night-aware
    // current time. This correctly handles hours that cross midnight (start < 24,
    // end >= 24) — the unadjusted end is chronologically after the unadjusted start.
    const startMs = start * 60 * 60 * 1000;
    const endMs = end * 60 * 60 * 1000;
    const nightNowMs = nightCurrentHours * 60 * 60 * 1000;
    let timeRemaining = null;
    let timeUntilStart = null;
    let status = 'upcoming';

    if (isDaytime) {
      // Daytime: ALL Night Sahaths are COMPLETED — the previous night is finished.
      // They stay expandable and clickable (status only affects styling).
      status = 'past';
    } else if (nightNowMs >= startMs && nightNowMs < endMs) {
      // Active — current time is between start and end
      timeRemaining = formatCountdown(endMs - nightNowMs);
      status = 'current';
    } else if (nightNowMs < startMs) {
      // Upcoming — current time is before start
      timeUntilStart = formatCountdown(startMs - nightNowMs);
    } else {
      // Completed — current time is after end
      status = 'past';
    }
    
    hours.push({
      hourNumber: i + 13,
      period: 'night',
      planet,
      planetInfo: PLANET_INFO[planet],
      startTime: formatTime(startAdjusted),
      endTime: formatTime(endAdjusted),
      startTimeDecimal: startAdjusted,
      endTimeDecimal: endAdjusted,
      duration: formatDuration(nightHourDuration),
      durationMinutes: Math.round(nightHourDuration * 60),
      durationSeconds: Math.round((nightHourDuration * 60 - Math.floor(nightHourDuration * 60)) * 60),
      timeRemaining,
      timeUntilStart,
      status,
      goodActions: PLANET_INFO[planet]?.goodActions_en || [],
      badActions: PLANET_INFO[planet]?.badActions_en || [],
      spiritualOperations: PLANET_INFO[planet]?.spiritualOperations_en || [],
      source: PLANET_INFO[planet]?.source || "Traditional sources"
    });
  }
  
  return hours;
}

// ─────────────────────────────────────────────────────────────────────────────
// WEEKDAY ANALYSIS — For DayAnalysisPanel Component
// ─────────────────────────────────────────────────────────────────────────────
export const WEEKDAY_ANALYSIS = {
  0: { // Sunday
    friendlyDays: ["Thursday", "Tuesday", "Saturday"],
    enemyDays: ["Monday", "Friday"],
    business: "Favorable for leadership roles, government work, gold trading",
    love: "Good for proposals",
    marriage: "Moderate - ensure Moon is strong",
    travel: "Excellent for long journeys",
    healing: "Good for vitality treatments",
    goodWorks: ["Leadership", "Career advancement", "Gold business", "Government work"],
    badWorks: ["Humility", "Secret operations"],
    spiritual: "Invoke Solar deities for power and success",
    source: "Havâss'ın Derinlikleri, p.50",
    malayalam: "ഞായറാഴ്ച സൂര്യൻ ഭരിക്കുന്നു. നേതൃത്വം, ഐശ്വര്യം, ഉദ്യോഗ ഉന്നതി എന്നിവയ്ക്ക് ഉത്തമം."
  },
  1: { // Monday
    friendlyDays: ["Wednesday", "Friday", "Sunday"],
    enemyDays: ["Saturday"],
    business: "Good for water-related business, shipping, travel agencies",
    love: "Excellent for romance and emotional connections",
    marriage: "Very favorable",
    travel: "Excellent, especially by water",
    healing: "Good for mental health and fluid balance",
    goodWorks: ["Travel", "Romance", "Water business", "Intuitive work"],
    badWorks: ["Confrontation", "Aggressive actions"],
    spiritual: "Moon meditation for emotional balance",
    source: "Havâss'ın Derinlikleri, p.50",
    malayalam: "തിങ്കളാഴ്ച ചന്ദ്രൻ ഭരിക്കുന്നു. യാത്രകൾ, പ്രണയം, ജല സംബന്ധിത കാര്യങ്ങൾക്ക് ഉത്തമം."
  },
  2: { // Tuesday
    friendlyDays: ["Sunday", "Thursday", "Saturday"],
    enemyDays: ["Monday", "Wednesday"],
    business: "Good for metal work, military contracts, sports",
    love: "Passionate but may cause conflicts",
    marriage: "Not recommended",
    travel: "Avoid unless urgent",
    healing: "Good for surgery and blood-related treatments",
    goodWorks: ["Courage", "Sports", "Military work", "Overcoming enemies"],
    badWorks: ["Marriage", "Peaceful negotiations"],
    spiritual: "Mars mantras for strength and protection",
    source: "Havâss'ın Derinlikleri, p.50",
    malayalam: "ചൊവ്വാഴ്ച ചൊവ്വ ഭരിക്കുന്നു. ധൈര്യം, ശക്തി, ശത്രുക്കളെ നേരിടൽ എന്നിവയ്ക്ക് ഉത്തമം."
  },
  3: { // Wednesday
    friendlyDays: ["Monday", "Friday", "Sunday"],
    enemyDays: ["Tuesday", "Thursday"],
    business: "Excellent for communication, writing, commerce",
    love: "Good for intellectual connections",
    marriage: "Favorable",
    travel: "Good for short trips and business travel",
    healing: "Good for nervous system and respiratory issues",
    goodWorks: ["Business", "Writing", "Communication", "Learning"],
    badWorks: ["Deception", "Gambling"],
    spiritual: "Mercury mantras for knowledge and wisdom",
    source: "Havâss'ın Derinlikleri, p.50",
    malayalam: "ബുധനാഴ്ച ബുധൻ ഭരിക്കുന്നു. വ്യാപാരം, ആശയ വിനിമയം, കലകൾ എന്നിവയ്ക്ക് ഉത്തമം."
  },
  4: { // Thursday
    friendlyDays: ["Sunday", "Tuesday", "Saturday"],
    enemyDays: ["Wednesday"],
    business: "Excellent for finance, teaching, religious work",
    love: "Favorable for serious relationships",
    marriage: "Very favorable",
    travel: "Excellent for pilgrimage and educational trips",
    healing: "Good for liver and metabolic issues",
    goodWorks: ["Education", "Finance", "Spiritual work", "Marriage"],
    badWorks: ["Dishonesty", "Harmful activities"],
    spiritual: "Jupiter prayers for wisdom and prosperity",
    source: "Havâss'ın Derinlikleri, p.51",
    malayalam: "വ്യാഴാഴ്ച ഗുരു ഭരിക്കുന്നു. ഐശ്വര്യം, ജ്ഞാനം, ആദ്ധ്യാത്മിക ഉന്നതി എന്നിവയ്ക്ക് ഉത്തമം."
  },
  5: { // Friday
    friendlyDays: ["Monday", "Wednesday", "Saturday"],
    enemyDays: ["Sunday"],
    business: "Excellent for arts, beauty, entertainment, luxury goods",
    love: "Most favorable day for love and romance",
    marriage: "Highly favorable",
    travel: "Good for pleasure trips",
    healing: "Good for reproductive and kidney issues",
    goodWorks: ["Love", "Arts", "Beauty", "Entertainment", "Marriage"],
    badWorks: ["Conflict", "Harsh speech"],
    spiritual: "Venus mantras for love and attraction",
    source: "Havâss'ın Derinlikleri, p.51",
    malayalam: "വെള്ളിയാഴ്ച ശുക്രൻ ഭരിക്കുന്നു. പ്രണയം, കലകൾ, ആകർഷണം എന്നിവയ്ക്ക് ഉത്തമം."
  },
  6: { // Saturday
    friendlyDays: ["Sunday", "Tuesday", "Thursday"],
    enemyDays: ["Monday", "Friday"],
    business: "Good for real estate, mining, long-term investments",
    love: "Not favorable for romance",
    marriage: "Not recommended",
    travel: "Avoid unless necessary",
    healing: "Good for chronic conditions and bone issues",
    goodWorks: ["Discipline", "Long-term planning", "Real estate"],
    badWorks: ["New ventures", "Romance", "Entertainment"],
    spiritual: "Saturn mantras for karmic cleansing",
    source: "Havâss'ın Derinlikleri, p.51",
    malayalam: "ശനിയാഴ്ച ശനി ഭരിക്കുന്നു. ദീർഘകാല ആസൂത്രണം, സ്ഥിരത എന്നിവയ്ക്ക് ഉത്തമം."
  }
};

// ── MANUSCRIPT-ONLY WEEKDAY OVERRIDE (unified 2026-07-28) ──
// SINGLE shared manuscript interpretation layer: manuscriptRuleEngine.js.
applyManuscriptWeekdayOverrides(WEEKDAY_ANALYSIS);

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE STATUS
// ─────────────────────────────────────────────────────────────────────────────
export const ASTRO_CLOCK_LIVE_ENGINE_STATUS = {
  version: "1.1.0",
  initialized: true,
  features: [
    "Real-time planetary hour calculation",
    "Sunrise/sunset based hour duration",
    "Day/Night hour sequence",
    "Malayalam & English support",
    "24-hour display (12 day + 12 night)",
    "Arabic Terminology Preservation"
  ],
  note: "Live engine ready — calculates planetary hours based on actual sunrise/sunset times"
};