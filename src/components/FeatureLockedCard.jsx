/**
 * FeatureLockedCard — shown when a customer opens a locked card inside a page.
 *
 * Two ways to unlock, both verified by the server:
 * 1. Buy the whole page online (Razorpay) when the owner has set a price.
 * 2. Enter an owner gift code.
 * Customer WhatsApp/in-app access requests are no longer offered.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, KeyRound, CheckCircle, AlertCircle, Loader2, ChevronLeft } from "lucide-react";
import { platform } from "@/api/platformClient";
import { getSessionId, mergeGrantedPermissions, addRedeemedCode } from "@/lib/sessionId";
import { getFeatureConfig } from "@/lib/featureConfigCache";
import { getFeatureById } from "@/lib/featureRegistry";
import { findPublishedResource } from "@/lib/unifiedAccess";
import { useAuth } from "@/lib/AuthContext";
import BuyPageButton from "@/components/BuyPageButton";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

export default function FeatureLockedCard({ pagePath, featureId, featureLabel, onBack, onUnlocked }) {
  const { isAuthenticated } = useAuth();
  const [config, setConfig] = useState(null);
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCodeEntry, setShowCodeEntry] = useState(false);
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [codeResult, setCodeResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [cfg, pageResource] = await Promise.all([
        getFeatureConfig(pagePath, featureId),
        findPublishedResource(pagePath).catch(() => null),
      ]);
      if (!cancelled) {
        setConfig(cfg);
        setResource(pageResource);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pagePath, featureId]);

  const registryFeat = getFeatureById(pagePath, featureId);
  const displayName = config?.feature_name || featureLabel || registryFeat?.label || featureId;
  const displayIcon = config?.icon || registryFeat?.icon || "🔒";
  const displayDescription = config?.description || null;
  const forSale = resource?.access_mode === "PAID" && Number(resource?.price_minor || 0) >= 100;
  const unlocked = () => { if (onUnlocked) onUnlocked(); else window.location.reload(); };

  const handleRedeem = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setRedeeming(true);
    setCodeResult(null);
    try {
      const res = await platform.functions.invoke("redeemCodeLinked", { code: trimmed, session_id: getSessionId() });
      const data = res.data;
      if (data?.success && data?.permissions) {
        addRedeemedCode(trimmed);
        mergeGrantedPermissions(data.permissions);
        setCodeResult({ success: true, message: data.message });
        setTimeout(unlocked, 1200);
      } else {
        setCodeResult({ success: false, message: data?.message || "Code ശരിയല്ല." });
      }
    } catch (e) {
      setCodeResult({ success: false, message: e.message || "Code ഉപയോഗിക്കാൻ കഴിഞ്ഞില്ല." });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="w-full max-w-sm mx-auto space-y-4">
      {onBack && (
        <button onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-inter text-xs font-semibold"
          style={{ background: "rgba(212,175,55,0.06)", border: `1px solid ${G.border}`, color: G.text }}>
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      )}

      <div className="rounded-2xl border p-6 text-center" style={{
        background: G.bg, borderColor: G.border, boxShadow: "0 0 48px rgba(212,175,55,0.10)",
      }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
          <Lock className="w-7 h-7" style={{ color: G.text }} />
        </div>
        <p className="font-inter text-xs text-white/30 uppercase tracking-widest mb-1">{displayIcon} {displayName}</p>
        {displayDescription && (
          <p className="font-inter text-sm text-white/50 mb-3 leading-relaxed px-2">{displayDescription}</p>
        )}

        <div className="mt-4">
          {loading ? (
            <div className="w-6 h-6 border-2 border-t-yellow-400 border-r-transparent border-b-yellow-400 border-l-transparent rounded-full animate-spin mx-auto mb-4" />
          ) : forSale && isAuthenticated ? (
            <>
              <p className="font-inter text-[11px] text-white/45 mb-3">മുഴുവൻ page വാങ്ങിയാൽ ഈ card-ഉം തുറക്കും.</p>
              <BuyPageButton resource={resource} onUnlocked={unlocked} />
            </>
          ) : forSale ? (
            <a href={`/login?redirect=${encodeURIComponent(pagePath)}`}
              className="block w-full py-3 rounded-xl font-inter font-bold text-sm text-center mb-3"
              style={{ background: "#ffffff", color: "#0d1b2a" }}>
              വാങ്ങാൻ email ഉപയോഗിച്ച് login ചെയ്യുക
            </a>
          ) : (
            <p className="font-inter text-xs text-white/35 mb-4">ഈ card ഇപ്പോൾ online-ൽ വിൽപ്പനയ്ക്കില്ല.</p>
          )}
        </div>

        <button onClick={() => setShowCodeEntry(v => !v)}
          className="w-full py-2.5 rounded-xl font-inter text-xs font-semibold flex items-center justify-center gap-2"
          style={{ background: "rgba(212,175,55,0.04)", border: `1px solid ${G.border}`, color: G.text }}>
          <KeyRound className="w-3.5 h-3.5" />
          {showCodeEntry ? "Code entry അടയ്ക്കുക" : "Gift code ഉണ്ടോ?"}
        </button>
      </div>

      <AnimatePresence>
        {showCodeEntry && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}>
            <div className="rounded-2xl border p-5 space-y-4" style={{
              background: "linear-gradient(145deg, #0c1630 0%, #060c1c 100%)", borderColor: G.borderHi,
            }}>
              <h3 className="font-inter font-bold text-white text-sm flex items-center gap-2">
                <KeyRound className="w-4 h-4" style={{ color: G.text }} />
                Gift code നൽകുക
              </h3>
              {!isAuthenticated && <p className="text-xs text-white/50">Code ഉപയോഗിക്കാൻ ആദ്യം email ഉപയോഗിച്ച് login ചെയ്യുക.</p>}
              {codeResult && (
                <div className="rounded-xl border p-3 flex items-start gap-2" style={{
                  background: codeResult.success ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                  borderColor: codeResult.success ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)",
                }}>
                  {codeResult.success
                    ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                  <p className={`text-xs ${codeResult.success ? "text-green-300" : "text-red-300"}`}>{codeResult.message}</p>
                </div>
              )}
              <input value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setCodeResult(null); }}
                onKeyDown={e => e.key === "Enter" && !redeeming && handleRedeem()}
                placeholder="e.g. ACCESS-1234"
                className="w-full px-4 py-3 rounded-xl text-white font-bold text-base text-center tracking-[0.15em] outline-none placeholder-white/20"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, fontSize: "16px" }}
                autoCapitalize="characters" autoComplete="off" spellCheck={false} />
              <button onClick={handleRedeem} disabled={redeeming || !code.trim() || !isAuthenticated}
                className="w-full py-3.5 rounded-xl font-inter font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}>
                {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                {redeeming ? "പരിശോധിക്കുന്നു…" : "Code ഉപയോഗിക്കുക"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
