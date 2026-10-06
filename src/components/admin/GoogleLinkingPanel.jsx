import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2, Unlink, RefreshCw, Search, X, Loader2, KeyRound, Mail, Clock,
  ChevronDown, ChevronUp, AlertCircle, ArrowRightLeft, ToggleRight, ToggleLeft, UserCircle2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { ROLES } from "@/lib/rbac";
import RenewCodeModal from "./RenewCodeModal";
import { fmtDate } from "@/lib/codeDuration";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

// ── Link an existing unlinked code to a Google account ──
function LinkModal({ codes, onClose, onLinked }) {
  const { toast } = useToast();
  const [codeId, setCodeId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    if (!codeId) { toast({ title: "Select a code", variant: "destructive" }); return; }
    if (!email.trim()) { toast({ title: "Google email required", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const res = await base44.functions.invoke("linkAccessCode", { code_id: codeId, google_email: email.trim() });
      const data = res.data;
      if (data?.success) { toast({ title: data.message }); onLinked(); onClose(); }
      else toast({ title: "Link failed", description: data?.message, variant: "destructive" });
    } catch (e) { toast({ title: "Link failed", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-md rounded-2xl p-6 space-y-4"
        style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: `1px solid ${G.borderHi}` }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-inter font-bold text-white text-base flex items-center gap-2"><Link2 className="w-4 h-4" style={{ color: G.text }} /> Link Code to Google</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "rgba(255,255,255,0.40)" }}><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-white/45">Select an Owner-created Access Code and the customer's Google email. The customer must have signed in with Google at least once.</p>
        <div>
          <label className="text-xs text-white/45 mb-1 block">Access Code</label>
          <select value={codeId} onChange={e => setCodeId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}` }}>
            <option value="">— Select a code —</option>
            {codes.map(c => <option key={c.id} value={c.id}>{c.code} · {c.customer_name || "—"}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/45 mb-1 block">Customer Google Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="customer@gmail.com"
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}` }} />
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm" style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>Cancel</button>
          <button onClick={handle} disabled={loading} className="flex-1 py-3 rounded-xl font-inter font-bold text-sm disabled:opacity-50" style={{ background: "linear-gradient(135deg,#f6d860,#c98a14)", color: "#0d1b2a" }}>
            {loading ? "Linking…" : "Link Account"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Transfer a linked code to a new Google account (Owner only) ──
function TransferModal({ code, onClose, onDone }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    if (!email.trim()) { toast({ title: "New Google email required", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const res = await base44.functions.invoke("transferAccessCode", { code_id: code.id, google_email: email.trim() });
      const data = res.data;
      if (data?.success) { toast({ title: data.message }); onDone(); onClose(); }
      else toast({ title: "Transfer failed", description: data?.message, variant: "destructive" });
    } catch (e) { toast({ title: "Transfer failed", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: `1px solid ${G.borderHi}` }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-inter font-bold text-white text-base flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" style={{ color: G.text }} /> Transfer Code</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "rgba(255,255,255,0.40)" }}><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-white/45">Transfer <span className="font-bold text-white">{code.code}</span> from <span className="text-white/70">{code.linked_user_email}</span> to a new Google account.</p>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="new-customer@gmail.com"
          className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
          style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}` }} />
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm" style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>Cancel</button>
          <button onClick={handle} disabled={loading} className="flex-1 py-3 rounded-xl font-inter font-bold text-sm disabled:opacity-50" style={{ background: "linear-gradient(135deg,#f6d860,#c98a14)", color: "#0d1b2a" }}>
            {loading ? "Transferring…" : "Transfer"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Confirm unlink (Owner only) ──
function UnlinkConfirm({ code, onClose, onDone }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("unlinkAccessCode", { code_id: code.id });
      const data = res.data;
      if (data?.success) { toast({ title: data.message }); onDone(); onClose(); }
      else toast({ title: "Unlink failed", description: data?.message, variant: "destructive" });
    } catch (e) { toast({ title: "Unlink failed", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: `1px solid ${G.borderHi}` }}
        onClick={e => e.stopPropagation()}>
        <h3 className="font-inter font-bold text-white text-base flex items-center gap-2"><Unlink className="w-4 h-4 text-red-400" /> Unlink Code</h3>
        <p className="text-xs text-white/55">Remove the Google link from <span className="font-bold text-white">{code.code}</span>? The customer will lose auto-restore until re-linked. The code and its pages are NOT deleted.</p>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm" style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>Cancel</button>
          <button onClick={handle} disabled={loading} className="flex-1 py-3 rounded-xl font-inter font-bold text-sm disabled:opacity-50" style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)", color: "#fff" }}>
            {loading ? "Unlinking…" : "Unlink"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main panel (role-aware) ──
export default function GoogleLinkingPanel({ role }) {
  const { toast } = useToast();
  const isOwner = role === ROLES.OWNER;
  const [codes, setCodes] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState(null);
  const [transferTarget, setTransferTarget] = useState(null);
  const [renewTarget, setRenewTarget] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [allCodes, allProfiles] = await Promise.all([
        base44.entities.AccessCode.list("-created_date", 500),
        base44.entities.UserAccessProfile.list(null, 200),
      ]);
      setCodes(allCodes);
      setProfiles(allProfiles);
    } catch (e) {
      toast({ title: "Load failed", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const profileMap = useMemo(() => {
    const m = {};
    profiles.forEach(p => { if (p.user_id) m[p.user_id] = p; });
    return m;
  }, [profiles]);

  const linked = useMemo(() => codes.filter(c => c.linked_user_id), [codes]);
  const unlinked = useMemo(() => codes.filter(c => !c.linked_user_id && !c.is_disabled), [codes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return linked;
    return linked.filter(c => {
      const p = profileMap[c.linked_user_id] || {};
      return (c.code || "").toLowerCase().includes(q) ||
        (c.linked_user_email || "").toLowerCase().includes(q) ||
        (c.customer_name || "").toLowerCase().includes(q) ||
        (p.full_name || "").toLowerCase().includes(q);
    });
  }, [linked, search, profileMap]);

  const pageState = (code, path) => {
    const g = (code.page_grants || {})[path];
    if (!g) return { active: true, expiry: null };
    if (g.expires_at === null || g.expires_at === undefined) return { active: true, expiry: null };
    return { active: new Date(g.expires_at).getTime() > Date.now(), expiry: g.expires_at };
  };

  const overallStatus = (code) => {
    if (code.is_disabled) return { label: "Disabled", color: "#9ca3af" };
    const paths = code.page_paths || [];
    const hasActive = paths.some(p => pageState(code, p).active);
    if (hasActive) return { label: "Active", color: "#22c55e" };
    return { label: "Expired", color: "#f59e0b" };
  };

  const activePages = (code) => (code.page_paths || []).filter(p => pageState(code, p).active);

  const handleToggleDisable = async (code) => {
    setToggling(code.id);
    try {
      const res = await base44.functions.invoke("setAccessCodeDisabled", { code_id: code.id, disable: !code.is_disabled });
      if (!res.data?.success) throw new Error(res.data?.message || "Action failed");
      toast({ title: code.is_disabled ? "✓ Code enabled" : "✓ Code disabled" });
      load();
    } catch (e) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setToggling(null); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-inter font-bold text-white text-sm flex items-center gap-2"><Link2 className="w-4 h-4" style={{ color: G.text }} /> Google Linked Customers</h3>
          <p className="text-xs text-white/40 mt-0.5">{linked.length} linked · {unlinked.length} available to link</p>
        </div>
        <button onClick={() => setShowLink(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
          style={{ background: "linear-gradient(135deg,#f6d860,#c98a14)", color: "#0d1b2a" }}>
          <Link2 className="w-3.5 h-3.5" /> Link a Code
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: G.dim }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code, customer, Google email…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}` }} />
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: G.text }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.25)" }}>
          <Link2 className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="text-sm">No linked customers yet. Click “Link a Code” to assign a code to a Google account.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(code => {
            const profile = profileMap[code.linked_user_id] || {};
            const status = overallStatus(code);
            const active = activePages(code);
            const isExp = expanded === code.id;
            return (
              <div key={code.id} className="rounded-xl border" style={{ background: G.bg, borderColor: code.is_disabled ? "rgba(107,114,128,0.25)" : G.border }}>
                <div className="p-3.5 space-y-2">
                  {/* Row 1: code + status + actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <KeyRound className="w-3.5 h-3.5 flex-shrink-0" style={{ color: G.text }} />
                      <span className="font-inter font-bold text-white tracking-widest text-xs">{code.code}</span>
                      <button onClick={() => setExpanded(isExp ? null : code.id)} className="text-white/30 hover:text-white/60">
                        {isExp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0" style={{ background: status.color + "18", color: status.color, border: `1px solid ${status.color}40` }}>{status.label}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setRenewTarget(code)} title="Renew"
                        className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "rgba(245,158,11,0.10)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}><RefreshCw className="w-3 h-3" /></button>
                      {isOwner && (
                        <>
                          <button onClick={() => setTransferTarget(code)} title="Transfer"
                            className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "rgba(96,165,250,0.10)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)" }}><ArrowRightLeft className="w-3 h-3" /></button>
                          <button onClick={() => setUnlinkTarget(code)} title="Unlink"
                            className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "rgba(239,68,68,0.10)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}><Unlink className="w-3 h-3" /></button>
                          <button onClick={() => handleToggleDisable(code)} disabled={toggling === code.id} title={code.is_disabled ? "Enable" : "Disable"}
                            className="w-6 h-6 rounded flex items-center justify-center disabled:opacity-50"
                            style={{ background: code.is_disabled ? "rgba(34,197,94,0.10)" : "rgba(107,114,128,0.10)", color: code.is_disabled ? "#4ade80" : "#9ca3af", border: `1px solid ${code.is_disabled ? "rgba(34,197,94,0.25)" : "rgba(107,114,128,0.25)"}` }}>
                            {code.is_disabled ? <ToggleLeft className="w-3 h-3" /> : <ToggleRight className="w-3 h-3" />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Row 2: customer info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-white/55">
                    <span className="flex items-center gap-1.5"><UserCircle2 className="w-3 h-3" style={{ color: G.dim }} /> {profile.full_name || code.customer_name || "—"}</span>
                    <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" style={{ color: G.dim }} /> {code.linked_user_email || "—"}</span>
                    <span className="flex items-center gap-1.5"><KeyRound className="w-3 h-3" style={{ color: G.dim }} /> Linked by: {code.linked_by_name || (code.linked_by ? "Customer self-service" : "—")}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" style={{ color: G.dim }} /> Last login: {profile.last_login ? fmtDate(profile.last_login) : "—"}</span>
                  </div>

                  {/* Row 3: active pages */}
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] text-white/35">Active ({active.length}/{(code.page_paths || []).length}):</span>
                    {active.slice(0, 4).map((p, i) => {
                      const name = (code.page_names || code.page_paths || [])[code.page_paths.indexOf(p)] || p;
                      return <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-semibold" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>{name}</span>;
                    })}
                    {active.length > 4 && <span className="px-1.5 py-0.5 rounded text-[9px] text-white/40">+{active.length - 4} more</span>}
                  </div>

                  {/* Expanded: per-page expiry + renewal history */}
                  <AnimatePresence>
                    {isExp && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                        <div className="pt-2 border-t space-y-3" style={{ borderColor: "rgba(212,175,55,0.12)" }}>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: G.dim }}>Independent Page Expiry</p>
                            <div className="space-y-1">
                              {(code.page_paths || []).map((p, i) => {
                                const ps = pageState(code, p);
                                const name = (code.page_names || [])[i] || p;
                                return (
                                  <div key={p} className="flex items-center justify-between text-[10px]">
                                    <span className="text-white/65">{name}</span>
                                    <span style={{ color: ps.active ? "#4ade80" : "#f59e0b" }}>
                                      {ps.expiry === null ? "Lifetime" : `${fmtDate(ps.expiry)} · ${ps.active ? "active" : "expired"}`}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: G.dim }}>Renewal History</p>
                            {(code.renewal_history || []).length === 0 ? (
                              <p className="text-[10px] text-white/30">No renewals yet.</p>
                            ) : (
                              <div className="space-y-1">
                                {(code.renewal_history || []).slice().reverse().map((r, i) => (
                                  <div key={i} className="text-[10px] text-white/55 flex justify-between">
                                    <span>{fmtDate(r.renewed_at)}</span>
                                    <span className="text-white/40">{r.duration_type || ""} {r.duration_count || ""} → {r.new_expiry ? fmtDate(r.new_expiry) : "Lifetime"}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-[9px] text-white/30 break-all">Google User ID: {code.linked_user_id}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showLink && <LinkModal codes={unlinked} onClose={() => setShowLink(false)} onLinked={load} />}
        {unlinkTarget && <UnlinkConfirm code={unlinkTarget} onClose={() => setUnlinkTarget(null)} onDone={load} />}
        {transferTarget && <TransferModal code={transferTarget} onClose={() => setTransferTarget(null)} onDone={load} />}
        {renewTarget && <RenewCodeModal code={renewTarget} onClose={() => setRenewTarget(null)} onRenewed={() => { setRenewTarget(null); load(); }} />}
      </AnimatePresence>
    </div>
  );
}