// ═══════════════════════════════════════════════════════════════
// AUDIT LOG PANEL — Purpose Dictionary
// ═══════════════════════════════════════════════════════════════
// Displays the full audit trail for all Purpose Dictionary operations.
// ISOLATED — only reads PurposeDictionaryAuditLog. Never touches any
// other entity, Mizan, Ritual, Calculation, or UI subsystem.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { Shield, Loader2, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
};

const ACTION_CONFIG = {
  BACKUP_CREATED: { color: "#60A5FA", label: "Backup Created" },
  BULK_IMPORT: { color: "#FBBF24", label: "Bulk Import" },
  IMPORT_COMPLETED: { color: "#4ADE80", label: "Import Completed" },
  IMPORT_FAILED: { color: "#F87171", label: "Import Failed" },
  ROLLBACK: { color: "#60A5FA", label: "Rollback" },
  RESTORE: { color: "#60A5FA", label: "Restore" },
  RECORD_CREATE: { color: "#4ADE80", label: "Record Created" },
  RECORD_UPDATE: { color: "#FBBF24", label: "Record Updated" },
  RECORD_DELETE: { color: "#F87171", label: "Record Deleted" },
  MERGE: { color: "#FBBF24", label: "Merge" },
  EXPORT: { color: "rgba(255,255,255,0.60)", label: "Export" },
  VERSION_DELETED: { color: "#F87171", label: "Version Deleted" },
};

const ACTION_FILTERS = ["ALL", "BACKUP_CREATED", "IMPORT_COMPLETED", "IMPORT_FAILED", "RESTORE", "RECORD_CREATE", "RECORD_UPDATE", "RECORD_DELETE"];

export default function AuditLogPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const result = await base44.entities.PurposeDictionaryAuditLog.list("-timestamp", 100);
      setLogs(result || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(); }, []);

  const filtered = logs.filter((l) => {
    if (filter !== "ALL" && l.action !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (l.performed_by_email || "").toLowerCase().includes(s) ||
             (l.details || "").toLowerCase().includes(s) ||
             (l.action || "").toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="rounded-xl overflow-hidden" style={{
      background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
      border: `1px solid ${G.border}`,
    }}>
      <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
            background: G.bg, border: `1px solid ${G.border}`,
          }}>
            <Shield className="w-5 h-5" style={{ color: G.text }} />
          </div>
          <div>
            <h3 className="font-inter text-sm font-bold" style={{ color: "#fff" }}>Audit Log</h3>
            <p className="font-inter text-[10px]" style={{ color: G.dim }}>
              Every import, update, delete, merge & restore
            </p>
          </div>
        </div>
        <button onClick={loadLogs} disabled={loading} className="font-inter text-xs px-2 py-1 rounded" style={{ color: G.dim, border: `1px solid ${G.border}` }}>
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Refresh"}
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 pt-3 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}` }}>
          <Search className="w-3 h-3" style={{ color: G.dim }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="font-inter text-xs bg-transparent outline-none w-32"
            style={{ color: "#fff" }}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {ACTION_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="font-inter text-[9px] px-2 py-1 rounded font-bold"
              style={{
                background: filter === f ? "rgba(212,175,55,0.15)" : "transparent",
                border: `1px solid ${filter === f ? G.border : "rgba(255,255,255,0.08)"}`,
                color: filter === f ? G.text : "rgba(255,255,255,0.40)",
              }}
            >
              {f === "ALL" ? "ALL" : ACTION_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {/* Log list */}
      <div className="p-4 space-y-1.5 max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: G.text }} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="font-inter text-xs text-center py-8" style={{ color: G.dim }}>
            No audit entries found.
          </p>
        ) : (
          filtered.map((log) => {
            const cfg = ACTION_CONFIG[log.action] || { color: G.text, label: log.action };
            let details = {};
            try { details = JSON.parse(log.details || "{}"); } catch { /* keep empty */ }
            return (
              <div key={log.log_id} className="rounded-lg p-2.5 flex items-start gap-3" style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid rgba(212,175,55,0.12)`,
              }}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: cfg.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-inter text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="font-inter text-[9px]" style={{ color: G.dim }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                    </span>
                  </div>
                  <p className="font-inter text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {log.performed_by_email || "admin"}
                    {log.record_count > 0 && ` · ${log.record_count} records`}
                    {log.version_id && ` · ${log.version_id}`}
                  </p>
                  {Object.keys(details).length > 0 && (
                    <p className="font-inter text-[9px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {JSON.stringify(details).slice(0, 120)}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}