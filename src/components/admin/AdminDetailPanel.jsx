/**
 * AdminDetailPanel — Portal-based panel showing admin details,
 * device binding, assigned customers, permissions, and activity log.
 */
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Crown, Shield, Smartphone, Clock, Users, Activity, CheckCircle, Ban } from "lucide-react";
import { ADMIN_PERMISSIONS } from "@/lib/adminPermissions";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-2 py-1.5">
      <span className="text-[10px] text-white/40 uppercase tracking-wider flex-shrink-0">{label}</span>
      <span className="text-xs text-white/70 text-right break-all">{value || "—"}</span>
    </div>
  );
}

export default function AdminDetailPanel({ profile, onClose }) {
  const isOwner = profile.is_owner;
  const activityLog = [...(profile.activity_log || [])].reverse().slice(0, 20);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[85vh] rounded-2xl border overflow-hidden flex flex-col"
        style={{ background: "linear-gradient(145deg, #0c1630 0%, #060c1c 100%)", borderColor: G.borderHi }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: G.border }}>
          <div className="flex items-center gap-2 min-w-0">
            {isOwner ? (
              <Crown className="w-5 h-5 flex-shrink-0" style={{ color: G.text }} />
            ) : (
              <Shield className="w-5 h-5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.40)" }} />
            )}
            <h3 className="font-inter font-bold text-white text-sm truncate">
              {profile.full_name || profile.email}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
            style={{ color: "rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.04)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Profile Info */}
          <div className="rounded-xl border p-3" style={{ background: G.bg, borderColor: G.border }}>
            <div className="flex items-center gap-2 mb-2">
              {profile.status === "ACTIVE" ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Ban className="w-3.5 h-3.5 text-red-400" />
              )}
              <span
                className="text-xs font-semibold"
                style={{ color: profile.status === "ACTIVE" ? "#4ade80" : "#f87171" }}
              >
                {profile.status}
              </span>
              {isOwner && (
                <span
                  className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider"
                  style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.borderHi}` }}
                >
                  Owner
                </span>
              )}
            </div>
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="WhatsApp" value={profile.whatsapp_number} />
            <InfoRow
              label="Created"
              value={profile.created_date ? new Date(profile.created_date).toLocaleString() : "—"}
            />
            <InfoRow
              label="Last Login"
              value={profile.last_login ? new Date(profile.last_login).toLocaleString() : "Never"}
            />
            <InfoRow label="Login Count" value={profile.login_count || 0} />
          </div>

          {/* Device Binding */}
          <div
            className="rounded-xl border p-3"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: G.border }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="w-3.5 h-3.5" style={{ color: G.dim }} />
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                Device Binding
              </span>
            </div>
            <InfoRow
              label="Device ID"
              value={profile.device_id ? profile.device_id.substring(0, 16) + "…" : "Not bound"}
            />
            <InfoRow
              label="Bound At"
              value={profile.device_bound_at ? new Date(profile.device_bound_at).toLocaleString() : "—"}
            />
            <InfoRow label="Reset Count" value={profile.reset_count || 0} />
          </div>

          {/* Assigned Customers */}
          <div
            className="rounded-xl border p-3"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: G.border }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-3.5 h-3.5" style={{ color: G.dim }} />
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                Assigned Customers
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: G.text }}>
              {profile.assigned_customer_count || 0}
            </p>
            <p className="text-[10px] text-white/30">customers assigned to this admin</p>
          </div>

          {/* Permissions */}
          <div
            className="rounded-xl border p-3"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: G.border }}
          >
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold block mb-2">
              Permissions
            </span>
            <div className="space-y-1.5">
              {ADMIN_PERMISSIONS.map((perm) => {
                const has = isOwner || profile[perm.key] === true;
                return (
                  <div key={perm.key} className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[9px]"
                      style={{
                        background: has ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.08)",
                        color: has ? "#4ade80" : "#f87171",
                      }}
                    >
                      {has ? "✓" : "✗"}
                    </span>
                    <span className="text-xs text-white/60">
                      {perm.icon} {perm.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Log */}
          <div
            className="rounded-xl border p-3"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: G.border }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-3.5 h-3.5" style={{ color: G.dim }} />
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                Activity Log
              </span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {activityLog.length === 0 ? (
                <p className="text-[10px] text-white/25">No activity recorded</p>
              ) : (
                activityLog.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[10px]">
                    <Clock className="w-2.5 h-2.5 text-white/20 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold" style={{ color: G.dim }}>
                        {entry.action}
                      </span>
                      <span className="text-white/25 ml-1">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      {entry.details && (
                        <p className="text-white/30 truncate">{entry.details}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}