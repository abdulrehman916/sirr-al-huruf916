// ═══════════════════════════════════════════════════════════════
// AKRAM / HARF CONVERSION — Used ONLY by BastHuroofPage
// Fully isolated. No shared logic with any other engine.
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";

// ── Palette ───────────────────────────────────────────────────
const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  faint:    "rgba(212,175,55,0.22)",
  bg:       "rgba(212,175,55,0.07)",
  bgHi:     "rgba(212,175,55,0.14)",
};

// ── Letter tables ─────────────────────────────────────────────
const UNITS    = { 1:'ا',2:'ب',3:'ج',4:'د',5:'ه',6:'و',7:'ز',8:'ح',9:'ط' };
const TENS     = { 10:'ي',20:'ك',30:'ل',40:'م',50:'ن',60:'س',70:'ع',80:'ف',90:'ص' };
const HUNDREDS = { 100:'ق',200:'ر',300:'ش',400:'ت',500:'ث',600:'خ',700:'ذ',800:'ض',900:'ظ' };

// ── Core algorithm ────────────────────────────────────────────
/**
 * AKRAM rule — process digits right-to-left through a fixed cycle:
 *   Slot 0 = Unit (1–9)
 *   Slot 1 = Ten  (10–90)
 *   Slot 2 = Hundred (100–900)
 *   Slot 3 = Thousand marker غ, consuming the digit that caused it:
 *              digit=1 → غ alone, next slot restarts at Ten (slot 1)
 *              digit=2–9 → غ + that digit as Unit, next slot = Ten (slot 1)
 *
 * Examples (verified):
 *   1462  → 2(U)  60(T)  400(H)  غ[1]                → بستغ
 *   2345  → 5(U)  40(T)  300(H)  غ[2→U]              → همشغب
 *   31296 → 6(U)  90(T)  200(H)  غ[1-standalone] 30(T)→ وصرغل
 *   488474→ 4(U)  70(T)  400(H)  غ[8→U]  80(T) 400(H)→ دعتغحفت
 */
export function toAkramPieces(n) {
  if (!n || n < 1) return [];
  n = Math.floor(n);

  // Extract all digits right-to-left (LSD first)
  const digits = [];
  let tmp = n;
  while (tmp > 0) {
    digits.push(tmp % 10);
    tmp = Math.floor(tmp / 10);
  }

  const pieces = [];
  let i = 0;          // current digit index (0 = units digit)
  let slot = 0;       // 0=unit, 1=ten, 2=hundred, 3=thousand-cycle

  while (i < digits.length) {
    const d = digits[i];

    if (slot === 0) {
      // Unit slot
      if (d !== 0 && UNITS[d]) pieces.push({ value: d, letter: UNITS[d] });
      i++;
      slot = 1;
    } else if (slot === 1) {
      // Ten slot
      const v = d * 10;
      if (d !== 0 && TENS[v]) pieces.push({ value: v, letter: TENS[v] });
      i++;
      slot = 2;
    } else if (slot === 2) {
      // Hundred slot
      const v = d * 100;
      if (d !== 0 && HUNDREDS[v]) pieces.push({ value: v, letter: HUNDREDS[v] });
      i++;
      slot = 3;
    } else {
      // Thousand slot — always emit غ regardless of digit value
      pieces.push({ value: 1000, letter: 'غ' });

      if (d === 0) {
        // Zero in thousands position: غ is emitted, digit consumed, restart from Ten
        i++;
        slot = 1;
      } else if (d === 1) {
        // Standalone 1000: digit 1 consumed by غ itself, restart from Ten
        i++;
        slot = 1;
      } else {
        // digit 2–9: emit as Unit after غ, then continue from Ten
        pieces.push({ value: d, letter: UNITS[d] });
        i++;
        slot = 1;
      }
    }
  }

  return pieces;
}



// ── Component ─────────────────────────────────────────────────
export default function AkramCard({ total, levelLabel, levelArabic }) {
  if (!total || total <= 0) return null;

  const pieces = toAkramPieces(total);
  if (!pieces.length) return null;

  const akramLetters = pieces.map(p => p.letter).join('');
  const breakdownStr = pieces.map(p => p.value.toLocaleString()).join(' • ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      className="rounded-2xl border p-5 space-y-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`,
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)" }} />

      {/* Title */}
      <p className="font-inter text-[9px] uppercase tracking-[0.26em] text-center" style={{ color: G.dim }}>
        ✦ Akram / Harf — {levelLabel} — {levelArabic}
      </p>
      <div className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)" }} />

      {/* Bast value */}
      <div className="flex items-center justify-between px-2">
        <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.38)" }}>
          Bast Value
        </span>
        <span className="font-inter font-bold tabular-nums text-sm" style={{ color: G.text }}>
          {total.toLocaleString()}
        </span>
      </div>

      {/* Breakdown tiles */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-2">
          <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.38)" }}>
            Akram Breakdown
          </p>
          <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.text }}>
            {pieces.length} Letter{pieces.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 px-1 justify-start">
          {[...pieces].reverse().map((p, i) => {
            const isGhain = p.letter === 'غ';
            const originalIndex = pieces.length - 1 - i;
            return (
              <motion.div
                key={originalIndex}
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: originalIndex * 0.04, duration: 0.25 }}
                className="flex flex-col items-center rounded-xl border px-2.5 py-2 min-w-[46px]"
                style={{
                  background: isGhain ? G.bgHi : G.bg,
                  borderColor: isGhain ? G.borderHi : G.faint,
                }}
              >
                <span className="font-amiri leading-none mb-0.5" style={{ color: "#fff", fontSize:"26px", fontWeight:700 }}>
                  {p.letter}
                </span>
                <span className="font-inter text-[10px] tabular-nums font-bold" style={{ color: G.dim }}>
                  {p.value.toLocaleString()}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.18), transparent)" }} />

      {/* Akram letters */}
      <div className="space-y-2 text-center">
        <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.38)" }}>
          Akram Letters
        </p>
        <motion.p
          className="font-amiri leading-none"
          dir="rtl"
          style={{ fontSize: "clamp(2rem, 9vw, 3rem)", fontWeight:700, color: G.text, letterSpacing:0 }}
          animate={{
            textShadow: [
              "0 0 14px rgba(212,175,55,0.28)",
              "0 0 44px rgba(212,175,55,0.72)",
              "0 0 14px rgba(212,175,55,0.28)",
            ],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {akramLetters}
        </motion.p>
        <p className="font-inter text-[10px] tabular-nums" style={{ color: "rgba(212,175,55,0.45)" }}>
          {breakdownStr}
        </p>
      </div>
    </motion.div>
  );
}