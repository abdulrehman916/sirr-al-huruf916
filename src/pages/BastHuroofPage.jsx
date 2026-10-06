import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";
import { calcBastHuroof, BAST_LEVELS } from "../lib/bastHuroofEngine";
import AkramCard from "../components/AkramCard";
import SecondaryAkram from "../components/SecondaryAkram";
import { usePageState } from "../context/PageStateContext";
import { toAkramPieces } from "../components/AkramCard";

// ── Palette ───────────────────────────────────────────────────
const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  glowHi:   "rgba(212,175,55,0.55)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  faint:    "rgba(212,175,55,0.22)",
  bg:       "rgba(212,175,55,0.07)",
  bgHi:     "rgba(212,175,55,0.14)",
};

function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-1">
      <div className="h-px w-10" style={{ background: `linear-gradient(to right, transparent, ${G.borderHi})` }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: G.text }} />
      <div className="h-px w-10" style={{ background: `linear-gradient(to left, transparent, ${G.borderHi})` }} />
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-2xl border p-4 space-y-3"
      style={{
        background: "linear-gradient(145deg, rgba(8,18,44,0.98) 0%, rgba(4,10,28,0.99) 100%)",
        borderColor: G.border,
        boxShadow: "0 2px 20px rgba(0,0,0,0.40), inset 0 1px 0 rgba(212,175,55,0.06)",
      }}>
      <p className="font-inter text-[9px] uppercase tracking-[0.22em] text-center" style={{ color: G.dim }}>
        ✦ {title}
      </p>
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.18), transparent)` }} />
      {children}
    </div>
  );
}

// ── All 5 levels summary grid ─────────────────────────────────
function AllLevelsSummary({ allResults, onSelectLevel, selectedLevel }) {
  return (
    <SectionCard title="All 5 Bast Levels — Summary">
      <div className="grid grid-cols-1 gap-2">
        {BAST_LEVELS.map((lvl) => {
          const res = allResults[lvl.key];
          const active = selectedLevel === lvl.key;
          return (
            <motion.button
              key={lvl.key}
              onClick={() => onSelectLevel(lvl.key)}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left"
              style={{
                background: active ? G.bgHi : "rgba(255,255,255,0.02)",
                borderColor: active ? G.borderHi : G.faint,
                boxShadow: active ? `0 0 20px ${G.glow}` : "none",
              }}
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: active ? G.text : G.dim }}>
                  {lvl.label}
                </span>
                <span className="font-amiri text-sm" style={{ color: active ? G.text : "rgba(255,255,255,0.40)" }}>
                  {lvl.arabic}
                </span>
              </div>
              <div className="text-right">
                {res?.isPending ? (
                  <span className="font-inter text-[10px] text-white/25">Pending</span>
                ) : (
                  <span className="font-inter font-bold tabular-nums text-lg" style={{ color: active ? G.text : "rgba(255,255,255,0.65)" }}>
                    {(res?.total ?? 0).toLocaleString()}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </SectionCard>
  );
}

// ── Single level total card ───────────────────────────────────
function TotalCard({ result, level }) {
  const lvl = BAST_LEVELS.find(l => l.key === level);
  return (
    <div className="rounded-2xl border p-6 text-center space-y-2 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(8,18,48,0.99) 0%, rgba(4,10,28,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 60px ${G.glow}, 0 4px 32px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.12)`,
      }}>
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.45), transparent)` }} />
      <p className="font-inter text-[9px] uppercase tracking-[0.25em]" style={{ color: G.dim }}>
        {lvl?.label} — {lvl?.arabic}
      </p>
      {result.isPending ? (
        <div className="py-4 space-y-2">
          <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.40)" }}>
            ⏳ Awaiting Bast Table
          </p>
          <p className="font-inter text-xs text-white/25">
            {result.letterCount} letters extracted — values pending
          </p>
        </div>
      ) : (
        <>
          <motion.p
            className="font-amiri font-bold tabular-nums"
            style={{ fontSize: "clamp(2.8rem,12vw,4.2rem)", color: G.text, lineHeight: 1 }}
            animate={{ textShadow: [`0 0 20px ${G.glow}`, `0 0 60px ${G.glowHi}`, `0 0 20px ${G.glow}`] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {(result.total ?? 0).toLocaleString()}
          </motion.p>
          <p className="font-inter text-[9px] text-white/30 uppercase tracking-widest">
            {result.letterCount} letters
          </p>
        </>
      )}
    </div>
  );
}

// ── Breakdown Table ───────────────────────────────────────────
function BreakdownTable({ entries, level }) {
  let running = 0;
  const allPending = entries.every(e => e.value === null);
  // For large inputs, only show running totals if entries ≤ 200
  const showRunning = !allPending && entries.length <= 200;

  return (
    <SectionCard title={`Letter Breakdown — Bast Level ${level}`}>
      <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
        {entries.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(i * 0.015, 0.8), duration: 0.22 }}
            className="flex flex-col items-center rounded-xl border px-3 py-2 min-w-[48px]"
            style={{ background: G.bg, borderColor: G.faint }}
          >
            <span className="font-amiri text-2xl text-white leading-none mb-0.5">{e.original}</span>
            <span className="font-inter text-[11px] font-bold tabular-nums" style={{ color: G.text }}>
              {e.value === null ? "—" : e.value.toLocaleString()}
            </span>
          </motion.div>
        ))}
      </div>

      {showRunning && (
        <>
          <div className="h-px w-full mt-2"
            style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)` }} />
          <div className="space-y-1" dir="rtl">
            {entries.map((e, i) => {
              if (e.value !== null) running += e.value;
              const isLast = i === entries.length - 1;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(0.012 * i, 0.6), duration: 0.22 }}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg"
                  style={{
                    background: isLast ? G.bgHi : "rgba(255,255,255,0.02)",
                    borderBottom: `1px solid ${G.faint}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-amiri text-lg text-white w-6 text-center">{e.original}</span>
                    <span className="font-inter text-[10px] text-white/25">+</span>
                    <span className="font-inter text-xs tabular-nums" style={{ color: G.dim }}>
                      {e.value === null ? "—" : e.value.toLocaleString()}
                    </span>
                  </div>
                  <span className="font-inter text-sm font-bold tabular-nums"
                    style={{ color: isLast ? G.text : "rgba(255,255,255,0.50)" }}>
                    {e.value !== null ? running.toLocaleString() : "—"}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {!allPending && entries.length > 200 && (
        <p className="font-inter text-[10px] text-center text-white/25 py-2 uppercase tracking-widest">
          Running total hidden for large inputs ({entries.length} letters) — final total shown above
        </p>
      )}

      {allPending && (
        <p className="font-inter text-[10px] text-center text-white/25 py-2 uppercase tracking-widest">
          Running total available after Bast Table is populated
        </p>
      )}
    </SectionCard>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
const PAGE_KEY = 'bastHuroof';

export default function BastHuroofPage() {
  const { getPageState, setPageState, clearPageState } = usePageState();
  const initialState = getPageState(PAGE_KEY, { input: "", numberInput: "", level: 1, allResults: null, inputMode: 'text' });
  
  const [input, setInput] = useState(initialState.input);
  const [numberInput, setNumberInput] = useState(initialState.numberInput);
  const [level, setLevel] = useState(initialState.level);
  const [allResults, setAllResults] = useState(initialState.allResults);
  const [inputMode, setInputMode] = useState(initialState.inputMode);

  useEffect(() => {
    setPageState(PAGE_KEY, { input, numberInput, level, allResults, inputMode });
  }, [input, numberInput, level, allResults, inputMode, setPageState]);

  const handleCalculate = useCallback(() => {
    if (!input.trim()) return;
    const results = {};
    BAST_LEVELS.forEach(lvl => {
      results[lvl.key] = calcBastHuroof(input, lvl.key);
    });
    setAllResults(results);
  }, [input]);

  const handleClear = () => {
    setInput("");
    setNumberInput("");
    setAllResults(null);
    clearPageState(PAGE_KEY);
  };

  const handleNumberCalculate = useCallback(() => {
    const num = parseInt(numberInput);
    if (!num || num <= 0) return;
    
    // Step 1: Convert number to Akram letters (PRIMARY decomposition)
    const akramPieces = toAkramPieces(num);
    const akramLetters = akramPieces.map(p => p.letter).join('');
    
    // Step 2: Calculate ONLY the selected BAST level (same as text mode single-level workflow)
    const result = calcBastHuroof(akramLetters, level);
    
    // Store both the original number decomposition AND the bast result
    setAllResults({ 
      [level]: { 
        ...result,
        originalNumber: num,
        originalAkramPieces: akramPieces,
        originalAkramLetters: akramLetters,
      } 
    });
  }, [numberInput, level]);

  const handleLevelChange = (newLevel) => {
    setLevel(newLevel);
  };

  const activeResult = allResults?.[level] ?? null;
  
  // Extract Akram pieces for secondary transformation (only when result is ready)
  const akramPiecesForSecondary = activeResult && !activeResult.isPending && activeResult.total > 0
    ? (() => {
        const pieces = [];
        let n = activeResult.total;
        const UNITS = { 1:'ا',2:'ب',3:'ج',4:'د',5:'ه',6:'و',7:'ز',8:'ح',9:'ط' };
        const TENS = { 10:'ي',20:'ك',30:'ل',40:'م',50:'ن',60:'س',70:'ع',80:'ف',90:'ص' };
        const HUNDREDS = { 100:'ق',200:'ر',300:'ش',400:'ت',500:'ث',600:'خ',700:'ذ',800:'ض',900:'ظ' };
        const digits = [];
        let tmp = n;
        while (tmp > 0) { digits.push(tmp % 10); tmp = Math.floor(tmp / 10); }
        let i = 0, slot = 0;
        while (i < digits.length) {
          const d = digits[i];
          if (slot === 0) { if (d !== 0 && UNITS[d]) pieces.push({ value: d, letter: UNITS[d] }); i++; slot = 1; }
          else if (slot === 1) { const v = d * 10; if (d !== 0 && TENS[v]) pieces.push({ value: v, letter: TENS[v] }); i++; slot = 2; }
          else if (slot === 2) { const v = d * 100; if (d !== 0 && HUNDREDS[v]) pieces.push({ value: v, letter: HUNDREDS[v] }); i++; slot = 3; }
          else { pieces.push({ value: 1000, letter: 'غ' }); if (d === 0) { i++; slot = 1; } else if (d === 1) { i++; slot = 1; } else { pieces.push({ value: d, letter: UNITS[d] }); i++; slot = 1; } }
        }
        return pieces;
      })()
    : null;

  return (
    <PageLayout>
      <div className="space-y-4">

        {/* ── Header ── */}
        <PageTitle
          arabic="بسط الحروف ٢"
          latin="Basthul Huroof 2"
          subtitle="Dedicated Bast Engine"
          icon="٢"
        />

        {/* ── Input Mode Selector ── */}
        <div className="rounded-2xl border p-2 flex gap-2"
          style={{
            background: "rgba(4,12,34,0.97)",
            borderColor: G.border,
          }}>
          <motion.button
            onClick={() => setInputMode('text')}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-2.5 rounded-xl font-inter font-bold text-sm"
            style={{
              background: inputMode === 'text' ? G.bgHi : "transparent",
              borderColor: inputMode === 'text' ? G.borderHi : "transparent",
              border: `1px solid ${inputMode === 'text' ? G.borderHi : "transparent"}`,
              color: inputMode === 'text' ? G.text : "rgba(255,255,255,0.40)",
            }}
          >
            TEXT INPUT — نص
          </motion.button>
          <motion.button
            onClick={() => setInputMode('number')}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-2.5 rounded-xl font-inter font-bold text-sm"
            style={{
              background: inputMode === 'number' ? G.bgHi : "transparent",
              borderColor: inputMode === 'number' ? G.borderHi : "transparent",
              border: `1px solid ${inputMode === 'number' ? G.borderHi : "transparent"}`,
              color: inputMode === 'number' ? G.text : "rgba(255,255,255,0.40)",
            }}
          >
            NUMBER INPUT — رقم
          </motion.button>
        </div>

        {/* ── TEXT INPUT MODE ── */}
        {inputMode === 'text' && (
          <div className="rounded-2xl border p-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, rgba(8,20,52,0.98) 0%, rgba(4,12,34,0.99) 100%)",
              borderColor: G.borderHi,
              boxShadow: `0 0 40px ${G.glow}, 0 4px 28px rgba(0,0,0,0.50), inset 0 1px 0 rgba(212,175,55,0.10)`,
            }}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.35), transparent)` }} />

            <label className="block font-inter text-[10px] uppercase tracking-widest mb-2.5" style={{ color: G.dim }}>
              Arabic Text Input — All 5 Bast Levels
            </label>

            <textarea
              dir="rtl"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                setAllResults(null);
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCalculate();
                }
              }}
              placeholder="أدخل النص العربي هنا..."
              rows={4}
              className="w-full rounded-xl px-4 py-3 font-amiri text-xl text-white leading-relaxed resize-none focus:outline-none caret-white mb-3 placeholder:text-white/30"
              style={{ background: "rgba(4,12,34,0.97)", border: `1px solid ${G.border}`, fontSize: "16px" }}
            />

            <div className="flex gap-2">
              <motion.button
                onClick={handleCalculate}
                disabled={!input.trim()}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-inter font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed text-[#0d1b2a] tracking-wide"
                style={{
                  background: "linear-gradient(135deg,#f6d860 0%,#e0a820 50%,#c98a14 100%)",
                  boxShadow: `0 0 32px ${G.glowHi}, 0 2px 12px rgba(0,0,0,0.40)`,
                }}
              >
                <span className="font-amiri text-base">احسب</span> Calculate All Levels
              </motion.button>

              <motion.button
                onClick={handleClear}
                disabled={!input && !allResults}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center py-1.5 px-2 rounded-md border border-red-500/20 text-red-400/40 hover:text-red-400 hover:border-red-500/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: "rgba(239,68,68,0.06)", width: "auto", minWidth: "fit-content" }}
              >
                <Trash2 className="w-3 h-3" />
              </motion.button>
            </div>
          </div>
        )}

        {/* ── NUMBER INPUT MODE ── */}
        {inputMode === 'number' && (
          <div className="rounded-2xl border p-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, rgba(8,20,52,0.98) 0%, rgba(4,12,34,0.99) 100%)",
              borderColor: G.borderHi,
              boxShadow: `0 0 40px ${G.glow}, 0 4px 28px rgba(0,0,0,0.50), inset 0 1px 0 rgba(212,175,55,0.10)`,
            }}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.35), transparent)` }} />

            <label className="block font-inter text-[10px] uppercase tracking-widest mb-2.5" style={{ color: G.dim }}>
              Enter Numeric Value — Direct Akram Conversion
            </label>

            <input
              type="number"
              dir="ltr"
              value={numberInput}
              onChange={e => {
                setNumberInput(e.target.value);
                setAllResults(null);
              }}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleNumberCalculate();
                }
              }}
              placeholder="e.g., 4282, 1095, 991"
              className="w-full rounded-xl px-4 py-3 font-inter text-xl text-white leading-relaxed focus:outline-none caret-white mb-3 placeholder:text-white/30"
              style={{ background: "rgba(4,12,34,0.97)", border: `1px solid ${G.border}`, fontSize: "16px" }}
            />

            <div className="flex gap-2">
              <motion.button
                onClick={handleNumberCalculate}
                disabled={!numberInput || parseInt(numberInput) <= 0}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-inter font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed text-[#0d1b2a] tracking-wide"
                style={{
                  background: "linear-gradient(135deg,#f6d860 0%,#e0a820 50%,#c98a14 100%)",
                  boxShadow: `0 0 32px ${G.glowHi}, 0 2px 12px rgba(0,0,0,0.40)`,
                }}
              >
                <span className="font-amiri text-base">فك</span> Decompose
              </motion.button>

              <motion.button
                onClick={handleClear}
                disabled={!numberInput && !allResults}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center py-1.5 px-2 rounded-md border border-red-500/20 text-red-400/40 hover:text-red-400 hover:border-red-500/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: "rgba(239,68,68,0.06)", width: "auto", minWidth: "fit-content" }}
              >
                <Trash2 className="w-3 h-3" />
              </motion.button>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        <AnimatePresence mode="wait">
          {/* TEXT MODE RESULTS */}
          {inputMode === 'text' && allResults && (
            <motion.div
              key="text-results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {/* No letters found */}
              {BAST_LEVELS.every(lvl => allResults[lvl.key]?.letterCount === 0) && (
                <div className="rounded-xl border px-4 py-6 text-center"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <p className="font-inter text-sm text-white/30">No Arabic letters found in input.</p>
                </div>
              )}

              {BAST_LEVELS.some(lvl => allResults[lvl.key]?.letterCount > 0) && (
                <>
                  {/* All 5 levels summary — click to select active */}
                  <AllLevelsSummary
                    allResults={allResults}
                    onSelectLevel={handleLevelChange}
                    selectedLevel={level}
                  />

                  <GoldDivider />

                  {/* Active level detail */}
                  {activeResult && activeResult.letterCount > 0 && (
                    <>
                      <TotalCard result={activeResult} level={level} />

                      {/* Akram / Harf — Bast-ul-Huruf 2 exclusive */}
                      {!activeResult.isPending && activeResult.total > 0 && (
                        <>
                          <AkramCard
                            total={activeResult.total}
                            levelLabel={BAST_LEVELS.find(l => l.key === level)?.label}
                            levelArabic={BAST_LEVELS.find(l => l.key === level)?.arabic}
                          />
                          
                          {/* Secondary Akram — Letter-by-letter transformation (reverse order) */}
                          <SecondaryAkram
                            akramLetters={akramPiecesForSecondary?.map(p => p.letter).join('').split('').reverse().join('') || ''}
                            bastLevel={level}
                            levelLabel={BAST_LEVELS.find(l => l.key === level)?.label}
                            levelArabic={BAST_LEVELS.find(l => l.key === level)?.arabic}
                          />
                        </>
                      )}

                      <GoldDivider />

                      <BreakdownTable entries={activeResult.entries} level={level} />

                      {activeResult.isPending && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="rounded-xl border px-4 py-3 text-center"
                          style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.20)" }}
                        >
                          <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.45)" }}>
                            ✦ Bast Table Pending
                          </p>
                          <p className="font-inter text-xs text-white/20 mt-1">
                            {activeResult.letterCount} letters extracted and ready.
                          </p>
                        </motion.div>
                      )}
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* NUMBER MODE RESULTS - Number → Arabic Letters → Akram Pipeline */}
          {inputMode === 'number' && allResults && activeResult && (
            <motion.div
              key="number-results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {/* Number → Arabic Letters → Akram Pipeline */}
              {activeResult.letterCount > 0 && (
                <>
                  {/* Primary Akram: Direct Number Decomposition */}
                  {!activeResult.isPending && activeResult.originalAkramPieces && activeResult.originalAkramPieces.length > 0 && (
                    <AkramCard
                      total={activeResult.originalNumber}
                      levelLabel="Direct Decomposition"
                      levelArabic="التفكيك المباشر"
                    />
                  )}

                  <GoldDivider />

                  {/* Secondary Akram from Direct Decomposition Letters (reverse order) */}
                  {!activeResult.isPending && activeResult.originalAkramLetters && (
                    <SecondaryAkram
                      akramLetters={activeResult.originalAkramLetters.split('').reverse().join('')}
                      bastLevel={level}
                      levelLabel={BAST_LEVELS.find(l => l.key === level)?.label}
                      levelArabic={BAST_LEVELS.find(l => l.key === level)?.arabic}
                    />
                  )}

                  {/* Original Number Decomposition Breakdown */}
                  {activeResult.originalAkramPieces && activeResult.originalAkramPieces.length > 0 && (
                    <SectionCard title="Direct Decomposition Breakdown">
                      <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
                        {activeResult.originalAkramPieces.map((p, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: Math.min(i * 0.015, 0.8), duration: 0.22 }}
                            className="flex flex-col items-center rounded-xl border px-3 py-2 min-w-[48px]"
                            style={{ background: G.bg, borderColor: G.faint }}
                          >
                            <span className="font-amiri text-2xl text-white leading-none mb-0.5">{p.letter}</span>
                            <span className="font-inter text-[11px] font-bold tabular-nums" style={{ color: G.text }}>
                              {p.value.toLocaleString()}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                      
                      <div className="h-px w-full mt-2"
                        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)` }} />
                      
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl"
                        style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
                        <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                          Total Letters
                        </span>
                        <span className="font-inter font-bold tabular-nums text-lg" style={{ color: G.text }}>
                          {activeResult.originalAkramPieces.length}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl"
                        style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
                        <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                          Total Value
                        </span>
                        <span className="font-inter font-bold tabular-nums text-lg" style={{ color: G.text }}>
                          {activeResult.originalNumber.toLocaleString()}
                        </span>
                      </div>
                    </SectionCard>
                  )}

                  {activeResult.isPending && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-xl border px-4 py-3 text-center"
                      style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.20)" }}
                    >
                      <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.45)" }}>
                        ✦ Bast Table Pending
                      </p>
                      <p className="font-inter text-xs text-white/20 mt-1">
                        {activeResult.letterCount} letters extracted and ready.
                      </p>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageLayout>
  );
}