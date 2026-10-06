/**
 * AdminSelectionCard — Card showing a single admin for customer WhatsApp selection.
 * Displays admin name, WhatsApp number, and availability status.
 */
import { MessageCircle, ArrowRight } from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.30)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
};

export default function AdminSelectionCard({ admin, onSelect, disabled }) {
  return (
    <button
      onClick={() => onSelect(admin)}
      disabled={disabled}
      className="w-full rounded-xl border p-4 flex items-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-left"
      style={{ background: G.bg, borderColor: G.border }}
    >
      {/* Avatar */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: "rgba(212,175,55,0.14)",
          border: "1px solid rgba(212,175,55,0.40)",
        }}
      >
        <MessageCircle className="w-5 h-5" style={{ color: G.text }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-inter font-bold text-white text-sm truncate">{admin.full_name}</p>
        <p className="text-xs text-white/50 truncate">{admin.whatsapp_number}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-[9px] text-green-400 font-semibold">Available</span>
        </div>
      </div>

      {/* Arrow */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: "rgba(212,175,55,0.10)",
          border: "1px solid rgba(212,175,55,0.25)",
        }}
      >
        <ArrowRight className="w-4 h-4" style={{ color: G.dim }} />
      </div>
    </button>
  );
}