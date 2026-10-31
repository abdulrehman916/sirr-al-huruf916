import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Users, KeyRound, Clock, CreditCard, ArrowUpRight, RefreshCw, Plus, Globe, MessageSquare } from "lucide-react";
import { platform } from "@/api/platformClient";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/lib/AuthContext";
import { ADMIN_MAINTENANCE } from "@/lib/adminNavigation";
import { canAccessAdminRoute, isAdminRole } from "@/lib/rbac";

const actions = [
  { to: "/admin/approved-users", label: "Customers", description: "Accounts and customer details", icon: Users },
  { to: "/admin/online-payments", label: "Online payments", description: "Page prices, validity and Razorpay payments", icon: CreditCard },
  { to: "/admin/access-codes", label: "Gift codes & renewals", description: "Create gift codes for family and friends", icon: KeyRound },
  { to: "/admin/page-permissions", label: "Pages & pricing", description: "Set access, prices and durations for pages and child cards", icon: Globe },
  { to: "/admin/support", label: "Customer support", description: "Read and answer support requests", icon: MessageSquare },
];

export default function AdminDashboard() {
  const { role, user, adminProfile, authResolved, adminProfileLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const busy = useRef(false);
  const allowed = (path) => canAccessAdminRoute(role, path, adminProfile);
  const load = useCallback(async () => {
    if (busy.current || !isAdminRole(role)) return;
    busy.current = true;
    setLoading(true);
    setError("");
    try {
      const response = await platform.functions.invoke("getUserStats", {});
      if (!response.data?.success || !response.data?.stats) throw new Error(response.data?.error || "Could not load dashboard");
      setStats(response.data.stats);
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Could not load dashboard");
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, [role]);
  useEffect(() => { if (authResolved && !adminProfileLoading) load(); }, [authResolved, adminProfileLoading, load]);

  if (authResolved && !adminProfileLoading && !isAdminRole(role)) return <Navigate to="/owner-login?redirect=%2Fadmin%2Faccess-dashboard" replace />;
  if (!authResolved || adminProfileLoading) return <AdminLayout><p role="status" className="p-8 text-white/60">Loading dashboard…</p></AdminLayout>;
  const metrics = [
    { label: "Customers", value: stats?.total_users, icon: Users, to: "/admin/approved-users" },
    { label: "Active codes", value: stats?.active_codes, icon: KeyRound, to: "/admin/access-codes" },
    { label: "Expiring in 7 days", value: stats?.expiring_7days, icon: Clock, to: "/admin/access-codes" },
    { label: "Expired codes", value: stats?.expired_codes, icon: Clock, to: "/admin/access-codes" },
  ].filter(item => allowed(item.to));
  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-7 pb-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-200/60 mb-2">Sirr al-Huruf</p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white">{role === "owner" ? "Owner dashboard" : "Dashboard"}</h1>
            <p className="text-sm text-white/50 mt-2 break-all">{user?.email}</p>
          </div>
          <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/75 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />Refresh
          </button>
        </header>
        {error && <div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">{error} <button onClick={load} className="underline ml-2">Try again</button></div>}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" aria-busy={loading}>
          {metrics.map(item => <Link key={item.label} to={item.to} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5 hover:border-amber-200/35 transition-colors">
            <item.icon className="w-5 h-5 text-amber-200/75 mb-4" />
            <p className="text-2xl sm:text-3xl font-semibold text-white">{item.value == null ? "—" : item.value.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-white/55 mt-2">{item.label}</p>
          </Link>)}
        </div>
        <section className="rounded-2xl border border-amber-200/20 bg-gradient-to-br from-amber-200/[0.07] to-transparent p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><h2 className="text-lg font-semibold text-white">Manage customer access</h2><p className="text-sm text-white/55 mt-2 max-w-xl">Create a code for the customer's sign-in email, select pages and duration, then share the code after confirming payment.</p></div>
            {allowed("/admin/access-codes") && <Link to="/admin/access-codes" className="inline-flex items-center gap-2 rounded-xl bg-amber-200 px-4 py-3 text-sm font-semibold text-slate-950"><Plus className="w-4 h-4" />Manage codes</Link>}
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Daily tasks</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {actions.filter(item => allowed(item.to)).map(item => <Link key={item.to} to={item.to} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 hover:bg-white/[0.055] transition-colors">
              <div className="flex items-center justify-between"><item.icon className="w-5 h-5 text-amber-200/80" /><ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-amber-200" /></div>
              <h3 className="text-sm font-semibold text-white mt-4">{item.label}</h3><p className="text-xs text-white/50 mt-2 leading-relaxed">{item.description}</p>
            </Link>)}
          </div>
        </section>
        {allowed("/admin/access-codes") && <section className="rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between gap-3 mb-4"><h2 className="text-lg font-semibold text-white">Renewals due</h2><Link to="/admin/access-codes" className="text-sm text-amber-200">View codes</Link></div>
          {!stats ? <p className="text-sm text-white/50">{loading ? "Loading…" : "No data available"}</p> : !stats.renewals_due?.length ? <p className="text-sm text-white/50">No page access expires within the next 7 days.</p> : <div className="space-y-3">{stats.renewals_due.map((item, i) => <Link key={item.id + ':' + i} to={"/admin/access-codes/" + item.id} className="flex flex-wrap justify-between items-center gap-3 rounded-xl bg-white/[0.035] p-4"><div className="min-w-0"><p className="text-sm text-white break-all">{item.email || item.code}</p><p className="text-xs text-white/50 mt-1">{item.page} · {item.code}</p></div><div className="text-xs text-amber-200">{new Date(item.expiry).toLocaleString()} · Renew →</div></Link>)}</div>}
        </section>}
        {allowed("/admin/access-codes") && stats?.page_summary?.length > 0 && <details className="rounded-2xl border border-white/10 p-5"><summary className="cursor-pointer text-sm font-semibold text-white">Customers and codes by page</summary><div className="overflow-x-auto mt-4"><table className="w-full text-sm text-left"><thead className="text-white/50"><tr><th className="p-2">Page</th><th className="p-2">Customers</th><th className="p-2">Codes</th><th className="p-2">Renewals due</th></tr></thead><tbody>{stats.page_summary.map(page => <tr key={page.path} className="border-t border-white/10 text-white/80"><td className="p-2">{page.name}</td><td className="p-2">{page.customers}</td><td className="p-2">{page.codes}</td><td className="p-2">{page.expiring}</td></tr>)}</tbody></table></div></details>}
        <details className="rounded-2xl border border-white/10 p-5">
          <summary className="cursor-pointer text-sm font-semibold text-white">Settings & maintenance</summary>
          {ADMIN_MAINTENANCE.map(section => {
            const links = section.items.filter(item => allowed(item.path));
            return links.length ? <section key={section.label} className="mt-5"><h2 className="text-sm text-white/65 mb-3">{section.label}</h2><div className="grid sm:grid-cols-2 gap-3">{links.map(item => <Link key={item.path} to={item.path} className="rounded-xl border border-white/10 p-4 text-white/85"><span className="text-sm font-semibold">{item.label}</span><p className="text-xs text-white/50 mt-2">{item.description}</p></Link>)}</div></section> : null;
          })}
        </details>
        {updatedAt && <p className="text-xs text-white/35">Last updated: {updatedAt.toLocaleTimeString()}</p>}
      </div>
    </AdminLayout>
  );
}
