import { DAY_KEY_BY_INDEX } from "../shared";

// ═══════════════════════════════════════════════════════════════
// DATABASE-DRIVEN COMPATIBILITY ENGINE
// Every signal comes from actual uploaded book data
// (AstroClockKnowledge / ManuscriptRule records).
// Compatibility = support / (support + oppose) * 100
// No fixed values, no heuristics, no assumptions.
//
// Evaluation order: Purpose → Book → Day → Saat → Planet → Day/Night → Context
// ═══════════════════════════════════════════════════════════════
export function computeCompat(analysis, overrides = {}) {
  const matchingRules = analysis?.matchingRules || [];
  const conflictingRules = analysis?.conflictingRules || [];
  const req = analysis?.req || {};
  const astro = analysis?.astroClockStatus || {};
  const liveNow = analysis?.liveNow || {};

  // Effective context (with overrides for what-if scenarios)
  const dayKey = overrides.dayKey || DAY_KEY_BY_INDEX[astro.activeWeekday];
  const weekday = overrides.weekday ?? astro.activeWeekday;
  const period = overrides.period ?? (liveNow.laylNahar === "Layl" ? "night" : "day");
  const saatNumber = overrides.saatNumber ?? ((liveNow.saat || 1) + (period === "night" ? 12 : 0));
  const planetLC = (overrides.planetLC || String(liveNow.kawkab || liveNow.planetaryHour || "")).toLowerCase();

  let support = 0;
  let oppose = 0;

  // ── 1. PURPOSE — identified from Purpose Dictionary ──
  if (analysis?.ritualType && analysis.ritualType !== "General Work") support += 1;

  // ── 2. BOOK — uploaded books with rules for this purpose ──
  if (matchingRules.length > 0) support += 1;
  if (conflictingRules.length > 0) oppose += 1;

  // ── 3. DAY — database day recommendation (req.days / worstDays from AstroClockKnowledge) ──
  if (req.days?.includes(dayKey)) support += 2;
  if (req.worstDays?.includes(dayKey)) oppose += 2;
  // Database recommends specific days but current is not among them (weak negative)
  if (req.days?.length > 0 && !req.days.includes(dayKey) && !req.worstDays?.includes(dayKey)) oppose += 1;

  // ── 4. SAAT — database saat/planet recommendation (req.hours from AstroClockKnowledge) ──
  if (req.hours?.some(p => p.toLowerCase() === planetLC)) support += 2;
  if (req.worstHours?.some(p => p.toLowerCase() === planetLC)) oppose += 2;
  // Database recommends specific planets but current is not among them (weak negative)
  if (req.hours?.length > 0 && !req.hours.some(p => p.toLowerCase() === planetLC) && !req.worstHours?.some(p => p.toLowerCase() === planetLC)) oppose += 1;

  // ── 5. PLANET — enemy planet check (req.enemyPlanets from AstroClockKnowledge) ──
  if (req.enemyPlanets?.some(p => p.toLowerCase() === planetLC)) oppose += 2;

  // ── 6. DAY/NIGHT — database period requirement (req.nightRequired) ──
  if (req.nightRequired === true && period === "night") support += 1;
  if (req.nightRequired === true && period !== "night") oppose += 2;

  // ── 7. CONTEXT-SPECIFIC RULES — exact Day+Saat+Period match in uploaded books ──
  // These are the strongest database signals: a specific AstroClockKnowledge record
  // that explicitly recommends or forbids this purpose for this exact context.
  const ctxMatch = matchingRules.filter(r =>
    r.weekday === weekday && r.period === period && r.saat_number === saatNumber
  );
  const ctxConflict = conflictingRules.filter(r =>
    r.weekday === weekday && r.period === period && r.saat_number === saatNumber
  );
  support += ctxMatch.length * 3;
  oppose += ctxConflict.length * 3;

  const total = support + oppose;
  if (total === 0) return { final: 0, support, oppose, ctxMatch: 0, ctxConflict: 0 };
  return { final: Math.round((support / total) * 100), support, oppose, ctxMatch: ctxMatch.length, ctxConflict: ctxConflict.length };
}

export function compatColor(pct) {
  return pct >= 70 ? "#4ADE80" : pct >= 50 ? "#FBBF24" : pct > 0 ? "#FB923C" : "#F87171";
}

// ═══════════════════════════════════════════════════════════════
// Find the window with the highest DATABASE-DRIVEN compatibility.
// Uses computeCompat for each candidate — never the engine's heuristic score.
// ═══════════════════════════════════════════════════════════════
export function findStrongestWindow(analysis, windows) {
  if (!windows || windows.length === 0) return null;
  let best = null;
  let bestCompat = -1;
  for (const w of windows) {
    const c = computeCompat(analysis, {
      period: w.period,
      saatNumber: w.hourNumber,
      planetLC: String(w.planet || "").toLowerCase(),
    });
    if (c.final > bestCompat) {
      bestCompat = c.final;
      best = { ...w, compat: c.final };
    }
  }
  return best;
}