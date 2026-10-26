// ═══════════════════════════════════════════════════════════════
// Eclipse days — for the rule al-Siraji gives for engagement, the
// marriage contract and the wedding: the days of a solar eclipse
// (كسوف الشمس) and of a lunar eclipse (خسوف القمر) are avoided.
//
// The rule is his; the eclipse itself is plain astronomy. An eclipse
// happens at a new or a full Moon when the Moon stands close enough
// to the ecliptic: at the new Moon the Sun is hidden, at the full the
// Moon is darkened. The limits below are the usual ones for any
// visible eclipse (solar, partial included; lunar, umbral):
//   solar  |β| < 1.55°     lunar  |β| < 1.00°
// Checked against the four eclipses al-Siraji names for 2025
// (29 Mar & 21 Sep solar, 14 Mar & 7 Sep lunar).
// ═══════════════════════════════════════════════════════════════

import { ijtimaAt } from "./kashfSaatEngine.js";

const HOUR = 3600e3;
const SOLAR_LIMIT = 1.55, LUNAR_LIMIT = 1.0;

export const ECLIPSE_SOURCE = {
  scholar_ml: "സിറാജി", scholar_en: "al-Siraji",
  ml: "സൂര്യഗ്രഹണവും ചന്ദ്രഗ്രഹണവുമുള്ള ദിവസങ്ങളിൽ വിവാഹാലോചന, നിക്കാഹ്, വിവാഹം എന്നിവ ഒഴിവാക്കുക.",
  en: "Avoid engagement, the contract and the wedding on the days of a solar or a lunar eclipse.",
};

const sepAt = (ms) => ijtimaAt(ms)?.sep ?? null;           // 0 new … 180 full
// The Moon's ecliptic latitude, from its main periodic terms (Meeus,
// Astronomical Algorithms ch. 47) — good to a few hundredths of a degree,
// far inside the eclipse limits. Worked here because the "latitude" the
// Moon-position helper returns is not the ecliptic latitude.
const rad = (d) => (d * Math.PI) / 180;
function latAt(ms) {
  const T = (ms / 86400000 + 2440587.5 - 2451545.0) / 36525;
  const D = 297.8501921 + 445267.1114034 * T;
  const Mp = 134.9633964 + 477198.8675055 * T;
  const F = 93.2720950 + 483202.0175233 * T;
  return 5.128122 * Math.sin(rad(F))
    + 0.280602 * Math.sin(rad(Mp + F))
    + 0.277693 * Math.sin(rad(Mp - F))
    + 0.173237 * Math.sin(rad(2 * D - F))
    + 0.055413 * Math.sin(rad(2 * D - Mp + F))
    + 0.046271 * Math.sin(rad(2 * D - Mp - F))
    + 0.032573 * Math.sin(rad(2 * D + F))
    + 0.017198 * Math.sin(rad(2 * Mp + F));
}

/** Narrow a sampled extreme of the Sun–Moon distance to the minute. */
function refine(ms, wantMin) {
  let lo = ms - 2 * HOUR, hi = ms + 2 * HOUR;
  for (let i = 0; i < 40; i++) {
    const a = lo + (hi - lo) / 3, b = hi - (hi - lo) / 3;
    const fa = sepAt(a), fb = sepAt(b);
    if (wantMin ? fa < fb : fa > fb) hi = b; else lo = a;
  }
  return (lo + hi) / 2;
}

/**
 * The eclipses whose moment falls inside [startMs, endMs).
 * Returns [{ type: "solar" | "lunar", at }].
 */
export function eclipsesIn(startMs, endMs) {
  const out = [];
  const step = HOUR;
  // pad so a syzygy right on an edge is still seen as an extreme
  for (let t = startMs - step; t <= endMs + step; t += step) {
    const p = sepAt(t - step), c = sepAt(t), n = sepAt(t + step);
    if (p == null || c == null || n == null) continue;
    if (c <= p && c < n && c < 20) {
      const at = refine(t, true);
      if (at >= startMs && at < endMs && Math.abs(latAt(at)) < SOLAR_LIMIT) out.push({ type: "solar", at });
    }
    if (c >= p && c > n && c > 160) {
      const at = refine(t, false);
      if (at >= startMs && at < endMs && Math.abs(latAt(at)) < LUNAR_LIMIT) out.push({ type: "lunar", at });
    }
  }
  return out;
}
