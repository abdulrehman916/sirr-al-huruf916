import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Users, Shield, CheckCircle, XCircle, Plus, Trash2, Search, ChevronDown, ChevronUp, Clock, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ROUTE_PERMISSION_MAP } from "@/lib/permissionCodes";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

const DURATION_OPTIONS = [
  { value: "7",         label: "7 Days",    days: 7 },
  { value: "30",        label: "30 Days",   days: 30 },
  { value: "90",        label: "3 Months",  days: 90 },
  { value: "180",       label: "6 Months",  days: 180 },
  { value: "365",       label: "1 Year",    days: 365 },
  { value: "permanent", label: "Permanent", days: 36500 },
];

// Only pages that can have individual user permissions (non-admin, non-public-locked)
const GRANTABLE_PAGES = Object.entries(ROUTE_PERMISSION_MAP)
  .filter(([_, c]) => !c.adminOnly && c.code)
  .map(([path, c]) => ({ path, name: c.name, code: c.code }))
  .sort((a, b) => a.name.localeCompare(b.name));

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function isExpired(d) {
  return new Date(d) < new Date();
}

// ── Grant Multi-Page Modal ────────────────────────────────────────────────────
function GrantModal({ user, existingPaths, onClose, onGranted }) {
  const { toast } = useToast();
  const [selectedPages, setSelectedPages] = useState([]);
  const [duration, setDuration] = useState("30");
  const [processing, setProcessing] = useState(false);

  const available = GRANTABLE_PAGES.filter(p => !existingPaths.includes(p.path));

  const togglePage = (path) => {
    setSelectedPages(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const handleGrant = async () => {
    if (!selectedPages.length) {
      toast({ title: "Select at least one page", variant: "destructive" });
      return;
    }
    setProcessing(true);
    const dur = DURATION_OPTIONS.find(d => d.value === duration);
    const now = new Date();
    const expiry = new Date(now.getTime() + dur.days * 86400000).toISOString();

    let granted = 0;
    let failed = [];
    for (const path of selectedPages) {
      const page = GRANTABLE_PAGES.find(p => p.path === path);
      try {
        await base44.functions.invoke("grantPagePermission", {
          user_id: user.id,
          page_path: path,
          page_name: page.name,
          permission_code: page.code,
          start_date: now.toISOString(),
          expiry_date: expiry,
        });
        granted++;
      } catch (e) {
        // 409 = already exists, still count as ok
        if (e?.response?.status === 409) granted++;
        else failed.push(page.name);
      }
    }

    setProcessing(false);
    if (granted > 0) {
      toast({ title: `✓ Granted ${granted} page(s) to ${user.full_name || user.email}` });
      onGranted();
      onClose();
    }
    if (failed.length) {
      toast({ title: `Failed: ${failed.join(", ")}`, variant: "destructive" });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="w-full max-w-lg rounded-2xl p-6 space-y-5"
        style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: `1px solid ${G.borderHi}` }}
        onClick={e => e.stopPropagation()}
      >
        <div>
          <h2 className="font-inter font-bold text-white text-lg">Grant Page Access</h2>
          <p className="text-white/50 text-sm mt-1">
            {user.full_name || "User"} · <span className="font-mono">{user.email}</span>
          </p>
        </div>

        {/* Duration */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: G.dim }}>Duration</p>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDuration(opt.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: duration === opt.value ? G.bgHi : "rgba(255,255,255,0.04)",
                  border: `1px solid ${duration === opt.value ? G.borderHi : "rgba(255,255,255,0.08)"}`,
                  color: duration === opt.value ? G.text : "rgba(255,255,255,0.60)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Page selection */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: G.dim }}>
            Select Pages ({selectedPages.length} selected)
          </p>
          {available.length === 0 ? (
            <p className="text-white/40 text-sm">All available pages already granted.</p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {available.map(page => {
                const sel = selectedPages.includes(page.path);
                return (
                  <button
                    key={page.path}
                    onClick={() => togglePage(page.path)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all"
                    style={{
                      background: sel ? G.bgHi : "rgba(255,255,255,0.03)",
                      border: `1px solid ${sel ? G.borderHi : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                      style={{
                        background: sel ? G.text : "transparent",
                        border: `1px solid ${sel ? G.text : "rgba(255,255,255,0.30)"}`,
                      }}
                    >
                      {sel && <CheckCircle className="w-3 h-3 text-black" />}
                    </div>
                    <span className="font-inter text-sm font-medium" style={{ color: sel ? "white" : "rgba(255,255,255,0.70)" }}>
                      {page.name}
                    </span>
                    <span className="ml-auto font-mono text-xs text-white/25">{page.path}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            className="flex-1 border-white/20 text-white/60 hover:bg-white/5"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 btn-gold"
            disabled={processing || !selectedPages.length}
            onClick={handleGrant}
          >
            {processing ? "Granting..." : `Grant ${selectedPages.length} Page(s)`}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── User Row ──────────────────────────────────────────────────────────────────
function UserRow({ user, permissions, onRefresh }) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [showGrant, setShowGrant] = useState(false);
  const [revoking, setRevoking] = useState(null);

  const activePerms = permissions.filter(p => p.is_active && !p.is_revoked && !isExpired(p.expiry_date));
  const allActivePerms = permissions.filter(p => p.is_active && !p.is_revoked);
  const existingPaths = allActivePerms.map(p => p.page_path);

  const handleRevoke = async (perm) => {
    if (!confirm(`Revoke "${perm.page_name}" for ${user.full_name || user.email}?`)) return;
    setRevoking(perm.permission_id);
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
    } finally {
      setRevoking(null);
    }
  };

  return (
    <>
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: G.bg, borderColor: G.border }}
      >
        {/* Header row */}
        <div
          className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="flex-1 min-w-0">
            <p className="font-inter font-bold text-white truncate">{user.full_name || "Unnamed User"}</p>
            <p className="text-xs text-white/50 truncate font-mono">{user.email}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Badge
              className="text-xs font-semibold"
              style={{
                background: activePerms.length > 0 ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
                color: activePerms.length > 0 ? "#4ade80" : "rgba(255,255,255,0.40)",
                border: `1px solid ${activePerms.length > 0 ? "rgba(34,197,94,0.40)" : "rgba(255,255,255,0.10)"}`,
              }}
            >
              {activePerms.length} Active
            </Badge>
            <Button
              size="sm"
              className="btn-gold h-8 text-xs px-3"
              onClick={e => { e.stopPropagation(); setShowGrant(true); }}
            >
              <Plus className="w-3 h-3 mr-1" /> Grant
            </Button>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-white/40" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/40" />
            )}
          </div>
        </div>

        {/* Expanded permissions */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
                {permissions.length === 0 ? (
                  <p className="text-white/40 text-sm pt-3">No permissions yet.</p>
                ) : (
                  <div className="pt-3 space-y-2">
                    {permissions.map(perm => {
                      const expired = isExpired(perm.expiry_date);
                      const revoked = perm.is_revoked;
                      let statusColor = "rgba(34,197,94,0.80)";
                      let statusLabel = "Active";
                      if (revoked) { statusColor = "#ef4444"; statusLabel = "Revoked"; }
                      else if (expired) { statusColor = "#f59e0b"; statusLabel = "Expired"; }

                      return (
                        <div
                          key={perm.id}
                          className="flex items-center gap-3 p-3 rounded-lg"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: `1px solid rgba(255,255,255,0.06)`,
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: statusColor }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-inter text-sm font-semibold text-white truncate">{perm.page_name}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs font-mono" style={{ color: G.dim }}>{perm.page_path}</span>
                              <span className="text-xs text-white/40 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {expired ? "Expired" : "Expires"}: {formatDate(perm.expiry_date)}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ color: statusColor, background: `${statusColor}18` }}>
                            {statusLabel}
                          </span>
                          {!revoked && !expired && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 border-red-500/40 text-red-400 hover:bg-red-500/10 flex-shrink-0"
                              disabled={revoking === perm.permission_id}
                              onClick={() => handleRevoke(perm)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
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

      {/* Grant modal */}
      <AnimatePresence>
        {showGrant && (
          <GrantModal
            user={user}
            existingPaths={existingPaths}
            onClose={() => setShowGrant(false)}
            onGranted={onRefresh}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminUserPermissions() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const me = await base44.auth.me();
      if (!me || !["owner", "admin"].includes(me.role)) {
        setIsAdmin(false);
        return;
      }
      setIsAdmin(true);
      await loadData();
    } catch {
      setIsAdmin(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, allPerms] = await Promise.all([
        base44.entities.User.list(null, 500),
        base44.entities.PagePermission.list(null, 500),
      ]);
      setUsers(allUsers);
      setPermissions(allPerms);
    } catch (e) {
      toast({ title: "Load failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(u =>
      (u.email || "").toLowerCase().includes(q) ||
      (u.full_name || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalActive = permissions.filter(p => p.is_active && !p.is_revoked && !isExpired(p.expiry_date)).length;

  if (isAdmin === false) return <Navigate to="/" replace />;

  if (isAdmin === null || loading) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-yellow-400 border-r-transparent border-b-yellow-400 border-l-transparent rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageTitle arabic="أذونات المستخدمين" latin="User Permissions" subtitle="Owner Access Control" icon="🔑" />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Users", value: users.length, icon: Users },
            { label: "Active Permissions", value: totalActive, icon: CheckCircle },
            { label: "Pages Available", value: GRANTABLE_PAGES.length, icon: Shield },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="p-4 rounded-xl border text-center" style={{ background: G.bg, borderColor: G.border }}>
              <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: G.text }} />
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/50 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${G.border}`,
            }}
          />
        </div>

        {/* Users */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map(user => (
              <UserRow
                key={user.id}
                user={user}
                permissions={permissions.filter(p => p.user_id === user.id)}
                onRefresh={loadData}
              />
            ))}
          </div>
        )}
      </motion.div>
    </PageLayout>
  );
}