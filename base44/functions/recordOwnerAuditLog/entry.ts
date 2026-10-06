import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * recordOwnerAuditLog — the single append-only write path for the Owner Audit Log.
 *
 * Captures: user (id, email, name), role, action, object (type/id/label),
 * date/time, device, IP, user-agent. Writes via the service role so the entity's
 * locked RLS (superadmin-only) is bypassed — no SDK/frontend path can write.
 *
 * Security:
 *   - Caller MUST be an admin or owner (auth.me role check).
 *   - The entity is append-only: this function never exposes update/delete.
 *   - IP / device / user-agent are read from the request, not trusted from body.
 *
 * Payload (body):
 *   action_type   — one of the OWNER_AUDIT_ACTIONS (see below)
 *   action_label  — short human-readable summary (optional)
 *   object_type   — e.g. "AdminProfile", "Product", "User" (optional)
 *   object_id     — identifier of the affected object (optional)
 *   object_label  — display label of the affected object (optional)
 *   details       — object with extra context; stored as JSON string (optional)
 *   device_id     — optional device/session id (falls back to x-device-id header)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Admin access required to write audit log' }, { status: 403 });
    }

    const body = await req.json();
    const {
      action_type,
      action_label,
      object_type,
      object_id,
      object_label,
      details,
      device_id,
    } = body;

    if (!action_type || typeof action_type !== 'string') {
      return Response.json({ error: 'action_type is required' }, { status: 400 });
    }

    // ── Resolve actor role (owner vs admin) from AdminProfile ──
    let resolvedRole = user.role === 'admin' ? 'admin' : 'customer';
    let deviceId = device_id || req.headers.get('x-device-id') || '';
    try {
      const profiles = await base44.asServiceRole.entities.AdminProfile.list(null, 500);
      const profile = (profiles || []).find(
        (p) =>
          (p.user_id && p.user_id === user.id) ||
          (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
      );
      if (profile?.is_owner === true) resolvedRole = 'owner';
      if (!deviceId && profile?.device_id) deviceId = profile.device_id;
    } catch {
      // Best-effort role resolution; proceed with platform role.
    }

    // ── Capture request metadata ──
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '';
    const userAgent = req.headers.get('user-agent') || '';

    const now = new Date();
    const log_id =
      'OAL-' +
      now.getTime().toString(36).toUpperCase() +
      '-' +
      Math.random().toString(36).substring(2, 8).toUpperCase();

    const entry = {
      log_id,
      action_type: String(action_type).toUpperCase(),
      action_label: action_label || '',
      performed_by_id: user.id,
      performed_by_email: user.email || '',
      performed_by_name: user.full_name || user.email || '',
      performed_by_role: resolvedRole,
      object_type: object_type || '',
      object_id: object_id || '',
      object_label: object_label || '',
      details: details ? JSON.stringify(details) : '',
      device_id: deviceId,
      ip_address: ip,
      user_agent: userAgent,
      timestamp: now.toISOString(),
    };

    await base44.asServiceRole.entities.OwnerAuditLog.create(entry);

    return Response.json({ success: true, log_id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});