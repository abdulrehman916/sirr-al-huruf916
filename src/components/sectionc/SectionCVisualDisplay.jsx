// ═══════════════════════════════════════════════════════════════
// SectionCVisualDisplay — Visual Content Display
//
// Displays the attached_visuals array from a Birhatīya card.
// Each visual (magic square, wafq, table, symbol, seal, diagram)
// is shown as an image underneath the related text content,
// exactly as it appears in the source book.
//
// APPEND-ONLY: multiple versions from different books are
// preserved and displayed with their own citations.
// ═══════════════════════════════════════════════════════════════
import { motion } from "framer-motion";
import { Image as ImageIcon, BookOpen, Sparkles } from "lucide-react";
import { useIsOwner } from "@/hooks/useIsOwner";

const P = {
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(245,208,96,0.55)",
  faint: "rgba(212,175,55,0.14)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

const VISUAL_TYPE_LABELS = {
  magic_square: "Magic Square (Wafq)",
  wafq: "Wafq (Letter Grid)",
  table: "Table",
  symbol: "Symbol",
  seal: "Seal (Khatam)",
  diagram: "Diagram",
  figure: "Figure",
  grid: "Grid",
  handwritten_chart: "Handwritten Chart",
  other: "Visual",
};

const VISUAL_TYPE_ICONS = {
  magic_square: "▦",
  wafq: "🔲",
  table: "📊",
  symbol: "✦",
  seal: "⬡",
  diagram: "📐",
  figure: "👤",
  grid: "⊞",
  handwritten_chart: "✍",
  other: "🖼",
};

const VISUAL_TYPE_COLORS = {
  magic_square: "rgba(74,222,128,0.65)",
  wafq: "rgba(129,140,248,0.65)",
  table: "rgba(251,191,36,0.65)",
  symbol: "rgba(168,85,247,0.65)",
  seal: "rgba(14,165,233,0.65)",
  diagram: "rgba(236,72,153,0.65)",
  figure: "rgba(239,68,68,0.65)",
  grid: "rgba(34,197,94,0.65)",
  handwritten_chart: "rgba(245,208,96,0.65)",
  other: "rgba(148,163,184,0.65)",
};

export default function SectionCVisualDisplay({ visuals }) {
  const list = Array.isArray(visuals) ? visuals : [];
  const isOwner = useIsOwner();
  if (!isOwner || list.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border overflow-hidden"
      style={{ background: "rgba(8,16,38,0.55)", borderColor: P.borderHi }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${P.faint}`, background: P.bg }}>
        <ImageIcon className="w-4 h-4" style={{ color: P.text }} />
        <span className="font-malayalam text-sm font-bold" style={{ color: P.text }}>
          സ്രോതസ്സിലെ ദൃശ്യ ഉള്ളടക്കം
        </span>
        <span className="font-inter text-[8px] uppercase tracking-widest ml-auto" style={{ color: P.dim }}>
          {list.length} visual{list.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Visuals grid */}
      <div className="p-3 space-y-3">
        {list.map((v, i) => {
          const typeLabel = VISUAL_TYPE_LABELS[v.visual_type] || "Visual";
          const typeColor = VISUAL_TYPE_COLORS[v.visual_type] || VISUAL_TYPE_COLORS.other;
          const typeIcon = VISUAL_TYPE_ICONS[v.visual_type] || VISUAL_TYPE_ICONS.other;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg overflow-hidden"
              style={{ background: "rgba(8,16,38,0.4)", border: `1px solid ${P.faint}` }}
            >
              {/* Type badge + description */}
              <div className="px-3 py-2 flex items-start gap-2" style={{ borderBottom: `1px solid ${P.faint}` }}>
                <span
                  className="font-inter text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded flex-shrink-0"
                  style={{ background: `${typeColor}22`, color: typeColor }}
                >
                  {typeIcon} {typeLabel}
                </span>
                {v.description && (
                  <p className="font-inter text-[10px] leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.60)" }}>
                    {v.description}
                  </p>
                )}
              </div>

              {/* The actual image — displayed exactly as in the source */}
              {v.visual_url && (
                <div className="flex items-center justify-center p-2" style={{ background: "rgba(0,0,0,0.20)" }}>
                  <img
                    src={v.visual_url}
                    alt={`${typeLabel} — ${v.description || "Source page visual"}`}
                    className="max-w-full h-auto rounded-lg"
                    style={{ maxHeight: "500px", objectFit: "contain" }}
                    loading="lazy"
                  />
                </div>
              )}

              {/* Citation footer */}
              <div className="px-3 py-2 flex items-start gap-1.5" style={{ borderTop: `1px solid ${P.faint}`, background: "rgba(8,16,38,0.3)" }}>
                <BookOpen className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: typeColor }} />
                <div className="flex-1 min-w-0">
                  {v.source_reference && (
                    <p className="font-inter text-[9px] truncate" style={{ color: "rgba(255,255,255,0.50)" }}>
                      {v.source_reference}
                    </p>
                  )}
                  {v.source_page && (
                    <p className="font-inter text-[8px]" style={{ color: P.dim }}>
                      Page {v.source_page}
                      {v.imported_at ? ` · ${new Date(v.imported_at).toLocaleDateString()}` : ""}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}