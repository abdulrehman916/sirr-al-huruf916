/**
 * OwnerPendingReviews — OWNER-ONLY Owner Review & Approval System.
 *
 * The mandatory gate between the processing pipeline and the knowledge
 * base. Every processed MasterPdfPage appears here for Owner review.
 * Nothing is published automatically; only Owner-approved pages ever
 * reach Holy Names / Sections A·B·C / Abjad / Bast / Wafq / Vefk /
 * Mizan / Khadim / Astrology and all future modules.
 *
 * Gating (defense in depth):
 *   1. rbac ROUTE_ACCESS — route is roles:[OWNER] only.
 *   2. AdminLayout sidebar — section shown only to Owner.
 *   3. This page — client role check (defensive).
 *   4. Backend (reviewMasterPdfPage) — Owner-only server-side (403).
 *   5. Entity RLS — MasterPdfPage/SirrAuditLog admin-only.
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Loader2, CheckCircle2, XCircle, RotateCcw, Edit3, StickyNote, HelpCircle, RefreshCw, GitMerge, ExternalLink, ImageIcon, Scale, Search, Filter } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import MplReviewDrawer from "@/components/masterpdflibrary/MplReviewDrawer";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)",
};

const TABS = [
  { id: "pending", label: "Pending Review" },
  { id: "rejected", label: "Rejected (History)" },
  { id: "approved", label: "Approved" },
  { id: "all", label: "All Pages" },
];

export default function OwnerPendingReviews() {
  const { role } = useAuth();
  const [tab, setTab] = useState("pending");
  const [pages, setPages] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [onlyLowConf, setOnlyLowConf] = useState(false);
  const [onlyDup, setOnlyDup] = useState(false);
  const [selected, setSelected] = useState(null); // MasterPdfPage record
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allPages, allBooks] = await Promise.all([
        base44.entities.MasterPdfPage.list("-indexed_at", 300),
        base44.entities.MasterPdfBook.list("-upload_date", 200),
      ]);
      setPages(allPages);
      setBooks(allBooks);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const bookMap = useMemo(() => {
    const m = {};
    (books || []).forEach((b) => { m[b.master_book_id] = b; });
    return m;
  }, [books]);

  const hashCounts = useMemo(() => {
    const m = {};
    (pages || []).forEach((p) => { if (p.content_hash) m[p.content_hash] = (m[p.content_hash] || 0) + 1; });
    return m;
  }, [pages]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (pages || []).filter((p) => {
      if (tab === "pending" && p.review_status !== "pending_review") return false;
      if (tab === "rejected" && p.review_status !== "rejected" && p.review_status !== "ignored") return false;
      if (tab === "approved" && p.review_status !== "approved" && p.review_status !== "verified") return false;
      if (onlyLowConf && (p.ocr_confidence ?? 100) >= 100) return false;
      if (onlyDup && !(p.content_hash && hashCounts[p.content_hash] > 1)) return false;
      if (!q) return true;
      return (p.search_text || "").toLowerCase().includes(q) || (p.arabic_text || "").toLowerCase().includes(q) || (p.ocr_text || "").toLowerCase().includes(q);
    });
  }, [pages, tab, query, onlyLowConf, onlyDup, hashCounts]);

  const stats = useMemo(() => ({
    pending: (pages || []).filter((p) => p.review_status === "pending_review").length,
    rejected: (pages || []).filter((p) => p.review_status === "rejected" || p.review_status === "ignored").length,
    approved: (pages || []).filter((p) => p.review_status === "approved" || p.review_status === "verified").length,
    needsReview: (pages || []).filter((p) => p.needs_owner_review).length,
  }), [pages]);

  if (role !== "owner") {
    return (
      <AdminLayout title="Pending Reviews">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
          <ShieldAlert style={{ width: 48, height: 48, color: "#fca5a5" }} />
          <h2 style={{ fontFamily: "Inter, sans-serif", color: "#fff", fontSize: 18, margin: 0 }}>Owner Access Required</h2>
          <p style={{ fontFamily: "Inter, sans-serif", color: "rgba(255,255,255,0.50)", fontSize: 13, margin: 0, textAlign: "center", maxWidth: 420 }}>
            The Owner Review &amp; Approval System is the private gate of the project Owner. No other role may review or approve knowledge.
          </p>
        </div>
      </AdminLayout>
    );
  }

  const onActionComplete = () => {
    setSelected(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <AdminLayout title="Pending Reviews" subtitle="Owner Knowledge Management">
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: "Inter, sans-serif", color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 4px 0" }}>
          Owner Review &amp; Approval
        </h1>
        <p style={{ fontFamily: "Inter, sans-serif", color: G.dim, fontSize: 11, margin: 0, letterSpacing: "0.04em" }}>
          Nothing is published automatically · Only Owner-approved knowledge enters the database · Append-only · Fully audited
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 16 }}>
        <StatCard label="Pending Review" value={stats.pending} color="#fca5a5" />
        <StatCard label="Needs Review (flagged)" value={stats.needsReview} color="#fbbf24" />
        <StatCard label="Rejected / Merged" value={stats.rejected} color="#f87171" />
        <StatCard label="Approved" value={stats.approved} color="#86efac" />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12, padding: 5, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}` }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "7px 12px", borderRadius: 7, cursor: "pointer",
              background: active ? G.bgHi : "transparent", border: active ? `1px solid ${G.borderHi}` : "1px solid transparent",
              color: active ? G.text : "rgba(255,255,255,0.55)", fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: active ? 700 : 500,
            }}>{t.label}</button>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search page text, Arabic, Malayalam…" style={{ width: "100%", padding: "9px 11px 9px 30px", borderRadius: 8, fontSize: 12, color: "#fff", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, outline: "none", fontFamily: "Inter, sans-serif" }} />
        </div>
        <button onClick={() => setOnlyLowConf(!onlyLowConf)} style={{ padding: "9px 12px", borderRadius: 8, cursor: "pointer", background: onlyLowConf ? G.bgHi : "transparent", border: `1px solid ${G.border}`, color: onlyLowConf ? G.text : "rgba(255,255,255,0.55)", fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
          <Filter style={{ width: 12, height: 12 }} /> Low confidence
        </button>
        <button onClick={() => setOnlyDup(!onlyDup)} style={{ padding: "9px 12px", borderRadius: 8, cursor: "pointer", background: onlyDup ? G.bgHi : "transparent", border: `1px solid ${G.border}`, color: onlyDup ? G.text : "rgba(255,255,255,0.55)", fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
          <GitMerge style={{ width: 12, height: 12 }} /> Duplicates
        </button>
      </div>

      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: G.dim, margin: "0 0 12px 0" }}>{filtered.length} page(s){loading ? " · loading…" : ""}</p>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Loader2 className="animate-spin" style={{ width: 22, height: 22, color: G.text }} /></div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}` }}>
          <CheckCircle2 style={{ width: 28, height: 28, color: "#86efac", marginBottom: 8 }} />
          <p style={{ fontFamily: "Inter, sans-serif", color: "rgba(255,255,255,0.60)", fontSize: 12, margin: 0 }}>No pages in this view. Processed pages will appear here for your review.</p>
        </div>
      ) : (
        filtered.slice(0, 60).map((p) => (
          <ReviewCard key={p.id} p={p} book={bookMap[p.master_book_id]} dup={!!(p.content_hash && hashCounts[p.content_hash] > 1)} dupCount={p.content_hash ? hashCounts[p.content_hash] : 0} onOpen={() => setSelected(p)} />
        ))
      )}

      {filtered.length > 60 && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: 12 }}>Showing first 60. Refine your search to narrow.</p>}

      <AnimatePresence>
        {selected && (
          <MplReviewDrawer
            page={selected}
            book={bookMap[selected.master_book_id]}
            dupCount={selected.content_hash ? hashCounts[selected.content_hash] : 0}
            allBooks={books}
            allPages={pages}
            onClose={() => setSelected(null)}
            onChanged={onActionComplete}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ padding: 12, borderRadius: 9, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}` }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", margin: "0 0 4px 0" }}>{label}</p>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 20, fontWeight: 700, color, margin: 0 }}>{value}</p>
    </div>
  );
}

function ReviewCard({ p, book, dup, dupCount, onOpen }) {
  const statusColor = p.review_status === "approved" ? "#86efac" : p.review_status === "rejected" || p.review_status === "ignored" ? "#f87171" : "#fca5a5";
  return (
    <button onClick={onOpen} style={{ display: "block", width: "100%", textAlign: "left", padding: 12, borderRadius: 9, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, marginBottom: 8, cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, color: G.text }}>p.{p.page_number}</span>
        {p.needs_owner_review && <span style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(252,165,165,0.15)", color: "#fca5a5", border: "1px solid rgba(252,165,165,0.40)" }}>NEEDS REVIEW</span>}
        {dup && <span style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.40)" }}>DUP ×{dupCount}</span>}
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 600, color: statusColor, marginLeft: "auto", textTransform: "capitalize" }}>{(p.review_status || "").replace(/_/g, " ")}</span>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: G.dim }}>OCR {p.ocr_confidence ?? 100}%</span>
      </div>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.50)", margin: "4px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {book?.book_title || p.master_book_id}{book?.author ? ` — ${book.author}` : ""}
      </p>
      {p.arabic_text && <p className="font-amiri" style={{ direction: "rtl", textAlign: "right", color: G.dim, fontSize: 13, margin: "4px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.arabic_text.slice(0, 80)}</p>}
    </button>
  );
}