import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Renew a Reading Access Code — extends the code-level expiry, appends to
 * renewal_history + audit_log, and re-enables the code if it was disabled.
 *
 * Stabilization (no architecture change):
 *  - P2.4: Preserves per-page durations. Previously this overwrote ALL
 *          page_durations and feature_durations with a uniform "RENEWED"
 *          value, destroying per-page customization. Now it only updates the
 *          code-level expiry_date; per-page/feature durations are left intact
 *          so the owner's per-page setup is preserved across renewals.
 *  - P2.5: The code-level expiry_date becomes the new authoritative expiry;
 *          validateAndCleanPermissions syncs each redeemed device to it.
 *  - P3.7: Validates code_id and duration inputs.
 *  - P4.9: Writes a centralized AuditLog entry.
 *
 * Input:  { code_id, duration_type, duration_count, custom_date, notes }
 * Output: { success, message, new_expiry }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { code_id, duration_type, duration_count, custom_date, notes } = body;

    // ── P3.7: Input validation ──
    if (!code_id || typeof code_id !== 'string') {
      return Response.json({ error: 'code_id required' }, { status: 400 });
    }
    if (!duration_type || typeof duration_type !== 'string') {
      return Response.json({ error: 'duration_type required' }, { status: 400 });
    }

    const code = await base44.asServiceRole.entities.AccessCode.get(code_id);
    if (!code) return Response.json({ error: 'Code not found' }, { status: 404 });

    // Compute new expiry + duration values for ALL types
    const multipliers: Record<string, number> = {
      MINUTES: 60000, HOURS: 3600000, DAYS: 86400000,
      WEEKS: 604800000, MONTHS: 2592000000, YEARS: 31536000000,
    };

    let newExpiry: string | null = null;
    let durationMs: number | null = null;
    let durationDays: number | null = null;
    let isLifetime = false;
    let label = '';

    if (duration_type === 'LIFETIME') {
      isLifetime = true;
      newExpiry = null;
      label = 'Lifetime';
    } else if (duration_type === 'CUSTOM') {
      if (!custom_date) return Response.json({ error: 'custom_date required for CUSTOM duration' }, { status: 400 });
      const customTime = new Date(custom_date).getTime();
      if (isNaN(customTime)) return Response.json({ error: 'Invalid custom_date' }, { status: 400 });
      newExpiry = new Date(custom_date).toISOString();
      durationMs = customTime - Date.now();
      durationDays = Math.ceil(durationMs / 86400000);
      label = 'Custom';
    } else {
      const ms = multipliers[duration_type];
      if (!ms) return Response.json({ error: 'Invalid duration_type' }, { status: 400 });
      const count = parseInt(duration_count);
      if (isNaN(count) || count <= 0) return Response.json({ error: 'Valid duration_count required' }, { status: 400 });
      durationMs = count * ms;
      durationDays = Math.ceil(durationMs / 86400000);
      newExpiry = new Date(Date.now() + durationMs).toISOString();
      const typeLabel = duration_type.charAt(0) + duration_type.slice(1).toLowerCase();
      label = `${count} ${typeLabel}`;
    }

    const oldExpiry = code.expiry_date;
    const now = new Date().toISOString();

    const renewalEntry = {
      renewed_at: now,
      renewed_by: user.id,
      old_expiry: oldExpiry || null,
      new_expiry: newExpiry,
      duration_type: duration_type || 'DAYS',
      duration_count: duration_count ? parseInt(duration_count) : null,
      notes: notes || null,
    };

    const auditEntry = {
      action: 'RENEWED',
      timestamp: now,
      admin_id: user.id,
      details: `Renewed: ${label} → ${newExpiry || 'Lifetime'}`,
    };

    // ── P2.4: Update ONLY the code-level expiry. page_durations and
    // feature_durations are intentionally left untouched so the owner's
    // per-page setup is preserved across renewals. ──
    // ── TRUE PER-PAGE EXPIRY: a Renew Code action re-grants EVERY page from now
    // with the new duration (each page independently). Per-page renew (single
    // page) is done via the EditCodeModal duration change, which touches only
    // that page. The code-level expiry_date is kept as a coarse guard only. ──
    const pagePaths = code.page_paths || [];
    const origGrants: Record<string, any> = code.page_grants || {};
    const renewedGrants: Record<string, any> = { ...origGrants };
    pagePaths.forEach((p: string) => {
      renewedGrants[p] = {
        granted_at: now,
        expires_at: newExpiry, // null for Lifetime, custom ISO for CUSTOM
        duration_label: label,
      };
    });

    await base44.asServiceRole.entities.AccessCode.update(code_id, {
      expiry_date: newExpiry,
      page_grants: renewedGrants,
      is_disabled: false, // Re-enable on renew
      renewal_history: [...(code.renewal_history || []), renewalEntry],
      audit_log: [...(code.audit_log || []), auditEntry],
    });

    // ── P4.9: Centralized audit log ──
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        log_id: 'AUDIT-' + crypto.randomUUID().toUpperCase(),
        action_type: 'ACCESS_CODE_RENEWED',
        performed_by: user.id,
        performed_by_email: user.email || '',
        target_entity: 'AccessCode',
        target_id: code.code || code_id,
        details: JSON.stringify({ code_id, label, old_expiry: oldExpiry || null, new_expiry: newExpiry }),
        timestamp: now,
      });
    } catch { /* best-effort */ }

    return Response.json({
      success: true,
      message: 'Code renewed successfully',
      new_expiry: newExpiry,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});