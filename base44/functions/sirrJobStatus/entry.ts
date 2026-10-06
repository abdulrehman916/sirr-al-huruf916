import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// SIRR JOB CONTROL — sirrJobStatus
//
// Progress tracking + pause / resume / cancel for SIRR background
// jobs (RULE 7). Every operation is isolated per Book ID (RULE 9)
// and never affects another manuscript (RULE 8).
//
//   action=status  → progress snapshot for one book (or all active jobs)
//   action=pause   → set extraction_status='paused' (engine skips it)
//   action=resume  → set extraction_status='pending', clear lock, kick engine
//   action=cancel  → set extraction_status='failed' with reason, clear lock
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });
    const sdk = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'status';
    const sirr_book_id = body.sirr_book_id || '';

    if (action === 'status') {
      if (sirr_book_id) {
        const books = await sdk.entities.SirrManuscriptBook.filter({ sirr_book_id }, undefined, 1);
        const b = books[0];
        if (!b) return Response.json({ error: 'Book not found' }, { status: 404 });
        return Response.json({ job: snapshot(b) });
      }
      const active = await sdk.entities.SirrManuscriptBook.filter(
        { extraction_status: { $in: ['pending', 'processing', 'partial', 'paused', 'pending_verification'] } },
        'upload_date',
        100
      );
      return Response.json({ jobs: active.map(snapshot), active_count: active.length });
    }

    if (!sirr_book_id) return Response.json({ error: 'sirr_book_id is required for ' + action }, { status: 400 });
    const books = await sdk.entities.SirrManuscriptBook.filter({ sirr_book_id }, undefined, 1);
    const book = books[0];
    if (!book) return Response.json({ error: 'Book not found: ' + sirr_book_id }, { status: 404 });
    const rid = book.id || book._id;

    if (action === 'pause') {
      await sdk.entities.SirrManuscriptBook.update(rid, {
        extraction_status: 'paused',
        processing_lock_until: '',
      });
      await logAudit(sdk, sirr_book_id, 'retry', user, 'Job paused by admin.');
      return Response.json({ status: 'paused', sirr_book_id });
    }

    if (action === 'resume') {
      await sdk.entities.SirrManuscriptBook.update(rid, {
        extraction_status: 'pending',
        extraction_error: '',
        processing_lock_until: '',
      });
      await logAudit(sdk, sirr_book_id, 'retry', user, 'Job resumed by admin.');
      sdk.functions.invoke('sirrProcessNextChunk', {}).catch(() => {});
      return Response.json({ status: 'resumed', sirr_book_id });
    }

    if (action === 'cancel') {
      await sdk.entities.SirrManuscriptBook.update(rid, {
        extraction_status: 'failed',
        extraction_error: 'Cancelled by admin via sirrJobStatus.',
        processing_lock_until: '',
      });
      await logAudit(sdk, sirr_book_id, 'extract_failed', user, 'Job cancelled by admin.');
      return Response.json({ status: 'cancelled', sirr_book_id });
    }

    return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function snapshot(b) {
  return {
    sirr_book_id: b.sirr_book_id,
    book_title: b.malayalam_book_name || b.book_title,
    extraction_status: b.extraction_status,
    verification_status: b.verification_status,
    current_part_index: b.current_part_index || 0,
    total_parts: Array.isArray(b.pdf_parts) ? b.pdf_parts.length : 0,
    last_processed_page: b.last_processed_page || 0,
    combined_total_pages: b.combined_total_pages || 0,
    total_entries: b.total_entries || 0,
    processing_locked: !!(b.processing_lock_until && Date.parse(b.processing_lock_until) > Date.now()),
    processing_lock_until: b.processing_lock_until || '',
    last_verified_at: b.last_verified_at || '',
    extraction_error: b.extraction_error || '',
  };
}

async function logAudit(sdk, sirr_book_id, action, user, details) {
  await sdk.entities.SirrAuditLog.create({
    audit_id: `SA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sirr_book_id,
    action,
    user_id: user?.id || '',
    user_name: user?.full_name || user?.email || '',
    timestamp: new Date().toISOString(),
    status: 'info',
    details,
  }).catch(() => {});
}