/**
 * PricingPageCard — Admin card for a single premium page.
 * @module PricingPageCard
 * Shows page-level settings (title, description, price, show/hide, purchasable, order)
 * and all plans for the page (or per-feature if multi-feature page).
 *
 * Uses PageVisibilityConfig for page-level settings.
 * Uses FeatureConfig + SubscriptionPlanConfig for feature/plan data.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Edit3,
  Check,
  Loader2,
  Plus,
  Eye,
  EyeOff,
  ShoppingBag,
  Ban,
  GripVertical,
  Lock,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { FEATURE_REGISTRY, hasSubFeatures, getFeatures } from "@/lib/featureRegistry";
import { invalidateFeatureConfigCache } from "@/lib/featureConfigCache";
import { invalidatePlanCache } from "@/lib/subscriptionPlanCache";
import { useAuth } from "@/lib/AuthContext";
import { ROLES } from "@/lib/rbac";
import { isPublicPage } from "@/lib/pageRegistry";
import { clearAllCache } from "@/lib/permissionCache";
import { formatPrice, isSaleActive, getEffectivePrice, formatDuration, inferDurationType } from "@/lib/pricingUtils";
import PricingPlanEditor from "./PricingPlanEditor";
import ChildPagePlansSection from "./ChildPagePlansSection";

const G = {
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.55)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.12)",
};

export default function PricingPageCard({ pagePath, pageName, pageIcon, visibilityConfig, configs, plans, onSaved, index, childPages }) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [editingPage, setEditingPage] = useState(false);
  const [savingPage, setSavingPage] = useState(false);
  const [savingPlock, setSavingPlock] = useState(false);
  const [savingReason, setSavingReason] = useState(false);
  const { role } = useAuth();

  // Page-level editable fields
  const vc = visibilityConfig;
  const permanentLock = vc?.permanent_lock === true;
  const [lockReason, setLockReason] = useState(vc?.permanent_lock_reason || "");
  const [customMsg, setCustomMsg] = useState(vc?.permanent_lock_custom_message || "");
  const [pageTitle, setPageTitle] = useState(vc?.page_name || pageName);
  const [pageDesc, setPageDesc] = useState(vc?.description || "");
  const [pagePrice, setPagePrice] = useState(vc?.price || "");
  const [requiresPermission, setRequiresPermission] = useState(vc?.requires_permission !== false);
  const [isPurchasable, setIsPurchasable] = useState(vc?.is_purchasable !== false);
  const [displayOrder, setDisplayOrder] = useState(vc?.display_order || 0);

  useEffect(() => {
    setPageTitle(vc?.page_name || pageName);
    setPageDesc(vc?.description || "");
    setPagePrice(vc?.price || "");
    setRequiresPermission(vc?.requires_permission !== false);
    setIsPurchasable(vc?.is_purchasable !== false);
    setDisplayOrder(vc?.display_order || 0);
    setLockReason(vc?.permanent_lock_reason || "");
    setCustomMsg(vc?.permanent_lock_custom_message || "");
  }, [vc, pageName]);

  const isMultiFeature = hasSubFeatures(pagePath);
  const features = isMultiFeature ? getFeatures(pagePath) : [{ id: "FULL_PAGE", label: pageName, icon: pageIcon }];

  const savePageSettings = async () => {
    setSavingPage(true);
    try {
      const me = await base44.auth.me();
      const data = {
        page_path: pagePath,
        page_name: pageTitle.trim() || pageName,
        requires_permission: requiresPermission,
        is_purchasable: isPurchasable,
        price: pagePrice.trim(),
        description: pageDesc.trim(),
        display_order: parseInt(displayOrder) || 0,
        default_duration: vc?.default_duration || "LIFETIME",
        reading_code_required: vc?.reading_code_required !== false,
        updated_by: me?.id || "",
        updated_at: new Date().toISOString(),
        archived: vc?.archived || false,
        admin_only: vc?.admin_only || false,
        permanent_lock: vc?.permanent_lock === true,
        permanent_lock_reason: vc?.permanent_lock_reason || "",
        permanent_lock_custom_message: vc?.permanent_lock_custom_message || "",
      };

      if (vc?.id) {
        await base44.entities.PageVisibilityConfig.update(vc.id, data);
      } else {
        await base44.entities.PageVisibilityConfig.create(data);
      }

      setEditingPage(false);
      toast({ title: "Page settings saved", description: pageTitle });
      if (onSaved) onSaved();
    } catch (e) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSavingPage(false);
    }
  };

  // ── Permanent Lock — Owner-only single-click override ───────────────────
  // Independent of visibility/pricing/permissions/RBAC/FeatureConfig. When
  // ON, ProtectedPage blocks ALL non-Owner access (admins included) and
  // hides every access/request/purchase option. Disabling restores the
  // existing config exactly as-is (nothing underneath is modified).
  const togglePermanentLock = async () => {
    if (role !== ROLES.OWNER) return;
    setSavingPlock(true);
    try {
      const me = await base44.auth.me();
      const next = !permanentLock;
      const reasonPayload = next
        ? { permanent_lock_reason: "temporarily_unavailable", permanent_lock_custom_message: "" }
        : { permanent_lock_reason: "", permanent_lock_custom_message: "" };
      if (vc?.id) {
        await base44.entities.PageVisibilityConfig.update(vc.id, {
          permanent_lock: next,
          ...reasonPayload,
          updated_by: me?.id || "",
          updated_at: new Date().toISOString(),
        });
      } else {
        await base44.entities.PageVisibilityConfig.create({
          page_path: pagePath,
          page_name: pageName,
          requires_permission: !isPublicPage(pagePath),
          permanent_lock: next,
          is_purchasable: true,
          ...reasonPayload,
          updated_by: me?.id || "",
          updated_at: new Date().toISOString(),
        });
      }
      setLockReason(next ? "temporarily_unavailable" : "");
      setCustomMsg("");
      clearAllCache();
      toast({ title: next ? "Permanent Lock enabled" : "Permanent Lock disabled", description: pageName });
      if (onSaved) onSaved();
    } catch (e) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setSavingPlock(false);
    }
  };

  // ── Lock Reason — Owner sets the reason shown on the locked screen ──────
  const saveLockReason = async () => {
    if (role !== ROLES.OWNER) return;
    setSavingReason(true);
    try {
      const me = await base44.auth.me();
      const data = {
        permanent_lock_reason: lockReason,
        permanent_lock_custom_message: lockReason === "custom" ? customMsg.trim() : "",
        updated_by: me?.id || "",
        updated_at: new Date().toISOString(),
      };
      if (vc?.id) {
        await base44.entities.PageVisibilityConfig.update(vc.id, data);
      } else {
        await base44.entities.PageVisibilityConfig.create({
          page_path: pagePath,
          page_name: pageName,
          requires_permission: !isPublicPage(pagePath),
          permanent_lock: true,
          is_purchasable: true,
          ...data,
        });
      }
      clearAllCache();
      toast({ title: "Lock reason saved", description: pageName });
      if (onSaved) onSaved();
    } catch (e) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSavingReason(false);
    }
  };

  // Count active plans and sales
  const allPlans = plans || [];
  const activePlans = allPlans.filter((p) => p.is_active !== false);
  const activeSales = allPlans.filter((p) => isSaleActive(p));
  const recommendedPlan = allPlans.find((p) => p.is_recommended);

  const handlePlanSaved = () => {
    invalidatePlanCache(pagePath);
    invalidateFeatureConfigCache(pagePath);
    if (onSaved) onSaved();
  };

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "linear-gradient(145deg, #0c1630 0%, #060c1c 100%)", borderColor: G.border }}
    >
      {/* ── Page Header (always visible) ── */}
      <div className="flex items-center gap-3 p-4">
        {/* Drag handle */}
        <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-white/20 hover:text-white/40 transition-colors">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Icon + Name */}
        <span className="text-xl flex-shrink-0">{pageIcon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-inter font-bold text-white text-sm truncate">{vc?.page_name || pageName}</h3>
            <span className="text-[10px] text-white/25 font-mono">{pagePath}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {/* Status badges */}
            <span
              className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-0.5"
              style={{
                background: requiresPermission ? "rgba(212,175,55,0.15)" : "rgba(34,197,94,0.12)",
                color: requiresPermission ? G.text : "#22c55e",
              }}
            >
              {requiresPermission ? <EyeOff className="w-2 h-2" /> : <Eye className="w-2 h-2" />}
              {requiresPermission ? "Premium" : "Public"}
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-0.5"
              style={{
                background: isPurchasable ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.10)",
                color: isPurchasable ? "#22c55e" : "#ef4444",
              }}
            >
              {isPurchasable ? <ShoppingBag className="w-2 h-2" /> : <Ban className="w-2 h-2" />}
              {isPurchasable ? "Purchasable" : "No Purchase"}
            </span>
            {permanentLock && (
              <span
                className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-0.5"
                style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}
              >
                <Lock className="w-2 h-2" />
                Permanent Lock
              </span>
            )}
            {activePlans.length > 0 && (
              <span className="text-[9px] text-white/40">
                {activePlans.length} plan{activePlans.length !== 1 ? "s" : ""}
              </span>
            )}
            {activeSales.length > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>
                {activeSales.length} Sale Active
              </span>
            )}
          </div>
        </div>

        {/* Quick price display */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-bold" style={{ color: pagePrice ? G.text : "rgba(255,255,255,0.25)" }}>
            {pagePrice || "No price"}
          </p>
          <p className="text-[9px] text-white/30">Order: {displayOrder}</p>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 transition-transform"
          style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* ── Expanded Content ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-4 space-y-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {/* ── Permanent Lock (Owner-only) ── */}
              {role === ROLES.OWNER && (
                <div className="pt-3">
                  <div className="rounded-xl border p-3 flex items-center justify-between gap-3" style={{ background: permanentLock ? "rgba(239,68,68,0.08)" : G.bg, borderColor: permanentLock ? "rgba(239,68,68,0.45)" : G.border }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" style={{ color: permanentLock ? "#ef4444" : G.text }} />
                        <span className="text-xs font-bold text-white">Permanent Lock</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: permanentLock ? "rgba(239,68,68,0.20)" : "rgba(34,197,94,0.12)", color: permanentLock ? "#f87171" : "#22c55e" }}>
                          {permanentLock ? "ON" : "OFF"}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1 leading-snug">
                        Owner-only override. When ON, nobody except the Owner can open this page — permissions, pricing, access codes and requests are temporarily ignored. Disable to restore everything exactly as configured.
                      </p>
                    </div>
                    <button
                      onClick={togglePermanentLock}
                      disabled={savingPlock}
                      className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-1.5"
                      style={permanentLock
                        ? { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.45)" }
                        : { background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }
                      }
                    >
                      {savingPlock ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
                      {savingPlock ? "…" : permanentLock ? "Disable" : "Enable"}
                    </button>
                  </div>

                  {permanentLock && (
                    <div className="mt-2 rounded-xl border p-3 space-y-2.5" style={{ background: "rgba(255,255,255,0.02)", borderColor: G.border }}>
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">Lock Reason (shown to customers)</label>
                        <select
                          value={lockReason}
                          onChange={(e) => setLockReason(e.target.value)}
                          className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
                          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
                        >
                          <option value="">Select a reason…</option>
                          <option value="under_development">Under Development</option>
                          <option value="coming_soon">Coming Soon</option>
                          <option value="content_update">Content Update in Progress</option>
                          <option value="scholarly_review">Under Scholarly Review</option>
                          <option value="maintenance">Under Maintenance</option>
                          <option value="temporarily_unavailable">Temporarily Unavailable</option>
                          <option value="custom">Custom Reason</option>
                        </select>
                      </div>
                      {lockReason === "custom" && (
                        <div>
                          <label className="text-[10px] text-white/40 block mb-1">Custom Message (shown to customers)</label>
                          <textarea
                            value={customMsg}
                            onChange={(e) => setCustomMsg(e.target.value)}
                            rows={2}
                            placeholder="Enter the message customers will see…"
                            className="w-full px-2 py-1.5 rounded text-sm text-white outline-none resize-none"
                            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
                          />
                        </div>
                      )}
                      <button
                        onClick={saveLockReason}
                        disabled={savingReason || !lockReason}
                        className="w-full py-2 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
                        style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}
                      >
                        {savingReason ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        {savingReason ? "Saving…" : "Save Reason"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Page Settings Section ── */}
              <div className="pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Page Settings</span>
                  {!editingPage ? (
                    <button
                      onClick={() => setEditingPage(true)}
                      className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded"
                      style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                      Edit
                    </button>
                  ) : null}
                </div>

                {!editingPage ? (
                  /* Read-only summary */
                  <div className="rounded-xl border p-3 space-y-1.5" style={{ background: G.bg, borderColor: G.border }}>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Title:</span>
                      <span className="text-white/80 font-medium">{vc?.page_name || pageName}</span>
                    </div>
                    {vc?.description && (
                      <div className="flex justify-between text-xs gap-2">
                        <span className="text-white/40 flex-shrink-0">Description:</span>
                        <span className="text-white/60 text-right">{vc.description}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Price:</span>
                      <span style={{ color: vc?.price ? G.text : "rgba(255,255,255,0.25)" }}>{vc?.price || "Not set"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Display Order:</span>
                      <span className="text-white/60">{vc?.display_order || 0}</span>
                    </div>
                  </div>
                ) : (
                  /* Edit form */
                  <div className="rounded-xl border p-3 space-y-2.5" style={{ background: G.bgHi, borderColor: G.borderHi }}>
                    <div>
                      <label className="text-[10px] text-white/40 block mb-1">Page Title</label>
                      <input
                        value={pageTitle}
                        onChange={(e) => setPageTitle(e.target.value)}
                        className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 block mb-1">Description (shown on locked screen)</label>
                      <textarea
                        value={pageDesc}
                        onChange={(e) => setPageDesc(e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1.5 rounded text-sm text-white outline-none resize-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">Display Price (e.g. "AED 50")</label>
                        <input
                          value={pagePrice}
                          onChange={(e) => setPagePrice(e.target.value)}
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
                        <input type="checkbox" checked={isPurchasable} onChange={(e) => setIsPurchasable(e.target.checked)} className="accent-yellow-500" />
                        {isPurchasable ? <ShoppingBag className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                        Purchasable
                      </label>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setEditingPage(false)}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold"
                        style={{ background: "transparent", border: `1px solid ${G.border}`, color: "rgba(255,255,255,0.50)" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={savePageSettings}
                        disabled={savingPage}
                        className="flex-1 py-2 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
                        style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}
                      >
                        {savingPage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        {savingPage ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Plans Section ── */}
              <div className="pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {isMultiFeature ? (
                  /* Multi-feature: plans per feature (A/B) + child pages (C/D) in one continuous list */
                  <div className="space-y-3">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold block mb-1">
                      Features & Plans ({features.length + (childPages?.length || 0)})
                    </span>
                    {features.map((feature) => {
                      const featureConfig = configs?.find((c) => c.feature_id === feature.id);
                      const featurePlans = allPlans.filter((p) => p.feature_id === feature.id);
                      return (
                        <FeaturePlansSection
                          key={feature.id}
                          pagePath={pagePath}
                          pageName={pageName}
                          feature={feature}
                          featureConfig={featureConfig}
                          plans={featurePlans}
                          onSaved={handlePlanSaved}
                        />
                      );
                    })}
                    {childPages?.map((cp) => (
                      <ChildPagePlansSection
                        key={cp.pagePath}
                        pagePath={cp.pagePath}
                        pageName={cp.pageName}
                        pageIcon={cp.pageIcon}
                        visibilityConfig={cp.visibilityConfig}
                        plans={cp.plans || []}
                        onSaved={cp.onSaved}
                      />
                    ))}
                  </div>
                ) : (
                  /* Single-feature: plans at FULL_PAGE level */
                  <FeaturePlansSection
                    pagePath={pagePath}
                    pageName={pageName}
                    feature={features[0]}
                    featureConfig={configs?.find((c) => c.feature_id === "FULL_PAGE")}
                    plans={allPlans}
                    onSaved={handlePlanSaved}
                  />
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * FeaturePlansSection — Shows a feature's config + its plans.
 * For multi-feature pages, shows feature name + enable/disable + plans.
 */
function FeaturePlansSection({ pagePath, pageName, feature, featureConfig, plans, onSaved }) {
  const { toast } = useToast();
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [editingFeature, setEditingFeature] = useState(false);
  const [featureName, setFeatureName] = useState(featureConfig?.feature_name || feature.label);
  const [featureDesc, setFeatureDesc] = useState(featureConfig?.description || "");
  const [featurePurchasable, setFeaturePurchasable] = useState(featureConfig?.is_purchasable !== false);
  const [savingFeature, setSavingFeature] = useState(false);

  const isFullPage = feature.id === "FULL_PAGE";

  const saveFeatureConfig = async () => {
    setSavingFeature(true);
    try {
      const me = await base44.auth.me();
      const configId = featureConfig?.config_id || `FC-${feature.id}`;
      const data = {
        config_id: configId,
        page_path: pagePath,
        page_name: pageName,
        feature_id: feature.id,
        feature_name: featureName.trim() || feature.label,
        is_purchasable: featurePurchasable,
        price: featureConfig?.price || "",
        description: featureDesc.trim(),
        icon: feature.icon,
        is_active: featureConfig?.is_active !== false,
        sort_order: featureConfig?.sort_order || 0,
        requires_permission: featureConfig?.requires_permission !== false,
        updated_by: me?.id || "",
        updated_at: new Date().toISOString(),
      };

      if (featureConfig?.id) {
        await base44.entities.FeatureConfig.update(featureConfig.id, data);
      } else {
        await base44.entities.FeatureConfig.create(data);
      }

      setEditingFeature(false);
      toast({ title: "Feature saved", description: featureName });
      if (onSaved) onSaved();
    } catch (e) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSavingFeature(false);
    }
  };

  return (
    <div className="rounded-xl border p-3 space-y-2" style={{ background: "rgba(255,255,255,0.02)", borderColor: G.border }}>
      {/* Feature header */}
      <div className="flex items-center gap-2.5">
        {!isFullPage && <span className="text-sm flex-shrink-0">{feature.icon}</span>}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {isFullPage ? "Page Plans" : featureConfig?.feature_name || feature.label}
          </p>
          {!isFullPage && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[9px] text-white/30 font-mono">{feature.id}</p>
              <span
                className="px-1 py-0 rounded text-[7px] font-bold uppercase"
                style={{
                  background: featurePurchasable ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.08)",
                  color: featurePurchasable ? "#22c55e" : "#ef4444",
                }}
              >
                {featurePurchasable ? "Purchasable" : "Locked"}
              </span>
            </div>
          )}
        </div>
        {!isFullPage && (
          <button
            onClick={() => {
              setFeatureName(featureConfig?.feature_name || feature.label);
              setFeatureDesc(featureConfig?.description || "");
              setFeaturePurchasable(featureConfig?.is_purchasable !== false);
              setEditingFeature(true);
            }}
            className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.50)" }}
          >
            <Edit3 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Feature edit form */}
      <AnimatePresence>
        {editingFeature && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div className="space-y-2 pb-1">
              <div>
                <label className="text-[10px] text-white/40 block mb-1">Display Name</label>
                <input
                  value={featureName}
                  onChange={(e) => setFeatureName(e.target.value)}
                  className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40 block mb-1">Description (shown on locked screen)</label>
                <textarea
                  value={featureDesc}
                  onChange={(e) => setFeatureDesc(e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1.5 rounded text-sm text-white outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
                />
              </div>
              <label className="flex items-center gap-1.5 text-xs text-white/60 cursor-pointer">
                <input type="checkbox" checked={featurePurchasable} onChange={(e) => setFeaturePurchasable(e.target.checked)} className="accent-yellow-500" />
                Purchasable (users can request/buy)
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingFeature(false)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "transparent", border: `1px solid ${G.border}`, color: "rgba(255,255,255,0.50)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveFeatureConfig}
                  disabled={savingFeature}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
                  style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}
                >
                  {savingFeature ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans list */}
      <div className="space-y-1.5">
        {plans.map((plan, idx) => (
          <PricingPlanEditor
            key={plan.id || `plan-${idx}`}
            pagePath={pagePath}
            featureId={feature.id}
            plan={plan}
            sortOrder={idx}
            onSaved={onSaved}
          />
        ))}

        {showAddPlan && (
          <PricingPlanEditor pagePath={pagePath} featureId={feature.id} plan={null} sortOrder={plans.length} onSaved={() => { setShowAddPlan(false); onSaved(); }} />
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