// ═══════════════════════════════════════════════════════════════
// VERSION HISTORY PANEL — Purpose Dictionary
// ═══════════════════════════════════════════════════════════════
// Displays version snapshots, allows manual restore + delete.
// ISOLATED — only reads PurposeDictionaryVersion + calls
// restorePurposeDictionary backend function. Never touches any
// other entity, Mizan, Ritual, Calculation, or UI subsystem.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { History, RotateCcw, Trash2, Loader2, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
};

const STATUS_CONFIG = {
  pending: { color: "#FBBF24", icon: <Clock className="w-3.5 h-3.5" />, label: "Pending" },
  completed: { color: "#4ADE80", icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "Completed" },
  failed: { color: "#F87171", icon: <XCircle className="w-3.5 h-3.5" />, label: "Failed" },
  rolled_back: { color: "#60A5FA", icon: <RefreshCw className="w-3.5 h-3.5" />, label: "Restored" },
};

export default function VersionHistoryPanel({ onRestored }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);
  const [message, setMessage] = useState("");

  const loadVersions = async () => {
    setLoading(true);
    try {
      const result = await base44.entities.PurposeDictionaryVersion.list("-created_at", 50);
      setVersions(result || []);
    } catch {
      setVersions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVersions(); }, []);

  const handleRestore = async (versionId, label) => {
    if (!confirm(`Restore Purpose Dictionary from "${label}"?\n\nThis will REPLACE all current records with the snapshot. This cannot be undone.`)) return;
    setActioning(versionId);
    setMessage("Deleting current records + downloading snapshot...");
    try {
      const res = await base44.functions.invoke("restorePurposeDictionary", { version_id: versionId });
      const r = res.data || {};
      // Client-side recreation: download snapshot + bulkCreate in chunks
      if (r.snapshot_file_url) {
        setMessage(`Recreating ${r.record_count} records from snapshot...`);
        const fileRes = await fetch(r.snapshot_file_url);
        const json = await fileRes.text();
        const records = JSON.parse(json);
        for (let i = 0; i < records.length; i += 250) {
          const chunk = records.slice(i, i + 250);
          await base44.entities.PurposeDictionary.bulkCreate(chunk);
        }
      }
      setMessage(`Restored ${r.record_count} records from snapshot (deleted ${r.deleted_count}).`);
      if (onRestored) onRestored();
    } catch (err) {
      setMessage("Restore failed: " + (err.message || "Unknown error"));
    } finally {
      setActioning(null);
    }
  };

  const handleDelete = async (versionId, label) => {
    if (!confirm(`Delete version "${label}"?\n\nThe snapshot file will be orphaned but the version record will be removed permanently.`)) return;
    setActioning(versionId);
    setMessage("");
    try {
      const records = await base44.entities.PurposeDictionaryVersion.filter({ version_id: versionId }, null, 1);
      if (records && records.length > 0) {
        await base44.entities.PurposeDictionaryVersion.delete(records[0].id);
      }
      setMessage("Version deleted.");
      loadVersions();
    } catch (err) {
      setMessage("Delete failed: " + (err.message || "Unknown error"));
    } finally {
      setActioning(null);
    }
  };

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
            <History className="w-5 h-5" style={{ color: G.text }} />
          </div>
          <div>
            <h3 className="font-inter text-sm font-bold" style={{ color: "#fff" }}>Version History</h3>
            <p className="font-inter text-[10px]" style={{ color: G.dim }}>
              Pre-import snapshots for rollback & restore
            </p>
          </div>
        </div>
        <button onClick={loadVersions} disabled={loading} className="font-inter text-xs px-2 py-1 rounded" style={{ color: G.dim, border: `1px solid ${G.border}` }}>
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Refresh"}
        </button>
      </div>

      {message && (
        <div className="px-4 pt-3">
          <div className="rounded-lg p-2" style={{
            background: message.includes("failed") ? "rgba(248,113,113,0.10)" : "rgba(74,222,128,0.10)",
            border: `1px solid ${message.includes("failed") ? "rgba(248,113,113,0.30)" : "rgba(74,222,128,0.30)"}`,
          }}>
            <p className="font-inter text-xs" style={{ color: message.includes("failed") ? "#F87171" : "#4ADE80" }}>{message}</p>
          </div>
        </div>
      )}

      <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: G.text }} />
          </div>
        ) : versions.length === 0 ? (
          <p className="font-inter text-xs text-center py-8" style={{ color: G.dim }}>
            No versions yet. A snapshot is created automatically before each bulk import.
          </p>
        ) : (
          versions.map((v) => {
            const status = STATUS_CONFIG[v.import_status] || STATUS_CONFIG.pending;
            const report = v.import_report || {};
            return (
              <div key={v.version_id} className="rounded-lg p-3" style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid rgba(212,175,55,0.18)`,
              }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-xs font-bold truncate" style={{ color: "#fff" }}>
                      {v.version_label}
                    </p>
                    <p className="font-inter text-[10px]" style={{ color: G.dim }}>
                      {v.created_at ? new Date(v.created_at).toLocaleString() : "—"} · {v.created_by_email || "admin"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded" style={{
                    background: `${status.color}15`, border: `1px solid ${status.color}40`,
                  }}>
                    <span style={{ color: status.color }}>{status.icon}</span>
                    <span className="font-inter text-[10px] font-bold" style={{ color: status.color }}>{status.label}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-inter text-[10px]" style={{ color: G.dim }}>
                    Records: <span style={{ color: "#fff" }}>{v.record_count}</span>
                  </span>
                  {report.total > 0 && (
                    <>
                      <span className="font-inter text-[10px]" style={{ color: G.dim }}>
                        Import: <span style={{ color: "#4ADE80" }}>{report.imported} new</span> · <span style={{ color: "#60A5FA" }}>{report.updated} updated</span> · <span style={{ color: "#FBBF24" }}>{report.duplicatesMerged} merged</span>
                      </span>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(v.version_id, v.version_label)}
                    disabled={actioning === v.version_id}
                    className="font-inter text-[10px] px-2 py-1 rounded flex items-center gap-1"
                    style={{ color: G.text, border: `1px solid ${G.border}`, background: G.bg }}
                  >
                    {actioning === v.version_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                    Restore
                  </button>
                  <button
                    onClick={() => handleDelete(v.version_id, v.version_label)}
                    disabled={actioning === v.version_id}
                    className="font-inter text-[10px] px-2 py-1 rounded flex items-center gap-1"
                    style={{ color: "rgba(248,113,113,0.70)", border: "1px solid rgba(248,113,113,0.25)" }}
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}