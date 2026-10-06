/**
 * AssignAdminModal — Portal modal for assigning an admin to a customer.
 * Owner-only action. Shows available active admins, supports assign/reassign/remove.
 */
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Loader2, Check, UserCog } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

export default function AssignAdminModal({
  customer,
  adminProfiles,
  currentAssignment,
  onClose,
  onSaved,
}) {
  const { toast } = useToast();
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [saving, setSaving] = useState(false);

  const availableAdmins = adminProfiles.filter(
    (p) => p.status === "ACTIVE" && !p.is_owner
  );

  const handleAssign = async () => {
    if (!selectedAdminId) {
      toast({ title: "Select an admin first", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await base44.functions.invoke("manageCustomerAssignment", {
        action: "ASSIGN",
        customer_email: customer.email,
        admin_profile_id: selectedAdminId,
      });
      if (res.data?.success) {
        toast({
          title: `✓ ${res.data.action.toLowerCase()}`,
          description: res.data.message,
        });
        onSaved();
      } else {
        toast({
          title: "Assignment failed",
          description: res.data?.error,
          variant: "destructive",
        });
      }
    } catch (e) {
      const errMsg = e?.response?.data?.error || e.message;
      toast({ title: "Assignment failed", description: errMsg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      const res = await base44.functions.invoke("manageCustomerAssignment", {
        action: "REMOVE",
        customer_email: customer.email,
      });
      if (res.data?.success) {
        toast({ title: "✓ Assignment removed" });
        onSaved();
      } else {
        toast({
          title: "Remove failed",
          description: res.data?.error,
          variant: "destructive",
        });
      }
    } catch (e) {
      const errMsg = e?.response?.data?.error || e.message;
      toast({ title: "Remove failed", description: errMsg, variant: "destructive" });
    } finally {
      setSaving(false);
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
        className="w-full max-w-sm rounded-2xl border overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #0c1630 0%, #060c1c 100%)",
          borderColor: G.borderHi,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: G.border }}
        >
          <div className="flex items-center gap-2">
            <UserCog className="w-4 h-4" style={{ color: G.text }} />
            <h3 className="font-inter font-bold text-white text-sm">Assign Admin</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center"
            style={{ color: "rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.04)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Customer info */}
          <div
            className="rounded-lg border p-2.5"
            style={{ background: G.bg, borderColor: G.border }}
          >
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Customer</p>
            <p className="text-sm text-white font-medium">
              {customer.full_name || customer.email}
            </p>
            <p className="text-[10px] text-white/35">{customer.email}</p>
            {currentAssignment && (
              <p className="text-[10px] mt-1" style={{ color: G.dim }}>
                Currently assigned: {currentAssignment}
              </p>
            )}
          </div>

          {/* Admin selector */}
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">
              Select Admin
            </label>
            {availableAdmins.length === 0 ? (
              <p
                className="text-xs text-white/40 p-3 rounded-lg"
                style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${G.border}` }}
              >
                No active admins available. Add an admin in Admin Management first.
              </p>
            ) : (
              <select
                value={selectedAdminId}
                onChange={(e) => setSelectedAdminId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${G.border}`,
                  fontSize: "16px",
                }}
              >
                <option value="">— Select an admin —</option>
                {availableAdmins.map((admin) => (
                  <option key={admin.admin_profile_id} value={admin.admin_profile_id}>
                    {admin.full_name || admin.email}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t" style={{ borderColor: G.border }}>
          {currentAssignment && (
            <button
              onClick={handleRemove}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50"
              style={{
                background: "rgba(239,68,68,0.10)",
                border: "1px solid rgba(239,68,68,0.30)",
                color: "#f87171",
              }}
            >
              Remove
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
            style={{
              background: "transparent",
              border: `1px solid ${G.border}`,
              color: "rgba(255,255,255,0.50)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={saving || availableAdmins.length === 0}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
            style={{
              background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)",
              color: "#0d1b2a",
            }}
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            {saving ? "Saving…" : "Assign"}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}