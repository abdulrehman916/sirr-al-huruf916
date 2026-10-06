// ═══════════════════════════════════════════════════════════════
// SIRR READER — search, filter, categories, pagination, favorites,
// multilingual (Arabic / Malayalam / English). Reuses the existing
// SirrManuscriptEntry entity via useSirrEntries. No new tables,
// no business logic. Owner-only source material is gated inside
// SirrEntryCard (page scans, page numbers, OCR, audit flags).
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo } from "react";
import { Search, Star } from "lucide-react";
import { useSirrEntries } from "@/hooks/useSirrEntries";
import { useSirrFavorites, useSirrBookmarks } from "@/hooks/useSirrFavorites";
import SirrEntryCard from "./SirrEntryCard";

const G = { text: "#D4AF37", dim: "rgba(212,175,55,0.55)", faint: "rgba(212,175,55,0.18)" };
const PAGE_SIZE = 10;
const LANGS = [
  { key: "ar", label: "Arabic" },
  { key: "ml", label: "Malayalam" },
  { key: "en", label: "English" },
];

function Empty({ label }) {
  return (
    <div className="rounded-xl border p-6 text-center" style={{ borderColor: G.faint, background: "rgba(8,16,38,0.40)" }}>
      <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</p>
    </div>
  );
}

export default function SirrReader({ book }) {
  const { entries, loading } = useSirrEntries(book?.sirr_book_id);
  const { has: hasFav, toggle: toggleFav } = useSirrFavorites();
  const { has: hasBm, toggle: toggleBm } = useSirrBookmarks();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [language, setLanguage] = useState("ar");
  const [favOnly, setFavOnly] = useState(false);
  const [page, setPage] = useState(0);

  const categories = useMemo(() => {
    const set = new Set();
    (entries || []).forEach(e => { if (e.category) set.add(e.category); });
    return ["all", ...Array.from(set).sort()];
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (entries || []).filter(e => {
      if (category !== "all" && e.category !== category) return false;
      if (favOnly && !hasFav(e.sirr_entry_id)) return false;
      if (!q) return true;
      const hay = `${e.heading_title_ar || ""} ${e.heading_title_ml || ""} ${e.heading_title || ""} ${e.arabic_text || ""} ${e.malayalam_meaning || ""} ${e.english_meaning || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [entries, query, category, favOnly, hasFav]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  if (!book) return <Empty label="Select a book to view its manuscript cards." />;

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: G.dim }} />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0); }}
            placeholder="Search entries…"
            className="w-full rounded-lg border pl-8 pr-2 py-1.5 bg-transparent font-inter text-xs"
            style={{ borderColor: G.faint, color: "rgba(255,255,255,0.85)" }}
          />
        </div>
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(0); }}
          className="rounded-lg border px-2 py-1.5 font-inter text-xs bg-transparent"
          style={{ borderColor: G.faint, color: "rgba(255,255,255,0.85)" }}
        >
          {categories.map(c => (
            <option key={c} value={c} style={{ background: "#0b111e" }}>{c === "all" ? "All categories" : c}</option>
          ))}
        </select>
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: G.faint }}>
          {LANGS.map(l => (
            <button
              key={l.key}
              onClick={() => setLanguage(l.key)}
              className="px-2.5 py-1.5 font-inter text-[11px]"
              style={{ background: language === l.key ? "rgba(212,175,55,0.12)" : "transparent", color: language === l.key ? G.text : "rgba(255,255,255,0.50)" }}
            >{l.label}</button>
          ))}
        </div>
        <button
          onClick={() => { setFavOnly(v => !v); setPage(0); }}
          className="flex items-center gap-1 rounded-lg border px-2 py-1.5 font-inter text-[11px]"
          style={{ borderColor: favOnly ? G.dim : G.faint, color: favOnly ? G.text : "rgba(255,255,255,0.50)" }}
        >
          <Star className="w-3 h-3" style={{ fill: favOnly ? G.text : "none", color: favOnly ? G.text : "rgba(255,255,255,0.40)" }} />
          Favorites
        </button>
      </div>

      {/* List */}
      {loading ? (
        <Empty label="Loading cards…" />
      ) : pageItems.length === 0 ? (
        <Empty label="No cards match your search." />
      ) : (
        <div className="space-y-2">
          {pageItems.map(e => (
            <SirrEntryCard
              key={e.sirr_entry_id}
              entry={e}
              book={book}
              language={language}
              isFav={hasFav(e.sirr_entry_id)}
              isBm={hasBm(e.sirr_entry_id)}
              onToggleFav={toggleFav}
              onToggleBm={toggleBm}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-1">
          <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
            {filtered.length} cards · page {safePage + 1}/{pageCount}
          </span>
          <div className="flex gap-1">
            <button
              disabled={safePage === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-2.5 py-1 rounded border font-inter text-[11px] disabled:opacity-30"
              style={{ borderColor: G.faint, color: "rgba(255,255,255,0.70)" }}
            >Prev</button>
            <button
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-2.5 py-1 rounded border font-inter text-[11px] disabled:opacity-30"
              style={{ borderColor: G.faint, color: "rgba(255,255,255,0.70)" }}
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );
}