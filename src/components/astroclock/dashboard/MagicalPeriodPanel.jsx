// ═══════════════════════════════════════════════════════════════
// MAGICAL PERIOD PANEL
// Displays manuscript-sourced "magical period" knowledge for a given
// entity (weekday / planet / zodiac / lunar mansion).
//
// RULE: Never invents magical periods. Only displays records already
// stored in AstroClockKnowledge whose rule_category or attributes
// indicate a magical period for this entity. If no such manuscript
// data exists, shows "No manuscript data available." Future manuscript
// uploads are automatically attached to the correct entity by the
// ingestion pipeline (matched via rule_entity), so this panel needs
// no manual wiring.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { useIsOwner } from "@/hooks/useIsOwner";

// A record counts as a "magical period" record when its category or
// attributes explicitly mention a magical period / duration.
function isMagicalPeriodRecord(r) {
  const cat = String(r.rule_category || "").toLowerCase();
  const attrs = r.attributes && typeof r.attributes === "object" ? r.attributes : {};
  const attrKeys = Object.keys(attrs).join(" ").toLowerCase();
  return cat.includes("magical") || cat.includes("period")
    || attrKeys.includes("magical") || attrKeys.includes("period")
    || attrs.magical_period != null;
}

export default function MagicalPeriodPanel({ entityType, entityKey }) {
  const { txt, language } = useAstroClockLanguage();
  const isOwner = useIsOwner();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const key = String(entityKey || "").toLowerCase().trim();

  useEffect(() => {
    if (!key) { setRecords([]); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    base44.entities.AstroClockKnowledge.filter({ is_marker: false, rule_entity: key }, "-source_count", 30)
      .then(res => {
        if (cancelled) return;
        const all = Array.isArray(res) ? res : [];
        setRecords(all.filter(isMagicalPeriodRecord));
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setRecords([]); setLoading(false); } });
    return () => { cancelled = true; };
  }, [entityType, key]);

  const title = txt("മാന്ത്രിക കാലം", "Magical Period", "المدة السحرية");

  return (
    <div className="rounded-lg p-2 mt-1" style={{ background: "rgba(129,140,248,0.04)", border: "1px solid rgba(129,140,248,0.15)" }}>
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(129,140,248,0.65)" }} />
        <span className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(129,140,248,0.65)" }}>{title}</span>
      </div>
      {loading ? (
        <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>{txt("ലഭ്യമാക്കുന്നു...", "Loading...", "جارٍ التحميل...")}</p>
      ) : records.length === 0 ? (
        <p className="font-inter text-[10px] text-center py-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          {txt("ഗ്രന്ഥ വിവരം ലഭ്യമല്ല.", "No manuscript data available.", "لا توجد بيانات المخطوطة.")}
        </p>
      ) : (
        <div className="space-y-1.5">
          {records.map((r, i) => {
            const text = language === "ml" ? (r.knowledge_text_ml || "")
              : language === "ar" ? (r.knowledge_text_ar || "")
              : (r.knowledge_text_en || "");
            const arSupp = language === "en" ? (r.knowledge_text_ar || "") : "";
            const attrs = r.attributes && typeof r.attributes === "object" ? r.attributes : {};
            const attrEntries = Object.entries(attrs).filter(([, v]) => v != null && v !== "");
            return (
              <div key={r.knowledge_id || i} className="rounded p-1.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(129,140,248,0.12)" }}>
                {arSupp && <p className="font-amiri text-[11px] mb-0.5" style={{ color: "rgba(212,175,55,0.50)", direction: "rtl" }}>{arSupp}</p>}
                {text ? (
                  <p className={`font-inter text-[10px] leading-snug ${language === "ar" ? "font-amiri" : ""}`} style={{ color: "rgba(255,255,255,0.65)", ...(language === "ar" ? { direction: "rtl" } : {}) }}>{text}</p>
                ) : (
                  <p className="font-inter text-[10px] leading-snug" style={{ color: "rgba(255,255,255,0.30)" }}>
                    {language === "ml" ? "മലയാള പരിഭാഷ ഇതുവരെ ലഭ്യമല്ല." : language === "ar" ? "الترجمة العربية غير متوفرة بعد." : ""}
                  </p>
                )}
                {language === "en" && attrEntries.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {attrEntries.map(([k, v], ai) => (
                      <span key={ai} className="font-inter text-[8px] px-1.5 py-0.5 rounded" style={{ background: "rgba(129,140,248,0.08)", color: "rgba(129,140,248,0.70)" }}>{k}: {String(v)}</span>
                    ))}
                  </div>
                )}
                {isOwner && r.source_book_title && (
                  <p className="font-inter text-[8px] mt-1" style={{ color: "rgba(74,222,128,0.35)" }}>📖 {r.source_book_title}{r.source_page_number ? ` p.${r.source_page_number}` : ""}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}