// ═══════════════════════════════════════════════════════════════
// IMPORT REPORT — Purpose Dictionary bulk import results display
// ═══════════════════════════════════════════════════════════════
// Isolated: only displays import statistics. Never reads/writes
// any other entity, Mizan, calculation, or UI subsystem.
// ═══════════════════════════════════════════════════════════════
import { CheckCircle2, XCircle, RefreshCw, Layers, Copy, AlertCircle } from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
};

export default function ImportReport({ report, onClose }) {
  if (!report) return null;

  const stats = [
    { label: "Total Rows", value: report.total, color: "#fff", icon: <Layers className="w-4 h-4" /> },
    { label: "Imported", value: report.imported, color: "#4ADE80", icon: <CheckCircle2 className="w-4 h-4" /> },
    { label: "Updated", value: report.updated, color: "#60A5FA", icon: <RefreshCw className="w-4 h-4" /> },
    { label: "Skipped", value: report.skipped, color: "rgba(255,255,255,0.50)", icon: <XCircle className="w-4 h-4" /> },
    { label: "Duplicates Merged", value: report.duplicatesMerged, color: "#FBBF24", icon: <Copy className="w-4 h-4" /> },
    { label: "Errors", value: report.errors?.length || 0, color: "#F87171", icon: <AlertCircle className="w-4 h-4" /> },
  ];

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        border: `1px solid ${G.border}`,
        boxShadow: "0 4px 32px rgba(0,0,0,0.55)",
      }}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-inter text-sm font-bold" style={{ color: G.text }}>
          Import Report
        </h4>
        <button
          onClick={onClose}
          className="font-inter text-xs px-2 py-1 rounded"
          style={{ color: G.dim, border: `1px solid ${G.border}` }}
        >
          Dismiss
        </button>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg p-2.5"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(212,175,55,0.18)` }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span style={{ color: s.color }}>{s.icon}</span>
              <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>
                {s.label}
              </p>
            </div>
            <p className="font-inter text-lg font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Error list */}
      {report.errors && report.errors.length > 0 && (
        <div
          className="rounded-lg p-2.5 max-h-32 overflow-y-auto"
          style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.20)" }}
        >
          <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "rgba(248,113,113,0.70)" }}>
            Error Details
          </p>
          {report.errors.slice(0, 50).map((err, i) => (
            <p key={i} className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>
              {err}
            </p>
          ))}
          {report.errors.length > 50 && (
            <p className="font-inter text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              ...and {report.errors.length - 50} more
            </p>
          )}
        </div>
      )}
    </div>
  );
}