// ═══════════════════════════════════════════════════════════════
// KASHF "NEXT TIME" HELPERS — every rule that names a moon position,
// a lunar day or a weekday hour also says WHEN it next happens.
//   moonSpan('mansion'|'sign', idx0, fromMs)  → { current, start, end }
//   nextLunarDays(test, fromMs, loc, count)   → Kashf days (sunset → sunset)
//   nextWeekdayHour(wd, num, fromMs, loc)     → day-hour num of the next such weekday
//   nextPlanetHourIn(planet, span, loc)       → first hour of a planet inside a span
// All times are absolute ms; format with fmtWhen / fmtSpan in the location's zone.
// ═══════════════════════════════════════════════════════════════
import { findLongitudeCrossing, calculateMoonPosition } from "./astroClockMoonPosition.js";
import { getPlanetaryDay, tzFor, civilOf, addDays, sunOf, hijriOf } from "./kashfSaatEngine.js";

const HOUR = 3600e3, DAY = 24 * HOUR;

function lonAt(ms) {
  const mp = calculateMoonPosition(new Date(ms));
  return ((parseFloat(mp.longitude) % 360) + 360) % 360;
}

/** When the Moon is (or will next be) inside a mansion / sign. idx0 is 0-based. */
export function moonSpan(kind, idx0, fromMs) {
  try {
    const width = kind === "mansion" ? 360 / 28 : 30;
    const lo = idx0 * width, hi = (lo + width) % 360;
    const lon = lonAt(fromMs);
    const inside = lon >= lo && lon < lo + width;
    if (inside) {
      const back = kind === "mansion" ? 48 : 96;
      const s = findLongitudeCrossing(new Date(fromMs - back * HOUR), lo, back);
      const e = findLongitudeCrossing(new Date(fromMs), hi, kind === "mansion" ? 48 : 96);
      return { current: true, start: s ? s.getTime() : null, end: e ? e.getTime() : null };
    }
    const s = findLongitudeCrossing(new Date(fromMs), lo, 24 * 30);
    if (!s) return null;
    const e = findLongitudeCrossing(s, hi, kind === "mansion" ? 48 : 96);
    return { current: false, start: s.getTime(), end: e ? e.getTime() : null };
  } catch (_) {
    return null;
  }
}

/**
 * Next Kashf days (a day = the preceding night + its daytime, so it runs
 * from the previous sunset to this day's sunset) whose Hijri date passes test.
 * test({ hijri, civil, next7 }) → boolean
 */
export function nextLunarDays(test, fromMs, loc, count = 1, maxDays = 400) {
  const out = [];
  try {
    const today = civilOf(fromMs, loc);
    for (let i = 0; i <= maxDays && out.length < count; i++) {
      const c = addDays(today, i);
      const h = hijriOf(c);
      if (!h) continue;
      const lazyNext7 = () => hijriOf(addDays(c, 7));
      if (!test({ hijri: h, civil: c, next7: lazyNext7 })) continue;
      const start = sunOf(addDays(c, -1), loc).set;
      const end = sunOf(c, loc).set;
      if (end <= fromMs) continue;
      out.push({ civil: c, hijri: h, start, end, current: fromMs >= start });
    }
  } catch (_) { /* fall through */ }
  return out;
}

/** Day-hour `num` (1-12) of the next weekday `wd` (0 = Sunday) that is still ahead. */
export function nextWeekdayHour(wd, num, fromMs, loc, period = "day") {
  try {
    const today = civilOf(fromMs, loc);
    for (let i = 0; i <= 8; i++) {
      const c = addDays(today, i);
      if (c.wd !== wd) continue;
      const noon = sunOf(c, loc).rise + 3 * HOUR;
      const pd = getPlanetaryDay(noon, loc);
      const h = pd.hours.find((x) => x.period === period && x.num === num);
      if (h && h.end > fromMs) return { start: h.start, end: h.end, planet: h.planet, current: fromMs >= h.start };
    }
  } catch (_) { /* fall through */ }
  return null;
}

/** First planetary hour of `planet` that overlaps [span.start, span.end]. */
export function nextPlanetHourIn(planet, span, loc, fromMs) {
  if (!span?.start) return null;
  try {
    const from = Math.max(span.start, fromMs || 0);
    const until = span.end || from + 3 * DAY;
    for (let t = from; t < until + DAY; t += DAY / 2) {
      const pd = getPlanetaryDay(t, loc);
      const h = pd.hours.find((x) => x.planet === planet && x.end > from && x.start < until);
      if (h) return { start: h.start, end: h.end, period: h.period, num: h.num, current: (fromMs || 0) >= h.start };
    }
  } catch (_) { /* fall through */ }
  return null;
}

// ── Formatting in the location's time zone ─────────────────────
const WD_ML = ["ഞായർ", "തിങ്കൾ", "ചൊവ്വ", "ബുധൻ", "വ്യാഴം", "വെള്ളി", "ശനി"];
const WD_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MO_ML = ["ജനുവരി", "ഫെബ്രുവരി", "മാർച്ച്", "ഏപ്രിൽ", "മേയ്", "ജൂൺ", "ജൂലൈ", "ഓഗസ്റ്റ്", "സെപ്റ്റംബർ", "ഒക്ടോബർ", "നവംബർ", "ഡിസംബർ"];
const MO_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function fmtWhen(ms, loc, isEn, withDate = true) {
  if (!ms) return "—";
  const tz = tzFor(loc, ms);
  const d = new Date(ms + tz * HOUR);
  let h = d.getUTCHours();
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const time = `${h}:${m} ${ap}`;
  if (!withDate) return time;
  const wd = d.getUTCDay(), day = d.getUTCDate(), mo = d.getUTCMonth();
  return isEn ? `${WD_EN[wd]} ${day} ${MO_EN[mo]}, ${time}` : `${WD_ML[wd]}, ${day} ${MO_ML[mo]}, ${time}`;
}

export function fmtDate(c, isEn) {
  return isEn ? `${WD_EN[c.wd]} ${c.d} ${MO_EN[c.m]} ${c.y}` : `${WD_ML[c.wd]}, ${c.d} ${MO_ML[c.m]} ${c.y}`;
}

/** "Sun 26 Oct, 9:12 AM – 10:05 AM" (end date shown only if it differs). */
export function fmtSpan(span, loc, isEn) {
  if (!span?.start) return "—";
  const a = fmtWhen(span.start, loc, isEn);
  if (!span.end) return a;
  const sameDay = civilOf(span.start, loc).d === civilOf(span.end, loc).d && span.end - span.start < DAY;
  return `${a} – ${fmtWhen(span.end, loc, isEn, !sameDay)}`;
}

// ── Best times for one activity, the day weighed first ─────────
// Walks the next `days` planetary days and reads the per-activity score the
// Saat engine already builds for every hour (day 45%, hour 35%, moon 20%).
// Returns the hours still ahead, sorted by the day's score first, then total.
//   aligned  — day, hour and moon all strong at once (shown on its own)
//   best     — the rest, strongest first
export function bestTimesFor(actId, fromMs, loc, days = 10, limit = 6) {
  const out = [];
  try {
    for (let d = 0; d <= days; d++) {
      const pd = getPlanetaryDay(fromMs + d * DAY, loc);
      for (const h of pd.hours) {
        if (h.end <= fromMs) continue;
        const a = h.activities.find((x) => x.id === actId);
        if (!a) continue;
        out.push({
          start: h.start, end: h.end, current: fromMs >= h.start,
          planet: h.planet, period: h.period, num: h.num,
          wd: pd.pDay.wd, dayFacts: pd.day, moon: h.moon,
          total: a.total, parts: a.parts, verdict: a.verdict, why: a.why,
          nahsDay: pd.day.isNahsDay,
        });
      }
    }
  } catch (_) { /* fall through */ }
  // Drop near-duplicates of the same hour (a day's edges can repeat).
  const seen = new Set();
  const uniq = out.filter((h) => { const k = Math.round(h.start / 60000); if (seen.has(k)) return false; seen.add(k); return true; });
  const strong = (h) => h.parts.day >= 65 && h.parts.hour >= 65 && h.parts.moon >= 65;
  const byDayFirst = (x, y) => (y.parts.day - x.parts.day) || (y.total - x.total) || (x.start - y.start);
  const aligned = uniq.filter(strong).sort((x, y) => (y.total - x.total) || (x.start - y.start)).slice(0, 3);
  const alignedKeys = new Set(aligned.map((h) => h.start));
  const best = uniq.filter((h) => h.verdict !== "avoid" && !strong(h) && !alignedKeys.has(h.start)).sort(byDayFirst).slice(0, limit);
  const soonest = uniq.filter((h) => h.verdict !== "avoid").sort((x, y) => x.start - y.start).slice(0, 3);
  return { aligned, best, soonest };
}
