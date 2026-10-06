import { useState, useMemo, useReducer, useTransition, useCallback, memo } from "react";
import { motion } from "framer-motion";
import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";

// ── Engine & data ────────────────────────────────────────────────
import {
  PLANETS, ELEMENTS, SIZE_PLANET_MAP, PLANET_EN,
  isCompatible, compatibleSizes,
  computeUsurper, generateSquare, verifySquare, toArabicIndic,
  buildHierarchy,
} from "../components/magicsqayer/msEngine";

// ── Display components ───────────────────────────────────────────
import MsHierarchyTable from "../components/magicsqayer/MsHierarchyTable";
import MsLetterTables   from "../components/magicsqayer/MsLetterTables";
import MsQasam, { WEEKDAY_ULVI, WEEKDAY_SUFLI, ARABIC_WEEKDAYS, generateGuardianName } from "../components/magicsqayer/MsQasam";
import MsEsmaulAvanCard from "../components/magicsqayer/MsEsmaulAvanCard";
import MsMainGuardianCard from "../components/magicsqayer/MsMainGuardianCard";
import MsWeekdayUlviCard from "../components/magicsqayer/MsWeekdayUlviCard";
import MsWeekdaySufliCard from "../components/magicsqayer/MsWeekdaySufliCard";
import MsWeekdayEditor from "../components/magicsqayer/MsWeekdayEditor";
import MsPlanetReport   from "../components/magicsqayer/MsPlanetReport";
import SecondSquare     from "../components/magicsqayer/SecondSquare";
import { Trash2, ChevronRight } from "lucide-react";

// ── Labels ───────────────────────────────────────────────────────
import LABELS from "../components/magicsqayer/msLabels";
import { perfStore } from "../components/magicsqayer/perfStore";

// ── Theme ────────────────────────────────────────────────────────
const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  glowHi:   "rgba(212,175,55,0.55)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  border:   "rgba(212,175,55,0.40)",
};

// ── Grid size list (3–16 per book) ────────────────────────────────
const GRID_SIZES = [
  { label:"3×3",  value:3  },
  { label:"4×4",  value:4  },
  { label:"5×5",  value:5  },
  { label:"6×6",  value:6  },
  { label:"7×7",  value:7  },
  { label:"8×8",  value:8  },
  { label:"9×9",  value:9  },
  { label:"10×10",value:10 },
  { label:"11×11",value:11 },
  { label:"12×12",value:12 },
  { label:"13×13",value:13 },
  { label:"14×14",value:14 },
  { label:"15×15",value:15 },
  { label:"16×16",value:16 },
];

// ─────────────────────────────────────────────────────────────────
//  SHARED UI ATOMS
// ─────────────────────────────────────────────────────────────────
function SectionCard({ children }) {
  return (
    <div className="rounded-2xl border p-4 space-y-3"
      style={{ background:"linear-gradient(145deg,rgba(8,16,38,0.98) 0%,rgba(4,10,24,0.99) 100%)", borderColor:"rgba(212,175,55,0.22)", boxShadow:"0 4px 32px rgba(0,0,0,0.55),inset 0 1px 0 rgba(212,175,55,0.08)" }}>
      {children}
    </div>
  );
}

function SLabel({ children }) {
  return (
    <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.dim }}>
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────
//  PLANET CARD (inline, no dependency on report panel)
// ─────────────────────────────────────────────────────────────────
function PlanetCard({ gridSize, lang, L }) {
  const planetKey = SIZE_PLANET_MAP[gridSize];
  const pl = PLANETS.find(p => p.key === planetKey);
  if (!pl) return null;
  const name = lang === "en" ? PLANET_EN[planetKey] : pl.arabic;
  return (
    <motion.div key={gridSize} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }}
      className="rounded-2xl border p-4 flex items-center gap-4"
      style={{ background:"rgba(4,8,24,0.99)", borderColor: pl.border, boxShadow:`0 0 28px ${pl.glow}` }}>
      <motion.span style={{ fontSize:"2.2rem", flexShrink:0 }}
        animate={{ textShadow:[`0 0 12px ${pl.glow}`,`0 0 28px ${pl.color}`,`0 0 12px ${pl.glow}`] }}
        transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut" }}>
        {pl.icon}
      </motion.span>
      <div className="flex-1 min-w-0">
        <p className="font-inter text-[9px] uppercase tracking-widest mb-0.5" style={{ color:"rgba(212,175,55,0.40)" }}>{L.planet}</p>
        <motion.p className="font-amiri text-2xl font-bold leading-tight" dir="rtl" style={{ color: pl.color }}
          animate={{ textShadow:[`0 0 10px ${pl.glow}`,`0 0 24px ${pl.color}88`,`0 0 10px ${pl.glow}`] }}
          transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut" }}>
          {pl.arabic}
        </motion.p>
        <p className="font-inter text-[10px] tracking-widest uppercase mt-0.5" style={{ color:`${pl.color}99` }}>{name}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color:"rgba(212,175,55,0.30)" }}>Square</p>
        <p className="font-amiri text-lg font-bold" style={{ color: G.dim }}>{gridSize}×{gridSize}</p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  COMPATIBILITY NOTICE
// ─────────────────────────────────────────────────────────────────
function CompatNotice({ mc, gridSize, lang, L, onSelectSize }) {
  if (!mc || !gridSize || isCompatible(mc, gridSize)) return null;
  const compat = compatibleSizes(mc);
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
      className="rounded-2xl border p-4 space-y-3"
      style={{ background:"rgba(4,8,24,0.99)", borderColor:"rgba(255,80,80,0.45)", boxShadow:"0 0 24px rgba(255,80,80,0.12)" }}>
      <p className="font-inter text-[10px] uppercase tracking-widest text-center" style={{ color:"rgba(255,140,140,0.85)" }}>
        {L.incompatible}
      </p>
      {compat.length > 0 && (
        <>
          <p className="font-inter text-[9px] uppercase tracking-widest text-center" style={{ color:"rgba(255,255,255,0.35)" }}>
            {L.compatSizes}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {compat.map(s => (
              <motion.button key={s} whileTap={{ scale:0.95 }} onClick={() => onSelectSize(s)}
                className="rounded-xl px-4 py-2 font-inter font-bold text-xs border"
                style={{ background:"rgba(100,220,100,0.10)", borderColor:"rgba(100,220,100,0.40)", color:"rgba(100,220,100,0.90)" }}>
                {s}×{s}
              </motion.button>
            ))}
          </div>
        </>
      )}
      {compat.length === 0 && (
        <p className="font-inter text-[9px] text-center" style={{ color:"rgba(255,255,255,0.30)" }}>
          No compatible sizes found for MC={mc}
        </p>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  SACRED GRID — memoized, no per-cell framer-motion
// ─────────────────────────────────────────────────────────────────
const SacredGrid = memo(function SacredGrid({ gridSize, element, grid, lang, L }) {
  const gridData = grid?.grid;
  const elMeta = useMemo(() => ELEMENTS.find(e => e.key === element), [element]);

  // Memoize expensive flat + verify — only recomputes when grid data changes
  const { flat, v, fontSize } = useMemo(() => {
    if (!gridData) return { flat: null, v: null, fontSize: "16px" };
    const t0 = performance.now();
    const flat = gridData.flat();
    const v = verifySquare(gridData);
    const fontSize = gridSize >= 14 ? "9px" : gridSize >= 10 ? "10px" : gridSize >= 8 ? "11px" : gridSize >= 6 ? "13px" : "16px";
    perfStore.set("gridFlatVerify", parseFloat((performance.now()-t0).toFixed(2)));
    return { flat, v, fontSize };
  }, [gridData, gridSize]);

  if (grid?.incompatible) return (
    <div className="rounded-2xl border p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
      style={{ background:"rgba(4,8,24,0.99)", borderColor:"rgba(255,80,80,0.45)" }}>
      <motion.span className="text-3xl" animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:2, repeat:Infinity }}>⚠️</motion.span>
      <p className="font-inter text-[10px] uppercase tracking-widest text-center" style={{ color:"rgba(255,140,140,0.85)" }}>{L.incompatible}</p>
    </div>
  );

  if (!gridData || !flat) return (
    <div className="rounded-2xl border p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]"
      style={{ background:"rgba(4,8,24,0.99)", borderColor: G.borderHi, boxShadow:`0 0 40px ${G.glow}` }}>
      <motion.span className="font-amiri text-4xl" style={{ color:"rgba(212,175,55,0.25)" }}
        animate={{ opacity:[0.2,0.5,0.2] }} transition={{ duration:3, repeat:Infinity }}>🜂</motion.span>
      <p className="font-inter text-[10px] uppercase tracking-widest text-center" style={{ color:"rgba(212,175,55,0.25)" }}>
        {gridSize ? `${gridSize}×${gridSize} — Enter number & generate` : "Select grid size to begin"}
      </p>
      <p className="font-amiri text-sm" style={{ color:"rgba(212,175,55,0.20)" }} dir="rtl">المربع السحري</p>
    </div>
  );

  return (
    <motion.div key={`grid-${gridSize}-${element}`}
      initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.2 }}
      className="rounded-2xl border p-4 space-y-4"
      style={{ background:"rgba(4,8,24,0.99)", borderColor: G.borderHi, boxShadow:`0 0 40px ${G.glow}` }}>

      {/* Header */}
      <div className="text-center space-y-1">
        <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.dim }}>
          🜂 Sacred Vefk {gridSize}×{gridSize}
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {elMeta && <span>{elMeta.icon}</span>}
          {elMeta && <span className="font-amiri text-sm" style={{ color:elMeta.color }}>{elMeta.arabic}</span>}
          {elMeta && <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color:"rgba(212,175,55,0.35)" }}>
            · {lang==="en" ? elMeta.english : elMeta.arabic}
          </span>}
        </div>
      </div>

      {/* Grid cells — plain divs, no per-cell animation (container already animates) */}
      <div className="rounded-xl border overflow-hidden" style={{ background:"rgba(4,12,34,0.97)", borderColor:"rgba(212,175,55,0.15)" }}>
        <div style={{ overflowX:"auto", padding:"6px" }}>
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${gridSize},1fr)`, gap:"2px", minWidth: gridSize > 9 ? `${gridSize * 32}px` : "100%" }}>
            {flat.map((num, idx) => (
              <div key={idx}
                className="rounded border flex items-center justify-center font-amiri font-bold"
                style={{ aspectRatio:"1/1", minWidth:0, background:"linear-gradient(145deg,rgba(212,175,55,0.14) 0%,rgba(212,175,55,0.06) 100%)", borderColor:"rgba(212,175,55,0.35)", color: G.text, fontSize }}>
                {lang === "ar" ? toArabicIndic(num) : num}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verification */}
      <div className="rounded-xl border p-3 space-y-2"
        style={{ background:"rgba(212,175,55,0.04)", borderColor: v.valid ? "rgba(100,220,100,0.35)" : "rgba(255,80,80,0.40)" }}>
        <p className="font-inter text-[9px] uppercase tracking-widest text-center" style={{ color: G.dim }}>
          {L.verification} — {L.mcLabel}: <span style={{ color:G.text }}>{lang === "ar" ? toArabicIndic(v.mc.toLocaleString()) : v.mc.toLocaleString()}</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: L.rows,   ok: v.rowOk },
            { label: L.columns,ok: v.colOk },
            { label: L.diag1,  ok: v.d1Ok  },
            { label: L.diag2,  ok: v.d2Ok  },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-2 rounded-lg px-3 py-1.5"
              style={{ background: ok ? "rgba(100,220,100,0.08)" : "rgba(255,80,80,0.08)", border:`1px solid ${ok ? "rgba(100,220,100,0.25)" : "rgba(255,80,80,0.25)"}` }}>
              <span style={{ fontSize:"11px" }}>{ok ? "✅" : "❌"}</span>
              <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: ok ? "rgba(120,230,120,0.90)" : "rgba(255,120,120,0.90)" }}>{label}</span>
            </div>
          ))}
        </div>
        {v.valid && (
          <p className="font-inter text-[8px] uppercase tracking-widest text-center" style={{ color:"rgba(100,220,100,0.65)" }}>
            {L.trueSquare} — {v.mc.toLocaleString()}
          </p>
        )}
      </div>
    </motion.div>
  );
});

// ── Batch state reducer — one setState = one render ──────────────
function msReducer(state, action) {
  switch (action.type) {
    case "SET_NUMBER": return { ...state, inputNum: action.val, grid: action.grid };
    case "SET_SUFFIX": return { ...state, suffix: action.mode }; // grid unchanged
    case "SET_SIZE":   return { ...state, gridSize: action.size, grid: action.grid };
    case "SET_ELEMENT":return { ...state, element: action.el, grid: action.grid };
    case "SET_GRID":   return { ...state, grid: action.grid };
    case "SET_LANG":   return { ...state, lang: action.lang };
    default: return state;
  }
}

// ═════════════════════════════════════════════════════════════════
//  SECOND SQUARE DISPLAY COMPONENT
// ═════════════════════════════════════════════════════════════════
function SecondSquareDisplay({ gridSize, grid, revealedCount, lang, onNext, onClear, canRevealNext }) {
  return (
    <div className="space-y-3">
      {/* Second Square */}
      <SecondSquare gridSize={gridSize} originalGrid={grid.grid} revealedCount={revealedCount} lang={lang} />
      
      {/* Buttons */}
      <div className="flex gap-2">
        <motion.button
          onClick={onClear}
          disabled={revealedCount === 0}
          whileHover={{ scale: revealedCount === 0 ? 1 : 1.02 }}
          whileTap={{ scale: revealedCount === 0 ? 1 : 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-inter font-bold text-sm border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ 
            background: "rgba(255,255,255,0.03)", 
            borderColor: "rgba(255,255,255,0.12)", 
            color: "rgba(255,255,255,0.55)" 
          }}>
          <Trash2 className="w-3.5 h-3.5" />
          CLEAR
        </motion.button>
        
        <motion.button
          onClick={onNext}
          disabled={!canRevealNext}
          whileHover={{ scale: canRevealNext ? 1.02 : 1 }}
          whileTap={{ scale: canRevealNext ? 0.97 : 1 }}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-inter font-bold text-sm text-[#0d1b2a] disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ 
            background: canRevealNext 
              ? "linear-gradient(135deg,#f6d860 0%,#e0a820 50%,#c98a14 100%)" 
              : "rgba(212,175,55,0.10)",
            boxShadow: canRevealNext ? "0 0 32px rgba(212,175,55,0.55)" : "none" 
          }}>
          <ChevronRight className="w-4 h-4" />
          NEXT
        </motion.button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
//  PAGE
// ═════════════════════════════════════════════════════════════════
export default function MagicSqayerPage() {
  const [state, dispatch] = useReducer(msReducer, {
    lang: "ar", inputNum: "", suffix: "ar-angel",
    gridSize: null, element: null, grid: null,
  });
  const { lang, inputNum, suffix, gridSize, element, grid } = state;

  // ── Second Square state (completely isolated) ───────────────────
  const [revealedCount, setRevealedCount] = useState(0);

  // ── Day selector & per-weekday overrides ─────────────────────────
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());
  const [weekdayOverrides, setWeekdayOverrides] = useState({});
  const [showWeekdayEditor, setShowWeekdayEditor] = useState(false);
  const weekdayUlvi = weekdayOverrides[selectedDayIndex]?.ulvi || WEEKDAY_ULVI[selectedDayIndex];
  const weekdaySufli = weekdayOverrides[selectedDayIndex]?.sufli || WEEKDAY_SUFLI[selectedDayIndex];

  // useTransition: heavy renders (grid/hierarchy) are interruptible — button feels instant
  const [, startTransition] = useTransition();

  const L = useMemo(() => LABELS[lang], [lang]);

  // ── Raw number = Magic Constant. Suffix NEVER changes this. ──
  const rawNum = useMemo(() => { const n = parseInt(inputNum); return isNaN(n) ? null : n; }, [inputNum]);
  const squareMC = rawNum; // MC is always the raw input — suffix only affects name generation

  // ── Compatible sizes — expensive, memoized ────────────────────
  const compatSizes = useMemo(() => squareMC ? compatibleSizes(squareMC) : [], [squareMC]);

  // ── Per-button compatibility map — avoids 14 calls per render ─
  const compatMap = useMemo(() => {
    if (!squareMC) return {};
    return Object.fromEntries(GRID_SIZES.map(gs => [gs.value, isCompatible(squareMC, gs.value)]));
  }, [squareMC]);

  // ── Main Guardian — computed from hierarchy + suffix ──────────
  const mainGuardian = useMemo(() => {
    if (!squareMC || !gridSize) return null;
    const hier = buildHierarchy(squareMC, gridSize);
    if (!hier) return null;
    return generateGuardianName(hier.adjuster, suffix);
  }, [squareMC, gridSize, suffix]);

  // ── Build grid (pure fn, no side-effects) ─────────────────────
  const buildGrid = useCallback((mc, size, el) => {
    if (!mc || !size) return null;
    if (!isCompatible(mc, size)) return { incompatible: true };
    const usurper = computeUsurper(mc, size);
    if (!usurper || usurper < 1) return { incompatible: true };
    const e = el || "fire";
    const t0 = performance.now();
    const result = { grid: generateSquare(size, usurper, e), usurper };
    perfStore.set("generateSquare", parseFloat((performance.now()-t0).toFixed(2)));
    return result;
  }, []);

  // ── Handlers — all use squareMC (rawNum) for grid construction ─
  const handleNumber = useCallback((e) => {
    const val = e.target.value.replace(/[^\d]/g, "");
    const mc = parseInt(val) || null;
    dispatch({ type: "SET_NUMBER", val, grid: state.grid });
    startTransition(() => {
      dispatch({ type: "SET_NUMBER", val, grid: mc ? buildGrid(mc, gridSize, element) : null });
    });
  }, [gridSize, element, state.grid, buildGrid]);

  // Suffix only changes name display — never rebuilds the grid
  const handleSuffix = useCallback((mode) => {
    dispatch({ type: "SET_SUFFIX", mode, grid: state.grid });
  }, [state.grid]);

  const handleSize = useCallback((size) => {
    perfStore.clear();
    const t0 = performance.now();
    const ns = gridSize === size ? null : size;
    dispatch({ type: "SET_SIZE", size: ns, grid: null });
    startTransition(() => {
      const g = buildGrid(squareMC, ns, element);
      perfStore.set("gridClickTotal", parseFloat((performance.now()-t0).toFixed(2)));
      dispatch({ type: "SET_SIZE", size: ns, grid: g });
    });
  }, [gridSize, squareMC, element, buildGrid]);

  const handleElement = useCallback((key) => {
    const ne = element === key ? null : key;
    startTransition(() => {
      dispatch({ type: "SET_ELEMENT", el: ne, grid: buildGrid(squareMC, gridSize, ne) });
    });
  }, [element, squareMC, gridSize, buildGrid]);

  const handleCompatSelect = useCallback((size) => {
    startTransition(() => {
      dispatch({ type: "SET_SIZE", size, grid: buildGrid(squareMC, size, element) });
    });
  }, [squareMC, element, buildGrid]);

  const handleGenerate = useCallback(() => {
    startTransition(() => {
      dispatch({ type: "SET_GRID", grid: buildGrid(squareMC, gridSize, element) });
    });
  }, [squareMC, gridSize, element, buildGrid]);

  // ── Second Square handlers (isolated) ───────────────────────────
  const handleNext = useCallback(() => {
    if (grid && !grid.incompatible) {
      const totalCells = gridSize * gridSize;
      setRevealedCount(prev => Math.min(prev + 1, totalCells));
    }
  }, [grid, gridSize]);

  const handleClear = useCallback(() => {
    setRevealedCount(0);
  }, []);

  const canGenerate = !!inputNum && !!gridSize;
  const gridReady = grid && !grid.incompatible && squareMC && gridSize;
  const canRevealNext = gridReady && revealedCount < (gridSize * gridSize);

  // ── Suffix options (name-only — never affects MC or grid) ──────
  const suffixOpts = [
    { key:"ar-angel",  label: L.suffixArAngel,  color: "#4FE3FF",  borderActive: "rgba(79,227,255,0.55)" },
    { key:"ar-jinn",   label: L.suffixArJinn,   color: "#FF9F5A",  borderActive: "rgba(255,159,90,0.55)"  },
    { key:"ar-sufli-hadim", label: L.suffixSufliHadim, color: "#34D399", borderActive: "rgba(52,211,153,0.55)" },
    { key:"heb-angel", label: L.suffixHebAngel, color: "#C4B5FD",  borderActive: "rgba(196,181,253,0.55)" },
    { key:"heb-jinn",  label: L.suffixHebJinn,  color: "#F9A8D4",  borderActive: "rgba(249,168,212,0.55)" },
  ];

  // ── Lang options ───────────────────────────────────────────────
  const langOpts = [
    { id:"en", flag:"🇺🇸", label:"English"  },
    { id:"ar", flag:"🇸🇦", label:"العربية"  },
  ];

  return (
    <PageLayout>
      <div className="space-y-4" dir={lang === "ar" ? "rtl" : "ltr"}>

        {/* Header */}
        <PageTitle arabic="السحر المربع" latin="Magic Sqayer" subtitle="Sacred Vefk Construction System" icon="✨" />

        {/* Language */}
        <div className="flex gap-2 justify-center flex-wrap">
          {langOpts.map(opt => {
            const active = lang === opt.id;
            return (
              <motion.button key={opt.id} onClick={() => dispatch({ type:"SET_LANG", lang: opt.id })} whileTap={{ scale:0.96 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-inter font-bold text-xs border transition-all"
                style={{ background: active ? "rgba(212,175,55,0.15)" : "rgba(4,12,34,0.97)", borderColor: active ? G.borderHi : "rgba(255,255,255,0.10)", color: active ? G.text : "rgba(255,255,255,0.40)" }}>
                {opt.flag} {opt.label}
              </motion.button>
            );
          })}
        </div>

        {/* 1. Number Input */}
        <SectionCard>
          <SLabel>{L.baseNumber}</SLabel>
          <input
            type="text"
            value={inputNum}
            onChange={handleNumber}
            placeholder="786, 12345, ..."
            className="w-full rounded-xl px-4 py-3 font-amiri text-3xl text-center text-white font-bold focus:outline-none caret-white placeholder:text-white/30"
            style={{ background:"rgba(4,12,34,0.97)", border:`1px solid ${G.border}`, fontSize:"clamp(20px,5vw,30px)" }}
          />
          {rawNum && (
            <div className="flex justify-center">
              <span className="font-amiri font-bold text-xl" style={{ color: G.text }}>
                {L.workingMC}: {lang === "ar" ? toArabicIndic(rawNum.toLocaleString()) : rawNum.toLocaleString()}
              </span>
            </div>
          )}
        </SectionCard>

        {/* 2. Suffix System — name generation only, never affects MC/grid */}
        <SectionCard>
          <SLabel>{L.suffix}</SLabel>
          <div className="grid grid-cols-2 gap-2">
            {suffixOpts.map(opt => {
              const sel = suffix === opt.key;
              return (
                <motion.button key={opt.key} onClick={() => handleSuffix(opt.key)}
                  whileTap={{ scale:0.96 }}
                  className="rounded-xl py-2.5 px-2 font-inter font-bold text-[10px] border transition-all text-center"
                  style={{
                    background: sel ? `${opt.color}18` : "rgba(4,12,34,0.97)",
                    borderColor: sel ? opt.borderActive : "rgba(255,255,255,0.08)",
                    color: sel ? opt.color : "rgba(255,255,255,0.35)",
                  }}>
                  {opt.label}
                </motion.button>
              );
            })}
          </div>
        </SectionCard>

        {/* 3. Grid Size (3–16) */}
        <SectionCard>
          <SLabel>{L.gridSize}</SLabel>
          <div className="grid grid-cols-4 gap-2">
            {GRID_SIZES.map(gs => {
              const sel = gridSize === gs.value;
              const compat = compatMap[gs.value] ?? null;
              return (
                <motion.button key={gs.value} onClick={() => handleSize(gs.value)}
                  whileHover={{ scale: sel ? 1 : 1.04 }} whileTap={{ scale:0.95 }}
                  className="rounded-xl py-3 font-inter font-bold text-xs border transition-all relative overflow-hidden"
                  style={{
                    background: sel ? "rgba(212,175,55,0.16)" : compat ? "rgba(100,220,100,0.05)" : "rgba(4,12,34,0.97)",
                    borderColor: sel ? G.borderHi : compat ? "rgba(100,220,100,0.25)" : "rgba(255,255,255,0.08)",
                    color: sel ? G.text : compat ? "rgba(120,230,120,0.80)" : "rgba(255,255,255,0.38)",
                  }}>
                  {gs.label}
                </motion.button>
              );
            })}
          </div>
          {squareMC && (
            <p className="font-inter text-[8px] uppercase tracking-widest text-center" style={{ color:"rgba(100,220,100,0.50)" }}>
              🟢 = {L.compatible}: {compatSizes.map(s=>`${s}×${s}`).join(", ") || "none"}
            </p>
          )}
        </SectionCard>

        {/* No compatible sizes at all — show clear error */}
        {squareMC && compatSizes.length === 0 && (
          <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
            className="rounded-2xl border p-4 space-y-2"
            style={{ background:"rgba(4,8,24,0.99)", borderColor:"rgba(255,80,80,0.50)", boxShadow:"0 0 24px rgba(255,80,80,0.14)" }}>
            <p className="font-inter text-[10px] uppercase tracking-widest text-center" style={{ color:"rgba(255,140,140,0.90)" }}>
              {lang === "ar" ? "⚠️ لا يوجد مربع سحري متوافق" : "⚠️ No Compatible Magic Square"}
            </p>
            <p className="font-inter text-[9px] text-center" style={{ color:"rgba(255,255,255,0.45)" }}>
              {lang === "ar"
                ? `القيمة ${toArabicIndic(squareMC)} لا تقبل أي حجم من 3×3 إلى 16×16. جرّب رقمًا آخر.`
                : `MC = ${squareMC} is not divisible into any grid size from 3×3 to 16×16. Try a different number.`}
            </p>
          </motion.div>
        )}

        {/* Planet card */}
        {gridSize && <PlanetCard gridSize={gridSize} lang={lang} L={L} />}

        {/* Compatibility notice (size selected but incompatible) */}
        {squareMC && gridSize && !isCompatible(squareMC, gridSize) && (
          <CompatNotice mc={squareMC} gridSize={gridSize} lang={lang} L={L} onSelectSize={handleCompatSelect} />
        )}

        {/* 4. Element */}
        <SectionCard>
          <SLabel>{L.element}</SLabel>
          <div className="grid grid-cols-2 gap-2">
            {ELEMENTS.map(el => {
              const sel = element === el.key;
              return (
                <motion.button key={el.key} onClick={() => handleElement(el.key)}
                  whileHover={{ scale: sel ? 1 : 1.02 }} whileTap={{ scale:0.96 }}
                  className="rounded-xl px-3 py-3.5 flex items-center gap-2.5 border transition-all"
                  style={{ background: sel ? `linear-gradient(145deg,${el.bg} 0%,rgba(4,12,34,0.90) 100%)` : "rgba(4,12,34,0.97)", borderColor: sel ? el.border : "rgba(255,255,255,0.08)", boxShadow: sel ? `0 0 20px ${el.glow}` : "none" }}>
                  <span style={{ fontSize:"1.3rem", flexShrink:0 }}>{el.icon}</span>
                  <div className="flex flex-col items-start">
                    <span className="font-amiri text-base font-bold" dir="rtl"
                      style={{ color: sel ? el.color : "rgba(255,255,255,0.45)" }}>{el.arabic}</span>
                    <span className="font-inter text-[8px] uppercase tracking-widest"
                      style={{ color: sel ? `${el.color}88` : "rgba(255,255,255,0.20)" }}>
                      {lang==="en" ? el.english : ""}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </SectionCard>

        {/* Generate */}
        <motion.button
          disabled={!canGenerate}
          whileHover={{ scale: canGenerate ? 1.02 : 1 }}
          whileTap={{ scale: canGenerate ? 0.97 : 1 }}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-inter font-bold text-sm text-[#0d1b2a] disabled:opacity-40 disabled:cursor-not-allowed tracking-wide"
          style={{ background:"linear-gradient(135deg,#f6d860 0%,#e0a820 50%,#c98a14 100%)", boxShadow:`0 0 32px ${G.glowHi}` }}
          onClick={handleGenerate}>
          <span className="font-amiri text-base">✨</span>
          {L.generate}
        </motion.button>

        {/* Sacred Grid */}
        <SacredGrid gridSize={gridSize} element={element} grid={grid} lang={lang} L={L} />

        {/* SECOND SQUARE - Arabic Numerals Only (isolated from original) */}
        {gridReady && (
          <SecondSquareDisplay
            gridSize={gridSize}
            grid={grid}
            revealedCount={revealedCount}
            lang={lang}
            onNext={handleNext}
            onClear={handleClear}
            canRevealNext={canRevealNext}
          />
        )}

        {/* Planet Report */}
        {gridReady && (
          <MsPlanetReport mc={squareMC} gridSize={gridSize} lang={lang} L={L} />
        )}

        {/* Hierarchy Table — always shown when a number is entered; suffix only affects names */}
        {rawNum && (
          <MsHierarchyTable
            mc={rawNum}
            gridSize={gridSize}
            rawInput={rawNum}
            suffix={suffix}
            lang={lang}
            L={L}
          />
        )}

        {/* Letter Tables */}
        <MsLetterTables mc={squareMC} L={L} />

        {/* Esmaul Avan Card */}
        {gridReady && <MsEsmaulAvanCard grid={grid} />}

        {/* Selected Main Guardian Card */}
        {mainGuardian && <MsMainGuardianCard name={mainGuardian} suffix={suffix} />}

        {/* Selected Ulvi Card */}
        <MsWeekdayUlviCard name={weekdayUlvi} dayName={ARABIC_WEEKDAYS[selectedDayIndex]} />

        {/* Selected Sufli Card */}
        <MsWeekdaySufliCard name={weekdaySufli} dayName={ARABIC_WEEKDAYS[selectedDayIndex]} />

        {/* Weekday Selector */}
        <SectionCard>
          <div className="flex items-center justify-between mb-2">
            <SLabel>Weekday</SLabel>
            <motion.button
              whileTap={{ scale:0.96 }}
              onClick={() => setShowWeekdayEditor(true)}
              className="rounded-lg px-3 py-1 font-inter font-bold text-[9px] border"
              style={{
                background: "rgba(212,175,55,0.08)",
                borderColor: "rgba(212,175,55,0.25)",
                color: G.dim,
              }}>
              ✎ Edit
            </motion.button>
          </div>
          <div className="flex gap-1 overflow-x-auto scrollbar-none py-1">
            {ARABIC_WEEKDAYS.map((name, idx) => {
              const sel = selectedDayIndex === idx;
              const hasOverride = weekdayOverrides[idx]?.ulvi || weekdayOverrides[idx]?.sufli;
              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale:0.95 }}
                  onClick={() => setSelectedDayIndex(idx)}
                  className="flex-shrink-0 rounded-xl px-3 py-2 font-amiri text-sm font-bold border transition-all relative"
                  style={{
                    background: sel ? "rgba(212,175,55,0.14)" : "rgba(4,12,34,0.97)",
                    borderColor: sel ? G.borderHi : "rgba(255,255,255,0.08)",
                    color: sel ? G.text : "rgba(255,255,255,0.40)",
                  }}>
                  {name}
                  {hasOverride && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                      style={{ background: "#4FE3FF", boxShadow: "0 0 4px #4FE3FF" }} />
                  )}
                </motion.button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3 text-center">
            <div className="flex-1 rounded-lg py-1.5 px-2"
              style={{ background:"rgba(79,227,255,0.05)", border:"1px solid rgba(79,227,255,0.14)" }}>
              <p className="font-inter text-[7px] uppercase tracking-widest" style={{ color:"rgba(79,227,255,0.40)" }}>Ulvi</p>
              <p className="font-amiri text-sm font-bold" dir="rtl" style={{ color:"rgba(79,227,255,0.85)" }}>{weekdayUlvi}</p>
            </div>
            <div className="flex-1 rounded-lg py-1.5 px-2"
              style={{ background:"rgba(255,159,90,0.05)", border:"1px solid rgba(255,159,90,0.14)" }}>
              <p className="font-inter text-[7px] uppercase tracking-widest" style={{ color:"rgba(255,159,90,0.40)" }}>Sufli</p>
              <p className="font-amiri text-sm font-bold" dir="rtl" style={{ color:"rgba(255,159,90,0.85)" }}>{weekdaySufli}</p>
            </div>
          </div>
        </SectionCard>

        {/* QASAM */}
        <MsQasam
          mc={squareMC}
          gridSize={gridSize}
          grid={grid}
          suffix={suffix}
          customWeekdayName={ARABIC_WEEKDAYS[selectedDayIndex]}
          customWeekdayUlvi={weekdayUlvi}
          customWeekdaySufli={weekdaySufli}
        />

      </div>

      <MsWeekdayEditor
        open={showWeekdayEditor}
        onClose={() => setShowWeekdayEditor(false)}
        overrides={weekdayOverrides}
        selectedDay={selectedDayIndex}
        onSelectDay={setSelectedDayIndex}
        onSave={(edits) => {
          const clean = {};
          for (let i = 0; i < 7; i++) {
            const ulvi = edits[i]?.ulvi?.trim();
            const sufli = edits[i]?.sufli?.trim();
            if (ulvi || sufli) clean[i] = { ulvi: ulvi || "", sufli: sufli || "" };
          }
          setWeekdayOverrides(clean);
        }}
      />
    </PageLayout>
  );
}