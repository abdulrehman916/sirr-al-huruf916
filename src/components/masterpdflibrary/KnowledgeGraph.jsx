/**
 * KnowledgeGraph — Owner-only relationship graph for a Holy Name,
 * Ayah, Dua, Word, Letter or Topic. Calls buildKnowledgeGraph with
 * the already-matched search results, then renders the complete
 * relationship graph (related Names of Allah, verses, hadith,
 * formulas, books) + organized scholarly collection + conflicts.
 *
 * Props: { query, dbResults, onClose }
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  X, Loader2, Sparkles, Network, BookOpen, ScrollText, Gem, BookMarked, AlertTriangle, Tag, ChevronDown, ChevronRight, ShieldCheck,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)", bg: "rgba(212,175,55,0.07)",
};

const NODE_GROUPS = [
  { key: "related_names", label: "Related Names of Allah", icon: Sparkles },
  { key: "related_verses", label: "Related verses", icon: ScrollText },
  { key: "related_hadith", label: "Related hadith", icon: BookOpen },
  { key: "related_formulas", label: "Related formulas (wafq · talisman · dua)", icon: Gem },
  { key: "related_books", label: "Related books", icon: BookMarked },
];
const SCHOLARLY = [
  "meanings", "tafsir", "khawass", "mujarrabat", "wazifa", "hizb", "dua", "amal",
  "magic_squares", "talismans", "benefits", "repetitions", "timings", "conditions", "warnings",
];

export default function KnowledgeGraph({ query = "", dbResults = [], onClose }) {
  const [loading, setLoading] = useState(false);
  const [graph, setGraph] = useState(null);
  const [error, setError] = useState("");

  async function build() {
    setLoading(true); setError(""); setGraph(null);
    try {
      const matched = (dbResults || []).map((r) => ({
        arabic: r.arabic || r.verified_arabic || "",
        ocr_text: r.ocr_text || "",
        malayalam: r.malayalam || "",
        english: r.english || "",
        citation: r.citation || {},
      }));
      const res = await base44.functions.invoke("buildKnowledgeGraph", { query, matched });
      const data = res?.data || res;
      if (data?.error) throw new Error(data.error);
      setGraph(data.graph);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: 16, backdropFilter: "blur(4px)" }}>
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}
        style={{ width: "min(720px, 100%)", maxHeight: "88vh", overflowY: "auto", background: "linear-gradient(180deg, #060c1c 0%, #020710 100%)", border: `1px solid ${G.borderHi}`, borderRadius: 14, padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Network style={{ width: 18, height: 18, color: G.text }} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700, color: "#fff" }}>Knowledge Graph</span>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: G.dim }}>· "{query}"</span>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.50)" }}><X style={{ width: 18, height: 18 }} /></button>
        </div>

        {!graph && !loading && !error && (
          <div style={{ textAlign: "center", padding: 24 }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: G.dim, margin: "0 0 14px 0" }}>Build the complete relationship graph for "{query}" across {dbResults.length} matched source(s). Uses only the matched content — never fabricates, never merges conflicting opinions.</p>
            <button onClick={build} style={{ padding: "10px 18px", borderRadius: 8, cursor: "pointer", background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", border: "none", color: "#0d1b2a", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Sparkles style={{ width: 14, height: 14 }} /> Build graph
            </button>
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 32, gap: 10 }}>
            <Loader2 style={{ width: 24, height: 24, color: G.text, animation: "spin 1s linear infinite" }} />
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: G.dim, margin: 0 }}>Building relationship graph across all matched books…</p>
          </div>
        )}

        {error && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#fca5a5" }}>{error}</p>}

        {graph && (
          <div>
            {graph.summary && (
              <div style={{ padding: 12, borderRadius: 9, background: "rgba(212,175,55,0.06)", border: `1px solid ${G.border}`, marginBottom: 12 }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.80)", margin: 0, lineHeight: 1.6 }}>{graph.summary}</p>
              </div>
            )}

            {/* Conflicts */}
            {Array.isArray(graph.conflicts) && graph.conflicts.length > 0 && (
              <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.30)" }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, color: "#fbbf24", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: 5 }}>
                  <AlertTriangle style={{ width: 12, height: 12 }} /> {graph.conflicts.length} conflicting opinion(s) — kept separate
                </p>
                {graph.conflicts.map((c, i) => (
                  <div key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.70)", marginBottom: 4 }}>
                    <span style={{ color: "#fbbf24", fontWeight: 600 }}>{c.topic}</span><br />
                    A: {c.opinion_a?.text} <span style={{ color: G.dim }}>· {c.opinion_a?.citation}</span><br />
                    B: {c.opinion_b?.text} <span style={{ color: G.dim }}>· {c.opinion_b?.citation}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Relationship nodes */}
            {NODE_GROUPS.map((g) => {
              const arr = Array.isArray(graph[g.key]) ? graph[g.key] : [];
              if (arr.length === 0) return null;
              return <Group key={g.key} label={g.label} icon={g.icon} entries={arr} />;
            })}

            {/* Scholarly collection */}
            {graph.scholarly && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, color: G.text, margin: "10px 0 6px 0", display: "flex", alignItems: "center", gap: 6 }}>
                  <ShieldCheck style={{ width: 13, height: 13 }} /> Organized scholarly collection
                </p>
                {SCHOLARLY.map((k) => {
                  const arr = Array.isArray(graph.scholarly[k]) ? graph.scholarly[k] : [];
                  if (arr.length === 0) return null;
                  return <Group key={k} label={k.replace(/_/g, " ")} icon={Tag} entries={arr} small />;
                })}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function Group({ label, icon: Icon, entries, small }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "9px 11px", background: "transparent", border: "none", cursor: "pointer" }}>
        {open ? <ChevronDown style={{ width: 12, height: 12, color: G.text }} /> : <ChevronRight style={{ width: 12, height: 12, color: G.text }} />}
        <Icon style={{ width: 12, height: 12, color: G.text }} />
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, color: "#fff", textTransform: "capitalize" }}>{label}</span>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: G.dim, marginLeft: "auto" }}>{entries.length}</span>
      </button>
      {open && (
        <div style={{ padding: "0 11px 10px" }}>
          {entries.map((e, i) => (
            <div key={i} style={{ padding: 8, borderRadius: 6, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 6 }}>
              {e.arabic && <p className="font-amiri" style={{ direction: "rtl", textAlign: "right", color: G.text, fontSize: 14, margin: "0 0 4px 0", lineHeight: 1.9 }}>{e.arabic}</p>}
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: small ? 11 : 12, color: "rgba(255,255,255,0.82)", margin: "0 0 4px 0", whiteSpace: "pre-wrap" }}>{e.text}</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: G.dim, margin: 0 }}>{e.citation}{e.confidence != null ? ` · ${e.confidence}%` : ""}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}