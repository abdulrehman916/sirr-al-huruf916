// ═══════════════════════════════════════════════════════════════
// useManuscriptRules — fetches ManuscriptRule records from the DB once.
// Used by RitualDecisionEngine to feed the V3 rule-driven engine.
// Read-only. Never writes. Cached for the session.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

let cache = null;
let inflight = null;

export function fetchManuscriptRules() {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const all = [];
      let skip = 0;
      // Page through up to 500 rules (single source of truth).
      while (skip < 3000) {
        const batch = await base44.entities.ManuscriptRule.list("-created_date", 100, skip);
        if (!batch || batch.length === 0) break;
        all.push(...batch);
        if (batch.length < 100) break;
        skip += 100;
      }
      cache = all;
      return all;
    } catch (e) {
      cache = [];
      return [];
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function useManuscriptRules() {
  const [rules, setRules] = useState(cache || []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) { setRules(cache); setLoading(false); return; }
    let alive = true;
    fetchManuscriptRules().then((r) => {
      if (!alive) return;
      setRules(r);
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  return { manuscriptRules: rules, loadingRules: loading };
}