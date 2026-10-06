import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Trash2, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { analyzeText, ELEMENTS } from "../lib/anasirValues";
import AnasirLetterGrid from "../components/AnasirLetterGrid";
import AnasirResultsSummary from "../components/AnasirResultsSummary";

const DOMINANT_STYLES = {
  fire:  { color: "#f97316", glow: "rgba(249,115,22,0.28)",  border: "rgba(249,115,22,0.3)",  bg: "rgba(249,115,22,0.08)",  icon: "🔥" },
  air:   { color: "#7dd3fc", glow: "rgba(125,211,252,0.22)", border: "rgba(125,211,252,0.3)", bg: "rgba(125,211,252,0.07)", icon: "💨" },
  water: { color: "#60a5fa", glow: "rgba(96,165,250,0.26)",  border: "rgba(96,165,250,0.3)",  bg: "rgba(96,165,250,0.08)",  icon: "💧" },
  earth: { color: "#4ade80", glow: "rgba(74,222,128,0.22)",  border: "rgba(74,222,128,0.28)", bg: "rgba(74,222,128,0.07)", icon: "🌍" },
};

export default function AnasirCalculator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    setResult(analyzeText(input));
  };

  const handleClear = () => {
    setInput("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1b2a] via-[#112236] to-[#0a1520] text-white font-inter">

      {/* Decorative background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12 sm:py-16">

        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-white/30 hover:text-yellow-400/60 transition-colors mb-8 font-inter"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Abjad Calculator
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-5">
            <span className="text-3xl">🌊</span>
          </div>
          <h1 className="font-amiri text-5xl sm:text-6xl font-bold text-white">
            حاسبة العناصر
          </h1>
          <p className="font-inter text-sm text-white/40 mt-2 tracking-widest uppercase">
            Anasir Element Calculator
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-500/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-yellow-500/50" />
          </div>
        </motion.div>

        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl mb-4 transition-shadow duration-300 hover:shadow-2xl hover:border-white/15"
        >
          <label className="block font-inter text-xs text-white/40 uppercase tracking-widest mb-3">
            Arabic Text Input
          </label>
          <textarea
            dir="rtl"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="أدخل النص العربي هنا..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 font-amiri text-2xl text-white placeholder:text-white/20 leading-loose resize-none focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/10 transition-all"
          />

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <motion.button
              onClick={handleAnalyze}
              disabled={!input.trim()}
              whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(234,179,8,0.35)" }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed text-[#0d1b2a] font-inter font-semibold text-sm transition-colors duration-200 shadow-lg shadow-yellow-500/20"
            >
              <Calculator className="w-4 h-4" />
              Analyze Elements
            </motion.button>
            <motion.button
              onClick={handleClear}
              disabled={!input && !result}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/70 hover:text-white font-inter text-sm border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </motion.button>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45 }}
              className="space-y-4"
            >
              {/* Dominant Element Banner */}
              {result.dominant && (() => {
                const s = DOMINANT_STYLES[result.dominant];
                const el = ELEMENTS[result.dominant];
                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl p-5 flex items-center justify-between border"
                    style={{ background: s.bg, borderColor: s.border, boxShadow: `0 0 36px ${s.glow}` }}
                  >
                    <div>
                      <p className="font-inter text-xs uppercase tracking-widest mb-1" style={{ color: s.color, opacity: 0.75 }}>
                        Dominant Element
                      </p>
                      <p className="font-amiri text-3xl font-bold text-white">
                        {s.icon} {el.name}
                      </p>
                      <p className="font-inter text-xs text-white/40 mt-1">
                        {result.counts[result.dominant]} letters · {result.percentages[result.dominant]}% of total
                      </p>
                    </div>
                    <span className="font-amiri text-5xl sm:text-6xl opacity-15" style={{ color: s.color }}>
                      {el.arabic}
                    </span>
                  </motion.div>
                );
              })()}

              {/* Summary Cards */}
              <AnasirResultsSummary
                counts={result.counts}
                total={result.total}
                dominant={result.dominant}
              />

              {/* Letter Breakdown */}
              {result.letterDetails.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl">
                  <AnasirLetterGrid letterDetails={result.letterDetails} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}