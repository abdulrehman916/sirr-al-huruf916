/**
 * MplPages — full-text search across MasterPdfPage.search_text,
 * duplicate detection (content_hash), correction workflow
 * (ocr_corrections append-only), AI classification display,
 * error/review flags. Owner-only (page-gated).
 */
import { useState, useEffect, useMemo } from "react";
import { Loader2, Search, Copy, AlertTriangle, CheckCircle2, Tag } from "lucide-react";
import { base44 } from "@/api/base44Client";

const G = { border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)", text: "#F5D060", dim: "rgba(212,175,55,0.55)", bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)" };

export default function MplPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [onlyReview, setOnlyReview] = useState(false);
  const [onlyDup, setOnlyDup] = useState(false);

  useEffect(() => {
    (async () => {
      try { setPages(await base44.entities.MasterPdfPage.list("-indexed_at", 200)); }
      catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  const hashCounts = useMemo(() => {
    const m = {};
    pages.forEach((p) => { if (p.content_hash) m[p.content_hash] = (m[p.content_hash] || 0) + 1; });
    return m;
  }, [pages]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pages.filter((p) => {
      if (onlyReview && !p.needs_owner_review) return false;
      if (onlyDup && !(p.content_hash && hashCounts[p.content_hash] > 1)) return false;
      if (!q) return true;
      return (p.search_text || "").toLowerCase().includes(q) || (p.ocr_text || "").toLowerCase().includes(q) || (p.arabic_text || "").toLowerCase().includes(q);
    });
  }, [pages, query, onlyReview, onlyDup, hashCounts]);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Loader2 className="animate-spin" style={{ width: 22, height: 22, color: G.text }} /></div>;

  const dupGroups = Object.values(hashCounts).filter((n) => n > 1).length;
  const reviewCount = pages.filter((p) => p.needs_owner_review).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search indexed page text…" style={{ flex: 1, minWidth: 200, padding: "9px 11px", borderRadius: 8, fontSize: 12, color: "#fff", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, outline: "none", fontFamily: "Inter, sans-serif" }} />
        <button onClick={() => setOnlyReview(!onlyReview)} style={{ padding: "9px 12px", borderRadius: 8, cursor: "pointer", background: onlyReview ? G.bgHi : "transparent", border: `1px solid ${G.border}`, color: onlyReview ? G.text : "rgba(255,255,255,0.55)", fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
          <AlertTriangle style={{ width: 12, height: 12 }} /> Needs review ({reviewCount})
        </button>
        <button onClick={() => setOnlyDup(!onlyDup)} style={{ padding: "9px 12px", borderRadius: 8, cursor: "pointer", background: onlyDup ? G.bgHi : "transparent", border: `1px solid ${G.border}`, color: onlyDup ? G.text : "rgba(255,255,255,0.55)", fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
          <Copy style={{ width: 12, height: 12 }} /> Duplicates ({dupGroups})
        </button>
      </div>

      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: G.dim, margin: "0 0 12px 0" }}>{filtered.length} of {pages.length} pages</p>

      {filtered.slice(0, 40).map((p) => <PageRow key={p.id} p={p} dup={p.content_hash && hashCounts[p.content_hash] > 1} />)}

      {filtered.length > 40 && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: 12 }}>Showing first 40 results. Refine your search to narrow.</p>}
    </div>
  );
}

function PageRow({ p, dup }) {
  const [open, setOpen] = useState(false);
  const cls = p.ai_classification || {};
  const clsKeys = Object.keys(cls).filter((k) => Array.isArray(cls[k]) && cls[k].length > 0);
  return (
    <div style={{ padding: 12, borderRadius: 9, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer", color: G.text, padding: 0, fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700 }}>
          p.{p.page_number}
        </button>
        {p.needs_owner_review && <span style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(252,165,165,0.15)", color: "#fca5a5", border: "1px solid rgba(252,165,165,0.40)" }}>NEEDS REVIEW</span>}
        {dup && <span style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.40)" }}>DUPLICATE</span>}
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: G.dim, marginLeft: "auto" }}>OCR {p.ocr_confidence ?? 100}%</span>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{p.review_status?.replace(/_/g, " ")}</span>
      </div>
      {open && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {p.arabic_text && <p className="font-amiri" style={{ direction: "rtl", textAlign: "right", color: G.text, fontSize: 14, margin: "0 0 8px 0" }}>{p.arabic_text.slice(0, 300)}</p>}
          <pre style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.70)", whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 200, overflowY: "auto", margin: "0 0 8px 0" }}>{(p.ocr_text || p.search_text || "").slice(0, 600)}</pre>
          {clsKeys.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
              {clsKeys.map((k) => (
                <span key={k} style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: "rgba(212,175,55,0.12)", color: G.text, border: `1px solid ${G.border}` }}>
                  <Tag style={{ width: 9, height: 9 }} /> {k} ({cls[k].length})
                </span>
              ))}
            </div>
          )}
          {(p.ocr_corrections || []).length > 0 && (
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 8 }}>
              <CheckCircle2 style={{ width: 11, height: 11, color: "#86efac", verticalAlign: "middle", marginRight: 4 }} />
              {(p.ocr_corrections || []).length} correction(s) appended (original preserved)
            </p>
          )}
        </div>
      )}
    </div>
  );
}