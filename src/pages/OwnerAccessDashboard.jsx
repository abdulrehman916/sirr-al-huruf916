import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Users, CreditCard, Globe, Shield, Search, Plus, Trash2, Smartphone,
  CheckCircle, X, Clock, Lock, ChevronDown, ChevronUp,
  Phone, Mail, Calendar, Crown, RefreshCw, Star, Zap,
  DollarSign, TrendingUp, Edit2, Save, AlertCircle,
  Ban, CalendarPlus2, MessageSquare, KeyRound, UserCheck, Link2
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { useToast } from "@/components/ui/use-toast";
import { getContentPages, getAllRegisteredPages, getAdminVisiblePages as getVisibleContentPages } from "@/lib/pageRegistry";
import PaymentsTab from "@/components/admin/PaymentsTab";
import AccessCodesTab from "@/components/admin/AccessCodesTab";
import ManageSubscriptionModal from "@/components/admin/ManageSubscriptionModal";
import MessagesTab from "@/components/admin/MessagesTab";
import SubscriptionRequestsTab from "@/components/admin/SubscriptionRequestsTab";
import UsersManagementTab from "@/components/admin/UsersManagementTab";
import GoogleUsersTab from "@/components/admin/GoogleUsersTab";
import SecurityAuditTab from "@/components/admin/SecurityAuditTab";
import { Link } from "react-router-dom";
import { ADMIN_CONFIG } from "@/lib/adminConfig";
import { useAuth } from "@/lib/AuthContext";
import GoogleLinkingPanel from "@/components/admin/GoogleLinkingPanel";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
  card: "linear-gradient(145deg,rgba(12,22,48,0.98),rgba(6,12,28,0.99))",
};

const DURATION_OPTIONS = [
  { value: "1_HOUR",    label: "1 Hour",     duration_ms: 3600000 },
  { value: "1_DAY",     label: "1 Day",      duration_ms: 86400000 },
  { value: "7_DAYS",    label: "7 Days",     duration_ms: 604800000 },
  { value: "1_MONTH",   label: "1 Month",    days: 30 },
  { value: "3_MONTHS",   label: "3 Months",   days: 90 },
  { value: "6_MONTHS",   label: "6 Months",   days: 180 },
  { value: "12_MONTHS",  label: "12 Months",  days: 365 },
  { value: "LIFETIME",   label: "Lifetime",   days: 36500 },
];

// Only content pages (non-admin) for the owner UI — from dynamic registry
// Must be a function to always use the latest registry (not a cached module constant)
function getContentPageList() {
  return getContentPages().map(p => ({ path: p.path, name: p.name, code: p.code }));
}

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function isExp(d) { return d && new Date(d) < new Date(); }
function daysLeft(d) {
  if (!d) return null;
  const diff = new Date(d) - new Date();
  return Math.ceil(diff / 86400000);
}

const TABS = [
  { id: "users",       label: "Users",            icon: Users },
  { id: "google-users", label: "Google Users",    icon: UserCheck },
  { id: "subs",        label: "Subscriptions",    icon: CreditCard },
  { id: "payments",    label: "Payments",         icon: TrendingUp },
  { id: "plans",       label: "Plans",            icon: Star },

  { id: "requests",    label: "Access Requests",  icon: Mail },
  { id: "messages",    label: "Messages",         icon: MessageSquare },
  { id: "visibility",  label: "Page Visibility",  icon: Globe },
  { id: "access",      label: "User Access",      icon: Shield },
  { id: "codes",       label: "Access Codes",     icon: KeyRound },
  { id: "security",    label: "Security Audit",   icon: Shield },
  { id: "google",      label: "Google Linked",    icon: Link2 },
];

const PLAN_COLORS = { Basic: "#60a5fa", Premium: "#f59e0b", Pro: "#a855f7", Ultimate: "#ec4899" };
const PLAN_ICONS_MAP = { Basic: Zap, Premium: Star, Pro: Crown, Ultimate: Crown };

// ── Grant Access Modal ────────────────────────────────────────────────────────
function GrantAccessModal({ user, existingPaths, onClose, onGranted }) {
  const { toast } = useToast();
  const [selectedPages, setSelectedPages] = useState([]);
  const [duration, setDuration] = useState("1_MONTH");
  const [processing, setProcessing] = useState(false);

  const toggle = (path) =>
    setSelectedPages(p => p.includes(path) ? p.filter(x => x !== path) : [...p, path]);

  const handleGrant = async () => {
    if (selectedPages.length === 0) {
      toast({ title: "Select at least one page", variant: "destructive" }); return;
    }
    setProcessing(true);
    const dur = DURATION_OPTIONS.find(d => d.value === duration);
    const now = new Date();
    const expiry = dur.value === "LIFETIME" ? null : new Date(now.getTime() + (dur.duration_ms ?? dur.days * 86400000)).toISOString();
    let granted = 0;
    for (const path of selectedPages) {
      const page = getContentPageList().find(p => p.path === path);
      if (!page) continue;
      try {
        const result = await base44.functions.invoke("grantPagePermission", {
          user_id: user.id,
          page_path: page.path,
          page_name: page.name,
          permission_code: page.code,
          start_date: now.toISOString(),
          expiry_date: expiry,
        });
        if (!result.data?.success) throw new Error("Grant was not saved");
        granted++;
      } catch (error) {
        toast({ title: `Could not grant ${page.name}`, description: error.message, variant: "destructive" });
      }
    }
    setProcessing(false);
    if (granted > 0) {
      toast({ title: `✓ Granted ${granted} page(s) to ${user.full_name || user.email}` });
      onGranted(); onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-lg rounded-2xl p-6 space-y-5"
        style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: `1px solid ${G.borderHi}` }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-inter font-bold text-white text-base">Grant Page Access</h3>
            <p className="text-xs text-white/45 mt-0.5">{user.full_name || "User"} · {user.email}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "rgba(255,255,255,0.40)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Duration picker */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: G.dim }}>Access Duration</p>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setDuration(opt.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: duration === opt.value ? G.bgHi : "rgba(255,255,255,0.04)",
                  border: `1px solid ${duration === opt.value ? G.borderHi : "rgba(255,255,255,0.08)"}`,
                  color: duration === opt.value ? G.text : "rgba(255,255,255,0.55)",
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Page picker */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: G.dim }}>
            Select Pages ({selectedPages.length} selected)
          </p>
          <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
            {getContentPageList().map(page => {
              const sel = selectedPages.includes(page.path);
              const has = existingPaths.includes(page.path);
              return (
                <button key={page.path} onClick={() => !has && toggle(page.path)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all"
                  style={{
                    background: sel ? G.bgHi : "rgba(255,255,255,0.02)",
                    border: `1px solid ${sel ? G.borderHi : "rgba(255,255,255,0.05)"}`,
                    opacity: has ? 0.4 : 1,
                    cursor: has ? "not-allowed" : "pointer",
                  }}>
                  <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: sel ? G.text : "transparent", border: `1px solid ${sel ? G.text : "rgba(255,255,255,0.25)"}` }}>
                    {sel && <CheckCircle className="w-3 h-3 text-black" />}
                  </div>
                  <span className="font-inter text-sm flex-1" style={{ color: sel ? "white" : "rgba(255,255,255,0.65)" }}>{page.name}</span>
                  {has && <span className="text-xs text-green-400 flex-shrink-0">Already active</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm"
            style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>
            Cancel
          </button>
          <button onClick={handleGrant} disabled={processing || selectedPages.length === 0}
            className="flex-1 py-3 rounded-xl font-inter font-bold text-sm disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#f6d860,#c98a14)", color: "#0d1b2a" }}>
            {processing ? "Granting…" : `Grant ${selectedPages.length > 0 ? selectedPages.length + " Page(s)" : "Access"}`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Extend Access Modal ──────────────────────────────────────────────────────
function ExtendAccessModal({ permission, onClose, onExtended }) {
  const { toast } = useToast();
  const [duration, setDuration] = useState("1_MONTH");
  const [processing, setProcessing] = useState(false);

  const handleExtend = async () => {
    setProcessing(true);
    const dur = DURATION_OPTIONS.find(d => d.value === duration);
    const newExpiry = dur.value === "LIFETIME" ? null : new Date(Date.now() + (dur.duration_ms ?? dur.days * 86400000)).toISOString();
    try {
      await base44.functions.invoke("extendPermissionExpiry", {
        permission_id: permission.permission_id,
        new_expiry_date: newExpiry,
        extended_by: (await base44.auth.me()).id,
      });
      toast({ title: `✓ Extended "${permission.page_name}" by ${dur.label}` });
      onExtended();
      onClose();
    } catch (e) {
      toast({ title: "Extend failed", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-sm rounded-2xl p-6 space-y-5"
        style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: `1px solid ${G.borderHi}` }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-inter font-bold text-white text-base">Extend Access</h3>
            <p className="text-xs text-white/45 mt-0.5">{permission.page_name} · expires {fmt(permission.expiry_date)}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "rgba(255,255,255,0.40)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: G.dim }}>New Duration</p>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setDuration(opt.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: duration === opt.value ? G.bgHi : "rgba(255,255,255,0.04)",
                  border: `1px solid ${duration === opt.value ? G.borderHi : "rgba(255,255,255,0.08)"}`,
                  color: duration === opt.value ? G.text : "rgba(255,255,255,0.55)",
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm"
            style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>
            Cancel
          </button>
          <button onClick={handleExtend} disabled={processing}
            className="flex-1 py-3 rounded-xl font-inter font-bold text-sm disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#f6d860,#c98a14)", color: "#0d1b2a" }}>
            {processing ? "Extending…" : "Extend Access"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// UsersTab replaced by UsersManagementTab (imported component)

// ── Subscriptions Tab ─────────────────────────────────────────────────────────
function SubscriptionsTab({ subscriptions, users }) {
  const [filter, setFilter] = useState("ACTIVE");

  const enriched = useMemo(() => subscriptions.map(sub => {
    const user = users.find(u => u.id === sub.user_id);
    return { ...sub, userName: user?.full_name || sub.user_name || "Unknown", userEmail: user?.email || sub.user_email || "—" };
  }), [subscriptions, users]);

  const filtered = filter === "all" ? enriched : enriched.filter(s => s.status === filter);
  const counts = {
    ACTIVE: enriched.filter(s => s.status === "ACTIVE").length,
    EXPIRED: enriched.filter(s => s.status === "EXPIRED").length,
    PENDING: enriched.filter(s => s.status === "PENDING").length,
  };
  const totalRevenue = enriched.reduce((sum, s) => sum + (s.amount || 0), 0);
  const activeRevenue = enriched.filter(s => s.status === "ACTIVE").reduce((sum, s) => sum + (s.amount || 0), 0);
  const statusColor = { ACTIVE: "#22c55e", EXPIRED: "#ef4444", PENDING: "#f59e0b", CANCELLED: "#6b7280" };

  // Expiring within 7 days
  const expiringSoon = enriched.filter(s => {
    if (s.status !== "ACTIVE" || !s.expiry_date) return false;
    const d = daysLeft(s.expiry_date);
    return d !== null && d <= 7 && d >= 0;
  });

  return (
    <div className="space-y-4">
      {/* Legacy notice */}
      <div className="rounded-xl border p-3 flex items-start gap-2"
        style={{ background: "rgba(245,158,11,0.07)", borderColor: "rgba(245,158,11,0.30)" }}>
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
        <p className="text-xs text-amber-400/80">
          <span className="font-bold">Legacy data only.</span> This tab shows historical Stripe/Razorpay records from the old payment system. New access granted via Access Codes does not appear here — use the <span className="font-bold">User Access</span> tab to see current active permissions.
        </p>
      </div>
      {/* Revenue + summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: `${totalRevenue.toLocaleString()}`, icon: DollarSign, color: G.text },
          { label: "Active Revenue", value: `${activeRevenue.toLocaleString()}`, icon: TrendingUp, color: "#22c55e" },
          { label: "Active Subs", value: counts.ACTIVE, icon: CreditCard, color: "#60a5fa" },
          { label: "Expiring ≤7d", value: expiringSoon.length, icon: Clock, color: expiringSoon.length > 0 ? "#f59e0b" : "rgba(255,255,255,0.30)" },
        ].map(({ label, value, icon: StatIcon, color }) => (
          <div key={label} className="rounded-xl border p-3 text-center" style={{ background: G.bg, borderColor: G.border }}>
            <StatIcon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
            <p className="text-lg font-bold leading-tight" style={{ color }}>{value}</p>
            <p className="text-xs text-white/35 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Expiring soon warning */}
      {expiringSoon.length > 0 && (
        <div className="rounded-xl border p-3" style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.35)" }}>
          <p className="text-xs font-semibold text-amber-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> {expiringSoon.length} subscription(s) expiring within 7 days
          </p>
          <div className="mt-2 space-y-1">
            {expiringSoon.map(s => (
              <p key={s.id} className="text-xs text-white/50">
                {s.userName} · {s.page_name} · {daysLeft(s.expiry_date)}d left
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["ACTIVE", "EXPIRED", "PENDING", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{
              background: filter === f ? G.bgHi : "rgba(255,255,255,0.04)",
              border: `1px solid ${filter === f ? G.borderHi : "rgba(255,255,255,0.08)"}`,
              color: filter === f ? G.text : "rgba(255,255,255,0.45)",
            }}>
            {f === "all" ? `All (${enriched.length})` : `${f.charAt(0) + f.slice(1).toLowerCase()} (${counts[f] || 0})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.25)" }}>
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No subscriptions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(sub => {
            const days = daysLeft(sub.expiry_date);
            const urgent = sub.status === "ACTIVE" && days !== null && days <= 7;
            return (
              <div key={sub.id} className="rounded-xl border p-4"
                style={{ background: G.bg, borderColor: urgent ? "rgba(245,158,11,0.45)" : G.border }}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-inter font-bold text-white text-sm">{sub.userName}</p>
                    <p className="text-xs text-white/40">{sub.userEmail}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>
                        {sub.page_name || sub.page_path}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)" }}>
                        {(sub.plan_name || "").replace(/_/g, " ")}
                      </span>
                      {sub.amount > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold"
                          style={{ background: "rgba(34,197,94,0.10)", color: "#4ade80" }}>
                          {sub.currency || "INR"} {sub.amount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                      style={{
                        background: `${statusColor[sub.status] || "#666"}18`,
                        color: statusColor[sub.status] || "#888",
                        border: `1px solid ${statusColor[sub.status] || "#666"}40`,
                      }}>
                      {sub.status}
                    </span>
                    <p className="text-xs text-white/35 mt-1.5 flex items-center gap-1 justify-end"
                      style={{ color: urgent ? "#f59e0b" : undefined }}>
                      <Clock className="w-3 h-3" />
                      {sub.expiry_date
                        ? days !== null && days < 36000
                          ? `${days}d left · ${fmt(sub.expiry_date)}`
                          : fmt(sub.expiry_date)
                        : "Lifetime"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Plans Tab (owner configures Basic/Premium/VIP) ────────────────────────────
function PlansTab({ plans, onRefresh }) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({});
  const [creating, setCreating] = useState(false);
  const [newPlan, setNewPlan] = useState({ plan_name: "Basic", description: "", price_monthly: 0, price_6months: 0, price_yearly: 0, price_lifetime: 0, currency: "INR", page_paths: [], color: "#60a5fa", sort_order: 1 });
  const [newPages, setNewPages] = useState([]);

  const startEdit = (plan) => {
    setEditingId(plan.id);
    setEditData({ ...plan });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await base44.entities.SubscriptionPlan.update(editingId, editData);
      toast({ title: "✓ Plan updated" });
      setEditingId(null);
      onRefresh();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleEditPage = (path) => {
    const cur = editData.page_paths || [];
    setEditData(d => ({ ...d, page_paths: cur.includes(path) ? cur.filter(p => p !== path) : [...cur, path] }));
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const planId = "PLAN_" + newPlan.plan_name.toUpperCase() + "_" + Date.now();
      await base44.entities.SubscriptionPlan.create({
        ...newPlan,
        plan_id: planId,
        page_paths: newPages,
        is_active: true,
      });
      toast({ title: "✓ Plan created" });
      setCreating(false);
      setNewPlan({ plan_name: "Basic", description: "", price_monthly: 0, price_6months: 0, price_yearly: 0, price_lifetime: 0, currency: "INR", page_paths: [], color: "#60a5fa", sort_order: 1 });
      setNewPages([]);
      onRefresh();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/45">Configure subscription plans. Each plan unlocks a set of pages.</p>
        <button onClick={() => setCreating(v => !v)}
          className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
          style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
          <Plus className="w-3.5 h-3.5" /> New Plan
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div className="rounded-xl border p-4 space-y-4" style={{ background: G.bgHi, borderColor: G.borderHi }}>
              <h3 className="font-inter font-bold text-white text-sm">New Subscription Plan</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/45 mb-1 block">Plan Type</label>
                  <select value={newPlan.plan_name} onChange={e => setNewPlan(p => ({ ...p, plan_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}` }}>
                    {["Basic", "Premium", "Pro", "Ultimate"].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/45 mb-1 block">Currency</label>
                  <input value={newPlan.currency} onChange={e => setNewPlan(p => ({ ...p, currency: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}` }} />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/45 mb-1 block">Description</label>
                <input value={newPlan.description} onChange={e => setNewPlan(p => ({ ...p, description: e.target.value }))}
                  placeholder="Short description for users"
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}` }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[["Monthly", "price_monthly"], ["6 Months", "price_6months"], ["Yearly", "price_yearly"], ["Lifetime", "price_lifetime"]].map(([label, key]) => (
                  <div key={key}>
                    <label className="text-xs text-white/45 mb-1 block">{label} Price</label>
                    <input type="number" value={newPlan[key]} onChange={e => setNewPlan(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}` }} />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs text-white/45 mb-2 block">Pages Included ({newPages.length} selected)</label>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {getContentPageList().map(p => {
                    const sel = newPages.includes(p.path);
                    return (
                      <button key={p.path} onClick={() => setNewPages(prev => sel ? prev.filter(x => x !== p.path) : [...prev, p.path])}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm"
                        style={{ background: sel ? G.bg : "transparent", border: `1px solid ${sel ? G.border : "transparent"}`, color: sel ? "white" : "rgba(255,255,255,0.45)" }}>
                        <div className="w-3.5 h-3.5 rounded flex-shrink-0 flex items-center justify-center"
                          style={{ background: sel ? G.text : "transparent", border: `1px solid ${sel ? G.text : "rgba(255,255,255,0.20)"}` }}>
                          {sel && <CheckCircle className="w-2.5 h-2.5 text-black" />}
                        </div>
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCreating(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>Cancel</button>
                <button onClick={handleCreate} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#f6d860,#c98a14)", color: "#0d1b2a" }}>
                  {saving ? "Saving…" : "Create Plan"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {plans.length === 0 ? (
        <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.25)" }}>
          <Star className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="text-sm">No plans created yet. Click "New Plan" to start.</p>
        </div>
      ) : (
        plans.sort((a, b) => (a.sort_order || 9) - (b.sort_order || 9)).map(plan => {
          const isEditing = editingId === plan.id;
          const color = plan.color || PLAN_COLORS[plan.plan_name] || G.text;
          const PlanIcon = PLAN_ICONS_MAP[plan.plan_name] || Star;
          return (
            <div key={plan.id} className="rounded-xl border p-4 space-y-3"
              style={{ background: G.bg, borderColor: `${color}40` }}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
                    <PlanIcon className="w-4.5 h-4.5" style={{ color }} />
                  </div>
                  <div>
                    <p className="font-inter font-bold text-white">{plan.plan_name}</p>
                    <p className="text-xs text-white/35">{(plan.page_paths || []).length} pages · {plan.currency} {plan.price_monthly}/mo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded"
                    style={{ background: plan.is_active ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)", color: plan.is_active ? "#4ade80" : "rgba(255,255,255,0.30)" }}>
                    {plan.is_active ? "Active" : "Inactive"}
                  </span>
                  {isEditing ? (
                    <button onClick={saveEdit} disabled={saving}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.30)" }}>
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button onClick={() => startEdit(plan)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.borderHi}` }}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-3 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Description</label>
                    <input value={editData.description || ""} onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[["Monthly", "price_monthly"], ["6 Months", "price_6months"], ["Yearly", "price_yearly"], ["Lifetime", "price_lifetime"]].map(([label, key]) => (
                      <div key={key}>
                        <label className="text-xs text-white/40 mb-1 block">{label}</label>
                        <input type="number" value={editData[key] || 0} onChange={e => setEditData(d => ({ ...d, [key]: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-2 block">Pages ({(editData.page_paths || []).length} selected)</label>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {getContentPageList().map(p => {
                        const sel = (editData.page_paths || []).includes(p.path);
                        return (
                          <button key={p.path} onClick={() => toggleEditPage(p.path)}
                            className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm"
                            style={{ background: sel ? G.bg : "transparent", border: `1px solid ${sel ? G.border : "transparent"}`, color: sel ? "white" : "rgba(255,255,255,0.45)" }}>
                            <div className="w-3.5 h-3.5 rounded flex-shrink-0 flex items-center justify-center"
                              style={{ background: sel ? G.text : "transparent", border: `1px solid ${sel ? G.text : "rgba(255,255,255,0.20)"}` }}>
                              {sel && <CheckCircle className="w-2.5 h-2.5 text-black" />}
                            </div>
                            {p.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/40">Active</label>
                    <button onClick={() => setEditData(d => ({ ...d, is_active: !d.is_active }))}
                      className="w-10 h-5 rounded-full transition-all flex-shrink-0"
                      style={{ background: editData.is_active ? "#22c55e" : "rgba(255,255,255,0.12)" }}>
                      <div className="w-4 h-4 rounded-full bg-white transition-all ml-0.5"
                        style={{ transform: editData.is_active ? "translateX(20px)" : "translateX(0)" }} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {(plan.page_paths || []).map(path => {
                    const name = getContentPageList().find(p => p.path === path)?.name || path;
                    return (
                      <span key={path} className="px-2 py-0.5 rounded text-xs"
                        style={{ background: `${color}12`, color: `${color}cc`, border: `1px solid ${color}25` }}>
                        {name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ── Access Requests Tab ───────────────────────────────────────────────────────
function AccessRequestsTab({ requests, users, onRefresh }) {
  const { toast } = useToast();
  const [filter, setFilter] = useState("PENDING");
  const [approving, setApproving] = useState(null);

  const filtered = useMemo(() => {
    if (filter === "all") return requests;
    return requests.filter(r => r.status === filter);
  }, [requests, filter]);

  const counts = {
    PENDING: requests.filter(r => r.status === "PENDING").length,
    APPROVED: requests.filter(r => r.status === "APPROVED").length,
    REJECTED: requests.filter(r => r.status === "REJECTED").length,
  };

  const handleApprove = async (request, duration) => {
    try {
      await base44.functions.invoke("approveAccessRequest", {
        request_id: request.request_id,
        access_duration: duration,
        approved_by: (await base44.auth.me()).id,
      });
      toast({ title: "✓ Request approved" });
      onRefresh();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleReject = async (request) => {
    if (!confirm("Reject this access request?")) return;
    try {
      await base44.functions.invoke("approveAccessRequest", {
        request_id: request.request_id,
        access_duration: null,
        approved_by: (await base44.auth.me()).id,
        reject: true,
      });
      toast({ title: "✓ Request rejected" });
      onRefresh();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending", value: counts.PENDING, color: "#f59e0b" },
          { label: "Approved", value: counts.APPROVED, color: "#22c55e" },
          { label: "Rejected", value: counts.REJECTED, color: "#ef4444" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border p-3 text-center" style={{ background: G.bg, borderColor: G.border }}>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs text-white/40 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {["PENDING", "APPROVED", "REJECTED", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === f ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40" : "bg-white/5 text-white/45 border border-white/10"}`}>
            {f === "all" ? `All (${requests.length})` : `${f} (${counts[f] || 0})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.25)" }}>
          <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No access requests found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(req => (
            <div key={req.id} className="rounded-xl border p-4" style={{ background: G.bg, borderColor: G.border }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-inter font-bold text-white text-sm">{req.name}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <Mail className="w-3 h-3" />{req.email}
                    </span>
                    {req.phone && (
                      <span className="text-xs text-white/40 flex items-center gap-1">
                        <Phone className="w-3 h-3" />{req.phone}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>
                      {req.page_name || req.page_path}
                    </span>
                    {req.access_duration && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: "rgba(34,197,94,0.10)", color: "#4ade80" }}>
                        {(req.access_duration || "").replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  {req.message && (
                    <p className="text-xs text-white/50 mt-2 italic">"{req.message}"</p>
                  )}
                  <p className="text-xs text-white/30 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Requested {fmt(req.requested_at)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    req.status === "PENDING" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30" :
                    req.status === "APPROVED" ? "bg-green-500/10 text-green-400 border border-green-500/30" :
                    "bg-red-500/10 text-red-400 border border-red-500/30"
                  }`}>
                    {req.status}
                  </span>
                  {req.status === "PENDING" && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setApproving(req)}
                        className="px-3 py-1 rounded text-xs font-semibold"
                        style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.30)" }}>
                        Approve
                      </button>
                      <button onClick={() => handleReject(req)}
                        className="px-3 py-1 rounded text-xs font-semibold"
                        style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.30)" }}>
                        Reject
                      </button>
                    </div>
                  )}
                  {req.approved_at && (
                    <p className="text-xs text-white/30 mt-1">
                      {req.status === "APPROVED" ? "Approved" : "Rejected"} {fmt(req.approved_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {approving && (
          <ApproveRequestModal
            request={approving}
            onClose={() => setApproving(null)}
            onApproved={() => { onRefresh(); setApproving(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ApproveRequestModal({ request, onClose, onApproved }) {
  const { toast } = useToast();
  const [duration, setDuration] = useState("1_MONTH");
  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await base44.functions.invoke("approveAccessRequest", {
        request_id: request.request_id,
        access_duration: duration,
        approved_by: (await base44.auth.me()).id,
      });
      toast({ title: "✓ Request approved" });
      onApproved();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-md rounded-2xl p-6 space-y-5"
        style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: `1px solid ${G.borderHi}` }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-inter font-bold text-white text-base">Approve Access Request</h3>
            <p className="text-xs text-white/40 mt-0.5">{request.name} · {request.page_name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "rgba(255,255,255,0.40)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="text-xs text-white/45 mb-1 block">Access Duration</label>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setDuration(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${duration === opt.value ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40" : "bg-white/5 text-white/45 border border-white/10"}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm"
            style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>
            Cancel
          </button>
          <button onClick={handleApprove} disabled={processing}
            className="flex-1 py-3 rounded-xl font-inter font-bold text-sm disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#f6d860,#c98a14)", color: "#0d1b2a" }}>
            {processing ? "Approving…" : "Approve Request"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Page Visibility Tab ───────────────────────────────────────────────────────
function VisibilityTab({ pageConfigs, onRefresh }) {
  const { toast } = useToast();
  const [toggling, setToggling] = useState(null);

  const pages = getVisibleContentPages().map(p => ({ path: p.path, name: p.name, code: p.code })).map(p => {
    const db = pageConfigs.find(c => c.page_path === p.path);
    const isPrivate = db ? db.requires_permission : (p.requiresPermission ?? true);
    return { ...p, isPrivate };
  });

  const publicCount = pages.filter(p => !p.isPrivate).length;
  const privateCount = pages.filter(p => p.isPrivate).length;

  const handleToggle = async (page) => {
    setToggling(page.path);
    try {
      await base44.functions.invoke("updatePageVisibility", {
        page_path: page.path,
        page_name: page.name,
        requires_permission: !page.isPrivate,
      });
      toast({ title: `"${page.name}" is now ${page.isPrivate ? "🌍 Public" : "🔒 Private"}` });
      onRefresh();
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-3 text-center" style={{ background: "rgba(34,197,94,0.06)", borderColor: "rgba(34,197,94,0.25)" }}>
          <p className="text-xl font-bold text-green-400">{publicCount}</p>
          <p className="text-xs text-white/40 mt-0.5">Public Pages</p>
        </div>
        <div className="rounded-xl border p-3 text-center" style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.20)" }}>
          <p className="text-xl font-bold text-red-400">{privateCount}</p>
          <p className="text-xs text-white/40 mt-0.5">Private Pages</p>
        </div>
      </div>

      <p className="text-xs text-white/40 px-1">
        <Globe className="w-3 h-3 inline mr-1" />Public — anyone can view.
        <Lock className="w-3 h-3 inline mx-1 ml-3" />Private — requires subscription or manual access.
      </p>

      <div className="space-y-2">
        {pages.map(page => (
          <div key={page.path} className="rounded-xl border p-3.5 flex items-center gap-3"
            style={{ background: G.bg, borderColor: G.border }}>
            <div className="flex-1 min-w-0">
              <p className="font-inter font-semibold text-white text-sm">{page.name}</p>
              <p className="text-xs font-mono text-white/30 mt-0.5">{page.path}</p>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0"
              style={{
                background: page.isPrivate ? "rgba(239,68,68,0.10)" : "rgba(34,197,94,0.10)",
                color: page.isPrivate ? "#ef4444" : "#22c55e",
                border: `1px solid ${page.isPrivate ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
              }}>
              {page.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
              {page.isPrivate ? "Private" : "Public"}
            </span>
            <button onClick={() => handleToggle(page)} disabled={toggling === page.path}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all disabled:opacity-50"
              style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
              {toggling === page.path ? "…" : page.isPrivate ? "Make Public" : "Make Private"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── User Access Tab ───────────────────────────────────────────────────────────
function UserAccessTab({ users, permissions, onRefresh }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [grantUser, setGrantUser] = useState(null);
  const [extendPerm, setExtendPerm] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(u =>
      (u.email || "").toLowerCase().includes(q) ||
      (u.full_name || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleRevoke = async (perm) => {
    if (!confirm(`Revoke access to "${perm.page_name}"?`)) return;
    try {
      const me = await base44.auth.me();
      await base44.functions.invoke("revokePagePermission", {
        permission_id: perm.permission_id,
        revoked_by: me.id,
        reason: "Revoked by owner",
      });
      toast({ title: `✓ Revoked "${perm.page_name}"` });
      onRefresh();
    } catch (e) {
      toast({ title: "Revoke failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: G.dim }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search user by name or email…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}` }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.25)" }}>
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => {
            const userPerms = permissions.filter(p => p.user_id === u.id);
            const activePerms = userPerms.filter(p => p.is_active && !p.is_revoked && !isExp(p.expiry_date));
            const existingPaths = activePerms.map(p => p.page_path);
            return (
              <UserAccessRow key={u.id} user={u} userPerms={userPerms} activeCount={activePerms.length}
                existingPaths={existingPaths} onRevoke={handleRevoke}
                onGrant={() => setGrantUser(u)}
                onExtend={(perm) => setExtendPerm(perm)} />
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {grantUser && (
          <GrantAccessModal
            user={grantUser}
            existingPaths={permissions.filter(p => p.user_id === grantUser.id && p.is_active && !p.is_revoked).map(p => p.page_path)}
            onClose={() => setGrantUser(null)}
            onGranted={onRefresh}
          />
        )}
        {extendPerm && (
          <ExtendAccessModal
            permission={extendPerm}
            onClose={() => setExtendPerm(null)}
            onExtended={onRefresh}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function UserAccessRow({ user, userPerms, activeCount, existingPaths, onRevoke, onGrant, onExtend }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: G.bg, borderColor: G.border }}>
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
          style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>
          {(user.full_name || user.email || "?")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-inter font-bold text-white text-sm truncate">{user.full_name || "Unnamed"}</p>
          <p className="text-xs text-white/35 truncate">{user.email}</p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0"
          style={{
            background: activeCount > 0 ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)",
            color: activeCount > 0 ? "#4ade80" : "rgba(255,255,255,0.25)",
          }}>
          {activeCount} active
        </span>
        <button
          onClick={e => { e.stopPropagation(); onGrant(); }}
          className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 flex-shrink-0"
          style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
          <Plus className="w-3 h-3" /> Grant
        </button>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-white/25 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-white/25 flex-shrink-0" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            <div className="px-4 pb-4 border-t space-y-2" style={{ borderColor: "rgba(212,175,55,0.10)" }}>
              {userPerms.length === 0 ? (
                <p className="text-white/25 text-xs pt-3">No page access granted yet.</p>
              ) : (
                <div className="pt-3 space-y-1.5">
                  {userPerms.map(perm => {
                    const expired = isExp(perm.expiry_date);
                    const revoked = perm.is_revoked;
                    const color = revoked ? "#ef4444" : expired ? "#f59e0b" : "#4ade80";
                    const days = !revoked && !expired ? daysLeft(perm.expiry_date) : null;
                    return (
                      <div key={perm.id} className="flex items-center gap-3 p-2.5 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-inter text-sm font-semibold text-white truncate">{perm.page_name}</p>
                          <p className="text-xs text-white/30 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {revoked ? "Revoked" : expired ? `Expired ${fmt(perm.expiry_date)}` : days !== null && days < 36000 ? `${days}d left · ${fmt(perm.expiry_date)}` : "Permanent"}
                          </p>
                        </div>
                        {!revoked && !expired && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => onExtend(perm)}
                              className="w-7 h-7 rounded flex items-center justify-center hover:bg-blue-500/20"
                              style={{ color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)" }}
                              title="Extend access">
                              <CalendarPlus2 className="w-3 h-3" />
                            </button>
                            <button onClick={() => onRevoke(perm)}
                              className="w-7 h-7 rounded flex items-center justify-center hover:bg-red-500/20"
                              style={{ color: "#ef4444", border: "1px solid rgba(239,68,68,0.20)" }}
                              title="Revoke access">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function OwnerAccessDashboard() {
  const { toast } = useToast();
  const { role } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [tab, setTab] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    return TABS.some((item) => item.id === requested) ? requested : "users";
  });
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [pageConfigs, setPageConfigs] = useState([]);
  const [plans, setPlans] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [managingSub, setManagingSub] = useState(null);

  useEffect(() => { init(); }, []);

  const init = async () => {
    try {
      const me = await base44.auth.me();
      const isOwner = me?.email?.toLowerCase() === ADMIN_CONFIG.OWNER_EMAIL.toLowerCase();
      if (!me || (me.role !== "admin" && !isOwner)) {
        setIsAdmin(false); return;
      }
      setIsAdmin(true);
      await loadAll();
    } catch { setIsAdmin(false); }
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      // Paginated: limit initial loads to prevent OOM with 10K+ users
      const PAGE_LIMIT = 200;
      const [allUsers, allProfiles, perms, subs, configs, allPlans, allRequests] = await Promise.all([
        base44.entities.User.list(null, PAGE_LIMIT),
        base44.entities.UserAccessProfile.list(null, PAGE_LIMIT),
        base44.entities.PagePermission.list("-granted_at", PAGE_LIMIT),
        base44.entities.Subscription.list("-start_date", PAGE_LIMIT),
        base44.entities.PageVisibilityConfig.list(null, PAGE_LIMIT),
        base44.entities.SubscriptionPlan.list(null, 100),
        base44.entities.AccessRequest.list("-requested_at", PAGE_LIMIT),
      ]);
      setUsers(allUsers);
      setProfiles(allProfiles);
      setPermissions(perms);
      setSubscriptions(subs);
      setPageConfigs(configs);
      setPlans(allPlans);
      setAccessRequests(allRequests);
    } catch (e) {
      toast({ title: "Load error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin === false) return <Navigate to="/" replace />;

  if (isAdmin === null || loading) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  const activeSubs = subscriptions.filter(s => s.status === "ACTIVE").length;
  const activePerms = permissions.filter(p => p.is_active && !p.is_revoked && !isExp(p.expiry_date)).length;
  const publicPages = getContentPageList().filter(p => {
    const db = pageConfigs.find(c => c.page_path === p.path);
    return db ? !db.requires_permission : !(p.requiresPermission ?? true);
  }).length;

  return (
    <PageLayout>
      <PageTitle arabic="لوحة تحكم الوصول" latin="Owner Access Dashboard" subtitle="Manage Users · Pages · Subscriptions" icon="👑" />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-10">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Registered Users",    value: users.length,  color: G.text },
            { label: "Active Subscriptions", value: activeSubs,    color: "#22c55e" },
            { label: "Active Permissions",   value: activePerms,   color: "#60a5fa" },
            { label: "Public Pages",         value: `${publicPages}/${getContentPageList().length}`, color: "#a78bfa" },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-xl border text-center" style={{ background: G.bg, borderColor: G.border }}>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs text-white/40 mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map(({ id, label, icon: TabIcon }) => (
            <button key={id} onClick={() => setTab(id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: tab === id ? G.bgHi : "rgba(255,255,255,0.03)",
                border: `1px solid ${tab === id ? G.borderHi : "rgba(255,255,255,0.07)"}`,
                color: tab === id ? G.text : "rgba(255,255,255,0.45)",
              }}>
              <TabIcon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
          <button onClick={loadAll}
            className="ml-auto px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Tab content */}
        <div>
          {tab === "users"      && <UsersManagementTab users={users} profiles={profiles} onRefresh={loadAll} />}
          {tab === "google-users" && <GoogleUsersTab users={users} profiles={profiles} onRefresh={loadAll} />}
          {tab === "subs"       && <SubscriptionsTab subscriptions={subscriptions} users={users} />}
          {tab === "payments"   && <PaymentsTab subscriptions={subscriptions} users={users} onManage={setManagingSub} />}
          {tab === "plans"      && <PlansTab plans={plans} onRefresh={loadAll} />}

          {tab === "requests"   && (
            <div className="space-y-4">
              <Link to="/admin/access-requests">
                <div className="rounded-xl border p-4 flex items-center gap-3 cursor-pointer"
                  style={{ background: "rgba(37,211,102,0.08)", borderColor: "rgba(37,211,102,0.35)" }}>
                  <MessageSquare className="w-5 h-5 flex-shrink-0" style={{ color: "#25D366" }} />
                  <div className="flex-1">
                    <p className="font-inter font-bold text-sm" style={{ color: "#25D366" }}>WhatsApp Access Requests</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      View &amp; approve pending WhatsApp access requests
                      {accessRequests.filter(r => r.status === "PENDING").length > 0 &&
                        ` · ${accessRequests.filter(r => r.status === "PENDING").length} pending`}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(37,211,102,0.15)", color: "#25D366", border: "1px solid rgba(37,211,102,0.35)" }}>
                    Open →
                  </span>
                </div>
              </Link>
              <SubscriptionRequestsTab requests={accessRequests} users={users} onRefresh={loadAll} />
            </div>
          )}
          {tab === "messages"   && <MessagesTab />}
          {tab === "visibility" && <VisibilityTab pageConfigs={pageConfigs} onRefresh={loadAll} />}
          {tab === "access"     && <UserAccessTab users={users} permissions={permissions} onRefresh={loadAll} />}
          {tab === "codes"      && <AccessCodesTab />}
          {tab === "google"     && <GoogleLinkingPanel role={role} />}
          {tab === "security"   && <SecurityAuditTab />}
        </div>

      </motion.div>

      <AnimatePresence>
        {managingSub && (
          <ManageSubscriptionModal
            subscription={managingSub}
            onClose={() => setManagingSub(null)}
            onSuccess={() => { loadAll(); setManagingSub(null); }}
          />
        )}
      </AnimatePresence>

    </PageLayout>
  );
}