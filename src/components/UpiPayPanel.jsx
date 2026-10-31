import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, Loader2, Send, Smartphone } from "lucide-react";
import { buildUpiLink, normalizeUtr, submitUpiPayment } from "@/lib/upiPayment";
import { formatResourcePrice } from "@/lib/unifiedAccess";

const G = { border: "rgba(212,175,55,0.40)", text: "#F5D060", bg: "rgba(212,175,55,0.07)" };

/** Pay by UPI to the owner's account, then send the 12-digit UPI reference. */
export default function UpiPayPanel({ resource, upi, title }) {
  const [qr, setQr] = useState("");
  const [utr, setUtr] = useState("");
  const [copied, setCopied] = useState(false);
  const [state, setState] = useState({ status: "idle", message: "" });
  const link = buildUpiLink({ upiId: upi.upiId, payeeName: upi.payeeName, amountMinor: resource.price_minor, note: title });

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(link, { margin: 1, width: 220 }).then(url => { if (alive) setQr(url); }).catch(() => {});
    return () => { alive = false; };
  }, [link]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(upi.upiId); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };

  const send = async () => {
    if (!normalizeUtr(utr)) { setState({ status: "error", message: "UPI reference നമ്പർ 12 അക്കം ആയിരിക്കണം." }); return; }
    setState({ status: "working", message: "" });
    try {
      await submitUpiPayment(resource.id, utr);
      setState({ status: "done", message: "ലഭിച്ചു. Owner പരിശോധിച്ച് approve ചെയ്താൽ ഈ page നിങ്ങൾക്ക് തുറക്കും. \"എന്റെ purchases\"-ൽ നില കാണാം." });
    } catch (error) {
      setState({ status: "error", message: error.message });
    }
  };

  if (state.status === "done") {
    return (
      <div className="mb-4 rounded-xl border p-4 text-left" role="status" style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.35)" }}>
        <p className="text-sm text-green-300">{state.message}</p>
      </div>
    );
  }

  return (
    <div className="mb-4 space-y-3 text-left">
      <div className="rounded-xl border p-4 space-y-3" style={{ background: G.bg, borderColor: G.border }}>
        <p className="text-xs text-white/70"><b style={{ color: G.text }}>1.</b> ഈ തുക UPI വഴി അടയ്ക്കുക (GPay / PhonePe / Paytm / bank app):</p>
        <p className="text-center text-2xl font-bold" style={{ color: G.text }}>{formatResourcePrice(resource)}</p>
        {qr && <img src={qr} alt="UPI QR code" className="mx-auto rounded-lg bg-white p-1" width={180} height={180} />}
        <a href={link} className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 sm:hidden"
          style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${G.border}`, color: "#fff" }}>
          <Smartphone className="w-4 h-4" /> UPI app തുറക്കുക
        </a>
        <button onClick={copy} className="w-full py-2 rounded-xl text-xs flex items-center justify-center gap-2"
          style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="font-mono">{upi.upiId}</span>
        </button>
        {upi.payeeName && <p className="text-center text-[11px] text-white/45">{upi.payeeName}</p>}
      </div>

      <div className="rounded-xl border p-4 space-y-2" style={{ background: G.bg, borderColor: G.border }}>
        <label htmlFor="upi-utr" className="text-xs text-white/70 block">
          <b style={{ color: G.text }}>2.</b> Payment കഴിഞ്ഞാൽ UPI app-ൽ കാണുന്ന <b>12 അക്ക UPI Ref / UTR നമ്പർ</b> ഇവിടെ നൽകുക:
        </label>
        <input id="upi-utr" inputMode="numeric" autoComplete="off" value={utr} onChange={e => setUtr(e.target.value.replace(/[^0-9 ]/g, "").slice(0, 16))}
          placeholder="ഉദാ: 412345678901"
          className="w-full px-3 py-3 rounded-xl text-white text-center tracking-widest outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, fontSize: "16px" }} />
        {state.status === "error" && <p className="text-xs text-red-300" role="alert">{state.message}</p>}
        <button onClick={send} disabled={state.status === "working"}
          className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}>
          {state.status === "working" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Payment വിവരം അയക്കുക
        </button>
        <p className="text-[10px] text-white/40">Owner ബാങ്കിൽ പരിശോധിച്ച ശേഷമാണ് page തുറക്കുക. തെറ്റായ നമ്പർ നിരസിക്കപ്പെടും.</p>
      </div>
    </div>
  );
}
