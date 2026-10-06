// ═══════════════════════════════════════════════════════════════
// CATEGORY KNOWLEDGE PANEL
// Displays category-general findings from AstroClockKnowledge that
// are NOT tied to a specific planet/zodiac/mansion entity. Each
// category (rituals, invocations, khawass, correspondences, wafq,
// treatments, mujarrabat, special_days, special_nights, lucky_timings,
// unfavourable_timings, incense, colours, metals, stones, etc.) gets
// its own expandable accordion showing every extracted finding with
// Arabic text, Malayalam explanation, source book, page number, and
// citation.
//
// ISOLATED — reads ONLY from AstroClockKnowledge. Never writes.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { normalizeDisplay } from "@/lib/astroClockLanguageNormalizer";

// Wrong-slug / legacy categories to EXCLUDE
const WRONG_SLUG = new Set([
  "planets", "zodiac_signs", "lunar_mansions", "weekdays", "elements",
  "i_n_v_o_c_a_t_i_o_n_s", "l_u_c_k_y_t_i_m_i_n_g_s", "m_u_j_a_r_r_a_b_a_t",
  "r_i_t_u_a_l_s", "s_p_e_c_i_a_l_n_i_g_h_t_s", "c_o_r_r_e_s_p_o_n_d_e_n_c_e_s",
  "scan_marker", "general astrology", "nine_mizan",
]);

// Entity-specific categories (shown inside entity cards via EntityKnowledgePanel)
const ENTITY_CATEGORIES = new Set([
  "planet", "zodiac", "lunar mansion", "weekday", "element",
]);

// Category display labels (multi-language)
const CATEGORY_LABELS = {
  rituals: { ml: "ആചാരങ്ങൾ", en: "Rituals", ar: "الطقوس" },
  invocations: { ml: "പ്രാർത്ഥനകൾ", en: "Invocations", ar: "الأدعية" },
  spiritual_properties: { ml: "ആത്മിക ഗുണങ്ങൾ", en: "Spiritual Properties", ar: "الخواص الروحية" },
  khawass: { ml: "ഖവാസ്", en: "Khawass", ar: "الخواص" },
  correspondences: { ml: "പൊരുത്തങ്ങൾ", en: "Correspondences", ar: "المقابلات" },
  lucky_timings: { ml: "ഭാഗ്യ സമയങ്ങൾ", en: "Lucky Timings", ar: "الأوقات السعيدة" },
  wafq: { ml: "വഫ്ഖ്", en: "Wafq", ar: "الوفق" },
  treatments: { ml: "ചികിത്സകൾ", en: "Treatments", ar: "العلاجات" },
  special_days: { ml: "പ്രത്യേക ദിനങ്ങൾ", en: "Special Days", ar: "أيام خاصة" },
  mujarrabat: { ml: "മുജറബത്ത്", en: "Mujarrabat", ar: "المجربات" },
  special_nights: { ml: "പ്രത്യേക രാത്രികൾ", en: "Special Nights", ar: "ليالٍ خاصة" },
  unfavourable_timings: { ml: "പ്രതികൂല സമയങ്ങൾ", en: "Unfavourable Timings", ar: "أوقات غير مواتية" },
  incense: { ml: "ധൂപം", en: "Incense", ar: "البخور" },
  recommended_actions: { ml: "ശുപാർശ", en: "Recommended Actions", ar: "أفعال موصى بها" },
  forbidden_actions: { ml: "നിരോധിത പ്രവൃത്തികൾ", en: "Forbidden Actions", ar: "أفعال محظورة" },
  colours: { ml: "നിറങ്ങൾ", en: "Colours", ar: "الألوان" },
  stones: { ml: "രത്നങ്ങൾ", en: "Stones", ar: "الأحجار" },
  metals: { ml: "ലോഹങ്ങൾ", en: "Metals", ar: "المعادن" },
  directions: { ml: "ദിശകൾ", en: "Directions", ar: "الاتجاهات" },
  planetary_hours: { ml: "ഗ്രഹ മണിക്കൂറുകൾ", en: "Planetary Hours", ar: "ساعات الكواكب" },
  sahat: { ml: "സഅാത്", en: "Saat", ar: "الساعة" },
  islamic_months: { ml: "ഇസ്ലാമിക മാസങ്ങൾ", en: "Islamic Months", ar: "الأشهر الهجرية" },
  planet_relationships: { ml: "ഗ്രഹ ബന്ധങ്ങൾ", en: "Planet Relationships", ar: "علاقات الكواكب" },
  abjad: { ml: "അബ്ജദ്", en: "Abjad", ar: "أبجد" },
  friendly_planets: { ml: "സൗഹൃദ ഗ്രഹങ്ങൾ", en: "Friendly Planets", ar: "كواكب صديقة" },
  enemy_planets: { ml: "ശത്രു ഗ്രഹങ്ങൾ", en: "Enemy Planets", ar: "كواكب معادية" },
};

function catLabel(cat, lang) {
  const lbl = CATEGORY_LABELS[cat];
  if (lbl) return lbl[lang] || lbl.en;
  return cat.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default function CategoryKnowledgePanel() {
  const { txt, language } = useAstroClockLanguage();
  const [allRecs, setAllRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCat, setExpandedCat] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const all = [];
    let skip = 0;
    const loadBatch = () => {
      base44.entities.AstroClockKnowledge.filter(
        { source_type: "categorized", is_marker: false },
        "-source_count", 500, skip
      ).then(batch => {
        if (cancelled) return;
        if (!batch || batch.length === 0) {
          setAllRecs(all);
          setLoading(false);
          return;
        }
        all.push(...batch);
        skip += batch.length;
        if (batch.length < 500) {
          setAllRecs(all);
          setLoading(false);
        } else {
          loadBatch();
        }
      }).catch(() => {
        if (!cancelled) { setAllRecs(all); setLoading(false); }
      });
    };
    loadBatch();
    return () => { cancelled = true; };
  }, []);

  // Group category-general findings (not entity-specific, not wrong-slug)
  const categoryGroups = useMemo(() => {
    const groups = {};
    for (const r of allRecs) {
      if (WRONG_SLUG.has(r.rule_category)) continue;
      if (ENTITY_CATEGORIES.has(r.rule_category)) continue;
      const cat = r.rule_category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(r);
    }
    // Sort categories by record count (descending)
    return Object.entries(groups)
      .map(([cat, recs]) => ({ category: cat, records: recs }))
      .sort((a, b) => b.records.length - a.records.length);
  }, [allRecs]);

  if (loading) {
    return (
      <div className="py-4 text-center font-inter text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>
        {txt("ലഭ്യമാക്കുന്നു...", "Loading...", "جارٍ التحميل...")}
      </div>
    );
  }

  if (categoryGroups.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="font-inter text-[10px] mb-2" style={{ color: "rgba(212,175,55,0.50)" }}>
        {txt(
          "ഗ്രന്ഥങ്ങളിൽ നിന്ന് എക്സ്ട്രാക്റ്റ് ചെയ്ത വിജ്ഞാനം — ഓരോ വിഭാഗവും വിരിയുന്നത് കാണാൻ ക്ലിക്ക് ചെയ്യുക",
          "Extracted knowledge from manuscripts — click each category to expand",
          "المعرفة المستخرجة من المخطوطات — انقر كل فئة للتوسيع"
        )}
      </p>
      {categoryGroups.map(({ category, records }) => {
        const isOpen = expandedCat === category;
        return (
          <div key={category} className="rounded-lg overflow-hidden" style={{
            background: "rgba(129,140,248,0.04)",
            border: "1px solid rgba(129,140,248,0.15)",
          }}>
            <button
              onClick={() => setExpandedCat(isOpen ? null : category)}
              className="w-full flex items-center gap-2 p-2.5 text-left"
            >
              <BookOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#818CF8" }} />
              <span className="font-inter text-xs font-bold flex-1" style={{ color: "rgba(129,140,248,0.80)" }}>
                {catLabel(category, language)}
              </span>
              <span className="font-inter text-[9px] px-1.5 py-0.5 rounded" style={{
                background: "rgba(129,140,248,0.10)",
                color: "rgba(129,140,248,0.50)",
              }}>
                {records.length} {txt("രേഖകൾ", "findings", "سجلات")}
              </span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform flex-shrink-0" style={{
                color: "rgba(129,140,248,0.50)",
                transform: isOpen ? "rotate(180deg)" : "none",
              }} />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="px-2.5 pb-2.5 space-y-1.5 max-h-96 overflow-y-auto scrollbar-none">
                    {records.slice(0, 30).map((rec, i) => (
                      <div key={i} className="rounded-lg p-2" style={{
                        background: "rgba(129,140,248,0.03)",
                        border: "1px solid rgba(129,140,248,0.10)",
                      }}>
                        {(() => {
                          const txtByLang = language === "ml" ? (rec.knowledge_text_ml || "") : language === "ar" ? (rec.knowledge_text_ar || "") : (rec.knowledge_text_en || "");
                          const pieces = txtByLang.split("\n---\n").filter(t => t.trim());
                          if (pieces.length === 0) {
                            return (
                              <p className="font-inter text-[10px] leading-snug" style={{ color: "rgba(255,255,255,0.30)" }}>
                                {language === "ml" ? "മലയാള പരിഭാഷ ഇതുവരെ ലഭ്യമല്ല." : language === "ar" ? "الترجمة العربية غير متوفرة بعد." : ""}
                              </p>
                            );
                          }
                          return (
                            <p className="font-inter text-[10px] leading-snug mb-1" style={{ color: "rgba(255,255,255,0.65)" }}>
                              {pieces.map((textPiece, pi) => (
                                <span key={pi} className={`block mb-0.5 ${language === "ar" ? "font-amiri" : ""}`} style={language === "ar" ? { direction: "rtl" } : undefined}>{textPiece.trim()}</span>
                              ))}
                            </p>
                          );
                        })()}
                        {language === "en" && rec.knowledge_text_ar && (
                          <p className="font-amiri text-[11px] mt-1" style={{ color: "rgba(212,175,55,0.40)", direction: "rtl" }}>
                            {rec.knowledge_text_ar.split("\n---\n")[0].trim()}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="font-inter text-[7px] px-1 py-0.5 rounded" style={{
                            background: "rgba(129,140,248,0.06)",
                            color: "rgba(129,140,248,0.40)",
                          }}>
                            📖 {normalizeDisplay(rec.source_book_title || "Manuscript")}
                            {rec.source_page_number ? ` p.${rec.source_page_number}` : ""}
                          </span>
                          {rec.source_count > 1 && (
                            <span className="font-inter text-[7px] px-1 py-0.5 rounded" style={{
                              background: "rgba(212,175,55,0.06)",
                              color: "rgba(212,175,55,0.40)",
                            }}>
                              +{rec.source_count - 1} {txt("സ്രോതസ്സുകൾ", "sources", "مصادر")}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {records.length > 30 && (
                      <p className="font-inter text-[9px] text-center py-1" style={{ color: "rgba(255,255,255,0.30)" }}>
                        {txt(`+${records.length - 30} കൂടുതൽ`, `+${records.length - 30} more`, `+${records.length - 30} المزيد`)}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}