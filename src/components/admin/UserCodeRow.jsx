/**
 * UserCodeRow — Compact code row for UserDetailPage.
 * Shows: code, created/redeemed dates, expiry, remaining, pages, device, status.
 * Actions: Renew, Reset Device, Disable/Enable, Delete.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  KeyRound, RefreshCw, Trash2, ToggleLeft, ToggleRight, Smartphone,
  Clock, Loader2, ChevronRight, Copy, Check,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { getCodeStatus, fmtDate, fmtDateTime, isLifetime } from "@/lib/codeDuration";
import RemainingTime from "./RemainingTime";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

export default function UserCodeRow({ code, onAction }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const status = getCodeStatus(code);

  const copyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleToggleDisable = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const me = await base44.auth.me();
      const now = new Date().toISOString();
      await base44.entities.AccessCode.update(code.id, {
        is_disabled: !code.is_disabled,
        audit_log: [...(code.audit_log || []), {
          action: code.is_disabled ? 'ENABLED' : 'DISABLED',
          timestamp: now, admin_id: me?.id || '', details: code.is_disabled ? 'Code enabled' : 'Code disabled',
        }],
      });
      toast({ title: code.is_disabled ? "✓ Code enabled" : "✓ Code disabled" });
      if (onAction) onAction();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetDevice = async (e) => {
    e.stopPropagation();
    if (!confirm(`Reset device binding for "${code.code}"?`)) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("resetCodeDevice", { code_id: code.id });
      if (res.data?.success) {
        toast({ title: "✓ Device binding reset" });
        if (onAction) onAction();
      } else {
        toast({ title: "Reset failed", description: res.data?.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Reset failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Delete code "${code.code}"? This permanently revokes all permissions.`)) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("deleteAccessCodeSecure", { code_id: code.id });
      if (res.data?.success) {
        toast({ title: `✓ Code "${code.code}" deleted` });
        if (onAction) onAction();
      } else {
        toast({ title: "Delete failed", description: res.data?.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/admin/access-codes/${code.id}`)}
      className="rounded-xl border p-3 space-y-2 cursor-pointer transition-all hover:border-yellow-500/40"
      style={{ background: G.bg, borderColor: code.is_disabled ? "rgba(107,114,128,0.25)" : G.border }}
    >
      {/* Row 1: code + status + actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <KeyRound className="w-3.5 h-3.5 flex-shrink-0" style={{ color: G.text }} />
          <span className="font-inter font-bold text-white tracking-widest text-xs">{code.code}</span>
          <button onClick={copyCode} className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
            {copied ? <Check className="w-2.5 h-2.5 text-green-400" /> : <Copy className="w-2.5 h-2.5 text-white/40" />}
          </button>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0"
          style={{ background: status.color + "18", color: status.color, border: `1px solid ${status.color}40` }}>
          {status.label}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onAction?.("renew", code); }} title="Renew"
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.10)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>
            <RefreshCw className="w-3 h-3" />
          </button>
          <button onClick={handleResetDevice} disabled={loading || !code.device_id} title="Reset Device"
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: "rgba(168,85,247,0.10)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.25)" }}>
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Smartphone className="w-3 h-3" />}
          </button>
          <button onClick={handleToggleDisable} disabled={loading} title={code.is_disabled ? "Enable" : "Disable"}
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{
              background: code.is_disabled ? "rgba(34,197,94,0.10)" : "rgba(107,114,128,0.10)",
              color: code.is_disabled ? "#4ade80" : "#9ca3af",
              border: `1px solid ${code.is_disabled ? "rgba(34,197,94,0.25)" : "rgba(107,114,128,0.25)"}`,
            }}>
            {code.is_disabled ? <ToggleLeft className="w-3 h-3" /> : <ToggleRight className="w-3 h-3" />}
          </button>
          <button onClick={handleDelete} disabled={loading} title="Delete"
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.10)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
            <Trash2 className="w-2.5 h-2.5" />
          </button>
          <ChevronRight className="w-3 h-3 text-white/30" />
        </div>
      </div>

      {/* Row 2: dates + device */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/45">
        <span>📅 {fmtDate(code.created_date)}</span>
        {code.used_at && <span>🔓 {fmtDate(code.used_at)}</span>}
        <span className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" /> {isLifetime(code) ? "Lifetime" : fmtDate(code.expiry_date)}
        </span>
        <RemainingTime expiryDate={code.expiry_date} />
        {code.device_id && <span className="text-white/30">📱 {code.device_id.slice(0, 12)}…</span>}
      </div>

      {/* Row 3: pages */}
      <div className="flex flex-wrap gap-1">
        {(code.page_names || code.page_paths || []).slice(0, 4).map((name, i) => (
          <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
            style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>
            {name}
          </span>
        ))}
        {(code.page_names || []).length > 4 && (
          <span className="px-1.5 py-0.5 rounded text-[9px] text-white/40">
            +{(code.page_names || []).length - 4} more
          </span>
        )}
      </div>
    </div>
  );
}