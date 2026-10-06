// ═══════════════════════════════════════════════════════════════
//  SECOND SQUARE — Sequential Reveal Component
//  Displays original square structure with Arabic numerals (١٢٣...)
//  Reveals numbers one-by-one on NEXT button click
//  Completely isolated from original square
// ═══════════════════════════════════════════════════════════════

import { memo } from "react";
import { motion } from "framer-motion";
import { toArabicIndic } from "./msEngine";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  border:   "rgba(212,175,55,0.40)",
};

/**
 * Convert Western digit to Arabic-Indic numeral
 * @param {number} num - Western digit (1, 2, 3...)
 * @returns {string} Arabic-Indic numeral (١, ٢, ٣...)
 */
function toArabicNumeral(num) {
  return toArabicIndic(num);
}

const SecondSquare = memo(function SecondSquare({ gridSize, originalGrid, revealedCount, L }) {
  if (!gridSize || !originalGrid) {
    return (
      <div className="rounded-2xl border p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
        style={{ background:"rgba(4,8,24,0.99)", borderColor: G.border, boxShadow:`0 0 40px ${G.glow}` }}>
        <motion.span className="font-amiri text-4xl" style={{ color:"rgba(212,175,55,0.25)" }}
          animate={{ opacity:[0.2,0.5,0.2] }} transition={{ duration:3, repeat:Infinity }}>🜂</motion.span>
        <p className="font-inter text-[10px] uppercase tracking-widest text-center" style={{ color:"rgba(212,175,55,0.25)" }}>
          {gridSize ? `${gridSize}×${gridSize} — ${L.secondSquareEmpty}` : "Select grid size to begin"}
        </p>
        <p className="font-amiri text-sm" style={{ color:"rgba(212,175,55,0.20)" }} dir="rtl">المربع الثاني</p>
      </div>
    );
  }

  const flatGrid = originalGrid.flat();
  const totalCells = flatGrid.length;

  // Build value-to-position map: sort all values ascending, track original indices
  const valueOrder = flatGrid
    .map((value, originalIdx) => ({ value, originalIdx }))
    .sort((a, b) => a.value - b.value);

  // Create a set of original indices that should be revealed (first revealedCount values in sorted order)
  const revealedIndices = new Set(
    valueOrder.slice(0, revealedCount).map(item => item.originalIdx)
  );

  return (
    <motion.div key={`second-grid-${gridSize}-${revealedCount}`}
      initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.2 }}
      className="rounded-2xl border p-4 space-y-4"
      style={{ background:"rgba(4,8,24,0.99)", borderColor: G.borderHi, boxShadow:`0 0 40px ${G.glow}` }}>

      {/* Header */}
      <div className="text-center space-y-1">
        <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.dim }}>
          🜂 Second Square {gridSize}×{gridSize} — Arabic Numerals
        </p>
        <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color:"rgba(212,175,55,0.35)" }}>
          Revealed: {revealedCount} / {totalCells}
        </p>
      </div>

      {/* Grid cells — Arabic numerals only, revealed in VALUE ORDER (smallest → largest) */}
      <div className="rounded-xl border overflow-hidden" style={{ background:"rgba(4,12,34,0.97)", borderColor:"rgba(212,175,55,0.15)" }}>
        <div style={{ overflowX:"auto", padding:"6px" }}>
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${gridSize},1fr)`, gap:"2px", minWidth: gridSize > 9 ? `${gridSize * 32}px` : "100%" }}>
            {flatGrid.map((num, idx) => {
              const isRevealed = revealedIndices.has(idx);
              const fontSize = gridSize >= 14 ? "9px" : gridSize >= 10 ? "10px" : gridSize >= 8 ? "11px" : gridSize >= 6 ? "13px" : "16px";
              
              return (
                <div key={idx}
                  className="rounded border flex items-center justify-center font-amiri font-bold transition-all duration-200"
                  style={{ 
                    aspectRatio:"1/1", 
                    minWidth:0, 
                    background: isRevealed 
                      ? "linear-gradient(145deg,rgba(212,175,55,0.14) 0%,rgba(212,175,55,0.06) 100%)"
                      : "rgba(4,12,34,0.50)",
                    borderColor: isRevealed ? "rgba(212,175,55,0.35)" : "rgba(212,175,55,0.10)",
                    color: isRevealed ? G.text : "rgba(212,175,55,0.15)",
                    fontSize 
                  }}>
                  {isRevealed ? toArabicNumeral(num) : ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="rounded-xl border p-3"
        style={{ background:"rgba(212,175,55,0.04)", borderColor:"rgba(212,175,55,0.20)" }}>
        <div className="flex items-center justify-between mb-2">
          <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>Progress</p>
          <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.text }}>{Math.round((revealedCount / totalCells) * 100)}%</p>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background:"rgba(212,175,55,0.10)" }}>
          <motion.div 
            className="h-full rounded-full"
            style={{ background:"linear-gradient(90deg,rgba(212,175,55,0.40),rgba(212,175,55,0.70))" }}
            initial={{ width: 0 }}
            animate={{ width: `${(revealedCount / totalCells) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
});

export default SecondSquare;