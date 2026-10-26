// ═══════════════════════════════════════════════════════════════
// The times for one work, hour by hour — the reckoning behind the
// timing panel under the square (docs/sirr-al-wafq-timing.md §7, 1-3).
//
// Nothing new is decided here. Every hour comes from the Saat engine
// (getPlanetaryDay), every condition from wafqWorkTiming.js, and every
// table from the books:
//
//   the work's day and hour   Kashf pp. 12-13   (WORK_TIMES)
//   kahır conditions 1-3      Hâvâss I pp. 107-108 (kahirFit)
//   good conditions 1-4       Kashf pp. 12-13, 114-136, 79, 243-244 (goodFit)
//   Mars's manzil / evil one  Kashf pp. 127-128 (MANSION_WORK face, nature)
//   Moon's fall, detriment    Kashf p. 244 (PLANET_DIGNITY.moon)
//
// What a table does not give is left unknown, never filled:
//   · combustion — p. 79 names it, but no orb is given in the books
//     the app holds, so it is reported (the Sun–Moon distance) and not
//     counted;
//   · the good manzil — only reckoned when a purpose with the book's
//     own manzil list has been chosen; otherwise it drops out of the
//     count, as goodFit already allows.
// ═══════════════════════════════════════════════════════════════

import { getPlanetaryDay, ijtimaAt } from "./kashfSaatEngine.js";
import { MANSION_WORK, PLANET_DIGNITY, WEEKDAYS } from "./kashfSaatData.js";
import { kahirFit, goodFit } from "./wafqWorkTiming.js";

const HOUR = 3600e3, DAY = 24 * HOUR;

/** Mars's face (Kashf p.127) or a nature the passage calls نحس. */
export function manzilIsEvil(no) {
  const w = MANSION_WORK[no];
  if (!w) return null;
  return w.face === "المريخ" || /^نحس/.test(w.nature || "");
}

/** The Moon in its fall or its detriment — Kashf p.244. */
export function moonFallOrDetriment(sign) {
  const d = PLANET_DIGNITY.moon;
  if (sign == null) return null;
  if (d.hubut.sign === sign) return "hubut";
  if (d.wabal.includes(sign)) return "wabal";
  return null;
}

/** A work is reckoned as kahır where the table marks it ⚠. */
export const isKahirWork = (work) => !!work?.harm;

// ── The ladder of times (the owner's order, each step a book's own) ──
//
//   1  the work's day, the work's hour, and that hour the day's own —
//      its 1st or 8th. "The hour of a planet on its own day — the
//      closest pairing" (Hâvâss I pp. 49-51, 161; the Astro Clock
//      already counts it so).
//   2  the work's day and the work's hour (Kashf pp. 12-13).
//   3  the work's hour on another day or night. Hâvâss I p. 161: when
//      the best time is months away, keep to the hours and the day
//      may be let go.
//   4  the companion's hour, on the work's day: a planet of the same
//      group as the work's hour planet. Kashf p. 265:
//        "الكواكب المتحابة السعيدة وهي الشمس والقمر والزهرة والمشتري"
//        "الكواكب المتباغضة النحيسة وهي المريخ وزحل"
//        and عطارد "ممتزج نحس مع النحس وسعد مع السعد".
//   5  the companion's hour on another day.
//
// The Moon never closes a time. Where it suits the work it is marked
// ✦ and the time is shown as the stronger for it.

export const COMPANION_SOURCE = {
  page: "265",
  ar: "وتنقسم هذه الكواكب إلى قسمين: الاول الكواكب المتحابة السعيدة وهي الشمس والقمر والزهرة والمشتري، الثانية هي الكواكب المتباغضة النحيسة وهي المريخ وزحل. بالنسبة للكوكب السابع الذي لم يذكر في المجموعتين الأولى والثانية وهو عطارد فهو ممتزج نحس مع النحس وسعد مع السعد.",
  ml: "ഗ്രഹങ്ങൾ രണ്ട് കൂട്ടമാണ്: (1) പരസ്പരം സ്നേഹിക്കുന്ന സഅ്ദായ ഗ്രഹങ്ങൾ — ശംസ്, ഖമർ, സുഹ്റ, മുശ്തരി. (2) പരസ്പരം വെറുക്കുന്ന നഹ്സായ ഗ്രഹങ്ങൾ — മിർരീഖ്, സുഹൽ. രണ്ടിലും പറയാത്ത ഏഴാമത്തെ ഗ്രഹം ഉത്വാരിദ് കലർന്നതാണ് — നഹ്സിനോട് നഹ്സ്, സഅ്ദിനോട് സഅ്ദ്.",
  en: "The planets fall into two groups: (1) the mutually loving, fortunate planets — Sun, Moon, Venus, Jupiter; (2) the mutually hating, unfortunate planets — Mars and Saturn. Mercury, the seventh, named in neither, is mixed: nahs with the nahs and sa'd with the sa'd.",
};
const LOVING = ["sun", "moon", "venus", "jupiter"];
const HATING = ["mars", "saturn"];

/** The work's planet's companions, by the book's two groups. */
export function companionsOf(work) {
  if (!work) return [];
  const p = work.hour;
  // Mercury takes the side of what it is joined to; the work's own kind
  // (⚠ or not) is what it is joined to here.
  const group = p === "mercury" ? (isKahirWork(work) ? HATING : LOVING)
    : LOVING.includes(p) ? LOVING : HATING;
  return group.filter((x) => x !== p);
}

export const TIERS = {
  1: { ml: "ഏറ്റവും ശക്തം — കർമ്മത്തിന്റെ ദിവസം, കർമ്മത്തിന്റെ സാഅത്ത്, അത് ആ ദിവസത്തിന്റെ സ്വന്തം സാഅത്തും",
       en: "Strongest — the work's day, the work's hour, and that hour the day's own", src: "Hâvâss · Kashf" },
  2: { ml: "കർമ്മത്തിന്റെ ദിവസവും കർമ്മത്തിന്റെ സാഅത്തും",
       en: "The work's day and the work's hour", src: "Kashf" },
  3: { ml: "കർമ്മത്തിന്റെ സാഅത്ത്, മറ്റൊരു ദിവസത്തിൽ — ദിവസം ഒഴിവാക്കാമെന്ന് കിതാബ്",
       en: "The work's hour on another day — the book allows the day to be let go", src: "Hâvâss" },
  4: { ml: "കൂട്ടുകാരന്റെ സാഅത്ത്, കർമ്മത്തിന്റെ ദിവസത്തിൽ",
       en: "The companion's hour, on the work's day", src: "Kashf" },
  5: { ml: "കൂട്ടുകാരന്റെ സാഅത്ത്, മറ്റൊരു ദിവസത്തിൽ",
       en: "The companion's hour, on another day", src: "Kashf · Hâvâss" },
};

function tierOf(h, wd, work) {
  if (!work) return null;
  const dayMatch = wd === work.day;
  const hourMatch = h.planet === work.hour;
  const own = h.period === "day" && (h.num === 1 || h.num === 8) && h.planet === WEEKDAYS[wd]?.planet;
  if (dayMatch && hourMatch && own) return 1;
  if (dayMatch && hourMatch) return 2;
  if (hourMatch) return 3;
  if (companionsOf(work).includes(h.planet)) return dayMatch ? 4 : 5;
  return null;
}

/**
 * How lit the Moon is, from the Sun–Moon distance, and how far along
 * its waxing or waning it stands. Plain arithmetic, no rule: the
 * waning is the days from full to new (Hâvâss I p. 107, note 8).
 */
export function moonLight(sepDeg, waxing) {
  if (sepDeg == null) return null;
  const lit = Math.round(((1 - Math.cos((sepDeg * Math.PI) / 180)) / 2) * 100);
  return { lit, waxing: !!waxing, waned: waxing ? null : 100 - lit };
}

/** What the Moon adds — never what it takes away. */
function moonBoost(moon, work, mansions) {
  if (!moon) return { manzil: false, phase: false, n: 0 };
  const kahir = isKahirWork(work);
  // A ⚠ work: Hâvâss I p. 107, a manzil of Mars or an evil one.
  // A good work: only the manzils the book names for that very purpose;
  // with no purpose chosen there is no list, and no ✦ is given.
  const manzil = kahir
    ? !!manzilIsEvil(moon.mansionNo)
    : !!(mansions && mansions.includes(moon.mansionNo));
  // Hâvâss I p. 160: positive works while the Moon grows, negative while it wanes.
  const phase = kahir ? !moon.waxing : !!moon.waxing;
  return { manzil, phase, n: (manzil ? 1 : 0) + (phase ? 1 : 0) };
}

/**
 * Everything the panel needs about one hour, for one work.
 * `mansions` is the chosen purpose's own manzil list, or null.
 */
export function readHour(h, wd, work, mansions = null) {
  const moon = h.moon || null;
  const mid = (h.start + h.end) / 2;
  const ij = ijtimaAt(mid);
  const base = {
    start: h.start, end: h.end, period: h.period, num: h.num,
    planet: h.planet, wd, moon, ijtima: ij,
    fallDet: moonFallOrDetriment(moon?.sign),
    tier: tierOf(h, wd, work),
    boost: moonBoost(moon, work, mansions),
    sameSign: !!ij?.same,               // Hâvâss I p. 161 — reported
    light: moonLight(ij?.sep, moon?.waxing),
  };
  if (isKahirWork(work)) {
    const fit = kahirFit({
      weekday: wd, hourIndex: h.num, isNight: h.period === "night",
      waning: moon ? !moon.waxing : false,
      manzilEvil: moon ? !!manzilIsEvil(moon.mansionNo) : false,
    });
    return { ...base, kind: "kahir", fit };
  }
  const fit = goodFit(work, {
    weekday: wd, hourPlanet: h.planet,
    manzilGood: mansions && moon ? mansions.includes(moon.mansionNo) : null,
    moonClear: null,                    // Kashf p. 13: not reckoned outside a birth
    waxing: moon ? !!moon.waxing : null,
  });
  return { ...base, kind: "good", fit };
}

/** Best first: the tier, then what the Moon adds, then the soonest. */
export const byStrength = (a, b) =>
  (a.tier - b.tier) || (b.boost.n - a.boost.n) || (a.start - b.start);

/** The 24 hours of the planetary day that holds `ms`, read for the work. */
export function readDay(ms, loc, work, mansions = null) {
  const pd = getPlanetaryDay(ms, loc);
  return {
    pDay: pd.pDay, day: pd.day,
    hours: pd.hours.map((h) => ({ ...readHour(h, pd.pDay.wd, work, mansions), current: h.status === "current" })),
  };
}

/**
 * The next openings within `days` planetary days: for each tier, its
 * soonest times, so the reader sees when the strongest time comes
 * next and what stands in for it. Hours outside the ladder are never
 * offered.
 */
export function nextOpenings(work, fromMs, loc, { days = 14, perTier = 3, mansions = null } = {}) {
  const out = [], seen = new Set();
  for (let d = 0; d <= days; d++) {
    let pd;
    try { pd = getPlanetaryDay(fromMs + d * DAY, loc); } catch (_) { continue; }
    for (const h of pd.hours) {
      if (h.end <= fromMs) continue;
      const k = Math.round(h.start / 60000);
      if (seen.has(k)) continue;
      seen.add(k);
      const r = readHour(h, pd.pDay.wd, work, mansions);
      if (r.tier) out.push({ ...r, current: fromMs >= h.start });
    }
  }
  const tiers = {};
  for (const r of out.sort((a, b) => a.start - b.start)) {
    (tiers[r.tier] ||= []);
    if (tiers[r.tier].length < perTier) tiers[r.tier].push(r);
  }
  return tiers;
}

/** The hour that holds `ms`, read for the work. */
export function readNow(work, ms, loc, mansions = null) {
  const d = readDay(ms, loc, work, mansions);
  return d.hours.find((h) => ms >= h.start && ms < h.end) || null;
}

/** Noon of a civil date (yyyy-mm-dd) at the location, to ask the engine for that day. */
export function msForDate(iso, loc) {
  const [y, m, d] = (iso || "").split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return null;
  // Local noon; the engine works out the location's own zone itself.
  const lngHours = (loc?.lng || 0) / 15;
  return Date.UTC(y, m - 1, d, 12) - lngHours * HOUR;
}

/**
 * The next day the book gives for this work (Kashf pp. 12-13), read
 * whole: its 24 hours from the sunset before it. Today counts while
 * any of its hours is still ahead.
 */
export function nextBookDay(work, fromMs, loc, mansions = null) {
  if (!work) return null;
  for (let d = 0; d <= 8; d++) {
    const r = readDay(fromMs + d * DAY, loc, work, mansions);
    if (r.pDay.wd === work.day && r.hours.some((h) => h.end > fromMs)) return r;
  }
  return null;
}
