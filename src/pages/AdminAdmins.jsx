/**
 * AdminAdmins — Admin Management page.
 * Owner-only: add, edit, disable/enable, delete, reset device, view activity.
 * Non-owners see "Access Restricted" message.
 *
 * Uses: AdminProfile entity + manageAdminProfile backend function.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigate } from "react-router-dom";
import {
  Shield,
  Plus,
  Edit3,
  Ban,
  CheckCircle,
  Trash2,
  Smartphone,
  Eye,
  Loader2,
  Crown,
  AlertCircle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/components/ui/use-toast";
import { ADMIN_PERMISSIONS } from "@/lib/adminPermissions";
import AdminFormModal from "@/components/admin/AdminFormModal";
import AdminDetailPanel from "@/components/admin/AdminDetailPanel";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

function AdminRow({ profile, onEdit, onView, onToggle, onDelete, onReset, busy }) {
  const isActive = profile.status === "ACTIVE";
  const isOwner = profile.is_owner;

  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: isOwner ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.02)",
        borderColor: isOwner ? G.borderHi : G.border,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: isOwner ? G.bgHi : "rgba(255,255,255,0.06)",
            border: `1px solid ${isOwner ? G.borderHi : "rgba(255,255,255,0.10)"}`,
          }}
        >
          {isOwner ? (
            <Crown className="w-5 h-5" style={{ color: G.text }} />
          ) : (
            <Shield className="w-5 h-5" style={{ color: "rgba(255,255,255,0.40)" }} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-inter font-semibold text-white text-sm truncate">
              {profile.full_name || profile.email}
            </p>
            {isOwner && (
              <span
                className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider"
                style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.borderHi}` }}
              >
                Owner
              </span>
            )}
            {!isActive && (
              <span
                className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  color: "#f87171",
                  border: "1px solid rgba(239,68,68,0.35)",
                }}
              >
                Disabled
              </span>
            )}
          </div>
          <p className="text-[10px] text-white/35 font-mono truncate">{profile.email}</p>
          {/* Permission badges */}
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {ADMIN_PERMISSIONS.map((perm) => {
              const has = isOwner || profile[perm.key] === true;
              return has ? (
                <span
                  key={perm.key}
                  className="text-[8px] px-1 py-0 rounded"
                  style={{ background: "rgba(34,197,94,0.10)", color: "#4ade80" }}
                >
                  {perm.icon} {perm.label}
                </span>
              ) : null;
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="text-right flex-shrink-0 hidden sm:block">
          <p className="text-xs text-white/50">{profile.assigned_customer_count || 0} customers</p>
          <p className="text-[9px] text-white/30">
            {profile.device_id ? "✓ Device bound" : "○ No device"}
          </p>
          {profile.last_login && (
            <p className="text-[9px] text-white/25">
              Last: {new Date(profile.last_login).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Actions */}
        {!isOwner && (
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={() => onView(profile)}
              title="View Details"
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.dim }}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onEdit(profile)}
              title="Edit"
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.dim }}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            {profile.device_id && (
              <button
                onClick={() => onReset(profile)}
                disabled={busy}
                title="Reset Device"
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-50"
                style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.dim }}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onToggle(profile)}
              disabled={busy}
              title={isActive ? "Disable" : "Enable"}
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-50"
              style={{
                background: isActive ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                border: `1px solid ${isActive ? "rgba(239,68,68,0.30)" : "rgba(34,197,94,0.30)"}`,
                color: isActive ? "#f87171" : "#4ade80",
              }}
            >
              {isActive ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onDelete(profile)}
              disabled={busy}
              title="Delete"
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-50"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {isOwner && (
          <button
            onClick={() => onView(profile)}
            title="View Details"
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.dim }}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminAdmins() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProfile, setEditProfile] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [assignmentStats, setAssignmentStats] = useState(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const user = await base44.auth.me();
      if (!user || !["owner", "admin"].includes(user.role)) {
        setIsAdmin(false);
        return;
      }
      setIsAdmin(true);

      const res = await base44.functions.invoke("manageAdminProfile", { action: "GET_STATUS" });
      setIsOwner(res.data?.is_owner || false);
      setProfiles(res.data?.profiles || []);

      // Fetch customer assignment stats if owner
      if (res.data?.is_owner) {
        try {
          const statsRes = await base44.functions.invoke("manageCustomerAssignment", {
            action: "GET_STATS",
          });
          setAssignmentStats(statsRes.data?.stats || null);
        } catch {}
      }
    } catch {
      setIsOwner(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, params = {}) => {
    setBusy(true);
    try {
      const res = await base44.functions.invoke("manageAdminProfile", { action, ...params });
      if (res.data?.success) {
        toast({ title: `✓ ${action.toLowerCase().replace(/_/g, " ")} success` });
        await checkAccess();
      } else {
        toast({
          title: "Action failed",
          description: res.data?.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (e) {
      const errMsg = e?.response?.data?.error || e.message;
      toast({ title: "Action failed", description: errMsg, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = (profile) => {
    const action = profile.status === "ACTIVE" ? "DISABLE" : "ENABLE";
    handleAction(action, { admin_profile_id: profile.admin_profile_id });
  };

  const handleReset = (profile) => {
    if (
      !confirm(
        `Reset device binding for ${profile.full_name || profile.email}? They will need to login again from a new device.`
      )
    )
      return;
    handleAction("RESET_DEVICE", { admin_profile_id: profile.admin_profile_id });
  };

  const handleDelete = (profile) => {
    if (
      !confirm(
        `Delete admin ${profile.full_name || profile.email}? This removes their admin profile. The user account remains.`
      )
    )
      return;
    handleAction("DELETE", { admin_profile_id: profile.admin_profile_id });
  };

  if (isAdmin === false) return <Navigate to="/" replace />;

  if (isAdmin === null || loading) {
    return (
      <AdminLayout title="Loading...">
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </AdminLayout>
    );
  }

  const activeCount = profiles.filter((p) => p.status === "ACTIVE").length;
  const disabledCount = profiles.filter((p) => p.status === "DISABLED").length;

  return (
    <AdminLayout title="Admin Management" subtitle="Manage admin accounts, permissions & device binding">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div
            className="rounded-xl border p-3 text-center"
            style={{ background: G.bg, borderColor: G.border }}
          >
            <p className="text-2xl font-bold" style={{ color: G.text }}>
              {profiles.length}
            </p>
            <p className="text-xs text-white/45">Total Admins</p>
          </div>
          <div
            className="rounded-xl border p-3 text-center"
            style={{ background: "rgba(34,197,94,0.06)", borderColor: "rgba(34,197,94,0.25)" }}
          >
            <p className="text-2xl font-bold text-green-400">{activeCount}</p>
            <p className="text-xs text-white/45">Active</p>
          </div>
          <div
            className="rounded-xl border p-3 text-center"
            style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.25)" }}
          >
            <p className="text-2xl font-bold text-red-400">{disabledCount}</p>
            <p className="text-xs text-white/45">Disabled</p>
          </div>
        </div>

        {/* Access denied for non-owners */}
        {!isOwner ? (
          <div
            className="rounded-xl border p-6 text-center"
            style={{ background: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.25)" }}
          >
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="font-inter font-semibold text-white text-sm mb-1">Access Restricted</p>
            <p className="text-xs text-white/45">
              Only the system owner can manage admin accounts.
            </p>
          </div>
        ) : (
          <>
            {/* Info banner */}
            <div className="rounded-xl border p-3" style={{ background: G.bg, borderColor: G.border }}>
              <p className="text-xs text-white/60 leading-relaxed">
                Add admins with granular permissions. Each admin is device-bound on first login.
                Admins cannot access Admin Management, Page Access, Settings, or Reading Code creation.
                Owner permissions cannot be modified.
              </p>
            </div>

            {/* Customer Assignment Stats */}
            {assignmentStats && (
              <div className="grid grid-cols-3 gap-3">
                <div
                  className="rounded-xl border p-3 text-center"
                  style={{ background: "rgba(34,197,94,0.06)", borderColor: "rgba(34,197,94,0.25)" }}
                >
                  <p className="text-2xl font-bold text-green-400">
                    {assignmentStats.assigned || 0}
                  </p>
                  <p className="text-xs text-white/45">Assigned</p>
                </div>
                <div
                  className="rounded-xl border p-3 text-center"
                  style={{ background: G.bg, borderColor: G.border }}
                >
                  <p className="text-2xl font-bold" style={{ color: G.text }}>
                    {assignmentStats.active_assigned || 0}
                  </p>
                  <p className="text-xs text-white/45">Active Assigned</p>
                </div>
                <div
                  className="rounded-xl border p-3 text-center"
                  style={{ background: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.25)" }}
                >
                  <p className="text-2xl font-bold text-amber-400">
                    {assignmentStats.pending || 0}
                  </p>
                  <p className="text-xs text-white/45">Pending</p>
                </div>
              </div>
            )}

            {/* Add button */}
            <button
              onClick={() => setShowAddModal(true)}
              disabled={busy}
              className="w-full py-3 rounded-xl font-inter font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}
            >
              <Plus className="w-4 h-4" />
              Add New Admin
            </button>

            {/* Admin list */}
            <div className="space-y-2">
              {profiles.map((profile) => (
                <AdminRow
                  key={profile.admin_profile_id}
                  profile={profile}
                  onEdit={setEditProfile}
                  onView={setViewProfile}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onReset={handleReset}
                  busy={busy}
                />
              ))}
              {profiles.length === 0 && (
                <div
                  className="rounded-xl border p-8 text-center"
                  style={{ background: G.bg, borderColor: G.border }}
                >
                  <p className="text-sm text-white/40">No admins yet. Add your first admin above.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AdminFormModal
            mode="add"
            onClose={() => setShowAddModal(false)}
            onSaved={() => {
              setShowAddModal(false);
              checkAccess();
            }}
          />
        )}
        {editProfile && (
          <AdminFormModal
            mode="edit"
            profile={editProfile}
            onClose={() => setEditProfile(null)}
            onSaved={() => {
              setEditProfile(null);
              checkAccess();
            }}
          />
        )}
        {viewProfile && (
          <AdminDetailPanel profile={viewProfile} onClose={() => setViewProfile(null)} />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}