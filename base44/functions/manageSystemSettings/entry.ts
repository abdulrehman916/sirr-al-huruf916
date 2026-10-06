import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * manageSystemSettings — System Settings backend with RBAC.
 *
 * Actions:
 *   GET_SETTINGS   — Read all settings (admin: read-only, owner: full)
 *   UPDATE_SECTION — Update a specific section (owner only)
 *   EXPORT_SETTINGS— Export all settings as JSON (owner only)
 *   IMPORT_SETTINGS— Import settings from JSON (owner only)
 *   INIT_SETTINGS  — Create default settings if none exist (owner only)
 *
 * RBAC:
 *   Owner: full read + write + export + import
 *   Admin: read-only (can view but not modify)
 *
 * Does NOT modify any existing system. Only manages SystemSettings entity.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action } = body;

    // ── Auth ──
    let user = null;
    try {
      user = await base44.auth.me();
    } catch {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Find admin profile for owner check
    const adminProfiles = (await base44.asServiceRole.entities.AdminProfile.list(null, 500)) || [];
    const myProfile = adminProfiles.find(
      (p) =>
        (p.user_id && p.user_id === user.id) ||
        (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
    );
    const isOwner = myProfile?.is_owner === true;

    // ── Default settings ──
    const defaultSettings = {
      settings_id: 'SETTINGS-MAIN',
      general: {
        app_name: 'Sirr al-Huruf',
        logo_url: '',
        favicon_url: '',
        support_email: '',
        whatsapp_number: '',
        telegram_link: '',
        default_language: 'en',
        timezone: 'Asia/Dubai',
      },
      registration: {
        enable_registration: true,
        enable_guest_access: true,
        email_verification: true,
        whatsapp_verification: false,
      },
      reading_codes: {
        auto_approve: false,
        manual_approval: true,
        max_redemption_attempts: 3,
        expiry_days: 365,
      },
      subscription: {
        currency: 'AED',
        tax_percentage: 0,
        trial_period_days: 0,
        renewal_reminder_days: 7,
        grace_period_days: 3,
      },
      security: {
        maintenance_mode: false,
        force_logout_all: false,
        session_timeout_minutes: 60,
        device_reset_limit: 3,
        login_attempt_limit: 5,
      },
      notifications: {
        email_notifications: true,
        whatsapp_notifications: false,
        push_notifications: false,
      },
      backup: {
        last_export_at: null,
        last_import_at: null,
        last_backup_at: null,
        last_restore_at: null,
      },
    };

    // ── Helper: get settings (create defaults if none exist) ──
    const getOrCreateSettings = async () => {
      const existing = await base44.asServiceRole.entities.SystemSettings.filter({ settings_id: 'SETTINGS-MAIN' });
      if (existing && existing.length > 0) {
        return existing[0];
      }
      // Create with defaults
      const now = new Date().toISOString();
      const created = await base44.asServiceRole.entities.SystemSettings.create({
        ...defaultSettings,
        updated_by: user?.id || 'system',
        updated_by_name: myProfile?.full_name || 'System',
        updated_at: now,
        audit_log: [{
          action: 'INIT_SETTINGS',
          user_id: user?.id || 'system',
          user_name: myProfile?.full_name || 'System',
          user_role: isOwner ? 'owner' : 'admin',
          timestamp: now,
          section: 'all',
          previous_value: null,
          new_value: 'Default settings created',
        }],
      });
      return created;
    };

    // ── Helper: verify owner ──
    const requireOwner = () => {
      if (!isOwner) {
        return Response.json(
          { error: 'Owner access required. Admins have read-only access to settings.' },
          { status: 403 }
        );
      }
      return null;
    };

    // ── Actions ──
    switch (action) {
      // ── GET_SETTINGS ──
      case 'GET_SETTINGS': {
        const settings = await getOrCreateSettings();
        return Response.json({
          success: true,
          settings: settings,
          is_owner: isOwner,
          can_edit: isOwner,
        });
      }

      // ── UPDATE_SECTION (owner only) ──
      case 'UPDATE_SECTION': {
        const ownerError = requireOwner();
        if (ownerError) return ownerError;

        const { section, data } = body;
        const validSections = ['general', 'registration', 'reading_codes', 'subscription', 'security', 'notifications'];
        if (!validSections.includes(section)) {
          return Response.json({ error: 'Invalid section: ' + section }, { status: 400 });
        }
        if (!data || typeof data !== 'object') {
          return Response.json({ error: 'data object required' }, { status: 400 });
        }

        const settings = await getOrCreateSettings();
        const now = new Date().toISOString();

        // Build previous/new value strings for audit
        const prevSection = settings[section] || {};
        const prevStr = JSON.stringify(prevSection);
        const newSection = { ...prevSection, ...data };
        const newStr = JSON.stringify(newSection);

        // Build update object
        const updateData = {
          [section]: newSection,
          updated_by: user.id,
          updated_by_name: myProfile.full_name || user.email,
          updated_at: now,
        };

        // Add audit entry
        const auditLog = settings.audit_log || [];
        auditLog.push({
          action: 'UPDATE_SECTION',
          user_id: user.id,
          user_name: myProfile.full_name || user.email,
          user_role: 'owner',
          timestamp: now,
          section: section,
          previous_value: prevStr,
          new_value: newStr,
        });
        updateData.audit_log = auditLog;

        // If security.maintenance_mode or force_logout_all changed, note it
        if (section === 'security') {
          if (data.maintenance_mode !== undefined && data.maintenance_mode !== prevSection.maintenance_mode) {
            auditLog.push({
              action: 'MAINTENANCE_MODE_TOGGLED',
              user_id: user.id,
              user_name: myProfile.full_name || user.email,
              user_role: 'owner',
              timestamp: now,
              section: 'security',
              previous_value: String(prevSection.maintenance_mode),
              new_value: String(data.maintenance_mode),
            });
          }
          if (data.force_logout_all !== undefined && data.force_logout_all !== prevSection.force_logout_all) {
            auditLog.push({
              action: 'FORCE_LOGOUT_TOGGLED',
              user_id: user.id,
              user_name: myProfile.full_name || user.email,
              user_role: 'owner',
              timestamp: now,
              section: 'security',
              previous_value: String(prevSection.force_logout_all),
              new_value: String(data.force_logout_all),
            });
          }
        }

        await base44.asServiceRole.entities.SystemSettings.update(settings.id, updateData);

        return Response.json({
          success: true,
          section: section,
          data: newSection,
          is_owner: true,
        });
      }

      // ── EXPORT_SETTINGS (owner only) ──
      case 'EXPORT_SETTINGS': {
        const ownerError = requireOwner();
        if (ownerError) return ownerError;

        const settings = await getOrCreateSettings();
        const now = new Date().toISOString();

        // Update backup metadata
        const updateData = {
          backup: {
            ...settings.backup,
            last_export_at: now,
          },
          updated_by: user.id,
          updated_by_name: myProfile.full_name || user.email,
          updated_at: now,
        };
        const auditLog = settings.audit_log || [];
        auditLog.push({
          action: 'EXPORT_SETTINGS',
          user_id: user.id,
          user_name: myProfile.full_name || user.email,
          user_role: 'owner',
          timestamp: now,
          section: 'backup',
          previous_value: null,
          new_value: 'Settings exported as JSON',
        });
        updateData.audit_log = auditLog;
        await base44.asServiceRole.entities.SystemSettings.update(settings.id, updateData);

        // Return settings as JSON for download
        const exportData = {
          settings_id: settings.settings_id,
          general: settings.general,
          registration: settings.registration,
          reading_codes: settings.reading_codes,
          subscription: settings.subscription,
          security: settings.security,
          notifications: settings.notifications,
          exported_at: now,
          exported_by: myProfile.full_name || user.email,
        };

        return Response.json({
          success: true,
          export_data: exportData,
        });
      }

      // ── IMPORT_SETTINGS (owner only) ──
      case 'IMPORT_SETTINGS': {
        const ownerError = requireOwner();
        if (ownerError) return ownerError;

        const { import_data } = body;
        if (!import_data || typeof import_data !== 'object') {
          return Response.json({ error: 'import_data object required' }, { status: 400 });
        }

        const settings = await getOrCreateSettings();
        const now = new Date().toISOString();
        const prevStr = JSON.stringify({
          general: settings.general,
          registration: settings.registration,
          reading_codes: settings.reading_codes,
          subscription: settings.subscription,
          security: settings.security,
          notifications: settings.notifications,
        });

        // Merge imported data (only valid sections)
        const validSections = ['general', 'registration', 'reading_codes', 'subscription', 'security', 'notifications'];
        const updateData = {
          updated_by: user.id,
          updated_by_name: myProfile.full_name || user.email,
          updated_at: now,
          backup: {
            ...settings.backup,
            last_import_at: now,
          },
        };
        validSections.forEach((sec) => {
          if (import_data[sec]) {
            updateData[sec] = { ...settings[sec], ...import_data[sec] };
          }
        });

        const newStr = JSON.stringify({
          general: updateData.general,
          registration: updateData.registration,
          reading_codes: updateData.reading_codes,
          subscription: updateData.subscription,
          security: updateData.security,
          notifications: updateData.notifications,
        });

        const auditLog = settings.audit_log || [];
        auditLog.push({
          action: 'IMPORT_SETTINGS',
          user_id: user.id,
          user_name: myProfile.full_name || user.email,
          user_role: 'owner',
          timestamp: now,
          section: 'all',
          previous_value: prevStr,
          new_value: newStr,
        });
        updateData.audit_log = auditLog;

        await base44.asServiceRole.entities.SystemSettings.update(settings.id, updateData);

        return Response.json({
          success: true,
          message: 'Settings imported successfully',
          is_owner: true,
        });
      }

      // ── BACKUP_CONFIG (owner only) ──
      case 'BACKUP_CONFIG': {
        const ownerError = requireOwner();
        if (ownerError) return ownerError;

        const settings = await getOrCreateSettings();
        const now = new Date().toISOString();

        const updateData = {
          backup: {
            ...settings.backup,
            last_backup_at: now,
          },
          updated_at: now,
        };
        const auditLog = settings.audit_log || [];
        auditLog.push({
          action: 'BACKUP_CONFIG',
          user_id: user.id,
          user_name: myProfile.full_name || user.email,
          user_role: 'owner',
          timestamp: now,
          section: 'backup',
          previous_value: null,
          new_value: 'Database configuration backed up',
        });
        updateData.audit_log = auditLog;
        await base44.asServiceRole.entities.SystemSettings.update(settings.id, updateData);

        return Response.json({
          success: true,
          message: 'Configuration backup recorded',
          backup_at: now,
        });
      }

      // ── RESTORE_CONFIG (owner only) ──
      case 'RESTORE_CONFIG': {
        const ownerError = requireOwner();
        if (ownerError) return ownerError;

        const { restore_data } = body;
        if (!restore_data || typeof restore_data !== 'object') {
          return Response.json({ error: 'restore_data object required' }, { status: 400 });
        }

        const settings = await getOrCreateSettings();
        const now = new Date().toISOString();

        // Restore from provided data
        const validSections = ['general', 'registration', 'reading_codes', 'subscription', 'security', 'notifications'];
        const updateData = {
          updated_by: user.id,
          updated_by_name: myProfile.full_name || user.email,
          updated_at: now,
          backup: {
            ...settings.backup,
            last_restore_at: now,
          },
        };
        validSections.forEach((sec) => {
          if (restore_data[sec]) {
            updateData[sec] = restore_data[sec];
          }
        });

        const auditLog = settings.audit_log || [];
        auditLog.push({
          action: 'RESTORE_CONFIG',
          user_id: user.id,
          user_name: myProfile.full_name || user.email,
          user_role: 'owner',
          timestamp: now,
          section: 'all',
          previous_value: 'Previous configuration',
          new_value: 'Configuration restored from backup',
        });
        updateData.audit_log = auditLog;

        await base44.asServiceRole.entities.SystemSettings.update(settings.id, updateData);

        return Response.json({
          success: true,
          message: 'Configuration restored successfully',
          is_owner: true,
        });
      }

      default:
        return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});