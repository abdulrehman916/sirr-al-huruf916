import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Settings, MessageCircle, Info, Database, Download, Upload, Clock,
  Shield, Loader2, Globe, Archive, RotateCcw,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/components/ui/use-toast";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
};

function SettingsCard({ icon, title, children, accent }) {
  return (
    <div className="rounded-xl border p-5 space-y-3"
      style={{ background: accent || G.bg, borderColor: G.border }}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-inter text-sm font-bold text-white">{title}</span>
      </div>
      {children}
    </div>
  );
}

function ActionButton({ label, icon, onClick, loading, color }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-inter font-semibold text-xs disabled:opacity-50 transition-all"
      style={{
        background: (color || "rgba(212,175,55,0.10)"),
        border: `1px solid ${G.border}`,
        color: G.text,
      }}>
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {label}
    </button>
  );
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(null);
  const [whatsapp, setWhatsapp] = useState("+971500000000");
  const [timezone, setTimezone] = useState("Asia/Dubai");
  const [defaultExpiry, setDefaultExpiry] = useState("30_DAYS");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(null);
  const [resetOnboardingLoading, setResetOnboardingLoading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(user => {
      if (!user || !["owner", "admin"].includes(user.role)) { setIsAdmin(false); return; }
      setIsAdmin(true);
      // Load saved settings from localStorage
      try {
        const saved = JSON.parse(localStorage.getItem("admin_settings") || "{}");
        if (saved.whatsapp) setWhatsapp(saved.whatsapp);
        if (saved.timezone) setTimezone(saved.timezone);
        if (saved.defaultExpiry) setDefaultExpiry(saved.defaultExpiry);
        if (saved.maintenanceMode) setMaintenanceMode(saved.maintenanceMode);
      } catch {}
    }).catch(() => setIsAdmin(false));
  }, []);

  if (isAdmin === false) return <Navigate to="/" replace />;
  if (isAdmin === null) return (
    <AdminLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("admin_settings", JSON.stringify({ whatsapp, timezone, defaultExpiry, maintenanceMode }));
      await new Promise(r => setTimeout(r, 400));
      toast({ title: "Settings saved" });
    } catch (e) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await base44.functions.invoke("automatedBackup");
      if (res.data?.success || res.data?.backup_url) {
        toast({ title: "✓ Backup created successfully" });
      } else {
        toast({ title: "Backup completed", description: res.data?.message || "Backup function executed" });
      }
    } catch (e) {
      toast({ title: "Backup failed", description: e.message, variant: "destructive" });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!confirm("Restore from latest backup? This will overwrite current data.")) return;
    setRestoreLoading(true);
    try {
      const res = await base44.functions.invoke("restoreFromZipBackup");
      if (res.data?.success) {
        toast({ title: "✓ Backup restored successfully" });
      } else {
        toast({ title: "Restore attempted", description: res.data?.message || res.data?.error || "Check logs" });
      }
    } catch (e) {
      toast({ title: "Restore failed", description: e.message, variant: "destructive" });
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleResetOnboarding = async () => {
    if (!confirm("Reset onboarding for ALL users? They will see the introduction rules again on their next visit.")) return;
    setResetOnboardingLoading(true);
    try {
      const res = await base44.functions.invoke("resetOnboarding");
      if (res.data?.success) {
        toast({ title: "✓ Onboarding reset for all users", description: res.data?.message });
      } else {
        toast({ title: "Reset attempted", description: res.data?.message || "Unknown result" });
      }
    } catch (e) {
      toast({ title: "Reset failed", description: e.message, variant: "destructive" });
    } finally {
      setResetOnboardingLoading(false);
    }
  };

  const handleExport = async (type) => {
    setExportLoading(type);
    try {
      const exportType = type === "users" ? "users" : type === "logs" ? "audit_logs" : "full";
      const res = await base44.functions.invoke("exportData", { export_type: exportType });
      // exportData returns JSON directly — download it as a file
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_${exportType}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: `✓ ${type === "users" ? "Users" : type === "logs" ? "Audit Logs" : "Full Backup"} exported` });
    } catch (e) {
      toast({ title: "Export failed", description: e.message, variant: "destructive" });
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-xl">
        <div>
          <h1 className="font-inter text-xl font-bold text-white">Settings</h1>
          <p className="font-inter text-xs text-white/40 mt-0.5">Admin configuration & system management</p>
        </div>

        {/* WhatsApp Contact Number */}
        <SettingsCard icon={<MessageCircle className="w-4 h-4 text-green-400" />} title="WhatsApp Contact Number">
          <p className="font-inter text-xs text-white/40">
            This number is shown to users on locked premium pages to request access.
          </p>
          <input
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value)}
            placeholder="+971500000000"
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, fontSize: 16 }}
          />
        </SettingsCard>

        {/* System Configuration */}
        <SettingsCard icon={<Settings className="w-4 h-4" style={{ color: G.text }} />} title="System Configuration">
          <div className="space-y-3">
            {/* Timezone */}
            <div>
              <label className="text-xs text-white/40 flex items-center gap-1 mb-1"><Globe className="w-3 h-3" /> Timezone</label>
              <select value={timezone} onChange={e => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: "rgba(8,16,40,0.98)", border: `1px solid ${G.border}` }}>
                {["Asia/Dubai", "Asia/Kolkata", "America/New_York", "Europe/London", "Asia/Riyadh", "Australia/Sydney"].map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            {/* Default Expiry */}
            <div>
              <label className="text-xs text-white/40 flex items-center gap-1 mb-1"><Clock className="w-3 h-3" /> Default Expiry (for new codes)</label>
              <select value={defaultExpiry} onChange={e => setDefaultExpiry(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: "rgba(8,16,40,0.98)", border: `1px solid ${G.border}` }}>
                {[
                  { v: "1_DAY", l: "1 Day" }, { v: "7_DAYS", l: "7 Days" }, { v: "30_DAYS", l: "30 Days" },
                  { v: "3_MONTHS", l: "3 Months" }, { v: "6_MONTHS", l: "6 Months" },
                  { v: "1_YEAR", l: "1 Year" }, { v: "LIFETIME", l: "Lifetime" },
                ].map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
              </select>
            </div>
            {/* Maintenance Mode */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs text-white/40 flex items-center gap-1"><Shield className="w-3 h-3" /> Maintenance Mode</label>
                <p className="text-[10px] text-white/30 mt-0.5">Blocks all non-admin access</p>
              </div>
              <button onClick={() => setMaintenanceMode(!maintenanceMode)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{
                  background: maintenanceMode ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.10)",
                  border: `1px solid ${maintenanceMode ? "rgba(239,68,68,0.40)" : "rgba(34,197,94,0.30)"}`,
                  color: maintenanceMode ? "#f87171" : "#4ade80",
                }}>
                {maintenanceMode ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </SettingsCard>

        {/* Database Backup & Restore */}
        <SettingsCard icon={<Database className="w-4 h-4" style={{ color: G.text }} />} title="Database Backup & Restore">
          <p className="font-inter text-xs text-white/40">Create a backup of all data or restore from a previous backup.</p>
          <div className="flex flex-wrap gap-2">
            <ActionButton label="Create Backup" icon={<Database className="w-3.5 h-3.5" />} onClick={handleBackup} loading={backupLoading} />
            <ActionButton label="Restore Backup" icon={<Upload className="w-3.5 h-3.5" />} onClick={handleRestore} loading={restoreLoading}
              color="rgba(168,85,247,0.10)" />
          </div>
        </SettingsCard>

        {/* Data Export */}
        <SettingsCard icon={<Download className="w-4 h-4" style={{ color: G.text }} />} title="Data Export">
          <p className="font-inter text-xs text-white/40">Export entity data to downloadable files.</p>
          <div className="flex flex-wrap gap-2">
            <ActionButton label="Export Users" icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => handleExport("users")} loading={exportLoading === "users"} />
            <ActionButton label="Export Audit Logs" icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => handleExport("logs")} loading={exportLoading === "logs"} />
            <ActionButton label="Export Full Backup" icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => handleExport("full")} loading={exportLoading === "full"} />
          </div>
        </SettingsCard>

        {/* Payment method info */}
        <SettingsCard icon={<Info className="w-4 h-4 text-green-400" />} title="Payment Method"
          accent="rgba(37,209,102,0.05)">
          <p className="font-inter text-xs text-white/50 leading-relaxed">
            All payments are processed manually via WhatsApp. No payment gateway is configured.
            After payment confirmation, issue a Reading Code via the <strong className="text-white/70">Reading Codes</strong> section.
          </p>
        </SettingsCard>

        {/* Onboarding Management */}
        <SettingsCard icon={<RotateCcw className="w-4 h-4" style={{ color: G.text }} />} title="Onboarding Management">
          <p className="font-inter text-xs text-white/40">
            Reset the introduction rules for all users. When reset, users will see the Rules &amp; Conditions again on their next visit.
          </p>
          <ActionButton
            label="Reset Onboarding / Show Introduction Again"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleResetOnboarding}
            loading={resetOnboardingLoading}
            color="rgba(239, 68, 68, 0.10)"
          />
        </SettingsCard>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl font-inter font-bold text-sm disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#f6d860,#c98a14)", color: "#0d1b2a" }}
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </motion.div>
    </AdminLayout>
  );
}