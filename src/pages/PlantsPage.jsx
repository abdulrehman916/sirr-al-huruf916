// ═══════════════════════════════════════════════════════════════
// PLANTS & INGREDIENTS DICTIONARY — MAIN LIST PAGE
// Dictionary module only. Zero imports from sealed engines.
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Leaf, ArrowUpDown, ChevronRight, Trash2 } from "lucide-react";
import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";
import PullToRefresh from "../components/PullToRefresh";
import { PLANTS_DATA, PLANT_CATEGORIES } from "../lib/plantsData";

const P = {
  border:   "rgba(34,197,94,0.30)",
  borderHi: "rgba(34,197,94,0.65)",
  glow:     "rgba(34,197,94,0.18)",
  text:     "#86EFAC",
  dim:      "rgba(134,239,172,0.55)",
  faint:    "rgba(134,239,172,0.14)",
  bg:       "rgba(34,197,94,0.06)",
  bgHi:     "rgba(34,197,94,0.14)",
};

const SORT_CYCLE  = ["az", "za", "arabic"];
const SORT_LABELS = { az: "A → Z", za: "Z → A", arabic: "ع → غ" };

function sortPlants(list, sort) {
  const copy = [...list];
  if (sort === "az")     return copy.sort((a, b) => a.EnglishName.localeCompare(b.EnglishName));
  if (sort === "za")     return copy.sort((a, b) => b.EnglishName.localeCompare(a.EnglishName));
  if (sort === "arabic") return copy.sort((a, b) => a.ArabicName.localeCompare(b.ArabicName, "ar"));
  return copy;
}

function CategoryFilter({ active, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {PLANT_CATEGORIES.map((cat) => (
        <motion.button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0 px-3 py-1.5 rounded-xl border font-inter text-[10px] font-semibold uppercase tracking-widest"
          style={{
            background:   active === cat.id ? P.bgHi : "transparent",
            borderColor:  active === cat.id ? P.borderHi : P.faint,
            color:        active === cat.id ? P.text : "rgba(134,239,172,0.38)",
            boxShadow:    active === cat.id ? `0 0 14px ${P.glow}` : "none",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {cat.label}
        </motion.button>
      ))}
    </div>
  );
}

function AlphaIndex({ letters, activeLetter, onSelect }) {
  return (
    <div className="flex gap-1 flex-wrap">
      <button
        onClick={() => onSelect(null)}
        className="font-inter text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border"
        style={{
          background:  activeLetter === null ? P.bgHi : "transparent",
          borderColor: activeLetter === null ? P.borderHi : P.faint,
          color:       activeLetter === null ? P.text : "rgba(134,239,172,0.35)",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        All
      </button>
      {letters.map(l => (
        <button
          key={l}
          onClick={() => onSelect(l)}
          className="font-inter text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border"
          style={{
            background:  activeLetter === l ? P.bgHi : "transparent",
            borderColor: activeLetter === l ? P.borderHi : P.faint,
            color:       activeLetter === l ? P.text : "rgba(134,239,172,0.35)",
            WebkitTapHighlightColor: "transparent",
            minWidth: 28,
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function PlantRow({ plant, index, onOpen }) {
  const catLabel = PLANT_CATEGORIES.find(c => c.id === plant.category)?.label ?? plant.category;
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.35), duration: 0.22, ease: "easeOut" }}
      onClick={() => onOpen(plant)}
      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-left gap-3"
      style={{ background: P.bg, borderColor: P.border, WebkitTapHighlightColor: "transparent" }}
      whileTap={{ scale: 0.985 }}
    >
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-amiri font-bold text-lg leading-tight" style={{ color: P.text, textShadow: "0 0 12px rgba(134,239,172,0.20)", WebkitTextStroke: "0.3px #86EFAC" }}>
            {plant.ArabicName}
          </span>
          <span
            className="font-inter text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded-full border"
            style={{ color: P.text, borderColor: P.border, background: "rgba(134,239,172,0.10)" }}
          >
            {catLabel}
          </span>
        </div>
        <p className="font-inter text-base font-bold truncate" style={{ color: "rgba(255,255,255,0.95)", letterSpacing: "-0.3px" }}>
          {plant.EnglishName}
        </p>
        <p className="font-inter text-xs font-semibold truncate" style={{ color: "rgba(255,255,255,0.65)", letterSpacing: "-0.2px" }}>
          {plant.MalayalamName}
          {plant.ScientificName ? " · " : ""}
          {plant.ScientificName && <em className="not-italic text-[10px]">{plant.ScientificName}</em>}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: P.dim }} />
    </motion.button>
  );
}

function AlphaHeader({ letter }) {
  return (
    <div className="flex items-center gap-3 pt-2 pb-1">
      <span className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: P.dim }}>{letter}</span>
      <div className="flex-1 h-px" style={{ background: P.faint }} />
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-3">
      <Leaf className="w-10 h-10 mx-auto" style={{ color: P.dim }} />
      <p className="font-amiri text-lg" style={{ color: P.dim }}>No results found</p>
      <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>
        Try a different search term or filter
      </p>
    </motion.div>
  );
}

import { usePageState } from "../context/PageStateContext";

const PAGE_KEY = 'plants';

export default function PlantsPage() {
  const navigate = useNavigate();
  const { getPageState, setPageState, clearPageState } = usePageState();
  const initialState = getPageState(PAGE_KEY, {
    query: "",
    category: "all",
    activeLetter: null,
    sortIdx: 0,
  });
  
  const [query, setQuery] = useState(initialState.query);
  const [category, setCategory] = useState(initialState.category);
  const [activeLetter, setLetter] = useState(initialState.activeLetter);
  const [sortIdx, setSortIdx] = useState(initialState.sortIdx);
  const sort = SORT_CYCLE[sortIdx];

  useEffect(() => {
    setPageState(PAGE_KEY, { query, category, activeLetter, sortIdx });
  }, [query, category, activeLetter, sortIdx, setPageState]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = PLANTS_DATA.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (activeLetter && !p.EnglishName.toUpperCase().startsWith(activeLetter)) return false;
      if (!q) return true;
      return (
        (p.ArabicName         && p.ArabicName.includes(query.trim()))            ||
        (p.EnglishName        && p.EnglishName.toLowerCase().includes(q))        ||
        (p.MalayalamName      && p.MalayalamName.includes(query.trim()))         ||
        (p.ScientificName     && p.ScientificName.toLowerCase().includes(q))     ||
        (p.DescriptionEnglish && p.DescriptionEnglish.toLowerCase().includes(q)) ||
        (p.UsesEnglish        && p.UsesEnglish.toLowerCase().includes(q))
      );
    });
    return sortPlants(base, sort);
  }, [query, category, activeLetter, sort]);

  const allLetters = useMemo(() => {
    const set = new Set(PLANTS_DATA.map(p => p.EnglishName[0].toUpperCase()));
    return [...set].sort();
  }, []);

  const grouped = useMemo(() => {
    if (query || sort !== "az") return null;
    const groups = {};
    filtered.forEach(p => {
      const l = p.EnglishName[0].toUpperCase();
      if (!groups[l]) groups[l] = [];
      groups[l].push(p);
    });
    return groups;
  }, [filtered, query, sort]);

  const handleRefresh = () => new Promise(res => setTimeout(res, 700));

  return (
    <PageLayout>
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-4">

        <PageTitle
          arabic="قاموس النباتات والمواد"
          latin="Dictionary of Plants & Ingredients"
          subtitle="Medicinal · Spiritual · Traditional"
          icon="🌿"
        />

        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-2xl border px-3 py-2.5"
          style={{ background: P.bg, borderColor: P.border, boxShadow: `0 0 14px ${P.glow}` }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: P.dim }} />
          <input
            type="text"
            inputMode="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setLetter(null); }}
            placeholder="Search in English, Arabic, Malayalam, or by scientific name…"
            className="flex-1 bg-transparent outline-none font-inter text-sm placeholder:text-[rgba(134,239,172,0.28)]"
            style={{ color: "rgba(255,255,255,0.85)", minWidth: 0 }}
            dir="auto"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ color: P.dim }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <CategoryFilter active={category} onSelect={(c) => { setCategory(c); setLetter(null); }} />

        {/* Alpha index (hidden while searching) */}
        {!query && (
          <div>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-1.5" style={{ color: "rgba(134,239,172,0.28)" }}>
              A – Z Index
            </p>
            <AlphaIndex letters={allLetters} activeLetter={activeLetter} onSelect={setLetter} />
          </div>
        )}

        {/* Sort + count row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.22)" }}>
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"} of {PLANTS_DATA.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setQuery("");
                setCategory("all");
                setLetter(null);
                setSortIdx(0);
                clearPageState(PAGE_KEY);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-inter text-[10px] font-semibold uppercase tracking-widest"
              style={{ background: P.bg, borderColor: P.border, color: P.dim, WebkitTapHighlightColor: "transparent" }}
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
            <button
              onClick={() => setSortIdx((sortIdx + 1) % SORT_CYCLE.length)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-inter text-[10px] font-semibold uppercase tracking-widest"
              style={{ background: P.bg, borderColor: P.border, color: P.dim, WebkitTapHighlightColor: "transparent" }}
            >
              <ArrowUpDown className="w-3 h-3" />
              {SORT_LABELS[sort]}
            </button>
          </div>
        </div>

        {/* Plant list */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <EmptyState key="empty" />
            ) : grouped ? (
              Object.keys(grouped).sort().map(letter => (
                <div key={letter}>
                  <AlphaHeader letter={letter} />
                  {grouped[letter].map((plant, i) => (
                    <div key={plant.id} className="mb-2">
                      <PlantRow plant={plant} index={i} onOpen={p => navigate(`/plants/${p.id}`)} />
                    </div>
                  ))}
                </div>
              ))
            ) : (
              filtered.map((plant, i) => (
                <PlantRow key={plant.id} plant={plant} index={i} onOpen={p => navigate(`/plants/${p.id}`)} />
              ))
            )}
          </AnimatePresence>
        </div>

        <p className="font-inter text-[8px] uppercase tracking-widest text-center pt-2"
          style={{ color: "rgba(134,239,172,0.12)" }}>
          ✦ قاموس النباتات والمواد — Plants & Ingredients Dictionary ✦
        </p>

      </div>
    </PullToRefresh>
    </PageLayout>
  );
}