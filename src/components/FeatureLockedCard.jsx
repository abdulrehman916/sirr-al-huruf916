/**
 * FeatureLockedCard — Professional locked screen shown when a user clicks
 * a feature they don't have permission for.
 *
 * Two primary actions:
 * 1. Request Access (Primary) — opens in-app request form with plan, price, message
 * 2. Contact on WhatsApp (Optional) — quick communication / payment screenshots
 *
 * Also supports Reading Code redemption.
 * All displayed content (feature name, plans, prices) comes from the database.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, MessageCircle, KeyRound, CheckCircle, AlertCircle, Loader2, ChevronLeft, Check, Inbox, Star, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ADMIN_CONFIG } from "@/lib/adminConfig";
import { getSessionId, mergeGrantedPermissions, addRedeemedCode, getRedeemedCodes } from "@/lib/sessionId";
import { getFeatureConfig } from "@/lib/featureConfigCache";
import { getFeaturePlans, formatPlan } from "@/lib/subscriptionPlanCache";
import { getFeatureById } from "@/lib/featureRegistry";
import { getEffectivePrice, isSaleActive } from "@/lib/pricingUtils";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

export default function FeatureLockedCard({ pagePath, featureId, featureLabel, onBack, onUnlocked }) {
  const [config, setConfig] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCodeEntry, setShowCodeEntry] = useState(false);
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [codeResult, setCodeResult] = useState(null);

  // Request form states
  const [view, setView] = useState("default"); // "default" | "form" | "submitted"
  const [submittedRequestId, setSubmittedRequestId] = useState(null);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [cfg, planList] = await Promise.all([
        getFeatureConfig(pagePath, featureId),
        getFeaturePlans(pagePath, featureId),
      ]);
      if (!cancelled) {
        setConfig(cfg);
        setPlans(planList);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pagePath, featureId]);

  const registryFeat = getFeatureById(pagePath, featureId);
  const displayName = config?.feature_name || featureLabel || registryFeat?.label || featureId;
  const displayIcon = config?.icon || registryFeat?.icon || "🔒";
  const displayDescription = config?.description || null;

  const handleRedeem = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setRedeeming(true);
    setCodeResult(null);
    try {
      const sessionId = getSessionId();
      const res = await base44.functions.invoke("redeemCodeGuest", {
        code: trimmed,
        session_id: sessionId,
      });
      const data = res.data;
      if (data?.success && data?.permissions) {
        addRedeemedCode(trimmed);
        mergeGrantedPermissions(data.permissions);
        setCodeResult({ success: true, message: data.message });
        setTimeout(() => {
          if (onUnlocked) onUnlocked();
          else window.location.reload();
        }, 1200);
      } else {
        setCodeResult({ success: false, message: data?.message || "Invalid code." });
      }
    } catch (e) {
      setCodeResult({ success: false, message: e.message || "Redemption failed." });
    } finally {
      setRedeeming(false);
    }
  };

  const handleSubmitRequest = async () => {
    setSubmitting(true);
    setCodeResult(null);
    try {
      const planLine = selectedPlan ? formatPlan(selectedPlan) : "Contact for pricing";
      const priceLine = selectedPlan ? `${selectedPlan.currency} ${selectedPlan.price}` : "";
      const messageParts = [
        formMessage.trim(),
        `Plan: ${planLine}${priceLine ? ` | Price: ${priceLine}` : ""}`,
      ].filter(Boolean);

      const redeemedCodes = getRedeemedCodes();
      const res = await base44.functions.invoke("submitAccessRequest", {
        name: formName.trim(),
        phone: formPhone.trim(),
        email: "",
        page_path: pagePath,
        page_name: displayName,
        feature_id: featureId || null,
        plan_name: selectedPlan?.plan_name || null,
        price: selectedPlan ? getEffectivePrice(selectedPlan) : null,
        currency: selectedPlan?.currency || null,
        message: messageParts.join("\n\n"),
        session_id: getSessionId(),
        existing_code: redeemedCodes.length > 0 ? redeemedCodes[redeemedCodes.length - 1] : null,
      });

      if (res.data?.success) {
        setSubmittedRequestId(res.data.request_id);
        setView("submitted");
      } else {
        setCodeResult({ success: false, message: res.data?.error || "Failed to submit request." });
      }
    } catch (e) {
      setCodeResult({ success: false, message: e.message || "Failed to submit request." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const planLine = selectedPlan ? `${selectedPlan.plan_name} — ${selectedPlan.currency} ${getEffectivePrice(selectedPlan)}` : "Contact for pricing";
    const text = `Hello, I'd like to request access to: ${displayName}\nPlan: ${planLine}\nPage: ${pagePath}`;
    const url = `https://wa.me/${ADMIN_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-sm mx-auto space-y-4"
    >
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-inter text-xs font-semibold"
          style={{ background: "rgba(212,175,55,0.06)", border: `1px solid ${G.border}`, color: G.text }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      )}

      <div className="rounded-2xl border p-6 text-center" style={{
        background: G.bg, borderColor: G.border, boxShadow: "0 0 48px rgba(212,175,55,0.10)",
      }}>
        {/* Lock icon + feature name */}
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
          <Lock className="w-7 h-7" style={{ color: G.text }} />
        </div>
        <p className="font-inter text-xs text-white/30 uppercase tracking-widest mb-1">
          {displayIcon} {displayName}
        </p>
        {displayDescription && (
          <p className="font-inter text-sm text-white/50 mb-3 leading-relaxed px-2">
            {displayDescription}
          </p>
        )}

        {/* ══ DEFAULT VIEW: Plans + Two Buttons ══ */}
        {view === "default" && (
          <>
            {/* Plans selection */}
            <div className="mb-5 mt-3">
              {loading ? (
                <div className="w-6 h-6 border-2 border-t-yellow-400 border-r-transparent border-b-yellow-400 border-l-transparent rounded-full animate-spin mx-auto" />
              ) : plans.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="font-inter text-[10px] text-white/30 uppercase tracking-widest mb-2">
                    {selectedPlan ? "Selected Plan" : "Select a plan to unlock"}
                  </p>
                  {plans.map(plan => {
                    const isSelected = selectedPlan?.plan_config_id === plan.plan_config_id;
                    const saleOn = isSaleActive(plan);
                    const effectivePrice = getEffectivePrice(plan);
                    const isRecommended = plan.is_recommended;
                    return (
                      <button
                        key={plan.plan_config_id}
                        onClick={() => setSelectedPlan(isSelected ? null : plan)}
                        className="w-full rounded-lg border py-2.5 px-3 flex items-center justify-between transition-all relative"
                        style={{
                          background: isSelected
                            ? "rgba(212,175,55,0.18)"
                            : isRecommended
                              ? "rgba(212,175,55,0.10)"
                              : "rgba(212,175,55,0.04)",
                          borderColor: isSelected
                            ? G.borderHi
                            : isRecommended
                              ? "rgba(212,175,55,0.50)"
                              : "rgba(212,175,55,0.20)",
                          boxShadow: isSelected ? "0 0 16px rgba(212,175,55,0.15)" : "none",
                        }}
                      >
                        <span className="font-inter text-sm text-white/80 font-medium flex items-center gap-1.5 min-w-0">
                          {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: G.text }} />}
                          <span className="truncate">{plan.plan_name}</span>
                          {isRecommended && (
                            <span className="flex items-center gap-0.5 px-1 py-0 rounded text-[8px] font-bold uppercase tracking-wider flex-shrink-0" style={{ background: "rgba(212,175,55,0.25)", color: G.text }}>
                              <Star className="w-2 h-2" />
                              Best
                            </span>
                          )}
                          {saleOn && (
                            <span className="flex items-center gap-0.5 px-1 py-0 rounded text-[8px] font-bold uppercase tracking-wider flex-shrink-0" style={{ background: "rgba(239,68,68,0.18)", color: "#f87171" }}>
                              <Tag className="w-2 h-2" />
                              Sale
                            </span>
                          )}
                        </span>
                        <span className="font-inter text-sm font-bold flex items-center gap-1.5 flex-shrink-0">
                          {saleOn && (
                            <span className="text-xs line-through text-white/30 font-normal">
                              {plan.currency} {plan.price}
                            </span>
                          )}
                          <span style={{ color: saleOn ? "#f87171" : G.text }}>
                            {plan.currency} {effectivePrice}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="font-inter text-xs text-white/35">Contact for pricing</p>
              )}
            </div>

            {/* Two primary buttons — shown after plan selection (or immediately if no plans) */}
            {(selectedPlan || plans.length === 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                style={{ overflow: "hidden" }}
              >
                {/* Primary: Request Access (in-app) */}
                <button
                  onClick={() => setView("form")}
                  className="w-full py-3.5 rounded-xl font-inter font-bold text-sm flex items-center justify-center gap-2 mb-2.5"
                  style={{
                    background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)",
                    color: "#0d1b2a",
                    boxShadow: "0 0 24px rgba(212,175,55,0.30)",
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Request Access
                </button>

                {/* Optional: Contact on WhatsApp */}
                <button
                  onClick={handleWhatsApp}
                  className="w-full py-3 rounded-xl font-inter font-semibold text-sm flex items-center justify-center gap-2 mb-3"
                  style={{
                    background: "rgba(34,197,94,0.10)",
                    border: "1px solid rgba(34,197,94,0.35)",
                    color: "#22c55e",
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact on WhatsApp
                </button>

                {/* Reading code toggle */}
                <button
                  onClick={() => setShowCodeEntry(v => !v)}
                  className="w-full py-2.5 rounded-xl font-inter text-xs font-semibold flex items-center justify-center gap-2"
                  style={{ background: "rgba(212,175,55,0.04)", border: `1px solid ${G.border}`, color: G.text }}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  {showCodeEntry ? "Hide Code Entry" : "I Have a Reading Code"}
                </button>

                {/* Link to My Requests */}
                <Link
                  to="/my-requests"
                  className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-inter font-medium"
                  style={{ color: "rgba(212,175,55,0.55)" }}
                >
                  <Inbox className="w-3 h-3" />
                  View My Requests
                </Link>
              </motion.div>
            )}
          </>
        )}

        {/* ══ FORM VIEW: In-app request form ══ */}
        {view === "form" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-left"
          >
            <button
              onClick={() => setView("default")}
              className="flex items-center gap-1.5 mb-4 text-xs font-inter font-semibold"
              style={{ color: G.text }}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {/* Summary — read-only */}
            <div className="rounded-xl border p-3 mb-4" style={{ background: "rgba(212,175,55,0.04)", borderColor: G.border }}>
              <p className="font-inter text-[10px] text-white/30 uppercase tracking-wider mb-1">Request Summary</p>
              <p className="font-inter text-sm text-white/80 font-semibold mb-0.5">{displayName}</p>
              {selectedPlan && (
                <p className="font-inter text-xs" style={{ color: G.text }}>
                  {selectedPlan.plan_name} — {selectedPlan.currency} {getEffectivePrice(selectedPlan)}
                </p>
              )}
            </div>

            {/* Optional fields */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="font-inter text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Your Name (optional)</label>
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none placeholder-white/20"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, fontSize: "16px" }}
                />
              </div>
              <div>
                <label className="font-inter text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Phone / WhatsApp (optional)</label>
                <input
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  placeholder="+971 5X XXX XXXX"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none placeholder-white/20"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, fontSize: "16px" }}
                />
              </div>
              <div>
                <label className="font-inter text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Message (optional)</label>
                <textarea
                  value={formMessage}
                  onChange={e => setFormMessage(e.target.value)}
                  placeholder="Any specific requirements or questions..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none placeholder-white/20 resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, fontSize: "16px" }}
                />
              </div>
            </div>

            {codeResult && (
              <div className="rounded-xl border p-3 mb-3 flex items-start gap-2" style={{
                background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.35)",
              }}>
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{codeResult.message}</p>
              </div>
            )}

            <button
              onClick={handleSubmitRequest}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-inter font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
          </motion.div>
        )}

        {/* ══ SUBMITTED VIEW: Confirmation ══ */}
        {view === "submitted" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-2"
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.40)" }}>
              <CheckCircle className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="font-inter font-bold text-white text-base mb-1">Request Submitted</h3>
            <p className="font-inter text-xs text-white/50 mb-3">Your request has been sent to the admin.</p>

            <div className="rounded-xl border p-3 mb-4" style={{ background: G.bg, borderColor: G.border }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-inter text-[10px] text-white/40 uppercase tracking-wider">Status</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.40)", color: "#eab308" }}>
                  Pending
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-inter text-[10px] text-white/40 uppercase tracking-wider">Request ID</span>
                <span className="font-mono text-xs font-bold" style={{ color: G.text }}>
                  {submittedRequestId}
                </span>
              </div>
            </div>

            <Link
              to="/my-requests"
              className="w-full py-3 rounded-xl font-inter font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}
            >
              <Inbox className="w-4 h-4" />
              View in My Inbox
            </Link>
            <button
              onClick={() => { setView("default"); setFormName(""); setFormPhone(""); setFormMessage(""); }}
              className="mt-2 w-full py-2.5 rounded-xl font-inter text-xs font-semibold"
              style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}
            >
              Back to Feature
            </button>
          </motion.div>
        )}
      </div>

      {/* Code entry section — always available in default view */}
      <AnimatePresence>
        {showCodeEntry && view === "default" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div className="rounded-2xl border p-5 space-y-4" style={{
              background: "linear-gradient(145deg, #0c1630 0%, #060c1c 100%)", borderColor: G.borderHi,
            }}>
              <h3 className="font-inter font-bold text-white text-sm flex items-center gap-2">
                <KeyRound className="w-4 h-4" style={{ color: G.text }} />
                Enter Access Code
              </h3>

              {codeResult && (
                <div className="rounded-xl border p-3 flex items-start gap-2" style={{
                  background: codeResult.success ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                  borderColor: codeResult.success ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)",
                }}>
                  {codeResult.success
                    ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                  <p className={`text-xs ${codeResult.success ? "text-green-300" : "text-red-300"}`}>
                    {codeResult.message}
                  </p>
                </div>
              )}

              <input
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setCodeResult(null); }}
                onKeyDown={e => e.key === "Enter" && !redeeming && handleRedeem()}
                placeholder="e.g. ACCESS-1234"
                className="w-full px-4 py-3 rounded-xl text-white font-bold text-base text-center tracking-[0.15em] outline-none placeholder-white/20"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, fontSize: "16px" }}
                autoCapitalize="characters" autoComplete="off" spellCheck={false}
              />

              <button
                onClick={handleRedeem}
                disabled={redeeming || !code.trim()}
                className="w-full py-3.5 rounded-xl font-inter font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}
              >
                {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                {redeeming ? "Verifying…" : "Activate Code"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}