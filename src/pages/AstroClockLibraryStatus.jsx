import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, CheckCircle, Clock, AlertTriangle, FileX, FileWarning,
  FilePlus, Library,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { base44 } from "@/api/base44Client";

const P = {
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(245,208,96,0.55)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
  cardBg: "rgba(8,16,38,0.80)",
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-4"
      style={{ borderColor: P.border, background: P.cardBg }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: P.bgHi, border: `1px solid ${P.border}` }}
        >
          <Icon className="w-5 h-5" style={{ color: color || P.text }} />
        </div>
        <div className="min-w-0">
          <p className="font-inter text-2xl font-bold leading-none" style={{ color: color || P.text }}>
            {value}
          </p>
          <p className="font-inter text-[9px] uppercase tracking-widest mt-1" style={{ color: P.dim }}>
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function AstroClockLibraryStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await base44.functions.invoke("getAstroClockLibraryStatus", {});
      setStatus(result.data || result);
    } catch (err) {
      setError(err.message || "Failed to load library status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const lib = status?.library_status || {};
  const rescanBooks = status?.books_needing_rescan || [];
  const scanStatus = status?.scan_status || "idle";
  const scanMeta = status?.scan_metadata || {};

  const statusColor =
    scanStatus === "completed" ? "#34d399" : scanStatus === "in_progress" ? "#60a5fa" : "rgba(255,255,255,0.40)";

  return (
    <PageLayout>
      <div className="space-y-4">
        <PageTitle
          arabic="حالة المكتبة"
          latin="Library Status"
          subtitle="Astro Clock Archive Dashboard"
          icon="📊"
        />

        {/* Scanner state badge + refresh */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-inter text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border"
              style={{
                borderColor: statusColor,
                color: statusColor,
                background: `${statusColor}11`,
              }}
            >
              Scanner: {scanStatus}
            </span>
            {scanMeta.completedAt && (
              <span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.30)" }}>
                Completed: {new Date(scanMeta.completedAt).toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={loadStatus}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border"
            style={{ borderColor: P.border, background: P.bg, color: P.dim }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="font-inter text-[10px] uppercase tracking-widest">Refresh</span>
          </button>
        </div>

        {loading && !status ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12" style={{ color: "#ef4444" }}>
            {error}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* ── Stat cards ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <StatCard icon={Library} label="Total Books" value={lib.total_books || 0} />
                <StatCard icon={CheckCircle} label="Completed" value={lib.completed || 0} color="#34d399" />
                <StatCard icon={Clock} label="In Progress" value={lib.in_progress || 0} color="#60a5fa" />
                <StatCard icon={AlertTriangle} label="Needs Rescan" value={lib.needs_rescan || 0} color="#fbbf24" />
                <StatCard icon={FileX} label="Failed" value={lib.failed || 0} color="#f87171" />
                <StatCard icon={FileWarning} label="Corrupt" value={lib.corrupt || 0} color="#f87171" />
                <StatCard icon={FilePlus} label="Newly Imported" value={lib.newly_imported || 0} color="#a78bfa" />
              </div>

              {/* ── Cumulative scan stats ── */}
              {scanMeta.pagesProcessed > 0 && (
                <div className="rounded-2xl border p-4" style={{ borderColor: P.border, background: P.cardBg }}>
                  <h3 className="font-inter text-sm font-bold mb-3" style={{ color: P.text }}>
                    Cumulative Scan Statistics
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: P.dim }}>
                        Pages Scanned
                      </p>
                      <p className="font-inter text-lg font-bold" style={{ color: "rgba(255,255,255,0.88)" }}>
                        {scanMeta.pagesProcessed || 0}
                      </p>
                    </div>
                    <div>
                      <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: P.dim }}>
                        Total Findings
                      </p>
                      <p className="font-inter text-lg font-bold" style={{ color: "rgba(255,255,255,0.88)" }}>
                        {scanMeta.findingsTotal || 0}
                      </p>
                    </div>
                    <div>
                      <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: P.dim }}>
                        Total Citations
                      </p>
                      <p className="font-inter text-lg font-bold" style={{ color: "rgba(255,255,255,0.88)" }}>
                        {scanMeta.citationsTotal || 0}
                      </p>
                    </div>
                    <div>
                      <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: P.dim }}>
                        Cross-Links
                      </p>
                      <p className="font-inter text-lg font-bold" style={{ color: "rgba(255,255,255,0.88)" }}>
                        {scanMeta.crossLinksTotal || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Books needing rescan ── */}
              {rescanBooks.length > 0 && (
                <div
                  className="rounded-2xl border p-4"
                  style={{ borderColor: "rgba(251,191,36,0.40)", background: "rgba(251,191,36,0.06)" }}
                >
                  <h3 className="font-inter text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#fbbf24" }}>
                    <AlertTriangle className="w-4 h-4" />
                    Updated Books Waiting for Rescan ({rescanBooks.length})
                  </h3>
                  <div className="space-y-2">
                    {rescanBooks.map((b, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg px-3 py-2"
                        style={{
                          background: "rgba(251,191,36,0.04)",
                          border: "1px solid rgba(251,191,36,0.20)",
                        }}
                      >
                        <div className="min-w-0">
                          <p className="font-inter text-sm font-semibold truncate" style={{ color: "rgba(255,255,255,0.88)" }}>
                            {b.book_title || b.book_id}
                          </p>
                          <p className="font-inter text-[9px]" style={{ color: P.dim }}>
                            Last scanned:{" "}
                            {b.last_scan_date ? new Date(b.last_scan_date).toLocaleDateString() : "N/A"}
                            {" · "}Scan v{b.scan_version || 1}
                          </p>
                        </div>
                        <span
                          className="font-inter text-[8px] uppercase tracking-widest px-2 py-1 rounded-full whitespace-nowrap"
                          style={{
                            color: "#fbbf24",
                            background: "rgba(251,191,36,0.12)",
                            border: "1px solid rgba(251,191,36,0.30)",
                          }}
                        >
                          Content Changed
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Full book list ── */}
              <div className="rounded-2xl border p-4" style={{ borderColor: P.border, background: P.cardBg }}>
                <h3 className="font-inter text-sm font-bold mb-3" style={{ color: P.text }}>
                  All Books ({status?.books?.length || 0})
                </h3>
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto scrollbar-none">
                  {(status?.books || []).map((b, i) => {
                    const sc =
                      b.status === "completed"
                        ? "#34d399"
                        : b.status === "needs_rescan"
                          ? "#fbbf24"
                          : b.status === "in_progress"
                            ? "#60a5fa"
                            : "rgba(255,255,255,0.40)";
                    const sl =
                      b.status === "completed"
                        ? "✓ Done"
                        : b.status === "needs_rescan"
                          ? "⚠ Rescan"
                          : b.status === "in_progress"
                            ? "◐ Scanning"
                            : "○ New";
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg px-3 py-2"
                        style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${P.border}` }}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-inter text-sm font-semibold truncate"
                            style={{ color: "rgba(255,255,255,0.82)" }}
                          >
                            {b.book_title || b.book_id}
                          </p>
                          <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.30)" }}>
                            {b.pages_scanned || 0} / {(b.pages_scanned || 0) + (b.pages_remaining || 0)} pages
                            {b.last_scan_date ? ` · ${new Date(b.last_scan_date).toLocaleDateString()}` : ""}
                            {b.scan_version ? ` · v${b.scan_version}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {b.completion_percentage != null && (
                            <div
                              className="w-16 h-1.5 rounded-full overflow-hidden"
                              style={{ background: "rgba(255,255,255,0.06)" }}
                            >
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${b.completion_percentage}%`, background: sc }}
                              />
                            </div>
                          )}
                          <span
                            className="font-inter text-[8px] uppercase tracking-widest whitespace-nowrap"
                            style={{ color: sc }}
                          >
                            {sl}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {(!status?.books || status.books.length === 0) && (
                    <p
                      className="text-center py-8 font-inter text-xs"
                      style={{ color: "rgba(255,255,255,0.22)" }}
                    >
                      No books found in the library
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </PageLayout>
  );
}