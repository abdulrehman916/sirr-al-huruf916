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
import * as O from "./kashfOtherSources.js";
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
/**
 * The Sun's ecliptic longitude, to a fraction of a degree — enough to
 * say which sign it stands in, and so whether it shares that sign
 * with the Moon (الاجتماع / Birleşim).
 */
function sunLonAt(ms) {
  const d = ms / 86400000 + 2440587.5 - 2451545.0;      // days from J2000
  const g = ((357.529 + 0.98560028 * d) % 360) * Math.PI / 180;
  const q = (280.459 + 0.98564736 * d) % 360;
  const lon = q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g);
  return ((lon % 360) + 360) % 360;
}

/**
 * Sun and Moon in one sign. Hâvâss I p.160 holds that no wafq is
 * made then; the Astro Clock only reports it — it does not score it,
 * because the book's rule is about making a wafq, not about travel
 * or trade or the rest of the day's aims.
 */
export function ijtimaAt(ms) {
  const m = moonAt(ms);
  if (!m) return null;
  const sLon = sunLonAt(ms);
  const sSign = Math.floor(sLon / 30);
  let sep = Math.abs(m.lon - sLon) % 360;
  if (sep > 180) sep = 360 - sep;
  return { same: sSign === m.sign, sunSign: sSign, moonSign: m.sign, sep, waxing: m.waxing };
}

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
  // Hâvâss I p.161 settles the day of the wafq's planet, then that
  // planet's own hour — the strongest pairing a day offers.
  if (hour.planet === day.wdInfo.planet) {
    s += 12;
    why.push(R(`${p.tr_ml} ദിവസത്തിൽ ${p.tr_ml}ന്റെ സാഅത്ത് — ഏറ്റവും ചേർച്ച`,
               `The hour of ${p.tr_en} on its own day — the closest pairing`));
  }
  // Kashf p.56: the planet whose fortune falls on this day.
  if (K.DAY_SAAD && hour.planet === K.DAY_SAAD[day.weekday]) {
    s += 9;
    why.push(R("ഈ ദിവസത്തിന്റെ സഅ്ദ് ഈ ഗ്രഹത്തിന്റേതാണ്", "This day's fortune belongs to this planet"));
  }
  // and its ascendant, the same page
  if (K.DAY_TALI && hour.planet === K.DAY_TALI[day.weekday]) {
    s += 5;
    why.push(R("ഈ ദിവസത്തിന്റെ ത്വാലിഅ്", "The ascendant of this day"));
  }
  const j = K.JAAD[day.weekday];
  if (j && (j.saad === hour.planet || j.baraka === hour.planet)) { s += 8; why.push(R("ശൈഖ് ജാഇദിന്റെ പട്ടികയിൽ സഅ്ദ്/ബറക്ക", "Sa'd / baraka in Sheikh Jaad's table")); }
  // Al-Siraji: the contract is better by night. Reported, not scored.
  if (a === "marriage" && hour.period === "night") why.push(R(K.SIRAJI_NIKAH_RULES.night.ml, K.SIRAJI_NIKAH_RULES.night.en, "siraji"));
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
  // Al-Siraji's verdict for the manzil — reported beside the others,
  // never added to the score.
  if (a === "marriage" && K.SIRAJI_NIKAH?.[m.mansionNo]) {
    const sj = K.SIRAJI_NIKAH[m.mansionNo];
    why.push(R(`സിറാജി: ${sj.ar} (${K.SIRAJI_KIND_LABEL[sj.kind].ml}) — ${sj.ml}`,
               `Al-Siraji: ${sj.ar} (${K.SIRAJI_KIND_LABEL[sj.kind].en}) — ${sj.en}`, "siraji"));
  }
  // Hâvâss I p.160 pairs a constructive work with the waxing Moon.
  // It is counted as a help here, never as a gate — holding every
  // good work back for half of each month is not what the day cards
  // are for.
  if (m.waxing) {
    if (s >= 50) s += 5;
    why.push(R("ഖമർ വളരുന്നു — നല്ല കർമ്മത്തിന് അനുകൂലം", "The Qamar is waxing — favourable for constructive work"));
  } else {
    why.push(R("ഖമർ ക്ഷയിക്കുന്നു", "The Qamar is waning"));
  }
  return clamp(s);
}

// ── The Moon's standing, and how severe a time is ──────────────
// Waning on its own says little. What the books weigh is where the
// Moon stands while it wanes — its burj and its manzil — and whether
// the day and the hour agree with it. So the state is reported whole,
// and the severity is the count of what the books mark as nahs, with
// each one named and sourced rather than folded into a number.

/**
 * The Moon's full standing at one hour: its phase, its burj, its
 * manzil, and every nahs mark the books put on them.
 */
export function moonState(hour, day) {
  const m = hour?.moon;
  if (!m?.mansion) return null;
  const marks = [];
  const sign = m.sign, mn = m.mansion, no = m.mansionNo;

  // Waning is the Moon's ordinary state for half of every month, and
  // Hâvâss states a preference for the waxing Moon rather than calling
  // the waning Moon nahs. So it is reported, but tagged "info" and
  // left out of the severity count; muhaq and ijtima below are the
  // phase marks the books actually treat as nahs.
  if (!m.waxing) {
    marks.push(R("ഖമർ ക്ഷയിക്കുന്നു — നല്ല കർമ്മത്തിന് വളരുന്ന ഖമറിനെയാണ് ചേർത്തുപറയുന്നത്",
                 "The Qamar is waning — constructive work goes with the waxing Moon", "info"));
  }
  if (O.TAHA_NAHS_BURUJ.includes(sign)) {
    marks.push(R(`ഖമർ ${K.SIGNS_TR_ML[sign]} ബുർജിൽ — ഉസ്താദ് താഹ പ്രകാരം നഹ്സ്`,
                 `Qamar in ${K.SIGNS_TR_EN[sign]} — nahs according to Ustad Taha`, "burj"));
  }
  if (sign === K.MAKRUH_AQD.moonInScorpio.sign) {
    marks.push(R(`ഖമർ അഖ്റബിൽ — അഖ്ദ് കറാഹത്ത്`,
                 `Qamar in Aqrab — contracts disliked`, "burj"));
  }
  if (mn.nature === "nahs") {
    marks.push(R(`മൻസിൽ ${no} ${mn.ml} — ഖറൂസ്വിയുടെ പട്ടികയിൽ നഹ്സ്`,
                 `Manzil ${no} ${K.MANSIONS_EN[no].name} — nahs in al-Kharusi's table`, "manzil"));
  }
  // What the book itself attaches to this manzil. This is not a
  // reason the time is nahs — it is what al-Kharusi's table says the
  // manzil is for — so it carries its own tag and is reported apart
  // from the nahs marks, in the book's words, with its page.
  const work = K.MANSION_WORK[no];
  if (work) {
    marks.push(R(`${work.ml} — ${work.ar}`, `${work.en} — ${work.ar}`, "work"));
  }
  if (day?.isMuhaq) {
    marks.push(R(`മുഹാഖ് — മാസാവസാനത്തെ മൂന്ന് ദിവസം`,
                 `Muhaq — the month's last three days`, "phase"));
  }
  const ij = ijtimaAt((hour.start + hour.end) / 2);
  if (ij && ij.sep < 12) {
    marks.push(R(`ഇജ്തിമാഅ് അടുത്ത് — ശംസും ഖമറും ${ij.sep.toFixed(1)}° അകലെ; ഈ സമയത്ത് വഫ്ഖ് ഉണ്ടാക്കരുത്`,
                 `Near ijtima' — Sun and Moon ${ij.sep.toFixed(1)}° apart; no wafq is made at this time`, "phase"));
  }
  return {
    waxing: m.waxing, sign, mansionNo: no, mansion: mn, work, ijtima: ij,
    marks, nahsCount: marks.length,
  };
}

// Severity goes by how many SIDES carry a nahs mark — the day, the
// hour, the Moon's burj, its manzil, its phase — not by how many
// marks there are. Counting marks makes a waning Moon, which is half
// of every month, weigh as much as the day and the hour agreeing
// against it, and then almost every hour reads as severe and the
// warning stops meaning anything.
const SEVERITY = {
  0: { key: "clear",   ml: "നഹ്സ് അടയാളമില്ല",            en: "No nahs marks" },
  1: { key: "some",    ml: "നഹ്സ് ഉണ്ട് — ഒരു വശത്ത്",      en: "Nahs — on one side" },
  2: { key: "strong",  ml: "ശക്തമായ നഹ്സ് — രണ്ട് വശങ്ങൾ",  en: "Strong nahs — two sides" },
  3: { key: "severe",  ml: "വളരെ നീചം — മൂന്നോ അതിലധികമോ വശങ്ങൾ ഒത്തുവരുന്നു", en: "Very severe — three or more sides agree" },
};

/**
 * How severe a given hour is, counting the nahs marks the books put
 * on the day, the hour and the Moon together. Nothing is invented:
 * every mark carries the rule it comes from.
 */
export function timeSeverity(day, hour) {
  const marks = [];
  if (day?.isNahsDay) {
    if (day.isKamil) marks.push(R(`ദിവസം ${day.lunarDay} — കവാമിലുന്നുഹൂസ്`, `Day ${day.lunarDay} — Kawamil al-nuhus`, "day"));
    if (day.isKhalili) marks.push(R("ഖലീലിയുടെ മാസനഹ്സ് ദിവസം", "Al-Khalili's nahs day of the month", "day"));
    if (day.isLastWed) marks.push(R(`മാസത്തിലെ അവസാന ബുധൻ — അർബആഅ് ലാ തദൂർ`, `The month's last Wednesday — Arbi'a la tadur`, "day"));
    if (day.monthDay?.nature === "bad") marks.push(R(`ചാന്ദ്രദിനം ${day.lunarDay} നഹ്സ്`, `Lunar day ${day.lunarDay} is nahs`, "day"));
  }
  const hp = K.PLANETS[hour.planet];
  if (hp && (hp.nature === "nahs_akbar" || hp.nature === "nahs_asghar")) {
    marks.push(R(`സാഅത്ത് ${hp.tr_ml} — ${K.NATURE_LABEL[hp.nature].ml}`,
                 `${hp.tr_en} hour — ${K.NATURE_LABEL[hp.nature].en}`, "hour"));
  }
  const ms = moonState(hour, day);
  if (ms) marks.push(...ms.marks);

  // "info" and "work" marks are reported but do not raise the
  // severity: one is the Moon's ordinary state, the other is what the
  // book attaches to the time rather than a mark against it.
  const sides = new Set(
    marks.filter((x) => x.tag !== "info" && x.tag !== "work").map((x) => x.tag)
  ).size;
  const level = SEVERITY[sides > 3 ? 3 : sides];
  return { marks, count: marks.length, sides, level, moon: ms };
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

// Shared time helpers (used by kashfNextTimes.js for "when does it come next").
export { tzFor, civilOf, addDays, sunOf, hijriOf, moonAt };
