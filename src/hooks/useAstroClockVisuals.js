// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK VISUALS HOOK
// Fetches attached_visuals from AstroClockKnowledge records for a
// given set of rule_categories, optionally filtered by rule_entity
// aliases. Aggregates and DEDUPLICATES by visual_url so the same
// source crop is never shown twice on one card.
//
// ISOLATED to Astro Clock — reads AstroClockKnowledge only.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "") // strip Arabic harakat + tatweel
    .trim();
}

export function useAstroClockVisuals(categories = [], entityAliases = []) {
  const [visuals, setVisuals] = useState([]);
  const [loading, setLoading] = useState(false);
  const key = JSON.stringify({ categories, entityAliases });

  useEffect(() => {
    if (!categories || categories.length === 0) {
      setVisuals([]);
      return;
    }
    let cancelled = false;
    setLoading(true);

    (async () => {
      const aliases = (entityAliases || []).map(norm).filter(Boolean);
      const seenUrl = new Set();
      const out = [];

      for (const cat of categories) {
        try {
          const recs = await base44.entities.AstroClockKnowledge.filter(
            { is_marker: false, rule_category: cat },
            "-source_count",
            200
          );
          for (const r of recs || []) {
            // If entity aliases are given, only keep records whose entity matches one
            if (aliases.length > 0 && !aliases.includes(norm(r.rule_entity))) continue;
            const arr = Array.isArray(r.attached_visuals) ? r.attached_visuals : [];
            for (const v of arr) {
              if (!v || !v.visual_url || seenUrl.has(v.visual_url)) continue;
              seenUrl.add(v.visual_url);
              out.push(v);
            }
          }
        } catch (e) {
          // ignore single-category fetch errors
        }
      }

      if (!cancelled) {
        setVisuals(out);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [key]);

  return { visuals, loading };
}