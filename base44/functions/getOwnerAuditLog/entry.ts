import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * getOwnerAuditLog — owner-only read of the complete audit trail.
 *
 * Security:
 *   - Caller MUST be the owner (AdminProfile.is_owner === true). Non-owners get 403.
 *   - Reads via the service role (entity RLS is locked to superadmin).
 *   - This is the ONLY read path; the entity cannot be read directly via SDK.
 *
 * Query params (body):
 *   action_type — filter by exact action type (optional)
 *   object_type — filter by exact object type (optional)
 *   actor_email — filter by performed_by_email (case-insensitive) (optional)
 *   search      — free-text against action_label / object_label / performed_by_email (optional)
 *   from        — ISO date (inclusive) (optional)
 *   to          — ISO date (inclusive) (optional)
 *   limit       — page size (default 50, max 200)
 *   skip        — offset for pagination (default 0)
 *
 * Returns newest-first.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // ── Owner-only ──
    let isOwner = false;
    try {
      const profiles = await base44.asServiceRole.entities.AdminProfile.list(null, 500);
      const profile = (profiles || []).find(
        (p) =>
          (p.user_id && p.user_id === user.id) ||
          (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
      );
      isOwner = profile?.is_owner === true;
    } catch {
      isOwner = false;
    }
    if (!isOwner) {
      return Response.json(
        { error: 'Only the owner can view the audit log' },
        { status: 403 }
      );
    }

    // ── Parse & validate filters ──
    const body = await req.json().catch(() => ({}));
    const {
      action_type,
      object_type,
      actor_email,
      search,
      from,
      to,
      limit,
      skip,
    } = body || {};

    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
    const offset = Math.max(parseInt(skip, 10) || 0, 0);

    // Pull a generous recent window then filter in-memory (audit data is append-only;
    // a single sorted fetch + filter is reliable and avoids complex query building).
    const fetchCap = 1000;
    const all = await base44.asServiceRole.entities.OwnerAuditLog.list('-timestamp', fetchCap);
    let rows = all || [];

    if (action_type) {
      const at = String(action_type).toUpperCase();
      rows = rows.filter((r) => r.action_type === at);
    }
    if (object_type) {
      rows = rows.filter((r) => r.object_type === object_type);
    }
    if (actor_email) {
      const ae = String(actor_email).toLowerCase();
      rows = rows.filter(
        (r) => (r.performed_by_email || '').toLowerCase() === ae
      );
    }
    if (from) {
      const fromTs = new Date(from).getTime();
      if (!isNaN(fromTs)) rows = rows.filter((r) => new Date(r.timestamp).getTime() >= fromTs);
    }
    if (to) {
      const toTs = new Date(to).getTime();
      if (!isNaN(toTs)) rows = rows.filter((r) => new Date(r.timestamp).getTime() <= toTs);
    }
    if (search) {
      const q = String(search).toLowerCase();
      rows = rows.filter((r) =>
        [r.action_label, r.object_label, r.performed_by_email, r.performed_by_name, r.action_type]
          .map((s) => (s || '').toLowerCase())
          .some((s) => s.includes(q))
      );
    }

    const total = rows.length;
    const pageRows = rows.slice(offset, offset + pageSize);

    return Response.json({
      success: true,
      total,
      limit: pageSize,
      skip: offset,
      has_more: offset + pageSize < total,
      rows: pageRows,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});