import { useState, useMemo, memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVefkSession } from "../context/VefkSessionContext";
import { VefkActionButtons } from "./VefkSessionManager";
import VefkWritingGuide from "./vefk/VefkWritingGuide";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  glowHi:   "rgba(212,175,55,0.55)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  bg:       "rgba(212,175,55,0.07)",
  border:   "rgba(212,175,55,0.40)",
};

// ── Abjad ────────────────────────────────────────────────────────
const ABJAD_MAP = {
  'ا':1,'ب':2,'ج':3,'د':4,'ه':5,'و':6,'ز':7,'ح':8,'ط':9,
  'ي':10,'ى':10,'ك':20,'ل':30,'م':40,'ن':50,'س':60,'ع':70,'ف':80,'ص':90,
  'ق':100,'ر':200,'ش':300,'ت':400,'ث':500,'خ':600,'ذ':700,'ض':800,'ظ':900,'غ':1000,
};
const VEFK_NORM = { 'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ؤ':'و','ئ':'ي' };
function toAbjad(t) {
  return [...t].reduce((s, c) => { const n = VEFK_NORM[c] || c; return s + (ABJAD_MAP[n] || 0); }, 0);
}
function resolveToken(raw) {
  const t = raw.trim();
  if (!t) return 0;
  if (/^\d+$/.test(t)) return parseInt(t);
  const v = toAbjad(t);
  return v > 0 ? v : 0;
}
function resolveValue(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed);
  const v = toAbjad(trimmed);
  return v > 0 ? v : null;
}
function ebcedHint(raw) {
  const trimmed = raw.trim();
  if (!trimmed || /^\d+$/.test(trimmed)) return null;
  const v = toAbjad(trimmed);
  return v > 0 ? v : null;
}

// Parse centerText: split by + and sum all tokens
function parseCenterSum(text) {
  if (!text.trim()) return null;
  const tokens = text.split("+").map(t => t.trim()).filter(Boolean);
  const sum = tokens.reduce((s, t) => s + resolveToken(t), 0);
  return sum > 0 ? sum : null;
}

// ── Ottoman 5×5 layout — null = center ──────────────────────────
const LAYOUT = [
  [11, 15, 24,  3,  7],
  [ 4,  8, 12, 16, 20],
  [17, 21, null, 9, 13],
  [ 5, 14, 18, 22,  1],
  [23,  2,  6, 10, 19],
];

// ── Tanzim values ────────────────────────────────────────────────
function tanzimValue(pos, esmaValue) {
  if (pos <= 19) return pos;
  return (esmaValue - 40) + (pos - 20);
}

// ── Ana Vefk cells ───────────────────────────────────────────────
function computeAnaVefkCells(baseNumber, esmaValue) {
  const cells = {};
  for (let pos = 1; pos <= 24; pos++) {
    cells[pos] = tanzimValue(pos, esmaValue) * baseNumber;
  }
  return cells;
}

function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-2">
      <div className="h-px w-10" style={{ background: `linear-gradient(to right, transparent, ${G.borderHi})` }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: G.text }} />
      <div className="h-px w-10" style={{ background: `linear-gradient(to left, transparent, ${G.borderHi})` }} />
    </div>
  );
}

// ── Grid — memoized to prevent zoom-triggered rerenders ──────────
// Fully responsive: percentage-based grid + clamp() font sizing so any
// number size stays inside its cell without ever overflowing.
const VefkGrid = memo(function VefkGrid({ cells, centerText, esmaRaw }) {
  const displayText = centerText?.trim() || null;
  const esmaDisplay = esmaRaw?.trim() || null;

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
                borderColor: isEmpty ? "rgba(212,175,55,0.35)" : "rgba(212,175,55,0.45)",
                boxShadow: isEmpty ? "none" : "inset 0 0 8px rgba(212,175,55,0.12)",
              }}
            >
              {isEmpty ? (
                <div className="flex flex-col w-full h-full">
                  {/* top half: center text */}
                  <div className="flex items-center justify-center w-full px-0.5 flex-1 overflow-hidden"
                    style={{ borderBottom: "1px solid rgba(212,175,55,0.20)" }}>
                    {displayText ? (
                      <p className="font-amiri text-center leading-none break-all"
                        style={{ color: G.text, fontSize: "clamp(5px, 2.4cqw, 7px)" }}
                        dir="rtl">{displayText}</p>
                    ) : (
                      <span style={{ fontSize: "clamp(5px, 2cqw, 7px)", color: "rgba(212,175,55,0.15)" }}>—</span>
                    )}
                  </div>
                  {/* bottom half: esma */}
                  <div className="flex items-center justify-center w-full px-0.5 flex-1 overflow-hidden">
                    {esmaDisplay ? (
                      <p className="font-amiri font-bold text-center leading-none break-all"
                        style={{ color: G.text, fontSize: "clamp(5px, 2.6cqw, 9px)" }}
                        dir="rtl">{esmaDisplay}</p>
                    ) : (
                      <span style={{ fontSize: "clamp(5px, 2cqw, 7px)", color: "rgba(212,175,55,0.15)" }}>—</span>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-amiri font-bold tabular-nums leading-tight text-center break-all"
                    style={{ color: G.text, fontSize, textShadow: "0 0 6px rgba(212,175,55,0.35)" }}>
                    {display}
                  </p>
                  <p className="font-inter leading-none" style={{ fontSize: "clamp(5px, 1.6cqw, 7px)", color: "rgba(212,175,55,0.28)", marginTop: "1px" }}>
                    ×{pos}
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

export default function AnaVefk() {
  const { session, updateAnaData } = useVefkSession();

  // ONE unified center input (visual + sum-based base)
  const [centerText, setCenterText] = useState(() => session?.anaData?.centerText || "");
  // Esma — still needed separately for tanzim formula (esmaVal > 40)
  const [esmaRaw, setEsmaRaw] = useState(() => session?.anaData?.esmaRaw || "");
  const [result, setResult] = useState(() => session?.anaData?.result || null);

  // Reset local state when session is cleared
  useEffect(() => {
    if (!session?.anaData) {
      setCenterText("");
      setEsmaRaw("");
      setResult(null);
    }
  }, [session?.anaData]);

  // Auto-save to context whenever any state changes (only if result exists)
  useEffect(() => {
    if (result && centerText && esmaRaw) {
      updateAnaData({ centerText, esmaRaw, result });
    }
  }, [result, centerText, esmaRaw, updateAnaData]);

  const centerSum = useMemo(() => parseCenterSum(centerText), [centerText]);
  const esmaVal   = resolveValue(esmaRaw);
  const esmaHint  = ebcedHint(esmaRaw);

  // baseNumber = sum of all center tokens + esmaVal
  const baseNumber = centerSum ? centerSum + (esmaVal || 0) : null;
  const canGenerate = baseNumber && esmaVal && esmaVal > 40;

  const handleGenerate = () => {
    if (!canGenerate) return;
    setResult({
      cells:      computeAnaVefkCells(baseNumber, esmaVal),
      baseNumber,
      esmaVal,
      centerText: centerText.trim(),
      esmaRaw:    esmaRaw.trim(),
      zikirCount: baseNumber * esmaVal,
    });
  };

  return (
    <div className="space-y-4">
      {/* Grid wrapper with ID for export */}
      <div id="ana-vefk-grid-export" style={{ display: "none" }} />

      <div className="rounded-2xl border p-5 space-y-4"
        style={{ background: "rgba(6,12,32,0.97)", borderColor: G.borderHi, boxShadow: `0 0 28px ${G.glow}` }}>

        {/* Header */}
        <div className="text-center space-y-1">
          <motion.div
            className="inline-flex items-center justify-center w-11 h-11 rounded-2xl border border-yellow-500/25 mb-1"
            style={{ background: "linear-gradient(180deg,rgba(212,175,55,0.22) 0%,rgba(212,175,55,0.08) 100%)", boxShadow: "0 0 22px rgba(212,175,55,0.18)" }}
          >
            <span className="font-amiri text-lg">📜</span>
          </motion.div>
          <motion.h2 className="font-amiri text-2xl font-bold" style={{ color: G.text }}
            animate={{ textShadow: [`0 0 14px ${G.glow}`, `0 0 28px ${G.glowHi}`, `0 0 14px ${G.glow}`] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            الأصل
          </motion.h2>
          <p className="font-inter text-[10px] font-bold text-white">ANA VEFK</p>
          <p className="font-inter text-[9px] uppercase tracking-[0.22em]" style={{ color: G.dim }}>
            Hâli Vasat Beşli System
          </p>
          <GoldDivider />
        </div>

        {/* UNIFIED CENTER CELL — free text */}
        <div className="rounded-xl border px-4 py-4 space-y-3"
          style={{ background: "rgba(4,10,28,0.99)", borderColor: "rgba(212,175,55,0.30)" }}>
          <p className="font-inter text-[9px] uppercase tracking-widest text-center" style={{ color: G.dim }}>
            🜁 Merkez — Talib · Mathloob · Niyyat
          </p>
          <textarea
            value={centerText}
            onChange={e => setCenterText(e.target.value)}
            placeholder={"Ali + Leyla\nYa Camii\n110 + 71 + 114"}
            dir="auto"
            rows={3}
            className="w-full rounded-xl px-4 py-3 font-amiri text-xl text-white text-right focus:outline-none caret-white placeholder:text-white/20 resize-none"
            style={{ background: "rgba(4,12,34,0.97)", border: "1px solid rgba(212,175,55,0.15)", lineHeight: "1.8" }}
          />
          {centerSum && (
            <p className="font-inter text-[9px]" style={{ color: "rgba(212,175,55,0.65)" }}>
              ✦ Toplam: <span className="font-amiri font-bold" style={{ color: G.text }}>{centerSum.toLocaleString()}</span>
            </p>
          )}
        </div>

        {/* ESMA SACRED CELL */}
        <div className="rounded-xl border px-4 py-4 space-y-3"
          style={{ background: "rgba(4,10,28,0.99)", borderColor: "rgba(212,175,55,0.45)" }}>
          <p className="font-inter text-[9px] uppercase tracking-widest text-center" style={{ color: G.dim }}>
            ✦ Merkez Hücre — Esma
          </p>
          <input
            type="text"
            value={esmaRaw}
            onChange={e => setEsmaRaw(e.target.value)}
            placeholder="İsim, Esma veya sayı..."
            dir="auto"
            className="w-full rounded-xl px-4 py-2.5 font-amiri text-xl text-white text-right focus:outline-none caret-white placeholder:text-white/25"
            style={{ background: "rgba(4,12,34,0.97)", border: "1px solid rgba(212,175,55,0.15)" }}
          />
          {esmaHint && (
            <p className="font-inter text-[9px]" style={{ color: "rgba(212,175,55,0.65)" }}>
              ✦ Ebced: <span className="font-amiri font-bold" style={{ color: G.text }}>{esmaHint.toLocaleString()}</span>
            </p>
          )}
          {esmaVal && esmaVal <= 40 && (
            <p className="font-inter text-[9px]" style={{ color: "rgba(255,160,80,0.80)" }}>
              ⚠ Esma değeri 40'tan büyük olmalı
            </p>
          )}
        </div>

        {/* Base number preview */}
        {baseNumber && (
          <div className="rounded-xl border px-4 py-3 space-y-1"
            style={{ background: "rgba(212,175,55,0.05)", borderColor: "rgba(212,175,55,0.20)" }}>
            <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
              📐 Base Number Hesabı
            </p>
            <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.55)" }}>
              Merkez <span style={{ color: G.text }}>{centerSum}</span>
              {esmaVal ? <> {" + "} Esma <span style={{ color: G.text }}>{esmaVal}</span></> : null}
              {" = "}<span className="font-amiri font-bold" style={{ color: G.text }}>{baseNumber.toLocaleString()}</span>
            </p>
            {esmaVal && esmaVal > 40 && (
              <p className="font-inter text-[9px]" style={{ color: "rgba(212,175,55,0.45)" }}>
                Tanzim 20→24: <span className="font-amiri" style={{ color: G.text }}>
                  {[0,1,2,3,4].map(i => esmaVal - 40 + i).join(", ")}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Rule card */}
        <div className="rounded-xl border px-4 py-3 space-y-1"
          style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.18)" }}>
          <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
            📜 Hesap Kuralı — Ana Vefk
          </p>
          <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            Base: <span style={{ color: G.text }}>Merkez Toplam + Esma</span>
          </p>
          <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            Hane 1–19: <span style={{ color: G.text }}>konum × Base</span>
          </p>
          <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            Hane 20–24: <span style={{ color: G.text }}>(Esma−40+i) × Base</span>
          </p>
          <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            Zikir: <span style={{ color: G.text }}>Base × Esma</span>
          </p>
        </div>

        <motion.button
          onClick={handleGenerate}
          disabled={!canGenerate}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-xl font-inter font-semibold text-sm text-[#0d1b2a] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg,#fcd34d,#d97706)", boxShadow: `0 0 24px ${G.glowHi}` }}
        >
          ✨ Hâli Vasat Vefki Oluştur
        </motion.button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            key={`ana-vefk-${result.baseNumber}-${result.esmaVal}`}
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border p-5 space-y-4"
            style={{ background: "rgba(4,8,24,0.99)", borderColor: G.borderHi, boxShadow: `0 0 32px ${G.glow}` }}
          >
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl px-2 py-2" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.20)" }}>
                <p className="font-inter text-[7px] uppercase tracking-widest" style={{ color: G.dim }}>Base Sayı</p>
                <p className="font-amiri text-lg font-bold" style={{ color: G.text }}>{result.baseNumber.toLocaleString()}</p>
              </div>
              <div className="rounded-xl px-2 py-2" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.20)" }}>
                <p className="font-inter text-[7px] uppercase tracking-widest" style={{ color: G.dim }}>Esma Değeri</p>
                <p className="font-amiri text-lg font-bold" style={{ color: G.text }}>{result.esmaVal.toLocaleString()}</p>
              </div>
              <div className="rounded-xl px-2 py-2" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.20)" }}>
                <p className="font-inter text-[7px] uppercase tracking-widest" style={{ color: G.dim }}>Zikir Sayısı</p>
                <p className="font-amiri text-sm font-bold leading-tight" style={{ color: G.text }}>
                  {result.zikirCount.toLocaleString()}
                </p>
              </div>
            </div>

            <GoldDivider />
            <p className="font-inter text-[9px] uppercase tracking-widest text-center" style={{ color: G.dim }}>
              🜂 5×5 Hâli Vasat — Ana Vefk
            </p>

            {/* Clone grid to export element */}
            {typeof document !== "undefined" && result && (
              <div
                id="ana-vefk-grid-export-content"
                style={{
                  display: "none",
                  padding: "20px",
                  background: "rgba(6,12,32,0.97)",
                  borderRadius: "16px",
                  border: `2px solid ${G.borderHi}`,
                }}
              >
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <p style={{ color: G.text, fontSize: "18px", fontWeight: "bold", fontFamily: "Amiri, serif", marginBottom: "10px" }}>الأصل</p>
                  <p style={{ color: "#F5D060", fontSize: "12px", fontFamily: "Inter, sans-serif", letterSpacing: "0.1em" }}>ANA VEFK</p>
                </div>
                <VefkGrid cells={result.cells} centerText={result.centerText} esmaRaw={result.esmaRaw} />
              </div>
            )}

            <div className="rounded-xl border overflow-hidden p-2" style={{ background: "rgba(4,12,34,0.97)", borderColor: "rgba(212,175,55,0.15)" }}>
              <VefkGrid cells={result.cells} centerText={result.centerText} esmaRaw={result.esmaRaw} />
            </div>

            {/* Demo Writing Grid — learning aid only, never affects calculations */}
            <VefkWritingGuide title="Ana Vefk — Yazım Sırası Demo Rehberi" cells={result.cells} />

            {/* Action Buttons */}
            <VefkActionButtons gridId="ana-vefk-grid-export-content" mode="ana" hasResult={!!result} />

            {/* Zikir Count */}
            <div className="rounded-xl border p-3 text-center"
              style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.25)" }}>
              <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                ⚖ Zikir Sayısı — {result.baseNumber} × {result.esmaVal}
              </p>
              <motion.p className="font-amiri text-3xl font-bold mt-1" style={{ color: G.text }}
                animate={{ textShadow: [`0 0 12px ${G.glow}`, `0 0 28px ${G.glowHi}`, `0 0 12px ${G.glow}`] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                {result.zikirCount.toLocaleString()}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl border p-8 flex flex-col items-center gap-3"
          style={{ background: "rgba(4,8,24,0.99)", borderColor: "rgba(212,175,55,0.12)" }}>
          <motion.span style={{ fontSize: "1.8rem", color: "rgba(212,175,55,0.18)" }}
            animate={{ opacity: [0.12, 0.40, 0.12] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}>📜</motion.span>
          <p className="font-inter text-[9px] uppercase tracking-widest text-center" style={{ color: "rgba(212,175,55,0.22)" }}>
            Merkez hücreye yazın ve Esma girerek vefki oluşturun
          </p>
        </motion.div>
      )}
    </div>
  );
}