// ═══════════════════════════════════════════════════════════════
// KASHF SAAT ENGINE — 24 planetary hours + per-activity % advice
//
// Day boundary (Kashf p.65): a day = the PRECEDING night + its daytime.
// After today's sunset the night belongs to TOMORROW. So the 24 cards
// always show one whole planetary day: its night (12) then its day (12).
//
// Every hour is built from absolute timestamps (ms) in the chosen
// location's own time zone — never the browser's.
// ═══════════════════════════════════════════════════════════════
import * as K from "./kashfSaatData.js";
import { calculateSunriseSunset, getTzOffsetHours } from "./astroClockSunriseSunset.js";
import { calculateMoonPosition } from "./astroClockMoonPosition.js";

const HOUR_MS = 3600e3;
const DAY_MS = 24 * HOUR_MS;
// Index into PLANET_ORDER of each weekday's ruler (Sun..Sat)
const DAY_RULER_INDEX = [3, 6, 2, 5, 1, 4, 0];

// ── Time helpers ───────────────────────────────────────────────
function tzFor(loc, ms) {
  const iana = loc?.tz || (typeof loc?.timezone === "string" ? loc.timezone : null);
  const o = iana ? getTzOffsetHours(iana, new Date(ms)) : null;
  if (typeof o === "number" && isFinite(o)) return o;
  const n = Number(loc?.timezone);
  return isFinite(n) ? n : 4;
}
function civilOf(ms, loc) {
  const tz = tzFor(loc, ms);
  const d = new Date(ms + tz * HOUR_MS);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), wd: d.getUTCDay() };
}
function addDays(c, n) {
  const d = new Date(Date.UTC(c.y, c.m, c.d + n, 12));
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), wd: d.getUTCDay() };
}
function sunOf(c, loc) {
  const noonUtc = Date.UTC(c.y, c.m, c.d, 12);
  const tz = tzFor(loc, noonUtc);
  const s = calculateSunriseSunset(new Date(c.y, c.m, c.d, 12), loc.lat, loc.lng, tz);
  const midnight = Date.UTC(c.y, c.m, c.d) - tz * HOUR_MS;
  return { rise: midnight + (s.sunrise ?? 6.5) * HOUR_MS, set: midnight + (s.sunset ?? 18.25) * HOUR_MS };
}

// ── Hijri (Umm al-Qura, astronomical — matches Kashf p.65-66) ──
function hijriOf(c) {
  const at = new Date(Date.UTC(c.y, c.m, c.d, 12));
  for (const cal of ["islamic-umalqura", "islamic-civil", "islamic"]) {
    try {
      const parts = new Intl.DateTimeFormat(`en-u-ca-${cal}`, { timeZone: "UTC", day: "numeric", month: "numeric", year: "numeric" }).formatToParts(at);
      const get = (t) => parseInt(parts.find((p) => p.type === t)?.value, 10);
      const day = get("day"), month = get("month"), year = get("year");
      if (day && month) return { day, month, year };
    } catch (_) { /* try next calendar */ }
  }
  return null;
}

// ── Moon at an instant (Kashf mansion division: equal parts from 0° Aries, p.127) ──
function moonAt(ms) {
  try {
    const mp = calculateMoonPosition(new Date(ms));
    const lon = ((parseFloat(mp.longitude) % 360) + 360) % 360;
    const mansionNo = Math.floor(lon / (360 / 28)) + 1;
    const sign = Math.floor(lon / 30);
    return { lon, mansionNo, mansion: K.MANSIONS[mansionNo], sign, waxing: !!mp.isWaxing };
  } catch (_) {
    return null;
  }
}

// ── Day facts (shared by all 24 cards of one planetary day) ────
export function getDayFacts(pDay, isNightNow = false) {
  const wdInfo = K.WEEKDAYS[pDay.wd];
  const h = hijriOf(pDay);
  const next7 = hijriOf(addDays(pDay, 7));
  const tomorrow = hijriOf(addDays(pDay, 1));
  const lunarDay = h?.day ?? null;
  const md = lunarDay ? K.MONTH_DAYS[lunarDay] : null;
  const isKamil = lunarDay ? K.KAWAMIL.includes(lunarDay) : false;
  const isKhalili = h ? K.KHALILI_NAHS[h.month] === lunarDay : false;
  const isLastWed = pDay.wd === 3 && h && next7 && next7.month !== h.month;
  const monthEndsSoon = h && tomorrow && (tomorrow.month !== h.month || hijriOf(addDays(pDay, 2))?.month !== h.month || hijriOf(addDays(pDay, 3))?.month !== h.month);
  const isNahsDay = isKamil || isKhalili || isLastWed || md?.nature === "bad";
  return {
    weekday: pDay.wd, wdInfo, hijri: h, lunarDay, monthDay: md,
    isKamil, isKhalili, isLastWed, isMuhaq: !!monthEndsSoon, isNahsDay,
    hijriLabel_ml: h ? `${h.day} ${K.HIJRI_MONTHS_ML[h.month - 1]} ${h.year}` : "",
    hijriLabel_en: h ? `${h.day} ${K.HIJRI_MONTHS_EN[h.month - 1]} ${h.year}` : "",
    hijriMonth_ar: h ? K.HIJRI_MONTHS_AR[h.month - 1] : "",
    isNightNow,
  };
}

// ── Scoring ────────────────────────────────────────────────────
// Each reason is bilingual: { ml, en, tag? }
const R = (ml, en, tag) => ({ ml, en, tag });
const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));

function dayScore(a, day, hour, why) {
  const md = day.monthDay;
  let s = md ? (md.nature === "good" ? 70 : md.nature === "mixed" ? 50 : 15) : 60;
  if (md?.good.includes(a)) { s = 90; why.push(R(`ചാന്ദ്രദിവസം ${day.lunarDay}: നല്ലത്`, `Lunar day ${day.lunarDay}: good`)); }
  if (md?.avoid.includes(a)) { s = Math.min(s, 10); why.push(R(`ചാന്ദ്രദിവസം ${day.lunarDay}: ഒഴിവാക്കുക`, `Lunar day ${day.lunarDay}: avoid`)); }
  if (day.wdInfo.good.includes(a)) { s += 10; why.push(R(`യൗമുൽ ${day.wdInfo.tr_ml} (${day.wdInfo.ml}) ഇതിന് നല്ല ദിവസം`, `Yawm al-${day.wdInfo.tr_en} (${day.wdInfo.en}) is good for this`)); }
  if (a === "clothes") {
    if (day.wdInfo.clothes === "bad") { s = Math.min(s, 20); why.push(R(`${day.wdInfo.clothesNote_ml}`, `${day.wdInfo.clothesNote_en}`)); }
    else s += 10;
  }
  if (day.isKamil) {
    s = Math.min(s, K.KAWAMIL_AVOID.includes(a) ? 10 : 30);
    why.push(R(`കവാമിൽ നഹ്സ് ദിവസം (${day.lunarDay})`, `Kawamil nahs day (${day.lunarDay})`));
  }
  if (day.isKhalili) { s = Math.min(s, 10); why.push(R("ഖലീലിയുടെ മാസ-നഹ്സ് ദിവസം", "Al-Khalili's monthly nahs day")); }
  if (day.isLastWed) { s = Math.min(s, 15); why.push(R("മാസത്തിലെ അവസാന അർബിആഅ് (ബുധൻ)", "Last Arbi'a (Wednesday) of the month")); }
  if (a === "marriage" && day.weekday === 3 && hour.period === "day") { s = Math.min(s, 20); why.push(R("അർബിആഅ് (ബുധൻ) പകലിൽ നിക്കാഹ് വേണ്ട, രാത്രി ആകാം", "No nikah on Arbi'a (Wednesday) daytime; its night is fine")); }
  if (a === "marriage" && day.isMuhaq) { s = Math.min(s, 15); why.push(R("മാസാവസാന ദിവസങ്ങൾ (മുഹാഖ്)", "Last days of the month (muhaq)")); }
  return clamp(s);
}

function hourScore(a, day, hour, why) {
  const p = K.PLANETS[hour.planet];
  let s = p.base;
  if ((K.PLANET_AFFINITY[hour.planet] || []).includes(a)) { s += 15; why.push(R(`${p.tr_ml} (${p.ml}) സാഅത്ത് ഇതിന് യോജിച്ചത്`, `Hour of ${p.tr_en} (${p.en}) suits this`)); }
  if (hour.period === "day") {
    if (K.IJABA_HOUR[day.weekday] === hour.num && a === "needs") { s += 20; why.push(R("ഇജാബത്തിന്റെ സാഅത്ത്", "Sa'at al-ijaba — hour of answered du'a", "ijaba")); }
    if (K.MUGHALABA_HOUR[day.weekday] === hour.num && a === "officials") { s += 15; why.push(R("മുഗാലബയുടെ (ജയം) സാഅത്ത്", "Sa'at al-mughalaba — hour of victory", "ghalaba")); }
    if (K.MASTERS_HOURS.days.includes(day.weekday) && K.MASTERS_HOURS.hours.includes(hour.num)) { s += 10; why.push(R("നല്ല കാര്യങ്ങൾക്ക് ശ്രേഷ്ഠ സാഅത്ത്", "An excellent hour for good works")); }
  }
  const j = K.JAAD[day.weekday];
  if (j && (j.saad === hour.planet || j.baraka === hour.planet)) { s += 8; why.push(R("ശൈഖ് ജാഇദിന്റെ പട്ടികയിൽ സഅ്ദ്/ബറക്ക", "Sa'd / baraka in Sheikh Jaad's table")); }
  if (a === "needs" && hour.moon && K.MOON_SIGN_NEEDS_HOUR[hour.moon.sign] === hour.planet) { s += 10; why.push(R("ഖമറിന്റെ ബുർജിന് പറ്റിയ സാഅത്ത്", "Hour that matches the Qamar's burj")); }
  return clamp(s);
}

function moonScore(a, hour, why) {
  const m = hour.moon;
  if (!m?.mansion) return 50;
  const mn = m.mansion;
  let s = mn.nature === "saad" ? 65 : mn.nature === "mixed" ? 50 : 35;
  if (mn.good.includes(a)) { s = 85; why.push(R(`ഖമർ ${mn.ml} മൻസിലിൽ — ഹെർമിസ് പ്രകാരം നല്ലത്`, `Qamar in ${K.MANSIONS_EN[m.mansionNo].name} — good according to Hermes`)); }
  if (mn.avoid.includes(a)) { s = 15; why.push(R(`ഖമർ ${mn.ml} മൻസിലിൽ — ഹെർമിസ് പ്രകാരം ഒഴിവാക്കുക`, `Qamar in ${K.MANSIONS_EN[m.mansionNo].name} — avoid according to Hermes`)); }
  if (a === "travel" && K.TRAVEL_GOOD_MANSIONS.includes(m.mansionNo)) { s = Math.max(s, 80); why.push(R("യാത്രയ്ക്ക് നല്ല മൻസിൽ — ദുൽ-ഗബ്റ പ്രകാരം", "A good manzil for travel — according to Dhu al-Ghabra")); }
  if (a === "marriage" && K.MARRIAGE_GOOD_MANSIONS.includes(m.mansionNo)) { s = Math.max(s, 80); why.push(R("നിക്കാഹിന് നല്ല മൻസിൽ — ദുൽ-ഗബ്റ പ്രകാരം", "A good manzil for nikah — according to Dhu al-Ghabra")); }
  if (a === "marriage" && m.sign === 7) { s = Math.min(s, 10); why.push(R("ഖമർ അഖ്റബിൽ (വൃശ്ചികം): നിക്കാഹ് വേണ്ട", "Qamar in Aqrab (Scorpio): no nikah")); }
  if (m.waxing && s >= 50) s += 5;
  return clamp(s);
}

export function scoreActivities(day, hour) {
  return K.ACTIVITIES.map((act) => {
    const why = [];
    const d = dayScore(act.id, day, hour, why);
    const h = hourScore(act.id, day, hour, why);
    const m = moonScore(act.id, hour, why);
    let total = d * K.WEIGHTS.day + h * K.WEIGHTS.hour + m * K.WEIGHTS.moon;
    if (d <= 15) total = Math.min(total, 25); // a nahs day cannot be rescued by a good hour
    total = clamp(total);
    const verdict = total >= 65 ? "do" : total >= 40 ? "care" : "avoid";
    return { ...act, total, parts: { day: d, hour: h, moon: m }, verdict, why };
  }).sort((x, y) => y.total - x.total);
}

// ── The 24 cards ───────────────────────────────────────────────
export function getPlanetaryDay(nowMs, loc) {
  const today = civilOf(nowMs, loc);
  const sunToday = sunOf(today, loc);
  const pDay = nowMs >= sunToday.set ? addDays(today, 1) : today;
  const sunP = sunOf(pDay, loc);
  const sunPrev = sunOf(addDays(pDay, -1), loc);
  const nightLen = (sunP.rise - sunPrev.set) / 12;
  const dayLen = (sunP.set - sunP.rise) / 12;
  const ruler = DAY_RULER_INDEX[pDay.wd];
  const isNightNow = nowMs < sunP.rise;
  const day = getDayFacts(pDay, isNightNow);

  const hours = [];
  for (let i = 0; i < 24; i++) {
    const night = i < 12;
    const k = night ? i : i - 12;
    const start = night ? sunPrev.set + k * nightLen : sunP.rise + k * dayLen;
    const end = start + (night ? nightLen : dayLen);
    const planet = K.PLANET_ORDER[(ruler + (night ? 2 : 0) + k) % 7];
    const status = nowMs >= end ? "past" : nowMs >= start ? "current" : "upcoming";
    const hour = { period: night ? "night" : "day", num: k + 1, planet, start, end, status, moon: moonAt((start + end) / 2) };
    hour.activities = scoreActivities(day, hour);
    hour.score = Math.round(hour.activities.reduce((s, a) => s + a.total, 0) / hour.activities.length);
    hours.push(hour);
  }
  const tz = tzFor(loc, nowMs);
  return { pDay, day, hours, tz, sunrise: sunP.rise, sunset: sunP.set, prevSunset: sunPrev.set, current: hours.find((h) => h.status === "current") || null };
}

export function formatClock(ms, tz) {
  const d = new Date(ms + tz * HOUR_MS);
  let h = d.getUTCHours();
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}
