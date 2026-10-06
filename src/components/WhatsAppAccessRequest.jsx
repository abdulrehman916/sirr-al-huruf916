import { useState } from "react";
import { MessageCircle, CheckCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { ADMIN_CONFIG } from "@/lib/adminConfig";
import { getSessionId, getRedeemedCodes } from "@/lib/sessionId";

/**
 * WhatsAppAccessRequest — opens WhatsApp with a pre-filled message AND creates
 * the same AccessRequest database record as the in-app form, so WhatsApp
 * requests appear in the Admin Panel, Request History, Conversation,
 * Approval, Rejection, Payment, and Code Delivery workflow.
 * No auth required.
 */
export default function WhatsAppAccessRequest({ pageName, routePath }) {
  const [submitted, setSubmitted] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleRequest = async () => {
    setCreating(true);
    // Best-effort: create the AccessRequest record so the admin sees it.
    // Silently continue to WhatsApp even if the record creation fails.
    try {
      const redeemed = getRedeemedCodes();
      await base44.functions.invoke("submitAccessRequest", {
        name: "",
        phone: "",
        email: "",
        page_path: routePath,
        page_name: pageName,
        message: "Request submitted via WhatsApp.",
        session_id: getSessionId(),
        existing_code: redeemed.length > 0 ? redeemed[redeemed.length - 1] : null,
      });
    } catch { /* best-effort — never block WhatsApp */ }

    const message =
      `السلام عليكم\n\n` +
      `*Access Request — Sirr al-Huruf*\n\n` +
      `📄 Page: ${pageName}\n` +
      `🔗 Path: ${routePath}\n\n` +
      `Please send me the reading code for this page.`;
    const url = `https://wa.me/${ADMIN_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setCreating(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        className="w-full py-3.5 rounded-xl font-inter font-semibold text-sm flex items-center justify-center gap-2"
        style={{
          background: "rgba(37,211,102,0.12)",
          border: "1px solid rgba(37,211,102,0.40)",
          color: "#25D366",
        }}
      >
        <CheckCircle className="w-4 h-4" />
        Request Sent — Check WhatsApp
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={handleRequest}
        disabled={creating}
        className="w-full py-3.5 rounded-xl font-inter font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
          color: "#ffffff",
          boxShadow: "0 0 24px rgba(37,211,102,0.35)",
        }}
      >
        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
        {creating ? "Sending…" : "Request Access via WhatsApp"}
      </button>
    </div>
  );
}