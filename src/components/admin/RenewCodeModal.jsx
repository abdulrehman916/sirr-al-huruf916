/**
 * RenewCodeModal — Renew an expired or active access code.
 * Admin selects a new duration type, count, or custom date.
 * The same code continues working — no new code needed.
 */
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, RefreshCw, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import {
  DURATION_TYPES, DURATION_PRESETS, computeExpiry, formatDurationLabel, fmtDateTime,
} from "@/lib/codeDuration";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

export default function RenewCodeModal({ code, onClose, onRenewed }) {
  const { toast } = useToast();
  const [durationType, setDurationType] = useState("MONTHS");
  const [durationCount, setDurationCount] = useState(1);
  const [customDate, setCustomDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // ESC key closes modal; clean up body overflow on unmount
  useEffect(() => {
    if (!code) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [code, onClose]);

  if (!code) return null;

  const isLifetime = durationType === "LIFETIME";
  const isCustom = durationType === "CUSTOM";
  const newExpiry = computeExpiry(durationType, durationCount, customDate);

  const applyPreset = (preset) => {
    setDurationType(preset.type);
    setDurationCount(preset.count || 1);
  };

  const handleRenew = async () => {
    if (isCustom && !customDate) {
      toast({ title: "Select a custom date & time", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await base44.functions.invoke("renewAccessCode", {
        code_id: code.id,
        duration_type: durationType,
        duration_count: durationCount,
        custom_date: customDate || null,
        notes: notes.trim() || null,
      });
      if (res.data?.success) {
        toast({ title: `✓ Code "${code.code}" renewed` });
        onRenewed();
      } else {
        toast({ title: "Renewal failed", description: res.data?.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Renewal failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4"
        style={{ background: "rgba(0,0,0,0.70)" }} onClick={onClose}
      >
        <div
          className="w-full max-w-lg my-8 rounded-2xl border p-5 space-y-4"
          style={{ background: "linear-gradient(145deg, #0c1630, #060c1c)", borderColor: G.borderHi }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" style={{ color: G.text }} />
              <div>
                <h3 className="font-inter font-bold text-white text-sm">Renew Code: {code.code}</h3>
                <p className="text-[10px] text-white/40">{code.customer_name}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.35)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current expiry */}
          <div className="rounded-lg border p-3 flex items-center justify-between" style={{ background: G.bg, borderColor: G.border }}>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Current Expiry</p>
              <p className="text-sm text-white font-medium">{fmtDateTime(code.expiry_date)}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider text-right">New Expiry</p>
              <p className="text-sm font-bold" style={{ color: G.text }}>{fmtDateTime(newExpiry)}</p>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <label className="text-xs text-white/45 mb-2 block">Quick Presets</label>
            <div className="flex flex-wrap gap-1.5">
              {DURATION_PRESETS.map(preset => {
                const isActive = durationType === preset.type && (preset.type === 'LIFETIME' || durationCount === preset.count);
                return (
                  <button key={preset.label} onClick={() => applyPreset(preset)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                    style={{
                      background: isActive ? G.bgHi : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isActive ? G.borderHi : "rgba(255,255,255,0.08)"}`,
                      color: isActive ? G.text : "rgba(255,255,255,0.50)",
                    }}>
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom duration selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/45 mb-1 block">Duration Type</label>
              <select value={durationType} onChange={e => setDurationType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: "rgba(8,16,40,0.98)", border: `1px solid ${G.border}` }}>
                {DURATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            {!isLifetime && !isCustom && (
              <div>
                <label className="text-xs text-white/45 mb-1 block">Count</label>
                <input type="number" min={1} value={durationCount} onChange={e => setDurationCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none text-center"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
              </div>
            )}
          </div>

          {isCustom && (
            <div>
              <label className="text-xs text-white/45 mb-1 block">Custom Date & Time</label>
              <input type="datetime-local" value={customDate} onChange={e => setCustomDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs text-white/45 mb-1 block">Renewal Notes (optional)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Customer paid for 6 more months"
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm"
              style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>
              Cancel
            </button>
            <button onClick={handleRenew} disabled={saving}
              className="flex-1 py-3 rounded-xl font-inter font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? "Renewing…" : "Confirm Renewal"}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}