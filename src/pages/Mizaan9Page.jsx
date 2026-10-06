import { useState, useRef, useCallback, useEffect, useLayoutEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";
import { mizaanAnalyzeAsync, mizaanCalcBast } from "../lib/mizaan9Engine";
import { MIZAAN_DAYNIGHT_FULL, MIZAAN_HOURS, MIZAAN_DAYS, MIZAAN_PLANETS_ALL, MIZAAN_PURPOSES, MIZAAN_ELEMENT_DEGREES } from "../lib/mizaan9Data";
import { MIZAAN_BAST2 } from "../lib/mizaan9Engine";
import Mizaan1      from "../components/mizaan/Mizaan1";
import Mizaan2      from "../components/mizaan/Mizaan2";
import Mizaan3      from "../components/mizaan/Mizaan3";
import Mizaan4      from "../components/mizaan/Mizaan4";
import Mizaan5      from "../components/mizaan/Mizaan5";
import Mizaan6      from "../components/mizaan/Mizaan6";
import Mizaan7      from "../components/mizaan/Mizaan7";
import Mizaan8      from "../components/mizaan/Mizaan8";
import Mizaan9Final from "../components/mizaan/Mizaan9Final";
import MizaanFinalSummary from "../components/mizaan/MizaanFinalSummary";
import MizaanPipelineFull from "../components/mizaan/MizaanPipelineFull";

import SatrVahidGrouping from "../components/mizaan/SatrVahidGrouping";
import EsmaAvanSection from "../components/mizaan/EsmaAvanSection";
import EsmaKasemSection from "../components/mizaan/EsmaKasemSection";
import FinalVefkSummary from "../components/mizaan/FinalVefkSummary";
import KasamSection from "../components/mizaan/KasamSection.jsx";
import MizaanConclusionAccordion from "../components/mizaan/MizaanConclusionAccordion.jsx";
import MizaanConclusionAccordionMethod2 from "../components/mizaan/MizaanConclusionAccordionMethod2.jsx";
import Method3ConclusionAccordion from "../components/mizaan/Method3ConclusionAccordion.jsx";


import { getDataSet } from "../lib/mizaanDataSets";
import { runMizaanPostPipeline, getBastLevel, istintak, GALIB_ANASIR_VALUES } from "../lib/mizaanPostEngine";
import Method3AvanSection from "../components/mizaan/Method3AvanSection";
import Method3KitabetSummary from "../components/mizaan/Method3KitabetSummary";
import Method3FinalTotalSection from "../components/mizaan/Method3FinalTotalSection";
import Method3AbjadVerificationSection from "../components/mizaan/Method3AbjadVerificationSection";
import Method3DivineNamesMatchSection from "../components/mizaan/Method3DivineNamesMatchSection";
import Method4Step1Section from "../components/mizaan/Method4Step1Section";
import MizaanInputCard from "../components/mizaan/MizaanInputCard";
import RitualDecisionEngine from "../components/mizaan/RitualDecisionEngine";
import QasamPanel from "../components/mizaan/QasamPanel";
import { mizaanAnalyzeAbjad } from "../lib/mizaan9DataC";
import { getBastLevelB } from "../lib/mizaan9DataB";
import { getCurrentSaat, getKawkabForSaat, getCurrentLaylNahar, getCurrentWeekdayKey, subscribeSaatPlanningContext } from "../lib/mizaanSaatCalculator";
import { usePageState } from "../context/PageStateContext";
import { Lock } from "lucide-react";
import FeatureLockedCard from "../components/FeatureLockedCard";
import { checkFeatureAccess } from "../lib/featurePermission";
import { getFeatures } from "../lib/featureRegistry";

const PAGE_PATH = "/mizaan9";
const FEATURES = getFeatures(PAGE_PATH);

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  glowHi:   "rgba(212,175,55,0.55)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  border:   "rgba(212,175,55,0.40)",
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

function MizaanDivider() {
  return (
    <div className="flex items-center justify-center gap-3 py-1">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, rgba(212,175,55,0.20))` }} />
      <span className="font-inter text-[8px] uppercase tracking-widest px-2" style={{ color: "rgba(212,175,55,0.30)" }}>⚖</span>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, rgba(212,175,55,0.20))` }} />
    </div>
  );
}

// Build initial selections from the ACTUAL current manuscript state:
//   • dayNight  — real sunrise/sunset (Layl or Nahar right now)
//   • days      — sunset-aware manuscript weekday (Kashf al-Haqa'iq p.65)
//   • hour      — current Saat (Astro Clock sunrise/sunset intervals)
//   • planet    — Kawkab from the correct Day/Night manuscript table
// Manual selections are never overwritten by this — it only runs on
// Analyze / Clear / section-switch, setting the default reference state.
function buildDefaultSelections(dominant) {
  const dn       = getCurrentLaylNahar();    // 'gunduz' | 'gece' | null
  const todayKey = getCurrentWeekdayKey();   // sunset-aware: sun..sat
  const saat     = getCurrentSaat();         // 1–12 (ignores dayNight arg)
  return {
    elements:   dominant ? [dominant] : [],
    dayNight:   dn,
    hour:       saat,
    days:       todayKey,
    planet:     getKawkabForSaat(saat, todayKey, dn),
    purposes:   [],
    khayrSharr8: null,
  };
}

const PAGE_KEY = 'mizaan9';

// ── Helper: compute bast value of Arabic text using the correct table for the active section ──
function calcCustomBastForSection(text, activeSection) {
  if (!text) return 0;
  if (activeSection === 3) {
    // Section 3: Abjad Kebir values
    const clean = text.replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '').replace(/\u0640/g, '').replace(/[^\u0600-\u06FF]/g, '');
    const NORM = { 'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ى':'ي','ئ':'ي','ؤ':'و','ة':'ه' };
    const ABJAD = {'ا':1,'ب':2,'ج':3,'د':4,'ه':5,'و':6,'ز':7,'ح':8,'ط':9,'ي':10,'ك':20,'ل':30,'م':40,'ن':50,'س':60,'ع':70,'ف':80,'ص':90,'ق':100,'ر':200,'ش':300,'ت':400,'ث':500,'خ':600,'ذ':700,'ض':800,'ظ':900,'غ':1000};
    let total = 0;
    for (const ch of clean) { total += ABJAD[NORM[ch] || ch] || 0; }
    return total;
  }
  // Section 1 & 2: Mizan Bast1 values
  const { total } = mizaanCalcBast(text, 1);
  return total;
}

// ── Helper: derive Esma-i Kitabet names — SAME algorithm as MizaanPipelineFull ──
// Returns both original names (for calculation) and supplemented names (for display)
function deriveKitabetNames(initialSeedLetters, dominant, getBastLevelFn) {
  if (!initialSeedLetters?.length) return { names: [], originalNames: [] };
  const isFerd = initialSeedLetters.length % 2 !== 0;
  const bastLevel = isFerd ? 5 : 4;
  let allExpanded = [];
  for (let i = initialSeedLetters.length - 1; i >= 0; i--) {
    allExpanded = [...allExpanded, ...istintak(getBastLevelFn(initialSeedLetters[i], bastLevel))];
  }
  const gSize = allExpanded.length % 2 !== 0 ? 5 : 4;
  const rem = allExpanded.length % gSize;
  let seq = [...allExpanded];
  // Group ORIGINAL letters first (before supplementation) — for calculation
  const originalGroups = [];
  for (let i = 0; i < allExpanded.length; i += gSize) {
    originalGroups.push(allExpanded.slice(i, Math.min(i + gSize, allExpanded.length)).join(""));
  }
  // Then supplement for display
  if (rem > 0) {
    const supp = istintak(GALIB_ANASIR_VALUES[dominant] || GALIB_ANASIR_VALUES.fire).slice(0, gSize - rem);
    seq = [...seq, ...supp];
  }
  // Group FINAL letters (after supplementation) — for display
  const groups = [];
  for (let i = 0; i < seq.length; i += gSize) groups.push(seq.slice(i, i + gSize).join(""));
  return { names: groups, originalNames: originalGroups };
}

// ── Helper: derive Esma-i A'van names — A'VAN completion rule (self-recycle, NOT Galib Anasir) ──
// Returns both original names (for calculation) and supplemented names (for display)
function deriveAvanNames(initialSeedLetters, getBastLevelFn) {
  if (!initialSeedLetters?.length) return { names: [], originalNames: [] };
  const seed = initialSeedLetters;
  const isFerd = seed.length % 2 !== 0;
  const bastLevel = isFerd ? 5 : 4;
  let allExpanded = [];
  for (let i = seed.length - 1; i >= 0; i--) {
    allExpanded = [...allExpanded, ...istintak(getBastLevelFn(seed[i], bastLevel))];
  }
  const gSize = allExpanded.length % 2 !== 0 ? 5 : 4;
  const rem = allExpanded.length % gSize;
  let seq = [...allExpanded];
  // Group ORIGINAL letters only (before supplementation) — for calculation
  const originalGroups = [];
  for (let i = 0; i < allExpanded.length; i += gSize) {
    const group = allExpanded.slice(i, Math.min(i + gSize, allExpanded.length));
    if (group.length === gSize) {
      originalGroups.push(group.join(""));
    }
  }
  // Then supplement for display — A'VAN RULE: Recycle from BEGINNING of own expanded sequence (NOT Galib Anasir)
  if (rem > 0) {
    const needed = gSize - rem;
    const supplement = allExpanded.slice(0, needed);
    seq = [...seq, ...supplement];
  }
  // Group FINAL letters (after supplementation) — for display only
  const groups = [];
  for (let i = 0; i < seq.length; i += gSize) groups.push(seq.slice(i, i + gSize).join(""));
  // Leftover original letters (before display completion) — used by Method 3 A'van → Kasem handoff
  const fullGroupsCount = Math.floor(allExpanded.length / gSize);
  const leftoverLetters = rem > 0 ? allExpanded.slice(fullGroupsCount * gSize) : [];
  return { names: groups, originalNames: originalGroups, leftoverLetters, hasRemainder: rem > 0 };
}

// ── Helper: re-derive grand totals using same logic as MizaanFinalSummary ──
function computeGrandTotals(result, selections, degreeSels, inputText, customPurpose, ds, activeSection) {
  if (!result) return { grandBast: 0, grandLetters: 0 };

  function countArabicLetters(str) {
    if (!str) return 0;
    return str.replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '').replace(/[^\u0600-\u06FF]/g, '').length;
  }

  const ELEMENT_META_ARABIC = { fire: "النار", earth: "التراب", air: "الهواء", water: "الماء" };

  let grandBast = 0;
  let grandLetters = 0;

  // M1 — input text
  grandBast   += result.bast1Total ?? 0;
  grandLetters += result.letterCount ?? 0;

  // M2 — element
  const elKeys = Array.isArray(selections?.elements) ? selections.elements : (selections?.elements ? [selections.elements] : []);
  elKeys.forEach(k => {
    grandBast   += ds.bast2[k] ?? 0;
    grandLetters += countArabicLetters(ELEMENT_META_ARABIC[k] || '');
  });

  // M3 — day/night
  const dn3 = selections?.dayNight;
  const dn3d = dn3 ? ds.dayNight[dn3] : null;
  if (dn3d) { grandBast += dn3d.bast; grandLetters += countArabicLetters(dn3d.arabic); }

  // M4 — hour
  const hourEntry = ds.hours.find(h => h.hour === selections?.hour);
  if (hourEntry) { grandBast += hourEntry.bast; grandLetters += countArabicLetters(hourEntry.arabic); }

  // M5 — day
  const dayEntry = ds.days.find(d => d.key === selections?.days);
  if (dayEntry) { grandBast += dayEntry.bast; grandLetters += countArabicLetters(dayEntry.arabic); }

  // M6 — planet
  const planetEntry = ds.planets.find(p => p.key === selections?.planet);
  if (planetEntry) { grandBast += planetEntry.bast; grandLetters += countArabicLetters(planetEntry.arabic); }

  // M7 — purposes + custom
  const purposeArr = Array.isArray(selections?.purposes) ? selections.purposes : (selections?.purposes ? [selections.purposes] : []);
  purposeArr.forEach(pk => {
    const pe = ds.purposes.find(p => p.key === pk);
    if (pe) { grandBast += pe.bast; grandLetters += countArabicLetters(pe.arabic); }
  });
  const trimmedCustom = (customPurpose ?? "").trim();
  if (trimmedCustom) {
    grandBast   += calcCustomBastForSection(trimmedCustom, activeSection);
    grandLetters += countArabicLetters(trimmedCustom);
  }

  // M8 — khayr/sharr8
  const ks8 = selections?.khayrSharr8;
  const ks8d = ks8 ? ds.khayrSharr8[ks8] : null;
  if (ks8d) { grandBast += ks8d.bast; grandLetters += countArabicLetters(ks8d.arabic); }

  // M9 — degrees
  Object.entries(degreeSels || {}).forEach(([elKey, degKey]) => {
    if (!degKey) return;
    const elDegData = ds.degrees[elKey];
    const deg = elDegData?.degrees.find(d => d.key === degKey);
    if (deg) { grandBast += deg.bast; grandLetters += countArabicLetters(deg.arabic); }
  });

  return { grandBast, grandLetters };
}



export default function Mizaan9Page() {
  const { getPageState, setPageState, clearPageState } = usePageState();
  const initialState = getPageState(PAGE_KEY, {
    input: "",
    inputMode: "text",
    directNumber: "",
    result: null,
    selections: buildDefaultSelections(null),
    customPurpose: "",
    degreeSels: {},
  });
  
  const [input, setInput] = useState(initialState.input);
  const [inputMode, setInputMode] = useState(initialState.inputMode || "text");
  const [directNumber, setDirectNumber] = useState(initialState.directNumber || "");
  const [result, setResult] = useState(initialState.result);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selections, setSelections] = useState(initialState.selections);
  const [customPurpose, setCustomPurpose] = useState(initialState.customPurpose);
  const [degreeSels, setDegreeSels] = useState(initialState.degreeSels);
  // OPTION 2 intermediate storage for OPTION 3
  const [option2State, setOption2State] = useState(null);
  // Final Summary vefk data — populated by child callbacks (display only)
  const [s1VefkData, setS1VefkData] = useState(null);
  const [s2VefkData, setS2VefkData] = useState(null);
  const [s3VefkData, setS3VefkData] = useState(null);
  const [method3AbjadTotal, setMethod3AbjadTotal] = useState(0);
  const [activeMethod, setActiveMethod] = useState(1);
  const [activeSection, setActiveSection] = useState(1);
  const [lockedFeature, setLockedFeature] = useState(null);
  // ── Resolved purpose from the Purpose Interpretation card (single source of truth) ──
  // The card resolves the Arabic phrase once; this result flows to Ritual Timing
  // so it NEVER analyzes Arabic again — it consumes the interpreted meaning directly.
  const [resolvedPurpose, setResolvedPurpose] = useState({ matched: false });
  const handlePurposeResolved = useCallback((res) => setResolvedPurpose(res), []);
  // Nine Mizan (Mizan 1–9 + Final Summary) is IDENTICAL for Section 1 and Section 2 — it always uses
  // the Section 1 dataset so selections/values never go blank when switching sections. Only the
  // post-Nine-Mizan pipeline (Kitabet/A'van/Kasem via getBastLevelFn below) is section-specific.
  // Section 3 (Abjad) is a separate system entirely and uses its own dataset.
  const ds = activeMethod === 1 || activeMethod === 2 || activeMethod === 3 || activeMethod === 4 ? getDataSet(activeSection === 3 ? 3 : 1) : null;
  // Section-specific rules apply ONLY to the post-pipeline (Esma-i Kitabet/A'van/Kasem):
  // Section 1 uses Section A Bast table; Section 2 uses Section B Bast table.
  // Bast1 is shared (identical). Only Bast2–Bast5 differ.
  const getBastLevelFn = activeSection === 2 ? getBastLevelB : getBastLevel;
  const abortRef = useRef(false);

  // Dominant element: from Arabic text analysis, or from user's Mizaan2 selection (Direct Number mode)
  const effectiveDominant = result?.dominant
    || (Array.isArray(selections?.elements) && selections.elements.length > 0 ? selections.elements[0] : null);

  useEffect(() => {
    setPageState(PAGE_KEY, { input, inputMode, directNumber, result, selections, customPurpose, degreeSels });
  }, [input, inputMode, directNumber, result, selections, customPurpose, degreeSels, setPageState]);

  // ── PLANNING MODE SYNC — re-initialize selections when Planning Mode changes ──
  // When Planning Mode is toggled ON/OFF or the planning date/location changes,
  // the SELECTED Mizan cards must auto-update to the new astronomical source
  // (Live or Planning). Manual selections made AFTER this re-initialization
  // are preserved until the next Planning Mode change.
  // Rule: SELECTED cards are the SINGLE SOURCE OF TRUTH for Ritual Timing.
  // The engine NEVER reads from the CURRENT badge — only from selections.
  useEffect(() => {
    const unsub = subscribeSaatPlanningContext(() => {
      setSelections(buildDefaultSelections(effectiveDominant));
    });
    return () => unsub();
  }, [effectiveDominant]);

  // ══ OPTION 2 — DISABLED FOR NOW ═══════════════════════════════════
  // Option 2 calculation is temporarily disabled to prioritize Option 1 restoration
  useEffect(() => {
    setOption2State(null);
  }, []);

  // Reset the (display-only) vefk summary data when method or section changes — no recalculation.
  // CRITICAL: useLayoutEffect (not useEffect) so this reset fires BEFORE the
  // child pipeline components' onVefkReady useEffect hooks. With useEffect the
  // parent reset runs last and nullifies s2/s3 data permanently (children's
  // memo deps don't change afterward, so their callbacks never re-fire).
  // useLayoutEffect runs first → reset clears → then children's useEffect
  // callbacks re-populate s1/s2/s3 with fresh data.
  useLayoutEffect(() => {
    setS1VefkData(null);
    setS2VefkData(null);
    setS3VefkData(null);
  }, [activeMethod, activeSection]);

  // The Nine Mizan (Mizan 1–9) is SHARED between Section 1 and Section 2 — switching between them
  // must NOT touch `result`. Only re-analyze when crossing the Section 3 (Abjad) boundary.
  const prevSectionRef = useRef(activeSection);
  useEffect(() => {
    const prevSection = prevSectionRef.current;
    prevSectionRef.current = activeSection;
    if (!input.trim() || !result) return;
    const enteringAbjad = activeSection === 3 && prevSection !== 3;
    const leavingAbjad  = activeSection !== 3 && prevSection === 3;
    if (!enteringAbjad && !leavingAbjad) return;
    if (activeSection === 3) {
      const r = mizaanAnalyzeAbjad(input);
      setResult(r);
      setSelections(buildDefaultSelections(r.dominant));
    } else {
      abortRef.current = false;
      setLoading(true);
      setProgress(0);
      mizaanAnalyzeAsync(input, (p) => { if (!abortRef.current) setProgress(p); }).then(r => {
        if (!abortRef.current) {
          setResult(r);
          setSelections(buildDefaultSelections(r.dominant));
        }
        setLoading(false);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const handleAnalyze = useCallback(async () => {
    abortRef.current = false;
    setLoading(true);
    setProgress(0);
    setResult(null);
    setSelections(buildDefaultSelections(null));
    setOption2State(null);
    setS1VefkData(null);
    setS2VefkData(null);
    setS3VefkData(null);

    // ── Direct Number mode: skip Arabic text analysis, use the number directly as First Mizan value ──
    if (inputMode === 'number') {
      const num = parseInt(directNumber, 10);
      if (!num || num <= 0) { setLoading(false); return; }
      setProgress(100);
      const r = {
        text: '', letters: [], letterCount: 0,
        bast1Total: num,
        counts: { fire: 0, water: 0, air: 0, earth: 0 },
        percentages: { fire: 0, water: 0, air: 0, earth: 0 },
        dominant: null, tiebreak: null, bast2Value: null, planet: null, daynight: null, suitability: null,
      };
      if (!abortRef.current) { setResult(r); setSelections(buildDefaultSelections(null)); }
      setLoading(false);
      return;
    }

    // ── Arabic Text mode: existing behavior (unchanged) ──
    if (!input.trim()) { setLoading(false); return; }
    let r;
    if (activeSection === 3) {
      r = mizaanAnalyzeAbjad(input);
      setProgress(100);
    } else {
      r = await mizaanAnalyzeAsync(input, (p) => { if (!abortRef.current) setProgress(p); });
    }
    if (!abortRef.current) {
      setResult(r);
      setSelections(buildDefaultSelections(r.dominant));
    }
    setLoading(false);
  }, [input, directNumber, inputMode, activeSection, activeMethod]);

  const handleClear = () => {
    abortRef.current = true;
    setInput("");
    setDirectNumber("");
    setResult(null);
    setLoading(false);
    setProgress(0);
    setSelections(buildDefaultSelections(null));
    setCustomPurpose("");
    setDegreeSels({});
    setS1VefkData(null);
    setS2VefkData(null);
    setS3VefkData(null);
    clearPageState(PAGE_KEY);
  };

  const updateSel = (key) => (val) => setSelections(prev => ({ ...prev, [key]: val }));

  // ── Saat ↔ Kawkab sync: when the selected Saat (Mizaan 4), Day (Mizaan 5),
  // or Day/Night (Mizaan 3) changes, auto-set the Kawkab (Mizaan 6) to the
  // planet ruling that exact combination, per the manuscript Day/Night tables.
  // Reuses the Astro Clock planetary-hour engine (getKawkabForSaat). Manual
  // Kawkab override persists — this effect fires only on hour/days/dayNight
  // change, so a manually-tapped Kawkab is never disturbed until the user
  // picks a different Saat, Day, or Day/Night.
  useEffect(() => {
    if (!selections?.hour) return;
    const planetKey = getKawkabForSaat(selections.hour, selections?.days, selections?.dayNight);
    if (planetKey) updateSel("planet")(planetKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections?.hour, selections?.days, selections?.dayNight]);

  return (
    <PageLayout>
      <div className="space-y-4 mizaan-page">

        {/* Header */}
        <PageTitle arabic="ميزان الأعداد" latin="9 Mizan" subtitle="Complete Occult Analysis System" icon="٩" />

        {/* Method Navigation (NEW - Top Level) */}
        <div className="flex gap-2 mb-3">
          {[1, 2, 3, 4, 5].map((method) => {
            const methodFeat = FEATURES.find(f => f.method === method);
            const isMethodLocked = methodFeat && !checkFeatureAccess(PAGE_PATH, methodFeat.id);
            const isActive = activeMethod === method && !lockedFeature;
            return (
              <button key={method} onClick={() => {
                if (isMethodLocked) { setLockedFeature(methodFeat); return; }
                setLockedFeature(null);
                setActiveMethod(method);
              }}
                className="flex-1 py-2.5 px-2 rounded-xl font-inter font-bold text-sm flex flex-col items-center gap-0.5"
                style={{
                  background: isActive ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isActive ? 'rgba(212,175,55,0.65)' : 'rgba(255,255,255,0.12)'}`,
                  color: isActive ? '#F5D060' : 'rgba(255,255,255,0.40)',
                  boxShadow: isActive ? '0 0 20px rgba(212,175,55,0.20)' : 'none',
                }}>
                <span className="font-inter text-[9px] uppercase tracking-widest flex items-center gap-1">
                  {isMethodLocked && <Lock className="w-2.5 h-2.5 opacity-60" />}
                  METHOD
                </span>
                <span className="font-amiri text-sm">{method}</span>
              </button>
            );
          })}
        </div>

        {lockedFeature ? (
          <FeatureLockedCard
            pagePath={PAGE_PATH}
            featureId={lockedFeature.id}
            featureLabel={lockedFeature.label}
            onBack={() => setLockedFeature(null)}
            onUnlocked={() => { setLockedFeature(null); window.location.reload(); }}
          />
        ) : (
        <>
        {/* Method 1 Content (ALL existing logic belongs here) */}
        {activeMethod === 1 && (
          <div>
            {/* Section 1 / Section 2 Toggle (Section 3 hidden - internal engine only) */}
            <div className="flex gap-2">
              {[
                { s: 1, arabic: 'المجموعة الأولى' },
                { s: 2, arabic: 'المجموعة الثانية' },
              ].map(({ s, arabic }) => (
                <button key={s} onClick={() => setActiveSection(s)}
                  className="flex-1 py-2.5 px-2 rounded-xl font-inter font-bold text-sm flex flex-col items-center gap-0.5"
                  style={{
                    background: activeSection === s ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${activeSection === s ? 'rgba(212,175,55,0.65)' : 'rgba(255,255,255,0.12)'}`,
                    color: activeSection === s ? '#F5D060' : 'rgba(255,255,255,0.40)',
                    boxShadow: activeSection === s ? '0 0 20px rgba(212,175,55,0.20)' : 'none',
                  }}>
                  <span className="font-amiri text-sm">{arabic}</span>
                  <span className="font-inter text-[9px] uppercase tracking-widest">SECTION {s}</span>
                </button>
              ))}
            </div>

            <MizaanInputCard
          inputMode={inputMode} setInputMode={setInputMode}
          input={input} setInput={setInput}
          directNumber={directNumber} setDirectNumber={setDirectNumber}
          loading={loading} progress={progress}
          onAnalyze={handleAnalyze} onClear={handleClear}
          hasResult={!!result}
        />

        {/* 9 Mizaans */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div key={`mizaan-9-flow`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-2">

              <Mizaan1 result={result} inputMode={inputMode} />
              <MizaanDivider />
              <Mizaan2
                dominant={result.dominant}
                tiebreak={result.tiebreak}
                selected={selections.elements}
                onChange={updateSel("elements")}
              elementsData={ds.elements}
              />
              <MizaanDivider />
              <Mizaan3
                dominant={result.dominant}
                selected={selections.dayNight}
                onChange={updateSel("dayNight")}
                dayNightData={ds.dayNight}
                />
              <MizaanDivider />
              <Mizaan4
                selected={selections.hour}
                onChange={updateSel("hour")}
                hoursData={ds.hours}
                dayNight={selections.dayNight}
              />
              <MizaanDivider />
              <Mizaan5
                selected={selections.days}
                onChange={updateSel("days")}
                daysData={ds.days}
                />
              <MizaanDivider />
              <Mizaan6
                selectedDay={selections.days}
                selected={selections.planet}
                onChange={updateSel("planet")}
                planetsData={ds.planets}
                />
              <MizaanDivider />
              <Mizaan7
                selected={selections.purposes}
                onChange={updateSel("purposes")}
                customPurpose={customPurpose}
                onCustomPurpose={setCustomPurpose}
                purposesData={ds.purposes}
                onPurposeResolved={handlePurposeResolved}
                />
              <MizaanDivider />
              <Mizaan8
                selected={selections.khayrSharr8}
                onChange={updateSel("khayrSharr8")}
                selectedPurpose={selections.purposes}
                khayrSharr8Data={ds.khayrSharr8}
                />
              <MizaanDivider />
              <Mizaan9Final               result={result} selections={selections} degreeSels={degreeSels} onDegreeSels={setDegreeSels} degrees9Data={ds.degrees} />
              <MizaanDivider />
              <MizaanFinalSummary result={result} selections={selections} degreeSels={degreeSels} inputText={input} customPurpose={customPurpose} ds={ds} calcCustomBast={(t) => calcCustomBastForSection(t, activeSection)} />
              <MizaanDivider />

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* SECTION 1: OPTION 1 — POST-PIPELINE RESULTS (LOCKED) */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              {(() => {
                const { grandBast, grandLetters } = computeGrandTotals(result, selections, degreeSels, input, customPurpose, ds, activeSection);
                const dominant = effectiveDominant;
                if (!grandBast || grandBast <= 0) return null;

                // Section 1 pipeline result — read-only source for Section 2
                const section1 = runMizaanPostPipeline({ grandBast, grandLetters, dominant, getBastLevelFn });

                // Section 1 vefk (directly available from pipeline)
                const s1Vefk   = section1?.vefk || null;
                const s1Source = section1?.vefkSourceNumber || null;

                // A'van's own completed-pipeline output — this (NOT section1.allExpandedLetters) is Kasem's input
                const section2ExpandedLetters = (() => {
                  if (!section1?.allExpandedLetters?.length) return [];
                  const s2GrandBast    = section1.allExpandedLetters.reduce((s, l) => s + (getBastLevelFn(l, 1) || 0), 0);
                  const s2GrandLetters = section1.allExpandedLetters.length;
                  const s2Pipeline     = runMizaanPostPipeline({ grandBast: s2GrandBast, grandLetters: s2GrandLetters, dominant, getBastLevelFn });
                  return s2Pipeline?.allExpandedLetters || [];
                })();

                return (
                  <>
                    {/* ═══ SECTION 1: LOCKED ═══ */}
                    <MizaanPipelineFull grandBast={grandBast} grandLetters={grandLetters} dominant={dominant} onVefkReady={setS1VefkData} getBastLevelFn={getBastLevelFn} />

                    {/* ═══ SECTION 2: ESMA-I A'VAN ═══ */}
                    {section1?.allExpandedLetters?.length > 0 && (
                      <EsmaAvanSection
                        allExpandedLetters={section1.allExpandedLetters}
                        dominant={dominant}
                        onVefkReady={setS2VefkData}
                        getBastLevelFn={getBastLevelFn}
                      />
                    )}

                    {/* ═══ ESMA-I KASEM — Method 1 includes full Kasem pipeline (only conclusion omitted) ═══ */}
                    {section2ExpandedLetters.length > 0 && (
                      <EsmaKasemSection
                        section2ExpandedLetters={section2ExpandedLetters}
                        dominant={dominant}
                        onVefkReady={setS3VefkData}
                        getBastLevelFn={getBastLevelFn}
                      />
                    )}

                    {/* ═══ FINAL SUMMARY: THREE VEFKS (display only) ═══ */}
                    <FinalVefkSummary
                      s1Vefk={s1VefkData?.vefk || s1Vefk}
                      s1Source={s1VefkData?.source || s1Source}
                      s1Names={s1VefkData?.names || []}
                      s2Vefk={s2VefkData?.vefk || null}
                      s2Source={s2VefkData?.source || null}
                      s2Names={s2VefkData?.names || []}
                      s3Vefk={s3VefkData?.vefk || null}
                      s3Source={s3VefkData?.source || null}
                      s3Names={s3VefkData?.names || []}
                      s3BorderLetters={s3VefkData?.borderLetters || ""}
                      dominant={dominant}
                    />
                    <MizaanDivider />

                    {/* ═══ CONCLUSION — Method 1 only, accordion (NO Kasem Dua) ═══ */}
                    <MizaanConclusionAccordion />
                    </>
                    );
                    })()}



            </motion.div>
          )}
        </AnimatePresence>

        </div>
        )}

      {/* Method 2 Content */}
      {activeMethod === 2 && (
        <div>
          {/* Section 1 / Section 2 Toggle (Section 3 hidden - internal engine only) */}
          <div className="flex gap-2">
            {[
              { s: 1, arabic: 'المجموعة الأولى' },
              { s: 2, arabic: 'المجموعة الثانية' },
            ].map(({ s, arabic }) => (
              <button key={s} onClick={() => setActiveSection(s)}
                className="flex-1 py-2.5 px-2 rounded-xl font-inter font-bold text-sm flex flex-col items-center gap-0.5"
                style={{
                  background: activeSection === s ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${activeSection === s ? 'rgba(212,175,55,0.65)' : 'rgba(255,255,255,0.12)'}`,
                  color: activeSection === s ? '#F5D060' : 'rgba(255,255,255,0.40)',
                  boxShadow: activeSection === s ? '0 0 20px rgba(212,175,55,0.20)' : 'none',
                }}>
                <span className="font-amiri text-sm">{arabic}</span>
                <span className="font-inter text-[9px] uppercase tracking-widest">SECTION {s}</span>
              </button>
            ))}
          </div>

          <MizaanInputCard
            inputMode={inputMode} setInputMode={setInputMode}
            input={input} setInput={setInput}
            directNumber={directNumber} setDirectNumber={setDirectNumber}
            loading={loading} progress={progress}
            onAnalyze={handleAnalyze} onClear={handleClear}
            hasResult={!!result}
          />

          {/* 9 Mizaans (same as Method 1) */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div key={`mizaan-9-method2`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-2">

                <Mizaan1 result={result} inputMode={inputMode} />
                <MizaanDivider />
                <Mizaan2
                  dominant={result.dominant}
                  tiebreak={result.tiebreak}
                  selected={selections.elements}
                  onChange={updateSel("elements")}
                  elementsData={ds.elements}
                />
                <MizaanDivider />
                <Mizaan3
                  dominant={result.dominant}
                  selected={selections.dayNight}
                  onChange={updateSel("dayNight")}
                  dayNightData={ds.dayNight}
                />
                <MizaanDivider />
                <Mizaan4
                  selected={selections.hour}
                  onChange={updateSel("hour")}
                  hoursData={ds.hours}
                  dayNight={selections.dayNight}
                />
                <MizaanDivider />
                <Mizaan5
                  selected={selections.days}
                  onChange={updateSel("days")}
                  daysData={ds.days}
                />
                <MizaanDivider />
                <Mizaan6
                  selectedDay={selections.days}
                  selected={selections.planet}
                  onChange={updateSel("planet")}
                  planetsData={ds.planets}
                />
                <MizaanDivider />
                <Mizaan7
                  selected={selections.purposes}
                  onChange={updateSel("purposes")}
                  customPurpose={customPurpose}
                  onCustomPurpose={setCustomPurpose}
                  purposesData={ds.purposes}
                  onPurposeResolved={handlePurposeResolved}
                />
                <MizaanDivider />
                <Mizaan8
                  selected={selections.khayrSharr8}
                  onChange={updateSel("khayrSharr8")}
                  selectedPurpose={selections.purposes}
                  khayrSharr8Data={ds.khayrSharr8}
                />
                <MizaanDivider />
                <Mizaan9Final result={result} selections={selections} degreeSels={degreeSels} onDegreeSels={setDegreeSels} degrees9Data={ds.degrees} />
                <MizaanDivider />
                <MizaanFinalSummary result={result} selections={selections} degreeSels={degreeSels} inputText={input} customPurpose={customPurpose} ds={ds} calcCustomBast={(t) => calcCustomBastForSection(t, activeSection)} />
                <MizaanDivider />

                {/* Method 2: SAME shared pipeline as Method 1 (Kitabet → A'van → Kasem), then Final Divine Names */}
                {(() => {
                  const { grandBast, grandLetters } = computeGrandTotals(result, selections, degreeSels, input, customPurpose, ds, activeSection);
                  const dominant = effectiveDominant;
                  if (!grandBast || grandBast <= 0) return null;

                  // Identical pipeline call as Method 1 Section 1
                  const section1 = runMizaanPostPipeline({ grandBast, grandLetters, dominant, getBastLevelFn });

                  // Identical derivation as Method 1 Section 2 → Section 3 input
                  const section2ExpandedLetters = (() => {
                    if (!section1?.allExpandedLetters?.length) return [];
                    const s2GrandBast    = section1.allExpandedLetters.reduce((s, l) => s + (getBastLevelFn(l, 1) || 0), 0);
                    const s2GrandLetters = section1.allExpandedLetters.length;
                    const s2Pipeline     = runMizaanPostPipeline({ grandBast: s2GrandBast, grandLetters: s2GrandLetters, dominant, getBastLevelFn });
                    return s2Pipeline?.allExpandedLetters || [];
                  })();

                  const s1Vefk   = section1?.vefk || null;
                  const s1Source = section1?.vefkSourceNumber || null;

                  return (
                    <>
                      {/* ═══ SAME AS METHOD 1: Esma-i Kitabet ═══ */}
                      <MizaanPipelineFull grandBast={grandBast} grandLetters={grandLetters} dominant={dominant} onVefkReady={setS1VefkData} getBastLevelFn={getBastLevelFn} />

                      {/* ═══ SAME AS METHOD 1: Esma-i A'van ═══ */}
                      {section1?.allExpandedLetters?.length > 0 && (
                        <EsmaAvanSection
                          allExpandedLetters={section1.allExpandedLetters}
                          dominant={dominant}
                          onVefkReady={setS2VefkData}
                          getBastLevelFn={getBastLevelFn}
                        />
                      )}

                      {/* ═══ MOVED HERE FROM METHOD 1: Esma-i Kasem ═══ */}
                      {section2ExpandedLetters.length > 0 && (
                        <EsmaKasemSection
                          section2ExpandedLetters={section2ExpandedLetters}
                          dominant={dominant}
                          onVefkReady={setS3VefkData}
                          getBastLevelFn={getBastLevelFn}
                        />
                      )}

                      {/* ═══ FINAL SUMMARY: THREE VEFKS (display only) ═══ */}
                      <FinalVefkSummary
                        s1Vefk={s1VefkData?.vefk || s1Vefk}
                        s1Source={s1VefkData?.source || s1Source}
                        s1Names={s1VefkData?.names || []}
                        s2Vefk={s2VefkData?.vefk || null}
                        s2Source={s2VefkData?.source || null}
                        s2Names={s2VefkData?.names || []}
                        s3Vefk={s3VefkData?.vefk || null}
                        s3Source={s3VefkData?.source || null}
                        s3Names={s3VefkData?.names || []}
                        s3BorderLetters={s3VefkData?.borderLetters || ""}
                        dominant={dominant}
                      />

                      <MizaanDivider />

                      {/* ═══ COMMON KASEM — Method 2 only, moved from Method 1 ═══ */}
                      <div className="text-center px-2">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border"
                          style={{ background: "rgba(212,175,55,0.07)", borderColor: "rgba(212,175,55,0.50)" }}>
                          <span className="text-base">📜</span>
                          <span className="font-inter text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: "#F5D060" }}>
                            Common Kasem
                          </span>
                        </div>
                      </div>
                      <KasamSection
                        avanNames={s2VefkData?.names || []}
                        kasemNames={s3VefkData?.names || []}
                      />

                      <MizaanDivider />
                      <MizaanConclusionAccordionMethod2 />
                    </>
                  );
                })()}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Method 3 Content — Esma-i Kitabet identical to Method 1/2; A'van onward uses Method 3 formula */}
      {activeMethod === 3 && (
        <div>
          {/* Section 1 / Section 2 Toggle (Section 3 hidden - internal engine only) */}
          <div className="flex gap-2">
            {[
              { s: 1, arabic: 'المجموعة الأولى' },
              { s: 2, arabic: 'المجموعة الثانية' },
            ].map(({ s, arabic }) => (
              <button key={s} onClick={() => setActiveSection(s)}
                className="flex-1 py-2.5 px-2 rounded-xl font-inter font-bold text-sm flex flex-col items-center gap-0.5"
                style={{
                  background: activeSection === s ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${activeSection === s ? 'rgba(212,175,55,0.65)' : 'rgba(255,255,255,0.12)'}`,
                  color: activeSection === s ? '#F5D060' : 'rgba(255,255,255,0.40)',
                  boxShadow: activeSection === s ? '0 0 20px rgba(212,175,55,0.20)' : 'none',
                }}>
                <span className="font-amiri text-sm">{arabic}</span>
                <span className="font-inter text-[9px] uppercase tracking-widest">SECTION {s}</span>
              </button>
            ))}
          </div>

          <MizaanInputCard
            inputMode={inputMode} setInputMode={setInputMode}
            input={input} setInput={setInput}
            directNumber={directNumber} setDirectNumber={setDirectNumber}
            loading={loading} progress={progress}
            onAnalyze={handleAnalyze} onClear={handleClear}
            hasResult={!!result}
          />

          {/* 9 Mizaans (same as Method 1/2) */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div key={`mizaan-9-method3`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-2">

                <Mizaan1 result={result} inputMode={inputMode} />
                <MizaanDivider />
                <Mizaan2
                  dominant={result.dominant}
                  tiebreak={result.tiebreak}
                  selected={selections.elements}
                  onChange={updateSel("elements")}
                  elementsData={ds.elements}
                />
                <MizaanDivider />
                <Mizaan3
                  dominant={result.dominant}
                  selected={selections.dayNight}
                  onChange={updateSel("dayNight")}
                  dayNightData={ds.dayNight}
                />
                <MizaanDivider />
                <Mizaan4
                  selected={selections.hour}
                  onChange={updateSel("hour")}
                  hoursData={ds.hours}
                  dayNight={selections.dayNight}
                />
                <MizaanDivider />
                <Mizaan5
                  selected={selections.days}
                  onChange={updateSel("days")}
                  daysData={ds.days}
                />
                <MizaanDivider />
                <Mizaan6
                  selectedDay={selections.days}
                  selected={selections.planet}
                  onChange={updateSel("planet")}
                  planetsData={ds.planets}
                />
                <MizaanDivider />
                <Mizaan7
                  selected={selections.purposes}
                  onChange={updateSel("purposes")}
                  customPurpose={customPurpose}
                  onCustomPurpose={setCustomPurpose}
                  purposesData={ds.purposes}
                  onPurposeResolved={handlePurposeResolved}
                />
                <MizaanDivider />
                <Mizaan8
                  selected={selections.khayrSharr8}
                  onChange={updateSel("khayrSharr8")}
                  selectedPurpose={selections.purposes}
                  khayrSharr8Data={ds.khayrSharr8}
                />
                <MizaanDivider />
                <Mizaan9Final result={result} selections={selections} degreeSels={degreeSels} onDegreeSels={setDegreeSels} degrees9Data={ds.degrees} />
                <MizaanDivider />
                <MizaanFinalSummary result={result} selections={selections} degreeSels={degreeSels} inputText={input} customPurpose={customPurpose} ds={ds} calcCustomBast={(t) => calcCustomBastForSection(t, activeSection)} />
                <MizaanDivider />

                {/* Method 3: Esma-i Kitabet identical to Method 1/2 — A'van onward uses the Method 3 formula */}
                {(() => {
                  const { grandBast, grandLetters } = computeGrandTotals(result, selections, degreeSels, input, customPurpose, ds, activeSection);
                  const dominant = effectiveDominant;
                  if (!grandBast || grandBast <= 0) return null;

                  // Identical pipeline call as Method 1/2 Section 1 — Esma-i Kitabet
                  const section1 = runMizaanPostPipeline({ grandBast, grandLetters, dominant, getBastLevelFn });
                  const s1Vefk   = section1?.vefk || null;
                  const s1Source = section1?.vefkSourceNumber || null;

                  // Last (remainder-completed) Esma-i Kitabet name — same algorithm as MizaanPipelineFull
                  const { names: kitabetNames, originalNames: kitabetOriginalNames } = deriveKitabetNames(section1?.initialSeedLetters, dominant, getBastLevelFn);
                  // METHOD 3 RULE: Use ORIGINAL name (before supplementation) for calculation
                  const lastOriginalKitabetName = kitabetOriginalNames.length ? kitabetOriginalNames[kitabetOriginalNames.length - 1] : "";
                  const lastNameBast    = [...lastOriginalKitabetName].reduce((s, l) => s + (getBastLevelFn(l, 1) || 0), 0);
                  const galibAnasirBast = GALIB_ANASIR_VALUES[dominant] || GALIB_ANASIR_VALUES.fire;
                  const nineMizanTotal  = grandBast + grandLetters;
                  // SECTION 1 — Esma-i Kitabet formula box Result
                  const kitabetInputTotal = lastNameBast + galibAnasirBast + nineMizanTotal;
                  // SECTION 2 — Esma-i A'van formula box Result (uses the original Nine Mizan Total)
                  const avanInputTotal = lastNameBast + galibAnasirBast + nineMizanTotal;

                  // Method 3 A'van pipeline — same engine as Method 2, seeded by the A'van Input Total
                  const avanPipeline = avanInputTotal > 0
                    ? runMizaanPostPipeline({ grandBast: avanInputTotal, grandLetters: 0, dominant, getBastLevelFn })
                    : null;
                  const avanExpandedLetters = avanPipeline?.allExpandedLetters || [];

                  // SECTION 3 — Esma-i Kasem input: Last A'van Name First Bast + Galib Anasir First Bast + A'van Input Total
                  const { names: avanNames, originalNames: avanOriginalNames, leftoverLetters: avanLeftoverLetters, hasRemainder: avanHasRemainder } = deriveAvanNames(avanPipeline?.initialSeedLetters, getBastLevelFn);
                  // METHOD 3 RULE (A'van → Kasem handoff):
                  // - Final group COMPLETE (no remainder) → use that final complete original name.
                  // - Incomplete remainder → use ONLY the leftover original letters (before display
                  //   completion). The padded display name is NEVER used as Kasem input.
                  const kasemSourceName = avanHasRemainder
                    ? avanLeftoverLetters.join("")
                    : (avanOriginalNames.length ? avanOriginalNames[avanOriginalNames.length - 1] : "");
                  const lastOriginalAvanName = kasemSourceName;
                  const lastAvanNameBast = [...kasemSourceName].reduce((s, l) => s + (getBastLevelFn(l, 1) || 0), 0);
                  const kasemInputTotal  = lastAvanNameBast + galibAnasirBast + avanInputTotal;

                  return (
                    <>
                      {/* ═══ SAME AS METHOD 1/2: Esma-i Kitabet — identical pipeline, no extra formula box ═══ */}
                      <MizaanPipelineFull grandBast={grandBast} grandLetters={grandLetters} dominant={dominant} onVefkReady={setS1VefkData} getBastLevelFn={getBastLevelFn} />

                      {/* ═══ METHOD 3 — Esma-i Kitabet completed output (display only, feeds A'van below) ═══ */}
                      <Method3KitabetSummary
                        kitabetName={lastOriginalKitabetName}
                        lastNameBast={lastNameBast}
                        galibAnasirBast={galibAnasirBast}
                        nineMizanTotal={nineMizanTotal}
                        resultTotal={kitabetInputTotal}
                        elementColor={{ fire: "#FF6B35", earth: "#A5C880", air: "#B2EBF2", water: "#4FC3F7" }[dominant] || "#FF6B35"}
                      />

                      {/* ═══ METHOD 3 FORMULA: Esma-i A'van starting value replaced ═══ */}
                      <Method3AvanSection
                        kitabetNames={kitabetNames}
                        kitabetOriginalNames={kitabetOriginalNames}
                        dominant={dominant}
                        nineMizanTotal={nineMizanTotal}
                        onVefkReady={setS2VefkData}
                        getBastLevelFn={getBastLevelFn}
                      />

                      {/* ═══ METHOD 3 FORMULA: Esma-i Kasem starting value replaced ═══ */}
                      {kasemInputTotal > 0 && (
                        <EsmaKasemSection
                          section2ExpandedLetters={[]}
                          sourceOverride={kasemInputTotal}
                          sourceBreakdown={{ lastName: lastOriginalAvanName, lastNameBast: lastAvanNameBast, galibAnasirBast, previousAvanInputTotal: avanInputTotal }}
                          dominant={dominant}
                          onVefkReady={setS3VefkData}
                          getBastLevelFn={getBastLevelFn}
                        />
                      )}

                      {/* ═══ SECTION 4 — Final Total Derivation ═══ */}
                      <Method3FinalTotalSection
                        nineMizanTotal={nineMizanTotal}
                        kitabetInputTotal={kitabetInputTotal}
                        kasemInputTotal={kasemInputTotal}
                      />

                      {/* ═══ FINAL VERIFICATION — Abjad Kabir (no further pipeline) ═══ */}
                      {/* Reports its computed Abjad Kabir total upward via onAbjadTotalReady —      */}
                      {/* the lookup below uses THIS SAME reported value, never a recomputed one,     */}
                      {/* so the verification display and the search filter are structurally identical. */}
                      <Method3AbjadVerificationSection
                        finalTotal={nineMizanTotal + kitabetInputTotal + kasemInputTotal}
                        onAbjadTotalReady={setMethod3AbjadTotal}
                      />

                      {/* ═══ DIVINE NAMES LOOKUP — Asma-ul Husna match by Abjad Kabir (lookup only) ═══ */}
                      <Method3DivineNamesMatchSection
                        abjadTotal={method3AbjadTotal}
                        intentionText={input}
                      />

                      <MizaanDivider />

                      {/* ═══ FINAL SUMMARY: THREE VEFKS (display only) ═══ */}
                      <FinalVefkSummary
                        s1Vefk={s1VefkData?.vefk || s1Vefk}
                        s1Source={s1VefkData?.source || s1Source}
                        s1Names={s1VefkData?.names || []}
                        s2Vefk={s2VefkData?.vefk || null}
                        s2Source={s2VefkData?.source || null}
                        s2Names={s2VefkData?.names || []}
                        s3Vefk={s3VefkData?.vefk || null}
                        s3Source={s3VefkData?.source || null}
                        s3Names={s3VefkData?.names || []}
                        s3BorderLetters={s3VefkData?.borderLetters || ""}
                        dominant={dominant}
                      />

                      <MizaanDivider />
                      <Method3ConclusionAccordion />
                    </>
                  );
                })()}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Method 4 Content — Nine Mizan identical to Methods 1-3, then Method 4's own Step 1 pipeline */}
      {activeMethod === 4 && (
        <div>
          {/* Section 1 / Section 2 Toggle (Section 3 hidden - internal engine only) */}
          <div className="flex gap-2">
            {[
              { s: 1, arabic: 'المجموعة الأولى' },
              { s: 2, arabic: 'المجموعة الثانية' },
            ].map(({ s, arabic }) => (
              <button key={s} onClick={() => setActiveSection(s)}
                className="flex-1 py-2.5 px-2 rounded-xl font-inter font-bold text-sm flex flex-col items-center gap-0.5"
                style={{
                  background: activeSection === s ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${activeSection === s ? 'rgba(212,175,55,0.65)' : 'rgba(255,255,255,0.12)'}`,
                  color: activeSection === s ? '#F5D060' : 'rgba(255,255,255,0.40)',
                  boxShadow: activeSection === s ? '0 0 20px rgba(212,175,55,0.20)' : 'none',
                }}>
                <span className="font-amiri text-sm">{arabic}</span>
                <span className="font-inter text-[9px] uppercase tracking-widest">SECTION {s}</span>
              </button>
            ))}
          </div>

          <MizaanInputCard
            inputMode={inputMode} setInputMode={setInputMode}
            input={input} setInput={setInput}
            directNumber={directNumber} setDirectNumber={setDirectNumber}
            loading={loading} progress={progress}
            onAnalyze={handleAnalyze} onClear={handleClear}
            hasResult={!!result}
          />

          {/* 9 Mizaans (same as Method 1/2/3) */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div key={`mizaan-9-method4`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-2">

                <Mizaan1 result={result} inputMode={inputMode} />
                <MizaanDivider />
                <Mizaan2
                  dominant={result.dominant}
                  tiebreak={result.tiebreak}
                  selected={selections.elements}
                  onChange={updateSel("elements")}
                  elementsData={ds.elements}
                />
                <MizaanDivider />
                <Mizaan3
                  dominant={result.dominant}
                  selected={selections.dayNight}
                  onChange={updateSel("dayNight")}
                  dayNightData={ds.dayNight}
                />
                <MizaanDivider />
                <Mizaan4
                  selected={selections.hour}
                  onChange={updateSel("hour")}
                  hoursData={ds.hours}
                  dayNight={selections.dayNight}
                />
                <MizaanDivider />
                <Mizaan5
                  selected={selections.days}
                  onChange={updateSel("days")}
                  daysData={ds.days}
                />
                <MizaanDivider />
                <Mizaan6
                  selectedDay={selections.days}
                  selected={selections.planet}
                  onChange={updateSel("planet")}
                  planetsData={ds.planets}
                />
                <MizaanDivider />
                <Mizaan7
                  selected={selections.purposes}
                  onChange={updateSel("purposes")}
                  customPurpose={customPurpose}
                  onCustomPurpose={setCustomPurpose}
                  purposesData={ds.purposes}
                  onPurposeResolved={handlePurposeResolved}
                />
                <MizaanDivider />
                <Mizaan8
                  selected={selections.khayrSharr8}
                  onChange={updateSel("khayrSharr8")}
                  selectedPurpose={selections.purposes}
                  khayrSharr8Data={ds.khayrSharr8}
                />
                <MizaanDivider />
                <Mizaan9Final result={result} selections={selections} degreeSels={degreeSels} onDegreeSels={setDegreeSels} degrees9Data={ds.degrees} />
                <MizaanDivider />
                <MizaanFinalSummary result={result} selections={selections} degreeSels={degreeSels} inputText={input} customPurpose={customPurpose} ds={ds} calcCustomBast={(t) => calcCustomBastForSection(t, activeSection)} />
                <MizaanDivider />

                {/* Method 4 — Step 1 ONLY: Nine Mizan Total → Istintak → Bast Expansion. Stops here. */}
                {(() => {
                  const { grandBast, grandLetters } = computeGrandTotals(result, selections, degreeSels, input, customPurpose, ds, activeSection);
                  if (!grandBast || grandBast <= 0) return null;
                  const nineMizanTotal = grandBast + grandLetters;
                  return (
                    <Method4Step1Section nineMizanTotal={nineMizanTotal} dominant={effectiveDominant} getBastLevelFn={getBastLevelFn} />
                  );
                })()}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── RITUAL DECISION ENGINE — Configuration Advisor + Expert Panel (restored from original) ── */}
      {result && activeMethod !== 5 && (
        <RitualDecisionEngine
          result={result}
          selections={selections}
          customPurpose={customPurpose}
          activeMethod={activeMethod}
          purposeLookup={resolvedPurpose}
          onApplySelections={(patch) => setSelections(prev => ({ ...prev, ...patch }))}
        />
      )}

      {/* ── QASAM / RECITATION PANEL — Read-only, below Timing/Ritual Engine ── */}
      {result && activeMethod !== 5 && (
        <QasamPanel selections={selections} />
      )}

      {/* Method 5 Placeholder */}
      {activeMethod === 5 && (
        <div className="rounded-2xl border p-8 text-center" style={{
          background: "rgba(212,175,55,0.06)",
          borderColor: "rgba(212,175,55,0.30)",
        }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
            background: "rgba(212,175,55,0.14)",
            border: "1px solid rgba(212,175,55,0.40)",
          }}>
            <span className="font-amiri text-2xl" style={{ color: "#F5D060" }}>⚖</span>
          </div>
          <h2 className="font-inter text-lg font-bold text-white mb-2">Method {activeMethod}</h2>
          <p className="font-inter text-sm text-white/40 mb-4">Reserved for future Mizan calculation system</p>
          <p className="font-inter text-xs text-white/30">This method will be implemented when rules are provided</p>
        </div>
      )}
        </>
        )}
      </div>
    </PageLayout>
  );
}