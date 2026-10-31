import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Receipt, RefreshCw, KeyRound, Clock } from "lucide-react";
import { supabase } from "@/api/platformClient";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import RedeemCodeModal from "@/components/RedeemCodeModal";
import { formatResourcePrice } from "@/lib/unifiedAccess";

const G = { border: "rgba(212,175,55,0.35)", text: "#F5D060", bg: "rgba(212,175,55,0.06)" };

const fmt = (value) => value
  ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  : "Lifetime";
const titleOf = (title, fallback) => title?.ml || title?.en || fallback || "Premium page";

export function accessState(item, now = Date.now()) {
  if (item.status === "PENDING") return { label: "Owner approval കാത്തിരിക്കുന്നു", color: "#facc15" };
  if (item.status === "FAILED") return { label: "നിരസിച്ചു", color: "#f87171" };
  if (item.status === "REFUNDED" || item.access_revoked_at) return { label: "Refund ചെയ്തു", color: "#f87171" };
  if (item.access_starts_at && new Date(item.access_starts_at).getTime() > now) return { label: "അടുത്ത കാലാവധി", color: "#60a5fa" };
  if (!item.access_expires_at || new Date(item.access_expires_at).getTime() > now) return { label: "Active", color: "#22c55e" };
  return { label: "കാലാവധി കഴിഞ്ഞു", color: "rgba(255,255,255,0.45)" };
}

/** Customer view: every online purchase with its own access end date, plus gift codes. */
export default function MyPurchases() {
  const [items, setItems] = useState([]);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCode, setShowCode] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [purchases, grants] = await Promise.all([
        supabase.rpc("my_page_purchases"),
        supabase.rpc("legacy_permission_grants"),
      ]);
      if (purchases.error) throw purchases.error;
      setItems(purchases.data || []);
      setCodes((grants.data || []).filter(grant => grant.source !== "PURCHASE"));
    } catch (e) {
      setError(e.message || "വിവരങ്ങൾ load ചെയ്യാൻ കഴിഞ്ഞില്ല.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <PageLayout>
      <PageTitle arabic="مشترياتي" latin="My Purchases" subtitle="വാങ്ങിയ pages · കാലാവധി" icon="🧾" />
      <div className="max-w-xl mx-auto px-4 pb-24 space-y-4">
        <div className="flex gap-2">
          <button onClick={load} className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
            style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => setShowCode(true)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
            style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}>
            <KeyRound className="w-3.5 h-3.5" /> Gift code നൽകുക
          </button>
        </div>

        {error && <p className="text-sm text-red-300" role="alert">{error}</p>}

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white/80 flex items-center gap-2"><Receipt className="w-4 h-4" style={{ color: G.text }} /> Online purchases</h2>
          {!loading && items.length === 0 && <p className="text-xs text-white/45">ഇതുവരെ ഒന്നും വാങ്ങിയിട്ടില്ല.</p>}
          {items.map(item => {
            const state = accessState(item);
            return (
              <div key={item.order_id} className="rounded-xl border p-4" style={{ background: G.bg, borderColor: G.border }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{titleOf(item.page_title, item.route_path)}</p>
                    <p className="text-[11px] text-white/45">{formatResourcePrice({ price_minor: item.total_minor, currency: item.currency })} · {fmt(item.paid_at || item.created_at)}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: state.color }}>{state.label}</span>
                </div>
                {item.status === "PAID" && <p className="mt-2 text-xs text-white/60 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {fmt(item.access_starts_at)} മുതൽ {fmt(item.access_expires_at)} വരെ</p>}
                {item.route_path && state.label === "Active" && (
                  <Link to={item.route_path} className="mt-2 inline-block text-xs font-semibold" style={{ color: G.text }}>Page തുറക്കുക →</Link>
                )}
                {item.provider_payment_id && <p className="mt-1 text-[10px] text-white/30 font-mono">{item.provider_payment_id}</p>}
                {item.status === "FAILED" && item.failure_reason && <p className="mt-1 text-[11px] text-red-300">{item.failure_reason}</p>}
              </div>
            );
          })}
        </section>

        {codes.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-white/80 flex items-center gap-2"><KeyRound className="w-4 h-4" style={{ color: G.text }} /> Gift code access</h2>
            {codes.map((grant, index) => (
              <div key={`${grant.page_path}-${index}`} className="rounded-xl border p-3" style={{ background: G.bg, borderColor: G.border }}>
                <p className="text-sm text-white">{grant.page_name || grant.page_path}</p>
                <p className="text-[11px] text-white/50">{fmt(grant.expiry_date)} വരെ</p>
              </div>
            ))}
          </section>
        )}
      </div>
      {showCode && <RedeemCodeModal onClose={() => { setShowCode(false); load(); }} />}
    </PageLayout>
  );
}
