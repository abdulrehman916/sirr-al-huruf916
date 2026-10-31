import { useEffect, useRef, useState } from "react";
import { CreditCard, Loader2, CheckCircle, AlertCircle, QrCode } from "lucide-react";
import { purchasePage, describeValidity } from "@/lib/razorpayCheckout";
import { formatResourcePrice } from "@/lib/unifiedAccess";
import { validateAndCleanPermissions } from "@/lib/sessionId";
import { getPaymentOptions } from "@/lib/upiPayment";
import UpiPayPanel from "@/components/UpiPayPanel";

const G = { border: "rgba(212,175,55,0.40)", text: "#F5D060", bg: "rgba(212,175,55,0.07)" };

const fmtDate = (value) => value
  ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  : "Lifetime";

/** Price, validity and the Buy button for one page sold online. */
export default function BuyPageButton({ resource, onUnlocked }) {
  const busy = useRef(false);
  const [state, setState] = useState({ status: "idle", message: "" });
  const [options, setOptions] = useState(null);
  const [showUpi, setShowUpi] = useState(false);

  useEffect(() => {
    let alive = true;
    getPaymentOptions().then(value => { if (alive) setOptions(value); });
    return () => { alive = false; };
  }, []);

  if (!resource || resource.access_mode !== "PAID" || Number(resource.price_minor || 0) < 100) return null;

  const buy = async () => {
    if (busy.current) return;
    busy.current = true;
    setState({ status: "working", message: "" });
    try {
      const result = await purchasePage(resource);
      await validateAndCleanPermissions();
      setState({ status: "done", message: `Payment വിജയിച്ചു. Access: ${fmtDate(result.expires_at)} വരെ.` });
      onUnlocked?.(result);
    } catch (error) {
      if (error.code === "DISMISSED") setState({ status: "idle", message: "" });
      else setState({ status: "error", message: error.message || "Payment പൂർത്തിയായില്ല." });
    } finally {
      busy.current = false;
    }
  };

  return (
    <div className="mb-4 space-y-3">
      <div className="rounded-xl border px-4 py-3" style={{ background: G.bg, borderColor: G.border }}>
        <p className="text-[10px] uppercase tracking-wider text-white/40">വില</p>
        <p className="mt-1 text-xl font-bold" style={{ color: G.text }}>{formatResourcePrice(resource)}</p>
        <p className="mt-1 text-[11px] text-white/50">{describeValidity(resource)}</p>
        <p className="mt-1 text-[10px] text-white/35">ഈ ഒരു page മാത്രം തുറക്കും · UPI / Google Pay / PhonePe / Paytm{options?.razorpay ? " / Card" : ""}</p>
      </div>

      {state.message && (
        <div className="rounded-xl border p-3 flex items-start gap-2 text-left" role="status" style={{
          background: state.status === "done" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
          borderColor: state.status === "done" ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)",
        }}>
          {state.status === "done"
            ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
          <p className={`text-xs ${state.status === "done" ? "text-green-300" : "text-red-300"}`}>{state.message}</p>
        </div>
      )}

      {!options && <Loader2 className="w-5 h-5 animate-spin mx-auto text-amber-200/60" aria-label="Loading payment options" />}

      {options?.razorpay && (
        <button onClick={buy} disabled={state.status === "working" || state.status === "done"}
          className="w-full py-3.5 rounded-xl font-inter font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a", boxShadow: "0 0 24px rgba(212,175,55,0.30)" }}>
          {state.status === "working" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
          {state.status === "working" ? "കാത്തിരിക്കുക…" : `Buy · ${formatResourcePrice(resource)}`}
        </button>
      )}

      {options?.upi && !showUpi && (
        <button onClick={() => setShowUpi(true)}
          className="w-full py-3.5 rounded-xl font-inter font-bold text-sm flex items-center justify-center gap-2"
          style={options.razorpay
            ? { background: "transparent", border: `1px solid ${G.border}`, color: G.text }
            : { background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a", boxShadow: "0 0 24px rgba(212,175,55,0.30)" }}>
          <QrCode className="w-4 h-4" />
          {`UPI വഴി Buy · ${formatResourcePrice(resource)}`}
        </button>
      )}
      {options?.upi && showUpi && <UpiPayPanel resource={resource} upi={options.upi} title={resource.title?.ml || resource.title?.en || resource.slug} />}

      {options && !options.razorpay && !options.upi && (
        <p className="text-xs text-white/50">Online payment ഉടൻ ലഭ്യമാകും. Gift code ഉണ്ടെങ്കിൽ താഴെ നൽകാം.</p>
      )}
    </div>
  );
}
