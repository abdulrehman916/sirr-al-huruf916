import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Phone, Mail, MessageSquare, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getSessionId, getRedeemedCodes } from "@/lib/sessionId";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

export default function RequestAccessModal({ pagePath, pageName, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError("Name, phone and email are required.");
      return;
    }
    setLoading(true);
    try {
      const redeemed = getRedeemedCodes();
      const res = await base44.functions.invoke("submitAccessRequest", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        page_path: pagePath,
        page_name: pageName,
        message: form.message.trim(),
        session_id: getSessionId(),
        existing_code: redeemed.length > 0 ? redeemed[redeemed.length - 1] : null,
      });
      if (res.data.success) {
        setSubmitted(true);
      } else {
        setError(res.data.error || "Failed to submit request.");
      }
    } catch (err) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.80)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{
          background: "linear-gradient(145deg, #0c1630 0%, #060c1c 100%)",
          border: `1px solid ${G.borderHi}`,
          boxShadow: "0 0 60px rgba(212,175,55,0.15)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-inter font-bold text-white text-lg">Request Access</h2>
            <p className="text-xs mt-0.5" style={{ color: G.dim }}>{pageName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.50)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.40)" }}>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="font-inter font-bold text-white text-lg mb-2">Request Submitted!</h3>
            <p className="text-white/60 text-sm mb-6">
              Your request has been sent to the owner. Check your account for access after approval.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-inter font-bold text-sm"
              style={{
                background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)",
                color: "#0d1b2a",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg text-sm text-red-300"
                style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.30)" }}>
                {error}
              </div>
            )}

            <Field icon={User} label="Full Name" placeholder="Your name" required
              value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
            <Field icon={Phone} label="Phone Number" placeholder="+971 50 123 4567" required type="tel"
              value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
            <Field icon={Mail} label="Email Address" placeholder="you@example.com" required type="email"
              value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />

            {/* Message */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: G.dim }}>
                Message (Optional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4" style={{ color: G.dim }} />
                <textarea
                  rows={3}
                  placeholder="Why do you need access?"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 outline-none resize-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${G.border}`,
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm"
                style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-xl font-inter font-bold text-sm flex items-center justify-center gap-2"
                style={{
                  background: loading ? "rgba(212,175,55,0.30)" : "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)",
                  color: "#0d1b2a",
                }}>
                <Send className="w-4 h-4" />
                {loading ? "Sending..." : "Send Request"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, label, placeholder, value, onChange, required, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: G.dim }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: G.dim }} />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${G.border}`,
          }}
        />
      </div>
    </div>
  );
}