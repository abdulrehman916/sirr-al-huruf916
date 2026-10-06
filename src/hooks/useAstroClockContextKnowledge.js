// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK FULL-CONTEXT KNOWLEDGE HOOK
// Queries AstroClockKnowledge by the EXACT context:
//   Weekday + Day/Night + Sa'at Number (1-24) + Kawkab + Nakshatra
//
// KNOWLEDGE IS NEVER QUERIED BY PLANET NAME ALONE.
// Two records for the same Kawkab but different weekdays are different.
// When the manuscript cycle returns to the same Day+Saat+Kawkab,
// the same canonical knowledge is displayed.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Fetches full-context knowledge for an exact Day+Saat+Kawkab combination.
 * @param {object} context - { weekday, period, saat_number, planet, nakshatra }
 * @returns {{ knowledge: array, loading: boolean, error: string|null }}
 */
export function useAstroClockContextKnowledge(context = {}) {
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasContext = context.weekday !== undefined && context.weekday !== null
    && context.period
    && context.saat_number !== undefined && context.saat_number !== null
    && context.planet;

  const contextKey = JSON.stringify(context);

  useEffect(() => {
    if (!hasContext) {
      setKnowledge([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    // Query by exact context fields — NEVER by planet name alone
    const query = {
      is_marker: false,
      weekday: context.weekday,
      period: context.period,
      saat_number: context.saat_number,
      planet: context.planet
    };

    base44.entities.AstroClockKnowledge.filter(query, "-source_count", 10)
      .then(records => {
        if (cancelled) return;
        // Only full_context records with actual action data
        const real = (records || []).filter(r =>
          r.source_type === 'full_context' &&
          (r.recommended_actions?.length > 0 ||
           r.forbidden_actions?.length > 0 ||
           r.enemy_actions?.length > 0 ||
           r.friendship_actions?.length > 0 ||
           r.warnings_list?.length > 0 ||
           r.notes_list?.length > 0 ||
           r.ritual_suitability)
        );
        setKnowledge(real);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err?.message || "Failed to load context knowledge");
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [contextKey, hasContext]);

  return { knowledge, loading, error };
}