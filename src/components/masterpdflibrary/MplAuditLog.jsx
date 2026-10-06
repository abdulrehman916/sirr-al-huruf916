/**
 * MplAuditLog — Master PDF Library audit trail viewer.
 * Reads SirrAuditLog (the archival audit entity — shared by the SIRR
 * module and the Master Library). Append-only display. Owner-only.
 */
import { useState, useEffect } from "react";
import { Loader2, ScrollText, Filter } from "lucide-react";
import { base44 } from "@/api/base44Client";

const G = { border: "rgba(212,175,55,0.40)", text: "#F5D060", dim: "rgba(212,175,55,0.55)", bg: "rgba(212,175,55,0.07)" };

const ACTIONS = ["upload", "extract_chunk", "extract_complete", "extract_failed", "retry", "verify", "rebuild", "export", "backup", "restore", "integrity_check"];

export default function MplAuditLog() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const filter = action ? { action } : {};
        setRows(await base44.entities.SirrAuditLog.filter(filter, "-timestamp", 100));
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, [action]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Filter style={{ width: 13, height: 13, color: G.dim }} />
        <select value={action} onChange={(e) => setAction(e.target.value)} style={{ padding: "7px 10px", borderRadius: 7, fontSize: 11, color: "#fff", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, outline: "none", fontFamily: "Inter, sans-serif" }}>
          <option value="">All actions</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Loader2 className="animate-spin" style={{ width: 22, height: 22, color: G.text }} /></div>
      ) : rows.length === 0 ? (
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>No audit entries yet.</p>
      ) : (
        rows.map((r) => (
          <div key={r.id} style={{ padding: 11, borderRadius: 9, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <ScrollText style={{ width: 13, height: 13, color: G.text }} />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: "#fff", textTransform: "capitalize" }}>{r.action?.replace(/_/g, " ")}</span>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, marginLeft: "auto", background: r.status === "success" ? "rgba(34,197,94,0.15)" : r.status === "failed" ? "rgba(252,165,165,0.15)" : "rgba(255,255,255,0.05)", color: r.status === "success" ? "#86efac" : r.status === "failed" ? "#fca5a5" : "rgba(255,255,255,0.60)" }}>{r.status}</span>
            </div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.45)", margin: "0 0 4px 0" }}>{r.timestamp ? new Date(r.timestamp).toLocaleString() : "—"}</p>
            {r.details && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.70)", margin: "0 0 4px 0", wordBreak: "break-word" }}>{r.details}</p>}
            <div style={{ display: "flex", gap: 10, fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.40)" }}>
              {r.part_number > 0 && <span>Part {r.part_number}</span>}
              {r.page_range && <span>Pages {r.page_range}</span>}
              {r.entry_count > 0 && <span>{r.entry_count} entries</span>}
              {r.user_name && <span>by {r.user_name}</span>}
            </div>
          </div>
        ))
      )}
    </div>
  );
}