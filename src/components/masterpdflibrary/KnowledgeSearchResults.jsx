/**
 * KnowledgeSearchResults — renders the structured response from the
 * Unified Knowledge Search engine: matched Master Library pages
 * (every field), cloud matches, and AI-collected scholarly entries
 * (opinions kept separate, conflicts surfaced, nothing fabricated).
 */
import { useState } from "react";
import {
  BookOpen, Cloud, Sparkles, GitMerge, AlertTriangle, Tag, ChevronDown, ChevronRight, FileText, Languages, Hash, Network,
} from "lucide-react";
import CitationExplorer from "./CitationExplorer";
import KnowledgeGraph from "./KnowledgeGraph";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)",
};

const SCHOLARLY_CATEGORIES = [
  { key: "meanings", label: "Meanings" },
  { key: "explanations", label: "Explanations" },
  { key: "tafsir", label: "Tafsir" },
  { key: "khawass", label: "Khawāṣṣ" },
  { key: "mujarrabat", label: "Mujarrabāt" },
  { key: "wazifa", label: "Wazīfa" },
  { key: "hizb", label: "Ḥizb" },
  { key: "dua", label: "Duʿā" },
  { key: "amal", label: "ʿAmal" },
  { key: "magic_squares", label: "Magic Squares (Wafq)" },
  { key: "talismans", label: "Talismans" },
  { key: "repetitions", label: "Repetition counts" },
  { key: "timings", label: "Timings" },
  { key: "conditions", label: "Conditions" },
  { key: "warnings", label: "Warnings" },
  { key: "benefits", label: "Benefits" },
  { key: "related_verses", label: "Related verses" },
  { key: "related_hadith", label: "Related hadith" },
  { key: "related_names", label: "Related names" },
  { key: "classical_references", label: "Classical references" },
];

export default function KnowledgeSearchResults({ results }) {
  const db = results.db_results || [];
  const cm = results.cloud_matches || {};
  const se = results.scholarly_entries || null;
  const populatedCats = SCHOLARLY_CATEGORIES.filter((c) => Array.isArray(se?.[c.key]) && se[c.key].length > 0);
  const totalScholarly = populatedCats.reduce((n, c) => n + se[c.key].length, 0);
  const query = results.query || "";
  const [cite, setCite] = useState(null);
  const [showGraph, setShowGraph] = useState(false);

  return (
    <div>
      {db.length > 0 && (
        <button onClick={() => setShowGraph(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 8, cursor: "pointer", background: "rgba(212,175,55,0.10)", border: `1px solid ${G.borderHi}`, color: G.text, fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, marginBottom: 12 }}>
          <Network style={{ width: 13, height: 13 }} /> Build Knowledge Graph for "{query}"
        </button>
      )}
      {/* AI comparison summary */}
      {se && (
        <div style={{ padding: 14, borderRadius: 10, background: "rgba(212,175,55,0.06)", border: `1px solid ${G.border}`, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
            <Sparkles style={{ width: 15, height: 15, color: G.text }} />
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, color: "#fff" }}>AI comparison across {db.length} matched source(s)</span>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: G.dim, marginLeft: "auto" }}>{totalScholarly} scholarly entries</span>
          </div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.6 }}>{se.comparison_summary || "—"}</p>
          {Array.isArray(se.conflicts) && se.conflicts.length > 0 && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, color: "#fbbf24", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: 5 }}>
                <AlertTriangle style={{ width: 12, height: 12 }} /> {se.conflicts.length} conflicting opinion(s) — kept separate
              </p>
              {se.conflicts.map((c, i) => (
                <div key={i} style={{ padding: 9, borderRadius: 7, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.30)", marginBottom: 6 }}>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600, color: "#fbbf24", margin: "0 0 4px 0" }}>{c.topic}</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.70)", margin: "0 0 2px 0" }}>A: {c.opinion_a?.text} <span style={{ color: G.dim }}>· {c.opinion_a?.citation}</span></p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.70)", margin: 0 }}>B: {c.opinion_b?.text} <span style={{ color: G.dim }}>· {c.opinion_b?.citation}</span></p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scholarly entries */}
      {se && populatedCats.length > 0 && (
        <Section title="Scholarly entries (auto-collected)" icon={BookOpen}>
          {populatedCats.map((cat) => <CategoryGroup key={cat.key} cat={cat} entries={se[cat.key]} />)}
        </Section>
      )}
      {se && populatedCats.length === 0 && (
        <div style={{ padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, marginBottom: 16 }}>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: G.dim, margin: 0 }}>No scholarly entries found in the matched content for this query. The engine never fabricates missing knowledge.</p>
        </div>
      )}

      {/* Matched Master Library pages */}
      <Section title={`Master PDF Library matches (${db.length})`} icon={Hash}>
        {db.length === 0 ? <Empty text="No indexed matches." /> : db.map((r, i) => <PageResultCard key={r.page_id || i} r={r} query={query} onOpenCitation={setCite} />)}
      </Section>

      {/* Cloud matches */}
      <Section title="Cloud matches (not yet indexed)" icon={Cloud}>
        <CloudGroup label="Google Drive" files={cm.googleDrive} />
        <CloudGroup label="OneDrive" files={cm.oneDrive} />
        {cm.adobe && <CloudGroup label="Adobe Document Cloud" note={cm.adobe.note} />}
      </Section>

      {cite && (
        <CitationExplorer
          citation={cite.citation || {}}
          ocr_text={cite.ocr_text || ""}
          arabic_text={cite.arabic || cite.verified_arabic || ""}
          original_scan_url={cite.original_scan_url || ""}
          pdf_file_url={cite.pdf_file_url || ""}
          query={query}
          onClose={() => setCite(null)}
        />
      )}
      {showGraph && (
        <KnowledgeGraph query={query} dbResults={db} onClose={() => setShowGraph(false)} />
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, borderRadius: 9, padding: "10px 12px", cursor: "pointer", marginBottom: open ? 10 : 0 }}>
        {open ? <ChevronDown style={{ width: 13, height: 13, color: G.text }} /> : <ChevronRight style={{ width: 13, height: 13, color: G.text }} />}
        <Icon style={{ width: 13, height: 13, color: G.text }} />
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: "#fff" }}>{title}</span>
      </button>
      {open && children}
    </div>
  );
}

function CategoryGroup({ cat, entries }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 8, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "9px 11px", background: "transparent", border: "none", cursor: "pointer" }}>
        <Tag style={{ width: 11, height: 11, color: G.text }} />
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, color: "#fff" }}>{cat.label}</span>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: G.dim, marginLeft: "auto" }}>{entries.length} entr{entries.length === 1 ? "y" : "ies"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 11px 10px" }}>
          {entries.map((e, i) => <ScholarlyEntryRow key={i} e={e} />)}
        </div>
      )}
    </div>
  );
}

function ScholarlyEntryRow({ e }) {
  return (
    <div style={{ padding: 9, borderRadius: 6, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 6 }}>
      {e.arabic && <p className="font-amiri" style={{ direction: "rtl", textAlign: "right", color: G.text, fontSize: 15, margin: "0 0 5px 0", lineHeight: 1.9 }}>{e.arabic}</p>}
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.82)", margin: "0 0 5px 0", whiteSpace: "pre-wrap" }}>{e.text}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 10, color: G.dim, fontFamily: "Inter, sans-serif" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><FileText style={{ width: 10, height: 10 }} /> {e.citation || "—"}</span>
        {e.language && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Languages style={{ width: 10, height: 10 }} /> {e.language}</span>}
        {e.confidence != null && <span style={{ color: e.confidence >= 80 ? "#86efac" : e.confidence >= 50 ? "#fbbf24" : "#f87171" }}>{e.confidence}% conf.</span>}
      </div>
    </div>
  );
}

function PageResultCard({ r, query, onOpenCitation }) {
  const [open, setOpen] = useState(false);
  const c = r.citation || {};
  return (
    <div style={{ borderRadius: 9, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, marginBottom: 8, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 12px", background: "transparent", border: "none", cursor: "pointer" }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, color: G.text }}>p.{r.page_number}</span>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.30)" }}>{r.cloud_source}</span>
        {r.duplicate_status !== "Unique" && <span style={{ fontFamily: "Inter, sans-serif", fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.40)" }}><GitMerge style={{ width: 9, height: 9, verticalAlign: "middle", marginRight: 3 }} />{r.duplicate_status}</span>}
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: G.dim, marginLeft: "auto" }}>OCR {r.ocr_confidence}%</span>
      </button>
      {open && (
        <div style={{ padding: "0 12px 12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => onOpenCitation && onOpenCitation(r)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 7, cursor: "pointer", background: "rgba(212,175,55,0.10)", border: `1px solid ${G.border}`, color: G.text, fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600, margin: "8px 0" }}>
            <FileText style={{ width: 12, height: 12 }} /> Open citation explorer
          </button>
          {r.arabic && <p className="font-amiri" style={{ direction: "rtl", textAlign: "right", color: G.text, fontSize: 16, margin: "8px 0", lineHeight: 1.9 }}>{r.arabic}</p>}
          <Row label="Verified Arabic"><span className="font-amiri" style={{ direction: "rtl", textAlign: "right", display: "block", color: G.text, fontSize: 15 }}>{r.verified_arabic || "—"}</span></Row>
          <Row label="English">{r.english || "—"}</Row>
          <Row label="Malayalam"><span className="font-malayalam" style={{ fontSize: 13 }}>{r.malayalam || "—"}</span></Row>
          <Row label="OCR text (original)"><pre style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.65)", whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 160, overflowY: "auto", margin: 0 }}>{r.ocr_text || "—"}</pre></Row>
          <Row label="Confidence score">{r.ocr_confidence}%</Row>
          <Row label="Duplicate status">{r.duplicate_status}</Row>
          {r.related_books && r.related_books.length > 0 && (
            <Row label="Related books">
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {r.related_books.map((rb, i) => <li key={i} style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.70)" }}>{rb.book_title} · p.{rb.page_number}{rb.author ? ` · ${rb.author}` : ""}</li>)}
              </ul>
            </Row>
          )}
          <Row label="Author">{c.author || "—"}</Row>
          <Row label="Book">{c.book_title || "—"}</Row>
          <Row label="Volume">{c.volume || "—"}</Row>
          <Row label="Page">{String(c.page ?? "—")}</Row>
          <Row label="Publisher">{c.publisher || "—"}</Row>
          <Row label="Edition">{c.edition || "—"}</Row>
          <Row label="Language">{c.language || "—"}</Row>
          <Row label="Content hash"><code style={{ fontFamily: "monospace", fontSize: 10, color: G.dim }}>{r.content_hash || "—"}</code></Row>
          {r.processing_date && <Row label="Processing date">{new Date(r.processing_date).toLocaleString()}</Row>}
        </div>
      )}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ marginBottom: 7 }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", margin: "0 0 2px 0" }}>{label}</p>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.82)", wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{children}</div>
    </div>
  );
}

function CloudGroup({ label, files, note }) {
  return (
    <div style={{ marginBottom: 10, padding: 11, borderRadius: 8, background: "rgba(255,255,255,0.02)", border: `1px solid ${G.border}` }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, color: G.text, margin: "0 0 6px 0" }}>{label}</p>
      {note ? (
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.55)", margin: 0 }}>{note}</p>
      ) : !files || files.length === 0 ? (
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.40)", margin: 0 }}>No matches.</p>
      ) : (
        files.map((f, i) => (
          <div key={f.id || i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: i < files.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <FileText style={{ width: 12, height: 12, color: G.dim, flexShrink: 0 }} />
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.75)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
            {f.view_link && <a href={f.view_link} target="_blank" rel="noreferrer" style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "#60a5fa" }}>open</a>}
          </div>
        ))
      )}
    </div>
  );
}

function Empty({ text }) {
  return <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: G.dim, margin: 0 }}>{text}</p>;
}