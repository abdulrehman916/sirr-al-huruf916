import { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, FileText, Calendar, Loader2, KeyRound, Globe, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/components/ui/use-toast";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
};

const EVENT_COLORS = {
  GRANTED: "#22c55e", DENIED: "#ef4444", EXPIRED: "#f59e0b", REVOKED: "#f97316",
  NOT_FOUND: "#6b7280",
  REDEEMED: "#3b82f6", RENEWED: "#f59e0b", RESET_DEVICE: "#a855f7",
  DISABLED: "#ef4444", ENABLED: "#22c55e", DELETED: "#ef4444",
  CREATED: "#22c55e", REJECTED_ALREADY_REDEEMED: "#ef4444", REJECTED_EXPIRED: "#f59e0b",
  REJECTED_DISABLED: "#ef4444",
  ADDED_FEATURES: "#3b82f6", REMOVED_FEATURES: "#ef4444",
};

const DATE_FILTERS = [
  { key: 'all',       label: 'All',       days: null },
  { key: 'today',     label: 'Today',     days: 0 },
  { key: 'yesterday', label: 'Yesterday', days: -1 },
  { key: '7days',     label: '7 Days',    days: 7 },
  { key: '30days',    label: '30 Days',   days: 30 },
];

function getFilterRange(filterKey, customDate) {
  if (filterKey === 'all') return null;
  if (filterKey === 'custom' && customDate) {
    const start = new Date(customDate + "T00:00:00");
    const end = new Date(customDate + "T23:59:59");
    return { start, end };
  }
  const f = DATE_FILTERS.find(f => f.key === filterKey);
  if (!f) return null;
  const now = new Date();
  if (f.key === 'today') {
    return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate()), end: now };
  }
  if (f.key === 'yesterday') {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59),
    };
  }
  return { start: new Date(now.getTime() - f.days * 86400000), end: now };
}

export default function AdminAccessLogs() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(null);
  const [logs, setLogs] = useState([]);
  const [codeEvents, setCodeEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");

  useEffect(() => {
    base44.auth.me().then(user => {
      if (!user || !["owner", "admin"].includes(user.role)) { setIsAdmin(false); return; }
      setIsAdmin(true);
      loadLogs();
    }).catch(() => setIsAdmin(false));
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const [accessLogs, codes] = await Promise.all([
        base44.entities.AccessLog.list("-timestamp", 500),
        base44.entities.AccessCode.list("-created_date", 200),
      ]);
      setLogs(accessLogs);

      // Extract audit_log entries from codes
      const events = [];
      (codes || []).forEach(c => {
        (c.audit_log || []).forEach(entry => {
          events.push({
            id: `${c.id}-${entry.timestamp}-${entry.action}`,
            type: 'code_event',
            action: entry.action,
            user_id: c.used_by_user_id || entry.admin_id || '',
            device_id: c.device_id || '',
            code: c.code,
            page_path: '',
            timestamp: entry.timestamp,
            ip_address: '',
            details: entry.details || '',
          });
        });
      });
      setCodeEvents(events);
    } catch (e) {
      toast({ title: "Failed to load logs", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Merge and filter logs
  const filtered = useMemo(() => {
    // Merge access logs + code events
    const merged = [
      ...logs.map(l => ({
        id: l.id,
        type: 'page_access',
        action: l.access_result,
        user_id: l.user_id || l.session_id || '',
        device_id: l.session_id || '',
        code: '',
        page_path: l.page_path || '',
        timestamp: l.timestamp,
        ip_address: l.ip_address || '',
        details: '',
      })),
      ...codeEvents,
    ];

    // Sort by timestamp descending
    merged.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    // Date filter
    const range = getFilterRange(dateFilter, customDate);
    let result = merged;
    if (range) {
      result = result.filter(l => {
        const ts = new Date(l.timestamp);
        return ts >= range.start && ts <= range.end;
      });
    }

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(l =>
        (l.user_id || "").toLowerCase().includes(q) ||
        (l.code || "").toLowerCase().includes(q) ||
        (l.device_id || "").toLowerCase().includes(q) ||
        (l.page_path || "").toLowerCase().includes(q) ||
        (l.action || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [logs, codeEvents, dateFilter, customDate, search]);

  if (isAdmin === false) return <Navigate to="/" replace />;
  if (isAdmin === null) return (
    <AdminLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div>
          <h1 className="font-inter text-xl font-bold text-white">Access Logs</h1>
          <p className="font-inter text-xs text-white/40 mt-0.5">Unified access & code event history</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by user, code, device, page, or action..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", fontSize: 16 }}
          />
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {DATE_FILTERS.map(f => (
            <button key={f.key} onClick={() => setDateFilter(f.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: dateFilter === f.key ? G.bg : "rgba(255,255,255,0.04)",
                border: `1px solid ${dateFilter === f.key ? G.border : "rgba(255,255,255,0.08)"}`,
                color: dateFilter === f.key ? G.text : "rgba(255,255,255,0.50)",
              }}>
              {f.label}
            </button>
          ))}
          <div className="flex items-center gap-2">
            <button onClick={() => setDateFilter('custom')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
              style={{
                background: dateFilter === 'custom' ? G.bg : "rgba(255,255,255,0.04)",
                border: `1px solid ${dateFilter === 'custom' ? G.border : "rgba(255,255,255,0.08)"}`,
                color: dateFilter === 'custom' ? G.text : "rgba(255,255,255,0.50)",
              }}>
              <Calendar className="w-3 h-3" /> Custom
            </button>
            {dateFilter === 'custom' && (
              <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)}
                className="px-2 py-1.5 rounded-lg text-xs text-white outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, fontSize: 14 }} />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-lg border p-2 text-center" style={{ background: G.bg, borderColor: G.border }}>
            <p className="text-lg font-bold text-white">{filtered.length}</p>
            <p className="text-[9px] text-white/35 uppercase">Total Events</p>
          </div>
          <div className="rounded-lg border p-2 text-center" style={{ background: G.bg, borderColor: G.border }}>
            <p className="text-lg font-bold" style={{ color: "#ef4444" }}>{filtered.filter(l => l.action?.includes('DENIED') || l.action?.includes('REJECTED')).length}</p>
            <p className="text-[9px] text-white/35 uppercase">Denied</p>
          </div>
          <div className="rounded-lg border p-2 text-center" style={{ background: G.bg, borderColor: G.border }}>
            <p className="text-lg font-bold" style={{ color: "#3b82f6" }}>{filtered.filter(l => l.action === 'REDEEMED').length}</p>
            <p className="text-[9px] text-white/35 uppercase">Redeems</p>
          </div>
          <div className="rounded-lg border p-2 text-center" style={{ background: G.bg, borderColor: G.border }}>
            <p className="text-lg font-bold" style={{ color: "#f59e0b" }}>{filtered.filter(l => l.action === 'RENEWED').length}</p>
            <p className="text-[9px] text-white/35 uppercase">Renewals</p>
          </div>
        </div>

        {/* Logs List */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: G.text }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No logs found</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.slice(0, 300).map((log, i) => {
              const color = EVENT_COLORS[log.action] || "#9ca3af";
              return (
                <div key={log.id || i} className="rounded-xl border p-3 flex items-center gap-3 flex-wrap"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
                  {/* Action badge */}
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0"
                    style={{ background: color + "18", color, border: `1px solid ${color}40` }}>
                    {log.action}
                  </span>
                  {/* Type icon */}
                  {log.type === 'code_event' ? (
                    <KeyRound className="w-3 h-3 text-white/30 flex-shrink-0" />
                  ) : (
                    <Globe className="w-3 h-3 text-white/30 flex-shrink-0" />
                  )}
                  {/* Code or page path */}
                  <span className="font-mono text-xs text-white/60 flex-1 min-w-0 truncate">
                    {log.code ? `Code: ${log.code}` : log.page_path}
                  </span>
                  {/* User/Device */}
                  <span className="font-mono text-[10px] text-white/30 flex-shrink-0">
                    {log.user_id?.slice(0, 12)}{log.user_id ? '…' : ''}
                  </span>
                  {/* IP */}
                  {log.ip_address && (
                    <span className="font-mono text-[10px] text-white/20 flex-shrink-0">{log.ip_address}</span>
                  )}
                  {/* Timestamp */}
                  <span className="font-mono text-[10px] text-white/25 flex-shrink-0">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                  </span>
                  {/* Details */}
                  {log.details && (
                    <span className="font-mono text-[10px] text-white/40 w-full mt-1 truncate">{log.details}</span>
                  )}
                </div>
              );
            })}
            {filtered.length > 300 && (
              <p className="text-center text-xs text-white/30 py-2">Showing 300 of {filtered.length} events</p>
            )}
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
}