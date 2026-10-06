import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Search, Clock, User, FileText, Download,
  AlertTriangle, CheckCircle, XCircle, Lock, Key,
  Database, Eye, Settings, LogOut, RefreshCw
} from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

const ACTION_ICONS = {
  PERMISSION_GRANT: CheckCircle,
  PERMISSION_REVOKE: XCircle,
  SUBSCRIPTION_CREATE: FileText,
  SUBSCRIPTION_MODIFY: Settings,
  SUBSCRIPTION_CANCEL: XCircle,
  SUBSCRIPTION_REFUND: RefreshCw,
  USER_MANAGE: User,
  VIP_GRANT: Key,
  VIP_REVOKE: Key,
  PAGE_VISIBILITY_CHANGE: Eye,
  SYSTEM_CHANGE: Settings,
  LOGIN: LogOut,
  LOGOUT: LogOut,
  DATA_EXPORT: Database,
  DATA_IMPORT: Database,
  OTHER: AlertTriangle
};

const ACTION_COLORS = {
  PERMISSION_GRANT: "bg-green-500/20 text-green-400 border-green-500/30",
  PERMISSION_REVOKE: "bg-red-500/20 text-red-400 border-red-500/30",
  SUBSCRIPTION_CREATE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  SUBSCRIPTION_MODIFY: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  SUBSCRIPTION_CANCEL: "bg-red-500/20 text-red-400 border-red-500/30",
  SUBSCRIPTION_REFUND: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  USER_MANAGE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  VIP_GRANT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  VIP_REVOKE: "bg-red-500/20 text-red-400 border-red-500/30",
  PAGE_VISIBILITY_CHANGE: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  SYSTEM_CHANGE: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  LOGIN: "bg-green-500/20 text-green-400 border-green-500/30",
  LOGOUT: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  DATA_EXPORT: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  DATA_IMPORT: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  OTHER: "bg-gray-500/20 text-gray-400 border-gray-500/30"
};

const ACTION_LABELS = {
  PERMISSION_GRANT: "Permission Granted",
  PERMISSION_REVOKE: "Permission Revoked",
  SUBSCRIPTION_CREATE: "Subscription Created",
  SUBSCRIPTION_MODIFY: "Subscription Modified",
  SUBSCRIPTION_CANCEL: "Subscription Cancelled",
  SUBSCRIPTION_REFUND: "Subscription Refunded",
  USER_MANAGE: "User Managed",
  VIP_GRANT: "VIP Access Granted",
  VIP_REVOKE: "VIP Access Revoked",
  PAGE_VISIBILITY_CHANGE: "Page Visibility Changed",
  SYSTEM_CHANGE: "System Changed",
  LOGIN: "User Login",
  LOGOUT: "User Logout",
  DATA_EXPORT: "Data Exported",
  DATA_IMPORT: "Data Imported",
  OTHER: "Other Action"
};

export default function SecurityAuditLogs() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    checkAuth();
    
    // Real-time subscription for instant audit log updates
    const unsubscribe = base44.entities.AuditLog.subscribe(() => {
      fetchLogs();
    });
    
    return () => unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await base44.auth.me();
      if (!user || user.role !== "admin") {
        toast({ title: "Access Denied", description: "Admin access required", variant: "destructive" });
        navigate("/");
        return;
      }
      fetchLogs();
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const allLogs = await base44.entities.AuditLog.list("-timestamp", 200);
      setLogs(allLogs);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load audit logs", variant: "destructive" });
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = searchQuery === "" || 
        log.performed_by_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target_user_id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAction = filterAction === "all" || log.action_type === filterAction;
      return matchesSearch && matchesAction;
    });
  }, [logs, searchQuery, filterAction]);

  const uniqueActions = [...new Set(logs.map(log => log.action_type))].filter(Boolean);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await base44.functions.invoke("exportData", { export_type: "audit_logs" });
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "✓ Audit logs exported" });
    } catch (err) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageTitle arabic="سجل التدقيق الأمني" latin="SECURITY AUDIT LOGS" subtitle="All Admin Actions & System Events" icon="🛡️" />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-10">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Logs", value: logs.length, color: G.text, icon: FileText },
            { label: "Permissions", value: logs.filter(l => l.action_type.includes("PERMISSION")).length, color: "#22c55e", icon: Key },
            { label: "Subscriptions", value: logs.filter(l => l.action_type.includes("SUBSCRIPTION")).length, color: "#60a5fa", icon: Shield },
            { label: "System Events", value: logs.filter(l => l.action_type === "SYSTEM_CHANGE" || l.action_type === "DATA_EXPORT").length, color: "#a78bfa", icon: Settings },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="rounded-xl border p-3 text-center" style={{ background: G.bg, borderColor: G.border }}>
              <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
              <p className="text-lg font-bold" style={{ color }}>{value}</p>
              <p className="text-xs text-white/40 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: G.dim }} />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by email or user ID…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}` }}
            />
          </div>
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}` }}
          >
            <option value="all">All Actions ({logs.length})</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>
                {ACTION_LABELS[action] || action} ({logs.filter(l => l.action_type === action).length})
              </option>
            ))}
          </select>
          <button
            onClick={handleExport}
            disabled={exporting || logs.length === 0}
            className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? "Exporting…" : "Export Logs"}
          </button>
        </div>

        {/* Logs List */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.25)" }}>
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No audit logs found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log, idx) => {
              const Icon = ACTION_ICONS[log.action_type] || AlertTriangle;
              const colorClass = ACTION_COLORS[log.action_type] || ACTION_COLORS.OTHER;
              const details = log.details ? JSON.parse(log.details) : null;

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="rounded-xl border p-4"
                  style={{ background: G.bg, borderColor: G.border }}
                >
                  <div className="flex items-start gap-3 flex-wrap">
                    <Badge className={colorClass}>
                      <Icon className="w-3 h-3 mr-1" />
                      {ACTION_LABELS[log.action_type] || log.action_type}
                    </Badge>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-3 h-3 text-white/50" />
                        <span className="text-white text-sm font-medium truncate">
                          {log.performed_by_email}
                        </span>
                      </div>
                      
                      {log.target_user_id && (
                        <p className="text-xs text-white/40 mt-0.5">
                          Target: {log.target_user_id}
                        </p>
                      )}
                      
                      {details && Object.keys(details).length > 0 && (
                        <div className="mt-2 text-xs text-white/30 bg-white/5 rounded-lg p-2">
                          {Object.entries(details).map(([key, val]) => (
                            <div key={key} className="flex gap-1">
                              <span className="text-white/40">{key}:</span>
                              <span className="text-white/60">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-white/40">
                        <Clock className="w-3 h-3" />
                        {new Date(log.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
                      </div>
                      <div className="text-xs text-white/30 mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      {log.ip_address && (
                        <div className="text-xs text-white/20 mt-1 font-mono">
                          {log.ip_address}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </PageLayout>
  );
}