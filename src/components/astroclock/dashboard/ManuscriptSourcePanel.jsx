// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT SOURCE PANEL — Reusable multi-source display
// Shows additional manuscript data grouped by source book.
// Dropped into any section's expanded detail view.
//
// UI PATTERN: Collapsible → Source headers → Items with references
// LANGUAGE RULE: One language per panel — no mixing
// DATA RULE: Additive only — never hides existing section data
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, BookOpen, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { useIsOwner } from "@/hooks/useIsOwner";

const TYPE_ICON = {
  info: Info,
  warning: AlertTriangle,
  recommend: CheckCircle2,
  answer: CheckCircle2,
  dominance: CheckCircle2,
  jaad: BookOpen,
};

const TYPE_COLOR = {
  info: "rgba(129,140,248,0.50)",
  warning: "rgba(248,113,113,0.50)",
  recommend: "rgba(74,222,128,0.50)",
  answer: "rgba(74,222,128,0.50)",
  dominance: "rgba(212,175,55,0.50)",
  jaad: "rgba(129,140,248,0.50)",
};

/**
 * @param {Array} sources — [{ id, label, items: [{ ar, en, ml, tr, type, source }] }]
 * @param {string} title — optional custom title
 * @param {boolean} defaultOpen — collapsed by default
 */
export default function ManuscriptSourcePanel({ sources = [], title, defaultOpen = false }) {
  const { txt, language } = useAstroClockLanguage();
  const [open, setOpen] = useState(defaultOpen);

  const activeSources = sources.filter(s => s.items && s.items.length > 0);
  const isOwner = useIsOwner();
  if (!isOwner || activeSources.length === 0) return null;

  // Real unique source count — deduplicate by source label/id, never hide valid sources
  const uniqueSourceIds = new Set();
  activeSources.forEach(s => {
    if (s.id) uniqueSourceIds.add(s.id);
    else if (s.label) uniqueSourceIds.add(s.label);
  });
  const realSourceCount = uniqueSourceIds.size;

  const pickLang = (item) => {
    if (language === "ml") return item.ml || "";
    if (language === "ar") return item.ar || "";
    return item.en || "";
  };

  const panelTitle = title || txt("കൂടുതൽ ഗ്രന്ഥ സ്രോതസ്സുകൾ", "Additional Manuscript Sources", "Ek Kaynaklar");

  return (
    <div className="rounded-lg overflow-hidden mt-2" style={{
      background: "rgba(129,140,248,0.03)", border: "1px solid rgba(129,140,248,0.12)",
    }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 p-2.5 text-left">
        <BookOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(129,140,248,0.50)" }} />
        <span className="font-inter text-[10px] uppercase tracking-wider font-bold flex-1" style={{ color: "rgba(129,140,248,0.60)" }}>
          {panelTitle} ({realSourceCount})
        </span>
        <ChevronDown className="w-3.5 h-3.5 transition-transform flex-shrink-0" style={{ color: "rgba(129,140,248,0.40)", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}>
            <div className="px-2.5 pb-2.5 space-y-2">
              {activeSources.map(source => (
                <div key={source.id}>
                  {/* Source header */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`${/[\u0600-\u06FF]/.test(source.label) ? 'font-amiri text-[11px]' : 'font-inter text-[9px] uppercase tracking-wider'} font-bold`} style={{ color: "rgba(129,140,248,0.50)", ...(/[\u0600-\u06FF]/.test(source.label) ? { direction: "rtl" } : {}) }}>
                      📖 {source.label}
                    </span>
                  </div>
                  {/* Items */}
                  {source.items.map((item, i) => {
                    const Icon = TYPE_ICON[item.type] || Info;
                    const color = TYPE_COLOR[item.type] || TYPE_COLOR.info;
                    const langText = pickLang(item);
                    if (!langText.trim()) return null;
                    return (
                      <div key={i} className="flex items-start gap-1.5 mb-1">
                        <Icon className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color }} />
                        <div className="flex-1 min-w-0">
                          <p className={`font-inter text-[10px] leading-snug ${language === "ar" ? "font-amiri" : ""}`} style={{ color: "rgba(255,255,255,0.60)", ...(language === "ar" ? { direction: "rtl" } : {}) }}>
                            {langText}
                          </p>
                          {language === "en" && item.ar && (
                            <p className="font-amiri text-[11px] mt-0.5" style={{ color: "rgba(212,175,55,0.40)", direction: "rtl" }}>{item.ar}</p>
                          )}
                          {item.source && (
                            <p className="font-inter text-[8px] mt-0.5" style={{ color: "rgba(129,140,248,0.30)" }}>{item.source}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
    </div>
  );
}