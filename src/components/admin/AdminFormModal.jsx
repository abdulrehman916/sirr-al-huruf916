/**
 * AdminFormModal — Portal-based modal for adding/editing admins.
 * Add mode: creates AdminProfile + generates invitation code.
 * Edit mode: updates profile info + permissions.
 */
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Loader2, Check, Copy, Mail, MessageCircle, User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { ADMIN_PERMISSIONS, ADMIN_FORBIDDEN } from "@/lib/adminPermissions";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

export default function AdminFormModal({ mode, profile, onClose, onSaved }) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp_number || "");
  // Initialize every permission toggle from the canonical ADMIN_PERMISSIONS list.
  // Owner is never editable here (managed elsewhere), so this only applies to Admins.
  const [permissions, setPermissions] = useState(() => {
    const init = {};
    ADMIN_PERMISSIONS.forEach((p) => {
      init[p.shortKey] = profile?.[p.key] === true;
    });
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [invitationCode, setInvitationCode] = useState(null);

  const togglePerm = (key) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (mode === "add" && !email.trim()) {
      toast({ title: "Email is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (mode === "add") {
        // First, invite the user via platform
        try {
          await base44.users.inviteUser(email.trim(), "admin");
        } catch (inviteErr) {
          // User might already exist — continue anyway
        }

        const res = await base44.functions.invoke("manageAdminProfile", {
          action: "CREATE",
          email: email.trim(),
          full_name: fullName.trim(),
          whatsapp_number: whatsapp.trim(),
          permissions,
        });

        if (res.data?.success) {
          setInvitationCode(res.data.invitation_code);
          toast({ title: "✓ Admin created", description: "Invitation code generated" });
        } else {
          toast({ title: "Create failed", description: res.data?.error, variant: "destructive" });
        }
      } else {
        const [updateRes, permRes] = await Promise.all([
          base44.functions.invoke("manageAdminProfile", {
            action: "UPDATE",
            admin_profile_id: profile.admin_profile_id,
            full_name: fullName.trim(),
            whatsapp_number: whatsapp.trim(),
          }),
          base44.functions.invoke("manageAdminProfile", {
            action: "UPDATE_PERMISSIONS",
            admin_profile_id: profile.admin_profile_id,
            permissions,
          }),
        ]);

        if (updateRes.data?.success && permRes.data?.success) {
          toast({ title: "✓ Admin updated" });
          onSaved();
        } else {
          toast({
            title: "Update failed",
            description: updateRes.data?.error || permRes.data?.error,
            variant: "destructive",
          });
        }
      }
    } catch (e) {
      const errMsg = e?.response?.data?.error || e.message;
      toast({ title: "Save failed", description: errMsg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const copyCode = () => {
    if (invitationCode) {
      navigator.clipboard.writeText(invitationCode);
      toast({ title: "✓ Code copied" });
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0c1630 0%, #060c1c 100%)", borderColor: G.borderHi }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: G.border }}>
          <h3 className="font-inter font-bold text-white text-sm">
            {invitationCode ? "Admin Created" : mode === "add" ? "Add New Admin" : "Edit Admin"}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center"
            style={{ color: "rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.04)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {invitationCode ? (
            <div className="text-center py-4">
              <p className="text-xs text-white/50 mb-3">
                Share this invitation code with the admin. The platform invite email has been sent to{" "}
                <span style={{ color: G.text }}>{email}</span>. The code is valid for one-time use only —
                it's invalidated after the admin's first login when their device is bound.
              </p>
              <div
                className="rounded-xl border p-4 mb-3"
                style={{ background: G.bg, borderColor: G.borderHi }}
              >
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                  Invitation Code
                </p>
                <p
                  className="font-mono text-lg font-bold tracking-wider break-all"
                  style={{ color: G.text }}
                >
                  {invitationCode}
                </p>
              </div>
              <button
                onClick={copyCode}
                className="w-full py-3 rounded-xl font-inter font-bold text-sm flex items-center justify-center gap-2 mb-2"
                style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}
              >
                <Copy className="w-4 h-4" />
                Copy Code
              </button>
              <button
                onClick={onSaved}
                className="w-full py-2.5 rounded-xl font-inter text-xs font-semibold"
                style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Name */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Admin full name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white outline-none placeholder-white/20"
                    style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, fontSize: "16px" }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">
                  Email {mode === "edit" && "(not editable)"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    disabled={mode === "edit"}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white outline-none placeholder-white/20 disabled:opacity-50"
                    style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, fontSize: "16px" }}
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                  <input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+971 5X XXX XXXX"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white outline-none placeholder-white/20"
                    style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, fontSize: "16px" }}
                  />
                </div>
              </div>

              {/* Permissions */}
              <div className="pt-2">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
                  Role Permissions
                </p>
                <div className="space-y-2">
                  {ADMIN_PERMISSIONS.map((perm) => {
                    const isEnabled = permissions[perm.shortKey];
                    return (
                      <button
                        key={perm.key}
                        onClick={() => togglePerm(perm.shortKey)}
                        className="w-full rounded-lg border p-2.5 flex items-center gap-2.5 transition-all text-left"
                        style={{
                          background: isEnabled ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.02)",
                          borderColor: isEnabled ? "rgba(34,197,94,0.30)" : "rgba(255,255,255,0.08)",
                        }}
                      >
                        <span className="text-base flex-shrink-0">{perm.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white/80">{perm.label}</p>
                          <p className="text-[9px] text-white/35">{perm.description}</p>
                        </div>
                        <div
                          className="w-9 h-5 rounded-full flex items-center transition-all flex-shrink-0"
                          style={{
                            background: isEnabled ? "#22c55e" : "rgba(255,255,255,0.15)",
                            justifyContent: isEnabled ? "flex-end" : "flex-start",
                          }}
                        >
                          <div className="w-4 h-4 rounded-full bg-white mx-0.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Forbidden list */}
              <div
                className="rounded-lg border p-2.5"
                style={{ background: "rgba(239,68,68,0.04)", borderColor: "rgba(239,68,68,0.15)" }}
              >
                <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">
                  Always Forbidden (non-owner)
                </p>
                <p className="text-[10px] text-white/35 leading-relaxed">
                  {ADMIN_FORBIDDEN.join(", ")}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!invitationCode && (
          <div className="flex gap-2 p-4 border-t" style={{ borderColor: G.border }}>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
              style={{ background: "transparent", border: `1px solid ${G.border}`, color: "rgba(255,255,255,0.50)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
              style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              {saving ? "Saving…" : mode === "add" ? "Create Admin" : "Save Changes"}
            </button>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}