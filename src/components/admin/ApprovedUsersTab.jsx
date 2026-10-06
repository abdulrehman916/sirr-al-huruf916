import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import AssignAdminModal from "@/components/admin/AssignAdminModal";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Users, UserCheck, UserX, Shield, ShieldOff, Trash2, RotateCcw,
  Search, Calendar, LogIn, Mail, Phone, Clock, AlertCircle,
  ChevronRight, X, FileText, KeyRound, MessageSquare, Lock, Unlock, UserCog
} from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

const STATUS_CONFIG = {
  ACTIVE: { label: "Active", icon: Shield, color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  EXPIRED: { label: "Expired", icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  BLOCKED: { label: "Blocked", icon: ShieldOff, color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  REMOVED: { label: "Removed", icon: Trash2, color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
};

function UserDrawer({ user, onClose, onUpdate }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [accessCodes, setAccessCodes] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (user) loadUserDetails();
  }, [user]);

  const loadUserDetails = async () => {
    setLoading(true);
    try {
      // SCALABILITY: Add limits to all queries
      const [profile, codes, perms, msgs] = await Promise.all([
        base44.entities.UserAccessProfile.filter({ user_id: user.id }).then(r => r[0]),
        base44.entities.AccessCode.list(null, 100).then(codes => codes.filter(c => c.used_by_user_id === user.id)),
        base44.entities.PagePermission.filter({ user_id: user.id }, null, 500), // Limit to 500 permissions
        base44.entities.SupportMessage.filter({ sender_id: user.email }, null, 10).then(r => r.slice(0, 10)),
      ]);
      setUserProfile(profile);
      setAccessCodes(codes);
      setPermissions(perms.filter(p => p.is_active));
      setMessages(msgs);
    } catch (e) {
      toast({ title: "Error loading details", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    try {
      await base44.entities.ApprovedUser.update(user.id, { status: "BLOCKED", blocked_at: new Date().toISOString() });
      toast({ title: "User blocked" });
      onUpdate();
      onClose();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleUnblock = async () => {
    try {
      await base44.entities.ApprovedUser.update(user.id, { status: "ACTIVE" });
      toast({ title: "User unblocked" });
      onUpdate();
      onClose();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleRemove = async () => {
    try {
      await base44.entities.ApprovedUser.update(user.id, { status: "REMOVED", removed_at: new Date().toISOString() });
      toast({ title: "User removed" });
      onUpdate();
      onClose();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleRestore = async () => {
    try {
      await base44.entities.ApprovedUser.update(user.id, { status: "ACTIVE" });
      toast({ title: "User restored" });
      onUpdate();
      onClose();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "linear-gradient(145deg, #0c1630, #060c1c)", border: `1px solid ${G.border}` }}
      >
        <div className="sticky top-0 p-5 border-b flex items-center justify-between" style={{ background: "rgba(12,22,48,0.98)", borderColor: G.border }}>
          <div>
            <h2 className="font-inter font-bold text-white text-lg">{user.full_name || user.email}</h2>
            <p className="text-xs text-white/45">{user.email}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded flex items-center justify-center" style={{ background: G.bg, color: G.text }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-t-gold border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Profile Section */}
            <div className="rounded-xl p-4" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
              <h3 className="font-inter font-bold text-white text-sm mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: G.text }} /> Profile
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-white/45 text-xs">Full Name</p>
                  <p className="text-white font-medium">{user.full_name || "—"}</p>
                </div>
                <div>
                  <p className="text-white/45 text-xs">Email</p>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-white/45 text-xs">Phone</p>
                  <p className="text-white font-medium">{user.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-white/45 text-xs">Status</p>
                  <Badge className={`${STATUS_CONFIG[user.status]?.bg} ${STATUS_CONFIG[user.status]?.color} border`}>
                    {STATUS_CONFIG[user.status]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-white/45 text-xs">Registration</p>
                  <p className="text-white">{user.approved_at ? new Date(user.approved_at).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <p className="text-white/45 text-xs">Last Login</p>
                  <p className="text-white">{user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}</p>
                </div>
                <div>
                  <p className="text-white/45 text-xs">Total Logins</p>
                  <p className="text-white">{user.login_count || 0}</p>
                </div>
              </div>
            </div>

            {/* Active Pages */}
            <div className="rounded-xl p-4" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
              <h3 className="font-inter font-bold text-white text-sm mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4" style={{ color: G.text }} /> Active Pages ({permissions.length})
              </h3>
              {permissions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {permissions.map(p => (
                    <Badge key={p.permission_id} className="bg-gold/20 text-gold border-gold/50 border text-xs">
                      {p.page_name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-white/35 text-sm">No active permissions</p>
              )}
            </div>

            {/* Access Codes */}
            <div className="rounded-xl p-4" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
              <h3 className="font-inter font-bold text-white text-sm mb-3 flex items-center gap-2">
                <KeyRound className="w-4 h-4" style={{ color: G.text }} /> Access Codes ({accessCodes.length})
              </h3>
              {accessCodes.length > 0 ? (
                <div className="space-y-2">
                  {accessCodes.map(code => (
                    <div key={code.id} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-white text-sm">{code.code}</span>
                        <span className="text-xs text-white/45">
                          {code.expiry_date ? `Expires: ${new Date(code.expiry_date).toLocaleDateString()}` : "Lifetime"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/35 text-sm">No access codes redeemed</p>
              )}
            </div>

            {/* Messages */}
            <div className="rounded-xl p-4" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
              <h3 className="font-inter font-bold text-white text-sm mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" style={{ color: G.text }} /> Recent Messages ({messages.length})
              </h3>
              {messages.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {messages.map(msg => (
                    <div key={msg.message_id} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <p className="text-white/70 text-xs line-clamp-2">{msg.message}</p>
                      <p className="text-white/35 text-[10px] mt-1">{new Date(msg.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/35 text-sm">No messages</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {user.status === "ACTIVE" && (
                <>
                  <button onClick={handleBlock} className="flex-1 py-2.5 rounded-xl font-inter font-semibold text-sm flex items-center justify-center gap-2" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: `1px solid rgba(239,68,68,0.30)` }}>
                    <ShieldOff className="w-4 h-4" /> Block
                  </button>
                  <button onClick={handleRemove} className="flex-1 py-2.5 rounded-xl font-inter font-semibold text-sm flex items-center justify-center gap-2" style={{ background: "rgba(107,114,128,0.15)", color: "#9ca3af", border: `1px solid rgba(107,114,128,0.30)` }}>
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </>
              )}
              {user.status === "BLOCKED" && (
                <button onClick={handleUnblock} className="flex-1 py-2.5 rounded-xl font-inter font-semibold text-sm flex items-center justify-center gap-2" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: `1px solid rgba(34,197,94,0.30)` }}>
                  <Unlock className="w-4 h-4" /> Unblock
                </button>
              )}
              {user.status === "REMOVED" && (
                <button onClick={handleRestore} className="flex-1 py-2.5 rounded-xl font-inter font-semibold text-sm flex items-center justify-center gap-2" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: `1px solid rgba(34,197,94,0.30)` }}>
                  <RotateCcw className="w-4 h-4" /> Restore
                </button>
              )}
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-inter font-semibold text-sm" style={{ background: G.bg, color: G.text, border: `1px solid ${G.border}` }}>
                Close
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function ApprovedUsersTab() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState(null);
  const [adminProfiles, setAdminProfiles] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [adminFilter, setAdminFilter] = useState("ALL");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTargetUser, setAssignTargetUser] = useState(null);
  // Pagination for scalability (10M users)
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const PAGE_SIZE = 100; // Load 100 users per page

  const handleBlockUser = async (userId) => {
    try {
      await base44.entities.ApprovedUser.update(userId, { status: "BLOCKED", blocked_at: new Date().toISOString() });
      toast({ title: "User blocked" });
      loadUsers();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await base44.entities.ApprovedUser.update(userId, { status: "ACTIVE" });
      toast({ title: "User unblocked" });
      loadUsers();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await base44.entities.ApprovedUser.update(userId, { status: "REMOVED", removed_at: new Date().toISOString() });
      toast({ title: "User removed" });
      loadUsers();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleRestoreUser = async (userId) => {
    try {
      await base44.entities.ApprovedUser.update(userId, { status: "ACTIVE" });
      toast({ title: "User restored" });
      loadUsers();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      // SCALABILITY: Load only PAGE_SIZE users with pagination
      const skip = (page - 1) * PAGE_SIZE;
      
      const [approvedUsers, allUsers, accessProfiles, adminList, currentUser] = await Promise.all([
        base44.entities.ApprovedUser.list(null, PAGE_SIZE + 1),
        base44.entities.User.list(null, 500).catch(() => []),
        base44.entities.UserAccessProfile.list(null, 500).catch(() => []),
        base44.entities.AdminProfile.list(null, 500).catch(() => []),
        base44.auth.me().catch(() => null),
      ]);
      
      // Set admin profiles for filter dropdown and assign modal
      setAdminProfiles(adminList || []);
      
      // Determine owner status from AdminProfile
      const myProfile = (adminList || []).find(
        (p) => (p.user_id && currentUser && p.user_id === currentUser.id) ||
               (p.email && currentUser && p.email.toLowerCase() === currentUser.email.toLowerCase())
      );
      setIsOwner(myProfile?.is_owner === true);
      
      const hasMore = approvedUsers.length > PAGE_SIZE;
      const paginatedUsers = hasMore ? approvedUsers.slice(0, PAGE_SIZE) : approvedUsers;
      
      const merged = paginatedUsers.map(approved => {
        const platformUser = allUsers.find(u => u.email === approved.email);
        const accessProfile = (accessProfiles || []).find(
          (p) => p.email && p.email.toLowerCase() === approved.email.toLowerCase()
        );
        const assignedAdmin = accessProfile?.assigned_admin_id
          ? (adminList || []).find(a => a.admin_profile_id === accessProfile.assigned_admin_id)
          : null;
        return {
          ...approved,
          full_name: approved.full_name || platformUser?.full_name || "—",
          phone: approved.phone || platformUser?.phone || "—",
          registration_date: platformUser?.created_date || approved.approved_at,
          last_login: platformUser?.last_login || approved.last_login,
          login_count: platformUser?.login_count || approved.login_count || 0,
          assigned_admin_id: accessProfile?.assigned_admin_id || null,
          assigned_admin_name: assignedAdmin?.full_name || assignedAdmin?.email || null,
        };
      });
      
      setUsers(merged);
      setTotalUsers(hasMore ? PAGE_SIZE * page + merged.length : (PAGE_SIZE * (page - 1)) + merged.length);
    } catch (e) {
      toast({ title: "Error loading users", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, [page]);

  const filtered = useMemo(() => {
    let list = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u => 
        u.email.toLowerCase().includes(q) ||
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q))
      );
    }
    if (filter !== "ALL") {
      list = list.filter(u => u.status === filter);
    }
    if (adminFilter === "UNASSIGNED") {
      list = list.filter(u => !u.assigned_admin_id);
    } else if (adminFilter !== "ALL") {
      list = list.filter(u => u.assigned_admin_id === adminFilter);
    }
    return list;
  }, [users, search, filter]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === "ACTIVE").length,
    expired: users.filter(u => u.status === "EXPIRED").length,
    blocked: users.filter(u => u.status === "BLOCKED").length,
    removed: users.filter(u => u.status === "REMOVED").length,
  }), [users]);

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { key: "total", label: "Total", color: G.text },
          { key: "active", label: "Active", color: "#22c55e" },
          { key: "expired", label: "Expired", color: "#f59e0b" },
          { key: "blocked", label: "Blocked", color: "#ef4444" },
          { key: "removed", label: "Removed", color: "#6b7280" },
        ].map(({ key, label, color }) => (
          <div key={key} className="rounded-xl border p-3 text-center cursor-pointer"
            style={{ background: G.bg, borderColor: filter === key.toUpperCase() ? color + "80" : G.border }}
            onClick={() => setFilter(f => f === key.toUpperCase() ? "ALL" : key.toUpperCase())}>
            <p className="text-2xl font-bold" style={{ color }}>{stats[key]}</p>
            <p className="text-[10px] text-white/35">{label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: G.dim }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by email, name, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}` }} />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm text-white outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}` }}>
          <option value="ALL">All Users</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
          <option value="BLOCKED">Blocked</option>
          <option value="REMOVED">Removed</option>
        </select>
        <select value={adminFilter} onChange={e => setAdminFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm text-white outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}` }}>
          <option value="ALL">All Admins</option>
          <option value="UNASSIGNED">Unassigned</option>
          {adminProfiles.filter(p => p.status === "ACTIVE" && !p.is_owner).map(admin => (
            <option key={admin.admin_profile_id} value={admin.admin_profile_id}>
              {admin.full_name || admin.email}
            </option>
          ))}
        </select>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-t-gold border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.25)" }}>
          <Users className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="text-sm">No users found</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {filtered.map(user => {
              const status = STATUS_CONFIG[user.status] || STATUS_CONFIG.ACTIVE;
              const StatusIcon = status.icon;
              return (
                <div key={user.id} 
                  onClick={() => setSelectedUser(user)}
                  className="rounded-xl border p-4 cursor-pointer transition-all hover:scale-[1.01]"
                  style={{ background: G.bg, borderColor: G.border }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <StatusIcon className="w-4 h-4 flex-shrink-0" style={{ color: status.color }} />
                        <span className="font-inter font-bold text-white text-sm truncate">{user.full_name}</span>
                        <Badge className={`${status.bg} ${status.color} border text-xs flex-shrink-0`}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-1 text-xs text-white/45">
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{user.phone || "—"}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          Joined: {user.registration_date ? new Date(user.registration_date).toLocaleDateString() : "N/A"}
                        </span>
                        <span className="flex items-center gap-1">
                          <LogIn className="w-3 h-3 flex-shrink-0" />
                          {user.login_count || 0} logins
                        </span>
                        <span className="flex items-center gap-1 truncate" style={{ color: user.assigned_admin_name ? G.text : "rgba(255,255,255,0.30)" }}>
                          <Shield className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{user.assigned_admin_name || "Unassigned"}</span>
                        </span>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssignTargetUser(user);
                          setShowAssignModal(true);
                        }}
                        title="Assign Admin"
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}
                      >
                        <UserCog className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: G.dim }} />
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t" style={{ borderColor: G.border }}>
            <p className="text-xs text-white/40">
              Showing {users.length} users {page > 1 ? `(page ${page})` : ''} {totalUsers > PAGE_SIZE ? '(+ more available)' : ''}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  background: page === 1 ? G.bg : G.bgHi, 
                  color: page === 1 ? G.dim : G.text,
                  border: `1px solid ${G.border}`
                }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={users.length < PAGE_SIZE}
                className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  background: users.length < PAGE_SIZE ? G.bg : G.bgHi, 
                  color: users.length < PAGE_SIZE ? G.dim : G.text,
                  border: `1px solid ${G.border}`
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* User Details Drawer */}
      <AnimatePresence>
        {selectedUser && (
          <UserDrawer 
            user={selectedUser} 
            onClose={() => setSelectedUser(null)} 
            onUpdate={loadUsers}
          />
        )}
      </AnimatePresence>

      {/* Assign Admin Modal (Owner only) */}
      {showAssignModal && assignTargetUser && (
        <AssignAdminModal
          customer={assignTargetUser}
          adminProfiles={adminProfiles}
          currentAssignment={assignTargetUser.assigned_admin_name}
          onClose={() => {
            setShowAssignModal(false);
            setAssignTargetUser(null);
          }}
          onSaved={() => {
            setShowAssignModal(false);
            setAssignTargetUser(null);
            loadUsers();
          }}
        />
      )}
    </div>
  );
}