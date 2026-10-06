/**
 * MplLibrary — MasterPdfBook list: processing queue, review status,
 * source verification, version history, error detection, sync status.
 * Owner-only (page-gated). Reads MasterPdfBook.
 */
import { useState, useEffect } from "react";
import { Loader2, BookOpen, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Clock, History, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";

const G = { border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)", text: "#F5D060", dim: "rgba(212,175,55,0.55)", bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)" };

const STATUS_COLOR = {
  uploading: "#fbbf24", pending: "#93c5fd", processing: "#fbbf24", pending_verification: "#a78bfa",
  completed: "#86efac", failed: "#fca5a5", partial: "#fbbf24", paused: "#94a3b8",
};

function BookCard({ book, onReview }) {
  const [open, setOpen] = useState(false);
  const sc = STATUS_COLOR[book.extraction_status] || "#fff";
  return (
    <div style={{ padding: 13, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer", color: G.text, padding: 0 }}>
          {open ? <ChevronDown style={{ width: 15, height: 15 }} /> : <ChevronRight style={{ width: 15, height: 15 }} />}
        </button>
        <BookOpen style={{ width: 15, height: 15, color: G.text }} />
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: "#fff", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {book.malayalam_book_name || book.book_title}
        </span>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, background: `${sc}22`, color: sc, border: `1px solid ${sc}55`, textTransform: "capitalize" }}>
          {book.extraction_status?.replace(/_/g, " ")}
        </span>
      </div>

      {open && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Row label="Book title" value={book.book_title} />
          <Row label="Author" value={book.author || "—"} />
          <Row label="Import source" value={book.import_source} />
          <Row label="Total pages" value={book.combined_total_pages || 0} />
          <Row label="Parts" value={(book.pdf_parts || []).length} />
          <Row label="Owner review" value={book.owner_review_status?.replace(/_/g, " ")} />
          <Row label="Cross-verification" value={book.cross_verification_status} />
          <Row label="Supporting sources" value={book.supporting_sources_count || 1} />
          {book.extraction_error && <Row label="Error" value={book.extraction_error} accent="#fca5a5" />}
          {book.last_verified_at && <Row label="Last verified" value={new Date(book.last_verified_at).toLocaleString()} />}
          {book.last_backup_at && <Row label="Last backup" value={new Date(book.last_backup_at).toLocaleString()} />}

          {/* Source link / sync */}
          {book.adobe_file_id && <Row label="Adobe file ID" value={book.adobe_file_id} mono />}
          {book.onedrive_file_id && <Row label="OneDrive file ID" value={book.onedrive_file_id} mono />}
          {book.onedrive_etag && <Row label="OneDrive ETag" value={book.onedrive_etag} mono />}

          {/* Version history */}
          <div style={{ marginTop: 10, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <History style={{ width: 12, height: 12, color: G.dim }} />
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: G.dim }}>Version history ({(book.version_history || []).length})</span>
          </div>
          {(book.version_history || []).slice(-5).reverse().map((v, i) => (
            <div key={i} style={{ padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.65)" }}>{v.action}</span>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", marginLeft: 8 }}>{v.timestamp ? new Date(v.timestamp).toLocaleString() : ""}</span>
              {v.change_summary && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.45)", margin: "2px 0 0 0" }}>{v.change_summary}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, accent, mono }) {
  return (
    <div style={{ display: "flex", gap: 8, padding: "4px 0" }}>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.40)", minWidth: 120 }}>{label}</span>
      <span style={{ fontFamily: mono ? "monospace" : "Inter, sans-serif", fontSize: 11, color: accent || "rgba(255,255,255,0.80)", flex: 1, wordBreak: "break-word" }}>{value || "—"}</span>
    </div>
  );
}

export default function MplLibrary() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setBooks(await base44.entities.MasterPdfBook.list("-upload_date", 100)); }
      catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Loader2 className="animate-spin" style={{ width: 22, height: 22, color: G.text }} /></div>;
  if (!books.length) return <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>No books in the Master Library yet. Upload a PDF or connect a cloud library.</p>;

  const queue = books.filter((b) => b.extraction_status !== "completed");
  const done = books.filter((b) => b.extraction_status === "completed");

  return (
    <div>
      {queue.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Clock style={{ width: 13, height: 13, color: "#fbbf24" }} />
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, color: "#fbbf24" }}>Processing Queue ({queue.length})</span>
          </div>
          {queue.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      )}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <CheckCircle2 style={{ width: 13, height: 13, color: "#86efac" }} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, color: "#86efac" }}>Completed ({done.length})</span>
        </div>
        {done.map((b) => <BookCard key={b.id} book={b} />)}
      </div>
    </div>
  );
}