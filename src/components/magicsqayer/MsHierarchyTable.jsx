import { useMemo, memo } from "react";
import { motion } from "framer-motion";
import { buildHierarchy, toArabicIndic, isCompatible } from "./msEngine";
import { perfStore } from "./perfStore";
import { buildAngelName, buildJinnName, buildHebrewAngelName, buildHebrewJinnName, buildSufliHadimName, transliterateHebrew } from "./msHarakat";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
};

// ── Letter extraction and name generation ───────────────────────
// Book suffix values — four fully separate systems
const SUFFIXES = {
  'ar-angel':  41,   // Arabic: ئيل
  'ar-jinn':   319,  // Arabic: طيش
  'heb-angel': 31,   // Hebrew: אל
  'heb-jinn':  329,  // Hebrew: טכש
  'ar-sufli-hadim': 316, // Arabic Sufli Hadim: يوش (applied after angel -41)
};

// ── Arabic positional digit-cycle letter mappings ──
const AR_UNITS =    {1:'ا', 2:'ب', 3:'ج', 4:'د', 5:'ه', 6:'و', 7:'ز', 8:'ح', 9:'ط'};
const AR_TENS =     {10:'ي', 20:'ك', 30:'ل', 40:'م', 50:'ن', 60:'س', 70:'ع', 80:'ف', 90:'ص'};
const AR_HUNDREDS = {100:'ق', 200:'ر', 300:'ش', 400:'ت', 500:'ث', 600:'خ', 700:'ذ', 800:'ض', 900:'ظ'};
const AR_THOUSAND  = 'غ';

// ── Hebrew positional digit-cycle letter mappings (Gematria order) ──
const HE_UNITS =    {1:'א', 2:'ב', 3:'ג', 4:'ד', 5:'ה', 6:'ו', 7:'ז', 8:'ח', 9:'ט'};
const HE_TENS =     {10:'י', 20:'כ', 30:'ל', 40:'מ', 50:'נ', 60:'ס', 70:'ע', 80:'פ', 90:'צ'};
const HE_HUNDREDS = {100:'ק', 200:'ר', 300:'ש', 400:'ת', 500:'ך', 600:'ם', 700:'ן', 800:'ף', 900:'ץ'};
const HE_THOUSAND  = 'א'; // Aleph used as thousand marker in Hebrew

/**
 * extractLettersFromValue(value, isHebrew)
 * Positional digit-cycle method — same algorithm for both scripts.
 * Uses Arabic tables by default; Hebrew tables when isHebrew=true.
 */
function extractLettersFromValue(value, isHebrew = false) {
  if (!value || value <= 0) return [];

  const UNITS    = isHebrew ? HE_UNITS    : AR_UNITS;
  const TENS     = isHebrew ? HE_TENS     : AR_TENS;
  const HUNDREDS = isHebrew ? HE_HUNDREDS : AR_HUNDREDS;
  const THOUSAND = isHebrew ? HE_THOUSAND : AR_THOUSAND;

  const letters = [];
  let n = Math.floor(value);
  const digits = [];
  while (n > 0) { digits.push(n % 10); n = Math.floor(n / 10); }

  let slot = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = digits[i];
    if (slot === 0) {
      if (d !== 0 && UNITS[d]) letters.push(UNITS[d]);
      slot = 1;
    } else if (slot === 1) {
      const v = d * 10;
      if (d !== 0 && TENS[v]) letters.push(TENS[v]);
      slot = 2;
    } else if (slot === 2) {
      const v = d * 100;
      if (d !== 0 && HUNDREDS[v]) letters.push(HUNDREDS[v]);
      slot = 3;
    } else {
      letters.push(THOUSAND);
      if (d !== 0 && d !== 1 && UNITS[d]) letters.push(UNITS[d]);
      slot = 1;
    }
  }
  return letters;
}

function generateTraditionalName(value, suffixType) {
  const isSufliHadim = suffixType === 'ar-sufli-hadim';
  const suffix = SUFFIXES[suffixType];
  const isAngel = suffixType.includes('angel');
  
  // STEP 1: Apply Ulvi adjustment (underflow rule: if value < suffix, add 360 first)
  let adjustedValue = value;
  
  if (isSufliHadim) {
    // Sufli Hadim: first apply angel -41, then subtract 316 from that result
    const angelVal = (value < 41) ? value + 360 - 41 : value - 41;
    adjustedValue = (angelVal < 316) ? angelVal + 360 - 316 : angelVal - 316;
  } else if (value < suffix) {
    adjustedValue = value + 360 - suffix;
  } else {
    adjustedValue = value - suffix;
  }
  
  if (adjustedValue <= 0) adjustedValue = 1;
  
  // STEP 2: POSITIONAL DIGIT-CYCLE EXTRACTION
  const isHebrew = suffixType.startsWith('heb');
  const consonants = extractLettersFromValue(adjustedValue, isHebrew);
  
  // STEP 3: FINAL NAME ASSEMBLY - Mirror order (reverse of breakdown sequence)
  // Breakdown remains unchanged (extraction order for display)
  // Final displayed name uses REVERSE of breakdown sequence
  // Example: breakdown [ز, ل, ر, غ] → final name = غرلز
  const extractedSequence = consonants.join(''); // Keep original for breakdown display
  const reversedConsonants = [...consonants].reverse(); // Mirror order for final name
  const mirroredSequence = reversedConsonants.join(''); // Final name uses reversed sequence
  
  // STEP 4: Apply harakat/suffix based on system
  let displayName;
  if (isSufliHadim) {
    displayName = buildSufliHadimName(reversedConsonants);
  } else if (isHebrew) {
    displayName = isAngel ? buildHebrewAngelName(reversedConsonants) : buildHebrewJinnName(reversedConsonants);
  } else {
    displayName = isAngel ? buildAngelName(reversedConsonants) : buildJinnName(reversedConsonants);
  }
  
  return {
    originalValue: value,
    adjustedValue,
    consonants, // BAST-2: immutable extraction order (for breakdown display)
    extractedSequence, // Direct concatenation (extraction order - breakdown)
    mirroredSequence, // Mirror order (final displayed name)
    name: displayName
  };
}

// ─────────────────────────────────────────────────────────────────
//  Props:
//   mc        — rawNum (Magic Constant — never modified by suffix)
//   gridSize  — selected grid size
//   rawInput  — original user input (for display)
//   suffix    — "ar-angel" | "ar-jinn" | "heb-angel" | "heb-jinn"
//   lang, L   — language / labels
// ─────────────────────────────────────────────────────────────────
const MsHierarchyTable = memo(function MsHierarchyTable({ mc, gridSize, rawInput, suffix, lang, L }) {

  // Hierarchy is computed from mc (rawNum when no suffix, adjusted otherwise)
  // Requires a gridSize to compute usurper-based rows — show placeholder if no size chosen
  const hier = useMemo(() => {
    if (!mc || !gridSize) return null;
    // BOOK AUTHORITY: No compatible square = no hierarchy = no names
    if (!isCompatible(mc, gridSize)) return null;
    const t0 = performance.now();
    const result = buildHierarchy(mc, gridSize);
    perfStore.set("buildHierarchy", parseFloat((performance.now() - t0).toFixed(2)));
    return result;
  }, [mc, gridSize]);

  // Build display rows with traditional names
  const rows = useMemo(() => {
    if (!hier) return [];
    const t0 = performance.now();

    const base = [
      { key: "usurper",   label: L.usurper,   val: hier.usurper  },
      { key: "guide",     label: L.guide,     val: hier.guide    },
      { key: "mystery",   label: L.mystery,   val: hier.mystery  },
      { key: "adjuster",  label: L.adjuster,  val: hier.adjuster, highlight: true },
      { key: "leader",    label: L.leader,    val: hier.leader   },
      { key: "regulator", label: L.regulator, val: hier.regulator },
      { key: "genGov",    label: L.genGov,    val: hier.genGov   },
      { key: "highOver",  label: L.highOver,  val: hier.highOver },
    ];

    const result = base.map(row => {
      const nameData = generateTraditionalName(row.val, suffix);
      const isAngel = suffix.includes('angel');
      const isSufliHadim = suffix === 'ar-sufli-hadim';
      const color = isSufliHadim ? "#34D399" : isAngel ? "#4FE3FF" : suffix === 'ar-jinn' ? "#FF9F5A" : "#F9A8D4";
      
      return {
        ...row,
        nameData,
        color
      };
    });

    perfStore.set("angelJinnNames", parseFloat((performance.now() - t0).toFixed(2)));
    return result;
  }, [hier, suffix, L]);

  // Always render if we have mc — show "choose grid size" message if no gridSize
  if (!mc) return null;

  const showNames = true; // All suffix modes display names
  const activeNameKey = suffix === 'ar-sufli-hadim' ? 'hadim' : suffix.includes("angel") ? "angel" : "jinn";

  return (
    <motion.div
      key={`hier-${mc}-${gridSize}-${suffix}`}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className="rounded-2xl border p-4 space-y-3"
      style={{ background: "rgba(4,8,24,0.99)", borderColor: G.borderHi, boxShadow: `0 0 28px ${G.glow}` }}
    >
      {/* Title */}
      <p className="font-inter text-[10px] uppercase tracking-widest text-center" style={{ color: G.dim }}>
        {L.hierarchy}
      </p>

      {/* Active system badge */}
      {(() => {
        const badgeCfg = {
          "ar-angel":  { c: "#4FE3FF", b: "rgba(79,227,255,0.35)",   bg: "rgba(79,227,255,0.06)",   label: lang==="ar" ? "ملاك عربي — ئيل (−٤١)" : "Arabic Angel — ئيل (−41)" },
          "ar-jinn":   { c: "#FF9F5A", b: "rgba(255,159,90,0.35)",   bg: "rgba(255,159,90,0.06)",   label: lang==="ar" ? "جن عربي — طيش (−٣١٩)" : "Arabic Sher Jinn — طيش (−319)" },
          "heb-angel": { c: "#C4B5FD", b: "rgba(196,181,253,0.35)",  bg: "rgba(196,181,253,0.06)",  label: lang==="ar" ? "ملاك عبري — אל (−٣١)" : "Hebrew Angel — אל (−31)" },
          "heb-jinn":  { c: "#F9A8D4", b: "rgba(249,168,212,0.35)",  bg: "rgba(249,168,212,0.06)",  label: lang==="ar" ? "جن عبري — תקש (−٣٢٩)" : "Hebrew Jinn — תקש (−329)" },
          "ar-sufli-hadim": { c: "#34D399", b: "rgba(52,211,153,0.35)", bg: "rgba(52,211,153,0.06)", label: lang==="ar" ? "سفلي هادم — يوش (−٣١٦)" : "Sufli Hadim — يوش (−316)" },
        };
        const cfg = badgeCfg[suffix] || badgeCfg["ar-angel"];
        return (
          <div className="flex justify-center">
            <span className="font-inter text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border"
              style={{ borderColor: cfg.b, color: cfg.c, background: cfg.bg }}>
              {cfg.label}
            </span>
          </div>
        );
      })()}

      <div className="h-px w-full" style={{ background: `linear-gradient(90deg,transparent,${G.borderHi},transparent)` }} />

      {/* Summary row */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 rounded-xl px-4 py-2.5 min-w-0"
          style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)" }}>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim, letterSpacing: "0.5px" }}>{L.inputLabel}</p>
          <p className="font-amiri font-bold" style={{ color: "rgba(212,175,55,0.75)", fontSize: "1.55rem", textShadow: "0 0 8px rgba(212,175,55,0.25)" }}>
            {lang === "ar" ? toArabicIndic(rawInput?.toLocaleString()) : rawInput?.toLocaleString()}
          </p>
        </div>
        <div className="flex-1 rounded-xl px-4 py-2.5 min-w-0"
          style={{ background: "rgba(212,175,55,0.10)", border: "1px solid rgba(212,175,55,0.30)" }}>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim, letterSpacing: "0.5px" }}>{L.workingMC}</p>
          <p className="font-amiri font-bold" style={{ color: G.text, fontSize: "1.75rem", textShadow: `0 0 12px ${G.glow}` }}>
            {lang === "ar" ? toArabicIndic(mc?.toLocaleString()) : mc?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Grid size required notice */}
      {!gridSize && (
        <p className="font-inter text-[9px] uppercase tracking-widest text-center py-2" style={{ color: "rgba(255,255,255,0.25)" }}>
          {lang === "ar" ? "اختر حجم المربع لحساب التسلسل الهرمي الكامل" : "Select a grid size to compute the full hierarchy"}
        </p>
      )}
      {/* No compatible square — no hierarchy, no names */}
      {gridSize && !hier && mc && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-4 space-y-2"
          style={{ background: "rgba(4,8,24,0.99)", borderColor: "rgba(255,80,80,0.50)", boxShadow: "0 0 24px rgba(255,80,80,0.14)" }}
        >
          <p className="font-inter text-[10px] uppercase tracking-widest text-center" style={{ color: "rgba(255,140,140,0.90)" }}>
            {lang === "ar" ? "⚠️ لا يمكن بناء مربع سحري متوافق" : "⚠️ No Compatible Magic Square"}
          </p>
          <p className="font-inter text-[9px] text-center" style={{ color: "rgba(255,255,255,0.45)" }}>
            {lang === "ar"
              ? `لا يمكن بناء مربع سحري للقيمة ${toArabicIndic(mc.toLocaleString())}. جرّب حجم مربع آخر.`
              : `No compatible magic square can be constructed for MC = ${mc.toLocaleString()}. Try a different grid size.`}
          </p>
        </motion.div>
      )}

      {/* 8 hierarchy rows — original layout */}
      {hier && (
        <div className="space-y-2">
          {rows.map((row, i) => (
            <motion.div key={row.key}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03, duration: 0.15 }}
              className="rounded-xl overflow-hidden border p-4"
              style={{ borderColor: row.highlight ? "rgba(212,175,55,0.40)" : "rgba(212,175,55,0.12)", background: row.highlight ? "rgba(212,175,55,0.12)" : "rgba(212,175,55,0.04)" }}
            >
              {/* Top row: Tier Label + Hierarchy Value */}
              <div className="flex items-center justify-between mb-4">
                <p className="font-inter text-[10px] uppercase tracking-widest"
                  style={{ color: row.highlight ? G.text : "rgba(212,175,55,0.60)", letterSpacing: "0.8px" }}>
                  {row.label}
                </p>
                <p 
                  className="font-amiri font-bold tabular-nums" 
                  dir="rtl"
                  lang="ar"
                  style={{ 
                    color: row.highlight ? G.text : "rgba(212,175,55,0.85)", 
                    fontSize: "1.3rem",
                    textShadow: row.highlight ? `0 0 12px ${G.glow}` : "none",
                    fontFamily: "'Noto Naskh Arabic', 'Amiri', 'Scheherazade New', serif"
                  }}>
                  {lang === "ar" ? toArabicIndic(row.val.toLocaleString()) : row.val.toLocaleString()}
                </p>
              </div>

              {/* Middle + Right: Angel Value label + value centered, Final Name on right */}
              {showNames && row.nameData && (
                <div className="flex items-center justify-between">
                  {/* Angel/Jinn Value centered */}
                  <div className="flex flex-col items-center flex-1">
                    <p className="font-inter text-[7px] uppercase tracking-widest mb-1" style={{ color: "rgba(212,175,55,0.45)", letterSpacing: "0.5px" }}>
                      {suffix === 'ar-angel' ? 'Angel (Arabic)' : suffix === 'ar-jinn' ? 'Jinn (Arabic)' : suffix === 'heb-angel' ? 'Angel (Hebrew)' : suffix === 'heb-jinn' ? 'Jinn (Hebrew)' : 'Sufli Hadim'}
                    </p>
                    <p 
                      className="font-amiri font-bold" 
                      dir="rtl"
                      lang="ar"
                      style={{ 
                        color: "rgba(212,175,55,0.70)", 
                        fontSize: "1.2rem",
                        fontFamily: "'Noto Naskh Arabic', 'Amiri', 'Scheherazade New', serif"
                      }}>
                      {lang === "ar" ? toArabicIndic(row.nameData.adjustedValue.toLocaleString()) : row.nameData.adjustedValue.toLocaleString()}
                    </p>
                  </div>

                  {/* Final Name on the right */}
                  <div className="flex flex-col items-end gap-0.5">
                    <span
                      className="font-bold"
                      dir={suffix.startsWith('heb') ? "ltr" : "rtl"}
                      lang={suffix.startsWith('heb') ? "he" : "ar"}
                      style={{
                        fontSize: "1.8rem",
                        color: row.color,
                        textShadow: `0 0 12px ${row.color}66`,
                        fontFamily: suffix.startsWith('heb')
                          ? "'SBL Hebrew', 'Times New Roman', serif"
                          : "'Noto Naskh Arabic', 'Amiri', 'Scheherazade New', serif"
                      }}>
                      {row.nameData.name}
                    </span>
                    {suffix.startsWith('heb') && (
                      <span className="font-inter" style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.38)", letterSpacing: "0.08em" }}>
                        {transliterateHebrew(row.nameData.name)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
});

export default MsHierarchyTable;