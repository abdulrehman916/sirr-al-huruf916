import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Database, BookOpen, ChevronDown, Sparkles, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";

// ═══════════════════════════════════════════════════════════════
// HolyNameVerifiedKnowledge — Knowledge Intelligence Engine reader
// for a single Holy Name card.
//
// FLOW (req 1–10 of the Knowledge Intelligence Layer):
//   1. Check the Knowledge Cache FIRST via getVerifiedKnowledge
//      (public read path, ZERO AI, ZERO credits, instant).
//   2. If a VERIFIED entry exists → render it (meanings, khawass,
//      mujarrabat, wafq, dua, amal, talismans, conditions, benefits,
//      references, citations, confidence, approval history).
//   3. If nothing is cached → render NOTHING (null). The existing
//      knowledge components (HolyNameResearchProfile,
//      HolyNameImportedSections) remain the fallback display, so the
//      card never goes blank. The Owner populates the cache by running
//      unifiedKnowledgeSearch + approveKnowledgeEntry.
//
// ISOLATED: does not modify any existing component, page, engine, or
// calculation. Pure additive reader.
// ═══════════════════════════════════════════════════════════════

const P = {
  border: "rgba(52,211,153,0.40)",
  borderHi: "rgba(52,211,153,0.65)",
  text: "#34d399",
  dim: "rgba(52,211,153,0.60)",
  bg: "rgba(52,211,153,0.06)",
  bgHi: "rgba(52,211,153,0.10)",
  glow: "rgba(52,211,153,0.18)",
  goldText: "#F5D060",
  goldDim: "rgba(245,208,96,0.55)",
};

// Categories to surface (only those with content render).
const CATEGORY_LABELS = {
  meanings: "Meanings",
  explanations: "Explanations",
  tafsir: "Tafsir",
  khawass: "Khawāṣṣ",
  mujarrabat: "Mujarrabāt",
  wazifa: "Wazīfa",
  hizb: "Ḥizb",
  dua: "Du'ā",
  amal: "ʿAmal",
  magic_squares: "Magic Squares / Awfāq",
  talismans: "Talismans",
  repetitions: "Repetitions",
  timings: "Timings",
  conditions: "Conditions",
  warnings: "Warnings",
  benefits: "Benefits",
  related_verses: "Related Verses",
  related_hadith: "Related Hadith",
  related_names: "Related Names",
  classical_references: "Classical References",
};

const DISPLAY_ORDER = Object.keys(CATEGORY_LABELS);

function EntryRow({ entry, idx }) {
  const [open, setOpen] = useState(false);
  if (!entry || !entry.text) return null;
  return (
    <div className="rounded-lg border px-3 py-2" style={{ background: P.bg, borderColor: "rgba(52,211,153,0.20)" }}>
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left flex items-start gap-2">
        <span className="font-inter text-[8px] font-semibold mt-0.5 flex-shrink-0" style={{ color: P.dim }}>#{idx + 1}</span>
        <span className="flex-1 font-inter text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>
          {entry.text}
        </span>
        <ChevronDown className={`w-3 h-3 mt-1 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: P.dim }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
            <div className="pt-2 mt-2 space-y-1.5" style={{ borderTop: "1px solid rgba(52,211,153,0.18)" }}>
              {entry.arabic && (
                <p className="font-amiri text-base leading-loose text-right" style={{ color: P.goldText }} dir="rtl">{entry.arabic}</p>
              )}
              {(entry.source_book || entry.citation || entry.source_page) && (
                <p className="font-inter text-[10px] flex items-center gap-1" style={{ color: "rgba(255,255,255,0.50)" }}>
                  <FileText className="w-3 h-3" style={{ color: P.dim }} />
                  {entry.source_book ? entry.source_book : entry.citation}{entry.source_page ? `, p. ${entry.source_page}` : ""}
                  {entry.language ? ` · ${entry.language}` : ""}
                </p>
              )}
              {entry.confidence != null && (
                <p className="font-inter text-[9px]" style={{ color: P.dim }}>Confidence: <b style={{ color: P.text }}>{entry.confidence}%</b></p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HolyNameVerifiedKnowledge({ arabicName, nameId, englishName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!arabicName) return;
    setLoading(true);
    setError(null);
    setData(null);
    base44.functions
      .invoke("getVerifiedKnowledge", {
        query: arabicName,
        mode: "harakat_insensitive",
        requesting_module: "holy_names",
      })
      .then((res) => {
        if (!alive) return;
        const d = res && res.data ? res.data : res;
        if (d && d.found && d.served_from_cache) setData(d);
        else setData(null);
      })
      .catch((e) => { if (alive) setError(e.message || "Knowledge cache error"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [arabicName]);

  if (loading) {
    return (
      <div className="rounded-2xl border p-3 flex items-center gap-2" style={{ background: P.bg, borderColor: P.border }}>
        <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: P.dim, borderTopColor: "transparent" }} />
        <span className="font-inter text-[10px]" style={{ color: P.dim }}>Checking Knowledge Cache…</span>
      </div>
    );
  }
  if (error || !data) return null; // cache miss → existing knowledge components remain

  const entries = data.scholarly_entries || {};
  const sourceBooks = data.source_books || [];
  const linkedCards = data.linked_cards || [];
  const presentCategories = DISPLAY_ORDER.filter((k) => Array.isArray(entries[k]) && entries[k].length > 0);
  const totalEntries = presentCategories.reduce((s, k) => s + entries[k].length, 0);

  if (totalEntries === 0 && !entries.comparison_summary) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border overflow-hidden"
      style={{ background: "linear-gradient(145deg, rgba(52,211,153,0.08) 0%, rgba(52,211,153,0.03) 100%)", borderColor: P.border, boxShadow: `0 0 20px ${P.glow}` }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid " + P.border }}>
        <ShieldCheck className="w-4 h-4" style={{ color: P.text }} />
        <div className="flex-1 min-w-0">
          <p className="font-inter text-[10px] font-bold uppercase tracking-widest" style={{ color: P.text }}>Verified Knowledge</p>
          <p className="font-inter text-[8px] uppercase tracking-wider" style={{ color: P.dim }}>Knowledge Intelligence Engine · Master PDF Library</p>
        </div>
        <span className="font-inter text-[7px] uppercase tracking-widest px-2 py-1 rounded-full border whitespace-nowrap" style={{ color: P.text, borderColor: P.border, background: P.bgHi }}>
          ✓ Zero AI
        </span>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Comparison summary */}
        {entries.comparison_summary && (
          <p className="font-inter text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>{entries.comparison_summary}</p>
        )}

        {/* Conflicts — multiple scholarly opinions */}
        {Array.isArray(entries.conflicts) && entries.conflicts.length > 0 && (
          <div className="rounded-xl p-3" style={{ background: "rgba(245,208,96,0.06)", border: "1px solid rgba(245,208,96,0.30)" }}>
            <p className="font-inter text-[9px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1" style={{ color: P.goldDim }}>
              <Sparkles className="w-3 h-3" /> Multiple Scholarly Opinions
            </p>
            <div className="space-y-2">
              {entries.conflicts.map((c, i) => (
                <div key={i} className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.70)" }}>
                  <p className="font-semibold mb-1" style={{ color: P.goldText }}>{c.topic}</p>
                  <p>• {c.opinion_a?.text} <span style={{ color: P.goldDim }}>— {c.opinion_a?.citation}</span></p>
                  <p>• {c.opinion_b?.text} <span style={{ color: P.goldDim }}>— {c.opinion_b?.citation}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category entries */}
        {presentCategories.length > 0 && (
          <div className="space-y-2.5">
            {presentCategories.map((cat) => (
              <div key={cat}>
                <p className="font-inter text-[9px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5" style={{ color: P.text }}>
                  <BookOpen className="w-3 h-3" style={{ color: P.dim }} />
                  {CATEGORY_LABELS[cat]} <span style={{ color: P.dim }}>({entries[cat].length})</span>
                </p>
                <div className="space-y-1.5">
                  {entries[cat].map((e, i) => <EntryRow key={i} entry={e} idx={i} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Citations / source books */}
        {sourceBooks.length > 0 && (
          <div className="pt-2" style={{ borderTop: "1px solid rgba(52,211,153,0.18)" }}>
            <p className="font-inter text-[9px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5" style={{ color: P.text }}>
              <Database className="w-3 h-3" style={{ color: P.dim }} />
              Citations ({sourceBooks.length})
            </p>
            <div className="space-y-1">
              {sourceBooks.map((s, i) => (
                <p key={i} className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                  • {s.book_title}{s.author ? ` — ${s.author}` : ""}{s.page ? `, p. ${s.page}` : ""}{s.edition ? ` (${s.edition})` : ""}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Footer: confidence, cache provenance */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2" style={{ borderTop: "1px solid rgba(52,211,153,0.18)" }}>
          <span className="font-inter text-[9px]" style={{ color: P.dim }}>
            Confidence: <b style={{ color: P.text }}>{data.confidence_score ?? 0}%</b> · Served {data.serve_count || 0}× from cache
          </span>
          {data.approved_at && (
            <span className="font-inter text-[8px]" style={{ color: "rgba(255,255,255,0.40)" }}>
              Approved {new Date(data.approved_at).toLocaleDateString()}{data.approved_by_name ? ` by ${data.approved_by_name}` : ""}
            </span>
          )}
        </div>

        {/* Linked cards (which module cards use this knowledge) */}
        {linkedCards.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {linkedCards.map((lc, i) => (
              <span key={i} className="font-inter text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded-full border" style={{ color: P.dim, borderColor: "rgba(52,211,153,0.25)", background: P.bg }}>
                Linked: {lc.module}:{lc.card_id}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}