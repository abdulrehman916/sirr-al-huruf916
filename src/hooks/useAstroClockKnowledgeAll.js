// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK KNOWLEDGE — SESSION-CACHED FULL LOAD
// Loads ALL AstroClockKnowledge records once per session for the
// Ritual Timing interpreter engine. The engine searches these
// records to find the original Astrology Clock explanation for any
// Day + Saat + Kawkab context.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

let cache = null;
let inflight = null;

export function fetchAstroClockKnowledge() {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const all = [];
      let skip = 0;
      while (skip < 5000) {
        const batch = await base44.entities.AstroClockKnowledge.filter(
          { is_marker: false, source_type: "full_context" },
          "-source_count", 100, skip
        );
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

export function useAstroClockKnowledgeAll() {
  const [knowledge, setKnowledge] = useState(cache || []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) { setKnowledge(cache); setLoading(false); return; }
    let alive = true;
    fetchAstroClockKnowledge().then((r) => {
      if (!alive) return;
      setKnowledge(r);
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  return { astroClockKnowledge: knowledge, loadingKnowledge: loading };
}