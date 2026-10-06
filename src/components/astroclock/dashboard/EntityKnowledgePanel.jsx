// ═══════════════════════════════════════════════════════════════
// ENTITY KNOWLEDGE PANEL
// Displays manuscript knowledge from the EntityKnowledge entity
// in Planet, Zodiac, and Mansion detail cards.
//
// This panel is the UI bridge between the unified ingestion pipeline
// and the entity detail pages. Every verified record in
// EntityKnowledge is reachable from at least one entity detail page
// via this panel.
//
// KNOWLEDGE IS NEVER HIDDEN — if a record exists in EntityKnowledge
// for this entity, it is displayed here.
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronDown } from "lucide-react";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { useEntityKnowledge } from "@/hooks/useEntityKnowledge";
import { normalizeDisplay } from "@/lib/astroClockLanguageNormalizer";
import { useIsOwner } from "@/hooks/useIsOwner";

// UI-only trilingual labels for the 9 knowledge categories (logic/sort keys stay English).
const CATEGORY_LABEL_ML = {
  properties: "ഗുണങ്ങൾ", traits: "സവിശേഷതകൾ",
  timing_rules: "സമയ നിയമങ്ങൾ", ritual_instructions: "ആചാര നിർദ്ദേശങ്ങൾ",
  incense: "തൂപം", health: "ആരോഗ്യം", general: "പൊതു",
  warnings: "മുന്നറിയിപ്പുകൾ", relationships: "ബന്ധങ്ങൾ",
};
const CATEGORY_LABEL_EN = {
  properties: "Properties", traits: "Traits",
  timing_rules: "Timing Rules", ritual_instructions: "Ritual Instructions",
  incense: "Incense", health: "Health", general: "General",
  warnings: "Warnings", relationships: "Relationships",
};
const CATEGORY_LABEL_AR = {
  properties: "الخصائص", traits: "السمات",
  timing_rules: "قواعد التوقيت", ritual_instructions: "تعليمات الطقس",
  incense: "البخور", health: "الصحة", general: "عام",
  warnings: "تحذيرات", relationships: "العلاقات",
};
function categoryLabel(cat, lang) {
  if (lang === "ar") return CATEGORY_LABEL_AR[cat] || cat;
  if (lang === "ml") return CATEGORY_LABEL_ML[cat] || cat;
  return CATEGORY_LABEL_EN[cat] || cat;
}

export default function EntityKnowledgePanel({ entityType, entityKey }) {
  const { txt, language } = useAstroClockLanguage();
  const { knowledge, loading } = useEntityKnowledge(entityType, entityKey);
  const isOwner = useIsOwner();
  const [showAll, setShowAll] = useState(false);

  // Deduplicate by knowledge_text_en (first 100 chars) — merge records with same text
  const uniqueRecords = useMemo(() => {
    if (!knowledge || knowledge.length === 0) return [];
    const seen = new Set();
    const deduped = knowledge.filter(r => {
      const key = (r.knowledge_text_en || '').toLowerCase().trim().substring(0, 100);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const PRIORITY = { properties: 1, traits: 2, timing_rules: 3, ritual_instructions: 4, incense: 5, health: 6, general: 7, warnings: 8, relationships: 9 };
    return deduped.sort((a, b) => {
      const pa = PRIORITY[a.knowledge_category] || 10;
      const pb = PRIORITY[b.knowledge_category] || 10;
      if (pa !== pb) return pa - pb;
      return (b.source_count || 1) - (a.source_count || 1);
    });
  }, [knowledge]);

  if (loading) return null;
  if (!uniqueRecords || uniqueRecords.length === 0) return null;

  return (
    <div className="rounded-lg overflow-hidden mt-1.5" style={{
      background: "rgba(129,140,248,0.04)",
      border: "1px solid rgba(129,140,248,0.15)",
    }}>
      <button onClick={() => setShowAll(!showAll)} className="w-full flex items-center gap-2 p-2 text-left">
        <BookOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#818CF8" }} />
        <span className="font-inter text-[9px] uppercase tracking-wider font-bold flex-1" style={{ color: "rgba(129,140,248,0.65)" }}>
          {txt("ഗ്രന്ഥ വിജ്ഞാനം (ഏകീകൃത പൈപ്പ്ലൈൻ)", "Manuscript Knowledge (Unified Pipeline)", "معرفة المخطوطة")}
          {" "}
          <span className="opacity-50">({uniqueRecords.length})</span>
        </span>
        <ChevronDown className="w-3.5 h-3.5 transition-transform flex-shrink-0" style={{
          color: "rgba(129,140,248,0.50)",
          transform: showAll ? "rotate(180deg)" : "none"
        }} />
      </button>
      {showAll && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
          <div className="px-2 pb-2 space-y-1.5">
            {uniqueRecords.map((rec, i) => (
              <div key={i} className="rounded-lg p-2" style={{
                background: "rgba(129,140,248,0.03)",
                border: "1px solid rgba(129,140,248,0.10)"
              }}>
                {rec.knowledge_category && rec.knowledge_category !== 'general' && (
                  <span className="font-inter text-[8px] uppercase tracking-wider font-bold mb-1 block" style={{ color: "rgba(129,140,248,0.50)" }}>
                    {categoryLabel(rec.knowledge_category, language)}
                  </span>
                )}
                {/* Split merged text by separator and show each piece */}
                {(() => {
                  const txtByLang = language === 'ml' ? (rec.knowledge_text_ml || '') : language === 'ar' ? (rec.knowledge_text_ar || '') : (rec.knowledge_text_en || '');
                  const pieces = txtByLang.split('\n---\n').filter(t => t.trim());
                  if (pieces.length === 0) {
                    return (
                      <p className="font-inter text-[10px] leading-snug" style={{ color: "rgba(255,255,255,0.30)" }}>
                        {language === 'ml' ? 'മലയാള പരിഭാഷ ഇതുവരെ ലഭ്യമല്ല.' : language === 'ar' ? 'الترجمة العربية غير متوفرة بعد.' : ''}
                      </p>
                    );
                  }
                  return pieces.map((textPiece, pi) => (
                    <p key={pi} className={`font-inter text-[10px] leading-snug mb-1 ${language === 'ar' ? 'font-amiri' : ''}`} style={{ color: "rgba(255,255,255,0.65)", ...(language === 'ar' ? { direction: 'rtl' } : {}) }}>
                      {textPiece.trim()}
                    </p>
                  ));
                })()}
                {language === 'en' && rec.knowledge_text_ar && (
                  <p className="font-amiri text-[11px] mt-1" style={{ color: "rgba(212,175,55,0.40)", direction: "rtl" }}>
                    {rec.knowledge_text_ar}
                  </p>
                )}
                {/* Sources — Owner only */}
                {isOwner && (
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="font-inter text-[7px] px-1 py-0.5 rounded" style={{
                    background: "rgba(129,140,248,0.06)",
                    color: "rgba(129,140,248,0.40)"
                  }}>
                    📖 {normalizeDisplay(rec.source_book_title || 'Manuscript')}
                    {rec.source_page_number ? ` p.${rec.source_page_number}` : ''}
                    {rec.source_screenshot_url ? ' 📷' : ''}
                  </span>
                  {rec.source_count > 1 && (
                    <span className="font-inter text-[7px] px-1 py-0.5 rounded" style={{
                      background: "rgba(212,175,55,0.06)",
                      color: "rgba(212,175,55,0.40)"
                    }}>
                      +{rec.source_count - 1} {txt("സ്രോതസ്സുകൾ", "sources", "مصادر")}
                    </span>
                  )}
                </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}