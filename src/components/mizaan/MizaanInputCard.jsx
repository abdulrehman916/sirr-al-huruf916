import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  glowHi:   "rgba(212,175,55,0.55)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  border:   "rgba(212,175,55,0.40)",
};

export default function MizaanInputCard({
  inputMode, setInputMode,
  input, setInput,
  directNumber, setDirectNumber,
  loading, progress,
  onAnalyze, onClear,
  hasResult,
}) {
  const canAnalyze = inputMode === 'text'
    ? input.trim().length > 0
    : /^\d+$/.test(directNumber.trim()) && parseInt(directNumber.trim(), 10) > 0;

  const canClear = (inputMode === 'text' ? input.trim() : directNumber.trim()) || hasResult;

  return (
    <div className="rounded-2xl border p-5 relative overflow-hidden"
      style={{ background: "linear-gradient(145deg, rgba(8,20,52,0.98) 0%, rgba(4,12,34,0.99) 100%)", borderColor: G.borderHi, boxShadow: `0 0 40px ${G.glow}, 0 4px 28px rgba(0,0,0,0.50), inset 0 1px 0 rgba(212,175,55,0.10)` }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.35), transparent)` }} />

      {/* Mode toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setInputMode('text')}
          className="flex-1 py-2 px-3 rounded-xl font-inter font-bold text-xs uppercase tracking-wider"
          style={{
            background: inputMode === 'text' ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.03)',
            border: `1.5px solid ${inputMode === 'text' ? 'rgba(212,175,55,0.65)' : 'rgba(255,255,255,0.12)'}`,
            color: inputMode === 'text' ? '#F5D060' : 'rgba(255,255,255,0.40)',
          }}>
          Arabic Text
        </button>
        <button
          onClick={() => setInputMode('number')}
          className="flex-1 py-2 px-3 rounded-xl font-inter font-bold text-xs uppercase tracking-wider"
          style={{
            background: inputMode === 'number' ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.03)',
            border: `1.5px solid ${inputMode === 'number' ? 'rgba(212,175,55,0.65)' : 'rgba(255,255,255,0.12)'}`,
            color: inputMode === 'number' ? '#F5D060' : 'rgba(255,255,255,0.40)',
          }}>
          Direct Number
        </button>
      </div>

      {/* Input area */}
      {inputMode === 'text' ? (
        <>
          <label className="block font-inter text-[10px] uppercase tracking-widest mb-2.5" style={{ color: G.dim }}>
            Arabic Text — Surah · Ayah · Talib · Matloob
          </label>
          <textarea
            dir="rtl"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="أدخل النص العربي هنا — السورة، الآية، الاسم..."
            rows={5}
            className="w-full rounded-xl px-4 py-3 font-amiri text-xl text-white leading-relaxed resize-none focus:outline-none caret-white mb-3 placeholder:text-white/30"
            style={{ background: "rgba(4,12,34,0.97)", border: `1px solid ${G.border}`, fontSize: "16px" }}
          />
        </>
      ) : (
        <>
          <label className="block font-inter text-[10px] uppercase tracking-widest mb-2.5" style={{ color: G.dim }}>
            Direct Number — First Mizan Value
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={directNumber}
            onChange={e => setDirectNumber(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="Enter a positive integer…"
            className="w-full rounded-xl px-4 py-3 font-inter text-2xl text-white text-center tabular-nums focus:outline-none caret-white mb-3 placeholder:text-white/30"
            style={{ background: "rgba(4,12,34,0.97)", border: `1px solid ${G.border}`, fontSize: "16px" }}
          />
        </>
      )}

      {loading && (
        <div className="mb-3">
          <div className="flex justify-between mb-1.5">
            <span className="font-inter text-[10px] text-white/40 animate-pulse">✦ Analyzing 9 Mizaans…</span>
            <span className="font-inter text-[10px] tabular-nums font-bold" style={{ color: G.dim }}>{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.15 }}
              className="h-full rounded-full" style={{ background: `linear-gradient(90deg,${G.text},#d97706)` }} />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <motion.button
          onClick={onAnalyze}
          disabled={!canAnalyze || loading}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-inter font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed text-[#0d1b2a] tracking-wide"
          style={{ background: "linear-gradient(135deg,#f6d860 0%,#e0a820 50%,#c98a14 100%)", boxShadow: `0 0 36px ${G.glowHi}, 0 2px 12px rgba(0,0,0,0.40)` }}>
          {loading
            ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : <span className="font-amiri text-base">⚖</span>}
          {loading ? "Analyzing…" : "Analyze — 9 Mizan"}
        </motion.button>
        <motion.button
          onClick={onClear}
          disabled={!canClear}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 py-3 px-4 rounded-xl text-white/55 hover:text-white font-inter text-sm border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.12)", width: "auto", flexShrink: 0 }}>
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </motion.button>
      </div>
    </div>
  );
}