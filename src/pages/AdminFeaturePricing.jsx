/**
 * AdminFeaturePricing — Dynamic per-feature subscription plan management.
 *
 * Lists all features from the FeatureRegistry grouped by page.
 * Admin can:
 *   - Set display name and description per feature (FeatureConfig entity)
 *   - Add unlimited subscription plans per feature (SubscriptionPlanConfig entity)
 *   - Edit/delete any plan
 *   - Change prices and durations anytime
 *
 * Changes appear on locked screens immediately — no code changes needed.
 */
import { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import FeaturePlansEditor from "@/components/admin/FeaturePlansEditor";
import { FEATURE_REGISTRY } from "@/lib/featureRegistry";
import { invalidateFeatureConfigCache } from "@/lib/featureConfigCache";
import { invalidatePlanCache } from "@/lib/subscriptionPlanCache";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
};

export default function AdminFeaturePricing() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAdmin(); }, []);

  const checkAdmin = async () => {
    try {
      const user = await base44.auth.me();
      if (!user || !["owner", "admin"].includes(user.role)) { setIsAdmin(false); return; }
      setIsAdmin(true);
      loadData();
    } catch {
      setIsAdmin(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [cfgs, allPlans] = await Promise.all([
        base44.entities.FeatureConfig.list("-updated_at", 200),
        base44.entities.SubscriptionPlanConfig.list("sort_order", 500),
      ]);
      setConfigs(cfgs || []);
      setPlans(allPlans || []);
    } catch {
      setConfigs([]);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const configMap = useMemo(() => {
    const map = {};
    (configs || []).forEach(c => {
      if (c.page_path && c.feature_id) {
        map[`${c.page_path}:${c.feature_id}`] = c;
      }
    });
    return map;
  }, [configs]);

  const plansMap = useMemo(() => {
    const map = {};
    (plans || []).forEach(p => {
      const key = `${p.page_path}:${p.feature_id}`;
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [plans]);

  const handleSaved = (pagePath) => {
    invalidateFeatureConfigCache(pagePath);
    invalidatePlanCache(pagePath);
    loadData();
  };

  if (isAdmin === false) return <Navigate to="/" replace />;

  if (isAdmin === null) {
    return (
      <AdminLayout title="Loading..." showBackButton={false}>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Feature Pricing & Plans" subtitle="إدارة الخطط والأسعار" showBackButton={true}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Info banner */}
        <div className="rounded-xl border p-4" style={{ background: G.bg, borderColor: G.border }}>
          <p className="text-sm text-white/70 leading-relaxed">
            Configure subscription plans for each feature. Users see these plans on the locked
            screen. When creating access codes, select which plan the user purchased — the feature
            expires automatically based on the plan. Add unlimited plans per feature.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : (
          Object.entries(FEATURE_REGISTRY).map(([pagePath, pageData]) => (
            <div key={pagePath} className="rounded-2xl border p-4 space-y-3" style={{
              background: "linear-gradient(145deg, #0c1630 0%, #060c1c 100%)",
              borderColor: G.border,
            }}>
              <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <h3 className="font-inter font-bold text-white text-sm">{pageData.pageName}</h3>
                <span className="text-[10px] text-white/30 font-mono">{pagePath}</span>
                <span className="ml-auto text-[10px] text-white/40">
                  {pageData.features.length} features
                </span>
              </div>
              <div className="space-y-2">
                {pageData.features.map(feature => (
                  <FeaturePlansEditor
                    key={feature.id}
                    pagePath={pagePath}
                    pageName={pageData.pageName}
                    feature={feature}
                    existingConfig={configMap[`${pagePath}:${feature.id}`]}
                    plans={plansMap[`${pagePath}:${feature.id}`] || []}
                    onSaved={() => handleSaved(pagePath)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}