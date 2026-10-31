import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { CreditCard, RefreshCw, Save, Search } from "lucide-react";
import { supabase } from "@/api/platformClient";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/lib/AuthContext";
import { isAdminRole } from "@/lib/rbac";
import ROUTE_MANIFEST from "@/lib/routeManifest";
import { getPageConfig } from "@/lib/pageRegistry";
import { formatResourcePrice } from "@/lib/unifiedAccess";

const G = { border: "rgba(212,175,55,0.35)", text: "#F5D060", bg: "rgba(212,175,55,0.06)" };
const VALIDITY = [
  { label: "1 ദിവസം", days: 1 }, { label: "7 ദിവസം", days: 7 }, { label: "1 മാസം", days: 30 },
  { label: "3 മാസം", days: 90 }, { label: "6 മാസം", days: 180 }, { label: "1 വർഷം", days: 365 },
];
const EXCLUDED = new Set(["/", "/rules-conditions", "/mizan-completion-test", "/subscription/expired", "/subscription/pending"]);

/** Content routes the owner may sell. Parameter routes follow their parent page. */
export function sellableRoutes(manifest = ROUTE_MANIFEST) {
  return manifest.filter(route => !route.path.startsWith("/admin")
    && !route.path.includes(":") && !EXCLUDED.has(route.path)
    && !route.flags?.includes("noauth") && !route.flags?.includes("account"))
    .map(route => ({ path: route.path, name: getPageConfig(route.path)?.name || route.component, isPublic: route.flags?.includes("public") }));
}

/** Turns database errors into plain Malayalam for the owner. */
export function ownerMessage(error) {
  const text = String(error?.message || error || "");
  if (/Could not find the function|PGRST202|does not exist/i.test(text)) {
    return "Database update (migration) ഇനിയും ചെയ്തിട്ടില്ല. അത് ചെയ്ത ശേഷം ഈ page പ്രവർത്തിക്കും.";
  }
  if (/Owner access required/i.test(text)) return "Owner account-ൽ login ചെയ്യുക.";
  if (/Price must be/i.test(text)) return "വില ₹1 മുതൽ ₹5,00,000 വരെ ആയിരിക്കണം.";
  if (/Validity must be/i.test(text)) return "കാലാവധി 1 മുതൽ 3650 ദിവസം വരെ ആയിരിക്കണം.";
  return text || "എന്തോ പിശക് സംഭവിച്ചു.";
}

const SETUP_ROWS = [
  ["supabase_url", "SUPABASE_URL"],
  ["supabase_service_role_key", "SUPABASE_SERVICE_ROLE_KEY"],
  ["razorpay_key_id", "RAZORPAY_KEY_ID"],
  ["razorpay_key_secret", "RAZORPAY_KEY_SECRET"],
  ["razorpay_webhook_secret", "RAZORPAY_WEBHOOK_SECRET (പിന്നീട്)"],
];

function SetupStatus() {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/payments/status").then(r => r.ok ? r.json() : null).catch(() => null)
      .then(data => { if (alive) setStatus(data || { unavailable: true }); });
    return () => { alive = false; };
  }, []);
  if (!status) return null;
  if (status.unavailable) return <p className="text-[11px] text-white/45">Payment server-ന്റെ നില പരിശോധിക്കാൻ കഴിഞ്ഞില്ല.</p>;
  const ok = (key) => key === "razorpay_key_id" ? status[key] === "test" || status[key] === "live" : status[key] === true;
  return (
    <section className="rounded-xl border p-3 space-y-2" style={{ background: G.bg, borderColor: status.ready ? "rgba(34,197,94,0.45)" : "rgba(239,68,68,0.45)" }}>
      <h2 className="text-sm font-semibold text-white">
        {status.ready ? "✅ Payment സജ്ജമാണ്" : "⚠️ Payment ഇനിയും സജ്ജമല്ല"}
        {status.razorpay_key_id === "test" && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(96,165,250,0.18)", color: "#93c5fd" }}>TEST MODE — യഥാർത്ഥ പണം ഇല്ല</span>}
        {status.razorpay_key_id === "live" && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.18)", color: "#86efac" }}>LIVE</span>}
      </h2>
      <ul className="grid sm:grid-cols-2 gap-1 text-[11px] text-white/70">
        {SETUP_ROWS.map(([key, label]) => (
          <li key={key}>{ok(key) ? "✅" : "❌"} <span className="font-mono">{label}</span></li>
        ))}
      </ul>
      {!status.ready && (
        <p className="text-[11px] text-white/55">❌ ഉള്ളവ Vercel → Settings → Environment Variables-ൽ ചേർക്കുക (ഈ site-ന്റെ ശരിയായ environment tick ചെയ്ത്), പിന്നെ Redeploy ചെയ്യുക. വിശദമായി: docs/RAZORPAY_SETUP_ML.md</p>
      )}
    </section>
  );
}

const fmt = (value) => value ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

function PriceRow({ route, current, onSaved }) {
  const [price, setPrice] = useState(current ? String(current.price_minor / 100) : "");
  const [days, setDays] = useState(current?.validity_days || 30);
  const [custom, setCustom] = useState(Boolean(current?.validity_days) && !VALIDITY.some(v => v.days === current?.validity_days));
  const [lifetime, setLifetime] = useState(Boolean(current?.lifetime_access));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const onSale = Boolean(current?.on_sale);

  const save = async (sell) => {
    setSaving(true);
    setMessage("");
    try {
      const rupees = Number(price);
      if (sell && (!Number.isFinite(rupees) || rupees < 1 || rupees > 500000)) throw new Error("വില ₹1 മുതൽ ₹5,00,000 വരെ ആയിരിക്കണം.");
      if (sell && !lifetime && (!Number.isInteger(Number(days)) || days < 1 || days > 3650)) throw new Error("കാലാവധി 1 മുതൽ 3650 ദിവസം വരെ ആയിരിക്കണം.");
      const { error } = await supabase.rpc("owner_set_page_price", { p_payload: {
        route_path: route.path, title: route.name, price_minor: sell ? Math.round(rupees * 100) : null,
        validity_days: lifetime ? null : Number(days), lifetime_access: lifetime, on_sale: sell,
      } });
      if (error) throw error;
      setMessage(sell ? "Save ചെയ്തു — വിൽപ്പനയിലുണ്ട്." : "വിൽപ്പന നിർത്തി.");
      onSaved();
    } catch (e) {
      setMessage(ownerMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border p-3 space-y-2" style={{ background: G.bg, borderColor: onSale ? "rgba(34,197,94,0.45)" : G.border }}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{route.name}</p>
          <p className="text-[10px] text-white/40 font-mono">{route.path}{route.isPublic ? " · ഇപ്പോൾ free page" : ""}</p>
        </div>
        <span className="text-[10px] font-bold uppercase" style={{ color: onSale ? "#22c55e" : "rgba(255,255,255,0.4)" }}>
          {onSale ? `വിൽപ്പനയിൽ · ${formatResourcePrice(current)}` : "വിൽപ്പനയിലില്ല"}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-white/60 flex items-center gap-1">₹
          <input type="number" min="1" step="1" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)}
            className="w-24 px-2 py-1.5 rounded-lg text-sm text-white bg-white/5 border" style={{ borderColor: G.border }} aria-label={`${route.name} price`} />
        </label>
        <select value={lifetime ? "LIFETIME" : custom ? "CUSTOM" : String(days)} onChange={e => {
          const value = e.target.value;
          if (value === "LIFETIME") { setLifetime(true); setCustom(false); }
          else if (value === "CUSTOM") { setLifetime(false); setCustom(true); }
          else { setLifetime(false); setCustom(false); setDays(Number(value)); }
        }} className="px-2 py-1.5 rounded-lg text-sm text-white bg-[#0b1426] border" style={{ borderColor: G.border }} aria-label={`${route.name} validity`}>
          {VALIDITY.map(v => <option key={v.days} value={v.days}>{v.label}</option>)}
          <option value="CUSTOM">ഇഷ്ടമുള്ള ദിവസം…</option>
          <option value="LIFETIME">Lifetime</option>
        </select>
        {custom && !lifetime && (
          <label className="text-xs text-white/60 flex items-center gap-1">
            <input type="number" min="1" max="3650" step="1" value={days} onChange={e => setDays(Number(e.target.value))}
              className="w-20 px-2 py-1.5 rounded-lg text-sm text-white bg-white/5 border" style={{ borderColor: G.border }} aria-label={`${route.name} days`} /> ദിവസം
          </label>
        )}
        <button disabled={saving} onClick={() => save(true)} className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#f6d860,#c98a14)", color: "#0d1b2a" }}>
          <Save className="w-3.5 h-3.5" /> {onSale ? "Update" : "വിൽക്കുക"}
        </button>
        {onSale && <button disabled={saving} onClick={() => save(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border disabled:opacity-50"
          style={{ borderColor: "rgba(239,68,68,0.4)", color: "#fca5a5" }}>വിൽപ്പന നിർത്തുക</button>}
      </div>
      {message && <p className="text-[11px] text-white/60" role="status">{message}</p>}
    </div>
  );
}

export default function AdminOnlinePayments() {
  const { role, authResolved, adminProfileLoading } = useAuth();
  const [prices, setPrices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("PAID");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [error, setError] = useState("");
  const routes = useMemo(() => sellableRoutes(), []);
  const priceByPath = useMemo(() => Object.fromEntries(prices.map(p => [p.route_path, p])), [prices]);

  const loadPrices = useCallback(async () => {
    const { data, error: rpcError } = await supabase.rpc("owner_page_prices");
    if (rpcError) throw rpcError;
    setPrices(data || []);
  }, []);

  const loadOrders = useCallback(async (append = false, cursor = null) => {
    const { data, error: rpcError } = await supabase.rpc("owner_payment_orders", { p_payload: {
      status, search, limit: 50,
      before_created_at: cursor?.created_at || null, before_id: cursor?.id || null,
    } });
    if (rpcError) throw rpcError;
    const page = data?.orders || [];
    setOrders(prev => append ? [...prev, ...page] : page);
    setMore(page.length === 50);
  }, [status, search]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try { await Promise.all([loadPrices(), loadOrders()]); }
    catch (e) { setError(ownerMessage(e)); }
    finally { setLoading(false); }
  }, [loadPrices, loadOrders]);

  useEffect(() => { if (authResolved && !adminProfileLoading && role === "owner") reload(); }, [authResolved, adminProfileLoading, role, reload]);

  if (authResolved && !adminProfileLoading && !isAdminRole(role)) return <Navigate to="/owner-login?redirect=%2Fadmin%2Fonline-payments" replace />;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white flex items-center gap-2"><CreditCard className="w-6 h-6" style={{ color: G.text }} /> Online payments</h1>
            <p className="text-xs text-white/50 mt-1">ഓരോ page-നും വിലയും കാലാവധിയും. പണം Razorpay വഴി ലഭിച്ച ശേഷം മാത്രം ആ page ആ customer-ന് തുറക്കും.</p>
          </div>
          <button onClick={reload} className="px-3 py-2 rounded-lg text-xs border flex items-center gap-1" style={{ borderColor: G.border, color: G.text }}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </header>
        <SetupStatus />
        {error && <p className="text-sm text-red-300" role="alert">{error}</p>}

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white/80">Page വിലകൾ</h2>
          <p className="text-[11px] text-white/45">ഒരു free page-ന് വില വെച്ചാൽ ആ page പൂട്ടും. Gift codes പഴയതുപോലെ പ്രവർത്തിക്കും.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {routes.map(route => (
              <PriceRow key={`${route.path}:${priceByPath[route.path]?.updated_at || "new"}`} route={route}
                current={priceByPath[route.path]} onSaved={loadPrices} />
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-white/80 mr-auto">Payments</h2>
            <select value={status} onChange={e => setStatus(e.target.value)} className="px-2 py-1.5 rounded-lg text-xs text-white bg-[#0b1426] border" style={{ borderColor: G.border }}>
              <option value="PAID">Paid</option><option value="PENDING">Pending / failed</option><option value="REFUNDED">Refunded</option><option value="">എല്ലാം</option>
            </select>
            <form onSubmit={e => { e.preventDefault(); reload(); }} className="flex items-center gap-1">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="email / pay_…" className="px-2 py-1.5 rounded-lg text-xs text-white bg-white/5 border w-40" style={{ borderColor: G.border }} />
              <button className="p-1.5 rounded-lg border" style={{ borderColor: G.border, color: G.text }} aria-label="Search"><Search className="w-3.5 h-3.5" /></button>
            </form>
          </div>
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: G.border }}>
            <table className="w-full text-xs text-white/80">
              <thead className="text-white/45 text-left"><tr>
                <th className="p-2">Date</th><th className="p-2">Email</th><th className="p-2">Page</th><th className="p-2">Amount</th><th className="p-2">Status</th><th className="p-2">Access ends</th>
              </tr></thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <td className="p-2 whitespace-nowrap">{fmt(order.paid_at || order.created_at)}</td>
                    <td className="p-2">{order.customer_email}</td>
                    <td className="p-2">{order.page_title?.ml || order.page_title?.en || order.route_path}</td>
                    <td className="p-2 whitespace-nowrap">{formatResourcePrice({ price_minor: order.total_minor, currency: order.currency })}</td>
                    <td className="p-2">{order.status}{order.failure_reason ? ` · ${order.failure_reason}` : ""}</td>
                    <td className="p-2 whitespace-nowrap">{order.status === "PAID" ? (order.access_expires_at ? fmt(order.access_expires_at) : "Lifetime") : "—"}</td>
                  </tr>
                ))}
                {!loading && orders.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-white/40">Payments ഇല്ല.</td></tr>}
              </tbody>
            </table>
          </div>
          {more && <button onClick={() => loadOrders(true, orders[orders.length - 1]).catch(e => setError(ownerMessage(e)))}
            className="w-full py-2 rounded-lg text-xs border" style={{ borderColor: G.border, color: G.text }}>കൂടുതൽ കാണിക്കുക</button>}
        </section>
      </div>
    </AdminLayout>
  );
}
