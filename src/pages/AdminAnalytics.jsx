/**
 * AdminAnalytics — Admin Analytics & Audit Dashboard.
 *
 * Two tabs:
 *   1. Analytics — Stats cards + charts (RBAC scoped)
 *   2. Audit Logs — Searchable audit logs with filters (RBAC scoped)
 *
 * Owner: full analytics + all audit logs + export (CSV)
 * Admin: only analytics/logs for their assigned customers
 *
 * Server-side RBAC enforced by manageAnalytics function.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import {
  Users, UserCheck, Crown, Globe, Ticket, Clock, CheckCircle, XCircle,
  DollarSign, Calendar, Shield, UserPlus, UserMinus, Download, BarChart3, History, ShoppingBag,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AnalyticsStatCard from "@/components/admin/AnalyticsStatCard";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import AuditLogList from "@/components/admin/AuditLogList";
import MarketplaceAnalyticsDashboard from "@/components/admin/shop/MarketplaceAnalyticsDashboard";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
};

export default function AdminAnalytics() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState("analytics");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [logs, setLogs] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const user = await base44.auth.me();
      if (!user || !["owner", "admin"].includes(user.role)) {
        setIsAdmin(false);
        toast({ title: "Access Denied", description: "Only administrators can access this page", variant: "destructive" });
      } else {
        setIsAdmin(true);
        loadAnalytics();
      }
    } catch {
      setIsAdmin(false);
      toast({ title: "Authentication Error", description: "Please log in to continue", variant: "destructive" });
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageAnalytics", { action: "GET_ANALYTICS" });
      if (res.data?.success) {
        setStats(res.data.stats);
        setCharts(res.data.charts);
        setIsOwner(res.data.is_owner);
      }
    } catch (error) {
      toast({ title: "Error Loading Analytics", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageAnalytics", { action: "GET_AUDIT_LOGS" });
      if (res.data?.success) {
        setLogs(res.data.logs || []);
        setIsOwner(res.data.is_owner);
      }
    } catch (error) {
      toast({ title: "Error Loading Audit Logs", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "analytics") {
      loadAnalytics();
    } else if (tab === "audit") {
      loadAuditLogs();
    }
    // "shop" tab — dashboard loads its own data
  };

  const handleExport = async (exportType) => {
    if (!isOwner) {
      toast({ title: "Access Denied", description: "Only owner can export data", variant: "destructive" });
      return;
    }
    setExporting(true);
    try {
      const res = await base44.functions.invoke("manageAnalytics", {
        action: "EXPORT_DATA",
        export_type: exportType,
      });
      // Response is CSV text
      const csv = typeof res.data === "string" ? res.data : res.data?.text || "";
      if (!csv) {
        toast({ title: "Export Failed", description: "No data returned", variant: "destructive" });
        return;
      }
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportType}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "✓ Export Complete", description: `${exportType} CSV downloaded.` });
    } catch (error) {
      toast({ title: "Export Failed", description: error.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  if (isAdmin === false) return <Navigate to="/" replace />;

  if (isAdmin === null) {
    return (
      <AdminLayout title="Loading..." showBackButton={false}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics & Audit" subtitle="Dashboard">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Tab Switcher + Export */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange("analytics")}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
              style={{
                background: activeTab === "analytics" ? "rgba(212,175,55,0.14)" : "rgba(255,255,255,0.03)",
                border: activeTab === "analytics" ? "1px solid rgba(212,175,55,0.50)" : "1px solid rgba(255,255,255,0.08)",
                color: activeTab === "analytics" ? G.text : "rgba(255,255,255,0.50)",
              }}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Analytics
            </button>
            <button
              onClick={() => handleTabChange("audit")}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
              style={{
                background: activeTab === "audit" ? "rgba(212,175,55,0.14)" : "rgba(255,255,255,0.03)",
                border: activeTab === "audit" ? "1px solid rgba(212,175,55,0.50)" : "1px solid rgba(255,255,255,0.08)",
                color: activeTab === "audit" ? G.text : "rgba(255,255,255,0.50)",
              }}
            >
              <History className="w-3.5 h-3.5" />
              Audit Logs
            </button>
            <button
              onClick={() => handleTabChange("shop")}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
              style={{
                background: activeTab === "shop" ? "rgba(212,175,55,0.14)" : "rgba(255,255,255,0.03)",
                border: activeTab === "shop" ? "1px solid rgba(212,175,55,0.50)" : "1px solid rgba(255,255,255,0.08)",
                color: activeTab === "shop" ? G.text : "rgba(255,255,255,0.50)",
              }}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Shop
            </button>
          </div>

          {/* Export buttons (owner only) */}
          {isOwner && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport("analytics")}
                disabled={exporting}
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10 text-xs"
                size="sm"
              >
                <Download className="w-3 h-3 mr-1" />
                Export Analytics
              </Button>
              <Button
                onClick={() => handleExport("audit")}
                disabled={exporting}
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10 text-xs"
                size="sm"
              >
                <Download className="w-3 h-3 mr-1" />
                Export Audit
              </Button>
            </div>
          )}
        </div>

        {/* RBAC notice for non-owners */}
        {!isOwner && (
          <div className="rounded-xl border p-3 text-center" style={{ background: "rgba(59,130,246,0.05)", borderColor: "rgba(59,130,246,0.20)" }}>
            <p className="text-xs text-blue-400/80">
              📊 Showing analytics for your assigned customers only. Owner sees full analytics.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : activeTab === "analytics" ? (
          /* ── Analytics Tab ── */
          <>
            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                <AnalyticsStatCard icon={Users} label="Total Customers" value={stats.totalCustomers || 0} color="#60a5fa" />
                <AnalyticsStatCard icon={UserCheck} label="Active Customers" value={stats.activeCustomers || 0} color="#22c55e" />
                <AnalyticsStatCard icon={Crown} label="Premium Customers" value={stats.premiumCustomers || 0} color="#D4AF37" />
                <AnalyticsStatCard icon={Globe} label="Public Users" value={stats.publicUsers || 0} color="#a855f7" />
                <AnalyticsStatCard icon={Ticket} label="Total Redeem Codes" value={stats.totalRedeemCodes || 0} color="#60a5fa" />
                <AnalyticsStatCard icon={Clock} label="Pending Approvals" value={stats.pendingApprovals || 0} color="#eab308" />
                <AnalyticsStatCard icon={CheckCircle} label="Approved Today" value={stats.approvedToday || 0} color="#22c55e" />
                <AnalyticsStatCard icon={XCircle} label="Rejected Today" value={stats.rejectedToday || 0} color="#ef4444" />
                <AnalyticsStatCard icon={DollarSign} label="Revenue Today" value={stats.revenueToday || 0} color="#22c55e" />
                <AnalyticsStatCard icon={Calendar} label="Revenue This Month" value={stats.revenueThisMonth || 0} color="#D4AF37" />
                <AnalyticsStatCard icon={Calendar} label="Revenue This Year" value={stats.revenueThisYear || 0} color="#D4AF37" />
                <AnalyticsStatCard icon={Shield} label="Active Admins" value={stats.activeAdmins || 0} color="#60a5fa" />
                <AnalyticsStatCard icon={UserPlus} label="Assigned Customers" value={stats.assignedCustomers || 0} color="#22c55e" />
                <AnalyticsStatCard icon={UserMinus} label="Unassigned" value={stats.unassignedCustomers || 0} color="#ef4444" />
              </div>
            )}

            {/* Charts */}
            <AnalyticsCharts charts={charts} />
          </>
        ) : activeTab === "shop" ? (
          /* ── Shop Analytics Tab ── */
          <MarketplaceAnalyticsDashboard />
        ) : (
          /* ── Audit Logs Tab ── */
          <AuditLogList logs={logs} isOwner={isOwner} />
        )}
      </motion.div>
    </AdminLayout>
  );
}