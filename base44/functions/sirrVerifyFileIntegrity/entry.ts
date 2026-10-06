import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// SIRR VERIFY FILE INTEGRITY — sirrVerifyFileIntegrity
//
// On-demand checksum verification (RULE 10). For each PDF part of a
// book, re-fetches the permanently-stored file_url, recomputes the
// SHA-256 hash, and compares it to the file_hash recorded at upload
// time. Any mismatch = corruption detected immediately.
//
// Per-part results are returned AND recorded permanently in
// SirrAuditLog (action='integrity_check'). For very large PDFs the
// fetch+hash must fit within the time budget; pass part_id to check
// one part at a time.
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
    const onlyPartId = body.part_id || '';
    const started = Date.now();
    const results = [];
    let all_match = true;

    for (const part of parts) {
      if (Date.now() - started > 70000) { results.push({ part_id: part.part_id, status: 'skipped_time_budget' }); break; }
      if (onlyPartId && part.part_id !== onlyPartId) continue;
      const expected = part.file_hash || '';
      try {
        const res = await fetch(part.file_url);
        if (!res.ok) {
          results.push({ part_id: part.part_id, part_number: part.part_number, file_name: part.file_name, status: 'fetch_failed', http_status: res.status });
          all_match = false;
          continue;
        }
        const buf = new Uint8Array(await res.arrayBuffer());
        const hashBuf = await crypto.subtle.digest('SHA-256', buf);
        const actual = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');
        const match = expected === actual;
        if (!match) all_match = false;
        results.push({
          part_id: part.part_id,
          part_number: part.part_number,
          file_name: part.file_name,
          file_size: buf.length,
          expected_hash: expected,
          actual_hash: actual,
          match,
          status: match ? 'verified' : 'corrupted',
        });
      } catch (e) {
        results.push({ part_id: part.part_id, part_number: part.part_number, file_name: part.file_name, status: 'error', error: String(e?.message || e) });
        all_match = false;
      }
    }

    const now = new Date().toISOString();
    await sdk.entities.SirrAuditLog.create({
      audit_id: `SA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sirr_book_id,
      action: 'integrity_check',
      user_id: user.id || '',
      user_name: user.full_name || user.email || '',
      timestamp: now,
      status: all_match ? 'success' : 'failed',
      details: `Integrity check ${all_match ? 'passed' : 'failed'} for ${results.length} part(s). ${results.filter((r) => r.status === 'corrupted').length} corrupted.`,
    }).catch(() => {});

    return Response.json({ sirr_book_id, all_match, parts_checked: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});