import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

// Same 5×5 Ottoman "Hâli Vasat" layout used by both Ana Vefk and Tanzim Vefki.
// This component is DISPLAY-ONLY — it never touches any calculation, it only
// reveals the already-generated Vefk values one at a time (smallest → largest)
// so the user can learn where each number belongs.
const LAYOUT = [
  [11, 15, 24,  3,  7],
  [ 4,  8, 12, 16, 20],
  [17, 21, null, 9, 13],
  [ 5, 14, 18, 22,  1],
  [23,  2,  6, 10, 19],
];

const G = {
  dim:  "rgba(212,175,55,0.55)",
  text: "#F5D060",
};

const ARABIC_DIGITS = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
function toArabicNumerals(num) {
  return String(num).split("").map(ch => (ch >= "0" && ch <= "9") ? ARABIC_DIGITS[ch.charCodeAt(0) - 48] : ch).join("");
}

export default function VefkWritingGuide({ title = "Yazım Sırası Rehberi", cells }) {
  const [revealedCount, setRevealedCount] = useState(0);

  // Order positions by their VALUE (smallest → largest) — never by pos number.
  const sortedPositions = useMemo(() => {
    if (!cells) return [];
    return Object.keys(cells).map(Number).sort((a, b) => cells[a] - cells[b]);
  }, [cells]);

  // Reset the demo whenever a new Vefk is generated.
  useEffect(() => {
    setRevealedCount(0);
  }, [cells]);

  const total = sortedPositions.length;
  const revealedPositions = new Set(sortedPositions.slice(0, revealedCount));
  const currentPos = revealedCount > 0 ? sortedPositions[revealedCount - 1] : null;

  const handleNext  = () => setRevealedCount(c => Math.min(c + 1, total));
  const handleReset = () => setRevealedCount(0);

  return (
    <div className="rounded-xl border p-4 space-y-3"
      style={{ background: "rgba(4,10,28,0.99)", borderColor: "rgba(212,175,55,0.30)" }}>
      <div className="text-center space-y-1">
        <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
          🖊 {title}
        </p>
        <p className="font-inter text-[8px]" style={{ color: "rgba(255,255,255,0.40)" }}>
          Sadece öğrenim amaçlı — hesaplamaları etkilemez
        </p>
      </div>

      <div className="w-full max-w-[380px] mx-auto" style={{ containerType: "inline-size" }}>
        <div className="grid grid-cols-5 gap-1.5">
          {LAYOUT.flat().map((pos, idx) => {
            const isCenter    = pos === null;
            const isRevealed  = !isCenter && revealedPositions.has(pos);
            const isCurrent   = !isCenter && pos === currentPos;
            const val         = isRevealed ? cells[pos] : null;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="relative aspect-square rounded-lg border flex items-center justify-center overflow-hidden"
                style={{
                  background: isCenter ? "rgba(212,175,55,0.04)" : isRevealed ? "rgba(212,175,55,0.16)" : "rgba(255,255,255,0.02)",
                  borderColor: isCenter ? "rgba(212,175,55,0.25)" : isCurrent ? G.text : isRevealed ? "rgba(212,175,55,0.45)" : "rgba(255,255,255,0.10)",
                  boxShadow: isCurrent ? "0 0 14px rgba(212,175,55,0.55), inset 0 0 8px rgba(212,175,55,0.25)" : "none",
                }}
              >
                {isCenter ? (
                  <span className="font-inter text-center px-0.5" style={{ fontSize: "clamp(6px, 2.4cqw, 8px)", color: "rgba(212,175,55,0.30)" }}>
                    merkez
                  </span>
                ) : isRevealed ? (
                  <motion.span
                    key={val}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    className="font-amiri font-black tabular-nums leading-none break-all text-center px-0.5"
                    style={{ fontSize: "clamp(8px, 3.6cqw, 15px)", color: isCurrent ? G.text : "rgba(245,208,96,0.85)", textShadow: isCurrent ? "0 0 8px rgba(212,175,55,0.6)" : "none" }}
                    dir="rtl"
                  >
                    {toArabicNumerals(val)}
                  </motion.span>
                ) : (
                  <span style={{ fontSize: "clamp(8px, 3cqw, 12px)", color: "rgba(255,255,255,0.10)" }}>·</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pt-1">
        <motion.button
          onClick={handleNext}
          disabled={!total || revealedCount >= total}
          whileHover={{ scale: revealedCount >= total ? 1 : 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="flex-1 max-w-[160px] py-2 rounded-lg font-inter text-[11px] font-bold text-[#0d1b2a] disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg,#fcd34d,#d97706)" }}
        >
          Next ({revealedCount}/{total})
        </motion.button>
        <motion.button
          onClick={handleReset}
          disabled={revealedCount === 0}
          whileHover={{ scale: revealedCount === 0 ? 1 : 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="flex-1 max-w-[160px] py-2 rounded-lg font-inter text-[11px] font-bold border disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: G.text, borderColor: "rgba(212,175,55,0.40)", background: "rgba(212,175,55,0.06)" }}
        >
          Clear
        </motion.button>
      </div>
    </div>
  );
}