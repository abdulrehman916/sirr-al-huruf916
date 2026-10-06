/**
 * PlanEditor — Inline editor for a single subscription plan.
 * Creates/updates/deletes a SubscriptionPlanConfig record (individual save).
 * Used in AdminFeaturePricing page via FeaturePlansEditor.
 *
 * Supports 4 duration types: Days, Months, Years, Lifetime.
 */
import { useState } from "react";
import { Check, Loader2, Edit3, Trash2, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

const DURATION_TYPES = [
  { value: "DAYS",     label: "Days",    multiplier: 1   },
  { value: "MONTHS",   label: "Months",  multiplier: 30  },
  { value: "YEARS",    label: "Years",   multiplier: 365 },
  { value: "LIFETIME", label: "Lifetime",multiplier: null},
];

// Reverse-engineer display unit from stored duration_days (backward compat)
function inferDurationType(plan) {
  if (plan.duration_type === "LIFETIME") return { type: "LIFETIME", count: null };
  if (plan.duration_type && plan.duration_type !== "DAYS") {
    // Already has a non-DAYS type (MONTHS/YEARS) — use stored count
    return { type: plan.duration_type, count: plan.duration_count || 1 };
  }
  // Backward compat: infer from duration_days
  const days = plan.duration_days || 0;
  if (days > 0 && days % 365 === 0) return { type: "YEARS", count: days / 365 };
  if (days > 0 && days % 30 === 0) return { type: "MONTHS", count: days / 30 };
  return { type: "DAYS", count: days };
}

export default function PlanEditor({ pagePath, featureId, plan, sortOrder, onSaved }) {
  const isExisting = !!plan;
  const inferred = isExisting ? inferDurationType(plan) : { type: "MONTHS", count: 1 };
  const [editing, setEditing] = useState(!isExisting);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [planName, setPlanName] = useState(plan?.plan_name || "");
  const [durationType, setDurationType] = useState(inferred.type);
  const [durationCount, setDurationCount] = useState(inferred.count || 1);
  const [price, setPrice] = useState(plan?.price || "");
  const [currency, setCurrency] = useState(plan?.currency || "AED");

  const planConfigId = plan?.plan_config_id || `PLAN-${featureId}-${Date.now()}`;

  const computeDays = (type, count) => {
    const meta = DURATION_TYPES.find(t => t.value === type);
    if (!meta?.multiplier) return null;
    return (parseInt(count) || 0) * meta.multiplier;
  };

  const handleSave = async () => {
    if (!planName.trim() || !price) return;
    setSaving(true);
    try {
      const me = await base44.auth.me();
      const data = {
        plan_config_id: planConfigId,
        page_path: pagePath,
        feature_id: featureId,
        plan_name: planName.trim(),
        duration_type: durationType,
        duration_count: durationType === "LIFETIME" ? null : (parseInt(durationCount) || 0),
        duration_days: computeDays(durationType, durationCount),
        price: parseFloat(price) || 0,
        currency: currency.trim() || "AED",
        is_active: true,
        sort_order: plan?.sort_order ?? sortOrder,
        updated_by: me?.id || "",
        updated_at: new Date().toISOString(),
      };
      if (plan?.id) {
        await base44.entities.SubscriptionPlanConfig.update(plan.id, data);
      } else {
        await base44.entities.SubscriptionPlanConfig.create(data);
      }
      setEditing(false);
      if (onSaved) onSaved();
    } catch (e) {
      console.error("Failed to save plan:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!plan?.id) { setEditing(false); return; }
    if (!confirm(`Delete plan "${plan.plan_name}"?`)) return;
    setDeleting(true);
    try {
      await base44.entities.SubscriptionPlanConfig.delete(plan.id);
      if (onSaved) onSaved();
    } catch (e) {
      console.error("Failed to delete plan:", e);
    } finally {
      setDeleting(false);
    }
  };

  const isLifetime = durationType === 'LIFETIME';

  // Display mode (existing plan, not editing)
  if (isExisting && !editing) {
    const dispType = inferred;
    const durationLabel = dispType.type === "LIFETIME"
      ? "Lifetime"
      : `${dispType.count} ${dispType.type.toLowerCase().replace(/s$/, '')}${dispType.count > 1 ? 's' : ''}`;
    return (
      <div className="rounded-lg border p-2.5 flex items-center gap-3" style={{
        background: G.bg, borderColor: G.border,
      }}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{plan.plan_name}</p>
          <p className="text-[10px] text-white/40">
            {durationLabel} · {plan.currency} {plan.price}
          </p>
        </div>
        <button onClick={() => setEditing(true)}
          className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.50)" }}>
          <Edit3 className="w-3 h-3" />
        </button>
        <button onClick={handleDelete} disabled={deleting}
          className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" }}>
          {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
        </button>
      </div>
    );
  }

  // Edit / Create mode
  return (
    <div className="rounded-lg border p-3 space-y-2.5" style={{
      background: G.bgHi, borderColor: G.borderHi,
    }}>
      <div className="flex items-center gap-2 mb-1">
        {isExisting ? <Edit3 className="w-3 h-3" style={{ color: G.text }} /> : <Plus className="w-3 h-3" style={{ color: G.text }} />}
        <span className="text-xs font-semibold" style={{ color: G.text }}>{isExisting ? "Edit Plan" : "New Plan"}</span>
      </div>

      <div>
        <label className="text-[10px] text-white/40 block mb-1">Plan Name</label>
        <input value={planName} onChange={e => setPlanName(e.target.value)}
          placeholder="e.g. 1 Month"
          className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-white/40 block mb-1">Duration Type</label>
          <select value={durationType} onChange={e => setDurationType(e.target.value)}
            className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
            style={{ background: "rgba(8,16,40,0.98)", border: `1px solid ${G.border}` }}>
            {DURATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        {!isLifetime && (
          <div>
            <label className="text-[10px] text-white/40 block mb-1">Duration</label>
            <input type="number" min={1} value={durationCount} onChange={e => setDurationCount(e.target.value)}
              className="w-full px-2 py-1.5 rounded text-sm text-white outline-none text-center"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <label className="text-[10px] text-white/40 block mb-1">Price</label>
          <input type="number" min={0} step="0.01" value={price} onChange={e => setPrice(e.target.value)}
            placeholder="25"
            className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
        </div>
        <div>
          <label className="text-[10px] text-white/40 block mb-1">Currency</label>
          <input value={currency} onChange={e => setCurrency(e.target.value)}
            className="w-full px-2 py-1.5 rounded text-sm text-white outline-none text-center"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={() => { setEditing(false); if (!isExisting && onSaved) onSaved(); }}
          className="flex-1 py-2 rounded-lg text-xs font-semibold"
          style={{ background: "transparent", border: `1px solid ${G.border}`, color: "rgba(255,255,255,0.50)" }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving || !planName.trim() || !price}
          className="flex-1 py-2 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
          style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}