import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Crown, Shield, User as UserIcon, Trash2, X,
  ArrowUpCircle, ArrowDownCircle, Loader2, Mail, Clock
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { ADMIN_CONFIG } from "@/lib/adminConfig";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

const ROLE = {
  OWNER: { label: "Owner", color: "#E8C84A", icon: Crown },
  ADMIN: { label: "Admin", color: "#60a5fa", icon: Shield },
  GUEST: { label: "Guest", color: "rgba(255,255,255,0.55)", icon: UserIcon },
};

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Avatar({ user, profile, size = 40 }) {
  const photo = profile?.photo_url || user?.photo_url;
  const name = profile?.full_name || user?.full_name || user?.email || "?";
  if (photo) {
    return (
      <img src={photo} alt={name} className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size, border: `1px solid ${G.border}` }} />
    );
  }
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0 font-bold"
      style={{ width: size, height: size, background: G.bgHi, color: G.text, border: `1px solid ${G.border}`, fontSize: size * 0.38 }}>
      {name[0].toUpperCase()}
    </div>
  );
}

function RoleBadge({ role }) {
  const r = ROLE[role];
  const Icon = r.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold"
      style={{ background: `${r.color}18`, color: r.color, border: `1px solid ${r.color}40` }}>
      <Icon className="w-3 h-3" /> {r.label}
    </span>
  );
}

// ── Confirm / Action modal ──────────────────────────────────────────────────
const CFG = {
  promote:      { title: "Promote to Admin", btn: "Promote", color: "#60a5fa", grad: "linear-gradient(135deg,#60a5fa,#2563eb)", desc: "This Guest will receive Admin permissions on their next sign-in." },
  demote:       { title: "Demote to Guest",   btn: "Demote",  color: "#f59e0b", grad: "linear-gradient(135deg,#f59e0b,#d97706)", desc: "This Admin will immediately lose all Admin permissions." },
  disableAdmin: { title: "Disable Admin",    btn: "Disable", color: "#ef4444", grad: "linear-gradient(135deg,#ef4444,#b91c1c)", desc: "Admin will lose access until re-enabled." },
  enableAdmin:  { title: "Enable Admin",     btn: "Enable",  color: "#22c55e", grad: "linear-gradient(135deg,#22c55e,#16a34a)", desc: "Admin permissions will be restored." },
  disableUser:  { title: "Disable User",      btn: "Disable", color: "#ef4444", grad: "linear-gradient(135deg,#ef4444,#b91c1c)", desc: "User will be blocked from signing in." },
  deleteUser:   { title: "Delete User",      btn: "Delete",  color: "#ef4444", grad: "linear-gradient(135deg,#ef4444,#b91c1c)", desc: "Removes this user's Guest profile only. Reading codes, access codes, purchases and logs are never deleted." },
};

function ActionModal({ user, profile, action, adminProfile, onClose, onDone }) {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const cfg = CFG[action];

  const handle = async () => {
    setProcessing(true);
    try {
      const me = await base44.auth.me();
      if (action === "promote") {
        await base44.functions.invoke("manageAdminProfile", {
          action: "CREATE",
          email: user.email,
          full_name: profile?.full_name || user.full_name || "",
          whatsapp_number: profile?.mobile || "",
          permissions: {},
        });
      } else if (action === "demote") {
        await base44.functions.invoke("manageAdminProfile", { action: "DELETE", admin_profile_id: adminProfile.admin_profile_id });
      } else if (action === "disableAdmin") {
        await base44.functions.invoke("manageAdminProfile", { action: "DISABLE", admin_profile_id: adminProfile.admin_profile_id });
      } else if (action === "enableAdmin") {
        await base44.functions.invoke("manageAdminProfile", { action: "ENABLE", admin_profile_id: adminProfile.admin_profile_id });
      } else if (action === "disableUser") {
        const existing = await base44.entities.UserAccessProfile.filter({ user_id: user.id }, null, 1);
        if (existing.length > 0) {
          await base44.entities.UserAccessProfile.update(existing[0].id, {
            account_status: "BLOCKED",
            blocked_at: new Date().toISOString(),
            blocked_by: me.id,
            block_reason: "Disabled by owner",
          });
        }
      } else if (action === "deleteUser") {
        // Remove ONLY the UserAccessProfile. Never touch Reading Codes,
        // Access Codes, Purchases, or Logs.
        const existing = await base44.entities.UserAccessProfile.filter({ user_id: user.id }, null, 1);
        if (existing.length > 0) {
          await base44.entities.UserAccessProfile.delete(existing[0].id);
        }
      }
      toast({ title: `✓ ${cfg.btn} — ${user.full_name || user.email}` });
      onDone();
      onClose();
    } catch (e) {
      toast({ title: "Error", description: e?.response?.data?.error || e.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="relative w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: `1px solid ${cfg.color}88` }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "rgba(255,255,255,0.40)" }}>
          <X className="w-4 h-4" />
        </button>
        <div>
          <h3 className="font-inter font-bold text-white text-base">{cfg.title}</h3>
          <p className="text-xs text-white/45 mt-0.5">{user.full_name || user.email}</p>
        </div>
        <div className="rounded-xl border p-3" style={{ background: `${cfg.color}10`, borderColor: `${cfg.color}30` }}>
          <p className="text-xs" style={{ color: cfg.color }}>{cfg.desc}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>Cancel</button>
          <button onClick={handle} disabled={processing} className="flex-1 py-3 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center"
            style={{ background: cfg.grad, color: "white" }}>
            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : cfg.btn}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Google Users tab ────────────────────────────────────────────────────
export default function GoogleUsersTab({ users, profiles, onRefresh }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [adminProfiles, setAdminProfiles] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [modal, setModal] = useState(null);

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const me = await base44.auth.me();
      setIsOwner(me?.email?.toLowerCase() === ADMIN_CONFIG.OWNER_EMAIL.toLowerCase());
      const res = await base44.functions.invoke("manageAdminProfile", { action: "GET_STATUS" });
      setAdminProfiles(res.data?.profiles || []);
    } catch (e) {
      toast({ title: "Failed to load admin profiles", description: e.message, variant: "destructive" });
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => { loadAdmins(); }, []);

  const enriched = useMemo(() => users.map(u => {
    const profile = profiles.find(p => p.user_id === u.id);
    const isOwnerUser = u.email?.toLowerCase() === ADMIN_CONFIG.OWNER_EMAIL.toLowerCase();
    const adminProfile = adminProfiles.find(p => p.email?.toLowerCase() === u.email?.toLowerCase());
    const isAdmin = !!adminProfile && adminProfile.status === "ACTIVE" && !adminProfile.is_owner;
    const role = isOwnerUser ? "OWNER" : isAdmin ? "ADMIN" : "GUEST";
    const status = isOwnerUser ? "Owner" : adminProfile ? adminProfile.status : profile?.account_status || "ACTIVE";
    return { u, profile, adminProfile, role, status, isOwnerUser, isAdmin };
  }), [users, profiles, adminProfiles]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return enriched;
    return enriched.filter(e =>
      (e.u.email || "").toLowerCase().includes(q) ||
      (e.profile?.full_name || e.u.full_name || "").toLowerCase().includes(q)
    );
  }, [enriched, search]);

  const counts = useMemo(() => ({
    total: enriched.length,
    owner: enriched.filter(e => e.role === "OWNER").length,
    admin: enriched.filter(e => e.role === "ADMIN").length,
    guest: enriched.filter(e => e.role === "GUEST").length,
  }), [enriched]);

  const onDone = () => { loadAdmins(); onRefresh(); };

  return (
    <div className="space-y-4">
      {/* Counters */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total",  value: counts.total, color: G.text },
          { label: "Owner",  value: counts.owner, color: "#E8C84A" },
          { label: "Admins", value: counts.admin, color: "#60a5fa" },
          { label: "Guests", value: counts.guest, color: "rgba(255,255,255,0.55)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border p-3 text-center" style={{ background: G.bg, borderColor: G.border }}>
            <p className="text-lg font-bold" style={{ color }}>{value}</p>
            <p className="text-[10px] text-white/40 mt-0.5">{label}</p>
          </div>
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

      {loadingAdmins ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: G.dim }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14" style={{ color: "rgba(255,255,255,0.25)" }}>
          <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No Google users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(({ u, profile, adminProfile, role, status, isOwnerUser }) => (
            <div key={u.id} className="rounded-xl border p-3.5 flex items-center gap-3" style={{ background: G.bg, borderColor: G.border }}>
              <Avatar user={u} profile={profile} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-inter font-bold text-white text-sm truncate">{profile?.full_name || u.full_name || "Unnamed"}</p>
                  <RoleBadge role={role} />
                  {status !== "ACTIVE" && status !== "Owner" && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.30)" }}>
                      {status}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  <span className="text-xs text-white/40 flex items-center gap-1"><Mail className="w-3 h-3" />{u.email || "—"}</span>
                  <span className="text-xs text-white/35 flex items-center gap-1"><Clock className="w-3 h-3" />{profile?.last_login ? fmt(profile.last_login) : "—"}</span>
                </div>
              </div>

              {/* Actions — Owner is never editable; only the Owner can act */}
              <div className="flex flex-col gap-1 flex-shrink-0 items-end">
                {isOwnerUser ? (
                  <span className="text-[10px] text-white/25 italic">Protected</span>
                ) : !isOwner ? (
                  <span className="text-[10px] text-white/25 italic">Owner only</span>
                ) : role === "GUEST" ? (
                  <>
                    <button onClick={() => setModal({ u, profile, action: "promote" })}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1"
                      style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.30)" }}>
                      <ArrowUpCircle className="w-3 h-3" /> Promote
                    </button>
                    <div className="flex gap-1">
                      <button onClick={() => setModal({ u, profile, action: "disableUser" })}
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{ background: "rgba(239,68,68,0.10)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                        Disable
                      </button>
                      <button onClick={() => setModal({ u, profile, action: "deleteUser" })}
                        className="px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5"
                        style={{ background: "rgba(239,68,68,0.10)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                        <Trash2 className="w-2.5 h-2.5" /> Delete
                      </button>
                    </div>
                  </>
                ) : role === "ADMIN" ? (
                  <>
                    <button onClick={() => setModal({ u, profile, adminProfile, action: "demote" })}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1"
                      style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.30)" }}>
                      <ArrowDownCircle className="w-3 h-3" /> Demote
                    </button>
                    <button onClick={() => setModal({ u, profile, adminProfile, action: adminProfile?.status === "DISABLED" ? "enableAdmin" : "disableAdmin" })}
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={adminProfile?.status === "DISABLED"
                        ? { background: "rgba(34,197,94,0.10)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }
                        : { background: "rgba(239,68,68,0.10)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                      {adminProfile?.status === "DISABLED" ? "Enable" : "Disable"}
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <ActionModal
            user={modal.u}
            profile={modal.profile}
            adminProfile={modal.adminProfile}
            action={modal.action}
            onClose={() => setModal(null)}
            onDone={onDone}
          />
        )}
      </AnimatePresence>
    </div>
  );
}