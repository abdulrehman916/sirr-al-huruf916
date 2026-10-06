/**
 * RedeemApprovalDetail — Detail dialog for reviewing a redeem code approval.
 * Shows full info, audit log, and action buttons (Approve, Reject, Request Info, Override).
 * Actions are RBAC-gated: admin sees Approve/Reject/Request Info; owner additionally sees Override.
 */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle, MessageSquare, Gavel, History } from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
};

const STATUS_LABELS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  INFO_REQUESTED: "Info Requested",
  OVERRIDDEN: "Overridden",
};

export default function RedeemApprovalDetail({
  approval,
  isOwner,
  onApprove,
  onReject,
  onRequestInfo,
  onOverride,
  loading,
}) {
  const [activeAction, setActiveAction] = useState(null); // 'reject' | 'requestInfo' | 'override'
  const [rejectReason, setRejectReason] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [overrideStatus, setOverrideStatus] = useState("APPROVED");
  const [overrideReason, setOverrideReason] = useState("");

  if (!approval) return null;

  const isPending = approval.status === "PENDING" || approval.status === "INFO_REQUESTED";
  const canOverride = isOwner && !isPending;

  const resetForms = () => {
    setActiveAction(null);
    setRejectReason("");
    setInfoMessage("");
    setOverrideReason("");
  };

  const handleApprove = () => {
    onApprove(approval.approval_id);
    resetForms();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    onReject(approval.approval_id, rejectReason.trim());
    resetForms();
  };

  const handleRequestInfo = () => {
    if (!infoMessage.trim()) return;
    onRequestInfo(approval.approval_id, infoMessage.trim());
    resetForms();
  };

  const handleOverride = () => {
    if (!overrideReason.trim()) return;
    onOverride(approval.approval_id, overrideStatus, overrideReason.trim());
    resetForms();
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
      <DialogHeader>
        <DialogTitle className="text-white text-sm flex items-center gap-2">
          <span className="font-mono">{approval.code}</span>
          <span className="text-white/30">—</span>
          <span className="text-white/60">{approval.approval_id}</span>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        {/* Customer Info */}
        <div className="p-3 rounded-lg bg-white/5 space-y-1 text-sm">
          <p className="text-white">
            <strong className="text-white/60">Customer:</strong> {approval.customer_name || "—"}
          </p>
          <p className="text-white">
            <strong className="text-white/60">Email:</strong> {approval.customer_email || "—"}
          </p>
          <p className="text-white">
            <strong className="text-white/60">Status:</strong>{" "}
            <span style={{ color: G.text }}>{STATUS_LABELS[approval.status] || approval.status}</span>
          </p>
          {approval.assigned_admin_name && (
            <p className="text-white">
              <strong className="text-white/60">Assigned Admin:</strong>{" "}
              {approval.assigned_admin_name}
            </p>
          )}
          {approval.reviewed_by_name && (
            <p className="text-white">
              <strong className="text-white/60">Reviewed By:</strong>{" "}
              {approval.reviewed_by_name} ({approval.reviewed_by_role})
            </p>
          )}
          <p className="text-white">
            <strong className="text-white/60">Submitted:</strong>{" "}
            {approval.submitted_at
              ? new Date(approval.submitted_at).toLocaleString()
              : "—"}
          </p>
        </div>

        {/* Info Request Message */}
        {approval.status === "INFO_REQUESTED" && approval.info_request_message && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <Label className="text-yellow-400 text-xs">Info Request Message:</Label>
            <p className="text-white text-sm mt-1 whitespace-pre-wrap">
              {approval.info_request_message}
            </p>
          </div>
        )}

        {/* Customer Response */}
        {approval.customer_response && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <Label className="text-blue-400 text-xs">Customer Response:</Label>
            <p className="text-white text-sm mt-1 whitespace-pre-wrap">
              {approval.customer_response}
            </p>
          </div>
        )}

        {/* Rejection Reason */}
        {approval.rejection_reason && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <Label className="text-red-400 text-xs">Rejection Reason:</Label>
            <p className="text-white text-sm mt-1 whitespace-pre-wrap">
              {approval.rejection_reason}
            </p>
          </div>
        )}

        {/* Activated Features */}
        {approval.status === "APPROVED" && approval.activated_features?.length > 0 && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <Label className="text-green-400 text-xs">Activated Features:</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {approval.activated_features.map((feat, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/40"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Override Info */}
        {approval.override_by_owner && (
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <Label className="text-purple-400 text-xs">Owner Override:</Label>
            <p className="text-white text-sm mt-1">
              Original decision: <strong>{approval.original_decision}</strong> → Overridden to{" "}
              <strong>{approval.status}</strong>
            </p>
            {approval.override_reason && (
              <p className="text-white/70 text-xs mt-1">Reason: {approval.override_reason}</p>
            )}
          </div>
        )}

        {/* Audit Log */}
        {approval.audit_log?.length > 0 && (
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-3.5 h-3.5 text-white/40" />
              <Label className="text-white/60 text-xs">Audit Log</Label>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {approval.audit_log.map((entry, i) => (
                <div key={i} className="text-[10px] text-white/50 border-l-2 border-white/10 pl-2">
                  <span className="font-semibold text-white/70">{entry.action}</span>
                  {" — "}
                  <span>{entry.user_name}</span>
                  {" ("}
                  <span>{entry.user_role}</span>
                  {")"}
                  <br />
                  <span className="text-white/30">
                    {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "—"}
                  </span>
                  {entry.details && (
                    <>
                      <br />
                      <span className="text-white/40">{entry.details}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Area */}
        {isPending && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleApprove}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                size="sm"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                Approve
              </Button>
              <Button
                onClick={() => setActiveAction(activeAction === "reject" ? null : "reject")}
                disabled={loading}
                variant="outline"
                className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs"
                size="sm"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Reject
              </Button>
              <Button
                onClick={() => setActiveAction(activeAction === "requestInfo" ? null : "requestInfo")}
                disabled={loading}
                variant="outline"
                className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 text-xs"
                size="sm"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1" />
                Request Info
              </Button>
            </div>

            {/* Reject Form */}
            {activeAction === "reject" && (
              <div className="space-y-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <Label className="text-red-400 text-xs">Rejection Reason *</Label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="bg-white/5 border-white/10 text-white text-sm min-h-[60px]"
                />
                <Button
                  onClick={handleReject}
                  disabled={loading || !rejectReason.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs"
                  size="sm"
                >
                  Confirm Reject
                </Button>
              </div>
            )}

            {/* Request Info Form */}
            {activeAction === "requestInfo" && (
              <div className="space-y-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                <Label className="text-yellow-400 text-xs">Message to Customer *</Label>
                <Textarea
                  value={infoMessage}
                  onChange={(e) => setInfoMessage(e.target.value)}
                  placeholder="What information do you need from the customer?"
                  className="bg-white/5 border-white/10 text-white text-sm min-h-[60px]"
                />
                <Button
                  onClick={handleRequestInfo}
                  disabled={loading || !infoMessage.trim()}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                  size="sm"
                >
                  Send Request
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Override Area (Owner only, for already-decided approvals) */}
        {canOverride && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <Button
              onClick={() => setActiveAction(activeAction === "override" ? null : "override")}
              disabled={loading}
              variant="outline"
              className="border-purple-500/40 text-purple-400 hover:bg-purple-500/10 text-xs"
              size="sm"
            >
              <Gavel className="w-3.5 h-3.5 mr-1" />
              Override Decision
            </Button>

            {activeAction === "override" && (
              <div className="space-y-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <div>
                  <Label className="text-purple-400 text-xs">New Decision *</Label>
                  <Select value={overrideStatus} onValueChange={setOverrideStatus}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APPROVED">Approve</SelectItem>
                      <SelectItem value="REJECTED">Reject</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-purple-400 text-xs">Override Reason *</Label>
                  <Textarea
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Reason for overriding the admin's decision..."
                    className="bg-white/5 border-white/10 text-white text-sm min-h-[60px]"
                  />
                </div>
                <Button
                  onClick={handleOverride}
                  disabled={loading || !overrideReason.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                  size="sm"
                >
                  Confirm Override
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DialogContent>
  );
}