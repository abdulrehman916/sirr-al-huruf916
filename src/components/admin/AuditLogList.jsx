/**
 * AuditLogList — Searchable audit log list with filters.
 * Displays aggregated logs from multiple sources (RedeemCodeApproval, AccessCode, AdminProfile, AssignmentLog).
 */
import { useState, useMemo } from "react";
import { Search, History, Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
};

const ACTION_COLORS = {
  SUBMITTED: "text-blue-400",
  APPROVED: "text-green-400",
  REJECTED: "text-red-400",
  INFO_REQUESTED: "text-yellow-400",
  CUSTOMER_RESPONDED: "text-blue-400",
  OVERRIDDEN: "text-purple-400",
  CREATED: "text-green-400",
  REDEEMED: "text-green-400",
  RENEWED: "text-blue-400",
  DISABLED: "text-red-400",
  ENABLED: "text-green-400",
  RESET_DEVICE: "text-yellow-400",
  ASSIGNED: "text-blue-400",
  REASSIGNED: "text-purple-400",
  REMOVED: "text-red-400",
  LOGIN: "text-white/50",
  UPDATED: "text-white/60",
};

export default function AuditLogList({ logs, isOwner }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Extract unique values for filters
  const entities = useMemo(() => {
    const set = new Set(logs.map((l) => l.entity).filter(Boolean));
    return Array.from(set);
  }, [logs]);

  const actions = useMemo(() => {
    const set = new Set(logs.map((l) => l.action).filter(Boolean));
    return Array.from(set);
  }, [logs]);

  const users = useMemo(() => {
    const set = new Set(logs.map((l) => l.user).filter(Boolean));
    return Array.from(set);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const now = new Date();

    return logs.filter((l) => {
      const matchesSearch =
        !q ||
        (l.user || "").toLowerCase().includes(q) ||
        (l.action || "").toLowerCase().includes(q) ||
        (l.entity_id || "").toLowerCase().includes(q) ||
        (l.details || "").toLowerCase().includes(q) ||
        (l.customer_email || "").toLowerCase().includes(q) ||
        (l.code || "").toLowerCase().includes(q);

      const matchesEntity = entityFilter === "all" || l.entity === entityFilter;
      const matchesAction = actionFilter === "all" || l.action === actionFilter;
      const matchesUser = userFilter === "all" || l.user === userFilter;

      let matchesDate = true;
      if (l.timestamp && dateFilter !== "all") {
        const d = new Date(l.timestamp);
        if (dateFilter === "today") {
          matchesDate = d.toISOString().split('T')[0] === now.toISOString().split('T')[0];
        } else if (dateFilter === "7days") {
          matchesDate = (now - d) <= 7 * 24 * 60 * 60 * 1000;
        } else if (dateFilter === "30days") {
          matchesDate = (now - d) <= 30 * 24 * 60 * 60 * 1000;
        }
      }

      return matchesSearch && matchesEntity && matchesAction && matchesUser && matchesDate;
    });
  }, [logs, searchQuery, entityFilter, actionFilter, userFilter, dateFilter]);

  const hasFilters = searchQuery || entityFilter !== "all" || actionFilter !== "all" || userFilter !== "all" || dateFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setEntityFilter("all");
    setActionFilter("all");
    setUserFilter("all");
    setDateFilter("all");
  };

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
          />
        </div>
        <div className="flex gap-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white flex-1">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {entities.map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actions.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="User" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((u) => (
              <SelectItem key={u} value={u}>{u}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>{filteredLogs.length} of {logs.length} logs</span>
      </div>

      {/* Log List */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No audit logs found</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredLogs.slice(0, 200).map((log, i) => {
            const actionColor = ACTION_COLORS[log.action] || "text-white/60";
            return (
              <div
                key={i}
                className="rounded-lg border p-3"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={"text-[10px] font-bold " + actionColor}>{log.action}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10">
                        {log.entity}
                      </span>
                      {log.user_role && (
                        <span className="text-[9px] text-white/30">({log.user_role})</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-white/50">
                      <span><strong className="text-white/70">User:</strong> {log.user}</span>
                      {log.entity_id && (
                        <span><strong className="text-white/70">ID:</strong> {log.entity_id}</span>
                      )}
                      {log.customer_email && (
                        <span><strong className="text-white/70">Customer:</strong> {log.customer_email}</span>
                      )}
                      {log.code && (
                        <span><strong className="text-white/70">Code:</strong> {log.code}</span>
                      )}
                    </div>
                    {log.details && (
                      <p className="text-[10px] text-white/40 mt-1">{log.details}</p>
                    )}
                    {(log.previous_value || log.new_value) && (
                      <div className="flex items-center gap-2 mt-1 text-[10px]">
                        {log.previous_value && (
                          <span className="text-red-400/70">← {log.previous_value}</span>
                        )}
                        {log.previous_value && log.new_value && (
                          <span className="text-white/20">→</span>
                        )}
                        {log.new_value && (
                          <span className="text-green-400/70">→ {log.new_value}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-white/25 flex-shrink-0 whitespace-nowrap">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                  </span>
                </div>
              </div>
            );
          })}
          {filteredLogs.length > 200 && (
            <p className="text-center text-[10px] text-white/30 py-2">
              Showing 200 of {filteredLogs.length} filtered logs. Refine filters to see more.
            </p>
          )}
        </div>
      )}
    </div>
  );
}