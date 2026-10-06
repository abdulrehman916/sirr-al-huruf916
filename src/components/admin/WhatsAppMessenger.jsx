/**
 * WhatsAppMessenger — admin utility for sending template WhatsApp messages.
 * Opens wa.me deep-links; no API key needed.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X, ChevronDown, Phone, MessageSquare } from "lucide-react";

const ADMIN_WA = "971522308926"; // fallback; override via props - matches lib/emailBranding.js WHATSAPP_SUPPORT

// ── Message Templates ─────────────────────────────────────────────────────────
function buildTemplates(user) {
  const name = user?.name || user?.full_name || "Valued User";
  const page = user?.page_name || "your content";
  const expiry = user?.expiry_date
    ? new Date(user.expiry_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  return [
    {
      id: "greeting",
      label: "General Greeting",
      icon: "👋",
      text: `Assalamu Alaikum ${name},\n\nThis is Sirr al-Huruf Support. How can we assist you today?`,
    },
    {
      id: "subscription_expiry",
      label: "Subscription Expiry Reminder",
      icon: "⏳",
      text: expiry
        ? `Assalamu Alaikum ${name},\n\nThis is a reminder that your access to *${page}* will expire on *${expiry}*.\n\nTo renew or extend, please contact us at your earliest convenience.\n\n— Sirr al-Huruf Support`
        : `Assalamu Alaikum ${name},\n\nThis is a reminder that your subscription to *${page}* is expiring soon.\n\nPlease contact us to renew.\n\n— Sirr al-Huruf Support`,
    },
    {
      id: "payment_reminder",
      label: "Payment Reminder",
      icon: "💳",
      text: `Assalamu Alaikum ${name},\n\nWe noticed your payment for *${page}* is pending.\n\nKindly complete the payment to continue accessing the content uninterrupted.\n\nFor assistance, reply to this message.\n\n— Sirr al-Huruf Support`,
    },
    {
      id: "support_reply",
      label: "Support Reply",
      icon: "🛡️",
      text: `Assalamu Alaikum ${name},\n\nThank you for contacting Sirr al-Huruf Support.\n\nWe have reviewed your request and are happy to assist. Please let us know if you have any further questions.\n\n— Sirr al-Huruf Support`,
    },
    {
      id: "access_granted",
      label: "Access Granted",
      icon: "✅",
      text: `Assalamu Alaikum ${name},\n\nYour access to *${page}* has been successfully activated.\n\nPlease log in to the app to begin.\n\nJazakAllah Khair.\n\n— Sirr al-Huruf Support`,
    },
    {
      id: "custom",
      label: "Custom Message",
      icon: "✏️",
      text: `Assalamu Alaikum ${name},\n\n`,
    },
  ];
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function WhatsAppMessenger({ user, onClose }) {
  const phone = (user?.mobile || user?.phone || "").replace(/\D/g, "");
  const templates = buildTemplates(user);

  const [selected, setSelected] = useState(templates[0].id);
  const [text, setText] = useState(templates[0].text);
  const [showTemplates, setShowTemplates] = useState(false);

  const selectTemplate = (tpl) => {
    setSelected(tpl.id);
    setText(tpl.text);
    setShowTemplates(false);
  };

  const openWhatsApp = () => {
    const target = phone || ADMIN_WA;
    const url = `https://wa.me/${target}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const G = {
    border: "rgba(212,175,55,0.35)",
    borderHi: "rgba(212,175,55,0.65)",
    text: "#F5D060",
    bg: "rgba(212,175,55,0.06)",
    bgHi: "rgba(212,175,55,0.14)",
  };

  const currentTpl = templates.find(t => t.id === selected);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
      style={{ background: "rgba(0,0,0,0.88)" }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-lg rounded-2xl flex flex-col"
        style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: `1px solid ${G.borderHi}`, maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "rgba(37,211,102,0.20)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.30)" }}>
              <MessageSquare className="w-4.5 h-4.5" style={{ color: "#25D366" }} />
            </div>
            <div>
              <p className="font-inter font-bold text-white text-sm">WhatsApp Message</p>
              <p className="text-xs text-white/40">{user?.full_name || user?.name || "User"} · {phone ? `+${phone}` : "No number"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.40)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Template picker */}
          <div className="relative">
            <button onClick={() => setShowTemplates(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm"
              style={{ background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.25)", color: "white" }}>
              <span className="flex items-center gap-2">
                <span>{currentTpl?.icon}</span>
                <span className="font-semibold">{currentTpl?.label}</span>
              </span>
              <ChevronDown className="w-4 h-4 text-white/40" />
            </button>

            <AnimatePresence>
              {showTemplates && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute z-10 top-full left-0 right-0 mt-1 rounded-xl overflow-hidden"
                  style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: `1px solid ${G.borderHi}` }}>
                  {templates.map(tpl => (
                    <button key={tpl.id} onClick={() => selectTemplate(tpl)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-white/5 transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", color: selected === tpl.id ? "#F5D060" : "rgba(255,255,255,0.70)" }}>
                      <span>{tpl.icon}</span>
                      <span className="font-medium">{tpl.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Editable message */}
          <div>
            <p className="text-xs text-white/40 mb-1.5 font-semibold uppercase tracking-widest">Message</p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={8}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white resize-none outline-none leading-relaxed"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}` }}
            />
          </div>

          {!phone && (
            <div className="rounded-xl border p-3 text-xs text-amber-400/80"
              style={{ background: "rgba(245,158,11,0.07)", borderColor: "rgba(245,158,11,0.30)" }}>
              ⚠️ No phone number on file. WhatsApp will open without a pre-filled recipient — copy the message manually.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t flex gap-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {phone && (
            <a href={`tel:+${phone}`}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa" }}
              title="Call user">
              <Phone className="w-4 h-4" />
            </a>
          )}
          <button onClick={openWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
            style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", color: "white" }}>
            <ExternalLink className="w-4 h-4" />
            Open WhatsApp
          </button>
        </div>
      </motion.div>
    </div>
  );
}