/**
 * ChildPagePlansSection — renders a child page (Section C / D) as a compact
 * feature-style row INSIDE the parent's "Features & Plans" list, visually
 * identical to FeaturePlansSection (the row used for Section A / B).
 *
 * Backed by the child's OWN PageVisibilityConfig (page-level: name, price,
 * purchasable, visibility, display order) and SubscriptionPlanConfig (plans
 * keyed by the child's page_path, feature_id="FULL_PAGE"). No FeatureConfig,
 * no DB schema change — each child keeps its independent route, RBAC,
 * permission, visibility, and payment settings.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Check, Loader2, Plus, Eye, EyeOff, ShoppingBag, Ban } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import PricingPlanEditor from "./PricingPlanEditor";

const G = {
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.55)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.12)",
};

export default function ChildPagePlansSection({ pagePath, pageName, pageIcon, visibilityConfig, plans, onSaved }) {
  const { toast } = useToast();
  const vc = visibilityConfig;
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(vc?.page_name || pageName);
  const [desc, setDesc] = useState(vc?.description || "");
  const [price, setPrice] = useState(vc?.price || "");
  const [purchasable, setPurchasable] = useState(vc?.is_purchasable !== false);
  const [requiresPermission, setRequiresPermission] = useState(vc?.requires_permission !== false);
  const [displayOrder, setDisplayOrder] = useState(vc?.display_order || 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(vc?.page_name || pageName);
    setDesc(vc?.description || "");
    setPrice(vc?.price || "");
    setPurchasable(vc?.is_purchasable !== false);
    setRequiresPermission(vc?.requires_permission !== false);
    setDisplayOrder(vc?.display_order || 0);
  }, [vc, pageName]);

  const save = async () => {
    setSaving(true);
    try {
      const me = await base44.auth.me();
      const data = {
        page_path: pagePath,
        page_name: name.trim() || pageName,
        requires_permission: requiresPermission,
        is_purchasable: purchasable,
        price: price.trim(),
        description: desc.trim(),
        display_order: parseInt(displayOrder) || 0,
        default_duration: vc?.default_duration || "LIFETIME",
        reading_code_required: vc?.reading_code_required !== false,
        updated_by: me?.id || "",
        updated_at: new Date().toISOString(),
        archived: vc?.archived || false,
        admin_only: vc?.admin_only || false,
      };
      if (vc?.id) {
        await base44.entities.PageVisibilityConfig.update(vc.id, data);
      } else {
        await base44.entities.PageVisibilityConfig.create(data);
      }
      setEditing(false);
      toast({ title: "Section saved", description: name });
      if (onSaved) onSaved();
    } catch (e) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const allPlans = plans || [];

  return (
    <div className="rounded-xl border p-3 space-y-2" style={{ background: "rgba(255,255,255,0.02)", borderColor: G.border }}>
      {/* Header — identical to FeaturePlansSection non-full-page row */}
      <div className="flex items-center gap-2.5">
        <span className="text-sm flex-shrink-0">{pageIcon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{vc?.page_name || pageName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-[9px] text-white/30 font-mono">{pagePath}</p>
            <span
              className="px-1 py-0 rounded text-[7px] font-bold uppercase"
              style={{
                background: purchasable ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.08)",
                color: purchasable ? "#22c55e" : "#ef4444",
              }}
            >
              {purchasable ? "Purchasable" : "Locked"}
            </span>
          </div>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.50)" }}
        >
          <Edit3 className="w-3 h-3" />
        </button>
      </div>

      {/* Edit form — page-level settings (name, desc, price, visibility, purchasable, order) */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div className="space-y-2 pb-1">
              <div>
                <label className="text-[10px] text-white/40 block mb-1">Display Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40 block mb-1">Description (shown on locked screen)</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1.5 rounded text-sm text-white outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Display Price (e.g. "AED 50")</label>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="AED 50"
                    className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full px-2 py-1.5 rounded text-sm text-white outline-none text-center"
                    style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-white/60 cursor-pointer">
                  <input type="checkbox" checked={requiresPermission} onChange={(e) => setRequiresPermission(e.target.checked)} className="accent-yellow-500" />
                  {requiresPermission ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  Premium (locked)
                </label>
                <label className="flex items-center gap-1.5 text-xs text-white/60 cursor-pointer">
                  <input type="checkbox" checked={purchasable} onChange={(e) => setPurchasable(e.target.checked)} className="accent-yellow-500" />
                  {purchasable ? <ShoppingBag className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                  Purchasable
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "transparent", border: `1px solid ${G.border}`, color: "rgba(255,255,255,0.50)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
                  style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans list — identical to FeaturePlansSection */}
      <div className="space-y-1.5">
        {allPlans.map((plan, idx) => (
          <PricingPlanEditor
            key={plan.id || `plan-${idx}`}
            pagePath={pagePath}
            featureId="FULL_PAGE"
            plan={plan}
            sortOrder={idx}
            onSaved={onSaved}
          />
        ))}

        {showAddPlan && (
          <PricingPlanEditor
            pagePath={pagePath}
            featureId="FULL_PAGE"
            plan={null}
            sortOrder={allPlans.length}
            onSaved={() => {
              setShowAddPlan(false);
              if (onSaved) onSaved();
            }}
          />
        )}

        {!showAddPlan && (
          <button
            onClick={() => setShowAddPlan(true)}
            className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
            style={{ background: G.bg, border: `1px dashed ${G.border}`, color: G.text }}
          >
            <Plus className="w-3 h-3" />
            Add Plan
          </button>
        )}
      </div>
    </div>
  );
}