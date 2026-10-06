// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK VISUALS — shared renderer for attached_visuals
//
// Displays individually cropped visuals (wafq, magic squares, seals,
// symbols, tables, diagrams) that were extracted from source
// screenshots and attached to AstroClockKnowledge records.
//
// Each visual is shown together with:
//   • the cropped image (exactly as in the source)
//   • its type badge
//   • English description + verbatim Arabic caption
//   • source page + original screenshot reference
//
// APPEND-ONLY by design (see AstroClockKnowledge.attached_visuals).
// ═══════════════════════════════════════════════════════════════
import { motion } from "framer-motion";
import { ImageIcon, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useIsOwner } from "@/hooks/useIsOwner";

const TYPE_LABEL = {
  magic_square: { ml: "മാന്ത്രിക് ചതുരം", en: "Magic Square", ar: "المربع السحري" },
  wafq: { ml: "വഫ്ഖ്", en: "Wafq", ar: "الوفق" },
  table: { ml: "പട്ടിക", en: "Table", ar: "جدول" },
  symbol: { ml: "ചിഹ്നം", en: "Symbol", ar: "رمز" },
  seal: { ml: "മുദ്ര", en: "Seal", ar: "خاتم" },
  diagram: { ml: "രേഖാചിത്രം", en: "Diagram", ar: "رسم" },
  figure: { ml: "രൂപം", en: "Figure", ar: "شكل" },
  grid: { ml: "ഗ്രിഡ്", en: "Grid", ar: "شبكة" },
  handwritten_chart: { ml: "കൈയെഴുത്ത് ചാർട്ട്", en: "Handwritten Chart", ar: "رسم يدوي" },
  talisman: { ml: "തായ്ലിസ്മാൻ", en: "Talisman", ar: "طلسم" },
  other: { ml: "ചിത്രം", en: "Visual", ar: "صورة" },
};

const TYPE_COLOR = {
  magic_square: "rgba(168,85,247,0.65)",
  wafq: "rgba(168,85,247,0.60)",
  table: "rgba(129,140,248,0.60)",
  symbol: "rgba(212,175,55,0.65)",
  seal: "rgba(244,114,182,0.60)",
  diagram: "rgba(74,222,128,0.60)",
  figure: "rgba(74,222,128,0.55)",
  grid: "rgba(168,85,247,0.55)",
  handwritten_chart: "rgba(129,140,248,0.55)",
  talisman: "rgba(244,114,182,0.55)",
  other: "rgba(212,175,55,0.55)",
};

export default function AstroClockVisuals({ visuals }) {
  const [showAll, setShowAll] = useState(false);
  const isOwner = useIsOwner();
  if (!isOwner || !visuals || visuals.length === 0) return null;

  // Dedup by visual_url (safety — data is already deduped on write)
  const seen = new Set();
  const list = visuals.filter(v => {
    if (!v || !v.visual_url) return false;
    if (seen.has(v.visual_url)) return false;
    seen.add(v.visual_url);
    return true;
  });
  if (list.length === 0) return null;

  return (
    <div className="rounded-lg overflow-hidden mt-1.5" style={{
      background: "rgba(212,175,55,0.05)",
      border: "1px solid rgba(212,175,55,0.20)",
    }}>
      {/* Header */}
      <button
        onClick={() => setShowAll(!showAll)}
        className="w-full flex items-center gap-2 p-2 text-left"
      >
        <ImageIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#F5D060" }} />
        <span className="font-inter text-[9px] uppercase tracking-wider font-bold flex-1" style={{ color: "rgba(212,175,55,0.70)" }}>
          സ്രോതസ്സ് ദൃശ്യങ്ങൾ · Source Visuals
          {" "}
          <span className="opacity-50">({list.length})</span>
        </span>
        <ChevronDown className="w-3.5 h-3.5 transition-transform flex-shrink-0" style={{
          color: "rgba(212,175,55,0.55)",
          transform: showAll ? "rotate(180deg)" : "none",
        }} />
      </button>

      {showAll && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
          <div className="px-2 pb-2 space-y-2">
            {list.map((v, i) => {
              const lbl = TYPE_LABEL[v.visual_type] || TYPE_LABEL.other;
              const color = TYPE_COLOR[v.visual_type] || TYPE_COLOR.other;
              return (
                <div key={i} className="rounded-lg overflow-hidden" style={{
                  background: "rgba(8,16,38,0.55)",
                  border: `1px solid ${color}33`,
                }}>
                  {/* Type badge */}
                  <div className="flex items-center gap-1.5 px-2 py-1" style={{ borderBottom: `1px solid ${color}22` }}>
                    <span className="font-inter text-[7px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded" style={{
                      background: `${color}1a`, color,
                    }}>
                      {lbl.en}
                    </span>
                    {v.source_page && (
                      <span className="font-inter text-[7px]" style={{ color: "rgba(255,255,255,0.40)" }}>
                        p.{v.source_page}
                      </span>
                    )}
                  </div>

                  {/* Cropped image — exactly as in the source */}
                  <div className="bg-black/30 flex items-center justify-center p-1.5">
                    <img
                      src={v.visual_url}
                      alt={v.description || lbl.en}
                      loading="lazy"
                      className="max-w-full h-auto rounded"
                      style={{ maxHeight: 360, objectFit: "contain" }}
                    />
                  </div>

                  {/* Description + Arabic caption */}
                  {(v.description || v.description_ar) && (
                    <div className="px-2 py-1.5 space-y-1">
                      {v.description && (
                        <p className="font-inter text-[10px] leading-snug" style={{ color: "rgba(255,255,255,0.70)" }}>
                          {v.description}
                        </p>
                      )}
                      {v.description_ar && (
                        <p className="font-amiri text-[12px] leading-loose" style={{ color: "rgba(212,175,55,0.60)", direction: "rtl" }}>
                          {v.description_ar}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Provenance — original screenshot reference */}
                  {v.source_screenshot_url && (
                    <div className="px-2 pb-1.5">
                      <a
                        href={v.source_screenshot_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-inter text-[7px] inline-flex items-center gap-1"
                        style={{ color: "rgba(212,175,55,0.45)" }}
                      >
                        📷 യഥാർത്ഥ സ്ക്രീൻഷോട്ട് · Original Screenshot
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}