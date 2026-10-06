/**
 * PagePlansSection — Manages subscription plans for a page in the Page Access page.
 * Shows plans inline when a Premium page is expanded.
 * - For multi-feature pages: plans grouped per feature.
 * - For single pages: page-level plans (feature_id = 'FULL_PAGE').
 * Single Save button saves all plans at once.
 */
import { useState, useEffect } from "react";
import { Plus, Save, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { getFeatures, hasSubFeatures } from "@/lib/featureRegistry";
import { invalidatePlanCache } from "@/lib/subscriptionPlanCache";
import InlinePlanRow from "./InlinePlanRow";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

const FULL_PAGE = "FULL_PAGE";

export default function PagePlansSection({ pagePath }) {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const features = getFeatures(pagePath);
  const isMultiFeature = hasSubFeatures(pagePath);

  useEffect(() => { loadPlans(); }, [pagePath]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.SubscriptionPlanConfig.filter(
        { page_path: pagePath }, "sort_order", 100
      );
      setPlans(all || []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const getPlansForFeature = (featId) => plans.filter(p => p.feature_id === featId);

  const addPlan = (featId) => {
    const existing = getPlansForFeature(featId);
    const newPlan = {
      plan_config_id: `PLAN-${featId}-${Date.now()}`,
      page_path: pagePath,
      feature_id: featId,
      plan_name: "",
      duration_type: "MONTHS",
      duration_count: 1,
      duration_days: 30,
      price: 0,
      currency: "AED",
      is_active: true,
      sort_order: existing.length,
    };
    setPlans([...plans, newPlan]);
    setDirty(true);
  };

  const updatePlan = (planId, updated) => {
    setPlans(plans.map(p =>
      (p.plan_config_id === planId || p.id === planId) ? updated : p
    ));
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
      for (const plan of plans) {
        if (!plan.plan_name?.trim() || !plan.price) continue;
        const data = {
          plan_config_id: plan.plan_config_id,
          page_path: pagePath,
          feature_id: plan.feature_id,
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
      invalidatePlanCache(pagePath);
      setDirty(false);
      await loadPlans();
      toast({ title: "✓ All plans saved" });
    } catch (e) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3">
        <Loader2 className="w-4 h-4 animate-spin text-white/30" />
        <span className="text-xs text-white/30">Loading plans…</span>
      </div>
    );
  }

  const sections = isMultiFeature
    ? features.map(f => ({ id: f.id, label: f.label, icon: f.icon }))
    : [{ id: FULL_PAGE, label: "Page Plans", icon: "📄" }];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/45 uppercase tracking-wider font-semibold">
          Subscription Plans
        </span>
        {dirty && (
          <button onClick={saveAll} disabled={saving}
            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#f6d860,#c98a14)", color: "#0d1b2a" }}>
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            {saving ? "Saving…" : "Save All"}
          </button>
        )}
      </div>

      {sections.map(section => {
        const sectionPlans = getPlansForFeature(section.id);
        return (
          <div key={section.id} className="space-y-2">
            {isMultiFeature && (
              <p className="text-[11px] text-white/50 font-semibold flex items-center gap-1.5">
                <span>{section.icon}</span>
                {section.label}
              </p>
            )}
            {sectionPlans.map(plan => (
              <InlinePlanRow
                key={plan.plan_config_id || plan.id}
                plan={plan}
                onChange={(updated) => updatePlan(plan.plan_config_id || plan.id, updated)}
                onDelete={() => deletePlan(plan)}
              />
            ))}
            <button onClick={() => addPlan(section.id)}
              className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
              style={{ background: G.bg, border: `1px dashed ${G.border}`, color: G.text }}>
              <Plus className="w-3 h-3" />
              Add Plan
            </button>
          </div>
        );
      })}

      {plans.length === 0 && sections.length === 1 && (
        <p className="text-[10px] text-white/30 py-1">
          No plans configured yet. Click "Add Plan" to create one.
        </p>
      )}
    </div>
  );
}