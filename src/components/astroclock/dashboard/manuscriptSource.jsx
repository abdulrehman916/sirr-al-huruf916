// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT SOURCE ATTRIBUTION — shared primitives for the
// unified-topic manuscript architecture across the Astro Clock.
//
// Every displayed fact keeps its original manuscript source.
// - Identical info across manuscripts → shown once, all sources listed.
// - One manuscript adds info → common info once + the addition with its source.
// - Manuscripts genuinely differ → a "Different manuscript opinion" subsection.
// Differences are NEVER pre-classified; each manuscript speaks for itself.
//
// No calculations or data live here — this is presentation only.
// ═══════════════════════════════════════════════════════════════

// Known manuscript sources. `short` is the per-language badge label.
export const MANUSCRIPT_SOURCES = {
  HAVASS: { key: "havass", short: { en: "Havâss", ml: "ഹാവാസ്സ്", ar: "هواس" }, color: "#D4AF37" },
  GIH:    { key: "gih",    short: { en: "GIH",    ml: "GIH",    ar: "GIH" }, color: "#818CF8" },
  KASHF:  { key: "kashf",  short: { en: "Kashf",  ml: "കശ്ഫ്",  ar: "كشف" }, color: "#C084FC" },
  TAHA:   { key: "taha",   short: { en: "Taha",   ml: "താഹ",   ar: "طه" },   color: "#34D399" },
};

const LABELS = {
  sources:          { en: "Sources",                ml: "സ്രോതസ്സുകൾ",        ar: "المصادر" },
  differentOpinion: { en: "Different manuscript opinion", ml: "വ്യത്യസ്ത ഗ്രന്ഥ അഭിപ്രായം", ar: "رأي مخالف في المصدر" },
};

// Single source badge: "📖 Havâss p.88-92"
export function SourceBadge({ source, page, language, isOwner }) {
  const label = source.short[language] || source.short.en;
  return (
    <span
      className="font-inter text-[7px] uppercase tracking-wider px-1 py-0.5 rounded align-middle"
      style={{
        background: source.color + "14",
        color: source.color + "AA",
        border: `1px solid ${source.color}33`,
      }}
    >
      📖 {label}{isOwner && page ? ` p.${page}` : ""}
    </span>
  );
}

// "Sources: 📖 Havâss p.48  📖 GIH p.1419"
export function SourceList({ sources, language, isOwner }) {
  const lbl = LABELS.sources[language] || LABELS.sources.en;
  return (
    <div className="flex flex-wrap gap-1 items-center">
      <span className="font-inter text-[8px] font-bold" style={{ color: "rgba(255,255,255,0.40)" }}>{lbl}:</span>
      {sources.map((s, i) => (
        <SourceBadge key={i} source={s.source} page={s.page} language={language} isOwner={isOwner} />
      ))}
    </div>
  );
}

// Topic wrapper: one heading per topic, source-tagged facts inside.
export function ManuscriptTopic({ title, children }) {
  return (
    <div className="space-y-1">
      <p className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(255,255,255,0.45)" }}>{title}</p>
      {children}
    </div>
  );
}

// Separate-opinion subsection — used ONLY when manuscripts genuinely differ
// (and only after verifying against the original pages).
export function DifferentOpinion({ language, children }) {
  const lbl = LABELS.differentOpinion[language] || LABELS.differentOpinion.en;
  return (
    <div className="rounded p-1.5 space-y-1" style={{ background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.15)" }}>
      <p className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(248,113,113,0.60)" }}>{lbl}</p>
      {children}
    </div>
  );
}

// Conflict badge — marks a field where two manuscripts genuinely disagree.
// Phase 2.3 manuscript conflict engine. Display-only.
export function ConflictBadge({ language }) {
  const lbl = { en: "Conflict", ml: "ഭിന്നത", ar: "خلاف" }[language] || "Conflict";
  return (
    <span
      className="font-inter text-[7px] uppercase tracking-wider px-1 py-0.5 rounded font-bold"
      style={{ background: "rgba(248,113,113,0.12)", color: "#F87171", border: "1px solid rgba(248,113,113,0.30)" }}
    >⚠ {lbl}</span>
  );
}