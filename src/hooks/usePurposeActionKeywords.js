import { useEffect, useState } from "react";
import { platform } from "@/api/platformClient";

// ═══════════════════════════════════════════════════════════════
// DYNAMIC PURPOSE KEYWORDS — loaded from the PurposeActionClassifier
// Rule Database. Replaces the hardcoded PURPOSE_KEYWORDS constant in
// the runtime recommendation path.
//
// Returns { purposeKeywords, loading }.
//   purposeKeywords: { [ritual_intent]: string[] } | null
//   null while loading (engine falls back to the legacy constant,
//   preserving outputs) and on error.
// ═══════════════════════════════════════════════════════════════
export function usePurposeActionKeywords() {
  const [purposeKeywords, setPurposeKeywords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    platform.entities.PurposeActionClassifier.list("-created_date", 2000)
      .then((records) => {
        if (!alive) return;
        const map = {};
        for (const r of records || []) {
          if (r.is_active === false) continue;
          if (!r.keyword) continue;
          if (!map[r.ritual_intent]) map[r.ritual_intent] = [];
          map[r.ritual_intent].push(String(r.keyword).toLowerCase());
        }
        if (alive) setPurposeKeywords(map);
      })
      .catch(() => {
        if (alive) setPurposeKeywords(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { purposeKeywords, loading };
}