import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MessageCircle, Calendar, Shield, KeyRound,
  Smartphone, Clock, LogIn, Hash, Loader2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/components/ui/use-toast";
import UserCodeRow from "@/components/admin/UserCodeRow";
import RenewCodeModal from "@/components/admin/RenewCodeModal";
import { getCodeStatus, isLifetime } from "@/lib/codeDuration";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
};

const STATUS_COLORS = {
  ACTIVE:   { bg: "rgba(34,197,94,0.15)",  text: "#4ade80",  border: "rgba(34,197,94,0.40)" },
  BLOCKED:  { bg: "rgba(239,68,68,0.15)",  text: "#f87171",  border: "rgba(239,68,68,0.40)" },
  REMOVED:  { bg: "rgba(107,114,128,0.15)",text: "#9ca3af",  border: "rgba(107,114,128,0.40)" },
  EXPIRED:  { bg: "rgba(245,158,11,0.15)", text: "#fbbf24",  border: "rgba(245,158,11,0.40)" },
  ARCHIVED: { bg: "rgba(107,114,128,0.12)",text: "#6b7280",  border: "rgba(107,114,128,0.30)" },
};

function ProfileField({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-white/60 text-sm">
      {icon}
      <span className="truncate">{value || "—"}</span>
    </div>
  );
}

function CodeSection({ title, codes, onAction, emptyText }) {
  if (!codes || codes.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-inter text-sm font-bold text-white">{title}</h3>
        <span className="text-xs text-white/30">({codes.length})</span>
      </div>
      <div className="space-y-2">
        {codes.map(c => <UserCodeRow key={c.id} code={c} onAction={onAction} />)}
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  const { userId } = useParams();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(null);
  const [profile, setProfile] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewCode, setRenewCode] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      if (!user || user.role !== "admin") { setIsAdmin(false); return; }
      setIsAdmin(true);
      loadUser();
    }).catch(() => setIsAdmin(false));
  }, [userId]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const [profiles, perms] = await Promise.all([
        base44.entities.UserAccessProfile.filter({ user_id: userId }),
        base44.entities.PagePermission.filter({ user_id: userId }),
      ]);
      const prof = profiles[0] || null;
      setProfile(prof);
      setPermissions(perms);

      // Fetch codes by user_id or email
      let userCodes = [];
      try {
        const byUserId = await base44.entities.AccessCode.filter({ used_by_user_id: userId });
        userCodes = byUserId;
      } catch {}
      // Also try by email if available
      if (prof?.email) {
        try {
          const byEmail = await base44.entities.AccessCode.filter({ used_by_email: prof.email });
          // Merge unique by id
          const existingIds = new Set(userCodes.map(c => c.id));
          byEmail.forEach(c => { if (!existingIds.has(c.id)) userCodes.push(c); });
        } catch {}
      }
      // Sort by created_date descending
      userCodes.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
      setCodes(userCodes);
    } catch (e) {
      toast({ title: "Failed to load user", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin === false) return <Navigate to="/" replace />;
  if (isAdmin === null || loading) return (
    <AdminLayout showBackButton title="User Detail">
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: G.text }} />
      </div>
    </AdminLayout>
  );

  const statusCfg = STATUS_COLORS[profile?.account_status] || STATUS_COLORS.ACTIVE;

  // Categorize codes
  const activeCodes = codes.filter(c => !c.is_disabled && getCodeStatus(c).value === 'active' && !isLifetime(c));
  const lifetimeCodes = codes.filter(c => !c.is_disabled && isLifetime(c));
  const expiredCodes = codes.filter(c => !c.is_disabled && getCodeStatus(c).value === 'expired');
  const disabledCodes = codes.filter(c => c.is_disabled);

  const handleCodeAction = (action, code) => {
    if (action === "renew") setRenewCode(code);
    else loadUser();
  };

  return (
    <AdminLayout showBackButton title="User Detail" subtitle="User profile, codes & permissions">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-2xl">

        {!profile ? (
          <div className="rounded-xl border p-8 text-center text-white/40"
            style={{ background: G.bg, borderColor: G.border }}>
            <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No profile found for this user ID</p>
            <p className="text-xs mt-1 font-mono text-white/25">{userId}</p>
          </div>
        ) : (
          <>
            {/* Profile card */}
            <div className="rounded-xl border p-5 space-y-4"
              style={{ background: G.bg, borderColor: G.border }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-inter text-lg font-bold text-white">{profile.full_name || "Unknown"}</h2>
                  <p className="font-inter text-xs text-white/40 font-mono mt-0.5">{profile.user_id}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: statusCfg.bg, color: statusCfg.text, border: `1px solid ${statusCfg.border}` }}>
                  {profile.account_status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ProfileField icon={<Mail className="w-3.5 h-3.5 flex-shrink-0" />} label="Email" value={profile.email} />
                <ProfileField icon={<Phone className="w-3.5 h-3.5 flex-shrink-0" />} label="Phone" value={profile.mobile} />
                <ProfileField icon={<MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />} label="WhatsApp" value={profile.mobile} />
                <ProfileField icon={<Hash className="w-3.5 h-3.5 flex-shrink-0" />} label="User ID" value={profile.user_id} />
                <ProfileField icon={<Smartphone className="w-3.5 h-3.5 flex-shrink-0" />} label="Device Type" value={profile.device_type} />
                <ProfileField icon={<Calendar className="w-3.5 h-3.5 flex-shrink-0" />} label="Join Date" value={profile.registration_date ? new Date(profile.registration_date).toLocaleDateString() : null} />
                <ProfileField icon={<LogIn className="w-3.5 h-3.5 flex-shrink-0" />} label="Last Login" value={profile.last_login ? new Date(profile.last_login).toLocaleString() : null} />
                <ProfileField icon={<Clock className="w-3.5 h-3.5 flex-shrink-0" />} label="Login Count" value={String(profile.login_count || 0)} />
              </div>
            </div>

            {/* Reading Codes */}
            {codes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4" style={{ color: G.text }} />
                  <h3 className="font-inter text-sm font-bold text-white">Reading Codes ({codes.length})</h3>
                </div>
                <CodeSection title="Active Codes" codes={activeCodes} onAction={handleCodeAction} />
                <CodeSection title="Lifetime Codes" codes={lifetimeCodes} onAction={handleCodeAction} />
                <CodeSection title="Expired Codes" codes={expiredCodes} onAction={handleCodeAction} />
                <CodeSection title="Disabled Codes" codes={disabledCodes} onAction={handleCodeAction} />
              </div>
            )}

            {/* Permissions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4" style={{ color: G.text }} />
                <h3 className="font-inter text-sm font-bold text-white">Page Permissions ({permissions.length})</h3>
              </div>
              {permissions.length === 0 ? (
                <p className="text-xs text-white/30 py-4 text-center">No permissions granted</p>
              ) : (
                <div className="space-y-2">
                  {permissions.map(perm => {
                    const isExpired = perm.expiry_date && new Date(perm.expiry_date) < new Date();
                    const isRevoked = perm.is_revoked;
                    return (
                      <div key={perm.id} className="rounded-xl border p-3 flex items-center justify-between gap-3 flex-wrap"
                        style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
                        <div>
                          <p className="font-inter text-sm font-semibold text-white">{perm.page_name}</p>
                          <p className="font-mono text-[10px] text-white/35">{perm.page_path}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            isRevoked ? "bg-red-500/15 text-red-400 border-red-500/30" :
                            isExpired ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" :
                            "bg-green-500/15 text-green-400 border-green-500/30"
                          }`}>
                            {isRevoked ? "REVOKED" : isExpired ? "EXPIRED" : "ACTIVE"}
                          </span>
                          {perm.expiry_date && (
                            <span className="text-[10px] text-white/30">
                              Expires {new Date(perm.expiry_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

      </motion.div>

      {/* Renew Modal */}
      <RenewCodeModal code={renewCode} onClose={() => setRenewCode(null)} onRenewed={() => { setRenewCode(null); loadUser(); }} />
    </AdminLayout>
  );
}