import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Users, Search, Mail, Phone, Clock, Crown, Ban,
  AlertTriangle, X, Archive, RotateCcw, MessageSquare, UserMinus
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import WhatsAppMessenger from "./WhatsAppMessenger";

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

// ── Action config map ─────────────────────────────────────────────────────────
const ACTION_CFG = {
  remove:   { title: "Remove User",    btn: "Remove",       color: "#f59e0b", gradient: "linear-gradient(135deg,#f59e0b,#d97706)" },
  restore:  { title: "Restore to Active", btn: "Restore",   color: "#22c55e", gradient: "linear-gradient(135deg,#22c55e,#16a34a)" },
  block:    { title: "Block User",     btn: "Block User",   color: "#ef4444", gradient: "linear-gradient(135deg,#ef4444,#b91c1c)" },
  unblock:  { title: "Unblock User",   btn: "Unblock",      color: "#22c55e", gradient: "linear-gradient(135deg,#22c55e,#16a34a)" },
  archive:  { title: "Archive User",   btn: "Archive User", color: "#a855f7", gradient: "linear-gradient(135deg,#a855f7,#7c3aed)" },
  unarchive:{ title: "Restore from Archive", btn: "Restore", color: "#22c55e", gradient: "linear-gradient(135deg,#22c55e,#16a34a)" },
};

const ACTION_NOTICES = {
  remove: { color: "rgba(245,158,11,0.80)", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.30)", icon: UserMinus, text: "Removed users are hidden from the Active list but can still log in, use subscriptions, and access their pages. They can be restored at any time." },
  block:  { color: "rgba(239,68,68,0.80)",  bg: "rgba(239,68,68,0.07)",  border: "rgba(239,68,68,0.30)",  icon: Ban,       text: "Blocked customers cannot use protected pages, subscriptions, or linked codes." },
  archive:{ color: "rgba(168,85,247,0.80)", bg: "rgba(168,85,247,0.07)", border: "rgba(168,85,247,0.30)", icon: Archive,   text: "Archived customers lose protected access. Historical data is kept for restoration." },
};

// ── Status Action Modal ───────────────────────────────────────────────────────
function StatusModal({ user, profile, action, onClose, onDone }) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const cfg = ACTION_CFG[action];
  const notice = ACTION_NOTICES[action];
  const needsReason = ["remove", "block", "archive"].includes(action);

  const handle = async () => {
    setProcessing(true);
    try {
      const me = await base44.auth.me();
      const existing = await base44.entities.UserAccessProfile.filter({ user_id: user.id }, null, 1);

      const now = new Date().toISOString();
      const cleanFields = { removed_at: null, removed_by: null, remove_reason: null, blocked_at: null, blocked_by: null, block_reason: null, archived_at: null, archived_by: null, archive_reason: null };

      let update = { ...cleanFields };
      if (action === "remove")    update = { ...cleanFields, account_status: "REMOVED",  removed_at: now,  removed_by: me.id,   remove_reason: reason || "Removed by admin" };
      if (action === "restore")   update = { ...cleanFields, account_status: "ACTIVE" };
      if (action === "block")     update = { ...cleanFields, account_status: "BLOCKED",  blocked_at: now,  blocked_by: me.id,   block_reason: reason || "Blocked by admin" };
      if (action === "unblock")   update = { ...cleanFields, account_status: "ACTIVE" };
      if (action === "archive")   update = { ...cleanFields, account_status: "ARCHIVED", archived_at: now, archived_by: me.id,  archive_reason: reason || "Archived by admin" };
      if (action === "unarchive") update = { ...cleanFields, account_status: "ACTIVE" };

      // Enforce a block at the authenticated account level as well as the
      // dashboard display record. The server rejects changes to owner accounts.
      if (["block", "archive", "unblock", "unarchive", "restore"].includes(action)) {
        const { supabase } = await import("@/api/base44Client");
        const { error } = await supabase.rpc("set_customer_status", {
          p_user_id: user.id,
          p_status: ["block", "archive"].includes(action) ? "disabled" : "active",
        });
        if (error) throw error;
      }
      if (existing.length > 0) {
        await base44.entities.UserAccessProfile.update(existing[0].id, update);
      } else {
        await base44.entities.UserAccessProfile.create({
          user_id: user.id, email: user.email, full_name: user.full_name || "",
          ...update,
        });
      }
      toast({ title: `✓ ${user.full_name || user.email} — ${cfg.btn}` });
      onDone();
      onClose();
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
        className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: `1px solid ${cfg.color}88` }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-inter font-bold text-white text-base">{cfg.title}</h3>
            <p className="text-xs text-white/40 mt-0.5">{user.full_name || user.email}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "rgba(255,255,255,0.40)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {notice && (
          <div className="rounded-xl border p-3 flex items-start gap-2" style={{ background: notice.bg, borderColor: notice.border }}>
            <notice.icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: notice.color }} />
            <p className="text-xs" style={{ color: notice.color }}>{notice.text}</p>
          </div>
        )}

        {profile?.block_reason && action === "unblock" && (
          <p className="text-xs text-white/45 italic">Blocked for: "{profile.block_reason}"</p>
        )}
        {profile?.archive_reason && action === "unarchive" && (
          <p className="text-xs text-white/45 italic">Archived for: "{profile.archive_reason}"</p>
        )}
        {profile?.remove_reason && action === "restore" && (
          <p className="text-xs text-white/45 italic">Removed for: "{profile.remove_reason}"</p>
        )}

        {needsReason && (
          <div>
            <label className="text-xs text-white/40 mb-1 block">Reason (optional)</label>
            <input value={reason} onChange={e => setReason(e.target.value)}
              placeholder="e.g. Violation of terms"
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${cfg.color}40` }} />
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>Cancel</button>
          <button onClick={handle} disabled={processing}
            className="flex-1 py-3 rounded-xl text-sm font-bold disabled:opacity-50"
            style={{ background: cfg.gradient, color: "white" }}>
            {processing ? "…" : cfg.btn}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Single User Row ───────────────────────────────────────────────────────────
const STATUS_COLORS = { BLOCKED: "#ef4444", ARCHIVED: "#a855f7", REMOVED: "#f59e0b" };

function UserRow({ u, subTab, onAction, onWhatsApp }) {
  const navigate = useNavigate();
  const status = u.profile?.account_status || "ACTIVE";
  const statusColor = STATUS_COLORS[status] || "rgba(255,255,255,0.25)";
  const phone = u.profile?.mobile || u.mobile;

  const rowBg = status === "BLOCKED" ? "rgba(239,68,68,0.04)" : status === "ARCHIVED" ? "rgba(168,85,247,0.04)" : status === "REMOVED" ? "rgba(245,158,11,0.04)" : G.bg;
  const rowBorder = status === "BLOCKED" ? "rgba(239,68,68,0.22)" : status === "ARCHIVED" ? "rgba(168,85,247,0.22)" : status === "REMOVED" ? "rgba(245,158,11,0.22)" : G.border;

  return (
    <div className="rounded-xl border p-3.5 flex items-center gap-3" style={{ background: rowBg, borderColor: rowBorder }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
        style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>
        {(u.profile?.full_name || u.full_name || u.email || "?")[0].toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-inter font-bold text-white text-sm truncate">{u.profile?.full_name || u.full_name || "Unnamed"}</p>
          {u.profile?.lifetime_access && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.30)" }}>
              <Crown className="w-3 h-3 inline" />
            </span>
          )}
          {status !== "ACTIVE" && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}40` }}>
              {status}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
          <span className="text-xs text-white/40 flex items-center gap-1"><Mail className="w-3 h-3" />{u.email || "—"}</span>
          {phone && <span className="text-xs text-white/40 flex items-center gap-1"><Phone className="w-3 h-3" />{phone}</span>}
          <span className="text-xs text-white/35 flex items-center gap-1"><Clock className="w-3 h-3" />{u.profile?.last_login ? fmt(u.profile.last_login) : "—"}</span>
        </div>
        {(u.profile?.block_reason || u.profile?.archive_reason || u.profile?.remove_reason) && (
          <p className="text-[10px] text-white/30 mt-0.5 italic">
            {u.profile.block_reason || u.profile.archive_reason || u.profile.remove_reason}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1 flex-shrink-0 items-end">
        <button onClick={() => navigate(`/admin/user-detail/${u.id}`)}
          className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
          style={{ background: "rgba(59,130,246,0.10)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }}>
          Details
        </button>

        {phone && (
          <button onClick={() => onWhatsApp(u)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1"
            style={{ background: "rgba(37,211,102,0.10)", color: "#25D366", border: "1px solid rgba(37,211,102,0.22)" }}>
            <MessageSquare className="w-3 h-3" /> WA
          </button>
        )}

        {subTab === "active" && (
          <div className="flex gap-1">
            <button onClick={() => onAction(u, "remove")}
              className="px-2 py-0.5 rounded text-[10px] font-bold"
              style={{ background: "rgba(245,158,11,0.10)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>
              Remove
            </button>
            <button onClick={() => onAction(u, "block")}
              className="px-2 py-0.5 rounded text-[10px] font-bold"
              style={{ background: "rgba(239,68,68,0.10)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.22)" }}>
              Block
            </button>
          </div>
        )}
        {subTab === "removed" && (
          <div className="flex gap-1">
            <button onClick={() => onAction(u, "restore")}
              className="px-2 py-0.5 rounded text-[10px] font-bold"
              style={{ background: "rgba(34,197,94,0.10)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}>
              Restore
            </button>
            <button onClick={() => onAction(u, "block")}
              className="px-2 py-0.5 rounded text-[10px] font-bold"
              style={{ background: "rgba(239,68,68,0.10)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.22)" }}>
              Block
            </button>
          </div>
        )}
        {subTab === "blocked" && (
          <button onClick={() => onAction(u, "unblock")}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
            style={{ background: "rgba(34,197,94,0.10)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}>
            Unblock
          </button>
        )}
        {subTab === "archived" && (
          <button onClick={() => onAction(u, "unarchive")}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1"
            style={{ background: "rgba(34,197,94,0.10)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}>
            <RotateCcw className="w-3 h-3" /> Restore
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const SUB_TABS = [
  { id: "active",   label: "Active Users",   color: "#4ade80" },
  { id: "removed",  label: "Removed Users",  color: "#f59e0b" },
  { id: "blocked",  label: "Blocked Users",  color: "#ef4444" },
  { id: "archived", label: "Archived Users", color: "#a855f7" },
];

const TAB_NOTICES = {
  removed:  "Removed users are hidden from Active but can still log in, use subscriptions, and access their pages.",
  blocked:  "Blocked users cannot log in, receive OTP, access pages, use subscriptions, or redeem codes.",
  archived: "Archived users cannot log in. All historical data is preserved. Restore to reactivate.",
};

export default function UsersManagementTab({ users, profiles, onRefresh }) {
  const [search, setSearch] = useState("");
  const [subTab, setSubTab] = useState("active");
  const [modal, setModal] = useState(null);
  const [waTarget, setWaTarget] = useState(null);

  const enriched = useMemo(() => users.map(u => ({
    ...u,
    profile: profiles.find(p => p.user_id === u.id),
  })), [users, profiles]);

  const counts = useMemo(() => ({
    active:   enriched.filter(u => !u.profile?.account_status || u.profile.account_status === "ACTIVE").length,
    removed:  enriched.filter(u => u.profile?.account_status === "REMOVED").length,
    blocked:  enriched.filter(u => u.profile?.account_status === "BLOCKED").length,
    archived: enriched.filter(u => u.profile?.account_status === "ARCHIVED").length,
  }), [enriched]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const bySearch = q
      ? enriched.filter(u => (u.email || "").toLowerCase().includes(q) || (u.full_name || "").toLowerCase().includes(q))
      : enriched;
    if (subTab === "active")   return bySearch.filter(u => !u.profile?.account_status || u.profile.account_status === "ACTIVE");
    if (subTab === "removed")  return bySearch.filter(u => u.profile?.account_status === "REMOVED");
    if (subTab === "blocked")  return bySearch.filter(u => u.profile?.account_status === "BLOCKED");
    if (subTab === "archived") return bySearch.filter(u => u.profile?.account_status === "ARCHIVED");
    return bySearch;
  }, [enriched, search, subTab]);

  return (
    <div className="space-y-4">
      {/* Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SUB_TABS.map(st => (
          <button key={st.id} onClick={() => setSubTab(st.id)}
            className="rounded-xl border p-3 text-center transition-all"
            style={{
              background: subTab === st.id ? `${st.color}14` : G.bg,
              borderColor: subTab === st.id ? `${st.color}55` : G.border,
            }}>
            <p className="text-xl font-bold" style={{ color: st.color }}>{counts[st.id]}</p>
            <p className="text-[11px] text-white/45 mt-0.5 leading-tight">{st.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: G.dim }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}` }} />
      </div>

      {/* Active sub-tab pills */}
      <div className="flex gap-2 flex-wrap">
        {SUB_TABS.map(st => (
          <button key={st.id} onClick={() => setSubTab(st.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: subTab === st.id ? `${st.color}18` : "rgba(255,255,255,0.03)",
              border: `1px solid ${subTab === st.id ? `${st.color}50` : "rgba(255,255,255,0.07)"}`,
              color: subTab === st.id ? st.color : "rgba(255,255,255,0.40)",
            }}>
            {st.label.split(" ")[0]}
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
              style={{ background: subTab === st.id ? `${st.color}25` : "rgba(255,255,255,0.06)", color: subTab === st.id ? st.color : "rgba(255,255,255,0.25)" }}>
              {counts[st.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Notice for restricted tabs */}
      {TAB_NOTICES[subTab] && filtered.length > 0 && (
        <div className="rounded-xl border p-3 text-xs"
          style={{
            background: subTab === "blocked" ? "rgba(239,68,68,0.06)" : subTab === "archived" ? "rgba(168,85,247,0.06)" : "rgba(245,158,11,0.06)",
            borderColor: subTab === "blocked" ? "rgba(239,68,68,0.25)" : subTab === "archived" ? "rgba(168,85,247,0.25)" : "rgba(245,158,11,0.25)",
            color: subTab === "blocked" ? "rgba(239,68,68,0.80)" : subTab === "archived" ? "rgba(168,85,247,0.80)" : "rgba(245,158,11,0.80)",
          }}>
          {TAB_NOTICES[subTab]}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-14" style={{ color: "rgba(255,255,255,0.25)" }}>
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No users in this category</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <UserRow key={u.id} u={u} subTab={subTab}
              onAction={(user, action) => setModal({ user, action })}
              onWhatsApp={u => setWaTarget({ name: u.full_name || u.full_name, mobile: u.profile?.mobile || u.mobile, email: u.email })}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <StatusModal
            user={modal.user}
            profile={profiles.find(p => p.user_id === modal.user.id)}
            action={modal.action}
            onClose={() => setModal(null)}
            onDone={onRefresh}
          />
        )}
        {waTarget && <WhatsAppMessenger user={waTarget} onClose={() => setWaTarget(null)} />}
      </AnimatePresence>
    </div>
  );
}