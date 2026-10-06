// ═══════════════════════════════════════════════════════════════
// SECTION D LIBRARY — Reusable card-based Holy Names library
//
// Used both as a standalone page (SectionDPage) and as the fourth
// tab inside the Holy Names page (MagicalHolyNamesPage).
//
// Each Dua, Wazifa, Hizb, Hirz, Salawat, Qur'an reference and
// Spiritual Practice has its own individual card. Scalable to
// thousands of cards via server-side pagination + content_type filter.
// Future PDF imports APPEND into existing cards (matched by
// canonical_key) instead of creating duplicates.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, ChevronDown } from "lucide-react";
import SectionDCard from "@/components/sectiond/SectionDCard";

const PAGE_SIZE = 24;

const CONTENT_TYPES = [
  { key: "all", label: "All", ml: "എല്ലാം" },
  { key: "long_dua", label: "Long Du'a", ml: "ദീർഘ ദുആ" },
  { key: "general_wazifa", label: "Wazifa", ml: "വാഴിഫ" },
  { key: "spiritual_practice", label: "Spiritual Practice", ml: "ആത്മീയ അഭ്യാസം" },
  { key: "quran_reference", label: "Qur'an", ml: "ഖുർആൻ" },
  { key: "islamic_figure", label: "Islamic Figure", ml: "ഇസ്ലാമിക വ്യക്തി" },
  { key: "general_khawass", label: "Khawass", ml: "ഖവാസ്സ" },
  { key: "general_mujarrabat", label: "Mujarrabat", ml: "മുജർറബത്" },
  { key: "miscellaneous", label: "Miscellaneous", ml: "വിവിധ" },
];

export default function SectionDLibrary() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Load a single page from the server
  const loadPage = useCallback(async (pageNum, filterType) => {
    const query = {};
    if (filterType !== "all") query.content_type = filterType;
    const batch = await base44.entities.SectionDKnowledge.filter(
      query,
      "-created_date",
      PAGE_SIZE,
      pageNum * PAGE_SIZE
    );
    return batch || [];
  }, []);

  // Reload when filter changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(0);
    loadPage(0, filter)
      .then(batch => {
        if (cancelled) return;
        setRecords(batch);
        setHasMore(batch.length === PAGE_SIZE);
      })
      .catch(() => {
        if (!cancelled) setRecords([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Get total count for the filter
    base44.entities.SectionDKnowledge.filter(
      filter !== "all" ? { content_type: filter } : {},
      undefined,
      1,
      0
    ).then(batch => {
      if (!cancelled) setTotalCount(batch.length);
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [filter, loadPage]);

  // Load more (pagination)
  const loadMore = () => {
    const next = page + 1;
    setLoadingMore(true);
    loadPage(next, filter)
      .then(batch => {
        setRecords(prev => [...prev, ...batch]);
        setPage(next);
        setHasMore(batch.length === PAGE_SIZE);
      })
      .finally(() => setLoadingMore(false));
  };

  // Client-side search on loaded records
  const filtered = search
    ? records.filter(r => {
        const q = search.toLowerCase();
        return (
          (r.arabic_text || "").toLowerCase().includes(q) ||
          (r.explanation || "").toLowerCase().includes(q) ||
          (r.source_book_title || "").toLowerCase().includes(q) ||
          (r.original_rule_entity || "").toLowerCase().includes(q) ||
          (r.title || "").toLowerCase().includes(q) ||
          (r.malayalam_translation || "").toLowerCase().includes(q)
        );
      })
    : records;

  return (
    <div className="space-y-3">
      {/* ── Search Bar ── */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "rgba(212,175,55,0.40)" }}
        />
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Search by name, Arabic text, book, or entity..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl font-inter text-xs"
          style={{
            background: "rgba(255,255,255,0.03)",
            color: "rgba(255,255,255,0.80)",
            border: "1px solid rgba(212,175,55,0.15)",
            outline: "none",
          }}
        />
      </div>

      {/* ── Content Type Filters ── */}
      <div className="flex flex-wrap gap-1.5">
        {CONTENT_TYPES.map(ct => (
          <button
            key={ct.key}
            onClick={() => setFilter(ct.key)}
            className="font-inter text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all"
            style={{
              background: filter === ct.key ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.02)",
              color: filter === ct.key ? "#F5D060" : "rgba(255,255,255,0.40)",
              border: `1px solid ${filter === ct.key ? "rgba(212,175,55,0.35)" : "rgba(212,175,55,0.08)"}`,
            }}
          >
            {ct.label}
          </button>
        ))}
      </div>

      {/* ── Results count ── */}
      <div className="flex items-center justify-between">
        <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>
          {loading ? "Loading..." : `${filtered.length} card${filtered.length !== 1 ? "s" : ""}${search ? " (filtered)" : ""}`}
        </p>
        {!loading && !search && hasMore && (
          <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.20)" }}>
            Showing {records.length} of many — scroll for more
          </p>
        )}
      </div>

      {/* ── Cards Grid ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgba(212,175,55,0.40)" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>
            {search ? "No cards match your search." : "No cards in this category yet."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filtered.map(record => (
              <SectionDCard key={record.id || record._id || record.section_d_id} record={record} />
            ))}
          </div>

          {/* ── Load More ── */}
          {!search && hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="font-inter text-[10px] font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all"
                style={{
                  background: loadingMore ? "rgba(212,175,55,0.05)" : "rgba(212,175,55,0.10)",
                  color: loadingMore ? "rgba(212,175,55,0.30)" : "#F5D060",
                  border: "1px solid rgba(212,175,55,0.20)",
                }}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    Load More
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}