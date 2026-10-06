/**
 * PricingPlanEditor — Enhanced inline editor for a single subscription plan.
 * @module PricingPlanEditor
 * Supports: plan name, duration, price, currency, sale price, discount %,
 * sale start/end dates, recommended flag, active toggle.
 *
 * Creates/updates/deletes a SubscriptionPlanConfig record.
 * Uses pricingUtils for validation + duration computation.
 */
import { useState } from "react";
import { Check, Loader2, Edit3, Trash2, Plus, Star, Tag, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  DURATION_TYPES,
  computeDurationDays,
  inferDurationType,
  formatDuration,
  formatPrice,
  formatDateShort,
  toDateTimeLocal,
  fromDateTimeLocal,
  isSaleActive,
  getEffectivePrice,
  validatePlan,
} from "@/lib/pricingUtils";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

export default function PricingPlanEditor({ pagePath, featureId, plan, sortOrder, onSaved }) {
  const isExisting = !!plan;
  const inferred = isExisting ? inferDurationType(plan) : { type: "MONTHS", count: 1 };
  const [editing, setEditing] = useState(!isExisting);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState([]);

  // Core fields
  const [planName, setPlanName] = useState(plan?.plan_name || "");
  const [durationType, setDurationType] = useState(inferred.type);
  const [durationCount, setDurationCount] = useState(inferred.count || 1);
  const [price, setPrice] = useState(plan?.price != null ? String(plan.price) : "");
  const [currency, setCurrency] = useState(plan?.currency || "AED");

  // Sale fields
  const [salePrice, setSalePrice] = useState(plan?.sale_price != null ? String(plan.sale_price) : "");
  const [discountPct, setDiscountPct] = useState(plan?.discount_percentage != null ? String(plan.discount_percentage) : "");
  const [saleStart, setSaleStart] = useState(toDateTimeLocal(plan?.sale_start_date));
  const [saleEnd, setSaleEnd] = useState(toDateTimeLocal(plan?.sale_end_date));

  // Flags
  const [isRecommended, setIsRecommended] = useState(plan?.is_recommended || false);
  const [isActive, setIsActive] = useState(plan?.is_active !== false);

  const planConfigId = plan?.plan_config_id || `PLAN-${featureId}-${Date.now()}`;
  const isLifetime = durationType === "LIFETIME";

  const handleSave = async () => {
    const planData = {
      plan_name: planName,
      price: parseFloat(price),
      duration_type: durationType,
      duration_count: isLifetime ? null : parseInt(durationCount),
      sale_price: salePrice ? parseFloat(salePrice) : null,
      discount_percentage: discountPct ? parseFloat(discountPct) : null,
      sale_start_date: fromDateTimeLocal(saleStart),
      sale_end_date: fromDateTimeLocal(saleEnd),
    };

    const { valid, errors: validationErrors } = validatePlan(planData);
    if (!valid) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);

    setSaving(true);
    try {
      const me = await base44.auth.me();
      const data = {
        plan_config_id: planConfigId,
        page_path: pagePath,
        feature_id: featureId,
        plan_name: planName.trim(),
        duration_type: durationType,
        duration_count: isLifetime ? null : parseInt(durationCount) || 0,
        duration_days: computeDurationDays(durationType, durationCount),
        price: parseFloat(price) || 0,
        currency: currency.trim() || "AED",
        sale_price: salePrice ? parseFloat(salePrice) : null,
        discount_percentage: discountPct ? parseFloat(discountPct) : null,
        sale_start_date: fromDateTimeLocal(saleStart),
        sale_end_date: fromDateTimeLocal(saleEnd),
        is_recommended: isRecommended,
        is_active: isActive,
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
      setErrors([e.message || "Failed to save plan"]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!plan?.id) {
      setEditing(false);
      return;
    }
    if (!confirm(`Delete plan "${plan.plan_name}"?`)) return;
    setDeleting(true);
    try {
      await base44.entities.SubscriptionPlanConfig.delete(plan.id);
      if (onSaved) onSaved();
    } catch (e) {
      setErrors([e.message || "Failed to delete"]);
    } finally {
      setDeleting(false);
    }
  };

  // ── Display mode (existing plan, not editing) ──
  if (isExisting && !editing) {
    const saleOn = isSaleActive(plan);
    const effectivePrice = getEffectivePrice(plan);
    const dispType = inferDurationType(plan);
    const durationLabel = formatDuration(dispType.type, dispType.count);

    return (
      <div
        className="rounded-lg border p-2.5 flex items-center gap-3"
        style={{
          background: plan.is_recommended ? "rgba(212,175,55,0.12)" : G.bg,
          borderColor: plan.is_recommended ? G.borderHi : G.border,
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-medium text-white truncate">{plan.plan_name}</p>
            {plan.is_recommended && (
              <span
                className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-0.5"
                style={{ background: "rgba(212,175,55,0.20)", color: G.text }}
              >
                <Star className="w-2 h-2" />
                Recommended
              </span>
            )}
            {saleOn && (
              <span
                className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-0.5"
                style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
              >
                <Tag className="w-2 h-2" />
                Sale
              </span>
            )}
            {!plan.is_active && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.40)" }}>
                Hidden
              </span>
            )}
          </div>
          <p className="text-[10px] text-white/40 mt-0.5">
            {durationLabel} ·{" "}
            {saleOn ? (
              <>
                <span className="line-through opacity-50">{formatPrice(plan.price, plan.currency)}</span>{" "}
                <span style={{ color: "#f87171" }}>{formatPrice(effectivePrice, plan.currency)}</span>
              </>
            ) : (
              formatPrice(plan.price, plan.currency)
            )}
          </p>
          {saleOn && plan.sale_end_date && (
            <p className="text-[9px] text-white/30 mt-0.5 flex items-center gap-1">
              <Calendar className="w-2 h-2" />
              Sale ends {formatDateShort(plan.sale_end_date)}
            </p>
          )}
        </div>
        <button
          onClick={() => setEditing(true)}
          className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.50)" }}
        >
          <Edit3 className="w-3 h-3" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" }}
        >
          {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
        </button>
      </div>
    );
  }

  // ── Edit / Create mode ──
  return (
    <div className="rounded-lg border p-3 space-y-2.5" style={{ background: G.bgHi, borderColor: G.borderHi }}>
      <div className="flex items-center gap-2 mb-1">
        {isExisting ? <Edit3 className="w-3 h-3" style={{ color: G.text }} /> : <Plus className="w-3 h-3" style={{ color: G.text }} />}
        <span className="text-xs font-semibold" style={{ color: G.text }}>
          {isExisting ? "Edit Plan" : "New Plan"}
        </span>
      </div>

      {/* Plan Name */}
      <div>
        <label className="text-[10px] text-white/40 block mb-1">Plan Name</label>
        <input
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          placeholder="e.g. 30 Days"
          className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
        />
      </div>

      {/* Duration + Price */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-white/40 block mb-1">Duration Type</label>
          <select
            value={durationType}
            onChange={(e) => setDurationType(e.target.value)}
            className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
            style={{ background: "rgba(8,16,40,0.98)", border: `1px solid ${G.border}` }}
          >
            {DURATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        {!isLifetime && (
          <div>
            <label className="text-[10px] text-white/40 block mb-1">Duration</label>
            <input
              type="number"
              min={1}
              value={durationCount}
              onChange={(e) => setDurationCount(e.target.value)}
              className="w-full px-2 py-1.5 rounded text-sm text-white outline-none text-center"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <label className="text-[10px] text-white/40 block mb-1">Price</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="25"
            className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
          />
        </div>
        <div>
          <label className="text-[10px] text-white/40 block mb-1">Currency</label>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-2 py-1.5 rounded text-sm text-white outline-none text-center"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
          />
        </div>
      </div>

      {/* Flags */}
      <div className="flex gap-3 pt-1">
        <label className="flex items-center gap-1.5 text-xs text-white/60 cursor-pointer">
          <input type="checkbox" checked={isRecommended} onChange={(e) => setIsRecommended(e.target.checked)} className="accent-yellow-500" />
          <Star className="w-3 h-3" style={{ color: isRecommended ? G.text : "rgba(255,255,255,0.30)" }} />
          Recommended
        </label>
        <label className="flex items-center gap-1.5 text-xs text-white/60 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-yellow-500" />
          Active
        </label>
      </div>

      {/* Advanced: Sale / Discount */}
      <button
        onClick={() => setShowAdvanced((v) => !v)}
        className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/60 transition-colors"
      >
        <Tag className="w-2.5 h-2.5" />
        {showAdvanced ? "Hide" : "Show"} Sale / Discount settings
      </button>

      {showAdvanced && (
        <div className="space-y-2 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-white/40 block mb-1">Sale Price (optional)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="e.g. 15"
                className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1">Discount % (optional)</label>
              <input
                type="number"
                min={0}
                max={100}
                step="1"
                value={discountPct}
                onChange={(e) => setDiscountPct(e.target.value)}
                placeholder="e.g. 20"
                className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-white/40 block mb-1">Sale Start (optional)</label>
              <input
                type="datetime-local"
                value={saleStart}
                onChange={(e) => setSaleStart(e.target.value)}
                className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
                style={{ background: "rgba(8,16,40,0.98)", border: `1px solid ${G.border}`, colorScheme: "dark" }}
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1">Sale End (optional)</label>
              <input
                type="datetime-local"
                value={saleEnd}
                onChange={(e) => setSaleEnd(e.target.value)}
                className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
                style={{ background: "rgba(8,16,40,0.98)", border: `1px solid ${G.border}`, colorScheme: "dark" }}
              />
            </div>
          </div>
          <p className="text-[9px] text-white/30 leading-relaxed">
            Sale price overrides normal price during the sale window. After the end date, the normal price is
            restored automatically. Leave dates empty for an always-active sale.
          </p>
        </div>
      )}

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="rounded-lg p-2 space-y-0.5" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.30)" }}>
          {errors.map((err, i) => (
            <p key={i} className="text-[10px] text-red-300">
              • {err}
            </p>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => {
            setEditing(false);
            setErrors([]);
            if (!isExisting && onSaved) onSaved();
          }}
          className="flex-1 py-2 rounded-lg text-xs font-semibold"
          style={{ background: "transparent", border: `1px solid ${G.border}`, color: "rgba(255,255,255,0.50)" }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
          style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          {saving ? "Saving…" : "Save Plan"}
        </button>
      </div>
    </div>
  );
}