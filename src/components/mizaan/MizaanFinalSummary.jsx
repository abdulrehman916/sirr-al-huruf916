import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  MIZAAN_DAYNIGHT_FULL,
  MIZAAN_HOURS,
  MIZAAN_DAYS,
  MIZAAN_PLANETS_ALL,
  MIZAAN_PURPOSES,
  MIZAAN_ELEMENT_DEGREES,
} from "../../lib/mizaan9Data";
import { MIZAAN_BAST2 } from "../../lib/mizaan9Engine";
import { calcBast } from "../../lib/abjadModes";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  glowHi:   "rgba(212,175,55,0.55)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  bg:       "rgba(212,175,55,0.07)",
};

const ELEMENT_META = {
  fire:  { arabic: "النار",  icon: "🔥", color: "#FF6B35" },
  earth: { arabic: "التراب", icon: "🌍", color: "#A5C880" },
  air:   { arabic: "الهواء", icon: "🌪",  color: "#B2EBF2" },
  water: { arabic: "الماء",  icon: "💧", color: "#4FC3F7" },
};

const KHAYR_SHARR_8 = {
  khayr: { arabic: 'الخير', icon: '✨', bast: 2731, color: '#4ADE80' },
  sharr: { arabic: 'الشر',  icon: '⚡', bast: 2725, color: '#F87171' },
};

function countArabicLetters(str) {
  if (!str) return 0;
  // Remove diacritics/harakat (U+0610–U+065F, U+0670) then count base Arabic letters only
  const clean = str
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '')
    .replace(/[^\u0600-\u06FF]/g, '');
  return clean.length;
}

// ─── Individual Mizaan Row ───────────────────────────────────────
function MizaanRow({ number, numberAR, label, entries, bast, letters, color }) {
  return (
    <div
      className="rounded-xl border p-3 space-y-2"
      style={{ borderColor: "rgba(212,175,55,0.18)", background: "rgba(4,10,28,0.98)" }}
    >
      {/* Row header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-amiri text-base font-bold" style={{ color: G.text }}>⚖</span>
          <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
            Mizaan {number}
          </span>
          {numberAR && (
            <span className="font-amiri text-sm" style={{ color: G.dim }}>{numberAR}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-inter text-[7px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Bast-ul Aval</p>
            <p className="font-inter text-xs font-bold tabular-nums" style={{ color: bast ? G.text : "rgba(255,255,255,0.20)" }}>
              {(bast ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="font-inter text-[7px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Letters</p>
            <p className="font-inter text-xs font-bold tabular-nums" style={{ color: letters ? G.dim : "rgba(255,255,255,0.20)" }}>
              {letters ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Entries (selected items) */}
      {entries && entries.length > 0 && (
        <div className="space-y-1 pt-1 border-t" style={{ borderColor: "rgba(212,175,55,0.08)" }}>
          {entries.map((e, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {e.icon && <span style={{ fontSize: "0.75rem", flexShrink: 0 }}>{e.icon}</span>}
                <span className="font-amiri text-sm truncate" dir="rtl"
                  style={{ color: e.color || G.dim }}>{e.arabic}</span>
              </div>
              {e.bast != null && (
                <span className="font-inter text-[9px] tabular-nums flex-shrink-0"
                  style={{ color: "rgba(212,175,55,0.50)" }}>
                  {e.bast.toLocaleString()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function MizaanFinalSummary({ result, selections, degreeSels = {}, inputText = "", customPurpose = "", ds, calcCustomBast }) {
  const { dominant, bast1Total: inputBast = 0, letterCount: inputLetterCount = 0 } = result ?? {};

  const mizaans = useMemo(() => {
    const list = [];

    // Active dataset bindings (fall back to Section 1 imports if ds not provided)
    const bast2map    = ds?.bast2       ?? MIZAAN_BAST2;
    const dayNightMap = ds?.dayNight    ?? MIZAAN_DAYNIGHT_FULL;
    const hours       = ds?.hours       ?? MIZAAN_HOURS;
    const days        = ds?.days        ?? MIZAAN_DAYS;
    const planets     = ds?.planets     ?? MIZAAN_PLANETS_ALL;
    const purposes    = ds?.purposes    ?? MIZAAN_PURPOSES;
    const ks8map      = ds?.khayrSharr8 ?? KHAYR_SHARR_8;
    const degreesMap  = ds?.degrees     ?? MIZAAN_ELEMENT_DEGREES;

    // ── Mizaan 1 — Input Text (Bast-ul Aval of the analyzed text) ─
    list.push({
      number: "1", numberAR: "الأول",
      label: "Input Text",
      entries: inputText.trim() ? [{ arabic: inputText.trim().slice(0, 60) + (inputText.trim().length > 60 ? '…' : ''), bast: inputBast, color: G.text }] : [],
      bast: inputBast ?? 0,
      letters: inputLetterCount ?? 0,
    });

    // ── Mizaan 2 — Element (MIZAAN_BAST2 value per selected element) ─
    const elKeys = Array.isArray(selections?.elements) ? selections.elements : (selections?.elements ? [selections.elements] : []);
    let m2Bast = 0;
    let m2Letters = 0;
    const m2Entries = elKeys.map(k => {
      const meta = ELEMENT_META[k];
      const bast2 = bast2map[k] ?? 0;
      if (meta) {
        m2Bast += bast2;
        m2Letters += countArabicLetters(meta.arabic);
        return { ...meta, bast: bast2 };
      }
      return null;
    }).filter(Boolean);
    list.push({
      number: "2", numberAR: "الثاني",
      label: "Element",
      entries: m2Entries,
      bast: m2Bast,
      letters: m2Letters,
    });

    // ── Mizaan 3 — Day / Night ────────────────────────────────────
    const dn3 = selections?.dayNight;
    const dn3Data = dn3 ? dayNightMap[dn3] : null;
    list.push({
      number: "3", numberAR: "الثالث",
      label: "Day / Night",
      entries: dn3Data ? [{ arabic: dn3Data.arabic, icon: dn3Data.icon, bast: dn3Data.bast, color: dn3Data.color }] : [],
      bast: dn3Data?.bast ?? 0,
      letters: dn3Data ? countArabicLetters(dn3Data.arabic) : 0,
    });

    // ── Mizaan 4 — Hour ───────────────────────────────────────────
    const hourEntry = hours.find(h => h.hour === selections?.hour);
    list.push({
      number: "4", numberAR: "الرابع",
      label: "Hour",
      entries: hourEntry ? [{ arabic: hourEntry.arabic, icon: '🕐', bast: hourEntry.bast, color: G.text }] : [],
      bast: hourEntry?.bast ?? 0,
      letters: hourEntry ? countArabicLetters(hourEntry.arabic) : 0,
    });

    // ── Mizaan 5 — Day ────────────────────────────────────────────
    const dayEntry = days.find(d => d.key === selections?.days);
    list.push({
      number: "5", numberAR: "الخامس",
      label: "Day",
      entries: dayEntry ? [{ arabic: dayEntry.arabic, icon: dayEntry.icon, bast: dayEntry.bast, color: dayEntry.color }] : [],
      bast: dayEntry?.bast ?? 0,
      letters: dayEntry ? countArabicLetters(dayEntry.arabic) : 0,
    });

    // ── Mizaan 6 — Planet ─────────────────────────────────────────
    const planetEntry = planets.find(p => p.key === selections?.planet);
    list.push({
      number: "6", numberAR: "السادس",
      label: "Planet",
      entries: planetEntry ? [{ arabic: planetEntry.arabic, icon: planetEntry.icon, bast: planetEntry.bast, color: planetEntry.color }] : [],
      bast: planetEntry?.bast ?? 0,
      letters: planetEntry ? countArabicLetters(planetEntry.arabic) : 0,
    });

    // ── Mizaan 7 — Purpose(s) + Custom ───────────────────────────
    const purposeArr = Array.isArray(selections?.purposes) ? selections.purposes : (selections?.purposes ? [selections.purposes] : []);
    const m7Entries = [];
    let m7Bast = 0;
    let m7Letters = 0;
    purposeArr.forEach(pk => {
      const pe = purposes.find(p => p.key === pk);
      if (pe) {
        m7Entries.push({ arabic: pe.arabic, icon: pe.icon, bast: pe.bast, color: pe.color });
        m7Bast += pe.bast;
        m7Letters += countArabicLetters(pe.arabic);
      }
    });
    const trimmedCustom = (customPurpose ?? "").trim();
    if (trimmedCustom) {
      const customBast = calcCustomBast
        ? calcCustomBast(trimmedCustom)
        : calcBast(trimmedCustom, 1)?.total ?? 0;
      const customLetters = countArabicLetters(trimmedCustom);
      m7Entries.push({ arabic: trimmedCustom, icon: '✨', bast: customBast, color: G.text });
      m7Bast += customBast;
      m7Letters += customLetters;
    }
    list.push({
      number: "7", numberAR: "السابع",
      label: "Purpose",
      entries: m7Entries,
      bast: m7Bast,
      letters: m7Letters,
    });

    // ── Mizaan 8 — Khayr / Sharr (scale) ─────────────────────────
    const ks8 = selections?.khayrSharr8;
    const ks8Data = ks8 ? ks8map[ks8] : null;
    list.push({
      number: "8", numberAR: "الثامن",
      label: "Khayr / Sharr",
      entries: ks8Data ? [{ arabic: ks8Data.arabic, icon: ks8Data.icon, bast: ks8Data.bast, color: ks8Data.color }] : [],
      bast: ks8Data?.bast ?? 0,
      letters: ks8Data ? countArabicLetters(ks8Data.arabic) : 0,
    });

    // ── Mizaan 9 — ALL selected element degrees (sum) ─────────────
    const m9Entries = [];
    let m9Bast = 0;
    let m9Letters = 0;
    Object.entries(degreeSels).forEach(([elKey, degKey]) => {
      if (!degKey) return;
      const elDegData = degreesMap[elKey];
      const deg = elDegData?.degrees.find(d => d.key === degKey);
      const elMeta = ELEMENT_META[elKey];
      if (deg) {
        m9Entries.push({ arabic: deg.arabic, icon: elMeta?.icon, bast: deg.bast, color: elMeta?.color });
        m9Bast += deg.bast;
        m9Letters += countArabicLetters(deg.arabic);
      }
    });
    list.push({
      number: "9", numberAR: "التاسع",
      label: "Degree",
      entries: m9Entries,
      bast: m9Bast,
      letters: m9Letters,
    });

    return list;
  }, [result, selections, degreeSels, inputText, customPurpose, dominant, inputBast, inputLetterCount, ds]);

  // Grand total — sum all mizaans
  const { grandBast, grandLetters } = useMemo(() => {
    let grandBast = 0;
    let grandLetters = 0;
    mizaans.forEach(m => {
      grandBast   += m.bast   ?? 0;
      grandLetters += m.letters ?? 0;
    });
    return { grandBast, grandLetters };
  }, [mizaans]);

  if (!dominant) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="rounded-2xl border p-5 space-y-4"
      style={{
        background: "rgba(4,8,24,0.99)",
        borderColor: G.borderHi,
        boxShadow: `0 0 60px ${G.glowHi}, 0 0 120px ${G.glow}, 0 8px 32px rgba(0,0,0,0.60)`,
      }}
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <p className="font-inter text-[9px] uppercase tracking-[0.25em]" style={{ color: G.dim }}>
          ✦ Final Sacred Calculation ✦
        </p>
        <h2 className="font-amiri text-2xl font-bold" style={{ color: G.text }}>
          الحاصل النهائي — النتيجة الكاملة
        </h2>
        <div className="h-px w-24 mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${G.borderHi}, transparent)` }} />
      </div>

      {/* Individual Mizaan rows */}
      <div className="space-y-2">
        {mizaans.map(m => (
          <MizaanRow key={m.number} {...m} />
        ))}
      </div>

      {/* Grand Total */}
      <div className="rounded-2xl border p-5 space-y-4"
        style={{ background: "rgba(212,175,55,0.05)", borderColor: G.borderHi, boxShadow: `0 0 40px ${G.glow}` }}>
        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${G.borderHi}, transparent)` }} />

        {/* Total Bast */}
        <div className="text-center space-y-1">
          <p className="font-inter text-[8px] uppercase tracking-[0.3em]" style={{ color: G.dim }}>
            ⚖ Total Bast-ul Aval
          </p>
          <motion.p
            className="font-amiri font-bold tabular-nums leading-none"
            style={{
              fontSize: "clamp(3rem, 12vw, 5rem)",
              color: G.text,
              textShadow: `0 0 30px ${G.glowHi}, 0 0 60px ${G.glow}`,
            }}
            animate={{
              textShadow: [
                `0 0 24px ${G.glowHi}`,
                `0 0 48px rgba(212,175,55,0.80)`,
                `0 0 24px ${G.glowHi}`,
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {grandBast.toLocaleString()}
          </motion.p>
          <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.40)" }}>
            مجموع الأوزان
          </p>
        </div>

        {/* Total Letters */}
        <div className="text-center space-y-1">
          <p className="font-inter text-[8px] uppercase tracking-[0.3em]" style={{ color: G.dim }}>
            🔠 Total Letter Count
          </p>
          <p className="font-amiri text-4xl font-bold tabular-nums" style={{ color: G.text }}>
            {grandLetters}
          </p>
          <p className="font-inter text-[8px]" style={{ color: "rgba(255,255,255,0.25)" }}>
            مجموع الحروف
          </p>
        </div>

        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${G.borderHi}, transparent)` }} />

        {/* Combined Sacred Value */}
        <div className="text-center space-y-1">
          <p className="font-inter text-[8px] uppercase tracking-[0.3em]" style={{ color: G.dim }}>
            ✨ Combined Sacred Value
          </p>
          <motion.p
            className="font-amiri font-bold tabular-nums leading-none"
            style={{
              fontSize: "clamp(3rem, 12vw, 5rem)",
              color: G.text,
              textShadow: `0 0 30px ${G.glowHi}, 0 0 60px ${G.glow}`,
            }}
            animate={{
              textShadow: [
                `0 0 24px ${G.glowHi}`,
                `0 0 48px rgba(212,175,55,0.80)`,
                `0 0 24px ${G.glowHi}`,
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {(grandBast + grandLetters).toLocaleString()}
          </motion.p>
          <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.40)" }}>
            مجموع السر الكامل
          </p>
        </div>

        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${G.borderHi}, transparent)` }} />
      </div>

      {/* Sacred Seal Footer */}
      <div className="text-center pt-1">
        <motion.div
          className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border"
          style={{ background: G.bg, borderColor: G.borderHi }}
          animate={{ boxShadow: [`0 0 12px ${G.glow}`, `0 0 28px ${G.glowHi}`, `0 0 12px ${G.glow}`] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="font-amiri text-xl" style={{ color: G.text }}>☽</span>
          <span className="font-inter text-[9px] uppercase tracking-[0.3em]" style={{ color: G.dim }}>
            9 Mizaan · Complete
          </span>
          <span className="font-amiri text-xl" style={{ color: G.text }}>☽</span>
        </motion.div>
      </div>
    </motion.div>
  );
}