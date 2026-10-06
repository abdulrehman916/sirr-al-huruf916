/**
 * CodeDetailPage — Complete detail view for a single access code.
 * Shows: customer info, device binding, redemption info, expiry, remaining time,
 * granted features, subscription plans, renewal history, audit log, admin notes, status.
 *
 * Admin actions: Renew, Disable/Enable, Reset Device, Delete, Edit Features.
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft, KeyRound, RefreshCw, Trash2, ToggleLeft, ToggleRight,
  Smartphone, Mail, Phone, MessageCircle, Clock, FileText, History,
  Shield, Loader2, AlertCircle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import RemainingTime from "@/components/admin/RemainingTime";
import RenewCodeModal from "@/components/admin/RenewCodeModal";
import EditCodeModal from "@/components/admin/EditCodeModal";
import {
  getCodeStatus, fmtDateTime, formatRemainingLong, isLifetime,
} from "@/lib/codeDuration";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

function InfoRow({ icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: G.bg, border: `1px solid ${G.border}` }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-white/35 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-white truncate" style={color ? { color } : {}}>{value || "—"}</p>
      </div>
    </div>
  );
}

function AuditEntry({ entry }) {
  const colors = {
    CREATED: "#22c55e", REDEEMED: "#3b82f6", RENEWED: "#f59e0b",
    DISABLED: "#ef4444", ENABLED: "#22c55e", DELETED: "#ef4444",
    RESET_DEVICE: "#a855f7", ADDED_FEATURES: "#3b82f6", REMOVED_FEATURES: "#ef4444",
    REJECTED_ALREADY_REDEEMED: "#ef4444", REJECTED_EXPIRED: "#f59e0b", REJECTED_DISABLED: "#ef4444",
  };
  const color = colors[entry.action] || "#9ca3af";
  return (
    <div className="flex items-start gap-2 py-1.5">
      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold" style={{ color }}>{entry.action}</p>
        <p className="text-[10px] text-white/40">{fmtDateTime(entry.timestamp)}</p>
        {entry.details && <p className="text-[10px] text-white/50 mt-0.5">{entry.details}</p>}
      </div>
    </div>
  );
}

export default function CodeDetailPage() {
  const { codeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRenew, setShowRenew] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.AccessCode.get(codeId);
      setCode(data);
    } catch (e) {
      toast({ title: "Failed to load code", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [codeId]);

  const handleToggleDisable = async () => {
    setActionLoading(true);
    try {
      const res = await base44.functions.invoke("setAccessCodeDisabled", { code_id: code.id, disable: !code.is_disabled });
      if (!res.data?.success) throw new Error(res.data?.message || "Action failed");
      toast({ title: code.is_disabled ? "✓ Code enabled" : "✓ Code disabled" });
      load();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetDevice = async () => {
    if (!confirm(`Reset device binding for "${code.code}"? This allows the code to be redeemed on a new device.`)) return;
    setActionLoading(true);
    try {
      const res = await base44.functions.invoke("resetCodeDevice", { code_id: code.id });
      if (res.data?.success) {
        toast({ title: "✓ Device binding reset" });
        load();
      } else {
        toast({ title: "Reset failed", description: res.data?.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Reset failed", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete code "${code.code}"? This permanently revokes all permissions granted by this code.`)) return;
    setActionLoading(true);
    try {
      const res = await base44.functions.invoke("deleteAccessCodeSecure", { code_id: code.id });
      if (res.data?.success) {
        toast({ title: `✓ Code "${code.code}" deleted` });
        navigate("/admin/access-dashboard?tab=codes");
      } else {
        toast({ title: "Delete failed", description: res.data?.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Loading..." showBackButton backPath="/admin/access-dashboard?tab=codes">
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: G.text }} />
        </div>
      </AdminLayout>
    );
  }

  if (!code) {
    return (
      <AdminLayout title="Code Not Found" showBackButton backPath="/admin/access-dashboard?tab=codes">
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-white/20" />
          <p className="text-white/40">Code not found</p>
        </div>
      </AdminLayout>
    );
  }

  const status = getCodeStatus(code);
  const auditLog = code.audit_log || [];
  const renewalHistory = code.renewal_history || [];

  return (
    <AdminLayout title={`Code: ${code.code}`} showBackButton backPath="/admin/access-dashboard?tab=codes">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-3xl mx-auto">

        {/* Status + Actions Bar */}
        <div className="rounded-2xl border p-4 flex items-center gap-3 flex-wrap"
          style={{ background: G.bg, borderColor: G.border }}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <KeyRound className="w-5 h-5 flex-shrink-0" style={{ color: G.text }} />
            <span className="font-inter font-bold text-white tracking-widest text-sm">{code.code}</span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0"
              style={{ background: status.color + "18", color: status.color, border: `1px solid ${status.color}40` }}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowRenew(true)} title="Renew"
              className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.30)", color: "#f59e0b" }}>
              <RefreshCw className="w-3.5 h-3.5" /> Renew
            </button>
            <button onClick={handleToggleDisable} disabled={actionLoading} title={code.is_disabled ? "Enable" : "Disable"}
              className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
              style={{
                background: code.is_disabled ? "rgba(34,197,94,0.12)" : "rgba(107,114,128,0.12)",
                border: `1px solid ${code.is_disabled ? "rgba(34,197,94,0.30)" : "rgba(107,114,128,0.30)"}`,
                color: code.is_disabled ? "#4ade80" : "#9ca3af",
              }}>
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                code.is_disabled ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
              {code.is_disabled ? "Enable" : "Disable"}
            </button>
            <button onClick={() => setShowEdit(true)} title="Edit Features"
              className="px-3 py-2 rounded-lg text-xs font-bold"
              style={{ background: G.bgHi, border: `1px solid ${G.border}`, color: G.text }}>
              Edit
            </button>
            <button onClick={handleResetDevice} disabled={actionLoading || !code.device_id} title="Reset Device"
              className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
              style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.30)", color: "#a855f7" }}>
              <Smartphone className="w-3.5 h-3.5" /> Reset
            </button>
            <button onClick={handleDelete} disabled={actionLoading} title="Delete"
              className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.30)", color: "#ef4444" }}>
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>

        {/* Customer Info */}
        <div className="rounded-2xl border p-4" style={{ background: "rgba(8,16,40,0.60)", borderColor: G.border }}>
          <h3 className="font-inter font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" style={{ color: G.text }} /> Customer Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <InfoRow icon={<span className="text-xs">👤</span>} label="Customer Name" value={code.customer_name} />
            <InfoRow icon={<Mail className="w-3.5 h-3.5 text-white/40" />} label="Email" value={code.email || code.used_by_email} />
            <InfoRow icon={<Phone className="w-3.5 h-3.5 text-white/40" />} label="Phone" value={code.phone} />
            <InfoRow icon={<MessageCircle className="w-3.5 h-3.5 text-white/40" />} label="WhatsApp" value={code.whatsapp} />
          </div>
        </div>

        {/* Device & Redemption Info */}
        <div className="rounded-2xl border p-4" style={{ background: "rgba(8,16,40,0.60)", borderColor: G.border }}>
          <h3 className="font-inter font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5" style={{ color: G.text }} /> Device & Redemption
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <InfoRow icon={<Smartphone className="w-3.5 h-3.5 text-white/40" />} label="Device ID" value={code.device_id ? code.device_id.slice(0, 24) + "…" : "Not redeemed yet"} />
            <InfoRow icon={<KeyRound className="w-3.5 h-3.5 text-white/40" />} label="User ID" value={code.used_by_user_id ? code.used_by_user_id.slice(0, 24) + "…" : "—"} />
            <InfoRow icon={<Clock className="w-3.5 h-3.5 text-white/40" />} label="Redeemed Date" value={code.used_at ? fmtDateTime(code.used_at) : "Not redeemed"} />
            <InfoRow icon={<Clock className="w-3.5 h-3.5 text-white/40" />} label="Expiry Date" value={fmtDateTime(code.expiry_date)} color={isLifetime(code) ? { color: "#22c55e" } : undefined} />
            <InfoRow icon={<Clock className="w-3.5 h-3.5 text-white/40" />} label="Remaining Time" value={formatRemainingLong(code.expiry_date)} />
            <InfoRow icon={<RefreshCw className="w-3.5 h-3.5 text-white/40" />} label="Reset Count" value={String(code.reset_count || 0)} />
          </div>
        </div>

        {/* Granted Features */}
        <div className="rounded-2xl border p-4" style={{ background: "rgba(8,16,40,0.60)", borderColor: G.border }}>
          <h3 className="font-inter font-bold text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" style={{ color: G.text }} /> Granted Features & Plans
          </h3>
          <div className="space-y-2">
            {(code.page_names || code.page_paths || []).map((name, i) => {
              const path = code.page_paths?.[i] || name;
              const dur = code.page_durations?.[path];
              const subFeats = code.sub_features?.[path] || [];
              return (
                <div key={i} className="rounded-lg border p-3" style={{ background: G.bg, borderColor: G.border }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-medium">{name}</span>
                    {dur && (
                      <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: G.bgHi, color: G.text }}>
                        {dur.label || "Lifetime"}
                      </span>
                    )}
                  </div>
                  {subFeats.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {subFeats.map(f => (
                        <span key={f} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.60)" }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Feature plans */}
                  {subFeats.map(featId => {
                    const featKey = `${path}:${featId}`;
                    const featDur = code.feature_durations?.[featKey];
                    if (!featDur) return null;
                    return (
                      <p key={featId} className="text-[10px] text-white/40 mt-1">
                        {featId}: {featDur.plan_name || "Plan"} {featDur.is_lifetime ? "(Lifetime)" : `(${featDur.duration_days} days)`}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Renewal History */}
        {renewalHistory.length > 0 && (
          <div className="rounded-2xl border p-4" style={{ background: "rgba(8,16,40,0.60)", borderColor: G.border }}>
            <h3 className="font-inter font-bold text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
              <History className="w-3.5 h-3.5" style={{ color: G.text }} /> Renewal History ({renewalHistory.length})
            </h3>
            <div className="space-y-2">
              {renewalHistory.map((r, i) => (
                <div key={i} className="rounded-lg border p-2.5 text-xs" style={{ background: G.bg, borderColor: G.border }}>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">{fmtDateTime(r.renewed_at)}</span>
                    <span className="font-semibold" style={{ color: G.text }}>
                      {r.duration_type === 'LIFETIME' ? 'Lifetime' : `${r.duration_count || ''} ${r.duration_type?.toLowerCase() || ''}`}
                    </span>
                  </div>
                  <p className="text-white/35 mt-1">
                    {r.old_expiry ? fmtDateTime(r.old_expiry) : '∞'} → {r.new_expiry ? fmtDateTime(r.new_expiry) : '∞ Lifetime'}
                  </p>
                  {r.notes && <p className="text-white/40 mt-1 italic">{r.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Log */}
        {auditLog.length > 0 && (
          <div className="rounded-2xl border p-4" style={{ background: "rgba(8,16,40,0.60)", borderColor: G.border }}>
            <h3 className="font-inter font-bold text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
              <History className="w-3.5 h-3.5" style={{ color: G.text }} /> Audit Log ({auditLog.length})
            </h3>
            <div className="space-y-0">
              {auditLog.slice().reverse().map((entry, i) => (
                <AuditEntry key={i} entry={entry} />
              ))}
            </div>
          </div>
        )}

        {/* Admin Notes */}
        {code.notes && (
          <div className="rounded-2xl border p-4" style={{ background: "rgba(8,16,40,0.60)", borderColor: G.border }}>
            <h3 className="font-inter font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" style={{ color: G.text }} /> Admin Notes
            </h3>
            <p className="text-sm text-white/60 italic">{code.notes}</p>
          </div>
        )}

        {/* Back button */}
        <button onClick={() => navigate("/admin/access-dashboard?tab=codes")}
          className="w-full py-2.5 rounded-xl font-inter font-semibold text-xs flex items-center justify-center gap-2"
          style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>
          <ChevronLeft className="w-4 h-4" /> Back to Access Codes
        </button>
      </motion.div>

      {/* Modals */}
      <RenewCodeModal code={showRenew ? code : null} onClose={() => setShowRenew(false)} onRenewed={() => { setShowRenew(false); load(); }} />
      <EditCodeModal code={showEdit ? code : null} onClose={() => setShowEdit(false)} onUpdated={() => { setShowEdit(false); load(); }} />
    </AdminLayout>
  );
}