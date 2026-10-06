import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, Loader2, ChevronDown } from "lucide-react";
import { getFeatures, hasSubFeatures } from "@/lib/featureRegistry";
import { getPagePlans } from "@/lib/subscriptionPlanCache";
import { DURATION_OPTIONS, DURATION_TYPES } from "@/lib/codeDuration";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

const DURATION_MULTIPLIERS = {
  MINUTES: 60000, HOURS: 3600000, DAYS: 86400000,
  WEEKS: 604800000, MONTHS: 2592000000, YEARS: 31536000000,
};

export default function CreateCodePageItem({
  page,
  isSelected,
  duration,
  onToggle,
  onDurationChange,
  onCustomDateChange,
  subFeatures,
  onSubFeaturesChange,
  featureDurations,
  onFeatureDurationChange,
  onSaveFeature,
  savingFeature,
}) {
  const features = getFeatures(page.path);
  const isMultiFeature = hasSubFeatures(page.path);
  const selectedFeatures = subFeatures || [];
  const [pagePlans, setPagePlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);

  // ── Independent feature editing state ──
  const [expandedFeature, setExpandedFeature] = useState(null);
  const [editDurationType, setEditDurationType] = useState("MONTHS");
  const [editDurationCount, setEditDurationCount] = useState(1);
  const [editCustomDate, setEditCustomDate] = useState("");

  useEffect(() => {
    if (!isSelected || !isMultiFeature) return;
    setPlansLoading(true);
    getPagePlans(page.path).then(plans => {
      setPagePlans(plans);
      setPlansLoading(false);
    });
  }, [isSelected, isMultiFeature, page.path]);

  const toggleFeature = (featId) => {
    if (!onSubFeaturesChange) return;
    if (selectedFeatures.includes(featId)) {
      onSubFeaturesChange(page.path, selectedFeatures.filter(f => f !== featId));
    } else {
      onSubFeaturesChange(page.path, [...selectedFeatures, featId]);
    }
  };

  const selectAllFeatures = () => {
    if (!onSubFeaturesChange) return;
    onSubFeaturesChange(page.path, []);
  };

  const selectPlan = (featId, plan) => {
    if (!onFeatureDurationChange) return;
    const isLifetime = plan.duration_type === "LIFETIME";
    onFeatureDurationChange(page.path, featId, {
      plan_name: plan.plan_name,
      duration_days: isLifetime ? null : plan.duration_days,
      duration_ms: isLifetime ? null : (plan.duration_days || 0) * 86400000,
      is_lifetime: isLifetime,
    });
  };

  const getFeaturePlan = (featId) => {
    const key = `${page.path}:${featId}`;
    return featureDurations?.[key];
  };

  const getPlansForFeature = (featId) => pagePlans.filter(p => p.feature_id === featId);

  // ── Reverse-engineer duration type/count from a saved plan ──
  const inferDurationType = (plan) => {
    if (!plan) return { type: "MONTHS", count: 1 };
    if (plan.is_lifetime) return { type: "LIFETIME", count: null };
    if (plan.duration_ms) {
      const ms = plan.duration_ms;
      if (ms % 31536000000 === 0) return { type: "YEARS", count: ms / 31536000000 };
      if (ms % 2592000000 === 0) return { type: "MONTHS", count: ms / 2592000000 };
      if (ms % 604800000 === 0) return { type: "WEEKS", count: ms / 604800000 };
      if (ms % 86400000 === 0) return { type: "DAYS", count: ms / 86400000 };
      if (ms % 3600000 === 0) return { type: "HOURS", count: ms / 3600000 };
      if (ms % 60000 === 0) return { type: "MINUTES", count: ms / 60000 };
    }
    if (plan.duration_days) return { type: "DAYS", count: plan.duration_days };
    return { type: "MONTHS", count: 1 };
  };

  // Click a feature → expand its panel (no Save required to switch)
  const expandFeature = (featId) => {
    if (expandedFeature === featId) { setExpandedFeature(null); return; }
    const plan = getFeaturePlan(featId);
    const { type, count } = inferDurationType(plan);
    setEditDurationType(type);
    setEditDurationCount(count || 1);
    setEditCustomDate(plan?.custom_date || "");
    setExpandedFeature(featId);
  };

  // Build plan object from current edit state
  const computePlan = () => {
    if (editDurationType === "LIFETIME") {
      return { plan_name: "Lifetime", duration_days: null, duration_ms: null, is_lifetime: true };
    }
    if (editDurationType === "CUSTOM" && editCustomDate) {
      const ms = new Date(editCustomDate).getTime() - Date.now();
      return {
        plan_name: "Custom",
        duration_days: Math.ceil(ms / 86400000),
        duration_ms: ms,
        is_lifetime: false,
        custom_date: editCustomDate,
      };
    }
    const ms = DURATION_MULTIPLIERS[editDurationType] || 86400000;
    const totalMs = (parseInt(editDurationCount) || 0) * ms;
    const typeLabel = editDurationType.charAt(0) + editDurationType.slice(1).toLowerCase();
    return {
      plan_name: `${editDurationCount} ${typeLabel}`,
      duration_days: Math.ceil(totalMs / 86400000),
      duration_ms: totalMs,
      is_lifetime: false,
    };
  };

  const saveFeature = (featId) => {
    if (!onSaveFeature) return;
    onSaveFeature(page.path, featId, computePlan());
  };

  // Quick-save from a DB plan button
  const quickSavePlan = (featId, plan) => {
    const isLifetime = plan.duration_type === "LIFETIME";
    const planObj = {
      plan_name: plan.plan_name,
      duration_days: isLifetime ? null : plan.duration_days,
      duration_ms: isLifetime ? null : (plan.duration_days || 0) * 86400000,
      is_lifetime: isLifetime,
    };
    if (onSaveFeature) {
      onSaveFeature(page.path, featId, planObj);
    } else {
      onFeatureDurationChange(page.path, featId, planObj);
    }
  };

  const isThisSaving = (featId) => savingFeature?.path === page.path && savingFeature?.featId === featId;

  return (
    <div
      className="rounded-lg border p-3 transition-all"
      style={{
        background: isSelected ? G.bg : "rgba(255,255,255,0.02)",
        borderColor: isSelected ? G.border : "rgba(255,255,255,0.06)",
      }}
    >
      <button
        onClick={() => onToggle(page.path)}
        className="w-full flex items-center gap-3 mb-2 text-left"
        style={{ color: isSelected ? "white" : "rgba(255,255,255,0.50)" }}
      >
        <div
          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
          style={{
            background: isSelected ? G.text : "transparent",
            border: `1.5px solid ${isSelected ? G.text : "rgba(255,255,255,0.25)"}`,
          }}
        >
          {isSelected && <Check className="w-3 h-3 text-black" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium flex items-center gap-2">
            <span>{page.icon || '📖'}</span>
            <span>{page.name}</span>
          </p>
          <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
            <span>{page.category || 'General'}</span>
            <span>·</span>
            <span>{page.adminOnly ? "Admin" : "User"} Access</span>
          </div>
        </div>
      </button>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="ml-8 space-y-2"
        >
          {/* Non-multi-feature: page-level duration selector (unchanged) */}
          {!isMultiFeature && (
            <>
              <label className="text-xs text-white/45 block">Duration</label>
              <div className="flex flex-wrap gap-1.5">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onDurationChange(page.path, opt.value)}
                    className="px-2 py-1 rounded text-[10px] font-semibold"
                    style={{
                      background: duration?.value === opt.value ? G.bgHi : "rgba(255,255,255,0.04)",
                      border: `1px solid ${duration?.value === opt.value ? G.borderHi : "rgba(255,255,255,0.08)"}`,
                      color: duration?.value === opt.value ? G.text : "rgba(255,255,255,0.50)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {duration?.value === "CUSTOM" && (
                <input
                  type="datetime-local"
                  value={duration.custom_date || ""}
                  onChange={(e) => onCustomDateChange(page.path, e.target.value)}
                  className="mt-1 w-full px-2 py-1.5 rounded text-xs text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
                />
              )}
            </>
          )}

          {/* Multi-feature: each child feature is independently expandable + configurable */}
          {isMultiFeature && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-white/45 block">Child Features (click to configure)</label>
                <button
                  onClick={selectAllFeatures}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded"
                  style={{
                    background: selectedFeatures.length === 0 ? G.bgHi : "rgba(255,255,255,0.04)",
                    border: `1px solid ${selectedFeatures.length === 0 ? G.borderHi : "rgba(255,255,255,0.08)"}`,
                    color: selectedFeatures.length === 0 ? G.text : "rgba(255,255,255,0.50)",
                  }}
                >
                  All Features
                </button>
              </div>

              {plansLoading && (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="w-3 h-3 animate-spin text-white/30" />
                  <span className="text-[10px] text-white/30">Loading plans…</span>
                </div>
              )}

              <div className="space-y-1.5">
                {features.map(feat => {
                  const isFeatSelected = selectedFeatures.includes(feat.id);
                  const isExpanded = expandedFeature === feat.id;
                  const savedPlan = getFeaturePlan(feat.id);
                  const featPlans = getPlansForFeature(feat.id);
                  const allMode = selectedFeatures.length === 0;

                  return (
                    <div key={feat.id}
                      className="rounded-lg border transition-all"
                      style={{
                        background: isExpanded ? G.bg : "rgba(255,255,255,0.02)",
                        borderColor: isExpanded ? G.borderHi : "rgba(255,255,255,0.06)",
                      }}
                    >
                      {/* Feature header — click to expand/collapse independently */}
                      <div className="flex items-center gap-2 p-2">
                        <button
                          onClick={() => toggleFeature(feat.id)}
                          className="flex-shrink-0"
                        >
                          <div
                            className="w-4 h-4 rounded flex items-center justify-center"
                            style={{
                              background: isFeatSelected ? G.text : "transparent",
                              border: `1.5px solid ${isFeatSelected ? G.text : "rgba(255,255,255,0.20)"}`,
                            }}
                          >
                            {isFeatSelected && <Check className="w-2.5 h-2.5 text-black" />}
                          </div>
                        </button>

                        <button
                          onClick={() => expandFeature(feat.id)}
                          className="flex-1 flex items-center gap-2 text-left"
                        >
                          <span className="text-xs font-medium flex-1"
                            style={{ color: isFeatSelected || allMode ? "white" : "rgba(255,255,255,0.50)" }}>
                            {feat.icon} {feat.label}
                          </span>
                          {savedPlan && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold flex-shrink-0"
                              style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>
                              {savedPlan.plan_name}
                            </span>
                          )}
                          <ChevronDown
                            className="w-3 h-3 flex-shrink-0 transition-transform"
                            style={{
                              color: "rgba(255,255,255,0.30)",
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            }}
                          />
                        </button>
                      </div>

                      {/* Expanded settings panel — independent per feature */}
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="px-2 pb-2 ml-6 space-y-2"
                        >
                          {/* DB-configured quick plans */}
                          {featPlans.length > 0 && (
                            <div>
                              <label className="text-[9px] text-white/40 block mb-1">Quick Plans</label>
                              <div className="flex flex-wrap gap-1">
                                {featPlans.map(plan => {
                                  const isPlanSelected = savedPlan?.plan_name === plan.plan_name;
                                  return (
                                    <button key={plan.plan_config_id}
                                      onClick={() => quickSavePlan(feat.id, plan)}
                                      className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                                      style={{
                                        background: isPlanSelected ? G.bgHi : "rgba(255,255,255,0.04)",
                                        border: `1px solid ${isPlanSelected ? G.borderHi : "rgba(255,255,255,0.08)"}`,
                                        color: isPlanSelected ? G.text : "rgba(255,255,255,0.50)",
                                      }}>
                                      {plan.plan_name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Full duration type selector (Minutes → Lifetime → Custom) */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-white/40 block mb-0.5">Duration Type</label>
                              <select value={editDurationType}
                                onChange={e => { setEditDurationType(e.target.value); setEditCustomDate(""); }}
                                className="w-full px-1.5 py-1 rounded text-[10px] text-white outline-none"
                                style={{ background: "rgba(8,16,40,0.98)", border: `1px solid ${G.border}` }}>
                                {DURATION_TYPES.map(t => (
                                  <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                              </select>
                            </div>
                            {editDurationType !== "LIFETIME" && editDurationType !== "CUSTOM" && (
                              <div>
                                <label className="text-[9px] text-white/40 block mb-0.5">Count</label>
                                <input type="number" min={1} value={editDurationCount}
                                  onChange={e => setEditDurationCount(parseInt(e.target.value) || 1)}
                                  className="w-full px-1.5 py-1 rounded text-[10px] text-white outline-none text-center"
                                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
                              </div>
                            )}
                          </div>

                          {editDurationType === "CUSTOM" && (
                            <input type="datetime-local" value={editCustomDate}
                              onChange={e => setEditCustomDate(e.target.value)}
                              className="w-full px-1.5 py-1 rounded text-[10px] text-white outline-none"
                              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
                          )}

                          {/* Per-feature Save button — saves ONLY this feature */}
                          <button
                            onClick={() => saveFeature(feat.id)}
                            disabled={isThisSaving(feat.id) || (editDurationType === "CUSTOM" && !editCustomDate)}
                            className="w-full py-1.5 rounded text-[10px] font-bold disabled:opacity-50 flex items-center justify-center gap-1"
                            style={{ background: "linear-gradient(135deg,#f6d860,#c98a14)", color: "#0d1b2a" }}>
                            {isThisSaving(feat.id) ? (
                              <><Loader2 className="w-2.5 h-2.5 animate-spin" /> Saving…</>
                            ) : (
                              <><Check className="w-2.5 h-2.5" /> Save This Feature</>
                            )}
                          </button>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedFeatures.length === 0 && (
                <p className="text-[10px] text-white/30 mt-1.5">
                  All features unlocked (default). Click a feature to configure it individually.
                </p>
              )}
              {selectedFeatures.length > 0 && (
                <p className="text-[10px] mt-1.5" style={{ color: G.text }}>
                  {selectedFeatures.length} of {features.length} features selected
                </p>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}