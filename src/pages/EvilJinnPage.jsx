import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowUpDown, ChevronDown, BookOpen, MapPin, Zap, AlertTriangle, Info } from "lucide-react";
import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";
import PullToRefresh from "../components/PullToRefresh";
import { usePageState } from "../context/PageStateContext";
import { EVIL_JINN_NAMES } from "../lib/evilJinnData";

// Scoped Arabic font for Evil Jinn page only
const ARABIC_FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap');
  .ej-arabic {
    font-family: 'Scheherazade New', 'Amiri', serif;
    font-weight: 700;
    direction: rtl;
    unicode-bidi: embed;
    letter-spacing: 0.03em;
    line-height: 1.6;
    word-break: break-word;
    overflow-wrap: break-word;
  }
`;

function EvilJinnArabicFont() {
  return <style>{ARABIC_FONT_STYLE}</style>;
}

const P = {
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(245,208,96,0.55)",
  faint: "rgba(212,175,55,0.14)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "low", label: "Low (≤200)" },
  { id: "medium", label: "Medium (201-400)" },
  { id: "high", label: "High (>400)" },
];

const SORT_CYCLE = ["az", "za", "value"];
const SORT_LABELS = { az: "A → Z", za: "Z → A", value: "Value ↑" };

function sortJinn(list, sort) {
  const copy = [...list];
  if (sort === "az") return copy.sort((a, b) => a.englishName.localeCompare(b.englishName));
  if (sort === "za") return copy.sort((a, b) => b.englishName.localeCompare(a.englishName));
  if (sort === "value") return copy.sort((a, b) => a.abjadValue - b.abjadValue);
  return copy;
}

function CategoryFilter({ active, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {CATEGORIES.map((cat) => (
        <motion.button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0 px-3 py-1.5 rounded-xl border font-inter text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap"
          style={{
            background: active === cat.id ? P.bgHi : "transparent",
            borderColor: active === cat.id ? P.borderHi : P.faint,
            color: active === cat.id ? P.text : "rgba(245,208,96,0.38)",
            boxShadow: active === cat.id ? `0 0 14px ${P.glow}` : "none",
          }}
        >
          {cat.label}
        </motion.button>
      ))}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, valueClass = "" }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 py-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: P.dim }} />}
      <div className="flex-1">
        <div className="font-inter text-[8px] uppercase tracking-wider mb-0.5" style={{ color: P.dim }}>{label}</div>
        <div className={`font-inter text-[11px] leading-relaxed ${valueClass}`} style={{ color: P.text }}>{value}</div>
      </div>
    </div>
  );
}

function BilingualSection({ enTitle, mlTitle, enContent, mlContent, icon: Icon }) {
  if (!enContent && !mlContent) return null;
  return (
    <div className="rounded-xl border p-3 space-y-2" style={{ background: P.bg, borderColor: P.border }}>
      {enContent && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            {Icon && <Icon className="w-3 h-3" style={{ color: P.dim }} />}
            <span className="font-inter text-[7px] uppercase tracking-wider" style={{ color: P.dim }}>{enTitle}</span>
          </div>
          <p className="font-inter text-[11px] leading-relaxed pl-4" style={{ color: P.text }}>{enContent}</p>
        </div>
      )}
      {mlContent && enContent && (
        <div className="h-px" style={{ background: P.faint }} />
      )}
      {mlContent && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            {Icon && <Icon className="w-3 h-3" style={{ color: P.dim }} />}
            <span className="font-inter text-[7px] uppercase tracking-wider" style={{ color: P.dim }}>{mlTitle}</span>
          </div>
          <p className="ej-arabic text-[13px] leading-relaxed pl-4" style={{ color: P.text }}>{mlContent}</p>
        </div>
      )}
    </div>
  );
}

function ProfileField({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-xl border p-3 space-y-1.5" style={{ background: P.bg, borderColor: P.border }}>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3 flex-shrink-0" style={{ color: P.dim }} />}
        <span className="font-inter text-[7px] uppercase tracking-wider" style={{ color: P.dim }}>{label}</span>
      </div>
      <div className="font-inter text-[12px] leading-relaxed" style={{ color: P.text }}>
        {value.split('\n').map((line, i) => (
          <p key={i} className={line.trim() === '' ? 'h-2' : ''}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function JinnCard({ jinn, index, isOpen, onToggle }) {
  const valueCategory = jinn.abjadValue <= 200 ? "Low" : jinn.abjadValue <= 400 ? "Medium" : "High";
  const profile = jinn.profile || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.35), duration: 0.22 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        borderColor: isOpen ? P.borderHi : P.border,
        background: isOpen
          ? "linear-gradient(145deg, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0.04) 100%)"
          : P.bg,
        boxShadow: isOpen ? `0 0 24px rgba(212,175,55,0.12)` : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Collapsed row — tap to toggle */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left gap-3"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-inter text-[8px] font-semibold" style={{ color: "rgba(255,255,255,0.28)" }}>#{jinn.serialNo}</span>
            <span
              className="ej-arabic"
              style={{ fontSize: "1.35rem", color: P.text, textShadow: isOpen ? "0 0 18px rgba(212,175,55,0.30)" : "none" }}
            >
              {jinn.arabicName}
            </span>
            <span
              className="font-inter text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded-full border whitespace-nowrap"
              style={{ color: P.dim, borderColor: P.border, background: "rgba(245,208,96,0.08)" }}
            >
              {valueCategory}
            </span>
          </div>
          <p className="font-inter text-sm font-semibold truncate" style={{ color: "rgba(255,255,255,0.88)" }}>{jinn.englishName}</p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
          style={{ color: isOpen ? P.text : P.dim }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Expanded detail panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-4 pt-1 space-y-3" style={{ borderTop: "1px solid " + P.faint }}>
              
              {/* Basic Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Arabic Name */}
                <div className="col-span-2 rounded-xl p-3 text-center" style={{ background: P.bgHi, border: "1px solid " + P.borderHi }}>
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: P.dim }}>Arabic Name</p>
                  <p className="ej-arabic" style={{ fontSize: "2.2rem", lineHeight: 1.6, color: P.text, textShadow: "0 0 20px rgba(212,175,55,0.30)" }}>
                    {jinn.arabicHarakat || jinn.arabicName}
                  </p>
                </div>

                {/* English Name */}
                <div className="rounded-xl p-3 text-center" style={{ background: P.bg, border: "1px solid " + P.border }}>
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: P.dim }}>English Name</p>
                  <p className="font-inter font-bold text-sm" style={{ color: "rgba(255,255,255,0.90)" }}>{jinn.englishName}</p>
                </div>

                {/* Malayalam Name */}
                <div className="rounded-xl p-3 text-center" style={{ background: P.bg, border: "1px solid " + P.border }}>
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: P.dim }}>Malayalam Name</p>
                  <p className="font-amiri font-bold text-base" style={{ color: "rgba(255,255,255,0.90)" }}>{jinn.malayalamName || "Awaiting Source Data"}</p>
                </div>

                {/* Abjad Value */}
                <div className="rounded-xl p-3 text-center" style={{ background: P.bg, border: "1px solid " + P.border }}>
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: P.dim }}>Abjad Value</p>
                  <p className="ej-arabic" style={{ fontSize: "1.8rem", color: P.text }}>{jinn.abjadValue}</p>
                </div>

                {/* Letter Count */}
                <div className="rounded-xl p-3 text-center" style={{ background: P.bg, border: "1px solid " + P.border }}>
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: P.dim }}>Letter Count</p>
                  <p style={{ fontFamily: "'Amiri', serif", fontWeight: 700, fontSize: "1.6rem", color: P.text }}>{jinn.letterCount}</p>
                </div>
              </div>

              {/* Profile Fields from PDF */}
              <ProfileField icon={Info} label="രൂപം / Appearance" value={profile.appearance} />
              <ProfileField icon={Info} label="സ്വഭാവം / Nature" value={profile.nature} />
              <ProfileField icon={MapPin} label="താമസസ്ഥലം / Habitat" value={profile.habitat} />
              <ProfileField icon={Zap} label="ശക്തികൾ / Powers" value={profile.powers} />
              <ProfileField icon={Info} label="കുറിപ്പുകൾ / Notes" value={profile.notes} />
              <ProfileField icon={Zap} label="പരിഹാരം / ചികിത്സ" value={profile.remedy} />

              {/* Source Reference */}
              {profile.source && (
                <div className="rounded-xl border p-3 flex items-center gap-2" style={{ background: P.bg, borderColor: P.border }}>
                  <BookOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: P.dim }} />
                  <div className="flex-1">
                    <div className="font-inter text-[7px] uppercase tracking-wider mb-0.5" style={{ color: P.dim }}>ഉറവിടം / Source</div>
                    <div className="font-inter text-[10px] leading-relaxed" style={{ color: P.text }}>{profile.source}</div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-3">
      <p className="font-amiri text-lg" style={{ color: P.dim }}>No results found</p>
      <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>Try a different search or filter</p>
    </motion.div>
  );
}

const PAGE_KEY = "evil-jinn";

export default function EvilJinnPage() {
  const { getPageState, setPageState, clearPageState } = usePageState();
  const initialState = getPageState(PAGE_KEY, { query: "", category: "all", sortIdx: 0 });
  const [query, setQuery] = useState(initialState.query);
  const [category, setCategory] = useState(initialState.category);
  const [sortIdx, setSortIdx] = useState(initialState.sortIdx);
  const [openId, setOpenId] = useState(null);
  const sort = SORT_CYCLE[sortIdx];

  useEffect(() => {
    setPageState(PAGE_KEY, { query, category, sortIdx });
  }, [query, category, sortIdx, setPageState]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortJinn(EVIL_JINN_NAMES.filter((j) => {
      const cat = j.abjadValue <= 200 ? "low" : j.abjadValue <= 400 ? "medium" : "high";
      if (category !== "all" && cat !== category) return false;
      if (!q) return true;
      return j.arabicName.includes(query.trim()) || j.englishName.toLowerCase().includes(q);
    }), sort);
  }, [query, category, sort]);

  const handleRefresh = () => new Promise(res => setTimeout(res, 700));

  const handleToggle = (id) => setOpenId(prev => prev === id ? null : id);

  return (
    <PageLayout>
      <EvilJinnArabicFont />
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-4">
          <PageTitle arabic="أسماء الجن الشريرة" latin="Evil Jinn Names" subtitle="Reference Database" icon="👁" />
          
          <div className="flex items-center gap-2 rounded-2xl border px-3 py-2.5" style={{ background: P.bg, borderColor: P.border }}>
            <Search className="w-4 h-4" style={{ color: P.dim }} />
            <input
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search names..." className="flex-1 bg-transparent outline-none font-inter text-sm"
              style={{ color: "rgba(255,255,255,0.85)" }} dir="auto" autoComplete="off"
            />
            {query && <button onClick={() => setQuery("")} style={{ color: P.dim }}><X className="w-4 h-4" /></button>}
          </div>
          
          <CategoryFilter active={category} onSelect={setCategory} />
          
          <div className="flex items-center justify-between">
            <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.22)" }}>
              {filtered.length} of {EVIL_JINN_NAMES.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setQuery(""); setCategory("all"); setSortIdx(0); setOpenId(null); clearPageState(PAGE_KEY); }}
                className="px-3 py-1.5 rounded-xl border text-[10px] uppercase tracking-widest"
                style={{ background: P.bg, borderColor: P.border, color: P.dim }}
              >Clear</button>
              <button
                onClick={() => setSortIdx((sortIdx + 1) % SORT_CYCLE.length)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] uppercase tracking-widest"
                style={{ background: P.bg, borderColor: P.border, color: P.dim }}
              >
                <ArrowUpDown className="w-3 h-3" />{SORT_LABELS[sort]}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0
                ? <EmptyState key="empty" />
                : filtered.map((jinn, i) => (
                  <JinnCard
                    key={jinn.id}
                    jinn={jinn}
                    index={i}
                    isOpen={openId === jinn.id}
                    onToggle={() => handleToggle(jinn.id)}
                  />
                ))
              }
            </AnimatePresence>
          </div>
        </div>
      </PullToRefresh>
    </PageLayout>
  );
}