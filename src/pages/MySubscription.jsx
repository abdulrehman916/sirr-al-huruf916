import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Clock, CheckCircle, Lock, Star, Crown, Zap, RefreshCw, X, History, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { useToast } from "@/components/ui/use-toast";
import { ROUTE_PERMISSION_MAP } from "@/lib/permissionCodes";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

const PLAN_ICONS = { Basic: Zap, Premium: Star, VIP: Crown };
const PLAN_COLORS = { Basic: "#60a5fa", Premium: "#f59e0b", VIP: "#a855f7" };

const DURATION_OPTIONS = [
  { value: "1_MONTH",   label: "1 Month",  labelShort: "/ mo" },
  { value: "6_MONTHS",  label: "6 Months", labelShort: "/ 6mo" },
  { value: "1_YEAR",    label: "1 Year",   labelShort: "/ yr" },
  { value: "LIFETIME",  label: "Lifetime", labelShort: "" },
];

function fmt(d) {
  if (!d) return "Lifetime";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function daysLeft(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
}

// ── Subscribe Modal ───────────────────────────────────────────────────────────
function SubscribeModal({ plan, onClose, onSuccess }) {
  const { toast } = useToast();
  const [duration, setDuration] = useState("1_MONTH");
  const [processing, setProcessing] = useState(false);

  const priceKey = { "1_MONTH": "price_monthly", "6_MONTHS": "price_6months", "1_YEAR": "price_yearly", "LIFETIME": "price_lifetime" };
  const price = plan[priceKey[duration]];

  const handleSubscribe = () => {
    onClose();
    window.location.href = '/premium/request';
  };

  const PlanIcon = PLAN_ICONS[plan.plan_name] || Star;
  const planColor = PLAN_COLORS[plan.plan_name] || G.text;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)" }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-md rounded-2xl p-6 space-y-5"
        style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: `1px solid ${planColor}55` }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${planColor}18`, border: `1px solid ${planColor}40` }}>
              <PlanIcon className="w-5 h-5" style={{ color: planColor }} />
            </div>
            <div>
              <h3 className="font-inter font-bold text-white text-base">{plan.plan_name} Plan</h3>
              <p className="text-xs text-white/40">{(plan.page_paths || []).length} pages unlocked</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "rgba(255,255,255,0.40)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Duration picker */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: G.dim }}>Choose Duration</p>
          <div className="grid grid-cols-2 gap-2">
            {DURATION_OPTIONS.map(opt => {
              const p = plan[priceKey[opt.value]];
              if (p === undefined || p === null) return null;
              return (
                <button key={opt.value} onClick={() => setDuration(opt.value)}
                  className="p-3 rounded-xl text-left transition-all"
                  style={{
                    background: duration === opt.value ? `${planColor}18` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${duration === opt.value ? planColor + "66" : "rgba(255,255,255,0.08)"}`,
                  }}>
                  <p className="font-inter font-bold text-sm" style={{ color: duration === opt.value ? planColor : "rgba(255,255,255,0.70)" }}>
                    {opt.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: duration === opt.value ? planColor + "bb" : "rgba(255,255,255,0.35)" }}>
                    {p > 0 ? `${plan.currency || "INR"} ${p}` : "Free"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pages included */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: G.dim }}>Includes Access To</p>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
            {(plan.page_paths || []).map(path => {
              const name = ROUTE_PERMISSION_MAP[path]?.name || path;
              return (
                <span key={path} className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ background: `${planColor}12`, color: planColor, border: `1px solid ${planColor}30` }}>
                  {name}
                </span>
              );
            })}
          </div>
        </div>

        <button onClick={handleSubscribe} disabled={processing}
          className="w-full py-3.5 rounded-xl font-inter font-bold text-sm disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, ${planColor}, ${planColor}88)`, color: "#0d1b2a" }}>
          {processing ? "Activating…" : `Subscribe · ${price > 0 ? (plan.currency || "INR") + " " + price : "Free"}`}
        </button>

        <p className="text-xs text-center text-white/25">Access is granted instantly after subscription.</p>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MySubscription() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ subscriptions: [], all_subscriptions: [], permissions: [], plans: [] });
  const [subscribing, setSubscribing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("getUserSubscriptions", {});
      setData(res.data || { subscriptions: [], all_subscriptions: [], permissions: [], plans: [] });
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const { subscriptions, all_subscriptions, permissions, plans } = data;
  const activeSubs = subscriptions;
  const expiredSubs = all_subscriptions.filter(s => s.status !== "ACTIVE" || (s.expiry_date && new Date(s.expiry_date) < new Date()));
  if (loading) return (
    <PageLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
      </div>
    </PageLayout>
  );

  return (
    <PageLayout>
      <PageTitle arabic="اشتراكاتي" latin="My Subscription" subtitle="Plans · Access · Expiry" icon="⭐" />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-10">

        {/* Active subscriptions */}
        {activeSubs.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-inter font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" /> Active Subscriptions
            </h2>
            {activeSubs.map(sub => {
              const days = daysLeft(sub.expiry_date);
              const urgent = days !== null && days < 14;
              return (
                <div key={sub.id} className="rounded-xl border p-4"
                  style={{ background: G.bg, borderColor: urgent ? "rgba(239,68,68,0.40)" : G.borderHi }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-inter font-bold text-white">{sub.page_name}</p>
                      <p className="text-xs text-white/40 mt-0.5">{(sub.plan_name || "").replace(/_/g, " ")}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0"
                      style={{ background: "rgba(34,197,94,0.14)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.30)" }}>
                      ACTIVE
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs flex items-center gap-1.5" style={{ color: urgent ? "#f87171" : "rgba(255,255,255,0.40)" }}>
                      <Clock className="w-3.5 h-3.5" />
                      {sub.expiry_date
                        ? days !== null && days < 36000
                          ? `Expires in ${days} day${days !== 1 ? "s" : ""} · ${fmt(sub.expiry_date)}`
                          : "Lifetime access"
                        : "Lifetime access"}
                    </p>
                    <button onClick={() => setSubscribing(plans.find(p => sub.page_name?.includes(p.plan_name)) || plans[0])}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
                      <RefreshCw className="w-3 h-3" /> Renew
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Unlocked pages */}
        {permissions.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-inter font-bold text-white text-sm flex items-center gap-2">
              <Lock className="w-4 h-4" style={{ color: G.text }} /> My Unlocked Pages
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {permissions.map(perm => {
                const days = daysLeft(perm.expiry_date);
                return (
                  <div key={perm.id} className="rounded-xl border p-3"
                    style={{ background: G.bg, borderColor: G.border }}>
                    <p className="font-inter font-semibold text-white text-sm truncate">{perm.page_name}</p>
                    <p className="text-xs mt-1" style={{ color: days !== null && days < 14 ? "#f87171" : "rgba(255,255,255,0.35)" }}>
                      {days !== null && days < 36000 ? `${days}d left` : "Permanent"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available plans */}
        {plans.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-inter font-bold text-white text-sm">Available Plans</h2>
            <div className="space-y-3">
              {plans.sort((a, b) => (a.sort_order || 9) - (b.sort_order || 9)).map(plan => {
                const PlanIcon = PLAN_ICONS[plan.plan_name] || Star;
                const planColor = plan.color || PLAN_COLORS[plan.plan_name] || G.text;
                return (
                  <div key={plan.plan_id} className="rounded-xl border p-4"
                    style={{ background: G.bg, borderColor: `${planColor}40` }}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${planColor}18`, border: `1px solid ${planColor}35` }}>
                          <PlanIcon className="w-5 h-5" style={{ color: planColor }} />
                        </div>
                        <div>
                          <p className="font-inter font-bold text-white">{plan.plan_name}</p>
                          <p className="text-xs text-white/40 mt-0.5">{(plan.page_paths || []).length} pages</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {plan.price_monthly > 0 && (
                          <p className="text-sm font-bold" style={{ color: planColor }}>
                            {plan.currency || "INR"} {plan.price_monthly}
                            <span className="text-xs font-normal text-white/35"> /mo</span>
                          </p>
                        )}
                        <button onClick={() => setSubscribing(plan)}
                          className="mt-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{ background: `${planColor}18`, border: `1px solid ${planColor}45`, color: planColor }}>
                          Subscribe
                        </button>
                      </div>
                    </div>
                    {plan.description && (
                      <p className="text-xs text-white/35 mt-2 pl-13">{plan.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSubs.length === 0 && permissions.length === 0 && plans.length === 0 && (
          <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.25)" }}>
            <CreditCard className="w-14 h-14 mx-auto mb-4 opacity-20" />
            <p className="text-sm">No subscriptions or plans available yet.</p>
          </div>
        )}

        {/* Expired subscriptions */}
        {expiredSubs.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-inter font-bold text-white/40 text-xs uppercase tracking-widest">Past Subscriptions</h2>
            {expiredSubs.map(sub => (
              <div key={sub.id} className="rounded-xl border p-3 flex items-center justify-between gap-3"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                <div>
                  <p className="font-inter font-semibold text-white/50 text-sm">{sub.page_name}</p>
                  <p className="text-xs text-white/25">{fmt(sub.expiry_date)}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-semibold"
                  style={{ background: "rgba(239,68,68,0.10)", color: "#ef4444" }}>
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        )}

      </motion.div>

      <AnimatePresence>
        {subscribing && (
          <SubscribeModal plan={subscribing} onClose={() => setSubscribing(null)} onSuccess={load} />
        )}
      </AnimatePresence>
    </PageLayout>
  );
}