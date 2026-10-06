import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// SIRR BOOK VERIFICATION REPORT — sirrVerifyBook
//
// Produces the full post-processing verification report required after
// ALL PDF parts of a book have been uploaded and processed. Persists
// the book-level verification_status verdict on the book record.
//
// Report fields:
//   total_pdf_parts           — count of pdf_parts
//   total_pages               — sum of every part's page_count (true total)
//   missing_pages             — parts not fully processed (must be 0)
//   ocr_issues                — entries flagged needs_review / confidence < 100 (must be 0)
//   missing_malayalam_meanings— entries that HAVE explanatory text but an empty malayalam_meaning (must be 0)
//   duplicate_entries         — duplicate sirr_entry_id OR identical arabic_text (must be 0)
//   order_gaps                — breaks in entry_order sequence (must be 0)
//   arabic_verification_status— verified | needs_review | no_entries
//   database_verification_status — verified | incomplete
//   final_result              — VERIFIED only if everything passes
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });
    const sdk = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const sirr_book_id = body.sirr_book_id;
    if (!sirr_book_id) return Response.json({ error: 'sirr_book_id is required' }, { status: 400 });

    // ── Load the book ──
    const books = await sdk.entities.SirrManuscriptBook.filter({ sirr_book_id }, undefined, 1);
    const book = books[0];
    if (!book) return Response.json({ error: 'Book not found: ' + sirr_book_id }, { status: 404 });

    // ── Load every entry for this book in paginated batches (RULE 2: never one giant query) ──
    const entries = [];
    let lastOrder = -1;
    while (true) {
      const batch = await sdk.entities.SirrManuscriptEntry.filter(
        { sirr_book_id, entry_order: { $gt: lastOrder } },
        'entry_order',
        5000
      );
      if (!batch.length) break;
      entries.push(...batch);
      lastOrder = Number(batch[batch.length - 1].entry_order) || lastOrder;
      if (batch.length < 5000) break;
    }

    const pdf_parts = Array.isArray(book.pdf_parts) ? book.pdf_parts : [];
    const total_pdf_parts = pdf_parts.length;
    const total_pages =
      pdf_parts.reduce((s, p) => s + (p.page_count || 0), 0) ||
      book.combined_total_pages ||
      book.total_pages ||
      0;

    // ── Missing pages: any part not fully processed ──
    const missing_pages = pdf_parts.filter(
      (p) => !p.processed || (p.page_count > 0 && (p.page_end || 0) < p.page_count)
    ).length;

    // ── OCR issues: needs_review or confidence < 100 ──
    const ocr_issues = entries.filter(
      (e) => e.needs_review || (typeof e.ocr_confidence === 'number' && e.ocr_confidence < 100)
    ).length;

    // ── Missing Malayalam meanings:
    //    Only counts entries that HAVE explanatory text (in the structured
    //    notes) but an EMPTY malayalam_meaning. Entries with no explanation
    //    at all are legitimately empty — they are NOT counted as missing. ──
    const explanatoryFields = [
      'introduction', 'purpose', 'benefits', 'etiquette', 'conditions',
      'preparation', 'materials', 'warnings', 'repetition', 'timing', 'day', 'notes',
    ];
    const missing_malayalam_meanings = entries.filter((e) => {
      const ml = (e.malayalam_meaning || '').trim();
      if (ml) return false;
      let notesObj = {};
      try { notesObj = JSON.parse(e.notes || '{}'); } catch (_) {}
      return explanatoryFields.some((k) => (notesObj[k] || '').trim());
    }).length;

    // ── Duplicate entries: duplicate sirr_entry_id OR identical arabic_text ──
    const idCounts = {};
    const textCounts = {};
    for (const e of entries) {
      const id = e.sirr_entry_id || e._id || '';
      if (id) idCounts[id] = (idCounts[id] || 0) + 1;
      const t = (e.arabic_text || '').trim();
      if (t) textCounts[t] = (textCounts[t] || 0) + 1;
    }
    const duplicate_entries =
      Object.values(idCounts).filter((c) => c > 1).length +
      Object.values(textCounts).filter((c) => c > 1).length;

    // ── Order gaps: breaks in the entry_order sequence ──
    const orders = entries.map((e) => Number(e.entry_order) || 0).sort((a, b) => a - b);
    let order_gaps = 0;
    for (let i = 1; i < orders.length; i++) {
      if (orders[i] !== orders[i - 1] + 1) order_gaps++;
    }

    // ── Arabic verification status ──
    const arabic_verified = entries.filter((e) => !e.needs_review).length;
    const arabic_verification_status =
      entries.length === 0 ? 'no_entries' : (arabic_verified === entries.length ? 'verified' : 'needs_review');

    // ── Database verification status ──
    const database_verification_status =
      book.extraction_status === 'completed' && entries.length > 0 && missing_pages === 0
        ? 'verified'
        : 'incomplete';

    // ── Per-part breakdown (exact Part ID + status for every uploaded PDF) ──
    const parts = pdf_parts.map((p) => {
      const partEntries = entries.filter((e) => (e.source_part_id || '') === (p.part_id || ''));
      const partOcrIssues = partEntries.filter((e) => e.needs_review).length;
      const partMissing = !p.processed || (p.page_count > 0 && (p.page_end || 0) < p.page_count) ? 1 : 0;
      const partVerified = !!p.processed && partMissing === 0 && partOcrIssues === 0 && partEntries.length > 0;
      return {
        part_id: p.part_id || '',
        part_number: p.part_number,
        file_name: p.file_name,
        page_count: p.page_count || 0,
        page_end: p.page_end || 0,
        processed: !!p.processed,
        extraction_status: p.extraction_status || 'pending',
        ocr_status: p.ocr_status || 'pending',
        entries: partEntries.length,
        ocr_issues: partOcrIssues,
        missing_pages: partMissing,
        verification_status: partVerified ? 'verified' : 'failed',
      };
    });
    const failedPartIds = parts
      .filter((p) => !p.processed || p.missing_pages > 0 || p.ocr_issues > 0 || p.entries === 0)
      .map((p) => p.part_id || `Part ${p.part_number}`);

    // ── Missing parts (RULE 14): parts not fully processed or with zero entries ──
    const missing_parts = parts.filter((p) => p.missing_pages > 0 || p.entries === 0).length;

    // ── OCR confidence summary (RULE 14) ──
    const confidences = entries.map((e) => Number(e.ocr_confidence) || 100);
    const min_ocr_confidence = confidences.length ? Math.min(...confidences) : 100;
    const avg_ocr_confidence = confidences.length
      ? Math.round(confidences.reduce((s, c) => s + c, 0) / confidences.length)
      : 100;

    // ── Malayalam verification status (RULE 14) ──
    const malayalam_verification_status =
      entries.length === 0 ? 'no_entries'
        : (missing_malayalam_meanings === 0 ? 'verified' : 'needs_review');

    // ── Final verdict + exact failure reasons ──
    // RULE 15: 'completed' is set ONLY by this function on VERIFIED. Before verify,
    // a fully-processed book sits in 'pending_verification' (never 'completed').
    const processing_done =
      book.extraction_status === 'completed' || book.extraction_status === 'pending_verification';
    const all_parts_processed =
      total_pdf_parts === 0 ? true : parts.every((p) => p.processed && p.entries > 0);
    const all_pass =
      processing_done &&
      all_parts_processed &&
      missing_pages === 0 &&
      missing_parts === 0 &&
      ocr_issues === 0 &&
      duplicate_entries === 0 &&
      missing_malayalam_meanings === 0 &&
      order_gaps === 0 &&
      entries.length > 0;

    const failure_reasons = [];
    if (!processing_done)
      failure_reasons.push(`extraction_status is '${book.extraction_status}' (processing not finished)`);
    if (entries.length === 0)
      failure_reasons.push('no entries extracted');
    if (total_pdf_parts === 0)
      failure_reasons.push('no pdf_parts stored in the book record (multi-part storage missing)');
    if (missing_pages > 0)
      failure_reasons.push(`${missing_pages} PDF part(s) not fully processed`);
    if (missing_parts > 0)
      failure_reasons.push(`${missing_parts} PDF part(s) missing pages or entries`);
    if (ocr_issues > 0)
      failure_reasons.push(`${ocr_issues} entry(ies) with OCR confidence < 100 (flagged for review)`);
    if (duplicate_entries > 0)
      failure_reasons.push(`${duplicate_entries} duplicate entry group(s) detected`);
    if (missing_malayalam_meanings > 0)
      failure_reasons.push(`${missing_malayalam_meanings} entry(ies) with explanatory text but missing Malayalam meaning`);
    if (order_gaps > 0)
      failure_reasons.push(`${order_gaps} gap(s) in entry_order sequence`);
    if (failedPartIds.length > 0)
      failure_reasons.push(`part(s) not verified: ${failedPartIds.join(', ')}`);

    let final_result;
    if (all_pass) final_result = 'VERIFIED';
    else if (processing_done) final_result = 'FAILED';
    else final_result = 'PENDING';

    // Persist the book-level verification verdict permanently on the book record.
    const persistedStatus =
      all_pass ? 'verified' : (processing_done ? 'failed' : 'unverified');
    // RULE 15: promote to 'completed' ONLY on VERIFIED; otherwise demote to 'pending_verification'.
    let newExtractionStatus = book.extraction_status;
    if (all_pass) newExtractionStatus = 'completed';
    else if (book.extraction_status === 'completed' || book.extraction_status === 'pending_verification') newExtractionStatus = 'pending_verification';
    const verification_report = {
      verified_at: new Date().toISOString(),
      total_pdf_parts,
      total_pages,
      total_entries: entries.length,
      missing_pages,
      missing_parts,
      ocr_issues,
      min_ocr_confidence,
      avg_ocr_confidence,
      missing_malayalam_meanings,
      malayalam_verification_status,
      duplicate_entries,
      order_gaps,
      arabic_verification_status,
      database_verification_status,
      final_result,
      failure_reasons,
      verification_passed: all_pass,
      parts,
    };
    await sdk.entities.SirrManuscriptBook.update(book.id || book._id, {
      verification_status: persistedStatus,
      verification_report,
      last_verified_at: new Date().toISOString(),
      extraction_status: newExtractionStatus,
    }).catch(() => {});

    await sdk.entities.SirrAuditLog.create({
      audit_id: `SA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sirr_book_id,
      action: 'verify',
      user_id: user?.id || 'system',
      user_name: user?.full_name || user?.email || 'system',
      timestamp: new Date().toISOString(),
      status: all_pass ? 'success' : (processing_done ? 'failed' : 'partial'),
      details: `Verification ${final_result}. parts=${total_pdf_parts} entries=${entries.length} ocr_issues=${ocr_issues} missing_pages=${missing_pages}`,
      entry_count: entries.length,
      ocr_confidence_min: entries.length > 0
        ? Math.min(...entries.map((e) => Number(e.ocr_confidence) || 100))
        : 100,
    }).catch(() => {});

    return Response.json({
      sirr_book_id,
      book_title: book.book_title,
      extraction_status: book.extraction_status,
      total_pdf_parts,
      total_pages,
      total_entries: entries.length,
      missing_pages,
      missing_parts,
      ocr_issues,
      min_ocr_confidence,
      avg_ocr_confidence,
      missing_malayalam_meanings,
      malayalam_verification_status,
      duplicate_entries,
      order_gaps,
      arabic_verification_status,
      database_verification_status,
      final_result,
      failure_reasons,
      verification_passed: all_pass,
      parts,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});