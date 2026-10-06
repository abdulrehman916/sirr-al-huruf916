/**
 * MizaanPipelineTest — Full end-to-end diagnostic
 * Runs the complete 9-Mizan → Post-Pipeline chain on a fixed test input
 * and displays every single intermediate value and formula.
 *
 * Test input: بِسْمِ اللهِ الرَّحْمَٰنِ الرَّحِيمِ (Bismillah)
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageLayout from "../components/PageLayout";
import {
  runMizaanPostPipeline,
  istintak,
  getBastLevel,
  satirVahidSum,
  buildVefk,
  BAST_TABLE,
  FIRST_BAST,
  ELEMENT_BAST_TOTALS,
} from "../lib/mizaanPostEngine";
import { mizaanAnalyze, MIZAAN_ELEMENTS, MIZAAN_BAST2 } from "../lib/mizaan9Engine";
import {
  MIZAAN_KHAYR_SHARR,
  MIZAAN_HOURS,
  MIZAAN_DAYS,
  MIZAAN_PLANETS_ALL,
  MIZAAN_PURPOSES,
  MIZAAN_ELEMENT_DEGREES,
  DAY_PLANET_MAP,
} from "../lib/mizaan9Data";

// ── FIXED TEST INPUT ────────────────────────────────────────────────
const TEST_INPUT = "بسم الله الرحمن الرحيم";

// ── FIXED TEST SELECTIONS (simulate typical usage) ─────────────────
// These represent user selections for a full 9-Mizan run.
const TEST_SELECTIONS = {
  elements:    ["fire"],       // M2 dominant element
  khayrSharr:  "khayr",        // M3
  hour:        1,               // M4: Hour 1
  days:        "fri",          // M5: Friday
  planet:      "zuhre",        // M6: Venus
  purposes:    ["celb"],        // M7
  khayrSharr8: "khayr",        // M8
};
const TEST_DEGREE_SELS = { fire: "f1" };  // M9: النار المستعمل
const TEST_CUSTOM_PURPOSE = "";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  bg:       "rgba(212,175,55,0.07)",
  border:   "rgba(212,175,55,0.40)",
};

const ELEMENT_META = {
  fire:  { arabic: "النار",  icon: "🔥", color: "#FF6B35" },
  earth: { arabic: "التراب", icon: "🌍", color: "#A5C880" },
  air:   { arabic: "الهواء", icon: "🌪",  color: "#B2EBF2" },
  water: { arabic: "الماء",  icon: "💧", color: "#4FC3F7" },
};

// ── Utility components ──────────────────────────────────────────────
function Row({ label, value, formula, highlight }) {
  return (
    <div className={`flex flex-col gap-0.5 py-2 border-b`}
      style={{ borderColor: highlight ? "rgba(212,175,55,0.35)" : "rgba(212,175,55,0.10)" }}>
      <div className="flex items-start justify-between gap-2">
        <span className="font-inter text-[9px] uppercase tracking-widest flex-shrink-0"
          style={{ color: highlight ? G.text : G.dim }}>
          {label}
        </span>
        <span className="font-inter text-xs font-bold tabular-nums text-right"
          style={{ color: highlight ? "#FFE580" : G.text }}>
          {value}
        </span>
      </div>
      {formula && (
        <span className="font-inter text-[8px] italic"
          style={{ color: "rgba(255,255,255,0.30)" }}>
          ↳ {formula}
        </span>
      )}
    </div>
  );
}

function ArabicVal({ label, value, size = "text-xl", color }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b"
      style={{ borderColor: "rgba(212,175,55,0.10)" }}>
      <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>{label}</span>
      <span className={`font-amiri ${size} font-bold`} dir="rtl" lang="ar"
        style={{ color: color || G.text,
          fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>
        {value}
      </span>
    </div>
  );
}

function LetterChips({ letters, label, color }) {
  return (
    <div className="py-2 border-b" style={{ borderColor: "rgba(212,175,55,0.10)" }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>{label} ({letters.length})</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {letters.map((l, i) => (
          <span key={i} className="font-amiri text-lg px-2 py-0.5 rounded-lg border"
            dir="rtl" lang="ar"
            style={{
              color: color || G.text,
              borderColor: G.border,
              background: G.bg,
              fontFamily: "'Noto Naskh Arabic', 'Amiri', serif"
            }}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function Section({ title, arabic, number, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ borderColor: G.border, background: "rgba(4,8,24,0.99)" }}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ background: open ? G.bg : "transparent" }}>
        <div className="flex items-center gap-3">
          <span className="font-inter text-[11px] font-bold tabular-nums w-6 h-6 rounded-full flex items-center justify-center border"
            style={{ color: G.text, borderColor: G.borderHi, background: "rgba(212,175,55,0.12)" }}>
            {number}
          </span>
          <span className="font-inter text-[10px] uppercase tracking-widest font-semibold" style={{ color: G.text }}>
            {title}
          </span>
          {arabic && (
            <span className="font-amiri text-base" dir="rtl" lang="ar"
              style={{ color: G.dim, fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>
              {arabic}
            </span>
          )}
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}
          className="font-inter text-xs" style={{ color: G.dim }}>▼</motion.span>
      </button>
      {open && (
        <div className="px-4 pb-5 pt-2 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

function SubSection({ title, children }) {
  return (
    <div className="mt-3 rounded-xl border p-3 space-y-0.5"
      style={{ borderColor: "rgba(212,175,55,0.18)", background: "rgba(212,175,55,0.03)" }}>
      <p className="font-inter text-[8px] uppercase tracking-widest mb-2"
        style={{ color: "rgba(212,175,55,0.50)" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div className="h-px my-3"
      style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.30), transparent)" }} />
  );
}

function VefkGrid({ grid, mc, element }) {
  const meta = ELEMENT_META[element] || ELEMENT_META.fire;
  return (
    <div>
      <p className="font-inter text-[8px] uppercase tracking-widest mb-2 text-center"
        style={{ color: G.dim }}>
        {element.charAt(0).toUpperCase() + element.slice(1)} Vefk Grid (MC = {mc})
      </p>
      <div className="grid grid-cols-4 gap-1 max-w-[220px] mx-auto">
        {grid.flat().map((val, i) => (
          <div key={i}
            className="aspect-square flex items-center justify-center rounded-lg border font-inter font-bold tabular-nums"
            style={{
              background: "rgba(212,175,55,0.06)",
              borderColor: meta.color + "55",
              color: meta.color,
              fontSize: "0.65rem",
            }}>
            {val}
          </div>
        ))}
      </div>
      <p className="font-inter text-[7px] text-center mt-1.5 uppercase tracking-wider"
        style={{ color: "rgba(212,175,55,0.30)" }}>
        Every row · col · diagonal = {mc}
      </p>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────
export default function MizaanPipelineTest() {

  // ── Step 1: Run M1 Analysis ─────────────────────────────────────
  const m1 = useMemo(() => mizaanAnalyze(TEST_INPUT), []);

  // ── Step 2: Compute all 9 Mizan grand totals (same as Mizaan9Page) ──
  const grandTotals = useMemo(() => {
    function countArabicLetters(str) {
      if (!str) return 0;
      return str.replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '')
               .replace(/[^\u0600-\u06FF]/g, '').length;
    }
    const ELEMENT_META_ARABIC = { fire: "النار", earth: "التراب", air: "الهواء", water: "الماء" };
    const KHAYR_SHARR_8 = {
      khayr: { arabic: 'الخير', bast: 2731 },
      sharr: { arabic: 'الشر',  bast: 2725 },
    };

    let grandBast = 0, grandLetters = 0;
    const breakdown = [];

    // M1
    grandBast   += m1.bast1Total;
    grandLetters += m1.letterCount;
    breakdown.push({ m: 1, label: "Input Text", arabic: TEST_INPUT, bast: m1.bast1Total, letters: m1.letterCount });

    // M2 elements
    const elKeys = TEST_SELECTIONS.elements || [];
    elKeys.forEach(k => {
      const b = MIZAAN_BAST2[k] || 0;
      const l = countArabicLetters(ELEMENT_META_ARABIC[k] || '');
      grandBast += b; grandLetters += l;
      breakdown.push({ m: 2, label: `Element: ${k}`, arabic: ELEMENT_META_ARABIC[k], bast: b, letters: l });
    });

    // M3 khayr/sharr
    const ks3 = TEST_SELECTIONS.khayrSharr;
    const ks3d = ks3 ? MIZAAN_KHAYR_SHARR[ks3] : null;
    if (ks3d) {
      grandBast += ks3d.bast; grandLetters += countArabicLetters(ks3d.arabic);
      breakdown.push({ m: 3, label: `Khayr/Sharr: ${ks3}`, arabic: ks3d.arabic, bast: ks3d.bast, letters: countArabicLetters(ks3d.arabic) });
    }

    // M4 hour
    const hourEntry = MIZAAN_HOURS.find(h => h.hour === TEST_SELECTIONS.hour);
    if (hourEntry) {
      grandBast += hourEntry.bast; grandLetters += countArabicLetters(hourEntry.arabic);
      breakdown.push({ m: 4, label: `Hour ${hourEntry.hour}`, arabic: hourEntry.arabic, bast: hourEntry.bast, letters: countArabicLetters(hourEntry.arabic) });
    }

    // M5 day
    const dayEntry = MIZAAN_DAYS.find(d => d.key === TEST_SELECTIONS.days);
    if (dayEntry) {
      grandBast += dayEntry.bast; grandLetters += countArabicLetters(dayEntry.arabic);
      breakdown.push({ m: 5, label: `Day: ${dayEntry.key}`, arabic: dayEntry.arabic, bast: dayEntry.bast, letters: countArabicLetters(dayEntry.arabic) });
    }

    // M6 planet
    const planetEntry = MIZAAN_PLANETS_ALL.find(p => p.key === TEST_SELECTIONS.planet);
    if (planetEntry) {
      grandBast += planetEntry.bast; grandLetters += countArabicLetters(planetEntry.arabic);
      breakdown.push({ m: 6, label: `Planet: ${planetEntry.key}`, arabic: planetEntry.arabic, bast: planetEntry.bast, letters: countArabicLetters(planetEntry.arabic) });
    }

    // M7 purposes
    const purposeArr = TEST_SELECTIONS.purposes || [];
    purposeArr.forEach(pk => {
      const pe = MIZAAN_PURPOSES.find(p => p.key === pk);
      if (pe) {
        grandBast += pe.bast; grandLetters += countArabicLetters(pe.arabic);
        breakdown.push({ m: 7, label: `Purpose: ${pk}`, arabic: pe.arabic, bast: pe.bast, letters: countArabicLetters(pe.arabic) });
      }
    });

    // M8 khayr/sharr8
    const ks8 = TEST_SELECTIONS.khayrSharr8;
    const ks8d = ks8 ? KHAYR_SHARR_8[ks8] : null;
    if (ks8d) {
      grandBast += ks8d.bast; grandLetters += countArabicLetters(ks8d.arabic);
      breakdown.push({ m: 8, label: `Khayr/Sharr-8: ${ks8}`, arabic: ks8d.arabic, bast: ks8d.bast, letters: countArabicLetters(ks8d.arabic) });
    }

    // M9 degrees
    Object.entries(TEST_DEGREE_SELS).forEach(([elKey, degKey]) => {
      if (!degKey) return;
      const elDegData = MIZAAN_ELEMENT_DEGREES[elKey];
      const deg = elDegData?.degrees.find(d => d.key === degKey);
      if (deg) {
        grandBast += deg.bast; grandLetters += countArabicLetters(deg.arabic);
        breakdown.push({ m: 9, label: `Degree: ${elKey}/${degKey}`, arabic: deg.arabic, bast: deg.bast, letters: countArabicLetters(deg.arabic) });
      }
    });

    return { grandBast, grandLetters, breakdown };
  }, [m1]);

  // ── Step 3: Run the post-pipeline ──────────────────────────────
  const pipeline = useMemo(() =>
    runMizaanPostPipeline({
      grandBast: grandTotals.grandBast,
      grandLetters: grandTotals.grandLetters,
      dominant: m1.dominant,
    }),
    [grandTotals, m1.dominant]
  );

  // Guardian name from element
  const guardianName = pipeline?.vefk?.guardianName || "";
  const { grandBast, grandLetters, breakdown } = grandTotals;
  const satirVahidTotal = grandBast + grandLetters;

  return (
    <PageLayout>
      <div className="space-y-3 pb-10">

        {/* ── HEADER ── */}
        <div className="rounded-2xl border p-5 text-center space-y-2"
          style={{ background: "rgba(3,6,20,0.99)", borderColor: G.borderHi, boxShadow: `0 0 60px ${G.glow}` }}>
          <p className="font-inter text-[8px] uppercase tracking-[0.3em]" style={{ color: G.dim }}>
            Full End-to-End Diagnostic Test
          </p>
          <h1 className="font-amiri text-3xl font-bold" style={{ color: G.text }}>
            اختبار كامل — ميزان التسعة
          </h1>
          <div className="h-px w-32 mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${G.borderHi}, transparent)` }} />
          <div className="rounded-xl border px-4 py-2 inline-block"
            style={{ borderColor: G.border, background: G.bg }}>
            <span className="font-amiri text-xl" dir="rtl" lang="ar"
              style={{ color: "#FFE580", fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>
              {TEST_INPUT}
            </span>
          </div>
          <p className="font-inter text-[8px]" style={{ color: "rgba(255,255,255,0.30)" }}>
            "Bismillah ir-Rahman ir-Rahim" — fixed test input · all 9 selections filled
          </p>
        </div>

        {/* ════════════════════════════════════════════════════════
            1. M1 — TEXT ANALYSIS
        ═════════════════════════════════════════════════════════ */}
        <Section number="1" title="M1 — Text Analysis (First Mizan)" arabic="الميزان الأول" defaultOpen={true}>
          <Row label="Input Text" value={TEST_INPUT} />
          <Row label="Letter Count (after stripping harakat)" value={m1.letterCount} formula="Remove diacritics → count Arabic characters" />
          <Row label="First Bast Total" value={m1.bast1Total.toLocaleString()} formula="Σ MIZAAN_BAST1[each letter]" highlight />
          <Row label="Dominant Element" value={m1.dominant?.toUpperCase() || "—"} formula="Most frequent element bucket" highlight />
          {m1.tiebreak && (
            <Row label="Tiebreak" value={`${m1.tiebreak.tiedElements.join(' vs ')} → resolved by ${m1.tiebreak.rankName}`} />
          )}
          <Divider />
          <SubSection title="Per-letter breakdown (first 20)">
            {m1.letters.slice(0, 20).map((l, i) => (
              <Row key={i}
                label={`${i + 1}. ${l.original} (${l.norm})`}
                value={`Bast₁ = ${l.bast1}  ·  Element = ${l.element || '—'}`}
              />
            ))}
            {m1.letterCount > 20 && (
              <p className="font-inter text-[8px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                … and {m1.letterCount - 20} more letters
              </p>
            )}
          </SubSection>
          <SubSection title="Element counts">
            {Object.entries(m1.counts).map(([k, v]) => (
              <Row key={k} label={k} value={`${v} letters (${m1.percentages[k]}%)`} />
            ))}
          </SubSection>
        </Section>

        {/* ════════════════════════════════════════════════════════
            2. SELECTIONS M2–M9 BAST VALUES
        ═════════════════════════════════════════════════════════ */}
        <Section number="2" title="M2–M9 Selection Bast Values" arabic="الاختيارات">
          <p className="font-inter text-[8px] italic mb-2" style={{ color: "rgba(255,255,255,0.30)" }}>
            Each selection's First Bast value is added to the Grand Total
          </p>
          {breakdown.map((b, i) => (
            <Row key={i}
              label={`M${b.m} — ${b.label}`}
              value={`${b.arabic}  →  Bast = ${b.bast.toLocaleString()}  ·  Letters = ${b.letters}`}
            />
          ))}
        </Section>

        {/* ════════════════════════════════════════════════════════
            3. GRAND TOTAL — INPUT TO POST-PIPELINE
        ═════════════════════════════════════════════════════════ */}
        <Section number="3" title="Grand Total — Post-Pipeline Input" arabic="المجموع الكلي" defaultOpen={true}>
          <Row label="Grand Bast (Σ all 9 Mizan Bast values)" value={grandBast.toLocaleString()}
            formula="Σ(M1.bast + M2.bast + … + M9.bast)" highlight />
          <Row label="Grand Letters (Σ all 9 Mizan letter counts)" value={grandLetters.toLocaleString()}
            formula="Σ(M1.letters + M2.letters + … + M9.letters)" highlight />
          <Row label="Satır Vahid Total  =  Grand Bast + Grand Letters" value={satirVahidTotal.toLocaleString()}
            formula={`${grandBast} + ${grandLetters} = ${satirVahidTotal}`} highlight />
          <Divider />
          <LetterChips
            letters={pipeline?.initialSeedLetters || []}
            label="Istintak of Satır Vahid Total → Initial Seed Letters"
            color={G.text}
          />
          <p className="font-inter text-[8px] mt-1 italic" style={{ color: "rgba(255,255,255,0.30)" }}>
            Formula: extract digits of {satirVahidTotal} LSD-first → positional letter cycle (Units→Tens→Hundreds→Thousands)
          </p>
        </Section>

        {/* ════════════════════════════════════════════════════════
            4. SATIR VAHID — DETAILED FORMULA
        ═════════════════════════════════════════════════════════ */}
        <Section number="4" title="Satır Vahid — Formula Detail" arabic="سطر الواحد">
          <Row label="Formula (p.54–55)" value="Σ Bast₁(each letter) + letter count = total" />
          <Row label="First Bast Sum (step 1)" value={grandBast.toLocaleString()} formula="Sum all First Bast values across 9 Mizans" />
          <Row label="Letter Count (step 2)" value={grandLetters.toLocaleString()} formula="Sum all letter counts across 9 Mizans" />
          <Row label="Satır Vahid Total (step 3)" value={satirVahidTotal.toLocaleString()} formula={`${grandBast} + ${grandLetters}`} highlight />
          <Divider />
          <SubSection title="Letter digit extraction for Istintak">
            {[...String(satirVahidTotal)].reverse().map((d, i) => {
              const posNames = ["Units", "Tens", "Hundreds", "Thousands"];
              const posLetters = [
                {1:'ا',2:'ب',3:'ج',4:'د',5:'ه',6:'و',7:'ز',8:'ح',9:'ط'},
                {1:'ي',2:'ك',3:'ل',4:'م',5:'ن',6:'س',7:'ع',8:'ف',9:'ص'},
                {1:'ق',2:'ر',3:'ش',4:'ت',5:'ث',6:'خ',7:'ذ',8:'ض',9:'ظ'},
              ];
              const slot = Math.min(i, 2);
              const key = parseInt(d);
              const letter = key !== 0 ? (posLetters[slot]?.[key] || "غ") : "(skip)";
              return (
                <Row key={i}
                  label={`Digit ${i + 1}: ${d} → ${posNames[slot] || "Thousands"} slot`}
                  value={d === '0' ? "0 → skip (no letter)" : `→ ${letter}`}
                />
              );
            })}
          </SubSection>
        </Section>

        {/* ════════════════════════════════════════════════════════
            5. ISTINTAK RESULT
        ═════════════════════════════════════════════════════════ */}
        <Section number="5" title="Istintak Result" arabic="الاستنطاق">
          <Row label="Input Number" value={satirVahidTotal.toLocaleString()} />
          <Row label="Method" value="Positional digit-cycle: Units→Tens→Hundreds→Thousands (غ)" />
          <Row label="Digits (LSD first)" value={[...String(satirVahidTotal)].reverse().join(", ")} />
          <LetterChips
            letters={pipeline?.initialSeedLetters || []}
            label="Extracted Letters (Seed)"
            color="#FFD700"
          />
          <Row label="Seed Count" value={pipeline?.initialSeedLetters?.length || 0} highlight />
        </Section>

        {/* ════════════════════════════════════════════════════════
            6. ZEVC / FERD — KITABET
        ═════════════════════════════════════════════════════════ */}
        {pipeline?.kitabet && (
          <Section number="6" title="Zevc / Ferd Determination (Kitabet)" arabic="زوج / فرد">
            <Row label="Seed Count" value={pipeline.kitabet.seedCount} />
            <Row label="Even or Odd?" value={pipeline.kitabet.isZevc ? "ZEVC (Even)" : "FERD (Odd)"}
              formula="seedCount % 2 === 0 → Zevc, else Ferd" highlight />
            <Row label="Rule" value={pipeline.kitabet.isZevc ? "Zevc → use 4th Bast level" : "Ferd → use 5th Bast level"}
              formula="p.56: zevc→4th bast, ferd→5th bast" />
            <Row label="Bast Level Selected" value={`Level ${pipeline.kitabet.bastLevelUsed}`} highlight />
          </Section>
        )}

        {/* ════════════════════════════════════════════════════════
            7. ESMA-I KITABET — FULL CHAIN
        ═════════════════════════════════════════════════════════ */}
        {pipeline?.kitabet && (
          <Section number="7" title="Esma-i Kitabet — Full Chain" arabic="أسماء الكتابة">
            <Row label="Input Letters" value={pipeline.kitabet.inputLetters.join("  ")} />
            <Row label="First Bast Sum of Input" value={pipeline.kitabet.bastSum.toLocaleString()}
              formula="Σ Bast₁(each seed letter)" />
            <Row label="+ Letter Count" value={pipeline.kitabet.letterCount} />
            <Row label="= Satır Vahid Total" value={pipeline.kitabet.satirTotal.toLocaleString()}
              formula={`${pipeline.kitabet.bastSum} + ${pipeline.kitabet.letterCount}`} highlight />
            <LetterChips
              letters={pipeline.kitabet.seedLetters}
              label="Istintak of Satır Vahid → New Seed Letters"
              color="#C4B5FD"
            />
            <Row label="Seed Count" value={pipeline.kitabet.seedCount} />
            <Row label="Zevc/Ferd" value={pipeline.kitabet.isZevc ? "ZEVC → 4th Bast" : "FERD → 5th Bast"} highlight />
            <Row label="Bast Level Used" value={`${pipeline.kitabet.bastLevelUsed}th Bast`} />
            <Divider />
            <SubSection title="Per-letter Bast lookup + expansion">
              {pipeline.kitabet.seedBastValues.map((sv, i) => (
                <div key={i} className="py-1.5 border-b" style={{ borderColor: "rgba(212,175,55,0.08)" }}>
                  <div className="flex items-center justify-between">
                    <span className="font-amiri text-base" dir="rtl" style={{ color: "#C4B5FD", fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>{sv.letter}</span>
                    <span className="font-inter text-[9px]" style={{ color: G.dim }}>
                      Bast{pipeline.kitabet.bastLevelUsed}({sv.letter}) = {sv.bastValue}
                    </span>
                    <div className="flex gap-0.5">
                      {sv.expansionLetters.map((el, j) => (
                        <span key={j} className="font-amiri text-sm px-1 rounded"
                          dir="rtl" style={{ color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.04)",
                            fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>
                          {el}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="font-inter text-[7px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                    Istintak({sv.bastValue}) = [{sv.expansionLetters.join(", ")}]
                  </p>
                </div>
              ))}
            </SubSection>
            <Divider />
            <LetterChips
              letters={pipeline.kitabet.expandedLetters}
              label={`All Expanded Letters (${pipeline.kitabet.expandedCount})`}
              color="#C4B5FD"
            />
            <Row label="Expanded Count" value={pipeline.kitabet.expandedCount} />
            <Row label="Zevc/Ferd of Expanded" value={pipeline.kitabet.isExpandedZevc ? "ZEVC → Groups of 4" : "FERD → Groups of 5"}
              formula="expandedCount % 2" highlight />
            <Row label="Group Size" value={pipeline.kitabet.groupSize} />
            <Divider />
            <SubSection title="Esma-i Kitabet Names (NOT used in Azimet — Vefk only)">
              {pipeline.kitabet.names.map((name, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <span className="font-inter text-[8px]" style={{ color: G.dim }}>#{i + 1}</span>
                  <span className="font-amiri text-xl font-bold px-3 py-0.5 rounded-xl border"
                    dir="rtl" lang="ar"
                    style={{ color: "#C4B5FD", borderColor: "rgba(196,181,253,0.35)",
                      background: "rgba(196,181,253,0.06)", fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>
                    {name}
                  </span>
                  <span className="font-inter text-[7px]" style={{ color: "rgba(255,255,255,0.20)" }}>
                    Letters: {[...name].join(" ")}
                  </span>
                </div>
              ))}
            </SubSection>
          </Section>
        )}

        {/* ════════════════════════════════════════════════════════
            8. ESMA-I A'VAN — FULL CHAIN
        ═════════════════════════════════════════════════════════ */}
        {pipeline?.avan && (
          <Section number="8" title="Esma-i A'van — Full Chain" arabic="أسماء الأعوان">
            <Row label="Input = Kitabet Expanded Letters" value={`${pipeline.avan.inputLetters.length} letters`}
              formula="Use all Kitabet expanded letters as new input" />
            <Row label="First Bast Sum of Input" value={pipeline.avan.bastSum.toLocaleString()} />
            <Row label="+ Letter Count" value={pipeline.avan.letterCount} />
            <Row label="= Satır Vahid Total" value={pipeline.avan.satirTotal.toLocaleString()}
              formula={`${pipeline.avan.bastSum} + ${pipeline.avan.letterCount}`} highlight />
            <LetterChips letters={pipeline.avan.seedLetters} label="Istintak → Seed Letters" color="#B2EBF2" />
            <Row label="Seed Count" value={pipeline.avan.seedCount} />
            <Row label="Zevc/Ferd" value={pipeline.avan.isZevc ? "ZEVC → 4th Bast" : "FERD → 5th Bast"} highlight />
            <Row label="Bast Level Used" value={`${pipeline.avan.bastLevelUsed}th Bast`} />
            <Divider />
            <SubSection title="Per-letter Bast lookup + expansion">
              {pipeline.avan.seedBastValues.map((sv, i) => (
                <div key={i} className="py-1.5 border-b" style={{ borderColor: "rgba(212,175,55,0.08)" }}>
                  <div className="flex items-center justify-between">
                    <span className="font-amiri text-base" dir="rtl"
                      style={{ color: "#B2EBF2", fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>{sv.letter}</span>
                    <span className="font-inter text-[9px]" style={{ color: G.dim }}>
                      Bast{pipeline.avan.bastLevelUsed}({sv.letter}) = {sv.bastValue}
                    </span>
                    <div className="flex gap-0.5 flex-wrap">
                      {sv.expansionLetters.map((el, j) => (
                        <span key={j} className="font-amiri text-sm px-1 rounded"
                          dir="rtl" style={{ color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.04)",
                            fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>
                          {el}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="font-inter text-[7px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                    Istintak({sv.bastValue}) = [{sv.expansionLetters.join(", ")}]
                  </p>
                </div>
              ))}
            </SubSection>
            <Divider />
            <LetterChips letters={pipeline.avan.expandedLetters} label={`Expanded Letters (${pipeline.avan.expandedCount})`} color="#B2EBF2" />
            <Row label="Group Size" value={`${pipeline.avan.groupSize} (${pipeline.avan.isExpandedZevc ? "Zevc→4" : "Ferd→5"})`} highlight />
            <Divider />
            <SubSection title="Esma-i A'van Names (used in Azimet with يا)">
              {pipeline.avan.names.map((name, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <span className="font-inter text-[8px]" style={{ color: G.dim }}>#{i + 1}</span>
                  <span className="font-amiri text-xl font-bold px-3 py-0.5 rounded-xl border"
                    dir="rtl" lang="ar"
                    style={{ color: "#B2EBF2", borderColor: "rgba(178,235,242,0.35)",
                      background: "rgba(178,235,242,0.06)", fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>
                    يا {name}
                  </span>
                </div>
              ))}
            </SubSection>
          </Section>
        )}

        {/* ════════════════════════════════════════════════════════
            9. ESMA-I KASEM — FULL CHAIN
        ═════════════════════════════════════════════════════════ */}
        {pipeline?.kasem && (
          <Section number="9" title="Esma-i Kasem — Full Chain (always 5th Bast)" arabic="أسماء القسم">
            <Row label="Rule (p.67)" value="Kasem always uses 5th Bast — regardless of Zevc/Ferd" formula="alwaysFifth = true" />
            <Row label="Input = A'van Expanded Letters" value={`${pipeline.kasem.inputLetters.length} letters`} />
            <Row label="First Bast Sum of Input" value={pipeline.kasem.bastSum.toLocaleString()} />
            <Row label="+ Letter Count" value={pipeline.kasem.letterCount} />
            <Row label="= Satır Vahid Total" value={pipeline.kasem.satirTotal.toLocaleString()}
              formula={`${pipeline.kasem.bastSum} + ${pipeline.kasem.letterCount}`} highlight />
            <LetterChips letters={pipeline.kasem.seedLetters} label="Istintak → Seed Letters" color={G.text} />
            <Row label="Seed Count" value={pipeline.kasem.seedCount} />
            <Row label="Zevc/Ferd (noted but overridden)" value={pipeline.kasem.isZevc ? "ZEVC" : "FERD"} />
            <Row label="Bast Level Used" value="5th Bast (always — Kasem rule)" highlight />
            <Divider />
            <SubSection title="Per-letter 5th Bast lookup + expansion">
              {pipeline.kasem.seedBastValues.map((sv, i) => (
                <div key={i} className="py-1.5 border-b" style={{ borderColor: "rgba(212,175,55,0.08)" }}>
                  <div className="flex items-center justify-between">
                    <span className="font-amiri text-base" dir="rtl"
                      style={{ color: G.text, fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>{sv.letter}</span>
                    <span className="font-inter text-[9px]" style={{ color: G.dim }}>
                      Bast5({sv.letter}) = {sv.bastValue}
                    </span>
                    <div className="flex gap-0.5 flex-wrap">
                      {sv.expansionLetters.map((el, j) => (
                        <span key={j} className="font-amiri text-sm px-1 rounded"
                          dir="rtl" style={{ color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.04)",
                            fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>
                          {el}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="font-inter text-[7px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                    Istintak({sv.bastValue}) = [{sv.expansionLetters.join(", ")}]
                  </p>
                </div>
              ))}
            </SubSection>
            <Divider />
            <LetterChips letters={pipeline.kasem.expandedLetters} label={`Expanded Letters (${pipeline.kasem.expandedCount})`} color={G.text} />
            <Row label="Group Size" value={`${pipeline.kasem.groupSize} (${pipeline.kasem.isExpandedZevc ? "Zevc→4" : "Ferd→5"})`} highlight />
            <Divider />
            <SubSection title="Esma-i Kasem Names (used in Azimet with بحق)">
              {pipeline.kasem.names.map((name, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <span className="font-inter text-[8px]" style={{ color: G.dim }}>#{i + 1}</span>
                  <span className="font-amiri text-xl font-bold px-3 py-0.5 rounded-xl border"
                    dir="rtl" lang="ar"
                    style={{ color: G.text, borderColor: G.borderHi,
                      background: G.bg, fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>
                    بحق {name}
                  </span>
                </div>
              ))}
            </SubSection>
          </Section>
        )}

        {/* ════════════════════════════════════════════════════════
            10. GALIP ANASIR + GUARDIAN NAME
        ═════════════════════════════════════════════════════════ */}
        {pipeline && (
          <Section number="10" title="Galip Anasır + Guardian Name" arabic="الغالب والاسم الحارس">
            <Row label="Dominant Element (from M1 analysis)" value={pipeline.element.toUpperCase()}
              formula="mizaanAnalyze(input).dominant" highlight />
            <Row label="Element Arabic" value={ELEMENT_META[pipeline.element]?.arabic || "—"} />
            <Row label="Element First Bast Total (p.44)" value={ELEMENT_BAST_TOTALS[pipeline.element].toLocaleString()}
              formula={`ELEMENT_BAST_TOTALS['${pipeline.element}']`} />
            <LetterChips
              letters={istintak(ELEMENT_BAST_TOTALS[pipeline.element])}
              label={`Istintak(${ELEMENT_BAST_TOTALS[pipeline.element]}) → Guardian Name Letters`}
              color={ELEMENT_META[pipeline.element]?.color}
            />
            <ArabicVal label="Guardian Name (4 borders of Vefk)" value={guardianName}
              color={ELEMENT_META[pipeline.element]?.color} size="text-3xl" />
            <Row label="Guardian Formula (p.62)" value="Istintak(element total bast) → concatenate letters" />
          </Section>
        )}

        {/* ════════════════════════════════════════════════════════
            11. VEFK CALCULATION
        ═════════════════════════════════════════════════════════ */}
        {pipeline?.vefk && (
          <Section number="11" title="Vefk Calculation (4×4 Magic Square)" arabic="الوفق">
            <Row label="Input S (Grand Bast)" value={pipeline.vefk.S.toLocaleString()}
              formula="S = grandBast (sum of all 9 Mizan Bast values)" />
            <Row label="V = S − 30" value={(pipeline.vefk.S - 30).toLocaleString()}
              formula={`${pipeline.vefk.S} − 30 = ${pipeline.vefk.S - 30}`} />
            <Row label="Q = floor(V ÷ 4)" value={pipeline.vefk.Q.toLocaleString()}
              formula={`floor(${pipeline.vefk.S - 30} ÷ 4) = ${pipeline.vefk.Q}`} highlight />
            <Row label="R = V mod 4 (remainder)" value={pipeline.vefk.R}
              formula={`${pipeline.vefk.S - 30} mod 4 = ${pipeline.vefk.R}`} />
            {pipeline.vefk.R > 0 && (
              <Row label="Remainder Correction" value={`Add 1 to cell at position ${pipeline.vefk.R === 3 ? 5 : pipeline.vefk.R === 2 ? 9 : 13}`}
                formula="R=3→pos5, R=2→pos9, R=1→pos13 (per p.68)" />
            )}
            <Row label="Magic Constant (MC)" value={pipeline.vefk.mc.toLocaleString()}
              formula="Sum of any row" highlight />
            <Row label="Element Template" value={`${pipeline.element} (p.68)`}
              formula="Position template determined by Galip Anasır" />
            <Divider />
            <Row label="Cell formula" value="cell = Q + (templatePosition − 1) + correction" />
            <SubSection title="Template positions (flat, row-major order)">
              <div className="flex flex-wrap gap-1">
                {(pipeline.vefk.R === 0 ? [] : []).concat(
                  ["fire","earth","air","water"].includes(pipeline.element)
                    ? (() => {
                        const VEFK_TEMPLATES = {
                          fire:  [[8,11,14,1],[13,2,7,12],[3,16,9,6],[10,5,4,15]],
                          earth: [[15,4,5,10],[6,9,16,3],[12,7,2,13],[1,14,11,8]],
                          air:   [[1,14,11,8],[12,7,2,13],[6,9,16,3],[15,4,5,10]],
                          water: [[10,5,4,15],[3,16,9,6],[13,2,7,12],[8,11,14,1]],
                        };
                        return VEFK_TEMPLATES[pipeline.element].flat().map((pos, i) => (
                          <span key={i} className="font-inter text-[9px] px-1.5 py-0.5 rounded border"
                            style={{ color: G.text, borderColor: G.border, background: G.bg }}>
                            {pos}
                          </span>
                        ));
                      })()
                    : []
                )}
              </div>
            </SubSection>
            <Divider />
            <VefkGrid grid={pipeline.vefk.grid} mc={pipeline.vefk.mc} element={pipeline.element} />
          </Section>
        )}

        {/* ════════════════════════════════════════════════════════
            12. AZIMET ASSEMBLY
        ═════════════════════════════════════════════════════════ */}
        {pipeline?.avan && pipeline?.kasem && (
          <Section number="12" title="Azimet Assembly" arabic="تركيب العزيمة">
            <Row label="Structure (p.70+)" value="يا [A'van names] … بحق [Kasem names] …" />
            <Row label="Esma-i Kitabet role" value="NOT in Azimet — written on Vefk borders only"
              formula="p.55: Kitabet names are written around the Vefk, not recited" />
            <Divider />
            <SubSection title="Esma-i A'van — prefixed يا (Yâ)">
              <div className="flex flex-wrap gap-2">
                {pipeline.avan.names.map((name, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <span className="font-amiri text-2xl font-bold px-3 py-1 rounded-xl border"
                      dir="rtl" lang="ar"
                      style={{ color: "#B2EBF2", borderColor: "rgba(178,235,242,0.45)",
                        background: "rgba(178,235,242,0.08)", fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>
                      يَا {name}
                    </span>
                    <span className="font-inter text-[7px]" style={{ color: G.dim }}>Avan #{i + 1}</span>
                  </div>
                ))}
              </div>
            </SubSection>
            <div className="h-2" />
            <SubSection title="Esma-i Kasem — prefixed بحق (Bi-hakki)">
              <div className="flex flex-wrap gap-2">
                {pipeline.kasem.names.map((name, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <span className="font-amiri text-2xl font-bold px-3 py-1 rounded-xl border"
                      dir="rtl" lang="ar"
                      style={{ color: G.text, borderColor: G.borderHi,
                        background: G.bg, fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>
                      بِحَقِّ {name}
                    </span>
                    <span className="font-inter text-[7px]" style={{ color: G.dim }}>Kasem #{i + 1}</span>
                  </div>
                ))}
              </div>
            </SubSection>
            <Divider />
            <SubSection title="Esma-i Kitabet — written on Vefk borders (NOT Azimet)">
              <div className="flex flex-wrap gap-2">
                {pipeline.kitabet.names.map((name, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <span className="font-amiri text-xl px-3 py-1 rounded-xl border"
                      dir="rtl" lang="ar"
                      style={{ color: "#C4B5FD", borderColor: "rgba(196,181,253,0.30)",
                        background: "rgba(196,181,253,0.05)", fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>
                      {name}
                    </span>
                    <span className="font-inter text-[7px]" style={{ color: G.dim }}>Kitabet #{i + 1}</span>
                  </div>
                ))}
              </div>
              <p className="font-inter text-[7px] mt-2 italic" style={{ color: "rgba(255,255,255,0.20)" }}>
                These are written around the edges of the Vefk grid, starting from the Guardian Name position.
              </p>
            </SubSection>
          </Section>
        )}

        {/* ── FINAL SUMMARY ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="rounded-2xl border p-5 space-y-3"
          style={{ background: "rgba(3,6,20,0.99)", borderColor: G.borderHi, boxShadow: `0 0 60px ${G.glow}` }}
        >
          <p className="font-inter text-[8px] uppercase tracking-[0.3em] text-center" style={{ color: G.dim }}>
            ✦ Test Summary ✦
          </p>
          <div className="grid grid-cols-2 gap-2 text-center">
            {[
              { label: "Grand Bast", value: grandBast.toLocaleString() },
              { label: "Grand Letters", value: grandLetters },
              { label: "Satır Vahid", value: satirVahidTotal.toLocaleString() },
              { label: "Element", value: (pipeline?.element || m1.dominant || "—").toUpperCase() },
              { label: "Kitabet Names", value: pipeline?.kitabet?.names?.length ?? 0 },
              { label: "A'van Names", value: pipeline?.avan?.names?.length ?? 0 },
              { label: "Kasem Names", value: pipeline?.kasem?.names?.length ?? 0 },
              { label: "Vefk MC", value: pipeline?.vefk?.mc?.toLocaleString() ?? "—" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border px-3 py-2"
                style={{ borderColor: G.border, background: G.bg }}>
                <p className="font-inter text-[7px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>{s.label}</p>
                <p className="font-inter text-base font-bold tabular-nums" style={{ color: G.text }}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="text-center pt-2">
            <span className="font-amiri text-2xl" style={{ color: G.text, fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}>
              ☽ {guardianName} ☾
            </span>
            <p className="font-inter text-[7px] mt-1 uppercase tracking-widest" style={{ color: G.dim }}>
              Guardian Name — Written on Vefk Borders
            </p>
          </div>
        </motion.div>

      </div>
    </PageLayout>
  );
}