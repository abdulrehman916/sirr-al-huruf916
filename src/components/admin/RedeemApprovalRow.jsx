/**
 * RedeemApprovalRow — Single approval row in the admin list.
 * Shows code, customer, status badge, and timestamp.
 */
import { Ticket, User, Mail, Calendar } from "lucide-react";

const STATUS_CONFIG = {
  PENDING: { color: "bg-blue-500/20 text-blue-400 border-blue-500/50", label: "Pending" },
  APPROVED: { color: "bg-green-500/20 text-green-400 border-green-500/50", label: "Approved" },
  REJECTED: { color: "bg-red-500/20 text-red-400 border-red-500/50", label: "Rejected" },
  INFO_REQUESTED: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50", label: "Info Requested" },
  OVERRIDDEN: { color: "bg-purple-500/20 text-purple-400 border-purple-500/50", label: "Overridden" },
};

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
};

export default function RedeemApprovalRow({ approval, onClick }) {
  const statusConfig = STATUS_CONFIG[approval.status] || STATUS_CONFIG.PENDING;

  return (
    <div
      onClick={() => onClick(approval)}
      className="rounded-xl border p-4 cursor-pointer transition-all hover:scale-[1.01]"
      style={{ background: G.bg, borderColor: G.border }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Code + Status */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Ticket className="w-3.5 h-3.5" style={{ color: G.text }} />
            <span className="font-mono font-bold text-white text-xs">{approval.code}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            {approval.override_by_owner && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-purple-500/50 text-purple-400 font-semibold">
                Overridden
              </span>
            )}
          </div>

          {/* Customer info */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/50">
            {approval.customer_name && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {approval.customer_name}
              </span>
            )}
            {approval.customer_email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {approval.customer_email}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {approval.submitted_at
                ? new Date(approval.submitted_at).toLocaleDateString()
                : "—"}
            </span>
          </div>

          {/* Assigned admin */}
          {approval.assigned_admin_name && (
            <p className="text-[10px] mt-1" style={{ color: G.dim }}>
              Admin: {approval.assigned_admin_name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}