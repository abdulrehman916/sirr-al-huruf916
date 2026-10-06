/**
 * FeaturePlansEditor — Manages all subscription plans + description for a single feature.
 * - Description is stored in FeatureConfig (optional, shown on locked screen).
 * - Plans are stored in SubscriptionPlanConfig (unlimited, fully dynamic).
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Edit3, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PlanEditor from "./PlanEditor";
import { invalidatePlanCache } from "@/lib/subscriptionPlanCache";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

export default function FeaturePlansEditor({ pagePath, pageName, feature, existingConfig, plans, onSaved }) {
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [descEditing, setDescEditing] = useState(false);
  const [descSaving, setDescSaving] = useState(false);
  const [description, setDescription] = useState(existingConfig?.description || "");
  const [featureName, setFeatureName] = useState(existingConfig?.feature_name || feature.label);

  const saveDescription = async () => {
    setDescSaving(true);
    try {
      const me = await base44.auth.me();
      const configId = existingConfig?.config_id || `FC-${feature.id}`;
      const data = {
        config_id: configId,
        page_path: pagePath,
        page_name: pageName,
        feature_id: feature.id,
        feature_name: featureName.trim() || feature.label,
        price: existingConfig?.price || "",
        description: description.trim(),
        icon: feature.icon,
        is_active: true,
        sort_order: existingConfig?.sort_order || 0,
        updated_by: me?.id || "",
        updated_at: new Date().toISOString(),
      };
      if (existingConfig?.id) {
        await base44.entities.FeatureConfig.update(existingConfig.id, data);
      } else {
        await base44.entities.FeatureConfig.create(data);
      }
      setDescEditing(false);
      if (onSaved) onSaved();
    } catch (e) {
      console.error("Failed to save description:", e);
    } finally {
      setDescSaving(false);
    }
  };

  const handlePlanSaved = () => {
    setShowAddPlan(false);
    invalidatePlanCache(pagePath);
    if (onSaved) onSaved();
  };

  return (
    <div className="rounded-xl border p-3 space-y-3" style={{
      background: "rgba(255,255,255,0.02)", borderColor: G.border,
    }}>
      {/* Feature header */}
      <div className="flex items-center gap-2.5">
        <span className="text-lg flex-shrink-0">{feature.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {existingConfig?.feature_name || feature.label}
          </p>
          <p className="text-[10px] text-white/30 font-mono">{feature.id}</p>
        </div>
        <button onClick={() => { setDescription(existingConfig?.description || ""); setFeatureName(existingConfig?.feature_name || feature.label); setDescEditing(true); }}
          className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.50)" }}>
          <Edit3 className="w-3 h-3" />
        </button>
      </div>

      {/* Description editor */}
      <AnimatePresence>
        {descEditing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div className="space-y-2 pb-1">
              <div>
                <label className="text-[10px] text-white/40 block mb-1">Display Name</label>
                <input value={featureName} onChange={e => setFeatureName(e.target.value)}
                  className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
              </div>
              <div>
                <label className="text-[10px] text-white/40 block mb-1">Description (optional — shown on locked screen)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  rows={2} placeholder="Description shown to users when this feature is locked..."
                  className="w-full px-2 py-1.5 rounded text-sm text-white outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDescEditing(false)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "transparent", border: `1px solid ${G.border}`, color: "rgba(255,255,255,0.50)" }}>
                  Cancel
                </button>
                <button onClick={saveDescription} disabled={descSaving}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
                  style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}>
                  {descSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  {descSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans section */}
      <div className="pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
            Subscription Plans
          </span>
          <span className="text-[10px] text-white/30">{plans.length} plan{plans.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="space-y-2">
          {plans.map((plan, idx) => (
            <PlanEditor
              key={plan.id || `new-${idx}`}
              pagePath={pagePath}
              featureId={feature.id}
              plan={plan}
              sortOrder={idx}
              onSaved={handlePlanSaved}
            />
          ))}

          {showAddPlan && (
            <PlanEditor
              pagePath={pagePath}
              featureId={feature.id}
              plan={null}
              sortOrder={plans.length}
              onSaved={handlePlanSaved}
            />
          )}

          {!showAddPlan && (
            <button onClick={() => setShowAddPlan(true)}
              className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
              style={{ background: G.bg, border: `1px dashed ${G.border}`, color: G.text }}>
              <Plus className="w-3 h-3" />
              Add Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}