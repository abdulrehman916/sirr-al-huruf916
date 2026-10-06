import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, KeyRound, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { addRedeemedCode, getSessionId, mergeGrantedPermissions } from "@/lib/sessionId";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

function fmt(d) {
  if (!d) return "Lifetime";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function RedeemCodeModal({ onClose }) {
  const submitting = useRef(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleRedeem = async () => {
    if (submitting.current) return;
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setError("Code നൽകുക."); return; }
    setError("");
    submitting.current = true;
    setLoading(true);
    try {
      const sessionId = getSessionId();

      // Preserve the original guest/session flow, but when the customer is
      // signed in use the linked redemption endpoint so the code becomes
      // permanently attached to that Google/email account. One code can then
      // be restored only by the same linked account.
      let signedInUser = null;
      try {
        signedInUser = await base44.auth.me();
      } catch {
        signedInUser = null;
      }

      if (!signedInUser?.id) throw new Error("ആദ്യം നിങ്ങളുടെ email ഉപയോഗിച്ച് login ചെയ്യുക.");
      const functionName = "redeemCodeLinked";
      const res = await base44.functions.invoke(functionName, {
        code: trimmed,
        session_id: sessionId,
      });
      const data = res.data;
      if (data?.success && data?.permissions) {
        mergeGrantedPermissions(data.permissions);
        addRedeemedCode(trimmed);
      }
      setResult(data);
    } catch (e) {
      setResult({ success: false, message: e.message || "Redemption failed. Please try again." });
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm rounded-2xl p-6 space-y-5"
        style={{
          background: "linear-gradient(145deg, #0c1630 0%, #060c1c 100%)",
          border: `1px solid ${G.borderHi}`,
          boxShadow: "0 0 48px rgba(212,175,55,0.15)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
              <KeyRound className="w-4 h-4" style={{ color: G.text }} />
            </div>
            <div>
              <h3 className="font-inter font-bold text-white text-sm">Access code ഉപയോഗിക്കുക</h3>
              <p className="text-xs text-white/40">നിങ്ങൾക്ക് ലഭിച്ച code നൽകി pages തുറക്കുക</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {result?.success ? (
          <div className="space-y-4">
            <div className="rounded-xl border p-4 text-center space-y-3"
              style={{ background: "rgba(34,197,94,0.07)", borderColor: "rgba(34,197,94,0.35)" }}>
              <CheckCircle className="w-10 h-10 mx-auto text-green-400" />
              <p className="font-inter font-bold text-green-400 text-sm">{result.message}</p>
              {result.linked && (
                <p className="text-[11px] text-white/45">ഈ code നിങ്ങളുടെ login account-ലേക്ക് link ചെയ്തിരിക്കുന്നു.</p>
              )}
              <div className="space-y-1">
                {(result.pages_granted || []).map(pg => (
                  <p key={pg.path} className="text-xs text-white/60 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    {pg.name}
                  </p>
                ))}
              </div>
              {result.permissions?.[0] && (
                <p className="text-xs text-white/40 pt-1">
                  കാലാവധി:{" "}
                  <span className="text-white/70 font-semibold">
                    {result.permissions.every(p => !p.expiry_date) ? "♾ Lifetime" : fmt(result.permissions[0].expiry_date)}
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={() => { onClose(); window.location.reload(); }}
              className="w-full py-3 rounded-xl font-inter font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}
            >
              തുടരുക →
            </button>
          </div>
        ) : (
          <>
            {result && !result.success && (
              <div className="rounded-xl border p-3 flex items-start gap-2"
                style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.35)" }}>
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{result.message}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: G.text }}>
                Access Code
              </label>
              <input
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); setResult(null); }}
                onKeyDown={e => e.key === "Enter" && !loading && handleRedeem()}
                placeholder="e.g. ABDUL2026"
                className="w-full px-4 py-3 rounded-xl text-white font-inter font-bold text-base text-center tracking-[0.15em] outline-none placeholder-white/20"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${error ? "rgba(239,68,68,0.50)" : G.border}`, fontSize: "16px" }}
                autoFocus
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>

            <button
              onClick={handleRedeem}
              disabled={loading || !code.trim()}
              className="w-full py-3.5 rounded-xl font-inter font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              {loading ? "പരിശോധിക്കുന്നു…" : "Code ഉപയോഗിക്കുക"}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
