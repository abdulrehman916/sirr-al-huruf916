import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus } from "lucide-react";
import { getAbjadValue } from "../lib/abjadValues";
import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";
import HadimTypePanel from "../components/HadimTypePanel";
import HadimKasem from "../components/HadimKasem";
import HadimZikr from "../components/HadimZikr";
import { usePageState } from "../context/PageStateContext";

// ── processText: extract Arabic letters + sum abjad values ──────────────
function processText(text) {
  const arabicLetters = (text.match(/[\u0600-\u06FF]/g) || []);
  const letters = arabicLetters.map(letter => ({
    original: letter,
    value: getAbjadValue(letter)
  }));
  const total = letters.reduce((sum, l) => sum + l.value, 0);
  return { total, letters };
}

// ── Positional lookup maps ──────────────────────────────────────────────
const UNITS_MAP    = { 1:'ا', 2:'ب', 3:'ج', 4:'د', 5:'ه', 6:'و', 7:'ز', 8:'ح', 9:'ط' };
const TENS_MAP     = { 1:'ي', 2:'ك', 3:'ل', 4:'م', 5:'ن', 6:'س', 7:'ع', 8:'ف', 9:'ص' };
const HUNDREDS_MAP = { 1:'ق', 2:'ر', 3:'ش', 4:'ت', 5:'ث', 6:'خ', 7:'ذ', 8:'ض', 9:'ظ' };

/**
 * MASTER HADIM POSITIONAL EXTRACTION — FINAL LAW
 *
 * Cycle: Units(0) → Tens(1) → Hundreds(2) → Thousands(3) → restart from Tens(1)
 *
 * ZERO RULE:
 *   - Units / Tens / Hundreds: zero → no letter, but slot advances.
 *   - Thousands slot: ALWAYS emits 'غ' regardless of digit value (even 0).
 *     If digit > 1 → also emit UNITS_MAP[digit] as count letter.
 *     If digit = 0 or 1 → emit 'غ' only.
 *   - After thousands slot: always restart from Tens (slot 1).
 */
function positionalIstintaq(n) {
  if (n <= 0) return { steps: [], separatedLetters: '', joinedCeremonial: '', hadimName: 'ائيل' };
  n = Math.floor(n);

  const digits = String(n).split('').reverse();
  const steps  = [];

  let place = 0;
  let slot  = 0;

  while (place < digits.length) {
    const d = parseInt(digits[place]);

    if (slot === 0) {
      if (d > 0) steps.push({ label: 'Units', value: d, letters: UNITS_MAP[d] || '' });
      place++;
      slot = 1;
    } else if (slot === 1) {
      if (d > 0) steps.push({ label: 'Tens', value: d * 10, letters: TENS_MAP[d] || '' });
      place++;
      slot = 2;
    } else if (slot === 2) {
      if (d > 0) steps.push({ label: 'Hundreds', value: d * 100, letters: HUNDREDS_MAP[d] || '' });
      place++;
      slot = 3;
    } else {
      steps.push({ label: 'Thousands', value: 1000, letters: 'غ' });
      if (d > 1) {
        steps.push({ label: `×${d}`, value: d, letters: UNITS_MAP[d] || '' });
      }
      place++;
      slot = 1;
    }
  }

  const reversed = [...steps].reverse();
  const tokens   = reversed.map(s => s.letters).filter(Boolean);

  const separatedLetters = tokens.join(' ');
  const joinedCeremonial = tokens.join('');
  const hadimName        = joinedCeremonial + 'ائيل';

  return { steps, separatedLetters, joinedCeremonial, hadimName };
}

/**
 * subtract: 41 (Ulvi), 316 (Sufli), 319 (Sherli)
 * Rule: if value >= subtract → reduced = value - subtract
 *       else → adjusted = value + 361, reduced = adjusted - subtract
 */
function computeType(value, subtract, typeLabel) {
  let reduced, boosted, adjusted;
  if (value >= subtract) {
    reduced = value - subtract;
    boosted = false;
    adjusted = value;
  } else {
    adjusted = value + 361;
    reduced = adjusted - subtract;
    boosted = true;
  }
  const istintaq = positionalIstintaq(reduced);
  return { typeLabel, subtract, reduced, boosted, adjusted, original: value, istintaq };
}

function computeAllTypes(value) {
  return {
    ulvi:   computeType(value, 41,  'ULVI'),
    sufli:  computeType(value, 316, 'SUFLI'),
    sherli: computeType(value, 319, 'SHERLI'),
  };
}

const HADIM_MODES = [
  {
    key: 'ULVI',
    icon: '✨',
    label: 'ULVI',
    arabic: 'علوي',
    subtract: 41,
    active:   { border: 'rgba(212,175,55,0.80)', bg: 'rgba(212,175,55,0.18)', glow: '0 0 22px rgba(212,175,55,0.55)', text: '#F5D060' },
    inactive: { border: 'rgba(212,175,55,0.20)', bg: 'rgba(212,175,55,0.05)', text: 'rgba(212,175,55,0.45)' },
  },
  {
    key: 'SUFLI',
    icon: '🔥',
    label: 'SUFLI',
    arabic: 'سفلي',
    subtract: 316,
    active:   { border: 'rgba(220,38,38,0.80)', bg: 'rgba(220,38,38,0.18)', glow: '0 0 22px rgba(220,38,38,0.55)', text: '#FCA5A5' },
    inactive: { border: 'rgba(220,38,38,0.20)', bg: 'rgba(220,38,38,0.05)', text: 'rgba(220,38,38,0.45)' },
  },
  {
    key: 'SHERLI',
    icon: '🟏',
    label: 'SHERLI',
    arabic: 'شرلي',
    subtract: 319,
    active:   { border: 'rgba(168,85,247,0.80)', bg: 'rgba(168,85,247,0.18)', glow: '0 0 22px rgba(168,85,247,0.55)', text: '#D8B4FE' },
    inactive: { border: 'rgba(168,85,247,0.20)', bg: 'rgba(168,85,247,0.05)', text: 'rgba(168,85,247,0.45)' },
  },
];

const PAGE_KEY = 'hadim';

export default function HadimPage() {
  const { getPageState, setPageState, clearPageState } = usePageState();
  const initialState = getPageState(PAGE_KEY, {
    hadimMode: 'ULVI',
    talib: "",
    matloob: "",
    isms: ["", "", "", "", ""],
    result: null,
  });
  
  const [hadimMode, setHadimMode] = useState(initialState.hadimMode);
  const [talib, setTalib] = useState(initialState.talib);
  const [matloob, setMatloob] = useState(initialState.matloob);
  const [isms, setIsms] = useState(initialState.isms);
  const [result, setResult] = useState(initialState.result);

  useEffect(() => {
    setPageState(PAGE_KEY, { hadimMode, talib, matloob, isms, result });
  }, [hadimMode, talib, matloob, isms, result, setPageState]);

  const addIsm    = () => setIsms(p => [...p, ""]);
  const removeIsm = (i) => setIsms(p => p.filter((_, idx) => idx !== i));
  const updateIsm = (i, v) => setIsms(p => p.map((x, idx) => idx === i ? v : x));

  const handleGenerate = () => {
    const talibData   = talib.trim()   ? { label: 'Talib',   text: talib,   abjad: processText(talib).total,   letters: processText(talib).letters }   : null;
    const matloobData = matloob.trim() ? { label: 'Matloob', text: matloob, abjad: processText(matloob).total, letters: processText(matloob).letters } : null;
    const ismData     = isms.map((t, i) => t.trim() ? { label: `Ism ${i + 1}`, text: t, abjad: processText(t).total, letters: processText(t).letters } : null).filter(Boolean);

    const allIndividuals = [
      ...(talibData   ? [talibData]   : []),
      ...(matloobData ? [matloobData] : []),
      ...ismData,
    ];
    if (!allIndividuals.length) return;

    const individuals = allIndividuals.map(item => ({
      ...item,
      types: computeAllTypes(item.abjad),
    }));

    const activeKey = hadimMode.toLowerCase();
    const grandSum = individuals.reduce((acc, item) => acc + item.types[activeKey].reduced, 0);
    const grandTypes = computeAllTypes(grandSum);

    setResult({ individuals, grandSum, grandTypes });
  };

  const handleClear = () => {
    setTalib("");
    setMatloob("");
    setIsms(["", "", "", "", ""]);
    setResult(null);
    setHadimMode('ULVI');
    clearPageState(PAGE_KEY);
  };

  const activeMode = HADIM_MODES.find(m => m.key === hadimMode);
  const hasAnyInput = talib.trim() || matloob.trim() || isms.some(s => s.trim());

  return (
    <PageLayout>
      <div className="space-y-4 hadim-page">
        {/* Header */}
        <PageTitle arabic="مولّد الخادم" latin="Hadim Generator" subtitle="Ottoman Name Construction" icon="✦" />

        {/* Hadim Type Selector */}
        <div className="rounded-2xl border p-3"
          style={{ background: "linear-gradient(145deg, rgba(8,18,40,0.99) 0%, rgba(4,10,24,0.99) 100%)", borderColor: "rgba(168,85,247,0.18)", boxShadow: "0 2px 24px rgba(0,0,0,0.50), inset 0 1px 0 rgba(168,85,247,0.08)" }}>
          <p className="font-inter text-[9px] uppercase tracking-[0.22em] text-white/30 text-center mb-2.5">✦ Select Hadim Type</p>
          <div className="grid grid-cols-3 gap-2">
            {HADIM_MODES.map(mode => {
              const isActive = hadimMode === mode.key;
              const s = isActive ? mode.active : mode.inactive;
              return (
                <motion.button
                  key={mode.key}
                  onClick={() => { setHadimMode(mode.key); setResult(null); }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  animate={{ background: s.bg, boxShadow: isActive ? s.glow : 'none' }}
                  transition={{ duration: 0.25 }}
                  className="relative flex flex-col items-center justify-center py-3 px-2 rounded-xl border"
                  style={{ borderColor: s.border }}>
                  {isActive && (
                    <motion.div
                      layoutId="modeHighlight"
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ background: s.bg }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                    />
                  )}
                  <span className="text-lg mb-0.5 relative z-10">{mode.icon}</span>
                  <span className="font-inter text-[11px] font-bold tracking-widest relative z-10" style={{ color: s.text }}>{mode.label}</span>
                  <span className="font-amiri text-[11px] relative z-10" style={{ color: isActive ? s.text : 'rgba(255,255,255,0.25)' }}>{mode.arabic}</span>
                  {isActive && (
                    <span className="font-inter text-[8px] uppercase tracking-widest mt-0.5 relative z-10" style={{ color: s.text, opacity: 0.65 }}>−{mode.subtract}</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Input Card */}
        <div className="rounded-2xl border p-5 space-y-4 relative overflow-hidden"
          style={{ background: "linear-gradient(145deg, rgba(12,22,50,0.99) 0%, rgba(6,12,32,0.99) 100%)", borderColor: "rgba(168,85,247,0.50)", boxShadow: "0 0 40px rgba(168,85,247,0.12), 0 4px 28px rgba(0,0,0,0.50), inset 0 1px 0 rgba(168,85,247,0.12)" }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.40), transparent)" }} />

          <div>
            <label className="block font-inter text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(168,85,247,0.70)" }}>Talib (طالب)</label>
            <input dir="rtl" type="text" value={talib} onChange={(e) => setTalib(e.target.value)}
              placeholder="اسمك..."
              className="w-full rounded-xl px-4 py-3 font-amiri text-lg text-white focus:outline-none caret-white placeholder:text-white/30"
              style={{ background: "rgba(8,25,48,0.95)", border: "1px solid rgba(168,85,247,0.40)", fontSize: "16px" }} />
          </div>

          <div>
            <label className="block font-inter text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(168,85,247,0.70)" }}>Matloob (المطلوب)</label>
            <input dir="rtl" type="text" value={matloob} onChange={(e) => setMatloob(e.target.value)}
              placeholder="رزق، محبة، فتح، اسم شخص..."
              className="w-full rounded-xl px-4 py-3 font-amiri text-lg text-white focus:outline-none caret-white placeholder:text-white/30"
              style={{ background: "rgba(8,25,48,0.95)", border: "1px solid rgba(168,85,247,0.40)", fontSize: "16px" }} />
          </div>

          <div>
            <label className="block font-inter text-[10px] uppercase tracking-widest mb-3" style={{ color: "rgba(168,85,247,0.70)" }}>Ism (Names / Ayah / Surah)</label>
            <div className="space-y-3">
              {isms.map((val, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex-1">
                    <span className="block font-inter text-[9px] uppercase tracking-widest mb-1.5" style={{ color: "rgba(168,85,247,0.45)" }}>Ism {i + 1}</span>
                    <textarea dir="rtl" value={val} onChange={(e) => updateIsm(i, e.target.value)}
                      placeholder="اسم، آية، سورة..." rows={2}
                      className="w-full rounded-xl px-4 py-3 font-amiri text-xl text-white leading-relaxed resize-none focus:outline-none caret-white placeholder:text-white/30"
                      style={{ background: "rgba(8,25,48,0.95)", border: "1px solid rgba(168,85,247,0.35)", fontSize: "16px" }} />
                  </div>
                  {isms.length > 1 && (
                    <button onClick={() => removeIsm(i)}
                      className="mt-[22px] inline-flex items-center justify-center rounded-md border border-red-500/20 text-red-400/40 hover:text-red-400 hover:border-red-500/40 transition-all flex-shrink-0"
                      style={{ background: "rgba(239,68,68,0.06)", padding: "6px", width: "28px", height: "28px" }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={addIsm}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-inter font-semibold tracking-wide transition-all"
              style={{ borderColor: "rgba(168,85,247,0.35)", color: "rgba(168,85,247,0.70)", background: "rgba(168,85,247,0.08)" }}>
              <Plus className="w-3.5 h-3.5" />
              Add Ism
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <motion.button
              onClick={handleGenerate}
              disabled={!hasAnyInput}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-inter font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed text-white tracking-wide"
              style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.85) 0%, rgba(109,40,217,0.90) 100%)", boxShadow: "0 0 32px rgba(168,85,247,0.40)" }}>
              ✦ Generate Hadim
            </motion.button>
            <motion.button
              onClick={handleClear}
              disabled={!hasAnyInput && !result}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 py-3 px-4 rounded-xl text-white/50 hover:text-white font-inter text-sm border transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.10)" }}>
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </motion.button>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="hadim-results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Individual results */}
              {result.individuals.map((item, i) => (
                <div key={i} className="rounded-2xl border p-4 space-y-3"
                  style={{ background: "rgba(6,12,30,0.98)", borderColor: "rgba(168,85,247,0.22)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: "rgba(168,85,247,0.55)" }}>{item.label}</span>
                    <div className="h-px flex-1" style={{ background: "rgba(168,85,247,0.15)" }} />
                    <span className="font-inter text-[10px] font-bold" style={{ color: "rgba(168,85,247,0.70)" }}>{item.abjad}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[hadimMode.toLowerCase()].map(key => (
                      <HadimTypePanel key={key} typeData={item.types[key]} />
                    ))}
                  </div>
                </div>
              ))}

              {/* Grand result */}
              <div className="rounded-2xl border p-4 space-y-3"
                style={{ background: "rgba(4,8,22,0.99)", borderColor: "rgba(168,85,247,0.50)", boxShadow: "0 0 40px rgba(168,85,247,0.15)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: "rgba(168,85,247,0.60)" }}>Grand Total</span>
                  <div className="h-px flex-1" style={{ background: "rgba(168,85,247,0.20)" }} />
                  <span className="font-inter text-[10px] font-bold" style={{ color: "#D8B4FE" }}>{result.grandSum}</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {[hadimMode.toLowerCase()].map(key => (
                    <HadimTypePanel key={key} typeData={result.grandTypes[key]} isGrand />
                  ))}
                </div>
              </div>

              <HadimZikr hadimMode={hadimMode} individuals={result.individuals} grandTypes={result.grandTypes} />
              <HadimKasem hadimMode={hadimMode} individuals={result.individuals} grandTypes={result.grandTypes} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}