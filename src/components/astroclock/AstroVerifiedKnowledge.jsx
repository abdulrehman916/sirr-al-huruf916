import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Database, BookOpen, ChevronDown, Sparkles, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useIsOwner } from "@/hooks/useIsOwner";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";

// ═══════════════════════════════════════════════════════════════
// AstroVerifiedKnowledge — Knowledge Intelligence Engine reader
// for the Astrology / Astro Clock module.
//
// EXACT MIRROR of HolyNameVerifiedKnowledge (verified architecture).
// ADDITIVE LAYER:
//   1. Check the Knowledge Cache via getVerifiedKnowledge
//      (public read, ZERO AI, ZERO credits, instant).
//   2. If a VERIFIED entry exists → render the green verified card
//      with every preserved method, mantra, citation, and source.
//   3. If nothing is cached → render NOTHING (null). The existing
//      Astro Clock panels (EntityKnowledgePanel, dashboards, engines)
//      remain the fallback — they are NEVER removed or modified.
//
// NO MERGING: every category entry is preserved separately with its
// own source attribution (source_book, author, page, citation),
// exactly as approved by the Owner. Different methods from different
// books stay as separate entries — never collapsed into one summary.
//
// ISOLATED: does not modify any existing Astro Clock engine,
// calculation, panel, or entity. Pure additive reader.
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

// Astrology category labels (preserved separately — never merged).
const CATEGORY_LABELS = {
  planetary_information: "Planetary Information",
  zodiac_signs: "Zodiac Signs",
  lunar_solar_cycles: "Lunar & Solar Cycles",
  planetary_hours: "Planetary Hours",
  astro_clock_methods: "Astro Clock Methods",
  traditional_islamic_astrology: "Traditional Islamic Astrology",
  timing_methods: "Timing Methods",
  astrological_tables: "Astrological Tables",
  planetary_invocations: "Planetary Invocations",
  planetary_talismans: "Planetary Talismans",
  wafq_planets: "Wafq (Planets)",
  astrological_khawass: "Astrological Khawāṣṣ",
  astrological_mujarrabat: "Astrological Mujarrabāt",
  related_dua: "Related Du'a",
  related_holy_names: "Related Holy Names",
  related_quran_verses: "Related Qur'anic Verses",
  related_arabic_manuscripts: "Related Arabic Manuscripts",
  scholarly_opinions: "Scholarly Opinions",
  alternative_methods: "Alternative Methods",
  meanings: "Meanings",
  explanations: "Explanations",
  timings: "Timings",
  conditions: "Conditions",
  warnings: "Warnings",
  benefits: "Benefits",
  references: "References",
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
      {open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
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
    </div>
  );
}

export default function AstroVerifiedKnowledge({ query }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isOwner = useIsOwner();
  const { language } = useAstroClockLanguage();

  useEffect(() => {
    let alive = true;
    if (!query) return;
    setLoading(true);
    setError(null);
    setData(null);
    base44.functions
      .invoke("getVerifiedKnowledge", {
        query,
        mode: "harakat_insensitive",
        requesting_module: "astro_clock",
      })
      .then((res) => {
        if (!alive) return;
        const d = res && res.data ? res.data : res;
        if (d && d.found && d.served_from_cache) setData(d);
        else setData(null);
      })
      .catch(() => { if (alive) setData(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [query]);

  if (language !== "en" || !isOwner || loading || error || !data) return null; // EN + Owner-only: cache entries & all UI labels are English/Arabic (no Malayalam/Arabic labels) — hide in ML/AR to prevent English leakage

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
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid " + P.border }}>
        <ShieldCheck className="w-4 h-4" style={{ color: P.text }} />
        <div className="flex-1 min-w-0">
          <p className="font-inter text-[10px] font-bold uppercase tracking-widest" style={{ color: P.text }}>Verified Knowledge · Astrology</p>
          <p className="font-inter text-[8px] uppercase tracking-wider" style={{ color: P.dim }}>Knowledge Intelligence Engine · Master PDF Library · {query}</p>
        </div>
        <span className="font-inter text-[7px] uppercase tracking-widest px-2 py-1 rounded-full border whitespace-nowrap" style={{ color: P.text, borderColor: P.border, background: P.bgHi }}>
          ✓ Zero AI
        </span>
      </div>

      <div className="px-4 py-3 space-y-3">
        {entries.comparison_summary && (
          <p className="font-inter text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>{entries.comparison_summary}</p>
        )}

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