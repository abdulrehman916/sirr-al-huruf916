// ═══════════════════════════════════════════════════════════════
// RITUAL DECISION ENGINE V2 — READ-ONLY EXPERT ANALYSIS LAYER
// ═══════════════════════════════════════════════════════════════
// PRIORITY ORDER (5-tier merge):
//   1. Existing Sirr al-Huruf project rules
//   2. Previously imported Astrology Clock manuscripts (Havâss'ın Derinlikleri, Ustad Taha)
//   3. Newly imported PDF: "الشروط" (Al-Shurut — The Conditions) pages 8–50
//   4. Current Mizan selections and calculated results
//   5. Live Astrology Clock data (current day, planetary hour, moon phase)
//
// This module is READ-ONLY. It NEVER modifies Mizan calculations or Astro Clock logic.
// It reads existing Mizan state + live time and produces a COMPLETE DECISION REPORT.
//
// The engine FIRST fully understands the ritual (Khayr/Sharr, purpose, category)
// from the existing Mizan selections — the user never enters this again.
// ═══════════════════════════════════════════════════════════════

import { getCurrentPlanetaryHour, getDayRuler, getActiveWeekday, PLANET_SEQUENCE, PLANET_INFO, getAllPlanetaryHours } from './astroClockLiveEngine.js';
import { calculateSunriseSunset, getUserLocation } from './astroClockSunriseSunset.js';
import { calculateMoonPosition } from './astroClockMoonPosition.js';
import { ACTION_RULES } from './astroClockActionTimingAdvisor.js';
import { BENEFIC_PLANETS, MALEFIC_PLANETS } from './manuscriptRuleEngine.js';

// ── Mizan key → English planet name (used by live engine) ──
const MIZAN_TO_EN_PLANET = {
  zuhal: 'Saturn', mustari: 'Jupiter', merih: 'Mars', sems: 'Sun',
  zuhre: 'Venus', utarid: 'Mercury', kamer: 'Moon',
};

const MIZAN_DAY_TO_INDEX = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

const MIZAN_DAY_NAMES = {
  sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
  thu: 'Thursday', fri: 'Friday', sat: 'Saturday',
};

// ═══════════════════════════════════════════════════════════════
// SOURCE 3: PDF "الشروط" (Al-Shurut) — Purpose × Day × Hour Table
// ═══════════════════════════════════════════════════════════════
const PDF_PURPOSE_TABLE = {
  celb: { pdfName: 'Mahabbah (محبة)', bestDay: 'fri', bestHour: 'Venus', altDay: 'tue', altHour: 'Venus', description: 'Love and attraction to a specific person', source: 'Al-Shurut p.12', isNightRequired: true, category: 'Love & Attraction' },
  tard: { pdfName: 'Firqa (فرقة)', bestDay: 'tue', bestHour: 'Saturn', description: 'Separation, hatred, driving away an enemy', source: 'Al-Shurut p.12', isNightRequired: true, category: 'Separation & Banishment' },
  sihhat: { pdfName: 'Sihhat (صحة)', bestDay: 'mon', bestHour: 'Moon', altDay: 'thu', altHour: 'Jupiter', description: 'Healing, health, and recovery', source: 'Al-Shurut p.12 + Havâss p.50-51', isNightRequired: false, category: 'Healing & Health' },
  sekam: { pdfName: 'Taslit al-Dam / Hariq', bestDay: 'tue', bestHour: 'Mars', description: 'Causing harm, injury, or destruction (dark works)', source: 'Al-Shurut p.12', isNightRequired: true, category: 'Harm & Destruction' },
  tarfet: { pdfName: 'Kaff al-Adha (كف الضرر)', bestDay: 'fri', bestHour: 'Saturn', description: 'Stopping harm, protection, walking safely', source: 'Al-Shurut p.12', isNightRequired: false, category: 'Protection & Safety' },
};

// ── Custom purpose keyword → PDF purpose rule ──
const CUSTOM_PURPOSE_KEYWORDS = [
  { keywords: ['love', 'محبة', 'حب', 'attraction', 'جلب', 'محب', 'عشق'], rule: 'celb' },
  { keywords: ['separation', 'فرقة', 'divorce', 'طلاق', 'banish', 'طرد', 'فراق'], rule: 'tard' },
  { keywords: ['healing', 'شفاء', 'صحة', 'health', 'علاج', 'medicine'], rule: 'sihhat' },
  { keywords: ['harm', 'ضرر', 'injury', 'أذى', 'destruction', 'هلاك'], rule: 'sekam' },
  { keywords: ['protection', 'حماية', 'evil eye', 'عين', 'طرفة', 'safety', 'أمان'], rule: 'tarfet' },
  { keywords: ['awe', 'هيبة', 'reverence', 'جلال', 'تعظيم'], rule: 'ijlal', custom: { pdfName: 'Ijlal (جلال)', bestDay: 'thu', bestHour: 'Mercury', source: 'Al-Shurut p.12', isNightRequired: false, category: 'Awe & Reverence' } },
  { keywords: ['binding', 'عقد', 'tie', 'ربط'], rule: 'aqd', custom: { pdfName: 'Aqd (عقد)', bestDay: 'wed', bestHour: 'Saturn', source: 'Al-Shurut p.12', isNightRequired: true, category: 'Binding & Restraint' } },
  { keywords: ['wealth', 'رزق', 'money', 'مال', 'livelihood', 'provision', 'sustenance'], rule: 'rizq', custom: { pdfName: 'Jalb al-Rizq (جلب الرزق)', bestDay: 'tue', bestHour: 'Jupiter', source: 'Al-Shurut p.13', isNightRequired: false, category: 'Wealth & Provision' } },
  { keywords: ['war', 'حرب', 'strife', 'فتنة', 'conflict', 'نزاع'], rule: 'harb', custom: { pdfName: 'Iqa Harb (إيقاع حرب)', bestDay: 'tue', bestHour: 'Mercury', source: 'Al-Shurut p.12', isNightRequired: true, category: 'Conflict & Strife' } },
  { keywords: ['agitation', 'تهييج', 'stir', 'إثارة'], rule: 'tahyij', custom: { pdfName: 'Tahyij (تهييج)', bestDay: 'fri', bestHour: 'Mars', source: 'Al-Shurut p.12', isNightRequired: true, category: 'Agitation & Passion' } },
  { keywords: ['fire', 'حريق', 'burn'], rule: 'hariq', custom: { pdfName: 'Hariq (حريق)', bestDay: 'tue', bestHour: 'Mars', source: 'Al-Shurut p.12', isNightRequired: true, category: 'Destruction & Fire' } },
  { keywords: ['authority', 'سلطان', 'ruler', 'حاكم', 'king', 'ملك', 'official'], rule: 'sultan', custom: { pdfName: 'Need with Authority', bestDay: 'sun', bestHour: 'Sun', source: 'Al-Shurut p.12', isNightRequired: false, category: 'Authority & Power' } },
  { keywords: ['fear', 'خوف', 'haybah', 'هيبة'], rule: 'haybah', custom: { pdfName: 'Haybah (هيبة)', bestDay: 'tue', bestHour: 'Sun', source: 'Al-Shurut p.12', isNightRequired: false, category: 'Awe & Fear' } },
  { keywords: ['scatter', 'تشتيت', 'destabilize'], rule: 'tashtit', custom: { pdfName: 'Tashtit (تشتيت)', bestDay: 'wed', bestHour: 'Saturn', source: 'Al-Shurut p.13', isNightRequired: true, category: 'Scattering & Dispersion' } },
  { keywords: ['knowledge', 'علم', 'wisdom', 'حكمة', 'learning', 'study'], rule: 'knowledge', custom: { pdfName: 'Ilm (علم)', bestDay: 'wed', bestHour: 'Mercury', source: 'Havâss p.51 (Mercury)', isNightRequired: false, category: 'Knowledge & Learning' } },
  { keywords: ['travel', 'سفر', 'journey', 'رحلة'], rule: 'travel', custom: { pdfName: 'Safar (سفر)', bestDay: 'mon', bestHour: 'Moon', source: 'Havâss p.50 (Moon)', isNightRequired: false, category: 'Travel & Journeys' } },
  { keywords: ['success', 'نجاح', 'victory', 'فوز', 'triumph'], rule: 'success', custom: { pdfName: 'Najah (نجاح)', bestDay: 'sun', bestHour: 'Sun', source: 'Havâss p.50 (Sun)', isNightRequired: false, category: 'Success & Victory' } },
  { keywords: ['marriage', 'زواج', 'nikah', 'نكاح', 'wedding'], rule: 'marriage', custom: { pdfName: 'Zawaj (زواج)', bestDay: 'fri', bestHour: 'Venus', source: 'Havâss p.51 (Venus)', isNightRequired: false, category: 'Marriage & Union' } },
];

// ═══════════════════════════════════════════════════════════════
// ELEMENT DIRECTION & PLACEMENT (Al-Shurut p.37, 42)
// ═══════════════════════════════════════════════════════════════
const ELEMENT_DIRECTION = {
  fire: { dir: 'East (المشرق)', ar: 'المشرق', source: 'Al-Shurut p.42' },
  water: { dir: 'West (المغرب)', ar: 'المغرب', source: 'Al-Shurut p.42' },
  air: { dir: 'North (الشمال)', ar: 'الشمال', source: 'Al-Shurut p.42' },
  earth: { dir: 'South (الجنوب)', ar: 'الجنوب', source: 'Al-Shurut p.42' },
};

const ELEMENT_PLACEMENT = {
  fire: { placement: 'Near an open flame', ar: 'قرب النار', source: 'Al-Shurut p.37' },
  earth: { placement: 'Buried in the ground, away from foot traffic', ar: 'مدفون في التراب', source: 'Al-Shurut p.37' },
  air: { placement: 'Where wind blows freely', ar: 'في مهب الريح', source: 'Al-Shurut p.37' },
  water: { placement: 'Near a water source', ar: 'قرب الماء', source: 'Al-Shurut p.37' },
};

// ═══════════════════════════════════════════════════════════════
// KHAYR / SHARR CONSTANTS (Al-Shurut p.13)
// ═══════════════════════════════════════════════════════════════
const HAYR_SIID_DAYS = ['sun', 'mon', 'thu', 'fri'];
const HAYR_SIID_HOURS = [1, 8];
// BENEFIC_PLANETS / MALEFIC_PLANETS now imported from the shared manuscript
// rule engine (manuscriptRuleEngine.js) — derived from Sa'd/Nahs nature.

const NIGHT_REQUIRED_WORKS = ['celb', 'tard', 'sekam'];

// ═══════════════════════════════════════════════════════════════
// ZODIAC TIMING TABLES (Al-Shurut p.18-19)
// ═══════════════════════════════════════════════════════════════
const ZODIAC_TIMING_A = {
  aries:       { day: ['sun', 'mon'],           hour: ['Mercury', 'Jupiter'], source: 'Al-Shurut p.18 (Omani System A)' },
  taurus:      { day: ['sat', 'sun', 'thu'],    hour: ['Moon', 'Jupiter'],     source: 'Al-Shurut p.18 (Omani System A)' },
  gemini:      { day: ['sat', 'sun', 'thu'],    hour: ['Jupiter'],             source: 'Al-Shurut p.18 (Omani System A)' },
  cancer:      { day: ['wed', 'fri'],           hour: ['Moon', 'Jupiter'],     source: 'Al-Shurut p.18 (Omani System A)' },
  leo:         { day: ['mon'],                  hour: ['Moon', 'Jupiter', 'Mercury'], source: 'Al-Shurut p.18 (Omani System A)' },
  virgo:       { day: ['mon'],                  hour: ['Moon', 'Jupiter', 'Mercury'], source: 'Al-Shurut p.18 (Omani System A)' },
  libra:       { day: ['wed'],                  hour: ['Mercury'],             source: 'Al-Shurut p.18 (Omani System A)' },
  scorpio:     { day: ['tue'],                  hour: ['Moon'],                source: 'Al-Shurut p.18 — NOTE: author states "not found"' },
  sagittarius: { day: ['wed'],                  hour: ['Mercury'],             source: 'Al-Shurut p.18 (Omani System A)' },
  capricorn:   { day: ['thu'],                  hour: ['Mercury'],             source: 'Al-Shurut p.18 (Omani System A)' },
  aquarius:    { day: ['sun'],                  hour: ['Jupiter'],             source: 'Al-Shurut p.18 (Omani System A)' },
  pisces:      { day: ['tue'],                  hour: ['Mars'],                source: 'Al-Shurut p.18 (Omani System A)' },
};

const ZODIAC_TIMING_B = {
  aries: { hour: 'Jupiter' }, taurus: { hour: 'Jupiter' }, gemini: { hour: 'Sun' },
  cancer: { hour: 'Saturn' }, leo: { hour: 'Sun' }, virgo: { hour: 'Jupiter' },
  libra: { hour: 'Mercury' }, scorpio: { hour: 'Sun' }, sagittarius: { hour: 'Moon' },
  capricorn: { hour: 'Moon' }, aquarius: { hour: 'Moon' },
};

const ELEMENT_PLANET_AFFINITY = {
  fire:  { planets: ['Mars', 'Sun'], nature: 'hot & dry', strengthens: ['passion', 'courage', 'authority', 'destruction'] },
  earth: { planets: ['Saturn', 'Mercury'], nature: 'cold & dry', strengthens: ['binding', 'stability', 'wealth', 'patience'] },
  air:   { planets: ['Jupiter', 'Mercury'], nature: 'hot & moist', strengthens: ['knowledge', 'communication', 'spirituality', 'healing'] },
  water: { planets: ['Moon', 'Venus'], nature: 'cold & moist', strengthens: ['love', 'emotions', 'intuition', 'protection'] },
};

// ═══════════════════════════════════════════════════════════════
// PURPOSE CATEGORY CLASSIFICATION
// ═══════════════════════════════════════════════════════════════
const PURPOSE_POLARITY = {
  celb: 'khayr', sihhat: 'khayr', tarfet: 'khayr', ijlal: 'khayr',
  rizq: 'khayr', sultan: 'khayr', haybah: 'khayr', knowledge: 'khayr',
  travel: 'khayr', success: 'khayr', marriage: 'khayr',
  tard: 'sharr', sekam: 'sharr', harb: 'sharr', tahyij: 'sharr',
  hariq: 'sharr', tashtit: 'sharr', aqd: 'sharr',
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Moon phase delegated to the Astro Clock (single source of truth).
// `calculateMoonPosition` returns illumination %, isWaxing (mean elongation D),
// zodiacSign, mansion. The lunar-day number (1–29) is derived locally only
// because the Astro Clock does not expose it — it is a cycle-position number,
// NOT an independent astronomy calculation.
function getMoonPhase(date) {
  let liveMoon = null;
  try { liveMoon = calculateMoonPosition(date); } catch (_) { liveMoon = null; }
  const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
  const lunarCycleMs = 29.53059 * 24 * 60 * 60 * 1000;
  const diff = date.getTime() - knownNewMoon;
  const cycles = diff / lunarCycleMs;
  const phaseFraction = cycles - Math.floor(cycles);
  const lunarDay = Math.floor(phaseFraction * 29.53) + 1;
  // Waxing/waning from the Astro Clock's mean elongation (single source of truth).
  const isWaxing = liveMoon ? liveMoon.isWaxing === true : (lunarDay <= 14);
  const isWaning = !isWaxing;
  const isNewMoon = lunarDay >= 28 || lunarDay <= 1;
  const isFullMoon = lunarDay >= 13 && lunarDay <= 16;
  return {
    lunarDay, phaseName: isWaxing ? 'Waxing (مقبل)' : 'Waning (مدبر)',
    isWaxing, isWaning, isNewMoon, isFullMoon,
    isGoodForKhayr: isWaxing, isGoodForSharr: isWaning || isNewMoon,
    // Live Astro Clock data (read-only passthrough)
    moonSign: liveMoon?.zodiacSign?.name_en || null,
    moonIllumination: liveMoon ? parseFloat(liveMoon.phase) : null,
    moonMansion: liveMoon?.mansion?.name_en || null,
  };
}

function matchCustomPurpose(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const entry of CUSTOM_PURPOSE_KEYWORDS) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw.toLowerCase()) || text.includes(kw)) {
        if (entry.custom) return { ...entry.custom, isNightRequired: ['love', 'separation', 'harm', 'binding', 'agitation', 'fire', 'war'].includes(entry.rule) };
        return PDF_PURPOSE_TABLE[entry.rule];
      }
    }
  }
  return null;
}

// Sunrise/sunset delegated to the Astro Clock (single source of truth).
// Uses the SAME calculateSunriseSunset + getUserLocation that the Astro Clock
// page uses — NOAA astronomical algorithm based on real lat/lng/IANA tz.
// No hardcoded seasonal values. Identical fallback as useAstroData.
function getTodayAllHours(date) {
  const loc = getUserLocation();
  const sun = calculateSunriseSunset(date, loc.lat, loc.lng, loc.timezone);
  const sunrise = (sun.sunrise != null) ? sun.sunrise : 6.5;
  const sunset = (sun.sunset != null) ? sun.sunset : 18.25;
  return { hours: getAllPlanetaryHours(date, sunrise, sunset), sunrise, sunset };
}

function findHoursByPlanet(allHours, targetPlanetEn) {
  const target = targetPlanetEn.toLowerCase();
  return allHours.filter(h => h.planet === target);
}

function findNextValidDayHour(bestDayKey, bestHourPlanetEn) {
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const refData = getTodayAllHours(checkDate);
    const dayIdx = getActiveWeekday(checkDate, refData.sunrise, refData.sunset);
    const dayKey = Object.keys(MIZAN_DAY_TO_INDEX).find(k => MIZAN_DAY_TO_INDEX[k] === dayIdx);
    if (dayKey === bestDayKey) {
      const { hours } = refData;
      const matching = findHoursByPlanet(hours, bestHourPlanetEn);
      if (matching.length > 0) {
        const firstHour = matching[0];
        return {
          dayName: MIZAN_DAY_NAMES[dayKey], date: checkDate.toISOString().split('T')[0],
          hour: firstHour.hourNumber, planet: firstHour.planet,
          startTime: firstHour.startTime, endTime: firstHour.endTime,
          isToday: i === 0, daysAhead: i,
        };
      }
    }
  }
  return null;
}

function mapToActionRule(mizanPurposeKey) {
  const map = {
    celb: 'love', tard: 'spiritual', sihhat: 'healing', sekam: null, tarfet: 'spiritual',
  };
  return map[mizanPurposeKey] ? ACTION_RULES[map[mizanPurposeKey]] : null;
}

// ── Star rating helpers ──
function scoreToStars(score) {
  if (score >= 85) return 5;
  if (score >= 70) return 4;
  if (score >= 50) return 3;
  if (score >= 30) return 2;
  if (score >= 15) return 1;
  return 0;
}
function starsToString(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }

// ── Per-window strength (0-100) with explanation ──
function windowStrength(win, khayrSharr, moonPhase, pdfRule) {
  let s = 40;
  const reasons = [];
  if (win.isIdeal) { s += 25; reasons.push(`the ${win.planet} hour is the prescribed planetary hour for this work`); }
  if (khayrSharr === 'khayr' && BENEFIC_PLANETS.map(p => p.toLowerCase()).includes(win.planet)) { s += 15; reasons.push(`${win.planet} is a benefic planet, satisfying the Khayr restriction`); }
  if (khayrSharr === 'sharr' && MALEFIC_PLANETS.map(p => p.toLowerCase()).includes(win.planet)) { s += 12; reasons.push(`${win.planet} is a malefic planet, strengthening the Sharr work`); }
  if (pdfRule?.isNightRequired && win.period === 'night') { s += 12; reasons.push(`this is a nighttime hour, as required by the manuscript`); }
  if (moonPhase.isGoodForKhayr && khayrSharr === 'khayr') { s += 5; reasons.push(`the waxing Moon amplifies benevolent works`); }
  if (moonPhase.isGoodForSharr && khayrSharr === 'sharr') { s += 5; reasons.push(`the waning Moon amplifies banishment works`); }
  return { score: Math.min(100, s), stars: scoreToStars(Math.min(100, s)), reason: reasons.join('; ') || 'this hour is available but not optimally aligned' };
}

// ── Infer Khayr/Sharr from purpose when not explicitly selected ──
function inferKhayrSharr(khayrSharrSelected, purposeKey, pdfRule) {
  if (khayrSharrSelected) return { value: khayrSharrSelected, inferred: false };
  if (purposeKey && PURPOSE_POLARITY[purposeKey]) {
    return { value: PURPOSE_POLARITY[purposeKey], inferred: true };
  }
  if (pdfRule?.category) {
    const sharrCats = ['Separation & Banishment', 'Harm & Destruction', 'Conflict & Strife', 'Agitation & Passion', 'Destruction & Fire', 'Scattering & Dispersion', 'Binding & Restraint'];
    if (sharrCats.includes(pdfRule.category)) return { value: 'sharr', inferred: true };
    return { value: 'khayr', inferred: true };
  }
  return { value: null, inferred: false };
}

// ── Wait time until next suitable hour today ──
function computeWaitTime(todayHours, bestHourPlanet, khayrSharr, now) {
  const candidates = todayHours.filter(h => h.status === 'current' || h.status === 'upcoming');
  let next = candidates.find(h => h.planet === (bestHourPlanet || '').toLowerCase());
  if (!next && khayrSharr === 'khayr') {
    next = candidates.find(h => BENEFIC_PLANETS.map(p => p.toLowerCase()).includes(h.planet));
  }
  if (!next) next = candidates[0];
  if (!next) return null;
  const [timePart, ampm] = next.startTime.split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let targetMin = h * 60 + m;
  if (targetMin < nowMin) targetMin += 24 * 60;
  const waitMin = targetMin - nowMin;
  const waitH = Math.floor(waitMin / 60);
  const waitM = waitMin % 60;
  return { hour: next, waitHours: waitH, waitMinutes: waitM, waitText: waitH > 0 ? `${waitH}h ${waitM}m` : `${waitM}m` };
}

// ── Next best moon phase recommendation ──
function nextBestMoonPhase(khayrSharr, currentMoonDay) {
  if (!khayrSharr) return null;
  if (khayrSharr === 'khayr') {
    if (currentMoonDay <= 7) return { phase: 'Waxing — Days 1–7 (first crescent to first quarter)', reason: 'the Moon is growing in light, which amplifies all benevolent and attractive works', waitDays: 0 };
    if (currentMoonDay > 14) {
      const wait = 29 - currentMoonDay + 1;
      return { phase: 'Next New Moon → Waxing Days 1–7', reason: 'the waning Moon must complete its cycle; the next waxing crescent begins the ideal window', waitDays: wait };
    }
    return { phase: 'Waxing — Days 8–14', reason: 'the Moon is still waxing, though the first 7 days are strongest for new beginnings', waitDays: 0 };
  }
  if (currentMoonDay >= 27 || currentMoonDay <= 2) return { phase: 'New Moon (محاق) — Days 27–2', reason: 'the Moon is at its darkest, the most powerful time for banishment and dissolution', waitDays: 0 };
  if (currentMoonDay > 14) return { phase: 'Waning — Days 15–29', reason: 'the Moon is decreasing in light, which supports works of removal and separation', waitDays: 0 };
  const wait = 15 - currentMoonDay;
  return { phase: 'Next Waning phase (after Full Moon, Day 15)', reason: 'the Moon is still waxing; wait for the Full Moon to pass before the waning energy becomes available', waitDays: wait };
}

// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT DAY RESOLVER — LIVE (sunset-aware) or MANUAL (selected day)
// ═══════════════════════════════════════════════════════════════
// LIVE mode (no selectedDay): active day = getActiveWeekday(now) — changes at sunset.
// MANUAL mode (selectedDay set): the selected day IS the manuscript day.
//   Night of Day X = previous civil day's sunset → X's sunrise (target = X-1).
//   Day of Day X   = X's sunrise → X's sunset (target = X).
// Returns { activeDayIndex, referenceDate } for downstream hour-table lookup.
function resolveManuscriptDay(selectedDay, dayNight, now, sunrise, sunset) {
  if (!selectedDay) {
    return { activeDayIndex: getActiveWeekday(now, sunrise, sunset), referenceDate: now };
  }
  const activeDayIndex = MIZAN_DAY_TO_INDEX[selectedDay];
  const targetCivilIndex = dayNight === 'gece'
    ? (activeDayIndex - 1 + 7) % 7
    : activeDayIndex;
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    if (checkDate.getDay() === targetCivilIndex) {
      const referenceDate = new Date(checkDate);
      if (dayNight === 'gece') {
        referenceDate.setHours(Math.floor(sunset) + 1, 0, 0, 0);
      } else if (dayNight === 'gunduz') {
        referenceDate.setHours(Math.floor(sunrise) + 2, 0, 0, 0);
      }
      return { activeDayIndex, referenceDate };
    }
  }
  return { activeDayIndex, referenceDate: now };
}

// ═══════════════════════════════════════════════════════════════
// MAIN ANALYSIS FUNCTION — COMPLETE DECISION REPORT
// ═══════════════════════════════════════════════════════════════
export function analyzeRitualTiming({ result, selections, customPurpose, activeMethod }) {
  const reasoning = [];
  const warnings = [];
  const bookNotes = [];
  const conflicts = [];
  const rulesApplied = [];

  // ── STEP 1: Extract Mizan state ──
  const dominant = result?.dominant || (selections?.elements?.[0] || null);
  const khayrSharrSelected = selections?.khayrSharr8 || null;
  const selectedDay = selections?.days || null;
  const selectedHour = selections?.hour || null;
  const selectedPlanet = selections?.planet || null;
  const dayNight = selections?.dayNight || null;
  const purposes = selections?.purposes || [];
  const primaryPurpose = purposes[0] || null;
  const suitability = result?.suitability || null;

  // No purpose selected and no custom purpose → do NOT generate any recommendations
  if (!primaryPurpose && !(customPurpose || "").trim()) {
    return {
      noPurposeSelected: true,
      message: "No Purpose Selected. Please choose a Purpose in Mizaan 7 to generate Ritual Timing recommendations.",
    };
  }

  reasoning.push(`Mizan dominant element: ${dominant || 'unknown'}`);
  reasoning.push(`Khayr/Sharr selection: ${khayrSharrSelected || 'not selected'}`);
  reasoning.push(`Selected day: ${selectedDay ? MIZAN_DAY_NAMES[selectedDay] : 'not selected'}`);
  reasoning.push(`Selected planetary hour: #${selectedHour || 'not selected'}`);
  reasoning.push(`Selected planet: ${selectedPlanet ? MIZAN_TO_EN_PLANET[selectedPlanet] : 'not selected'}`);
  reasoning.push(`Day/Night mode: ${dayNight || 'not selected'}`);
  reasoning.push(`Primary purpose: ${primaryPurpose || 'none'}`);
  if (customPurpose) reasoning.push(`Custom purpose: "${customPurpose}"`);
  reasoning.push(`Active Method: ${activeMethod}`);

  // ── STEP 2: Determine ritual intent (purpose) — AUTO ──
  let pdfRule = null;
  let purposeKey = primaryPurpose;
  if (primaryPurpose && PDF_PURPOSE_TABLE[primaryPurpose]) {
    pdfRule = PDF_PURPOSE_TABLE[primaryPurpose];
    rulesApplied.push({ id: `PDF_${primaryPurpose}`, desc: `Purpose "${pdfRule.pdfName}" → Day: ${MIZAN_DAY_NAMES[pdfRule.bestDay]}, Hour: ${pdfRule.bestHour}`, source: pdfRule.source });
  }
  const customMatch = matchCustomPurpose(customPurpose);
  if (customMatch && !pdfRule) {
    pdfRule = customMatch;
    purposeKey = Object.keys(PDF_PURPOSE_TABLE).find(k => PDF_PURPOSE_TABLE[k] === customMatch) || purposeKey;
    rulesApplied.push({ id: 'PDF_CUSTOM', desc: `Custom purpose matched "${pdfRule.pdfName}" → Day: ${MIZAN_DAY_NAMES[pdfRule.bestDay]}, Hour: ${pdfRule.bestHour}`, source: pdfRule.source });
  } else if (customMatch && pdfRule && customMatch.pdfName !== pdfRule.pdfName) {
    conflicts.push({
      rule1: `Mizan purpose "${pdfRule.pdfName}" (${pdfRule.source})`,
      rule2: `Custom text matched "${customMatch.pdfName}" (${customMatch.source})`,
      resolution: `Mizan purpose takes priority (Tier 4). Custom purpose noted as secondary.`,
    });
  }

  // ── STEP 2b: AUTO-INFER Khayr/Sharr and category ──
  const khayrSharrInferred = inferKhayrSharr(khayrSharrSelected, purposeKey, pdfRule);
  const khayrSharr = khayrSharrInferred.value;
  const ritualCategory = pdfRule?.category || (khayrSharr === 'sharr' ? 'Dark / Baneful Work' : 'General Spiritual Work');
  if (khayrSharrInferred.inferred) {
    reasoning.push(`Khayr/Sharr AUTO-INFERRED as ${khayrSharr} from purpose category "${ritualCategory}"`);
    rulesApplied.push({ id: 'INFER_POLARITY', desc: `Polarity auto-inferred: ${khayrSharr} (from category: ${ritualCategory})`, source: 'Engine inference from manuscript purpose tables' });
  }

  // ── STEP 3: Read time — manuscript sunset-aware (LIVE + MANUAL) ──
  const now = new Date();
  const nowData = getTodayAllHours(now);
  const sunrise = nowData.sunrise;
  const sunset = nowData.sunset;

  const { activeDayIndex, referenceDate } = resolveManuscriptDay(selectedDay, dayNight, now, sunrise, sunset);
  const refData = getTodayAllHours(referenceDate);
  const todayHours = refData.hours;

  const currentHourInfo = getCurrentPlanetaryHour(referenceDate, refData.sunrise, refData.sunset);
  const dayRuler = getDayRuler(activeDayIndex);
  const moonPhase = getMoonPhase(referenceDate);
  const currentDayKey = Object.keys(MIZAN_DAY_TO_INDEX).find(k => MIZAN_DAY_TO_INDEX[k] === activeDayIndex);
  const isNightTime = selectedDay
    ? (dayNight === 'gece')
    : (now.getHours() < sunrise || now.getHours() >= sunset);

  const _rtLoc = getUserLocation();
  reasoning.push(`Current time: ${now.toLocaleString('en-US', { timeZone: _rtLoc.tz || undefined })}`);
  reasoning.push(`Current planetary hour: #${currentHourInfo.hourNumber} (${currentHourInfo.planet})`);
  reasoning.push(`Current day ruler: ${dayRuler.planet}`);
  reasoning.push(`Moon phase: Day ${moonPhase.lunarDay} — ${moonPhase.phaseName}`);
  reasoning.push(`Currently ${isNightTime ? 'nighttime' : 'daytime'}`);

  // ── STEP 4: Apply PDF rules — best day/hour ──
  let bestDay = null, bestHourPlanet = null, altDay = null, altHourPlanet = null;
  if (pdfRule) {
    bestDay = pdfRule.bestDay; bestHourPlanet = pdfRule.bestHour;
    altDay = pdfRule.altDay || null; altHourPlanet = pdfRule.altHour || null;
  }

  const daySources = [];
  const hourSources = [];
  if (pdfRule) {
    daySources.push(`${pdfRule.source}: ${pdfRule.pdfName} is prescribed for ${MIZAN_DAY_NAMES[pdfRule.bestDay]}`);
    hourSources.push(`${pdfRule.source}: the ${pdfRule.bestHour} hour governs ${pdfRule.pdfName}${pdfRule.description ? ` (${pdfRule.description})` : ''}`);
    if (altDay) daySources.push(`${pdfRule.source}: ${MIZAN_DAY_NAMES[altDay]} is an acceptable alternative`);
    if (altHourPlanet) hourSources.push(`${pdfRule.source}: the ${altHourPlanet} hour is a secondary option`);
  }
  if (khayrSharr === 'khayr') {
    hourSources.push(`Al-Shurut p.13 (LCK_001): Khayr works require a Sa'idat hour (1st or 8th) on Sun/Mon/Thu/Fri, or any benefic planet hour (Sun, Jupiter, Venus, Moon)`);
    if (bestHourPlanet && BENEFIC_PLANETS.includes(bestHourPlanet)) hourSources.push(`The ${bestHourPlanet} hour qualifies as a benefic planet, satisfying the Khayr restriction`);
  }
  if (khayrSharr === 'sharr') {
    hourSources.push(`Al-Shurut p.13 (MN_002): Sharr works are strengthened during the waning Moon, and the ${bestHourPlanet || 'prescribed'} hour provides the necessary planetary force`);
  }
  let bestDayReason = daySources.length > 0 ? daySources.join(' · ') : `No specific day prescription found in the imported manuscripts for this purpose — any day may be used, guided by the planetary hour.`;
  let bestHourReason = hourSources.length > 0 ? hourSources.join(' · ') : `No specific hour prescription found in the imported manuscripts for this purpose.`;

  // ── STEP 5: Apply Khayr hour restriction ──
  if (khayrSharr === 'khayr') {
    rulesApplied.push({ id: 'LCK_001', desc: 'Khayr works: restrict to Sa\'idat hours (1st & 8th of Sun/Mon/Thu/Fri) OR any benefic planet hour', source: 'Al-Shurut p.13' });
    const isSiidDay = HAYR_SIID_DAYS.includes(currentDayKey);
    const isSiidHour = HAYR_SIID_HOURS.includes(currentHourInfo.hourNumber);
    const isBeneficHour = BENEFIC_PLANETS.includes(currentHourInfo.planet);
    if (!isSiidHour && !isBeneficHour) {
      warnings.push(`Current hour (#${currentHourInfo.hourNumber}, ${currentHourInfo.planet}) is NOT a Sa'idat hour and ${currentHourInfo.planet} is not a benefic planet — unsuitable for Khayr works (LCK_003)`);
    }
  }

  // ── STEP 6: Moon phase rules ──
  if (khayrSharr === 'khayr' && !moonPhase.isGoodForKhayr) {
    warnings.push(`Moon is in the waning phase (Day ${moonPhase.lunarDay}). Khayr works should be done in the waxing phase (MN_001)`);
    rulesApplied.push({ id: 'MN_001', desc: 'Khayr works require waxing moon (first half of lunar month)', source: 'Al-Shurut p.13' });
  }
  if (khayrSharr === 'sharr' && !moonPhase.isGoodForSharr) {
    warnings.push(`Moon is in the waxing phase. Sharr works are better in the waning phase, especially at New Moon (MN_002)`);
    rulesApplied.push({ id: 'MN_002', desc: 'Sharr works best in waning moon, especially New Moon (محاق)', source: 'Al-Shurut p.13' });
  }

  // ── STEP 7: Night preference ──
  if (pdfRule?.isNightRequired && !isNightTime) {
    warnings.push(`This work (${pdfRule.pdfName}) MUST be performed at night — spirits are suppressed by daylight (NGT_002)`);
    rulesApplied.push({ id: 'NGT_006', desc: 'Love, enmity, separation, and binding works must be done at night', source: 'Al-Shurut p.39-40' });
  }
  if (!isNightTime) {
    rulesApplied.push({ id: 'NGT_001', desc: 'All scholars agree: night is superior to day for spiritual works (Sun suppresses spirits)', source: 'Al-Shurut p.39-40' });
  }

  // ── STEP 8: Element direction & placement ──
  let elementDirection = null, elementPlacement = null;
  if (dominant && ELEMENT_DIRECTION[dominant]) {
    elementDirection = ELEMENT_DIRECTION[dominant];
    rulesApplied.push({ id: `DIR_${dominant}`, desc: `Face ${elementDirection.dir} for ${dominant} element works`, source: elementDirection.source });
  }
  if (dominant && ELEMENT_PLACEMENT[dominant]) {
    elementPlacement = ELEMENT_PLACEMENT[dominant];
    rulesApplied.push({ id: `PLC_${dominant}`, desc: `Place talisman ${elementPlacement.placement}`, source: elementPlacement.source });
  }

  // ── STEP 9: Find best hours today (with star ratings) ──
  let bestWindowsToday = [];
  let avoidWindowsToday = [];

  if (bestHourPlanet) {
    const matchingHours = findHoursByPlanet(todayHours, bestHourPlanet);
    for (const h of matchingHours) {
      if (h.status === 'past') continue;
      const w = {
        startTime: h.startTime, endTime: h.endTime, planet: h.planet,
        hourNumber: h.hourNumber, period: h.period,
        isIdeal: h.planet === bestHourPlanet.toLowerCase(),
        reason: `${bestHourPlanet} hour — ideal for ${pdfRule?.pdfName || 'this work'}`,
      };
      const strength = windowStrength(w, khayrSharr, moonPhase, pdfRule);
      bestWindowsToday.push({ ...w, ...strength });
    }
  }
  if (!bestHourPlanet && khayrSharr === 'khayr') {
    for (const h of todayHours) {
      if (h.status === 'past') continue;
      if (BENEFIC_PLANETS.map(p => p.toLowerCase()).includes(h.planet)) {
        const w = { startTime: h.startTime, endTime: h.endTime, planet: h.planet, hourNumber: h.hourNumber, period: h.period, isIdeal: false, reason: `${h.planet} hour — benefic planet, suitable for Khayr` };
        const strength = windowStrength(w, khayrSharr, moonPhase, pdfRule);
        bestWindowsToday.push({ ...w, ...strength });
      }
    }
  }

  // Avoid windows: hours of enemy planets
  const actionRule = mapToActionRule(primaryPurpose);
  if (actionRule && actionRule.sources) {
    for (const src of actionRule.sources) {
      daySources.push(`${src.book} p.${src.page}: ${actionRule.category} works favor ${actionRule.beneficDays ? actionRule.beneficDays.join(', ') : 'the prescribed days'}`);
      hourSources.push(`${src.book} p.${src.page}: ${actionRule.category} works favor ${actionRule.beneficPlanets ? actionRule.beneficPlanets.join(', ') : 'benefic planet'} hours`);
    }
  }
  bestDayReason = daySources.length > 0 ? daySources.join(' · ') : bestDayReason;
  bestHourReason = hourSources.length > 0 ? hourSources.join(' · ') : bestHourReason;

  if (actionRule?.enemyPlanets) {
    for (const enemy of actionRule.enemyPlanets) {
      const enemyHours = findHoursByPlanet(todayHours, enemy);
      for (const h of enemyHours) {
        if (h.status === 'past') continue;
        avoidWindowsToday.push({ startTime: h.startTime, endTime: h.endTime, planet: h.planet, hourNumber: h.hourNumber, reason: `${enemy} hour — enemy planet for ${actionRule.category}` });
      }
    }
  }
  if (khayrSharr === 'khayr') {
    for (const h of todayHours) {
      if (h.status === 'past') continue;
      if (MALEFIC_PLANETS.map(p => p.toLowerCase()).includes(h.planet)) {
        if (!avoidWindowsToday.find(a => a.startTime === h.startTime)) {
          avoidWindowsToday.push({ startTime: h.startTime, endTime: h.endTime, planet: h.planet, hourNumber: h.hourNumber, reason: `${h.planet} hour — malefic planet, weakens Khayr works (Havâss p.50-51)` });
        }
      }
    }
  }

  // ── STEP 10: Can perform today? ──
  let canPerformToday = 'No';
  let dayMatch = false;
  let canPerformTodayReason = '';
  if (bestDay) {
    dayMatch = currentDayKey === bestDay || (altDay && currentDayKey === altDay);
    if (dayMatch) {
      const upcomingBest = bestWindowsToday.filter(w => w.status !== 'past');
      const allMatching = findHoursByPlanet(todayHours, bestHourPlanet);
      if (upcomingBest.length > 0) {
        canPerformToday = 'Yes';
        canPerformTodayReason = `Today (${MIZAN_DAY_NAMES[currentDayKey]}) is the recommended day and ${upcomingBest.length} optimal hour${upcomingBest.length > 1 ? 's' : ''} remain available.`;
        rulesApplied.push({ id: 'DAY_MATCH', desc: `Today (${MIZAN_DAY_NAMES[currentDayKey]}) matches the recommended day for ${pdfRule?.pdfName}`, source: pdfRule?.source || '' });
      } else if (allMatching.length > 0) {
        canPerformToday = 'Limited';
        canPerformTodayReason = `Today is the correct day, but all ${bestHourPlanet} hours have already passed. You may proceed with a secondary hour, or wait for the next occurrence.`;
        warnings.push(`Today is the correct day but all ${bestHourPlanet} hours have passed. Proceeding with a non-optimal hour is possible but weakened.`);
      } else {
        canPerformToday = 'No';
        canPerformTodayReason = `Today is the correct day but no ${bestHourPlanet} hours exist in today's planetary table.`;
      }
    } else {
      canPerformToday = 'No';
      canPerformTodayReason = `Today is ${MIZAN_DAY_NAMES[currentDayKey]}, but the recommended day is ${MIZAN_DAY_NAMES[bestDay]}${altDay ? ' or ' + MIZAN_DAY_NAMES[altDay] : ''}.`;
      warnings.push(`Today is ${MIZAN_DAY_NAMES[currentDayKey]}, but the recommended day is ${MIZAN_DAY_NAMES[bestDay]}${altDay ? ' or ' + MIZAN_DAY_NAMES[altDay] : ''}`);
    }
  } else {
    canPerformToday = 'Limited';
    canPerformTodayReason = `No specific day restriction found for this ritual type. Any day may work, but consult the planetary hours below for timing.`;
  }

  // ── STEP 11: Next best opportunity ──
  let nextOpportunity = null;
  if (bestDay && bestHourPlanet) {
    nextOpportunity = findNextValidDayHour(bestDay, bestHourPlanet);
    if (!nextOpportunity && altDay && altHourPlanet) {
      nextOpportunity = findNextValidDayHour(altDay, altHourPlanet);
    }
  }

  // ── STEP 12: Compute suitability score ──
  let score = 50;
  const scoreReasons = [];
  if (dayMatch) { score += 20; scoreReasons.push('Correct day (+20)'); }
  else { score -= 15; scoreReasons.push('Wrong day (-15)'); }
  const currentHourMatches = bestHourPlanet && currentHourInfo.planet === bestHourPlanet.toLowerCase();
  if (currentHourMatches) { score += 25; scoreReasons.push('Current hour matches best planet (+25)'); }
  else if (bestHourPlanet) { score -= 10; scoreReasons.push('Current hour does not match best planet (-10)'); }
  if (khayrSharr === 'khayr' && BENEFIC_PLANETS.includes(currentHourInfo.planet)) { score += 10; scoreReasons.push('Benefic hour for Khayr (+10)'); }
  if (khayrSharr === 'khayr' && moonPhase.isGoodForKhayr) { score += 10; scoreReasons.push('Waxing moon for Khayr (+10)'); }
  if (khayrSharr === 'sharr' && moonPhase.isGoodForSharr) { score += 10; scoreReasons.push('Waning moon for Sharr (+10)'); }
  if (pdfRule?.isNightRequired && isNightTime) { score += 10; scoreReasons.push('Nighttime for nocturnal works (+10)'); }
  if (pdfRule?.isNightRequired && !isNightTime) { score -= 15; scoreReasons.push('Daytime but night required (-15)'); }
  if (!pdfRule?.isNightRequired && isNightTime) { score += 5; scoreReasons.push('Nighttime is generally superior (+5)'); }
  if (dominant && pdfRule) {
    const firePurposes = ['celb', 'sekam', 'tahyij', 'hariq', 'harb', 'haybah'];
    const earthPurposes = ['tard', 'aqd', 'tashtit'];
    const airPurposes = ['sihhat', 'ijlal'];
    const waterPurposes = ['tarfet', 'sultan'];
    const pk = primaryPurpose || '';
    if (dominant === 'fire' && firePurposes.includes(pk)) { score += 5; scoreReasons.push('Fire element aligns with purpose (+5)'); }
    if (dominant === 'earth' && earthPurposes.includes(pk)) { score += 5; scoreReasons.push('Earth element aligns with purpose (+5)'); }
    if (dominant === 'air' && airPurposes.includes(pk)) { score += 5; scoreReasons.push('Air element aligns with purpose (+5)'); }
    if (dominant === 'water' && waterPurposes.includes(pk)) { score += 5; scoreReasons.push('Water element aligns with purpose (+5)'); }
  }
  score = Math.max(0, Math.min(100, score));

  // ── STEP 13: Verdict with star rating ──
  const stars = scoreToStars(score);
  let verdict, verdictColor, verdictReason;
  if (score >= 85) { verdict = 'Excellent'; verdictColor = '#4ADE80'; verdictReason = 'All major conditions align perfectly — the heavens strongly support this ritual.'; }
  else if (score >= 70) { verdict = 'Good'; verdictColor = '#86EFAC'; verdictReason = 'Most conditions are favorable — proceed with confidence.'; }
  else if (score >= 50) { verdict = 'Moderate'; verdictColor = '#FBBF24'; verdictReason = 'Mixed conditions — the ritual can succeed but requires extra focus and correct timing.'; }
  else if (score >= 30) { verdict = 'Weak'; verdictColor = '#F59E0B'; verdictReason = 'Conditions are unfavorable — postpone to a better time if possible.'; }
  else { verdict = 'Avoid'; verdictColor = '#F87171'; verdictReason = 'Multiple unfavorable conditions — do not proceed at this time.'; }

  // ── STEP 14: Book notes ──
  if (pdfRule) bookNotes.push({ source: pdfRule.source, text: `${pdfRule.pdfName}: Day ${MIZAN_DAY_NAMES[pdfRule.bestDay]}, Hour ${pdfRule.bestHour}` });
  if (dominant) {
    bookNotes.push({ source: 'Al-Shurut p.37', text: `Dominant element ${dominant}: place talisman ${elementPlacement?.placement || 'appropriately'}` });
    bookNotes.push({ source: 'Al-Shurut p.42', text: `Face ${elementDirection?.dir || 'Qibla'} during ritual` });
  }
  if (actionRule) {
    for (const src of (actionRule.sources || [])) bookNotes.push({ source: `${src.book} p.${src.page}`, text: `Existing manuscript: ${actionRule.category}` });
  }

  // ── STEP 15: Incense ──
  const recommendedIncense = `${currentHourInfo.planet} incense (for the current ${currentHourInfo.planet} hour)`;
  rulesApplied.push({ id: 'INC_004', desc: 'Incense = incense of the SA\'AT (hour), NOT the day', source: 'Al-Shurut p.11, 20' });

  // ── STEP 16: Zodiac suitability ──
  let zodiacSuitability = { assessed: false, bestSigns: [], note: '' };
  const todayDayMatchesZodiac = [];
  for (const [sign, rule] of Object.entries(ZODIAC_TIMING_A)) {
    if (rule.day.includes(currentDayKey)) todayDayMatchesZodiac.push({ sign, system: 'A', hour: rule.hour, source: rule.source });
  }
  if (todayDayMatchesZodiac.length > 0) {
    zodiacSuitability = { assessed: true, bestSigns: todayDayMatchesZodiac, note: `Today's day (${MIZAN_DAY_NAMES[currentDayKey]}) is optimal for rituals targeting people born under: ${todayDayMatchesZodiac.map(z => z.sign).join(', ')}.` };
    rulesApplied.push({ id: 'ZOD_A', desc: `Zodiac System A: ${MIZAN_DAY_NAMES[currentDayKey]} matches ${todayDayMatchesZodiac.map(z => z.sign).join(', ')}`, source: 'Al-Shurut p.18' });
  } else {
    zodiacSuitability = { assessed: true, bestSigns: [], note: `Today's day (${MIZAN_DAY_NAMES[currentDayKey]}) is not listed as optimal for any specific natal sign in the Omani zodiac timing tables.` };
  }

  // ── STEP 17: Day/Night suitability ──
  let dayNightSuitability = { status: 'neutral', reason: '', citation: '' };
  if (pdfRule?.isNightRequired) {
    if (isNightTime) {
      dayNightSuitability = { status: 'optimal', reason: `It is currently nighttime, which is required for this work (${pdfRule.pdfName}). The Sun's suppression of spirits is lifted at night.`, citation: 'Al-Shurut p.39-40 (NGT_001-006)' };
    } else {
      dayNightSuitability = { status: 'forbidden', reason: `It is currently daytime, but this work (${pdfRule.pdfName}) must be performed at night. The Sun's dominion suppresses all spirits during daylight.`, citation: 'Al-Shurut p.39-40 (NGT_002)' };
    }
  } else {
    if (isNightTime) {
      dayNightSuitability = { status: 'good', reason: `It is nighttime — all scholars agree that night is superior to day for spiritual works.`, citation: 'Al-Shurut p.39 (NGT_001)' };
    } else {
      dayNightSuitability = { status: 'acceptable', reason: `It is daytime. While night is generally preferred, this type of work can be performed during the day if the planetary hour is correct.`, citation: 'Al-Shurut p.39-40 (NGT_007)' };
    }
  }

  // ── STEP 18: Element compatibility ──
  let elementCompatibility = { assessed: false, status: 'neutral', reason: '', citation: '' };
  if (dominant && ELEMENT_PLANET_AFFINITY[dominant]) {
    const elemInfo = ELEMENT_PLANET_AFFINITY[dominant];
    const currentPlanetLower = currentHourInfo.planet.toLowerCase();
    const isAligned = elemInfo.planets.map(p => p.toLowerCase()).includes(currentPlanetLower);
    elementCompatibility = {
      assessed: true, status: isAligned ? 'aligned' : 'neutral', element: dominant,
      elementNature: elemInfo.nature, affinityPlanets: elemInfo.planets, strengthens: elemInfo.strengthens,
      reason: isAligned
        ? `The dominant element from your Mizan analysis is ${dominant} (${elemInfo.nature}), and the current planetary hour is ruled by ${currentHourInfo.planet} — one of the planets naturally aligned with ${dominant}. This harmony amplifies the ritual's power.`
        : `The dominant element is ${dominant} (${elemInfo.nature}), but the current hour is ruled by ${currentHourInfo.planet}, which is not the primary planet of ${dominant}. Wait for a ${elemInfo.planets.join(' or ')} hour for maximum alignment.`,
      citation: 'Al-Shurut p.37, 42 + Havâss p.50-56',
    };
    rulesApplied.push({ id: `ELEM_${dominant}`, desc: `Element ${dominant} affinity: ${elemInfo.planets.join(', ')} — current hour ${isAligned ? 'matches' : 'differs'}`, source: 'Al-Shurut p.37 + Havâss' });
  }

  // ── STEP 19: Astro Clock status ──
  const astroClockStatus = {
    day: MIZAN_DAY_NAMES[currentDayKey], dayRuler: dayRuler.planet,
    currentHour: { number: currentHourInfo.hourNumber, planet: currentHourInfo.planet, symbol: PLANET_INFO[currentHourInfo.planet]?.symbol || '' },
    isDaytime: !isNightTime, hourRemaining: currentHourInfo.remainingTime,
    nextPlanet: PLANET_SEQUENCE[(PLANET_SEQUENCE.indexOf(currentHourInfo.planet) + 1) % 7] || '',
    moonPhase: `Day ${moonPhase.lunarDay} (${moonPhase.phaseName})`,
    summary: `Today is ${MIZAN_DAY_NAMES[currentDayKey]} (ruled by ${dayRuler.planet}). The current planetary hour is #${currentHourInfo.hourNumber} (${currentHourInfo.planet}), ${isNightTime ? 'nighttime' : 'daytime'}, with ${currentHourInfo.remainingTime} remaining. The Moon is at day ${moonPhase.lunarDay} (${moonPhase.phaseName}).`,
  };

  // ── STEP 20: Wait time until next suitable hour ──
  const waitTime = computeWaitTime(todayHours, bestHourPlanet, khayrSharr, now);

  // ── STEP 21: Ranked best hours (1st, 2nd, 3rd) ──
  const rankedWindows = [...bestWindowsToday].sort((a, b) => b.score - a.score);
  const topThree = rankedWindows.slice(0, 3).map((w, i) => ({ ...w, rank: i + 1 }));

  // ── STEP 22: Next best moon phase ──
  const nextMoonPhase = nextBestMoonPhase(khayrSharr, moonPhase.lunarDay);

  // ── STEP 23: Comprehensive enemy analysis ──
  const enemyAnalysis = { enemyHours: [], enemyDays: [], enemyMoonPhases: [], enemyRulers: [], note: '' };
  if (khayrSharr === 'khayr') {
    enemyAnalysis.enemyHours = MALEFIC_PLANETS;
    enemyAnalysis.enemyDays = ['sat', 'tue'];
    enemyAnalysis.enemyMoonPhases = ['Waning (Days 15–29)', 'New Moon (محاق)'];
    enemyAnalysis.enemyRulers = ['Saturn (Greater Malefic)', 'Mars (Lesser Malefic)'];
    enemyAnalysis.note = `For Khayr (benevolent) works, the manuscripts identify Saturn and Mars as enemy planets — their hours and days drain benevolent energy. The waning Moon and New Moon are also unfavorable, as the decreasing lunar light withers all works of growth and attraction.`;
  } else if (khayrSharr === 'sharr') {
    enemyAnalysis.enemyHours = BENEFIC_PLANETS;
    enemyAnalysis.enemyDays = ['sun', 'thu', 'fri'];
    enemyAnalysis.enemyMoonPhases = ['Waxing (Days 1–14)', 'Full Moon'];
    enemyAnalysis.enemyRulers = ['Sun (suppression of spirits)', 'Jupiter (protection & expansion)', 'Venus (harmony & love)'];
    enemyAnalysis.note = `For Sharr (banishment) works, the benefic planets (Sun, Jupiter, Venus, Moon) are the enemies — they protect, heal, and harmonize, opposing all works of separation and harm. The waxing Moon and Full Moon amplify life and growth, working against dissolution. Perform Sharr works only in the waning phase.`;
  }

  // ═══════════════════════════════════════════════════════════════
  // BUILD THE 10-SECTION EXPERT DECISION REPORT
  // ═══════════════════════════════════════════════════════════════
  const report = [];

  // ── SECTION 1: TODAY ANALYSIS ──
  report.push({
    section: 'TODAY ANALYSIS',
    icon: 'calendar',
    status: canPerformToday,
    body: canPerformToday === 'Yes'
      ? `Yes — today is suitable. ${canPerformTodayReason} The heavens are aligned for this work, and you may proceed with confidence during the optimal hours listed below.`
      : canPerformToday === 'Limited'
        ? `Today is only partially suitable. ${canPerformTodayReason} You may proceed, but the ritual will be weakened. If the matter is urgent, continue; otherwise, wait for the next fully aligned day.`
        : `No — today is not suitable. ${canPerformTodayReason} Performing this ritual today would be working against the celestial current, which the manuscripts warn against.`,
    citation: pdfRule?.source || 'Al-Shurut p.12-13',
    consequence: canPerformToday === 'Yes' ? 'No risk — proceed.' : 'Proceeding on the wrong day weakens the ritual and may cause the spirits to refuse the request.',
  });

  // ── SECTION 2: CURRENT MOMENT ──
  const currentIsBenefic = khayrSharr === 'khayr' && BENEFIC_PLANETS.includes(currentHourInfo.planet);
  const currentIsMalefic = khayrSharr === 'sharr' && MALEFIC_PLANETS.includes(currentHourInfo.planet);
  let currentMomentSuitable = currentHourMatches || currentIsBenefic || currentIsMalefic;
  if (pdfRule?.isNightRequired && !isNightTime) currentMomentSuitable = false;

  report.push({
    section: 'CURRENT MOMENT',
    icon: 'clock',
    status: currentMomentSuitable ? 'Suitable' : 'Not suitable',
    body: currentMomentSuitable
      ? `Right now is a suitable moment. The current planetary hour is #${currentHourInfo.hourNumber} (${currentHourInfo.planet}), ${isNightTime ? 'nighttime' : 'daytime'}, with ${currentHourInfo.remainingTime} remaining. ${currentHourMatches ? `This IS the prescribed ${bestHourPlanet} hour for your work.` : currentIsBenefic ? `Although not the prescribed hour, ${currentHourInfo.planet} is a benefic planet, which supports your Khayr work.` : `The ${currentHourInfo.planet} hour provides the necessary malefic force for your Sharr work.`} Act now — this window will not remain open long.`
      : `The current moment is not suitable. The current hour is #${currentHourInfo.hourNumber} (${currentHourInfo.planet}), ${isNightTime ? 'nighttime' : 'daytime'}. ${pdfRule?.isNightRequired && !isNightTime ? `This work requires nighttime, but it is currently daytime — the Sun suppresses all spirits.` : `The ${currentHourInfo.planet} hour does not carry the planetary force your work requires.`} ${waitTime ? `You must wait approximately ${waitTime.waitText} until the next suitable hour (${waitTime.hour.planet}, starting at ${waitTime.hour.startTime}).` : 'No suitable hours remain today — wait for the next recommended day.'}`,
    citation: 'Live Astro Clock + Al-Shurut p.12',
    consequence: currentMomentSuitable ? 'Act immediately — the window closes when the hour changes.' : 'Proceeding now wastes effort and may cause the ritual to fail or rebound.',
    waitTime: waitTime ? waitTime.waitText : null,
  });

  // ── SECTION 3: TODAY'S WINDOWS ──
  report.push({
    section: "TODAY'S WINDOWS",
    icon: 'windows',
    status: bestWindowsToday.length > 0 ? `${bestWindowsToday.length} available` : 'None remaining',
    windows: bestWindowsToday.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(w => ({
      time: `${w.startTime}–${w.endTime}`,
      stars: starsToString(w.stars),
      planet: w.planet,
      hourNumber: w.hourNumber,
      period: w.period,
      reason: w.reason,
      strengthReason: `${starsToString(w.stars)} — ${w.reason}`,
    })),
    body: bestWindowsToday.length > 0
      ? `The following periods today are suitable for your work. Each window's strength is rated by stars (★★★★★ = perfect alignment, ★ = barely usable). The strength reflects whether the planetary hour matches the prescription, whether the Moon phase supports the work, and whether the time of day meets the manuscript's requirements.`
      : `No favorable periods remain today — all prescribed hours have passed. Wait for the next recommended day and hour (see below).`,
    citation: pdfRule?.source || 'Al-Shurut p.12-13',
    consequence: 'These are your power windows. Missing them means waiting for the next occurrence.',
  });

  // ── SECTION 4: BEST TIME ──
  report.push({
    section: 'BEST TIME',
    icon: 'star',
    status: topThree.length > 0 ? `${topThree.length} ranked` : 'None',
    ranked: topThree.map(w => ({
      rank: w.rank,
      time: `${w.startTime}–${w.endTime}`,
      stars: starsToString(w.stars),
      planet: w.planet,
      reason: w.rank === 1 ? `This is the strongest window today. ${w.reason}. ${pdfRule ? `The manuscript ${pdfRule.source} prescribes this hour for ${pdfRule.pdfName}.` : ''}` : w.rank === 2 ? `This is the second-best window. ${w.reason}. It is slightly weaker than the first — use it only if the primary window is missed.` : `This is the third-best window. ${w.reason}. It is a fallback option if the first two are unavailable.`,
    })),
    body: topThree.length > 0
      ? `The best, second-best, and third-best hours today are listed above. The ranking is based on the alignment of the planetary hour with your prescribed planet, the Moon phase, and the day/night requirement.`
      : `No ranked windows are available today. Consult the "If Today Is Not Good" section below for the next opportunity.`,
    citation: pdfRule?.source || 'Al-Shurut p.12',
    consequence: 'Starting at the wrong hour means the planetary ruler does not govern the request.',
  });

  // ── SECTION 5: BAD TIMES ──
  report.push({
    section: 'BAD TIMES',
    icon: 'alert',
    status: avoidWindowsToday.length > 0 ? `${avoidWindowsToday.length} to avoid` : 'None identified',
    avoid: avoidWindowsToday.map(w => ({ time: `${w.startTime}–${w.endTime}`, planet: w.planet, reason: w.reason })),
    enemyAnalysis,
    body: avoidWindowsToday.length > 0
      ? `The following periods today must be avoided: ${avoidWindowsToday.map(w => `${w.startTime}–${w.endTime} (${w.planet} — ${w.reason})`).join('; ')}. ${enemyAnalysis.note} ${khayrSharr === 'khayr' ? `Since your work is Khayr (benevolent), the enemy planets are ${enemyAnalysis.enemyRulers.join(', ')}. Avoid their hours and days entirely.` : khayrSharr === 'sharr' ? `Since your work is Sharr (banishment), the enemy planets are the benefics: ${enemyAnalysis.enemyRulers.join(', ')}. Their hours and days protect and harmonize, opposing your work.` : 'The engine will infer Khayr or Sharr from your purpose category.'}`
      : `No specifically dangerous hours were found today. However, ${enemyAnalysis.note}`,
    citation: 'Al-Shurut p.12 + Havâss p.50-56',
    consequence: 'Performing in a dangerous hour can cause the ritual to rebound — the manuscripts record cases of practitioners becoming ill after working in enemy hours.',
  });

  // ── SECTION 6: IF TODAY IS NOT GOOD ──
  report.push({
    section: 'IF TODAY IS NOT GOOD',
    icon: 'calendar-clock',
    status: nextOpportunity ? `Next: ${nextOpportunity.dayName}` : 'No future window found',
    nextHour: nextOpportunity ? { day: nextOpportunity.dayName, time: `${nextOpportunity.startTime}–${nextOpportunity.endTime}`, planet: nextOpportunity.planet, isToday: nextOpportunity.isToday, daysAhead: nextOpportunity.daysAhead } : null,
    nextMoonPhase,
    body: nextOpportunity
      ? `If today's opportunity has passed or is unsuitable, the next best time is: ${nextOpportunity.dayName}${nextOpportunity.isToday ? ' (today)' : ` (${nextOpportunity.daysAhead} day${nextOpportunity.daysAhead > 1 ? 's' : ''} from now)`}, at ${nextOpportunity.startTime}–${nextOpportunity.endTime} (${nextOpportunity.planet} hour, Hour #${nextOpportunity.hour}). ${nextMoonPhase ? `Regarding the Moon: ${nextMoonPhase.phase} — ${nextMoonPhase.reason}${nextMoonPhase.waitDays > 0 ? ` (approximately ${nextMoonPhase.waitDays} days to wait).` : ' (available now).'}` : ''}`
      : `No future opportunity was found within the next 7 days. ${nextMoonPhase ? `For the Moon phase: ${nextMoonPhase.phase} — ${nextMoonPhase.reason}${nextMoonPhase.waitDays > 0 ? ` (approximately ${nextMoonPhase.waitDays} days to wait).` : ''}` : ''} Consult the manuscripts for alternative days.`,
    citation: pdfRule?.source || 'Al-Shurut p.12-13',
    consequence: 'Waiting for the next aligned time ensures the ritual has full power.',
  });

  // ── SECTION 7: ASTRO ANALYSIS ──
  report.push({
    section: 'ASTRO ANALYSIS',
    icon: 'globe',
    status: `${astroClockStatus.day} / ${astroClockStatus.currentHour.planet}`,
    body: `Today is ${astroClockStatus.day}, ruled by ${dayRuler.planet} (${PLANET_INFO[dayRuler.planet.toLowerCase()]?.nature_en || ''}). The current planetary hour is #${currentHourInfo.hourNumber} (${currentHourInfo.planet}), ${isNightTime ? 'nighttime' : 'daytime'}, with ${currentHourInfo.remainingTime} remaining. The Moon is at Day ${moonPhase.lunarDay} (${moonPhase.phaseName}). ${elementCompatibility.assessed ? `Element compatibility: ${elementCompatibility.reason}` : ''} ${zodiacSuitability.note} Overall cosmic strength: ${verdict} (${score}%).`,
    citation: 'Live Astro Clock + Al-Shurut p.18-19 + Havâss p.50-56',
    consequence: 'The overall cosmic strength is the composite of all conditions — day, hour, Moon, element, and zodiac.',
    details: { dayRuler: dayRuler.planet, currentHour: currentHourInfo, moonPhase, dayNightSuitability, elementCompatibility, zodiacSuitability, score, verdict },
  });

  // ── SECTION 8: MANUSCRIPT EXPLANATION ──
  report.push({
    section: 'MANUSCRIPT EXPLANATION',
    icon: 'book',
    status: `${rulesApplied.length} rules applied`,
    rules: rulesApplied,
    body: `Every recommendation above is grounded in the imported manuscripts. ${pdfRule ? `Your work is classified as ${pdfRule.pdfName} (${pdfRule.category}), and the manuscript ${pdfRule.source} prescribes Day ${MIZAN_DAY_NAMES[pdfRule.bestDay]} during the ${pdfRule.bestHour} hour.` : ''} ${khayrSharr === 'khayr' ? `Because this is a Khayr work, Al-Shurut p.13 restricts you to Sa'idat hours (1st & 8th of Sun/Mon/Thu/Fri) or any benefic planet hour (Sun, Jupiter, Venus, Moon).` : khayrSharr === 'sharr' ? `Because this is a Sharr work, Al-Shurut p.13 recommends the waning Moon, especially the New Moon (محاق), for maximum dissolution power.` : ''} ${dominant ? `Your dominant element is ${dominant}; Al-Shurut p.42 directs you to face ${elementDirection?.dir} and Al-Shurut p.37 to place the talisman ${elementPlacement?.placement}.` : ''} The full list of applied rules is shown below.`,
    citation: 'All imported manuscripts (Al-Shurut, Havâss\'ın Derinlikleri, Ustad Taha)',
    consequence: 'Each rule carries the authority of its source manuscript. Ignoring a rule means working against the tradition, which the scholars warn causes failure or rebound.',
  });

  // ── SECTION 9: WARNING SECTION ──
  report.push({
    section: 'WARNING SECTION',
    icon: 'alert-triangle',
    status: warnings.length > 0 ? `${warnings.length} warnings` : 'No warnings',
    warnings,
    conflicts,
    body: warnings.length > 0
      ? warnings.map(w => `⚠ ${w}`).join(' ')
      : `No warnings — all checked conditions are favorable. ${conflicts.length > 0 ? `However, ${conflicts.length} manuscript conflict${conflicts.length > 1 ? 's' : ''} were detected and resolved.` : ''}`,
    citation: 'Al-Shurut pp.12-13, 39-40 + Havâss p.50-56',
    consequence: "Each warning identifies a condition that, if ignored, reduces the ritual's power or reverses it.",
  });

  // ── SECTION 10: FINAL DECISION ──
  report.push({
    section: 'FINAL DECISION',
    icon: 'sparkles',
    status: verdict,
    stars: starsToString(stars),
    starsCount: stars,
    color: verdictColor,
    score,
    body: `${starsToString(stars)} ${verdict}. ${verdictReason} This verdict is the composite of ${scoreReasons.length} factors: ${scoreReasons.join('; ')}. ${canPerformToday === 'Yes' ? 'You may proceed today during the optimal hours listed above.' : canPerformToday === 'Limited' ? 'You may proceed today with caution, but the ritual will be weaker than at the ideal time.' : 'Postpone to the next recommended day and hour for full power.'} ${recommendedIncense ? `Burn ${recommendedIncense} during the work (Al-Shurut p.11, 20).` : ''}`,
    citation: 'Composite of all manuscript rules',
    consequence: score >= 70 ? 'The ritual is strong — proceed with confidence.' : score >= 50 ? 'The ritual is moderate — proceed with extra focus and strict adherence to timing.' : 'The ritual is weak — postpone if possible.',
  });

  // ═══════════════════════════════════════════════════════════════
  // EXPERT NARRATIVE (opening statement)
  // ═══════════════════════════════════════════════════════════════
  const expertNarrative = [];
  expertNarrative.push(`Based on your Mizan analysis, this ritual is classified as "${pdfRule?.pdfName || 'General spiritual work'}" — ${pdfRule?.description || 'a spiritual operation requiring proper timing.'} It belongs to the category of ${ritualCategory}.`);
  if (khayrSharrInferred.inferred) {
    expertNarrative.push(`You did not explicitly select Khayr or Sharr in Mizan 8, so the engine has inferred this as a ${khayrSharr === 'khayr' ? 'Khayr (benevolent)' : 'Sharr (banishment)'} work based on the purpose category. ${khayrSharr === 'khayr' ? 'Khayr works are best performed during the waxing Moon and in Sa\'idat (auspicious) hours.' : 'Sharr works are best performed during the waning Moon, especially at the New Moon (محاق).'}`);
  } else if (khayrSharr) {
    expertNarrative.push(`You have selected this as a ${khayrSharr === 'khayr' ? 'Khayr (benevolent)' : 'Sharr (powerful/banishment)'} work. ${khayrSharr === 'khayr' ? 'Khayr works are best performed during the waxing Moon and in Sa\'idat (auspicious) hours.' : 'Sharr works are best performed during the waning Moon, especially at the New Moon (محاق).'}`);
  }
  if (dominant) {
    expertNarrative.push(`The dominant element in your text is ${dominant}, which means you should face ${elementDirection?.dir || 'Qibla'} during the ritual and place the talisman ${elementPlacement?.placement || 'appropriately'}.`);
  }
  expertNarrative.push(`The manuscripts recommend performing this work on ${bestDay ? MIZAN_DAY_NAMES[bestDay] : 'any suitable day'} during the ${bestHourPlanet || 'appropriate planetary'} hour. ${canPerformToday === 'Yes' ? 'Today meets this criteria and optimal hours are still available.' : canPerformToday === 'Limited' ? 'Today is the right day but the optimal hours have passed — proceed with caution or wait.' : 'Today does not meet the day criteria — wait for the next recommended day.'}`);

  // ═══════════════════════════════════════════════════════════════
  // RETURN COMPLETE DECISION REPORT
  // ═══════════════════════════════════════════════════════════════
  return {
    report,
    consultation: report,

    verdict, verdictColor, verdictReason, verdictStars: stars, verdictStarsString: starsToString(stars),
    confidenceScore: score, scoreBreakdown: scoreReasons,

    ritualType: pdfRule?.pdfName || 'General spiritual work',
    ritualTypeDescription: pdfRule?.description || '',
    ritualCategory,
    ritualIntent: pdfRule?.pdfName || 'General spiritual work',
    khayrSharr: khayrSharr || 'Not selected',
    khayrSharrInferred: khayrSharrInferred.inferred,
    khayrSharrMeaning: khayrSharr === 'khayr' ? 'Benevolence & blessing (الخير)' : khayrSharr === 'sharr' ? 'Power & banishment (الشر)' : 'Not determined',

    canPerformToday, canPerformTodayReason,
    currentMomentSuitable, waitTime,
    bestWindowsToday, rankedWindows, topThree,
    avoidWindowsToday,
    enemyAnalysis,
    nextOpportunity, nextMoonPhase,

    moonPhase: {
      lunarDay: moonPhase.lunarDay, phaseName: moonPhase.phaseName,
      isWaxing: moonPhase.isWaxing, isNewMoon: moonPhase.isNewMoon, isFullMoon: moonPhase.isFullMoon,
      assessment: khayrSharr === 'khayr'
        ? (moonPhase.isGoodForKhayr ? `The Moon is waxing (Day ${moonPhase.lunarDay}), ideal for Khayr works.` : `The Moon is waning (Day ${moonPhase.lunarDay}). Khayr works are weakened — wait for the next waxing cycle.`)
        : khayrSharr === 'sharr'
          ? (moonPhase.isGoodForSharr ? `The Moon is waning (Day ${moonPhase.lunarDay}), ideal for Sharr works. ${moonPhase.isNewMoon ? 'Today is near the New Moon — the most powerful time.' : ''}` : `The Moon is waxing (Day ${moonPhase.lunarDay}). Sharr works are better in the waning phase.`)
          : `The Moon is at Day ${moonPhase.lunarDay} (${moonPhase.phaseName}).`,
      citation: 'Al-Shurut p.13 (MN_001-002)',
    },

    bestPlanetaryHour: bestHourPlanet, bestRulingPlanet: bestHourPlanet,
    bestDay: bestDay ? MIZAN_DAY_NAMES[bestDay] : null, bestDayReason, bestHourReason,
    altDay: altDay ? MIZAN_DAY_NAMES[altDay] : null, altHour: altHourPlanet,

    dayNightSuitability, zodiacSuitability, elementCompatibility,
    elementDirection: dominant ? { dir: elementDirection?.dir, ar: elementDirection?.ar } : null,
    elementPlacement: dominant ? { placement: elementPlacement?.placement, ar: elementPlacement?.ar } : null,
    astroClockStatus,

    recommendedStart: topThree[0]?.startTime || nextOpportunity?.startTime || null,
    recommendedEnd: topThree[0]?.endTime || nextOpportunity?.endTime || null,
    recommendedIncense,

    rulesApplied, warnings, bookNotes, conflicts,
    expertNarrative, reasoning,
  };
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION ADVISOR — Compares current Mizan selections vs manuscript
// recommendations and produces a per-field improvement list.
// NEVER changes Mizan automatically — only explains what to change and why.
// ═══════════════════════════════════════════════════════════════
export function analyzeConfigurationAdvice({ result, selections, customPurpose, activeMethod }) {
  const base = analyzeRitualTiming({ result, selections, customPurpose, activeMethod });

  const dominant = result?.dominant || (selections?.elements?.[0] || null);
  const khayrSharrSelected = selections?.khayrSharr8 || null;
  const selectedDay = selections?.days || null;
  const selectedHour = selections?.hour || null;
  const selectedPlanet = selections?.planet || null;
  const dayNight = selections?.dayNight || null;
  const purposes = selections?.purposes || [];
  const primaryPurpose = purposes[0] || null;

  // Re-derive pdfRule + bestDay/bestHour (same logic as main function)
  let pdfRule = null;
  if (primaryPurpose && PDF_PURPOSE_TABLE[primaryPurpose]) pdfRule = PDF_PURPOSE_TABLE[primaryPurpose];
  const customMatch = matchCustomPurpose(customPurpose);
  if (customMatch && !pdfRule) pdfRule = customMatch;
  const khayrSharr = base.khayrSharr !== 'Not selected' ? base.khayrSharr : null;

  const bestDay = pdfRule?.bestDay || null;
  const altDay = pdfRule?.altDay || null;
  const bestHourPlanet = pdfRule?.bestHour || null;
  const altHourPlanet = pdfRule?.altHour || null;

  // Find the recommended hour NUMBER (manuscript sunset-aware: LIVE or MANUAL day)
  const now = new Date();
  const nowDataAdv = getTodayAllHours(now);
  const { referenceDate: cfgRefDate } = resolveManuscriptDay(selectedDay, dayNight, now, nowDataAdv.sunrise, nowDataAdv.sunset);
  const { hours: todayHours } = getTodayAllHours(cfgRefDate);
  const recommendedHourNumbers = bestHourPlanet
    ? findHoursByPlanet(todayHours, bestHourPlanet).map(h => h.hourNumber)
    : [];

  // Element recommendation based on purpose
  const PURPOSE_ELEMENT = {
    celb: 'water', tard: 'earth', sihhat: 'air', sekam: 'fire', tarfet: 'water',
    ijlal: 'air', aqd: 'earth', rizq: 'earth', harb: 'fire', tahyij: 'fire',
    hariq: 'fire', sultan: 'fire', haybah: 'fire', tashtit: 'earth',
    knowledge: 'air', travel: 'water', success: 'fire', marriage: 'water',
  };
  const recommendedElement = primaryPurpose ? PURPOSE_ELEMENT[primaryPurpose] : null;

  const recommendations = [];
  let allOptimal = true;

  // ── 1. Ritual Purpose ──
  const purposeLabel = pdfRule?.pdfName || (customPurpose ? `"${customPurpose}"` : 'Not selected');
  recommendations.push({
    field: 'Ritual Purpose',
    icon: 'target',
    current: purposeLabel,
    recommended: pdfRule?.pdfName || 'Select a purpose in Mizan 7 (or type a custom purpose)',
    isOptimal: !!pdfRule,
    reason: pdfRule
      ? `Your purpose is recognized as ${pdfRule.pdfName} (${pdfRule.category}). The manuscripts prescribe specific timing for this work — see the fields below.`
      : `No purpose was selected or matched. The engine cannot prescribe timing without knowing the ritual intent. Select a purpose in Mizan 7 or enter a custom purpose describing your goal (love, healing, wealth, protection, separation, etc.).`,
  });
  if (!pdfRule) allOptimal = false;

  // ── 2. Khayr / Sharr ──
  const khayrSharrCurrentLabel = khayrSharrSelected
    ? (khayrSharrSelected === 'khayr' ? 'Khayr (Benevolent)' : 'Sharr (Banishment)')
    : `Not selected (auto-inferred: ${khayrSharr === 'khayr' ? 'Khayr' : khayrSharr === 'sharr' ? 'Sharr' : 'unknown'})`;
  const inferredPolarity = base.khayrSharrInferred ? (khayrSharr === 'khayr' ? 'Khayr (Benevolent)' : 'Sharr (Banishment)') : null;
  const khayrOptimal = !base.khayrSharrInferred || (khayrSharrSelected && khayrSharrSelected === khayrSharr);
  recommendations.push({
    field: 'Khayr / Sharr (Mizan 8)',
    icon: 'scale',
    current: khayrSharrCurrentLabel,
    recommended: inferredPolarity || (pdfRule ? (PURPOSE_POLARITY[primaryPurpose] === 'khayr' ? 'Khayr (Benevolent)' : 'Sharr (Banishment)') : 'Select Khayr or Sharr in Mizan 8'),
    isOptimal: khayrOptimal,
    reason: base.khayrSharrInferred
      ? `You did not select Khayr or Sharr in Mizan 8, so the engine inferred ${khayrSharr === 'khayr' ? 'Khayr' : 'Sharr'} from the purpose category. To make this explicit and lock the timing rules, select ${khayrSharr === 'khayr' ? 'Khayr' : 'Sharr'} in Mizan 8. Al-Shurut p.13 applies different hour and moon restrictions to each polarity.`
      : khayrSharrSelected
        ? `You have explicitly selected ${khayrSharrSelected === 'khayr' ? 'Khayr' : 'Sharr'}, which matches the purpose category. This is optimal.`
        : `Select Khayr or Sharr in Mizan 8 to activate the polarity-specific timing rules.`,
  });
  if (!khayrOptimal) allOptimal = false;

  // ── 3. Selected Weekday ──
  const currentDayLabel = selectedDay ? MIZAN_DAY_NAMES[selectedDay] : 'Not selected';
  const recommendedDayKey = bestDay || null;
  const dayOptimal = selectedDay && (selectedDay === bestDay || (altDay && selectedDay === altDay));
  recommendations.push({
    field: 'Selected Weekday (Mizan 5)',
    icon: 'calendar',
    current: currentDayLabel,
    recommended: recommendedDayKey ? `${MIZAN_DAY_NAMES[recommendedDayKey]}${altDay ? ` or ${MIZAN_DAY_NAMES[altDay]} (alternative)` : ''}` : 'Any suitable day (no specific prescription)',
    isOptimal: dayOptimal,
    reason: !pdfRule
      ? `No day prescription is available without a recognized purpose.`
      : !selectedDay
        ? `You have not selected a day in Mizan 5. The manuscripts prescribe ${MIZAN_DAY_NAMES[bestDay]}${altDay ? ` or ${MIZAN_DAY_NAMES[altDay]}` : ''} for ${pdfRule.pdfName} (${pdfRule.source}). Select this day to strengthen the ritual.`
        : dayOptimal
          ? `Your selected day (${MIZAN_DAY_NAMES[selectedDay]}) matches the manuscript prescription for ${pdfRule.pdfName}. This is optimal.`
          : `Your selected day is ${MIZAN_DAY_NAMES[selectedDay]}, but the manuscripts prescribe ${MIZAN_DAY_NAMES[bestDay]}${altDay ? ` or ${MIZAN_DAY_NAMES[altDay]}` : ''} for ${pdfRule.pdfName} (${pdfRule.source}). The ruling planet of ${MIZAN_DAY_NAMES[selectedDay]} does not govern this type of work — changing to ${MIZAN_DAY_NAMES[bestDay]} aligns the day's planetary energy with your ritual purpose.`,
  });
  if (!dayOptimal) allOptimal = false;

  // ── 4. Selected Planet (Mizan 6) ──
  const currentPlanetLabel = selectedPlanet ? `${MIZAN_TO_EN_PLANET[selectedPlanet] || selectedPlanet}` : 'Not selected';
  const planetOptimal = selectedPlanet && bestHourPlanet && MIZAN_TO_EN_PLANET[selectedPlanet] === bestHourPlanet;
  recommendations.push({
    field: 'Selected Planet (Mizan 6)',
    icon: 'orbit',
    current: currentPlanetLabel,
    recommended: bestHourPlanet || 'Based on purpose prescription',
    isOptimal: planetOptimal,
    reason: !pdfRule
      ? `No planet prescription is available without a recognized purpose.`
      : !selectedPlanet
        ? `You have not selected a planet in Mizan 6. The manuscripts prescribe the ${bestHourPlanet} planet for ${pdfRule.pdfName} (${pdfRule.source}). Select ${bestHourPlanet} to align the planetary ruler with your work.`
        : planetOptimal
          ? `Your selected planet (${MIZAN_TO_EN_PLANET[selectedPlanet]}) matches the prescribed planet (${bestHourPlanet}) for ${pdfRule.pdfName}. This is optimal.`
          : `Your selected planet is ${MIZAN_TO_EN_PLANET[selectedPlanet]}, but the manuscripts prescribe ${bestHourPlanet} for ${pdfRule.pdfName} (${pdfRule.source}). The planetary ruler governs which spirits answer — selecting ${bestHourPlanet} ensures the correct spiritual domain is activated.`,
  });
  if (!planetOptimal) allOptimal = false;

  // ── 5. Selected Planetary Hour (Mizan 4) ──
  const currentHourLabel = selectedHour ? `Hour #${selectedHour}` : 'Not selected';
  const bestWindow = base.bestWindowsToday?.[0];
  const recommendedHourLabel = recommendedHourNumbers.length > 0 ? `Hour #${recommendedHourNumbers.join(' or #')}` : (bestWindow ? `Hour #${bestWindow.hourNumber}` : 'See live Astro Clock');
  const hourOptimal = selectedHour && recommendedHourNumbers.includes(selectedHour);
  recommendations.push({
    field: 'Selected Planetary Hour (Mizan 4)',
    icon: 'clock',
    current: currentHourLabel,
    recommended: recommendedHourLabel,
    isOptimal: hourOptimal,
    reason: !pdfRule
      ? `No hour prescription is available without a recognized purpose.`
      : !selectedHour
        ? `You have not selected an hour in Mizan 4. The ${bestHourPlanet} hour is prescribed for ${pdfRule.pdfName}. Today, this hour occurs at: ${base.bestWindowsToday?.map(w => `${w.startTime}–${w.endTime}`).join(', ') || 'no instances remain today'}.`
        : hourOptimal
          ? `Your selected hour (#${selectedHour}) is ruled by ${bestHourPlanet}, the prescribed planet for ${pdfRule.pdfName}. This is optimal.`
          : `Your selected hour is #${selectedHour}, but the ${bestHourPlanet} hour is prescribed for ${pdfRule.pdfName} (${pdfRule.source}). Today, the ${bestHourPlanet} hour occurs at: ${base.bestWindowsToday?.map(w => `${w.startTime}–${w.endTime} (Hour #${w.hourNumber})`).join(', ') || 'no instances remain today'}. Changing to the ${bestHourPlanet} hour aligns the planetary force with your ritual.`,
  });
  if (!hourOptimal) allOptimal = false;

  // ── 6. Selected Element (Mizan 2) ──
  const currentElementLabel = dominant || 'Not detected';
  const elementOptimal = !recommendedElement || dominant === recommendedElement;
  recommendations.push({
    field: 'Selected Element (Mizan 2)',
    icon: 'flame',
    current: currentElementLabel,
    recommended: recommendedElement ? recommendedElement : 'Based on your input text',
    isOptimal: elementOptimal,
    reason: !recommendedElement
      ? `Your element is derived from the input text analysis (Mizan 1). No specific element recommendation applies without a recognized purpose.`
      : !dominant
        ? `No dominant element was detected in your input text. For ${pdfRule?.pdfName || 'this work'}, the ${recommendedElement} element is recommended. Enter Arabic text containing ${recommendedElement}-aligned letters, or select ${recommendedElement} in Mizan 2.`
        : elementOptimal
          ? `Your dominant element (${dominant}) aligns with the recommended element for ${pdfRule?.pdfName || 'this work'}. This is optimal.`
          : `Your dominant element is ${dominant}, but ${recommendedElement} is recommended for ${pdfRule?.pdfName || 'this work'}. The element determines the talisman's spiritual nature, direction (Al-Shurut p.42), and placement (Al-Shurut p.37). Using ${recommendedElement} strengthens the ritual's resonance with its purpose.`,
  });
  if (!elementOptimal) allOptimal = false;

  // ── 7. Day / Night (Mizan 3) ──
  const currentDayNightLabel = dayNight ? (dayNight === 'gunduz' ? 'Day (Gunduz)' : 'Night (Gece)') : 'Not selected';
  const recommendedDayNight = pdfRule?.isNightRequired ? 'Night (Gece)' : (dayNight === 'gece' ? 'Night (Gece) — preferred' : 'Either (Night preferred)');
  const dayNightOptimal = !pdfRule?.isNightRequired || dayNight === 'gece';
  recommendations.push({
    field: 'Day / Night (Mizan 3)',
    icon: 'sunset',
    current: currentDayNightLabel,
    recommended: recommendedDayNight,
    isOptimal: dayNightOptimal,
    reason: !pdfRule
      ? `No day/night preference without a recognized purpose.`
      : pdfRule?.isNightRequired
        ? dayNight === 'gece'
          ? `You selected Night, which is required for ${pdfRule.pdfName}. The Sun suppresses spirits during daylight (Al-Shurut p.39-40, NGT_002). This is optimal.`
          : `You selected Day, but ${pdfRule.pdfName} MUST be performed at night — the Sun suppresses all spirits during daylight (Al-Shurut p.39-40, NGT_002). Change to Night (Gece) in Mizan 3.`
        : dayNight === 'gece'
          ? `You selected Night, which is preferred for all spiritual works (Al-Shurut p.39, NGT_001). This is optimal.`
          : `You selected Day. While acceptable for ${pdfRule.pdfName}, the manuscripts state that night is superior to day for all spiritual works because the Sun no longer suppresses the spirits (Al-Shurut p.39). Consider Night (Gece) for a stronger result.`,
  });
  if (!dayNightOptimal) allOptimal = false;

  // ── 8. Selected Time (live, today) ──
  const _rtLocAdv = getUserLocation();
  const currentClock = now.toLocaleTimeString('en-US', { timeZone: _rtLocAdv.tz || undefined, hour: '2-digit', minute: '2-digit' });
  const recommendedTime = bestWindow ? `${bestWindow.startTime}–${bestWindow.endTime}` : (base.nextOpportunity ? `${base.nextOpportunity.startTime}–${base.nextOpportunity.endTime} (${base.nextOpportunity.dayName})` : 'No optimal time today');
  const timeOptimal = bestWindow && base.currentMomentSuitable;
  recommendations.push({
    field: 'Best Time to Perform (Today)',
    icon: 'timer',
    current: `Now: ${currentClock}`,
    recommended: recommendedTime,
    isOptimal: timeOptimal,
    reason: !pdfRule
      ? `No time recommendation without a recognized purpose.`
      : !bestWindow
        ? `No optimal ${bestHourPlanet} hours remain today. The next opportunity is ${base.nextOpportunity ? `${base.nextOpportunity.startTime}–${base.nextOpportunity.endTime} on ${base.nextOpportunity.dayName}` : 'not within 7 days'}. Wait for this window before performing the ritual.`
        : timeOptimal
          ? `The current moment falls within an optimal ${bestWindow.planet} hour (${bestWindow.startTime}–${bestWindow.endTime}). You may perform the ritual now.`
          : `The current time is ${currentClock}, but the optimal window today is ${bestWindow.startTime}–${bestWindow.endTime} (${bestWindow.planet} hour, ${pdfRule.source}). Wait until this time to perform the ritual for maximum planetary alignment. This is a live recommendation based on today's actual planetary hours and current moon phase.`,
  });
  if (!timeOptimal) allOptimal = false;

  // ── 9. Zodiac (not in Mizan selections) ──
  recommendations.push({
    field: 'Zodiac Sign',
    icon: 'sparkles',
    current: 'Not selected in Mizan',
    recommended: base.zodiacSuitability?.bestSigns?.length > 0 ? `Best for targets born under: ${base.zodiacSuitability.bestSigns.map(z => z.sign).join(', ')}` : 'No specific zodiac prescription for today',
    isOptimal: true, // informational only — not a Mizan field
    reason: `Zodiac sign is not part of the Mizan selections. Today (${base.astroClockStatus.day}) is optimal for rituals targeting people born under: ${base.zodiacSuitability?.bestSigns?.map(z => z.sign).join(', ') || 'no specific sign'}. If you know your target's natal sign, performing the ritual on a day that matches their sign amplifies the work (Al-Shurut p.18-19, Omani Systems A & B). This is informational — no Mizan change is required.`,
  });

  // ── 10. Star / Nakshatra (not in Mizan selections) ──
  recommendations.push({
    field: 'Star / Nakshatra',
    icon: 'star',
    current: 'Not available in Mizan',
    recommended: 'Consult the Astro Clock module',
    isOptimal: true, // informational only
    reason: `Nakshatra (lunar mansion) selection is not part of the Nine Mizan. The Astro Clock module tracks the current lunar mansion in real time. For works requiring a specific nakshatra, consult the Astro Clock page and perform the ritual when the Moon enters the prescribed mansion. This is informational — no Mizan change is required.`,
  });

  return { recommendations, allOptimal, base };
}