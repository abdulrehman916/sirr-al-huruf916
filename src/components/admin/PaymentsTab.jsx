import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Clock, Search, AlertCircle, CalendarPlus2, Ban, CheckCircle, Loader2 } from "lucide-react";
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

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function PaymentsTab({ subscriptions, users, onRefresh }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [actionModal, setActionModal] = useState(null); // { sub, action }
  const [processing, setProcessing] = useState(false);
  const [extendDays, setExtendDays] = useState(30);

  const enriched = subscriptions.map(sub => {
    const user = users.find(u => u.id === sub.user_id);
    return { ...sub, userName: user?.full_name || sub.user_name || "Unknown", userEmail: user?.email || sub.user_email || "—" };
  });

  const filtered = search.trim() ? enriched.filter(s => 
    (s.userName || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.userEmail || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.subscription_id || "").toLowerCase().includes(search.toLowerCase())
  ) : enriched;

  const totalRevenue = enriched.reduce((sum, s) => sum + (s.amount || 0), 0);
  const activeRevenue = enriched.filter(s => s.status === "ACTIVE").reduce((sum, s) => sum + (s.amount || 0), 0);


  const handleAction = async () => {
    if (!actionModal?.sub) return;
    setProcessing(true);

    try {
      const payload = {
        subscription_id: actionModal.sub.subscription_id,
        action: actionModal.action,
      };

      if (actionModal.action === "extend") {
        payload.extend_days = extendDays;
      }

      const res = await base44.functions.invoke("adminManageSubscription", payload);

      if (res.data?.success) {
        toast({ title: `✓ ${actionModal.action === "extend" ? "Extended" : "Cancelled"}` });
        onRefresh();
        setActionModal(null);
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
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Revenue", value: enriched[0]?.currency ? `${enriched[0].currency} ${totalRevenue.toLocaleString()}` : totalRevenue.toLocaleString(), color: G.text },
          { label: "Active Revenue", value: enriched[0]?.currency ? `${enriched[0].currency} ${activeRevenue.toLocaleString()}` : activeRevenue.toLocaleString(), color: "#22c55e" },
          { label: "Total Subs", value: enriched.length, color: "#60a5fa" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border p-3 text-center" style={{ background: G.bg, borderColor: G.border }}>
            <p className="text-lg font-bold leading-tight" style={{ color }}>{value}</p>
            <p className="text-xs text-white/35 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: G.dim }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by user, email, or subscription ID…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}` }}
        />
      </div>

      {/* Subscriptions List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.25)" }}>
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No subscriptions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(sub => {
            const statusColor = { ACTIVE: "#22c55e", EXPIRED: "#ef4444", CANCELLED: "#6b7280", PENDING: "#f59e0b" }[sub.status] || "#888";
            return (
              <div key={sub.id} className="rounded-xl border p-4" style={{ background: G.bg, borderColor: G.border }}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-inter font-bold text-white text-sm">{sub.userName}</p>
                    <p className="text-xs text-white/40">{sub.userEmail}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>
                        {sub.page_name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)" }}>
                        {(sub.plan_name || "").replace(/_/g, " ")}
                      </span>
                      {sub.amount > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: "rgba(34,197,94,0.10)", color: "#4ade80" }}>
                          {sub.currency} {sub.amount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}40` }}>
                      {sub.status}
                    </span>
                    <p className="text-xs text-white/35 mt-1.5 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {fmt(sub.expiry_date)}
                    </p>
                    <div className="flex gap-1.5 mt-2 justify-end">
                      <button onClick={() => setActionModal({ sub, action: "extend" })}
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.30)" }}>
                        Extend
                      </button>
                      <button onClick={() => setActionModal({ sub, action: "cancel" })} disabled={sub.status !== "ACTIVE"}
                        className="px-2 py-1 rounded text-xs font-semibold disabled:opacity-50"
                        style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.30)" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Modal */}
      <AnimatePresence>
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.88)" }} onClick={() => setActionModal(null)}>
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-md rounded-2xl p-6 space-y-4"
              style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: `1px solid ${G.borderHi}` }}
              onClick={e => e.stopPropagation()}>
              
              <div className="flex items-center justify-between">
                <h3 className="font-inter font-bold text-white text-base capitalize">{actionModal.action} Subscription</h3>
                <button onClick={() => setActionModal(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "rgba(255,255,255,0.40)" }}>
                  X
                </button>
              </div>

              <p className="text-sm text-white/60">
                {actionModal.sub.userName} · {actionModal.sub.page_name} · {actionModal.sub.subscription_id}
              </p>


              {actionModal.action === "extend" && (
                <div>
                  <label className="text-xs text-white/45 mb-1 block">Extend By (Days)</label>
                  <input type="number" value={extendDays} onChange={e => setExtendDays(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}` }} />
                </div>
              )}

              {actionModal.action === "cancel" && (
                <div className="rounded-lg border p-3 flex items-start gap-2" style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.30)" }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
                  <p className="text-xs text-white/60">
                    This will revoke all associated page permissions. This action cannot be undone.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setActionModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>
                  Cancel
                </button>
                <button onClick={handleAction} disabled={processing}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                  style={{ background: actionModal.action === "cancel" ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#f6d860,#c98a14)", color: actionModal.action === "cancel" ? "white" : "#0d1b2a" }}>
                  {processing ? <><Loader2 className="w-4 h-4 inline mr-1 animate-spin" /> Processing…</> : actionModal.action === "extend" ? "Extend" : "Confirm Cancel"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}