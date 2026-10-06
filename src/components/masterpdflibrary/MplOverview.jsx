/**
 * MplOverview — Master PDF Library overview: counts, processing queue,
 * sync status, review-needs, duplicate detection summary.
 * Owner-only (page-gated). Reads MasterPdfBook + MasterPdfPage.
 */
import { useState, useEffect } from "react";
import { Loader2, BookOpen, FileText, AlertTriangle, CheckCircle2, Copy, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";

const G = { border: "rgba(212,175,55,0.40)", text: "#F5D060", dim: "rgba(212,175,55,0.55)", bg: "rgba(212,175,55,0.07)" };

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div style={{ flex: "1 1 200px", minWidth: 200, padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Icon style={{ width: 16, height: 16, color: color || G.text }} />
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>{label}</span>
      </div>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 26, fontWeight: 700, color: "#fff", margin: 0 }}>{value}</p>
      {sub && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: G.dim, margin: "4px 0 0 0" }}>{sub}</p>}
    </div>
  );
}

export default function MplOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ books: 0, pages: 0, needsReview: 0, duplicates: 0, byStatus: {} });

  useEffect(() => {
    (async () => {
      try {
        const books = await base44.entities.MasterPdfBook.list("-upload_date", 200);
        const pages = await base44.entities.MasterPdfPage.list("-indexed_at", 200);
        const byStatus = {};
        (books || []).forEach((b) => { byStatus[b.extraction_status] = (byStatus[b.extraction_status] || 0) + 1; });
        const needsReview = (pages || []).filter((p) => p.needs_owner_review).length;
        const hashCount = {};
        (pages || []).forEach((p) => { if (p.content_hash) hashCount[p.content_hash] = (hashCount[p.content_hash] || 0) + 1; });
        const duplicates = Object.values(hashCount).filter((n) => n > 1).length;
        setStats({ books: (books || []).length, pages: (pages || []).length, needsReview, duplicates, byStatus });
      } catch (e) { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <Loader2 className="animate-spin" style={{ width: 22, height: 22, color: G.text }} />
      </div>
    );
  }

  const queue = Object.entries(stats.byStatus).filter(([k]) => k !== "completed");

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <StatCard icon={BookOpen} label="Books" value={stats.books} sub="Master library entries" />
        <StatCard icon={FileText} label="Indexed Pages" value={stats.pages} sub="MasterPdfPage records" />
        <StatCard icon={AlertTriangle} label="Needs Review" value={stats.needsReview} sub="Owner review pending" color="#fca5a5" />
        <StatCard icon={Copy} label="Duplicate Groups" value={stats.duplicates} sub="Same content_hash" color="#fbbf24" />
      </div>

      <div style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Clock style={{ width: 14, height: 14, color: G.text }} />
          <h3 style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: "#fff", margin: 0 }}>Processing Queue</h3>
        </div>
        {queue.length === 0 ? (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>
            <CheckCircle2 style={{ width: 13, height: 13, color: "#86efac", verticalAlign: "middle", marginRight: 6 }} />
            No books awaiting processing. All completed or none uploaded yet.
          </p>
        ) : (
          queue.map(([status, count]) => (
            <div key={status} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.70)", textTransform: "capitalize" }}>{status.replace(/_/g, " ")}</span>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: G.text }}>{count}</span>
            </div>
          ))
        )}
      </div>

      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", margin: 0 }}>
        Append-only · Server-side OCR · Source-linked · Owner-approved before publication. Cloud sync status is shown per-book in the Library tab.
      </p>
    </div>
  );
}