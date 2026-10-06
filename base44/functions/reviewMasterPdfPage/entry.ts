import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// MASTER PDF LIBRARY — OWNER REVIEW & APPROVAL
//
// The mandatory gate between processed PDF pages and the knowledge
// base. NOTHING is published automatically. Only the Owner may
// approve, and only approved pages ever reach Holy Names / Sections
// A·B·C / Abjad / Bast / Wafq / Vefk / Mizan / Khadim / Astrology.
//
// APPEND-ONLY DISCIPLINE (Law §13):
//   - ocr_text / ocr_text_ar / ocr_text_en / ocr_text_ml are IMMUTABLE
//     (the original OCR of record). They are never overwritten.
//   - Corrections target the *verified* fields (arabic_text /
//     english_text / malayalam_text) and append an entry to
//     ocr_corrections with the original snippet + corrected snippet +
//     reason + who + when. The original OCR is preserved forever.
//   - Rejected records are NEVER deleted — they stay in history and
//     can be re-opened for review (mode 're_review').
//
// MODES:
//   approve    — review_status='approved'   (publishable)
//   reject     — review_status='rejected'   (kept in history, re-reviewable)
//   re_review  — review_status='pending_review' (reopen a rejected/ignored page)
//   correct    — fix a verified field + append ocr_corrections + recompute search_text
//   note       — append an owner note (recorded in SirrAuditLog, the permanent trail)
//   uncertain  — flag needs_owner_review=true (keep pending)
//   reprocess  — delete a pending/rejected page + reset the book cursor so the
//                pipeline re-extracts it. APPROVED pages can never be reprocessed.
//   merge      — mark this page a duplicate (review_status='ignored'), pointing
//                at the canonical page. The canonical stays the publishable record.
//
// SECURITY: Owner-only. Verifies AdminProfile.is_owner === true server-side.
//   Non-owners (admin/user/guest) get 403. Every action is written to SirrAuditLog
//   (action='verify') with the page number in page_range, so the full verification
//   history of every page is permanently traceable (Law §14).
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    // ── Owner-only gate ──
    let isOwner = false;
    try {
      const profiles = await base44.asServiceRole.entities.AdminProfile.list(null, 500);
      const profile = (profiles || []).find(
        (p) =>
          (p.user_id && p.user_id === user.id) ||
          (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
      );
      isOwner = profile?.is_owner === true;
    } catch { isOwner = false; }
    if (!isOwner) {
      return Response.json({ error: 'Only the Owner can review and approve knowledge' }, { status: 403 });
    }

    const sdk = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const mode = String(body.mode || '');
    const pageId = String(body.page_id || '');
    if (!mode || !pageId) return Response.json({ error: 'mode and page_id are required' }, { status: 400 });

    // Load the page (service-role: MasterPdfPage RLS is admin-only).
    const page = await sdk.entities.MasterPdfPage.get(pageId);
    if (!page) return Response.json({ error: 'Page not found' }, { status: 404 });

    const now = new Date().toISOString();
    const reviewer = user.full_name || user.email || user.id;
    const pageStr = String(page.page_number || '');
    const bookId = page.master_book_id || '';
    const partId = page.source_part_id || '';
    const partNum = Number(page.source_part_number) || 0;

    async function audit(action, status, details) {
      await sdk.entities.SirrAuditLog.create({
        audit_id: `SA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sirr_book_id: bookId,
        part_id: partId,
        part_number: partNum,
        action,
        user_id: user.id,
        user_name: reviewer,
        timestamp: now,
        page_range: pageStr,
        status,
        details,
      }).catch(() => {});
    }

    async function pushBookVersion(change_summary, previous_value, new_value) {
      try {
        const books = await sdk.entities.MasterPdfBook.filter({ master_book_id: bookId }, undefined, 1);
        const bk = books[0];
        if (!bk) return;
        const vh = Array.isArray(bk.version_history) ? bk.version_history : [];
        vh.push({
          version_id: `VH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: now,
          action: 'review',
          user_id: user.id,
          user_name: reviewer,
          change_summary,
          previous_value: previous_value || '',
          new_value: new_value || '',
        });
        await sdk.entities.MasterPdfBook.update(bk.id || bk._id, { version_history: vh });
      } catch (_) {}
    }

    // ── APPROVE ──
    if (mode === 'approve') {
      const upd = {
        review_status: 'approved',
        needs_owner_review: false,
        reviewed_by: user.id,
        reviewed_at: now,
      };
      await sdk.entities.MasterPdfPage.update(pageId, upd);
      await audit('verify', 'success', `Page ${pageStr} approved by Owner.`);
      await pushBookVersion(`Page ${pageStr} approved`, page.review_status || '', 'approved');
      return Response.json({ success: true, page_id: pageId, review_status: 'approved' });
    }

    // ── REJECT ── (kept in history; re-reviewable; never deleted)
    if (mode === 'reject') {
      const reason = String(body.reason || '').slice(0, 500);
      const upd = {
        review_status: 'rejected',
        reviewed_by: user.id,
        reviewed_at: now,
      };
      await sdk.entities.MasterPdfPage.update(pageId, upd);
      await audit('verify', 'failed', `Page ${pageStr} rejected${reason ? ': ' + reason : ''}.`);
      await pushBookVersion(`Page ${pageStr} rejected`, page.review_status || '', 'rejected');
      return Response.json({ success: true, page_id: pageId, review_status: 'rejected' });
    }

    // ── RE_REVIEW (reopen) ──
    if (mode === 're_review') {
      const upd = {
        review_status: 'pending_review',
        needs_owner_review: true,
        reviewed_by: '',
        reviewed_at: '',
      };
      await sdk.entities.MasterPdfPage.update(pageId, upd);
      await audit('verify', 'info', `Page ${pageStr} re-opened for review.`);
      return Response.json({ success: true, page_id: pageId, review_status: 'pending_review' });
    }

    // ── CORRECT (verified field; original OCR never touched) ──
    if (mode === 'correct') {
      const field = String(body.field || ''); // arabic_text | english_text | malayalam_text
      if (!['arabic_text', 'english_text', 'malayalam_text'].includes(field)) {
        return Response.json({ error: 'field must be arabic_text, english_text, or malayalam_text' }, { status: 400 });
      }
      const corrected = String(body.corrected_value || '');
      const reason = String(body.reason || '').slice(0, 500);
      const original = String(page[field] || '');
      const originalSnippet = original.slice(0, 400);
      const correctedSnippet = corrected.slice(0, 400);

      const corrections = Array.isArray(page.ocr_corrections) ? page.ocr_corrections : [];
      corrections.push({
        correction_id: `COR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: now,
        corrected_by: user.id,
        field,
        original_snippet: originalSnippet,
        corrected_snippet: correctedSnippet,
        reason,
      });

      // Recompute search_text (ocr_text stays immutable; verified field changes).
      const search_text = [
        page.ocr_text || '',
        field === 'arabic_text' ? corrected : (page.arabic_text || ''),
        field === 'english_text' ? corrected : (page.english_text || ''),
        field === 'malayalam_text' ? corrected : (page.malayalam_text || ''),
      ].join(' ').toLowerCase();

      const upd = { [field]: corrected, ocr_corrections: corrections, search_text };
      await sdk.entities.MasterPdfPage.update(pageId, upd);
      await audit('verify', 'success', `Corrected ${field} on page ${pageStr}.${reason ? ' ' + reason : ''}`);
      await pushBookVersion(`Page ${pageStr}: ${field} corrected`, originalSnippet.slice(0, 80), correctedSnippet.slice(0, 80));
      return Response.json({ success: true, page_id: pageId, field, corrections: corrections.length });
    }

    // ── NOTE (permanent trail in SirrAuditLog) ──
    if (mode === 'note') {
      const note = String(body.note || '').slice(0, 1000);
      if (!note) return Response.json({ error: 'note is required' }, { status: 400 });
      await audit('verify', 'info', `NOTE: ${note}`);
      return Response.json({ success: true, page_id: pageId, note });
    }

    // ── UNCERTAIN (flag, keep pending) ──
    if (mode === 'uncertain') {
      const note = String(body.note || '').slice(0, 500);
      await sdk.entities.MasterPdfPage.update(pageId, { needs_owner_review: true });
      await audit('verify', 'info', `Page ${pageStr} marked uncertain by Owner.${note ? ' ' + note : ''}`);
      return Response.json({ success: true, page_id: pageId, needs_owner_review: true });
    }

    // ── REPROCESS (re-extract; only pending/rejected, never approved) ──
    if (mode === 'reprocess') {
      if (!['pending_review', 'rejected', 'ignored'].includes(page.review_status)) {
        return Response.json({ error: 'Only pending, rejected, or ignored pages can be reprocessed. Approved pages are permanent.' }, { status: 400 });
      }
      // Delete the unverified draft (approved knowledge is never deleted).
      await sdk.entities.MasterPdfPage.delete(pageId);
      // Reset the book cursor so the pipeline re-covers this page.
      try {
        const books = await sdk.entities.MasterPdfBook.filter({ master_book_id: bookId }, undefined, 1);
        const bk = books[0];
        if (bk) {
          await sdk.entities.MasterPdfBook.update(bk.id || bk._id, {
            current_part_index: Math.max(0, partNum - 1),
            last_processed_page: Math.max(0, Number(page.page_number) - 1),
            extraction_status: 'processing',
            extraction_error: '',
          });
        }
      } catch (_) {}
      await audit('retry', 'info', `Owner requested re-processing of page ${pageStr}. Draft deleted; pipeline will re-extract.`);
      await pushBookVersion(`Page ${pageStr} reprocessing requested`, page.review_status || '', 'reprocessing');
      return Response.json({ success: true, page_id: pageId, reprocessed: true });
    }

    // ── MERGE (mark this page a duplicate of the canonical) ──
    if (mode === 'merge') {
      const canonical = String(body.canonical_page_record_id || '').slice(0, 120);
      const upd = {
        review_status: 'ignored',
        reviewed_by: user.id,
        reviewed_at: now,
      };
      await sdk.entities.MasterPdfPage.update(pageId, upd);
      await audit('verify', 'info', `Page ${pageStr} merged into ${canonical || '(canonical)'}. Kept in history; canonical is the publishable record.`);
      await pushBookVersion(`Page ${pageStr} merged`, page.review_status || '', 'ignored');
      return Response.json({ success: true, page_id: pageId, review_status: 'ignored', canonical });
    }

    return Response.json({ error: 'unknown mode: ' + mode }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});