/**
 * FeatureRow — Independent admin settings for a single child feature.
 *
 * Each child feature has its own:
 *   • Public / Premium toggle (stored in FeatureConfig.requires_permission)
 *   • Subscription Plans (stored in SubscriptionPlanConfig)
 *   • Add Plan / Delete Plan / Save
 *
 * Completely independent from sibling features and from the parent page.
 * The parent page is only a container — all settings live here.
 */
import { useState, useEffect } from "react";
import { Lock, Globe, Save, Plus, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { invalidateFeatureConfigCache } from "@/lib/featureConfigCache";
import { invalidatePlanCache } from "@/lib/subscriptionPlanCache";
import InlinePlanRow from "./InlinePlanRow";

const G = {
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.55)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.04)",
  bgHi: "rgba(212,175,55,0.10)",
};

const DURATION_TYPES = [
  { value: "DAYS",     multiplier: 1   },
  { value: "MONTHS",   multiplier: 30  },
  { value: "YEARS",    multiplier: 365 },
  { value: "LIFETIME", multiplier: null},
];

export default function FeatureRow({ pagePath, pageName, feature, dbConfig, index }) {
  const { toast } = useToast();
  const [isPremium, setIsPremium] = useState(dbConfig?.requires_permission !== false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { loadPlans(); }, [pagePath, feature.id]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.SubscriptionPlanConfig.filter(
        { page_path: pagePath, feature_id: feature.id }, "sort_order", 50
      );
      setPlans(all || []);
    } catch { setPlans([]); }
    finally { setLoading(false); }
  };

  const handleToggle = (val) => { setIsPremium(val); setDirty(true); };

  const addPlan = () => {
    setPlans([...plans, {
      plan_config_id: `PLAN-${feature.id}-${Date.now()}`,
      page_path: pagePath,
      feature_id: feature.id,
      plan_name: "",
      duration_type: "MONTHS",
      duration_count: 1,
      duration_days: 30,
      price: 0,
      currency: "AED",
      is_active: true,
      sort_order: plans.length,
    }]);
    setDirty(true);
  };

  const updatePlan = (planId, updated) => {
    setPlans(plans.map(p => (p.plan_config_id === planId || p.id === planId) ? updated : p));
    setDirty(true);
  };

  const deletePlan = async (plan) => {
    setPlans(plans.filter(p => p.plan_config_id !== plan.plan_config_id && p.id !== plan.id));
    setDirty(true);
    if (plan.id) {
      try { await base44.entities.SubscriptionPlanConfig.delete(plan.id); } catch {}
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const me = await base44.auth.me();

      // 1. Save FeatureConfig (requires_permission)
      const configData = {
        config_id: dbConfig?.config_id || `FC-${feature.id}`,
        page_path: pagePath,
        page_name: pageName,
        feature_id: feature.id,
        feature_name: feature.label,
        requires_permission: isPremium,
        icon: feature.icon,
        is_active: true,
        sort_order: index,
        updated_by: me?.id || "",
        updated_at: new Date().toISOString(),
      };
      if (dbConfig?.id) {
        await base44.entities.FeatureConfig.update(dbConfig.id, configData);
      } else {
        await base44.entities.FeatureConfig.create(configData);
      }

      // 2. Save all plans
      for (const plan of plans) {
        if (!plan.plan_name?.trim()) continue;
        const data = {
          plan_config_id: plan.plan_config_id,
          page_path: pagePath,
          feature_id: feature.id,
          plan_name: plan.plan_name.trim(),
          duration_type: plan.duration_type || "DAYS",
          duration_count: plan.duration_type === "LIFETIME" ? null : (parseInt(plan.duration_count) || 0),
          duration_days: plan.duration_type === "LIFETIME" ? null : (parseInt(plan.duration_days) || 0),
          price: parseFloat(plan.price) || 0,
          currency: plan.currency || "AED",
          is_active: true,
          sort_order: plan.sort_order || 0,
          updated_by: me?.id || "",
          updated_at: new Date().toISOString(),
        };
        if (plan.id) {
          await base44.entities.SubscriptionPlanConfig.update(plan.id, data);
        } else {
          await base44.entities.SubscriptionPlanConfig.create(data);
        }
      }

      // 3. Invalidate caches
      invalidateFeatureConfigCache(pagePath, feature.id);
      invalidatePlanCache(pagePath);

      setDirty(false);
      await loadPlans();
      toast({ title: `✓ ${feature.label} saved` });
    } catch (e) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border p-3 space-y-3" style={{
      background: isPremium ? "rgba(239,68,68,0.04)" : "rgba(34,197,94,0.03)",
      borderColor: isPremium ? "rgba(239,68,68,0.20)" : "rgba(34,197,94,0.20)",
    }}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-sm w-5 text-center flex-shrink-0">{feature.icon}</span>
        <span className="flex-1 font-inter font-semibold text-white text-sm truncate">
          {feature.label}
        </span>

        {/* Public / Premium toggle */}
        <button onClick={() => handleToggle(false)} disabled={saving}
          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all flex-shrink-0"
          style={{
            background: !isPremium ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${!isPremium ? "rgba(34,197,94,0.45)" : "rgba(255,255,255,0.08)"}`,
            color: !isPremium ? "#4ade80" : "rgba(255,255,255,0.35)",
          }}>
          <Globe className="w-2.5 h-2.5 inline mr-1" />Public
        </button>
        <button onClick={() => handleToggle(true)} disabled={saving}
          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all flex-shrink-0"
          style={{
            background: isPremium ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${isPremium ? "rgba(239,68,68,0.45)" : "rgba(255,255,255,0.08)"}`,
            color: isPremium ? "#f87171" : "rgba(255,255,255,0.35)",
          }}>
          <Lock className="w-2.5 h-2.5 inline mr-1" />Premium
        </button>

        {dirty && (
          <button onClick={saveAll} disabled={saving}
            className="px-3 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 disabled:opacity-50 flex items-center gap-1"
            style={{ background: "linear-gradient(135deg,#f6d860,#c98a14)", color: "#0d1b2a" }}>
            {saving ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Save className="w-2.5 h-2.5" />}
            {saving ? "…" : "Save"}
          </button>
        )}
      </div>

      {/* Plans section — only when Premium */}
      {isPremium && (
        <div className="space-y-2 pt-1" style={{ borderTop: `1px solid ${G.border}` }}>
          <p className="text-[9px] text-white/35 uppercase tracking-wider font-semibold pt-1">
            Subscription Plans
          </p>
          {loading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="w-3 h-3 animate-spin text-white/30" />
              <span className="text-[10px] text-white/30">Loading…</span>
            </div>
          ) : (
            <>
              {plans.map(plan => (
                <InlinePlanRow
                  key={plan.plan_config_id || plan.id}
                  plan={plan}
                  onChange={(updated) => updatePlan(plan.plan_config_id || plan.id, updated)}
                  onDelete={() => deletePlan(plan)}
                />
              ))}
              <button onClick={addPlan}
                className="w-full py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1"
                style={{ background: G.bg, border: `1px dashed ${G.border}`, color: G.text }}>
                <Plus className="w-2.5 h-2.5" /> Add Plan
              </button>
              {plans.length === 0 && (
                <p className="text-[9px] text-white/25 py-1">No plans yet. Click "Add Plan".</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}