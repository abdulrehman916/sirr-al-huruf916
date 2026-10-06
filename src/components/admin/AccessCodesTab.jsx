/**
 * AccessCodesTab — Main license management dashboard.
 * Features: dashboard stats, enhanced search, advanced filters,
 * renew, disable/enable, delete, detail page link, remaining time.
 */
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, KeyRound, Copy, Check, Trash2, ToggleLeft, ToggleRight,
  RefreshCw, ChevronRight, Clock, CheckCircle, AlertCircle, Loader2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { ROLES } from "@/lib/rbac";
import CreateCodeForm from "./CreateCodeForm";
import EditCodeModal from "./EditCodeModal";
import RenewCodeModal from "./RenewCodeModal";
import RemainingTime from "./RemainingTime";
import {
  getCodeStatus, isLifetime, isExpiringToday, isExpiringTomorrow,
  isExpiringWithin7Days, isRecentlyRedeemed, isRecentlyRenewed, fmtDate,
} from "@/lib/codeDuration";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

const FILTERS = [
  { key: 'all',              label: 'All' },
  { key: 'active',           label: 'Active' },
  { key: 'used',             label: 'Used' },
  { key: 'expired',          label: 'Expired' },
  { key: 'disabled',         label: 'Disabled' },
  { key: 'lifetime',         label: 'Lifetime' },
  { key: 'expiring_today',   label: 'Expiring Today' },
  { key: 'expiring_tomorrow',label: 'Expiring Tomorrow' },
  { key: 'expiring_7days',   label: 'Within 7 Days' },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={copy} className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: copied ? "#4ade80" : "rgba(255,255,255,0.40)" }}>
      {copied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
    </button>
  );
}

export default function AccessCodesTab() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { role } = useAuth();
  const isOwner = role === ROLES.OWNER;
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editCode, setEditCode] = useState(null);
  const [renewCode, setRenewCode] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const pageSize = 500;
      const all = [];
      for (let skip = 0; ; skip += pageSize) {
        const page = await base44.entities.AccessCode.list("-created_date", pageSize, skip);
        all.push(...page);
        if (page.length < pageSize) break;
      }
      setCodes(all);
    } catch (e) {
      toast({ title: "Failed to load codes", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleDisable = async (e, code) => {
    e.stopPropagation();
    try {
      const res = await base44.functions.invoke("setAccessCodeDisabled", { code_id: code.id, disable: !code.is_disabled });
      if (!res.data?.success) throw new Error(res.data?.message || "Action failed");
      toast({ title: code.is_disabled ? "✓ Code enabled" : "✓ Code disabled" });
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (e, code) => {
    e.stopPropagation();
    if (!confirm(`Delete code "${code.code}"? This permanently revokes all permissions.`)) return;
    try {
      const res = await base44.functions.invoke("deleteAccessCodeSecure", { code_id: code.id });
      if (res.data?.success) {
        toast({ title: `✓ Code "${code.code}" deleted` });
        load();
      } else {
        toast({ title: "Delete failed", description: res.data?.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  // Enhanced search
  const filtered = useMemo(() => {
    let list = codes;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c =>
        c.code.toLowerCase().includes(q) ||
        (c.customer_name || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q) ||
        (c.whatsapp || "").toLowerCase().includes(q) ||
        (c.used_by_email || "").toLowerCase().includes(q) ||
        (c.used_by_user_id || "").toLowerCase().includes(q) ||
        (c.notes || "").toLowerCase().includes(q)
      );
    }
    if (filter !== "all") {
      list = list.filter(c => {
        switch (filter) {
          case 'active':    return getCodeStatus(c).value === 'active';
          case 'used':      return getCodeStatus(c).value === 'used';
          case 'expired':   return getCodeStatus(c).value === 'expired';
          case 'disabled':  return getCodeStatus(c).value === 'disabled';
          case 'lifetime':  return isLifetime(c);
          case 'expiring_today':    return isExpiringToday(c);
          case 'expiring_tomorrow': return isExpiringTomorrow(c);
          case 'expiring_7days':    return isExpiringWithin7Days(c);
          default: return true;
        }
      });
    }
    return list;
  }, [codes, search, filter]);

  // Dashboard stats
  const stats = useMemo(() => ({
    total: codes.length,
    active: codes.filter(c => getCodeStatus(c).value === 'active').length,
    used: codes.filter(c => getCodeStatus(c).value === 'used').length,
    expired: codes.filter(c => getCodeStatus(c).value === 'expired').length,
    disabled: codes.filter(c => getCodeStatus(c).value === 'disabled').length,
    lifetime: codes.filter(c => isLifetime(c)).length,
    expiringToday: codes.filter(c => isExpiringToday(c)).length,
    expiringSoon: codes.filter(c => isExpiringWithin7Days(c)).length,
    recentlyRedeemed: codes.filter(c => isRecentlyRedeemed(c)).length,
    recentlyRenewed: codes.filter(c => isRecentlyRenewed(c)).length,
  }), [codes]);

  return (
    <div className="space-y-4">
      {/* Dashboard */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {[
          { label: 'Total',   value: stats.total,   color: '#F5D060' },
          { label: 'Active',  value: stats.active,  color: '#22c55e' },
          { label: 'Expired', value: stats.expired, color: '#ef4444' },
          { label: 'Disabled',value: stats.disabled,color: '#6b7280' },
          { label: 'Lifetime',value: stats.lifetime,color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-2.5 text-center"
            style={{ background: G.bg, borderColor: G.border }}>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] text-white/35 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Exp Today',     value: stats.expiringToday,     color: '#f59e0b' },
          { label: 'Exp 7 Days',    value: stats.expiringSoon,      color: '#f59e0b' },
          { label: 'Rec Redeemed',  value: stats.recentlyRedeemed,  color: '#3b82f6' },
          { label: 'Rec Renewed',   value: stats.recentlyRenewed,   color: '#a855f7' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-2 text-center"
            style={{ background: G.bg, borderColor: G.border }}>
            <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] text-white/35 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-inter font-bold text-white text-sm flex items-center gap-2">
          <KeyRound className="w-4 h-4" style={{ color: G.text }} /> License Management
        </h3>
        {isOwner && (
        <button onClick={() => setShowCreate(v => !v)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
          style={{ background: "linear-gradient(135deg,#f6d860,#c98a14)", color: "#0d1b2a" }}>
          <Plus className="w-3.5 h-3.5" /> New Code
        </button>
        )}
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <CreateCodeForm onCreated={() => { setShowCreate(false); load(); }} onCancel={() => setShowCreate(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: G.dim }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by code, customer, email, phone, WhatsApp, user ID…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}` }} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
            style={{
              background: filter === f.key ? G.bgHi : "rgba(255,255,255,0.04)",
              border: `1px solid ${filter === f.key ? G.borderHi : "rgba(255,255,255,0.08)"}`,
              color: filter === f.key ? G.text : "rgba(255,255,255,0.50)",
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Code List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: G.text }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.25)" }}>
          <KeyRound className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="text-sm">No codes found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(code => {
            const status = getCodeStatus(code);
            return (
              <div key={code.id} onClick={() => navigate(`/admin/access-codes/${code.id}`)}
                className="rounded-xl border p-3 space-y-2 cursor-pointer transition-all hover:border-yellow-500/50"
                style={{ background: G.bg, borderColor: code.is_disabled ? "rgba(107,114,128,0.25)" : G.border }}>
                {/* Row 1: code + status + actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <KeyRound className="w-3.5 h-3.5 flex-shrink-0" style={{ color: G.text }} />
                    <span className="font-inter font-bold text-white tracking-widest text-xs">{code.code}</span>
                    <CopyButton text={code.code} />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0"
                    style={{ background: status.color + "18", color: status.color, border: `1px solid ${status.color}40` }}>
                    {status.label}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); setRenewCode(code); }} title="Renew"
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ background: "rgba(245,158,11,0.10)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>
                      <RefreshCw className="w-3 h-3" />
                    </button>
                    {isOwner && (
                      <>
                    <button onClick={(e) => handleToggleDisable(e, code)} title={code.is_disabled ? "Enable" : "Disable"}
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ background: code.is_disabled ? "rgba(34,197,94,0.10)" : "rgba(107,114,128,0.10)",
                        color: code.is_disabled ? "#4ade80" : "#9ca3af",
                        border: `1px solid ${code.is_disabled ? "rgba(34,197,94,0.25)" : "rgba(107,114,128,0.25)"}` }}>
                      {code.is_disabled ? <ToggleLeft className="w-3 h-3" /> : <ToggleRight className="w-3 h-3" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setEditCode(code); }} title="Edit features"
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <button onClick={(e) => handleDelete(e, code)} title="Delete"
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ background: "rgba(239,68,68,0.10)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                      </>
                    )}
                    <ChevronRight className="w-3 h-3 text-white/30" />
                  </div>
                </div>

                {/* Row 2: customer + expiry + remaining */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/45">
                  <span>👤 {code.customer_name || "—"}</span>
                  {code.email && <span>✉ {code.email}</span>}
                  {code.phone && <span>📞 {code.phone}</span>}
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> Expires: {fmtDate(code.expiry_date)}
                  </span>
                  <RemainingTime expiryDate={code.expiry_date} />
                  {code.used_by_email && <span className="text-white/25">Used by: {code.used_by_email}</span>}
                </div>

                {/* Row 3: pages */}
                <div className="flex flex-wrap gap-1">
                  {(code.page_names || code.page_paths || []).slice(0, 5).map((name, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                      style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>
                      {name}
                    </span>
                  ))}
                  {(code.page_names || []).length > 5 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] text-white/40">
                      +{(code.page_names || []).length - 5} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <EditCodeModal code={editCode} onClose={() => setEditCode(null)} onUpdated={() => { setEditCode(null); load(); }} />
      <RenewCodeModal code={renewCode} onClose={() => setRenewCode(null)} onRenewed={() => { setRenewCode(null); load(); }} />
    </div>
  );
}