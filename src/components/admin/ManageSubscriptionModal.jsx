import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarPlus2, Ban, AlertCircle, ChevronDown, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

export default function ManageSubscriptionModal({ subscription, onClose, onSuccess }) {
  const { toast } = useToast();
  const [action, setAction] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [extendDays, setExtendDays] = useState(30);

  const handleAction = async () => {
    setProcessing(true);
    try {
      const payload = { subscription_id: subscription.subscription_id, action };
      if (action === "extend") {
        payload.extend_days = extendDays;
      }

      const res = await base44.functions.invoke("adminManageSubscription", payload);
      
      if (res.data?.success) {
        toast({ title: `✓ ${action === "cancel" ? "Cancelled" : "Extended"}`, description: res.data.message });
        onSuccess();
      } else {
        throw new Error(res.data?.message || "Action failed");
      }
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)" }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-md rounded-2xl p-6 space-y-5"
        style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: `1px solid ${G.borderHi}` }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-inter font-bold text-white text-base">Manage Subscription</h3>
            <p className="text-xs text-white/40 mt-0.5">{subscription.userName || subscription.user_name} · {subscription.page_name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "rgba(255,255,255,0.40)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {!action ? (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setAction("extend")}
              className="p-4 rounded-xl text-center transition-all"
              style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.30)" }}>
              <CalendarPlus2 className="w-5 h-5 mx-auto mb-2" style={{ color: "#4ade80" }} />
              <p className="text-xs font-semibold text-white">Extend</p>
            </button>
            <button onClick={() => setAction("cancel")}
              className="p-4 rounded-xl text-center transition-all"
              style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.30)" }}>
              <Ban className="w-5 h-5 mx-auto mb-2" style={{ color: "#ef4444" }} />
              <p className="text-xs font-semibold text-white">Cancel</p>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setAction(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "rgba(255,255,255,0.40)" }}>
                <ChevronDown className="w-4 h-4 rotate-90" />
              </button>
              <h4 className="font-inter font-bold text-white text-sm capitalize">{action} Subscription</h4>
            </div>


            {action === "extend" && (
              <div>
                <label className="text-xs text-white/45 mb-1 block">Extend By (Days)</label>
                <input type="number" value={extendDays} onChange={e => setExtendDays(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}` }} />
              </div>
            )}

            {action === "cancel" && (
              <div className="rounded-lg border p-3 flex items-start gap-2" style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.30)" }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
                <p className="text-xs text-white/60">
                  This will revoke all associated page permissions. This action cannot be undone.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setAction(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>
                Cancel
              </button>
              <button onClick={handleAction} disabled={processing}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                style={{ background: action === "cancel" ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#f6d860,#c98a14)", color: action === "cancel" ? "white" : "#0d1b2a" }}>
                {processing ? <><Loader2 className="w-4 h-4 inline mr-1 animate-spin" /> Processing…</> : action === "extend" ? "Extend" : "Confirm Cancel"}
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}