// ═══════════════════════════════════════════════════════════════
// ENTITY KNOWLEDGE HOOK — Astrology module read path
//
// PERMANENT ARCHITECTURE: all astrology knowledge lives ONLY in
// AstroClockKnowledge. This hook now reads categorized records from
// AstroClockKnowledge (instead of EntityKnowledge) and maps them back
// to the shape EntityKnowledgePanel expects.
//
// Affects: Astrology (Astro Clock) module only.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

// entity_type (legacy) → AstroClockKnowledge rule_category (lowercase)
const ENTITY_TYPE_TO_RULE_CATEGORY = {
  planet: "planet",
  zodiac: "zodiac",
  mansion: "lunar mansion",
  weekday: "weekday",
  element: "element",
  house: "house",
  ritual: "ritual",
  general_astro: "general astrology",
};

// Wrong-slug / legacy categories to EXCLUDE — these were consolidated
// into their correct-slug counterparts by consolidateAstroClockCards.
// Including them would create duplicate sections in the entity card.
const WRONG_SLUG_CATEGORIES = new Set([
  "planets", "zodiac_signs", "lunar_mansions", "weekdays", "elements",
  "i_n_v_o_c_a_t_i_o_n_s", "l_u_c_k_y_t_i_m_i_n_g_s", "m_u_j_a_r_r_a_b_a_t",
  "r_i_t_u_a_l_s", "s_p_e_c_i_a_l_n_i_g_h_t_s", "c_o_r_r_e_s_p_o_n_d_e_n_c_e_s",
  "scan_marker", "general astrology", "nine_mizan",
]);

// Module assignments that exclude a finding from Astro Clock display.
// These findings have been migrated to another module (Holy Names, Section D)
// or are reserved/archived (Jinn/Occult, Kabbalah). They remain in the
// database but are hidden from all Astro Clock entity cards.
const EXCLUDED_MODULE_ASSIGNMENTS = new Set([
  "moved_to_holy_names",
  "moved_to_section_d",
  "reserved_jinn_occult",
  "archived_kabbalah",
]);

export function useEntityKnowledge(entityType, entityKey) {
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const contextKey = `${entityType}|${entityKey}`;

  useEffect(() => {
    if (!entityType || !entityKey) {
      setKnowledge([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const ruleCategory = ENTITY_TYPE_TO_RULE_CATEGORY[entityType] || entityType;

    // Query ALL categories for this entity (not just the primary one).
    // This makes category-specific findings (colours, metals, incense,
    // khawass, mujarrabat, wafq, etc.) visible inside each entity card.
    // Wrong-slug / legacy categories are filtered client-side to avoid
    // duplicates with their consolidated correct-slug counterparts.
    base44.entities.AstroClockKnowledge.filter({
      source_type: "categorized",
      is_marker: false,
      rule_entity: String(entityKey).toLowerCase(),
    }, "-source_count", 50)
      .then(records => {
        if (cancelled) return;
        // Filter out wrong-slug / legacy categories (consolidated into
        // correct-slug counterparts) to prevent duplicate sections.
        const filtered = (records || []).filter(r =>
          !WRONG_SLUG_CATEGORIES.has(r.rule_category) &&
          !(r.attributes && EXCLUDED_MODULE_ASSIGNMENTS.has(r.attributes.module_assignment))
        );
        // Map ACK categorized records → EntityKnowledgePanel shape.
        const mapped = filtered.map(r => ({
          ...r,
          knowledge_category: (r.attributes && r.attributes.knowledge_category) || r.rule_category || "general",
          knowledge_text_en: r.knowledge_text_en || "",
          knowledge_text_ml: r.knowledge_text_ml || "",
          knowledge_text_ar: r.knowledge_text_ar || "",
          source_book_title: r.source_book_title || "",
          source_page_number: r.source_page_number || "",
          source_screenshot_url: r.source_screenshot_url || "",
          source_count: r.source_count || 1,
        }));
        setKnowledge(mapped);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err?.message || "Failed to load entity knowledge");
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [contextKey]);

  return { knowledge, loading, error };
}