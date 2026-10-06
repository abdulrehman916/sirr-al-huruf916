import { useState, useMemo, memo, useEffect } from "react";
import { useVefkSession } from "../context/VefkSessionContext";
import { VefkActionButtons } from "./VefkSessionManager";
import VefkWritingGuide from "./vefk/VefkWritingGuide";
import { motion, AnimatePresence } from "framer-motion";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  glowHi:   "rgba(212,175,55,0.55)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  bg:       "rgba(212,175,55,0.07)",
  border:   "rgba(212,175,55,0.40)",
};

// ── Abjad (Tanzim-isolated) ───────────────────────────────────────
const ABJAD_MAP = {
  'ا':1,'ب':2,'ج':3,'د':4,'ه':5,'و':6,'ز':7,'ح':8,'ط':9,
  'ي':10,'ى':10,'ك':20,'ل':30,'م':40,'ن':50,'س':60,'ع':70,'ف':80,'ص':90,
  'ق':100,'ر':200,'ش':300,'ت':400,'ث':500,'خ':600,'ذ':700,'ض':800,'ظ':900,'غ':1000,
};
const TANZIM_NORM = { 'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ؤ':'و','ئ':'ي' };
function tanzimEbced(t) {
  return [...t].reduce((s, c) => { const n = TANZIM_NORM[c] || c; return s + (ABJAD_MAP[n] || 0); }, 0);
}

// ── Ottoman 5×5 layout — null = center (visual only) ────────────
const LAYOUT = [
  [11, 15, 24,  3,  7],
  [ 4,  8, 12, 16, 20],
  [17, 21, null, 9, 13],
  [ 5, 14, 18, 22,  1],
  [23,  2,  6, 10, 19],
];

// ── Tanzim cell formula (Ottoman Manuscript) ─────────────────────
// If esmaValue < 40: first square it → BASE = esmaValue²
// Cells 1–19: value = BASE × natural_position
// Cells 20–24: value = (BASE − 40 + offset) × BASE
//   20 → (BASE−40)×BASE, 21 → (BASE−39)×BASE, ... 24 → (BASE−36)×BASE
// Magic Constant = BASE²
function resolveBase(esmaValue) {
  return esmaValue < 40 ? esmaValue * esmaValue : esmaValue;
}
function computeTanzimCells(esmaValue) {
  const base = resolveBase(esmaValue);
  const cells = {};
  for (let pos = 1; pos <= 19; pos++) {
    cells[pos] = base * pos;
  }
  for (let i = 0; i <= 4; i++) {
    cells[20 + i] = (base - 40 + i) * base;
  }
  return cells;
}

function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-2">
      <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${G.borderHi})` }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: G.text }} />
      <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${G.borderHi})` }} />
    </div>
  );
}

const TanzimGrid = memo(function TanzimGrid({ cells, esmaText }) {
  return (
    <div className="w-full max-w-[420px] mx-auto" style={{ containerType: "inline-size" }}>
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
        {LAYOUT.flat().map((pos, idx) => {
          const isEmpty = pos === null;
          const val = isEmpty ? null : cells[pos];
          const display = val != null ? val.toLocaleString() : null;
          const fontSize = display && display.length > 12 ? "clamp(5px, 2.1cqw, 8px)"
            : display && display.length > 9 ? "clamp(6px, 2.4cqw, 9px)"
            : display && display.length > 6 ? "clamp(7px, 2.8cqw, 11px)"
            : display && display.length > 4 ? "clamp(8px, 3.2cqw, 12px)"
            : "clamp(9px, 3.6cqw, 14px)";
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.018, duration: 0.22 }}
              className="relative aspect-square rounded-lg border flex flex-col items-center justify-center overflow-hidden p-0.5"
              style={{
                background: isEmpty ? "rgba(212,175,55,0.04)" : "rgba(212,175,55,0.10)",
                borderColor: isEmpty ? "rgba(212,175,55,0.18)" : "rgba(212,175,55,0.45)",
                boxShadow: isEmpty ? "none" : "inset 0 0 8px rgba(212,175,55,0.12)",
              }}
            >
              {isEmpty ? (
                <div className="flex items-center justify-center w-full h-full px-1 overflow-hidden">
                  {esmaText ? (
                    <p className="font-amiri text-center leading-tight break-all"
                      style={{ color: G.text, fontSize: "clamp(6px, 3cqw, 10px)" }}
                      dir="rtl">{esmaText}</p>
                  ) : (
                    <motion.span style={{ fontSize: "clamp(14px, 6cqw, 1.1rem)", color: "rgba(212,175,55,0.18)" }}
                      animate={{ opacity: [0.1, 0.35, 0.1] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}>□</motion.span>
                  )}
                </div>
              ) : (
                <>
                  <p className="font-amiri font-bold tabular-nums leading-tight text-center break-all"
                    style={{ color: G.text, fontSize, textShadow: "0 0 6px rgba(212,175,55,0.35)" }}>
                    {display}
                  </p>
                  <p className="font-inter leading-none" style={{ fontSize: "clamp(5px, 1.6cqw, 7px)", color: "rgba(212,175,55,0.28)", marginTop: "1px" }}>
                    [{pos}]
                  </p>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

export default function TanzimVefki() {
  const { session, updateTanzimData } = useVefkSession();

  const [bazRaw,   setBazRaw]   = useState(() => session?.tanzimData?.bazRaw || "");
  const [esmaText, setEsmaText] = useState(() => session?.tanzimData?.esmaText || "");

  // Reset local state when session is cleared
  useEffect(() => {
    if (!session?.tanzimData) {
      setBazRaw("");
      setEsmaText("");
    }
  }, [session?.tanzimData]);

  // ── Esma/Baz value resolution ─────────────────────────────────
  // If numeric → use directly. If text/Arabic → compute Ebced.
  const bazTrimmed   = bazRaw.trim();
  const bazIsNumeric = /^\d+$/.test(bazTrimmed);
  const bazEbced     = (!bazIsNumeric && bazTrimmed) ? tanzimEbced(bazTrimmed) : null;
  const esmaValue    = bazTrimmed
    ? (bazIsNumeric ? parseInt(bazTrimmed) : bazEbced)
    : null;

  // Any positive esmaValue is valid (small values get squared first)
  const canGenerate = esmaValue && esmaValue > 0;
  const base        = canGenerate ? resolveBase(esmaValue) : null;
  const wasSquared  = canGenerate && esmaValue < 40;
  // Memoized so the cells object reference stays stable across unrelated
  // re-renders — this is required for the Demo Writing Grid to keep its
  // revealed progress instead of resetting on every render.
  const cells       = useMemo(() => (canGenerate ? computeTanzimCells(esmaValue) : null), [canGenerate, esmaValue]);
  const magicConst  = base ? base * base : null;

  // Auto-save to context when cells are generated (only if inputs exist)
  useEffect(() => {
    if (cells && bazRaw && esmaText) {
      updateTanzimData({ bazRaw, esmaText, cells, esmaValue, base, magicConst });
    }
  }, [cells, bazRaw, esmaText, esmaValue, base, magicConst, updateTanzimData]);

  return (
    <div className="space-y-4">
      {/* Grid wrapper with ID for export */}
      <div id="tanzim-vefk-grid-export" style={{ display: "none" }} />

      <div className="rounded-2xl border p-5 space-y-4"
        style={{ background: "rgba(6,12,32,0.97)", borderColor: G.borderHi, boxShadow: `0 0 28px ${G.glow}` }}>

        {/* Header */}
        <div className="text-center space-y-1">
          <motion.div
            className="inline-flex items-center justify-center w-11 h-11 rounded-2xl border border-yellow-500/25 mb-1"
            style={{ background: "linear-gradient(180deg,rgba(212,175,55,0.22) 0%,rgba(212,175,55,0.08) 100%)", boxShadow: "0 0 22px rgba(212,175,55,0.18)" }}
          >
            <span className="font-amiri text-lg" style={{ color: "#D4AF37" }}>✨</span>
          </motion.div>
          <motion.h2 className="font-amiri text-2xl font-bold" style={{ color: G.text }}
            animate={{ textShadow: [`0 0 14px ${G.glow}`, `0 0 28px ${G.glowHi}`, `0 0 14px ${G.glow}`] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            تنظيم
          </motion.h2>
          <p className="font-inter text-[10px] font-bold text-white">TANZİM VEFKİ</p>
          <p className="font-inter text-[9px] uppercase tracking-[0.22em]" style={{ color: G.dim }}>
            Hâli Vasat — 2. Usül
          </p>
          <GoldDivider />
          <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.30)" }}>
            5×5 Empty Center — Ottoman Manuscript Method
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          {/* Esma / Baz Sayı */}
          <div className="rounded-xl border px-4 py-3 space-y-1.5"
            style={{ background: "rgba(4,10,28,0.99)", borderColor: G.border }}>
            <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
              1️⃣ Esma / Baz Sayı — الاسم أو الرقم
            </p>
            <input
              type="text"
              value={bazRaw}
              onChange={e => setBazRaw(e.target.value)}
              placeholder="Sayı veya isim... (örn: 114 / الله / Vedud)"
              dir="auto"
              className="w-full rounded-xl px-4 py-2.5 font-amiri text-2xl text-center text-white font-bold focus:outline-none caret-white placeholder:text-white/25"
              style={{ background: "rgba(4,12,34,0.97)", border: `1px solid ${G.border}` }}
            />
            {bazEbced !== null && bazEbced > 0 && (
              <p className="font-inter text-[9px] text-center" style={{ color: "rgba(212,175,55,0.65)" }}>
                ✦ Ebced: <span className="font-amiri font-bold" style={{ color: G.text }}>{bazEbced.toLocaleString()}</span>
              </p>
            )}
            {esmaValue && (
              <div className="rounded-lg px-3 py-2 space-y-1" style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.15)" }}>
                <p className="font-inter text-[9px]" style={{ color: G.dim }}>
                  Esma Değeri: <span className="font-amiri font-bold" style={{ color: G.text }}>{esmaValue.toLocaleString()}</span>
                </p>
                {wasSquared && (
                  <p className="font-inter text-[9px]" style={{ color: "rgba(255,200,80,0.85)" }}>
                    ✦ Küçük sayı → BASE = {esmaValue}² = <span className="font-amiri font-bold" style={{ color: G.text }}>{(esmaValue * esmaValue).toLocaleString()}</span>
                  </p>
                )}
                {base && (
                  <p className="font-inter text-[9px]" style={{ color: "rgba(212,175,55,0.45)" }}>
                    Hane 20→24: <span className="font-amiri" style={{ color: G.text }}>
                      {[0,1,2,3,4].map(i => `${base - 40 + i}×${base}`).join(", ")}
                    </span>
                  </p>
                )}
                {base && (
                  <p className="font-inter text-[9px]" style={{ color: "rgba(212,175,55,0.45)" }}>
                    Kutsal Sabit: <span className="font-amiri font-bold" style={{ color: G.text }}>{base}² = {(base * base).toLocaleString()}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Esma visual — center cell only */}
          <div className="rounded-xl border px-4 py-3 space-y-1.5"
            style={{ background: "rgba(4,10,28,0.99)", borderColor: "rgba(212,175,55,0.20)" }}>
            <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
              2️⃣ Merkez Hücre Metni (İsteğe Bağlı) — النص المركزي
            </p>
            <input
              type="text"
              value={esmaText}
              onChange={e => setEsmaText(e.target.value)}
              placeholder="الله / Vedud / ..."
              dir="rtl"
              className="w-full rounded-xl px-4 py-2 font-amiri text-lg text-white text-right focus:outline-none caret-white placeholder:text-white/25"
              style={{ background: "rgba(4,12,34,0.97)", border: `1px solid rgba(212,175,55,0.15)` }}
            />
            <p className="font-inter text-[8px]" style={{ color: "rgba(212,175,55,0.30)" }}>
              Sadece görsel — merkez hücrede gösterilir, hesaplara dahil değil
            </p>
          </div>
        </div>

        {/* Rule card */}
        <div className="rounded-xl border px-4 py-3 space-y-1"
          style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.18)" }}>
          <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
            📜 Hesap Kuralı — Tanzim Usülü
          </p>
          <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            BASE: <span style={{ color: G.text }}>Esma &lt; 40 ise BASE = Esma², aksi halde BASE = Esma</span>
          </p>
          <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            Hane 1–19: <span style={{ color: G.text }}>BASE × konum</span>
          </p>
          <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            Hane 20–24: <span style={{ color: G.text }}>(BASE−40+i) × BASE</span>
          </p>
          <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            Kutsal Sabit: <span style={{ color: G.text }}>BASE²</span>
          </p>
        </div>

        {/* Grid output */}
        <AnimatePresence mode="wait">
          {cells ? (
            <motion.div key={`tanzim-${esmaValue}`}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${G.borderHi}, transparent)` }} />
              <p className="font-inter text-[9px] uppercase tracking-widest text-center" style={{ color: G.dim }}>
                ✨ Hâli Vasat Tanzim Vefki
              </p>

              {/* Clone grid to export element */}
              {typeof document !== "undefined" && cells && (
                <div
                  id="tanzim-vefk-grid-export-content"
                  style={{
                    display: "none",
                    padding: "20px",
                    background: "rgba(6,12,32,0.97)",
                    borderRadius: "16px",
                    border: `2px solid ${G.borderHi}`,
                  }}
                >
                  <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <p style={{ color: G.text, fontSize: "18px", fontWeight: "bold", fontFamily: "Amiri, serif", marginBottom: "10px" }}>تنظيم</p>
                    <p style={{ color: "#F5D060", fontSize: "12px", fontFamily: "Inter, sans-serif", letterSpacing: "0.1em" }}>TANZİM VEFKİ</p>
                  </div>
                  <TanzimGrid cells={cells} esmaText={esmaText} />
                </div>
              )}

              <div className="rounded-xl border overflow-hidden p-2" style={{ background: "rgba(4,12,34,0.97)", borderColor: "rgba(212,175,55,0.15)" }}>
                <TanzimGrid cells={cells} esmaText={esmaText} />
              </div>

              {/* Demo Writing Grid — learning aid only, never affects calculations */}
              <VefkWritingGuide title="Tanzim Vefki — Yazım Sırası Demo Rehberi" cells={cells} />

              {/* Action Buttons */}
              <VefkActionButtons gridId="tanzim-vefk-grid-export-content" mode="tanzim" hasResult={!!cells} />

              {/* Magic Constant display */}
              <div className="rounded-xl border p-3 text-center"
                style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.25)" }}>
                <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                  ⚖ Kutsal Sabit — BASE²
                </p>
                {wasSquared && (
                  <p className="font-inter text-[8px] mt-0.5" style={{ color: "rgba(212,175,55,0.45)" }}>
                    {esmaValue}² = {base?.toLocaleString()} → {base?.toLocaleString()}²
                  </p>
                )}
                <motion.p className="font-amiri text-3xl font-bold mt-1" style={{ color: G.text }}
                  animate={{ textShadow: [`0 0 12px ${G.glow}`, `0 0 28px ${G.glowHi}`, `0 0 12px ${G.glow}`] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                  {magicConst?.toLocaleString()}
                </motion.p>
              </div>

            </motion.div>
          ) : (
            <motion.div key="tanzim-placeholder"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="rounded-xl border p-8 flex flex-col items-center gap-3"
              style={{ background: "rgba(4,8,24,0.99)", borderColor: "rgba(212,175,55,0.12)" }}
            >
              <motion.span style={{ fontSize: "1.8rem", color: "rgba(212,175,55,0.18)" }}
                animate={{ opacity: [0.12, 0.40, 0.12] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}>✨</motion.span>
              <p className="font-inter text-[9px] uppercase tracking-widest text-center" style={{ color: "rgba(212,175,55,0.22)" }}>
                Esma değerini veya ismi girerek tanzim vefkini oluşturun
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}