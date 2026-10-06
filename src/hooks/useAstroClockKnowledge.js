// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK ENRICHED KNOWLEDGE HOOK
// Fetches timing intelligence extracted from verified manuscripts.
// Returns knowledge pieces filtered by section (weekday, sahath, planet, etc.).
// Marker records (is_marker=true) are always filtered out.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Fetches enriched timing knowledge from verified manuscripts.
 * @param {object} filter - { source_type, weekday, period, sahath_number, planet }
 * @returns {{ knowledge: array, loading: boolean, error: string|null }}
 */
export function useAstroClockKnowledge(filter = {}) {
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterKey = JSON.stringify(filter);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const query = { is_marker: false };
    if (filter.source_type) query.source_type = filter.source_type;
    if (filter.weekday !== undefined && filter.weekday !== null) query.weekday = filter.weekday;
    if (filter.period) query.period = filter.period;
    if (filter.sahath_number !== undefined && filter.sahath_number !== null) query.sahath_number = filter.sahath_number;
    if (filter.planet) query.planet = filter.planet;

    base44.entities.AstroClockKnowledge.filter(query, "-created_date", 50)
      .then(records => {
        if (cancelled) return;
        const real = (records || []).filter(r => r.knowledge_text_en && r.knowledge_text_en.length > 0);
        setKnowledge(real);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err?.message || "Failed to load enriched knowledge");
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [filterKey]);

  return { knowledge, loading, error };
}