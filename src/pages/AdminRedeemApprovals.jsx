/**
 * AdminRedeemApprovals — Admin page for reviewing redeem code approvals.
 * Owner: sees all approvals, can override any decision.
 * Admin: sees only their assigned customers' approvals, can approve/reject/request-info.
 *
 * Server-side RBAC is enforced by manageRedeemCodeApproval function.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Search, ClipboardCheck, Clock, CheckCircle, XCircle, AlertCircle, Gavel } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/components/ui/use-toast";
import { Dialog } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RedeemApprovalRow from "@/components/admin/RedeemApprovalRow";
import RedeemApprovalDetail from "@/components/admin/RedeemApprovalDetail";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
};

const STAT_CARDS = [
  { key: "pending", label: "Pending", icon: Clock, color: "text-blue-400" },
  { key: "approved", label: "Approved", icon: CheckCircle, color: "text-green-400" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "text-red-400" },
  { key: "info_requested", label: "Info Requested", icon: AlertCircle, color: "text-yellow-400" },
];

export default function AdminRedeemApprovals() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [approvals, setApprovals] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, info_requested: 0, overridden: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const user = await base44.auth.me();
      if (!user || !["owner", "admin"].includes(user.role)) {
        setIsAdmin(false);
        toast({
          title: "Access Denied",
          description: "Only administrators can access this page",
          variant: "destructive",
        });
      } else {
        setIsAdmin(true);
        loadApprovals();
      }
    } catch {
      setIsAdmin(false);
      toast({
        title: "Authentication Error",
        description: "Please log in to continue",
        variant: "destructive",
      });
    }
  };

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageRedeemCodeApproval", {
        action: "GET_ALL",
      });
      if (res.data?.success) {
        setApprovals(res.data.approvals || []);
        setStats(res.data.stats || {});
        setIsOwner(res.data.is_owner || false);
      }
    } catch (error) {
      toast({
        title: "Error Loading Approvals",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredApprovals = approvals.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (a.code || "").toLowerCase().includes(q) ||
      (a.customer_name || "").toLowerCase().includes(q) ||
      (a.customer_email || "").toLowerCase().includes(q) ||
      (a.approval_id || "").toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || a.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (approval) => {
    setSelectedApproval(approval);
    setDialogOpen(true);
  };

  const refreshAfterAction = async () => {
    await loadApprovals();
    // Update selected approval with fresh data
    if (selectedApproval) {
      const res = await base44.functions.invoke("manageRedeemCodeApproval", {
        action: "GET_ALL",
      });
      if (res.data?.success) {
        const updated = (res.data.approvals || []).find(
          (a) => a.approval_id === selectedApproval.approval_id
        );
        if (updated) setSelectedApproval(updated);
      }
    }
  };

  const handleApprove = async (approvalId) => {
    setActionLoading(true);
    try {
      const res = await base44.functions.invoke("manageRedeemCodeApproval", {
        action: "APPROVE",
        approval_id: approvalId,
      });
      if (res.data?.success) {
        toast({ title: "✓ Code Approved", description: "Customer has been notified." });
        await refreshAfterAction();
      } else {
        toast({ title: "Approval Failed", description: res.data?.error, variant: "destructive" });
      }
    } catch (e) {
      toast({
        title: "Approval Failed",
        description: e?.response?.data?.error || e.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (approvalId, reason) => {
    setActionLoading(true);
    try {
      const res = await base44.functions.invoke("manageRedeemCodeApproval", {
        action: "REJECT",
        approval_id: approvalId,
        rejection_reason: reason,
      });
      if (res.data?.success) {
        toast({ title: "Code Rejected", description: "Customer has been notified." });
        await refreshAfterAction();
      } else {
        toast({ title: "Rejection Failed", description: res.data?.error, variant: "destructive" });
      }
    } catch (e) {
      toast({
        title: "Rejection Failed",
        description: e?.response?.data?.error || e.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async (approvalId, message) => {
    setActionLoading(true);
    try {
      const res = await base44.functions.invoke("manageRedeemCodeApproval", {
        action: "REQUEST_INFO",
        approval_id: approvalId,
        info_request_message: message,
      });
      if (res.data?.success) {
        toast({ title: "Info Request Sent", description: "Customer has been asked for more information." });
        await refreshAfterAction();
      } else {
        toast({ title: "Request Failed", description: res.data?.error, variant: "destructive" });
      }
    } catch (e) {
      toast({
        title: "Request Failed",
        description: e?.response?.data?.error || e.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOverride = async (approvalId, newStatus, reason) => {
    setActionLoading(true);
    try {
      const res = await base44.functions.invoke("manageRedeemCodeApproval", {
        action: "OVERRIDE",
        approval_id: approvalId,
        new_status: newStatus,
        override_reason: reason,
      });
      if (res.data?.success) {
        toast({ title: "Decision Overridden", description: `Code ${newStatus.toLowerCase()} by owner.` });
        await refreshAfterAction();
      } else {
        toast({ title: "Override Failed", description: res.data?.error, variant: "destructive" });
      }
    } catch (e) {
      toast({
        title: "Override Failed",
        description: e?.response?.data?.error || e.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
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
    <AdminLayout title="Redeem Approvals" subtitle="Code Approval Workflow">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {STAT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className="rounded-xl border p-3 text-center"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <Icon className={"w-4 h-4 mx-auto mb-1 " + card.color} />
                <p className="text-lg font-bold text-white">{stats[card.key] || 0}</p>
                <p className="text-[10px] text-white/40">{card.label}</p>
              </div>
            );
          })}
          {/* Override stat (owner only) */}
          {isOwner && (
            <div
              className="rounded-xl border p-3 text-center"
              style={{ background: "rgba(168,85,247,0.05)", borderColor: "rgba(168,85,247,0.15)" }}
            >
              <Gavel className="w-4 h-4 mx-auto mb-1 text-purple-400" />
              <p className="text-lg font-bold text-white">{stats.overridden || 0}</p>
              <p className="text-[10px] text-white/40">Overridden</p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              placeholder="Search by code, customer, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="INFO_REQUESTED">Info Requested</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Approvals List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredApprovals.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {isOwner
                ? "No redeem code approvals found"
                : "No redeem code approvals for your assigned customers"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredApprovals.map((approval) => (
              <RedeemApprovalRow
                key={approval.id || approval.approval_id}
                approval={approval}
                onClick={handleRowClick}
              />
            ))}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <RedeemApprovalDetail
            approval={selectedApproval}
            isOwner={isOwner}
            onApprove={handleApprove}
            onReject={handleReject}
            onRequestInfo={handleRequestInfo}
            onOverride={handleOverride}
            loading={actionLoading}
          />
        </Dialog>
      </motion.div>
    </AdminLayout>
  );
}