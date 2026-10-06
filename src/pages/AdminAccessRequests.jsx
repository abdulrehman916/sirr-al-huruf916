import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, RefreshCw, Clock, User, Mail, FileText, Calendar, KeyRound, Search } from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import RequestDetail from "@/components/admin/RequestDetail";
import { REQUEST_STATUSES } from "@/lib/accessRequestStatus";

const G = {
  border: "rgba(212,175,55,0.30)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

function getStatusColors(status) {
  const cfg = REQUEST_STATUSES[status] || REQUEST_STATUSES.PENDING;
  const hex = cfg.color;
  return { bg: `${hex}1a`, border: `${hex}66`, text: hex };
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminAccessRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [processing, setProcessing] = useState(null);
  const [user, setUser] = useState(null);
  const [rejectingReq, setRejectingReq] = useState(null);
  const [expandedReqId, setExpandedReqId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const all = await base44.entities.AccessRequest.list("-requested_at", 500);
      setRequests(all);
    } catch {
      toast({ title: "Error loading requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const filtered = requests.filter(r => {
    const statusMatch = filter === "ALL" ? true : r.status === filter;
    if (!statusMatch) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.request_id || "").toLowerCase().includes(q) ||
      (r.page_name || "").toLowerCase().includes(q) ||
      (r.name || "").toLowerCase().includes(q) ||
      (r.session_id || "").toLowerCase().includes(q) ||
      (r.existing_code || "").toLowerCase().includes(q) ||
      (r.plan_name || "").toLowerCase().includes(q)
    );
  });

  // Approve & Deliver — single unified path. Calls approveAccessRequest which
  // merges into / creates the Reading Code AND posts the code to the conversation.
  const handleApprove = async (req) => {
    setProcessing(req.id);
    try {
      const res = await base44.functions.invoke("approveAccessRequest", {
        request_id: req.request_id,
      });
      if (!res.data?.success) {
        toast({ title: "Approval error", description: res.data?.error || "Failed to deliver access", variant: "destructive" });
      } else {
        toast({ title: "✓ Approved & code delivered", description: res.data?.code ? `Code: ${res.data.code}` : undefined });
      }
      loadRequests();
    } catch (e) {
      toast({ title: "Error", description: e.message || "Failed to approve", variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = (req) => {
    setRejectReason("");
    setRejectingReq(req);
  };

  const confirmReject = async () => {
    const req = rejectingReq;
    setRejectingReq(null);
    setProcessing(req.id);
    try {
      const res = await base44.functions.invoke("approveAccessRequest", {
        request_id: req.request_id,
        reject: true,
        rejection_reason: rejectReason.trim() || "No reason provided",
      });
      if (!res.data?.success) {
        toast({ title: "Rejection error", description: res.data?.error || "Failed to reject", variant: "destructive" });
      } else {
        toast({ title: "Request Rejected", description: `${req.name}'s request has been rejected.` });
      }
      loadRequests();
    } catch (e) {
      toast({ title: "Error", description: e.message || "Failed to reject", variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const cancelReject = () => setRejectingReq(null);

  const TABS = ["ALL", "PENDING", "AWAITING_PAYMENT", "PAYMENT_CONFIRMED", "INFO_REQUESTED", "CODE_UPDATED", "APPROVED", "REJECTED", "CLOSED"];
  const COUNTS = TABS.reduce((acc, t) => {
    acc[t] = t === "ALL" ? requests.length : requests.filter(r => r.status === t).length;
    return acc;
  }, {});

  return (
    <AdminLayout title="Access Requests" subtitle="Review and process user access requests">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-amiri text-2xl font-bold" style={{ color: G.text }}>
              Access Requests
            </h1>
            <p className="font-inter text-xs text-white/50 mt-0.5">
              Review requests, then edit the user's Reading Code to add features
            </p>
          </div>
          <button
            onClick={loadRequests}
            disabled={loading}
            className="p-2 rounded-xl"
            style={{ border: `1px solid ${G.border}`, background: G.bg, color: G.text }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Request ID, name, page, code..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none placeholder-white/30"
            style={{ background: G.bg, border: `1px solid ${G.border}`, fontSize: "16px" }}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-4 py-1.5 rounded-xl font-inter text-xs font-bold transition-all"
              style={{
                background: filter === tab ? G.bgHi : G.bg,
                border: `1px solid ${filter === tab ? "rgba(212,175,55,0.60)" : G.border}`,
                color: filter === tab ? G.text : "rgba(255,255,255,0.50)",
              }}
            >
              {REQUEST_STATUSES[tab]?.label || tab} {COUNTS[tab] > 0 && <span className="ml-1 opacity-70">({COUNTS[tab]})</span>}
            </button>
          ))}
        </div>

        {/* Request List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-t-yellow-400 border-r-transparent border-b-yellow-400 border-l-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border p-10 text-center" style={{ background: G.bg, borderColor: G.border }}>
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: G.text }} />
            <p className="font-inter text-sm text-white/40">No {filter.toLowerCase()} requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(req => {
              const sc = getStatusColors(req.status);
              const isProcessing = processing === req.id;
              return (
                <div
                  key={req.id}
                  className="rounded-2xl border p-5"
                  style={{ background: G.bg, borderColor: G.border }}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    {/* Info */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded-full font-inter text-[10px] font-bold uppercase tracking-wider"
                          style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}
                        >
                          {(REQUEST_STATUSES[req.status]?.label || req.status).toUpperCase()}
                        </span>
                        <span className="font-inter text-[10px] text-white/40">{req.request_id}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: G.text }}>
                        <User className="w-3.5 h-3.5 flex-shrink-0" />
                        {req.name || "Unknown"}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-white/60">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        {req.email || "—"}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-white/60">
                        <FileText className="w-3 h-3 flex-shrink-0" />
                        {req.page_name || req.page_path}
                        <span className="text-white/30">·</span>
                        <span className="text-white/40 font-mono">{req.page_path}</span>
                      </div>
                      {(req.plan_name || req.price != null) && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-white/30">Plan:</span>
                          <span style={{ color: G.text }}>{req.plan_name || "—"}</span>
                          {req.price != null && <span className="text-white/40">· {req.currency} {req.price}</span>}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-white/40">
                         <Calendar className="w-3 h-3 flex-shrink-0" />
                         {fmtDate(req.requested_at || req.created_date)}
                       </div>
                       {req.session_id && (
                         <div className="flex items-center gap-1.5 text-xs text-white/40">
                           <span className="text-white/30">Session:</span>
                           <span className="font-mono text-white/50">{req.session_id.slice(0, 20)}…</span>
                         </div>
                       )}
                       {req.existing_code && (
                         <div className="flex items-center gap-1.5 text-xs">
                           <KeyRound className="w-3 h-3 flex-shrink-0" style={{ color: G.text }} />
                           <span className="text-white/30">Existing Code:</span>
                           <Link to="/admin/access-codes" className="font-bold tracking-widest" style={{ color: G.text }}>{req.existing_code}</Link>
                         </div>
                       )}
                       {req.message && (
                         <div className="rounded-lg p-2 mt-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                           <p className="font-inter text-[9px] text-white/30 uppercase tracking-wider mb-0.5">Request Details</p>
                           <p className="font-inter text-xs text-white/55">{req.message}</p>
                         </div>
                       )}
                       {req.status === "REJECTED" && req.rejection_reason && (
                         <div className="rounded-lg p-2 mt-1" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.20)" }}>
                           <p className="font-inter text-[9px] text-red-400/60 uppercase tracking-wider mb-0.5">Rejection Reason</p>
                           <p className="font-inter text-xs text-red-300/80">{req.rejection_reason}</p>
                         </div>
                       )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => setExpandedReqId(expandedReqId === req.id ? null : req.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-inter text-xs font-bold transition-all"
                        style={{
                          background: expandedReqId === req.id ? G.bgHi : G.bg,
                          border: `1px solid ${expandedReqId === req.id ? "rgba(212,175,55,0.60)" : G.border}`,
                          color: G.text,
                        }}
                      >
                        {expandedReqId === req.id ? "Hide" : "Open"} Conversation
                      </button>
                      {req.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(req)}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-inter text-xs font-bold transition-all"
                            style={{
                              background: "rgba(34,197,94,0.15)",
                              border: "1px solid rgba(34,197,94,0.45)",
                              color: "#22c55e",
                              opacity: isProcessing ? 0.6 : 1,
                            }}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {isProcessing ? "Approving…" : "Approve"}
                          </button>
                          <button
                            onClick={() => handleReject(req)}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-inter text-xs font-bold transition-all"
                            style={{
                              background: "rgba(239,68,68,0.10)",
                              border: "1px solid rgba(239,68,68,0.40)",
                              color: "#ef4444",
                              opacity: isProcessing ? 0.6 : 1,
                            }}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {isProcessing ? "..." : "Reject"}
                          </button>
                        </>
                      )}
                      {["APPROVED", "PAYMENT_CONFIRMED", "CODE_UPDATED"].includes(req.status) && (
                        <Link
                          to="/admin/access-codes"
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-inter text-xs font-bold transition-all"
                          style={{
                            background: G.bgHi,
                            border: `1px solid ${G.border}`,
                            color: G.text,
                          }}
                        >
                          Edit Reading Code →
                        </Link>
                      )}
                    </div>
                  </div>
                  {expandedReqId === req.id && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: G.border }}>
                      <RequestDetail request={req} onUpdate={loadRequests} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rejection reason modal */}
      {rejectingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={cancelReject}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: "1px solid rgba(239,68,68,0.50)" }}
            onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="font-inter font-bold text-white text-sm">Reject Request</h3>
              <p className="text-xs text-white/40 mt-0.5">{rejectingReq.name} · {rejectingReq.page_name}</p>
            </div>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason (will be visible to the user)..."
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none resize-none min-h-[80px]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(239,68,68,0.30)" }}
              autoFocus
            />
            <div className="flex gap-3 pt-1">
              <button onClick={cancelReject}
                className="flex-1 py-2.5 rounded-xl font-inter font-semibold text-sm"
                style={{ background: "transparent", border: "1px solid rgba(212,175,55,0.35)", color: "#F5D060" }}>
                Cancel
              </button>
              <button onClick={confirmReject}
                className="flex-1 py-2.5 rounded-xl font-inter font-bold text-sm"
                style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)", color: "#fff" }}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}