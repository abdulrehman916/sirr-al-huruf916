import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Wand2, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { preprocessArabic } from "../lib/asyncProcessor";
import { ABJAD_MAP } from "../lib/abjadValues";

// ── Abjad calculation ─────────────────────────────────
function calcAbjad(text) {
  const clean = preprocessArabic(text);
  let total = 0;
  for (const char of clean) {
    const val = ABJAD_MAP[char];
    if (val !== undefined) total += val;
  }
  return total;
}

// ── Istintaq: number → Arabic letters ─────────────────
const ISTINTAQ_TABLE = [
  [1000, 'غ'], [900, 'ظ'], [800, 'ض'], [700, 'ذ'], [600, 'خ'], [500, 'ث'],
  [400, 'ت'], [300, 'ش'], [200, 'ر'], [100, 'ق'],
  [90, 'ص'], [80, 'ف'], [70, 'ع'], [60, 'س'], [50, 'ن'], [40, 'م'],
  [30, 'ل'], [20, 'ك'], [10, 'ي'],
  [9, 'ط'], [8, 'ح'], [7, 'ز'], [6, 'و'], [5, 'ه'], [4, 'د'],
  [3, 'ج'], [2, 'ب'], [1, 'ا'],
];

function numberToLetters(n) {
  if (n <= 0) return '';
  let result = '';
  for (const [val, letter] of ISTINTAQ_TABLE) {
    while (n >= val) {
      result += letter;
      n -= val;
    }
  }
  return result;
}

// ── Subtraction lookup ─────────────────────────────────
const SUBTRACT_MAP = { ulvi: 41, sufli: 316, sherli: 319 };

function applySubtraction(value, type) {
  const sub = SUBTRACT_MAP[type];
  let v = value;
  if (v < sub) v += 360;
  return v - sub;
}

// ── Main calculation ───────────────────────────────────
function runCalculation({ mainText, isms, targetName, type }) {
  const mainVal = calcAbjad(mainText);
  const ismVals = isms.map((ism) => ({ text: ism, value: calcAbjad(ism) }));
  const targetVal = targetName.trim() ? calcAbjad(targetName) : 0;

  const grandTotal = mainVal + ismVals.reduce((s, i) => s + i.value, 0) + targetVal;

  const ismNames = ismVals.map((ism) => {
    let v = ism.value;
    if (v < 41) v += 360;
    v -= 41;
    const letters = numberToLetters(v);
    return { ism: ism.text, ismVal: ism.value, subtracted: v, letters, name: letters + 'ايل' };
  });

  const hadimSubtracted = applySubtraction(grandTotal, type);
  const hadimLetters = numberToLetters(hadimSubtracted);
  const hadimName = hadimLetters + 'ايل';
  const needsAdd360 = grandTotal < SUBTRACT_MAP[type];

  const allNames = [...ismNames.map((n) => n.name), hadimName];
  const kasemLines = allNames.map((n) => n + ' ' + n).join('\n');
  const kasemFull = kasemLines + '\n\nيا روحانية هذه الأسماء ....\n\nإلفاهن إلفاهن، إلاجلة إلاجلة، الساعة الساعة';

  return { mainVal, ismVals, targetVal, grandTotal, hadimSubtracted, hadimLetters, hadimName, ismNames, kasemFull, needsAdd360 };
}

// ── Component ─────────────────────────────────────────
export default function HadimKasem() {
  const [mainText, setMainText] = useState('');
  const [matloob, setMatloob] = useState('');
  const [isms, setIsms] = useState(['']);
  const [targetName, setTargetName] = useState('');
  const [type, setType] = useState('ulvi');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const addIsm = () => setIsms((p) => [...p, '']);
  const removeIsm = (i) => setIsms((p) => p.filter((_, idx) => idx !== i));
  const updateIsm = (i, v) => setIsms((p) => p.map((x, idx) => (idx === i ? v : x)));

  const canCalculate = mainText.trim() && isms.some((s) => s.trim());

  const handleCalculate = useCallback(() => {
    if (!canCalculate) return;
    const r = runCalculation({ mainText, isms: isms.filter((s) => s.trim()), targetName, type });
    setResult(r);
  }, [mainText, isms, targetName, type, canCalculate]);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.kasemFull);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setMainText(''); setMatloob(''); setIsms(['']); setTargetName(''); setResult(null);
  };

  return (
    <div className="min-h-screen text-white font-inter relative overflow-x-hidden"
      style={{ background: "linear-gradient(180deg, #1a3a5c 0%, #163350 40%, #112840 100%)" }}>
      <div className="pointer-events-none absolute inset-0 z-0"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 12%, rgba(168,85,247,0.18) 0%, rgba(56,189,248,0.10) 45%, transparent 75%)" }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12 sm:py-16 space-y-8">

        <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 text-xs font-inter uppercase tracking-widest transition-colors">
          &larr; Back to Home
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-purple-500/30 mb-5"
            style={{ background: "linear-gradient(180deg, rgba(168,85,247,0.25) 0%, rgba(168,85,247,0.10) 100%)", boxShadow: "0 0 32px rgba(168,85,247,0.25)" }}>
            <span className="font-amiri text-3xl text-purple-300">خ</span>
          </div>
          <h1 className="font-amiri text-5xl sm:text-6xl font-bold text-white" style={{ textShadow: "0 0 32px rgba(168,85,247,0.40)" }}>
            الخادم والقاسم
          </h1>
          <p className="font-inter text-xs mt-2 tracking-widest uppercase" style={{ color: "rgba(200,170,255,0.70)" }}>
            Hadim &amp; Kasem Generator
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-12" style={{ background: "linear-gradient(to right, transparent, rgba(168,85,247,0.70))" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500/80" />
            <div className="h-px w-12" style={{ background: "linear-gradient(to left, transparent, rgba(168,85,247,0.70))" }} />
          </div>
        </motion.div>

        {/* ── INPUT ─────────────────────────────── */}
        <GlowCard color="purple">
          <SectionHead label="المدخلات" sub="Input Section" />

          <FieldLabel>النص الرئيسي (اسم / آية / سورة)</FieldLabel>
          <textarea dir="rtl" value={mainText} onChange={(e) => setMainText(e.target.value)}
            placeholder="أدخل النص العربي هنا..." rows={4}
            className="w-full rounded-xl px-4 py-3 font-amiri text-xl text-white leading-relaxed resize-none focus:outline-none caret-white mb-4 placeholder:text-white/30"
            style={fieldStyle("purple")} />

          <FieldLabel>المطلوب (النية)</FieldLabel>
          <input dir="rtl" value={matloob} onChange={(e) => setMatloob(e.target.value)}
            placeholder="مثال: رزق، محبة، فتح..." type="text"
            className="w-full rounded-xl px-4 py-3 font-amiri text-lg text-white focus:outline-none caret-white mb-4 placeholder:text-white/30"
            style={fieldStyle("purple")} />

          <FieldLabel>الأسماء (Asma al-Ilahiyya)</FieldLabel>
          <div className="space-y-2 mb-3">
            {isms.map((ism, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input dir="rtl" value={ism} onChange={(e) => updateIsm(i, e.target.value)}
                  placeholder={'الاسم ' + (i + 1)} type="text"
                  className="flex-1 rounded-xl px-4 py-2.5 font-amiri text-lg text-white focus:outline-none caret-white placeholder:text-white/30"
                  style={fieldStyle("purple")} />
                {isms.length > 1 && (
                  <button onClick={() => removeIsm(i)}
                    className="p-2 rounded-lg border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/50 transition-all"
                    style={{ background: "rgba(239,68,68,0.06)" }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addIsm}
            className="flex items-center gap-1.5 text-xs font-inter text-purple-300/70 hover:text-purple-300 border border-purple-500/20 hover:border-purple-500/50 rounded-lg px-3 py-1.5 transition-all mb-4"
            style={{ background: "rgba(168,85,247,0.06)" }}>
            <Plus className="w-3.5 h-3.5" /> إضافة اسم
          </button>

          <FieldLabel>اسم الشخص المستهدف (اختياري)</FieldLabel>
          <input dir="rtl" value={targetName} onChange={(e) => setTargetName(e.target.value)}
            placeholder="اسم الشخص..." type="text"
            className="w-full rounded-xl px-4 py-3 font-amiri text-lg text-white focus:outline-none caret-white mb-5 placeholder:text-white/30"
            style={fieldStyle("purple")} />

          <FieldLabel>نوع الخادم</FieldLabel>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[['ulvi', 'علوي', '-41'], ['sufli', 'سفلي', '-316'], ['sherli', 'شرلي', '-319']].map(([key, label, sub]) => (
              <button key={key} onClick={() => setType(key)} className="rounded-xl py-2.5 px-3 text-center border transition-all"
                style={{
                  background: type === key ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.04)",
                  borderColor: type === key ? "rgba(168,85,247,0.70)" : "rgba(255,255,255,0.12)",
                  boxShadow: type === key ? "0 0 18px rgba(168,85,247,0.30)" : "none",
                }}>
                <p className="font-amiri text-base font-bold text-white">{label}</p>
                <p className="font-inter text-[10px] mt-0.5" style={{ color: type === key ? "rgba(200,170,255,0.80)" : "rgba(255,255,255,0.35)" }}>{sub}</p>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <motion.button onClick={handleCalculate} disabled={!canCalculate}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-inter font-semibold text-sm text-[#0d1b2a] disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg,#c084fc,#7c3aed)", boxShadow: "0 0 32px rgba(168,85,247,0.65), 0 2px 10px rgba(0,0,0,0.3)" }}>
              <Wand2 className="w-4 h-4" /> توليد الخادم والقاسم
            </motion.button>
            <motion.button onClick={handleClear} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 py-3 px-4 rounded-xl text-white/70 hover:text-white font-inter text-sm border border-white/15 hover:border-white/30 transition-all"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <Trash2 className="w-4 h-4" /> مسح
            </motion.button>
          </div>
        </GlowCard>

        {/* ── RESULTS ───────────────────────────── */}
        <AnimatePresence>
          {result && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Abjad Values */}
              <GlowCard color="blue">
                <SectionHead label="قيم الأبجد" sub="Abjad Values" />
                <div className="space-y-2" dir="rtl">
                  <ValueRow label="النص الرئيسي" value={result.mainVal} />
                  {result.ismVals.map((ism, i) => (
                    <ValueRow key={i} label={ism.text || ('الاسم ' + (i + 1))} value={ism.value} />
                  ))}
                  {result.targetVal > 0 && <ValueRow label="اسم الشخص" value={result.targetVal} />}
                  <div className="h-px bg-white/10 my-2" />
                  <ValueRow label="المجموع الكلي" value={result.grandTotal} highlight />
                </div>
              </GlowCard>

              {/* Subtraction Step */}
              <GlowCard color="gold">
                <SectionHead label="خطوة الطرح والاستنطاق" sub="Subtraction + Istintaq" />
                <div className="space-y-2 mb-4" dir="rtl">
                  <ValueRow label="المجموع الكلي" value={result.grandTotal} />
                  <ValueRow label={'الطرح (' + SUBTRACT_MAP[type] + ')'} value={'−' + SUBTRACT_MAP[type]} />
                  {result.needsAdd360 && (
                    <p className="text-xs font-inter text-yellow-400/70 text-right">* القيمة أصغر من المطروح، تمت إضافة 360 أولاً</p>
                  )}
                  <div className="h-px bg-white/10 my-2" />
                  <ValueRow label="الناتج" value={result.hadimSubtracted} highlight />
                </div>
                <div className="p-3 rounded-xl border border-yellow-500/20" style={{ background: "rgba(234,179,8,0.06)" }}>
                  <p className="font-inter text-[10px] text-yellow-400/60 uppercase tracking-widest mb-1 text-right">الاستنطاق ← حروف</p>
                  <p className="font-amiri text-3xl text-white text-right" dir="rtl">{result.hadimLetters}</p>
                </div>
              </GlowCard>

              {/* Generated Names per Ism */}
              <GlowCard color="purple">
                <SectionHead label="الأسماء المستخرجة" sub="Generated Spiritual Names" />
                <div className="space-y-3">
                  {result.ismNames.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="rounded-xl p-4 border border-purple-500/20" dir="rtl"
                      style={{ background: "rgba(168,85,247,0.08)" }}>
                      <p className="font-inter text-[10px] text-purple-400/60 uppercase tracking-widest mb-1">{'الاسم ' + (i + 1) + ': ' + item.ism}</p>
                      <p className="font-inter text-xs text-white/40 mb-2">{item.ismVal} - 41 = {item.subtracted} &rarr; {item.letters}</p>
                      <p className="font-amiri text-2xl text-white" style={{ textShadow: "0 0 16px rgba(168,85,247,0.60)" }}>{item.name}</p>
                    </motion.div>
                  ))}
                </div>
              </GlowCard>

              {/* Main Hadim Banner */}
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl p-6 border text-center"
                style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.20) 0%, rgba(124,58,237,0.15) 100%)", borderColor: "rgba(168,85,247,0.60)", boxShadow: "0 0 40px rgba(168,85,247,0.30)" }}>
                <p className="font-inter text-[10px] text-purple-300/60 uppercase tracking-widest mb-3">الخادم الرئيسي</p>
                <p className="font-amiri text-5xl font-bold text-white" style={{ textShadow: "0 0 32px rgba(168,85,247,0.80)" }}>
                  {result.hadimName}
                </p>
              </motion.div>

              {/* Full Kasem */}
              <GlowCard color="gold">
                <div className="flex items-start justify-between mb-4">
                  <SectionHead label="القاسم الكامل" sub="Full Kasem" noMargin />
                  <motion.button onClick={handleCopy} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-yellow-500/30 text-yellow-400/70 hover:text-yellow-400 text-xs font-inter transition-all flex-shrink-0"
                    style={{ background: "rgba(234,179,8,0.08)" }}>
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "تم النسخ" : "نسخ"}
                  </motion.button>
                </div>
                <div className="rounded-xl border border-yellow-500/15 p-5" style={{ background: "rgba(8,25,48,0.80)" }} dir="rtl">
                  <pre className="font-amiri text-xl text-white leading-loose whitespace-pre-wrap text-right"
                    style={{ textShadow: "0 0 12px rgba(234,179,8,0.20)" }}>
                    {result.kasemFull}
                  </pre>
                </div>
              </GlowCard>

            </motion.div>
          )}
        </AnimatePresence>

        <div className="pb-8" />
      </div>
    </div>
  );
}

// ── Shared mini-components ────────────────────────────

function GlowCard({ children, color }) {
  const borders = { purple: "rgba(168,85,247,0.25)", blue: "rgba(56,189,248,0.25)", gold: "rgba(234,179,8,0.25)" };
  const glows   = { purple: "rgba(168,85,247,0.10)", blue: "rgba(56,189,248,0.10)", gold: "rgba(234,179,8,0.10)" };
  return (
    <div className="rounded-2xl border p-5"
      style={{ background: "rgba(15,48,80,0.92)", borderColor: borders[color], boxShadow: `0 4px 24px rgba(0,0,0,0.35), 0 0 24px ${glows[color]}` }}>
      {children}
    </div>
  );
}

function SectionHead({ label, sub, noMargin }) {
  return (
    <div className={noMargin ? "" : "mb-4"}>
      <p className="font-amiri text-xl font-bold text-white">{label}</p>
      <p className="font-inter text-[10px] text-white/35 uppercase tracking-widest">{sub}</p>
    </div>
  );
}

function FieldLabel({ children }) {
  return <p className="font-inter text-[10px] text-purple-400/60 uppercase tracking-widest mb-1.5">{children}</p>;
}

function ValueRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-amiri text-base text-white/70 truncate">{label}</span>
      <span className={"font-inter text-sm font-bold tabular-nums flex-shrink-0 " + (highlight ? "text-yellow-400" : "text-white")}
        style={highlight ? { textShadow: "0 0 12px rgba(234,179,8,0.60)" } : {}}>
        {value}
      </span>
    </div>
  );
}

function fieldStyle(color) {
  const map = {
    purple: ["rgba(168,85,247,0.40)", "rgba(168,85,247,0.12)"],
    blue:   ["rgba(56,189,248,0.40)",  "rgba(56,189,248,0.12)"],
    gold:   ["rgba(234,179,8,0.40)",   "rgba(234,179,8,0.12)"],
  };
  const [border, shadow] = map[color];
  return {
    background: "rgba(8,25,48,0.95)",
    border: "1px solid " + border,
    boxShadow: "0 0 14px " + shadow + ", inset 0 1px 0 rgba(255,255,255,0.05)",
  };
}