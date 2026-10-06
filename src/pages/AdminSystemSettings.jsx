/**
 * AdminSystemSettings — System Settings page for the admin panel.
 *
 * 7 sections: General, Registration, Reading Codes, Subscription,
 * Security, Notifications, Backup.
 *
 * Owner: full read + write + export + import.
 * Admin: read-only (fields disabled, save hidden).
 *
 * Server-side RBAC enforced by manageSystemSettings function.
 */
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import {
  Settings, Globe, UserPlus, Ticket, CreditCard, Shield, Bell,
  Database, Download, Upload, Save, AlertTriangle, History, X,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import SettingsSection from "@/components/admin/SettingsSection";
import SettingsField from "@/components/admin/SettingsField";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
};

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ml", label: "Malayalam" },
  { value: "ar", label: "Arabic" },
  { value: "tr", label: "Turkish" },
];

const TIMEZONES = [
  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "America/New_York", label: "America/New_York (EST)" },
  { value: "Europe/London", label: "Europe/London (GMT)" },
  { value: "Asia/Riyadh", label: "Asia/Riyadh (AST)" },
];

const CURRENCIES = [
  { value: "AED", label: "AED — UAE Dirham" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "INR", label: "INR — Indian Rupee" },
  { value: "SAR", label: "SAR — Saudi Riyal" },
  { value: "EUR", label: "EUR — Euro" },
];

export default function AdminSystemSettings() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState("settings"); // settings | audit
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  // Section-level dirty tracking + saving
  const [sectionData, setSectionData] = useState({});
  const [dirtySections, setDirtySections] = useState(new Set());
  const [savingSection, setSavingSection] = useState(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const user = await base44.auth.me();
      if (!user || !["owner", "admin"].includes(user.role)) {
        setIsAdmin(false);
        toast({ title: "Access Denied", description: "Only administrators can access this page", variant: "destructive" });
      } else {
        setIsAdmin(true);
        loadSettings();
      }
    } catch {
      setIsAdmin(false);
      toast({ title: "Authentication Error", description: "Please log in to continue", variant: "destructive" });
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageSystemSettings", { action: "GET_SETTINGS" });
      if (res.data?.success) {
        const s = res.data.settings;
        setSettings(s);
        setIsOwner(res.data.is_owner);
        // Initialize section data copies for editing
        setSectionData({
          general: { ...s.general },
          registration: { ...s.registration },
          reading_codes: { ...s.reading_codes },
          subscription: { ...s.subscription },
          security: { ...s.security },
          notifications: { ...s.notifications },
        });
        setDirtySections(new Set());
      }
    } catch (error) {
      toast({ title: "Error Loading Settings", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const canEdit = isOwner;

  const updateField = (section, field, value) => {
    setSectionData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    setDirtySections((prev) => new Set([...prev, section]));
  };

  const handleSaveSection = async (section) => {
    setSavingSection(section);
    try {
      const res = await base44.functions.invoke("manageSystemSettings", {
        action: "UPDATE_SECTION",
        section,
        data: sectionData[section],
      });
      if (res.data?.success) {
        toast({ title: "✓ Settings Saved", description: `${section} updated successfully.` });
        setDirtySections((prev) => {
          const next = new Set(prev);
          next.delete(section);
          return next;
        });
        // Reload to get fresh audit log
        await loadSettings();
      } else {
        toast({ title: "Save Failed", description: res.data?.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Save Failed", description: e?.response?.data?.error || e.message, variant: "destructive" });
    } finally {
      setSavingSection(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await base44.functions.invoke("manageSystemSettings", { action: "EXPORT_SETTINGS" });
      if (res.data?.success) {
        const data = res.data.export_data;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `system_settings_${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "✓ Settings Exported", description: "JSON file downloaded." });
        await loadSettings();
      }
    } catch (e) {
      toast({ title: "Export Failed", description: e.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    try {
      const importData = JSON.parse(importText);
      const res = await base44.functions.invoke("manageSystemSettings", {
        action: "IMPORT_SETTINGS",
        import_data: importData,
      });
      if (res.data?.success) {
        toast({ title: "✓ Settings Imported", description: "All settings restored from file." });
        setShowImport(false);
        setImportText("");
        await loadSettings();
      } else {
        toast({ title: "Import Failed", description: res.data?.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Import Failed", description: "Invalid JSON: " + e.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const handleBackupConfig = async () => {
    try {
      const res = await base44.functions.invoke("manageSystemSettings", { action: "BACKUP_CONFIG" });
      if (res.data?.success) {
        toast({ title: "✓ Backup Recorded", description: "Database configuration backup logged." });
        await loadSettings();
      }
    } catch (e) {
      toast({ title: "Backup Failed", description: e.message, variant: "destructive" });
    }
  };

  if (isAdmin === false) return <Navigate to="/" replace />;

  if (isAdmin === null || loading) {
    return (
      <AdminLayout title="Loading..." showBackButton={false}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="System Settings" subtitle="Configuration">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Tab Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("settings")}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
            style={{
              background: activeTab === "settings" ? "rgba(212,175,55,0.14)" : "rgba(255,255,255,0.03)",
              border: activeTab === "settings" ? "1px solid rgba(212,175,55,0.50)" : "1px solid rgba(255,255,255,0.08)",
              color: activeTab === "settings" ? G.text : "rgba(255,255,255,0.50)",
            }}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
            style={{
              background: activeTab === "audit" ? "rgba(212,175,55,0.14)" : "rgba(255,255,255,0.03)",
              border: activeTab === "audit" ? "1px solid rgba(212,175,55,0.50)" : "1px solid rgba(255,255,255,0.08)",
              color: activeTab === "audit" ? G.text : "rgba(255,255,255,0.50)",
            }}
          >
            <History className="w-3.5 h-3.5" />
            Audit Trail
          </button>
        </div>

        {/* RBAC Notice for non-owners */}
        {!canEdit && (
          <div className="rounded-xl border p-3 text-center" style={{ background: "rgba(59,130,246,0.05)", borderColor: "rgba(59,130,246,0.20)" }}>
            <p className="text-xs text-blue-400/80">
              🔒 Read-only access. Only the owner can modify system settings.
            </p>
          </div>
        )}

        {/* ── Settings Tab ── */}
        {activeTab === "settings" && settings && (
          <div className="space-y-3">
            {/* 1. General */}
            <SettingsSection
              title="General"
              icon={Globe}
              description="App name, branding, and contact information"
              canEdit={canEdit}
              onSave={() => handleSaveSection("general")}
              hasChanges={dirtySections.has("general")}
              saving={savingSection === "general"}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SettingsField label="App Name" value={sectionData.general?.app_name} onChange={(v) => updateField("general", "app_name", v)} disabled={!canEdit} placeholder="Sirr al-Huruf" />
                <SettingsField label="Support Email" type="email" value={sectionData.general?.support_email} onChange={(v) => updateField("general", "support_email", v)} disabled={!canEdit} placeholder="support@example.com" />
                <SettingsField label="WhatsApp Number" value={sectionData.general?.whatsapp_number} onChange={(v) => updateField("general", "whatsapp_number", v)} disabled={!canEdit} placeholder="+971 XX XXX XXXX" />
                <SettingsField label="Telegram Link" value={sectionData.general?.telegram_link} onChange={(v) => updateField("general", "telegram_link", v)} disabled={!canEdit} placeholder="https://t.me/..." />
                <SettingsField label="Logo URL" value={sectionData.general?.logo_url} onChange={(v) => updateField("general", "logo_url", v)} disabled={!canEdit} placeholder="https://..." />
                <SettingsField label="Favicon URL" value={sectionData.general?.favicon_url} onChange={(v) => updateField("general", "favicon_url", v)} disabled={!canEdit} placeholder="https://..." />
                <SettingsField label="Default Language" type="select" value={sectionData.general?.default_language} onChange={(v) => updateField("general", "default_language", v)} options={LANGUAGES} disabled={!canEdit} />
                <SettingsField label="Time Zone" type="select" value={sectionData.general?.timezone} onChange={(v) => updateField("general", "timezone", v)} options={TIMEZONES} disabled={!canEdit} />
              </div>
            </SettingsSection>

            {/* 2. Registration */}
            <SettingsSection
              title="Registration"
              icon={UserPlus}
              description="User registration and access control"
              canEdit={canEdit}
              onSave={() => handleSaveSection("registration")}
              hasChanges={dirtySections.has("registration")}
              saving={savingSection === "registration"}
            >
              <SettingsField label="Enable New Registration" type="toggle" value={sectionData.registration?.enable_registration} onChange={(v) => updateField("registration", "enable_registration", v)} disabled={!canEdit} description="Allow new users to create accounts" />
              <SettingsField label="Enable Guest Access" type="toggle" value={sectionData.registration?.enable_guest_access} onChange={(v) => updateField("registration", "enable_guest_access", v)} disabled={!canEdit} description="Allow non-authenticated users to browse public pages" />
              <SettingsField label="Email Verification" type="toggle" value={sectionData.registration?.email_verification} onChange={(v) => updateField("registration", "email_verification", v)} disabled={!canEdit} description="Require email verification on registration" />
              <SettingsField label="WhatsApp Verification" type="toggle" value={sectionData.registration?.whatsapp_verification} onChange={(v) => updateField("registration", "whatsapp_verification", v)} disabled={!canEdit} description="Require WhatsApp verification" />
            </SettingsSection>

            {/* 3. Reading Codes */}
            <SettingsSection
              title="Reading Codes"
              icon={Ticket}
              description="Code approval and redemption settings"
              canEdit={canEdit}
              onSave={() => handleSaveSection("reading_codes")}
              hasChanges={dirtySections.has("reading_codes")}
              saving={savingSection === "reading_codes"}
            >
              <SettingsField label="Auto Approve" type="toggle" value={sectionData.reading_codes?.auto_approve} onChange={(v) => updateField("reading_codes", "auto_approve", v)} disabled={!canEdit} description="Automatically approve codes without admin review" />
              <SettingsField label="Manual Approval" type="toggle" value={sectionData.reading_codes?.manual_approval} onChange={(v) => updateField("reading_codes", "manual_approval", v)} disabled={!canEdit} description="Require admin approval for redeem codes" />
              <SettingsField label="Max Redemption Attempts" type="number" value={sectionData.reading_codes?.max_redemption_attempts} onChange={(v) => updateField("reading_codes", "max_redemption_attempts", v)} disabled={!canEdit} min={1} max={10} description="Maximum attempts before lockout" />
              <SettingsField label="Expiry (Days)" type="number" value={sectionData.reading_codes?.expiry_days} onChange={(v) => updateField("reading_codes", "expiry_days", v)} disabled={!canEdit} min={0} max={3650} description="Default expiry in days (0 = lifetime)" />
            </SettingsSection>

            {/* 4. Subscription */}
            <SettingsSection
              title="Subscription"
              icon={CreditCard}
              description="Billing and subscription settings"
              canEdit={canEdit}
              onSave={() => handleSaveSection("subscription")}
              hasChanges={dirtySections.has("subscription")}
              saving={savingSection === "subscription"}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SettingsField label="Currency" type="select" value={sectionData.subscription?.currency} onChange={(v) => updateField("subscription", "currency", v)} options={CURRENCIES} disabled={!canEdit} />
                <SettingsField label="Tax (%)" type="number" value={sectionData.subscription?.tax_percentage} onChange={(v) => updateField("subscription", "tax_percentage", v)} disabled={!canEdit} min={0} max={100} step={0.1} description="Tax percentage applied to subscriptions" />
                <SettingsField label="Trial Period (Days)" type="number" value={sectionData.subscription?.trial_period_days} onChange={(v) => updateField("subscription", "trial_period_days", v)} disabled={!canEdit} min={0} max={90} description="0 = no trial" />
                <SettingsField label="Renewal Reminder (Days)" type="number" value={sectionData.subscription?.renewal_reminder_days} onChange={(v) => updateField("subscription", "renewal_reminder_days", v)} disabled={!canEdit} min={1} max={30} description="Days before expiry to send reminder" />
                <SettingsField label="Grace Period (Days)" type="number" value={sectionData.subscription?.grace_period_days} onChange={(v) => updateField("subscription", "grace_period_days", v)} disabled={!canEdit} min={0} max={30} description="Grace period after expiry before access revoked" />
              </div>
            </SettingsSection>

            {/* 5. Security */}
            <SettingsSection
              title="Security"
              icon={Shield}
              description="Security and access control"
              canEdit={canEdit}
              onSave={() => handleSaveSection("security")}
              hasChanges={dirtySections.has("security")}
              saving={savingSection === "security"}
            >
              {sectionData.security?.maintenance_mode && (
                <div className="rounded-lg p-2 flex items-center gap-2" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <p className="text-[10px] text-red-400">Maintenance mode is ON — only admins can access the app.</p>
                </div>
              )}
              <SettingsField label="Maintenance Mode" type="toggle" value={sectionData.security?.maintenance_mode} onChange={(v) => updateField("security", "maintenance_mode", v)} disabled={!canEdit} description="Restrict app access to admins only" />
              <SettingsField label="Force Logout All Users" type="toggle" value={sectionData.security?.force_logout_all} onChange={(v) => updateField("security", "force_logout_all", v)} disabled={!canEdit} description="Force all non-admin users to log out" />
              <SettingsField label="Session Timeout (Minutes)" type="number" value={sectionData.security?.session_timeout_minutes} onChange={(v) => updateField("security", "session_timeout_minutes", v)} disabled={!canEdit} min={5} max={1440} />
              <SettingsField label="Device Reset Limit" type="number" value={sectionData.security?.device_reset_limit} onChange={(v) => updateField("security", "device_reset_limit", v)} disabled={!canEdit} min={0} max={10} description="Max device resets per code" />
              <SettingsField label="Login Attempt Limit" type="number" value={sectionData.security?.login_attempt_limit} onChange={(v) => updateField("security", "login_attempt_limit", v)} disabled={!canEdit} min={3} max={10} description="Max failed login attempts before lockout" />
            </SettingsSection>

            {/* 6. Notifications */}
            <SettingsSection
              title="Notifications"
              icon={Bell}
              description="Notification channel settings"
              canEdit={canEdit}
              onSave={() => handleSaveSection("notifications")}
              hasChanges={dirtySections.has("notifications")}
              saving={savingSection === "notifications"}
            >
              <SettingsField label="Email Notifications" type="toggle" value={sectionData.notifications?.email_notifications} onChange={(v) => updateField("notifications", "email_notifications", v)} disabled={!canEdit} description="Send email notifications to users" />
              <SettingsField label="WhatsApp Notifications" type="toggle" value={sectionData.notifications?.whatsapp_notifications} onChange={(v) => updateField("notifications", "whatsapp_notifications", v)} disabled={!canEdit} description="Send WhatsApp notifications" />
              <SettingsField label="Push Notifications" type="toggle" value={sectionData.notifications?.push_notifications} onChange={(v) => updateField("notifications", "push_notifications", v)} disabled={!canEdit} description="Send push notifications" />
            </SettingsSection>

            {/* 7. Backup */}
            <SettingsSection
              title="Backup & Restore"
              icon={Database}
              description="Export, import, and backup configuration"
              canEdit={canEdit}
              defaultOpen={canEdit}
            >
              {/* Backup metadata */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-white/40">Last Export</p>
                  <p className="text-white/70">{settings.backup?.last_export_at ? new Date(settings.backup.last_export_at).toLocaleString() : "Never"}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-white/40">Last Import</p>
                  <p className="text-white/70">{settings.backup?.last_import_at ? new Date(settings.backup.last_import_at).toLocaleString() : "Never"}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-white/40">Last Backup</p>
                  <p className="text-white/70">{settings.backup?.last_backup_at ? new Date(settings.backup.last_backup_at).toLocaleString() : "Never"}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-white/40">Last Restore</p>
                  <p className="text-white/70">{settings.backup?.last_restore_at ? new Date(settings.backup.last_restore_at).toLocaleString() : "Never"}</p>
                </div>
              </div>

              {/* Action buttons */}
              {canEdit && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button onClick={handleExport} disabled={exporting} variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 text-xs" size="sm">
                    <Download className="w-3 h-3 mr-1" />
                    {exporting ? "Exporting..." : "Export Settings"}
                  </Button>
                  <Button onClick={() => setShowImport(!showImport)} variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs" size="sm">
                    <Upload className="w-3 h-3 mr-1" />
                    Import Settings
                  </Button>
                  <Button onClick={handleBackupConfig} variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs" size="sm">
                    <Database className="w-3 h-3 mr-1" />
                    Backup Config
                  </Button>
                </div>
              )}

              {/* Import textarea */}
              {showImport && canEdit && (
                <div className="space-y-2 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/60">Paste exported JSON settings here:</p>
                    <button onClick={() => setShowImport(false)} className="text-white/30 hover:text-white/60">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder='{"general": {...}, "security": {...}}'
                    className="w-full h-32 bg-white/5 border border-white/10 text-white text-xs rounded-lg p-2 font-mono"
                    style={{ fontSize: "11px" }}
                  />
                  <Button onClick={handleImport} disabled={importing || !importText.trim()} className="btn-gold text-xs" size="sm">
                    {importing ? "Importing..." : "Confirm Import"}
                  </Button>
                </div>
              )}
            </SettingsSection>
          </div>
        )}

        {/* ── Audit Trail Tab ── */}
        {activeTab === "audit" && settings && (
          <div className="space-y-3">
            <div className="rounded-xl border p-3" style={{ background: G.bg, borderColor: G.border }}>
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4" style={{ color: G.dim }} />
                <h3 className="font-inter font-bold text-white text-xs">Settings Audit Trail</h3>
              </div>
              <p className="text-[10px] text-white/40 mb-3">Complete log of all settings changes with previous and new values.</p>

              {settings.audit_log && settings.audit_log.length > 0 ? (
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                  {[...settings.audit_log].reverse().map((entry, i) => (
                    <div key={i} className="rounded-lg border p-2.5" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold" style={{ color: G.text }}>{entry.action}</span>
                          {entry.section && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10">
                              {entry.section}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-white/25 flex-shrink-0">
                          {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "—"}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/50">
                        By: {entry.user_name || "Unknown"} ({entry.user_role || "—"})
                      </p>
                      {entry.previous_value && entry.new_value && (
                        <div className="mt-1 flex items-start gap-2 text-[9px]">
                          <div className="flex-1 min-w-0">
                            <span className="text-red-400/60">Previous:</span>
                            <p className="text-white/40 truncate">{entry.previous_value.substring(0, 200)}{entry.previous_value.length > 200 ? "..." : ""}</p>
                          </div>
                          <span className="text-white/20">→</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-green-400/60">New:</span>
                            <p className="text-white/40 truncate">{entry.new_value.substring(0, 200)}{entry.new_value.length > 200 ? "..." : ""}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/30">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No audit entries yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
}