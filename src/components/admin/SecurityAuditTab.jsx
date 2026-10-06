import { useState, useEffect } from "react";
import { Shield, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.06)",
};

export default function SecurityAuditTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("admin_code");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const allLogs = await base44.entities.AuditLog.list("-timestamp", 100);
      setLogs(allLogs);
    } catch (e) {
      console.error("Failed to load audit logs:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === "all") return true;
    if (filter === "admin_code") {
      return log.action_type === "ADMIN_CODE_LOGIN_ATTEMPT" || log.action_type === "ADMIN_CODE_LOGIN_SUCCESS";
    }
    return log.action_type === filter;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "admin_code", label: "Admin Code Logins", color: "#f59e0b" },
          { id: "all", label: "All Logs", color: G.text },
        ].map(({ id, label, color }) => (
          <button key={id} onClick={() => setFilter(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filter === id ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-white/5 text-white/45 border border-white/10"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.25)" }}>
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No audit logs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map(log => {
            const isSuccess = log.action_type === "ADMIN_CODE_LOGIN_SUCCESS";
            const details = JSON.parse(log.details || "{}");
            return (
              <div key={log.log_id} className="rounded-xl border p-4"
                style={{
                  background: isSuccess ? "rgba(34,197,94,0.06)" : "rgba(245,158,11,0.06)",
                  borderColor: isSuccess ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.30)",
                }}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Shield className={`w-4 h-4 flex-shrink-0 ${isSuccess ? "text-green-400" : "text-amber-400"}`} />
                      <p className="font-inter font-bold text-white text-sm">
                        {isSuccess ? "✓ Admin Code Login Success" : "✗ Admin Code Login Attempt"}
                      </p>
                    </div>
                    <p className="text-xs text-white/40 mt-1 flex items-center gap-3">
                      <span>Code: <span className="font-mono">{details.code_attempted || details.code_used || "****"}</span></span>
                      <span>IP: <span className="font-mono">{log.ip_address || "unknown"}</span></span>
                    </p>
                    <p className="text-xs text-white/30 mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${
                    isSuccess ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}>
                    {isSuccess ? "SUCCESS" : "FAILED"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}