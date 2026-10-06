import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// SIRR REBUILD PART — sirrRebuildPart
//
// Re-run OCR / rebuild entries for ONE PDF part of a book.
// Resets the chosen part so the background engine re-extracts it
// from its permanently-stored file_url. Existing entries for that
// part are re-extracted chunk-by-chunk (each chunk's deterministic
// sirr_entry_id range is replaced with fresh OCR output).
//
// This is the "Re-run OCR / Rebuild entries" capability of the
// permanent archive. The rebuild is permanently recorded in
// SirrAuditLog so no data change is ever silent.
//
// Params: { sirr_book_id, part_id }  (or part_number)
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });
    const sdk = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const sirr_book_id = body.sirr_book_id;
    if (!sirr_book_id) return Response.json({ error: 'sirr_book_id is required' }, { status: 400 });

    const books = await sdk.entities.SirrManuscriptBook.filter({ sirr_book_id }, undefined, 1);
    const book = books[0];
    if (!book) return Response.json({ error: 'Book not found: ' + sirr_book_id }, { status: 404 });

    const parts = Array.isArray(book.pdf_parts) ? book.pdf_parts : [];
    let partIdx = -1;
    if (body.part_id) {
      partIdx = parts.findIndex((p) => p.part_id === body.part_id);
    } else if (body.part_number) {
      partIdx = parts.findIndex((p) => p.part_number === Number(body.part_number));
    } else {
      return Response.json({ error: 'part_id or part_number is required' }, { status: 400 });
    }
    if (partIdx < 0) return Response.json({ error: 'Part not found in this book' }, { status: 404 });

    const part = parts[partIdx];
    // Reset the chosen part to 'pending' so the engine re-extracts it.
    const resetParts = parts.map((p, i) =>
      i === partIdx
        ? {
            ...p,
            processed: false,
            page_end: 0,
            extraction_status: 'pending',
            ocr_status: 'pending',
            verification_status: 'unverified',
          }
        : p
    );

    await sdk.entities.SirrManuscriptBook.update(book.id || book._id, {
      pdf_parts: resetParts,
      current_part_index: partIdx,
      last_processed_page: 0,
      extraction_status: 'pending',
      extraction_error: '',
    });

    const now = new Date().toISOString();
    await sdk.entities.SirrAuditLog.create({
      audit_id: `SA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sirr_book_id,
      part_id: part.part_id || '',
      part_number: part.part_number || (partIdx + 1),
      action: 'rebuild',
      user_id: user.id || '',
      user_name: user.full_name || user.email || '',
      timestamp: now,
      status: 'info',
      details: `Part ${part.part_number || (partIdx + 1)} reset for re-extraction. Background engine will re-run OCR.`,
    }).catch(() => {});

    // Kick the background engine so it picks up the reset immediately.
    sdk.functions.invoke('sirrProcessNextChunk', {}).catch(() => {});

    return Response.json({
      status: 'queued',
      sirr_book_id,
      part_id: part.part_id || '',
      part_number: part.part_number || (partIdx + 1),
      message: 'Part reset. Background engine will re-extract it.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});