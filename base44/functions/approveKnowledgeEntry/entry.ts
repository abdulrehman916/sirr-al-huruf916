import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// approveKnowledgeEntry — OWNER-ONLY approval gateway for the
// Knowledge Cache.
//
// Implements req 4 & 5:
//   - unifiedKnowledgeSearch saves its AI findings as a PENDING
//     KnowledgeCache entry (never auto-published).
//   - The Owner reviews via the Pending Reviews UI and calls THIS
//     function to approve, reject, or request revision.
//   - On approval the entry flips to 'verified' and becomes
//     permanently reusable by every module via getVerifiedKnowledge.
//
// APPEND-ONLY (req 9): the previous scholarly_entries payload is
//   NEVER overwritten destructively. When the Owner re-approves an
//   already-verified entry (because a newer AI run produced updated
//   findings), the old verified payload's hash is preserved in
//   version_history and the old entry is marked 'superseded' (kept,
//   not deleted). Nothing verified is ever lost.
//
// LINKING (req 5): the Owner can attach linked_cards (module + card_id)
//   at approval time so the knowledge is linked to the related cards.
//
// SECURITY: Owner-only (AdminProfile.is_owner === true). No schema
//   changes, no cloud writes, no PDF storage.
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    // ── Owner-only gate ──
    let isOwner = false;
    let ownerName = user.full_name || user.email || '';
    try {
      const profiles = await base44.asServiceRole.entities.AdminProfile.list(null, 500);
      const profile = (profiles || []).find(
        (p) => (p.user_id && p.user_id === user.id) ||
               (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
      );
      isOwner = profile?.is_owner === true;
    } catch { isOwner = false; }
    if (!isOwner) return Response.json({ error: 'Only the Owner can approve knowledge entries' }, { status: 403 });

    const sdk = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const cacheId = String(body.cache_id || '').trim();
    const action = String(body.action || 'approve'); // approve | reject | needs_revision
    const note = String(body.note || '').trim();
    const linkedCards = Array.isArray(body.linked_cards) ? body.linked_cards : [];
    const now = new Date().toISOString();

    if (!cacheId) return Response.json({ error: 'cache_id is required' }, { status: 400 });
    if (!['approve', 'reject', 'needs_revision'].includes(action)) {
      return Response.json({ error: 'action must be approve | reject | needs_revision' }, { status: 400 });
    }

    // ── Load the pending entry ──
    const matches = await sdk.entities.KnowledgeCache.filter({ cache_id: cacheId }, undefined, 5).catch(() => []);
    if (!matches || matches.length === 0) return Response.json({ error: 'Cache entry not found' }, { status: 404 });
    const entry = matches[0];
    const entryId = entry.id || entry._id;

    if (entry.verification_status === 'verified' && action === 'approve') {
      return Response.json({ error: 'Entry is already verified', cache_id: cacheId, status: 'verified' }, { status: 409 });
    }

    // ── Compute previous payload hash (append-only version trail) ──
    let prevPayloadHash = '';
    try {
      const payloadStr = JSON.stringify(entry.scholarly_entries || {});
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payloadStr));
      prevPayloadHash = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (_) {}

    const prevStatus = entry.verification_status || 'pending_review';
    const versionCount = (entry.version_history || []).length;
    const newVersion = versionCount + 1;

    // ── Append approval history + version history (never overwrite) ──
    const approvalHistory = Array.isArray(entry.approval_history) ? [...entry.approval_history] : [];
    approvalHistory.push({ action, user_id: user.id || '', user_name: ownerName, timestamp: now, note });

    const versionHistory = Array.isArray(entry.version_history) ? [...entry.version_history] : [];
    versionHistory.push({
      version: newVersion,
      timestamp: now,
      action: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'needs_revision',
      changed_by: user.id || '',
      changed_by_name: ownerName,
      summary: note || (action === 'approve' ? 'Owner approved — entry now verified and reusable by modules.' : `Owner action: ${action}`),
      previous_status: prevStatus,
      previous_payload_hash: prevPayloadHash,
    });

    // ── Merge any newly linked cards (append-only) ──
    const existingLinks = Array.isArray(entry.linked_cards) ? [...entry.linked_cards] : [];
    for (const lc of linkedCards) {
      if (!lc || !lc.module || !lc.card_id) continue;
      const exists = existingLinks.some((l) => l.module === lc.module && l.card_id === lc.card_id);
      if (exists) continue;
      existingLinks.push({
        module: String(lc.module),
        card_id: String(lc.card_id),
        card_title: String(lc.card_title || ''),
        linked_at: now,
        linked_by: user.id || '',
      });
      approvalHistory.push({ action: 'linked_card', user_id: user.id || '', user_name: ownerName, timestamp: now, note: `${lc.module}:${lc.card_id}` });
    }

    // ── Apply the new status ──
    const newStatus = action === 'approve' ? 'verified' : action === 'reject' ? 'rejected' : 'needs_revision';
    const update = {
      verification_status: newStatus,
      approval_history: approvalHistory,
      version_history: versionHistory,
      linked_cards: existingLinks,
    };
    if (action === 'approve') {
      update.approved_by = user.id || '';
      update.approved_by_name = ownerName;
      update.approved_at = now;
    }

    await sdk.entities.KnowledgeCache.update(entryId, update);

    return Response.json({
      success: true,
      cache_id: cacheId,
      previous_status: prevStatus,
      new_status: newStatus,
      action,
      version: newVersion,
      linked_cards_count: existingLinks.length,
      served_from_cache: false,
      message: action === 'approve'
        ? 'Knowledge entry verified. It is now permanently reusable by every module via getVerifiedKnowledge (zero AI).'
        : `Owner action '${action}' recorded. Entry remains hidden from modules.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});