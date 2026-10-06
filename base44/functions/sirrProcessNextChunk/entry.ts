import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// SIRR BACKGROUND PROCESSOR — sirrProcessNextChunk
//
// PERMANENT MULTI-PART ENGINE.
//
// • Reads the book's pdf_parts array from the database — the SOLE
//   source of truth for what to process. Never depends on chat
//   history or conversation state.
// • Processes parts SEQUENTIALLY in order (Part 1 → Part 2 → ... → Part N),
//   advancing current_part_index as each part completes.
// • Within each part, processes CHUNK_SIZE pages at a time, advancing
//   last_processed_page (within the current part).
// • order_offset = cumulative page count of all previous parts, so
//   entry_order stays globally monotonic across the whole book.
// • combined_total_pages = sum of every part's page_count (the true total).
// • When current_part_index >= pdf_parts.length, extraction_status
//   becomes 'completed'.
// • Auto-resumes via scheduled automation. Never requires manual restart.
// • Legacy fallback: books with no pdf_parts (old single-PDF books) use
//   original_file_url with the original logic.
// ═══════════════════════════════════════════════════════════════

const CHUNK_SIZE = 5;
const TIME_BUDGET_MS = 85000;
const RETRY_DELAY_MS = 6000;
const MAX_ATTEMPTS = 2;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow admin-triggered calls AND internal/scheduled calls (no user).
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const sdk = base44.asServiceRole;
    const started = Date.now();
    let chunksProcessed = 0;
    let lastBookId = '';

    let lockedBookId = '';

    // ── ANTI-RACE MERGE HELPER ──────────────────────────────────────
    // Reloads the LATEST pdf_parts from the database, then applies a
    // per-part patch to the part identified by targetPartId (falling
    // back to partIdx). Every part in the fresh array — including parts
    // appended DURING this chunk's LLM call — is preserved. This is the
    // permanent fix for the race where a stale snapshot overwrote newer
    // appended PDF parts. Returns the merged pdf_parts array, or null
    // when the fresh state could not be loaded (caller falls back).
    async function reloadAndMergeParts(bookRecordId, targetPartId, partIdx, partPatch) {
      try {
        const fresh = await sdk.entities.SirrManuscriptBook.get(bookRecordId);
        const freshParts = Array.isArray(fresh?.pdf_parts) ? fresh.pdf_parts : null;
        if (!freshParts) return null;
        let matchIdx = -1;
        if (targetPartId) matchIdx = freshParts.findIndex((p) => (p.part_id || '') === targetPartId);
        if (matchIdx === -1 && partIdx >= 0 && partIdx < freshParts.length) matchIdx = partIdx;
        if (matchIdx === -1) return freshParts; // part gone from fresh state — preserve everything
        return freshParts.map((p, i) => (i === matchIdx ? { ...p, ...partPatch } : p));
      } catch (_) {
        return null;
      }
    }

    while (Date.now() - started < TIME_BUDGET_MS) {
      // Find the oldest book with work remaining.
      const books = await sdk.entities.SirrManuscriptBook.filter(
        { extraction_status: { $in: ['pending', 'processing', 'partial'] } },
        'upload_date',
        50
      ).catch(() => []);

      const nowMs = Date.now();
      let target = null;
      for (const book of books) {
        // Concurrency lock (RULE 6, 8): skip books locked by another active run.
        // The book this run already holds (lockedBookId) is allowed to continue.
        if (book.sirr_book_id !== lockedBookId) {
          const lockUntil = book.processing_lock_until ? Date.parse(book.processing_lock_until) : 0;
          if (lockUntil && lockUntil > nowMs) continue;
        }
        const parts = Array.isArray(book.pdf_parts) ? book.pdf_parts : [];
        if (parts.length > 0) {
          // Multi-part book: work remains if current_part_index < parts.length
          const idx = book.current_part_index || 0;
          if (idx < parts.length) {
            target = book;
            break;
          }
          // All parts done → await verification (RULE 15: never 'completed' until verified)
          await sdk.entities.SirrManuscriptBook.update(book.id || book._id, {
            extraction_status: 'pending_verification',
            combined_total_pages: parts.reduce((s, p) => s + (p.page_count || 0), 0),
          }).catch(() => {});
          continue;
        }
        // Legacy single-PDF book
        const tp = book.total_pages || 0;
        const lp = book.last_processed_page || 0;
        if (tp === 0 || lp < tp) {
          target = book;
          break;
        }
      }

      if (!target) break; // no pending work

      const bookRecordId = target.id || target._id;
      // Claim/refresh a time-limited lock so no other run processes this book
      // concurrently (RULE 6, 8). Auto-expires on crash so the book never gets stuck.
      const LOCK_MS = 120000;
      await sdk.entities.SirrManuscriptBook.update(bookRecordId, {
        processing_lock_until: new Date(Date.now() + LOCK_MS).toISOString(),
      }).catch(() => {});
      lockedBookId = target.sirr_book_id;
      lastBookId = target.sirr_book_id;
      const parts = Array.isArray(target.pdf_parts) ? target.pdf_parts : [];

      if (parts.length > 0) {
        // ── MULTI-PART PATH ──
        let partIdx = target.current_part_index || 0;

        // Safety: if partIdx is out of range, await verification (RULE 15).
        if (partIdx >= parts.length) {
          await sdk.entities.SirrManuscriptBook.update(bookRecordId, {
            extraction_status: 'pending_verification',
            combined_total_pages: parts.reduce((s, p) => s + (p.page_count || 0), 0),
          }).catch(() => {});
          continue;
        }

        const part = parts[partIdx];
        const partPageCount = part.page_count || 0;
        const lp = target.last_processed_page || 0;

        // If the current part is fully processed, advance to the next part.
        if (partPageCount > 0 && lp >= partPageCount) {
          // ANTI-RACE: reload latest pdf_parts and patch the completed part
          // into the FRESH array, so any part appended during the previous
          // chunk's LLM call is preserved (never overwritten by this stale
          // snapshot).
          const partIdA = part.part_id || `SIRRP-${target.sirr_book_id}-${partIdx + 1}`;
          const mergedA = await reloadAndMergeParts(bookRecordId, partIdA, partIdx, {
            processed: true, page_end: part.page_count, extraction_status: 'completed', ocr_status: 'completed',
          });
          const updateA = {
            current_part_index: partIdx + 1,
            last_processed_page: 0,
            extraction_status: 'processing',
          };
          if (mergedA) updateA.pdf_parts = mergedA;
          await sdk.entities.SirrManuscriptBook.update(bookRecordId, updateA).catch(() => {});
          continue; // loop again to pick the next part
        }

        // Compute order_offset = cumulative page count of all previous parts
        // (keeps entry_order globally monotonic across the whole book).
        const orderOffset = parts.slice(0, partIdx).reduce((s, p) => s + (p.page_count || 0), 0);

        let page_start = lp + 1;
        let page_end = page_start + CHUNK_SIZE - 1;
        if (partPageCount > 0 && page_end > partPageCount) {
          page_end = partPageCount;
        }

        const partIdB = part.part_id || `SIRRP-${target.sirr_book_id}-${partIdx + 1}`;
        const mergedB = await reloadAndMergeParts(bookRecordId, partIdB, partIdx, { extraction_status: 'processing' });
        const updateB = { extraction_status: 'processing' };
        if (mergedB) updateB.pdf_parts = mergedB;
        await sdk.entities.SirrManuscriptBook.update(bookRecordId, updateB).catch(() => {});

        // Process the chunk with retry on transient errors.
        let result = null;
        let success = false;
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
          try {
            const res = await sdk.functions.invoke('ingestSirrManuscript', {
              existing_book_id: target.sirr_book_id,
              pdf_file_url: part.file_url,
              original_file_name: part.file_name,
              page_start,
              page_end,
              order_offset: orderOffset,
              source_part_id: part.part_id || `SIRRP-${target.sirr_book_id}-${partIdx + 1}`,
              source_part_number: part.part_number || (partIdx + 1),
            });
            result = res?.data || res;
            if (result?.error) throw new Error(result.error);
            success = true;
            break;
          } catch (e) {
            if (attempt >= MAX_ATTEMPTS - 1) {
              const failPartId = part.part_id || `SIRRP-${target.sirr_book_id}-${partIdx + 1}`;
              const failPartNum = part.part_number || (partIdx + 1);
              const mergedD = await reloadAndMergeParts(bookRecordId, failPartId, partIdx, { extraction_status: 'failed', ocr_status: 'failed' });
              const updateD = {
                extraction_status: 'partial',
                extraction_error: `Book ${target.sirr_book_id}, Part ${failPartId} (Part ${failPartNum}): ${String(e?.message || e).slice(0, 400)}`,
              };
              if (mergedD) updateD.pdf_parts = mergedD;
              await sdk.entities.SirrManuscriptBook.update(bookRecordId, updateD).catch(() => {});
              return Response.json({
                status: 'error',
                book_id: target.sirr_book_id,
                part_id: failPartId,
                part_number: failPartNum,
                part_index: partIdx,
                error: String(e?.message || e),
                chunks_processed: chunksProcessed,
              });
            }
            await sdk.entities.SirrAuditLog.create({
              audit_id: `SA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              sirr_book_id: target.sirr_book_id,
              part_id: part.part_id || `SIRRP-${target.sirr_book_id}-${partIdx + 1}`,
              part_number: part.part_number || (partIdx + 1),
              action: 'retry',
              user_id: 'system',
              user_name: 'system',
              timestamp: new Date().toISOString(),
              page_range: `${page_start}-${page_end}`,
              status: 'info',
              details: `Retry attempt ${attempt + 1}/${MAX_ATTEMPTS} for chunk ${page_start}-${page_end}: ${String(e?.message || e).slice(0, 200)}`,
            }).catch(() => {});
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          }
        }

        if (success) {
          const newEntries = Number(result?.total_entries) || 0;
          if (newEntries === 0) {
            const failedPartId = part.part_id || `SIRRP-${target.sirr_book_id}-${partIdx + 1}`;
            const failedPartNum = part.part_number || (partIdx + 1);
            const mergedE = await reloadAndMergeParts(bookRecordId, failedPartId, partIdx, { extraction_status: 'failed', ocr_status: 'failed' });
            const updateE = {
              extraction_status: 'failed',
              extraction_error: `Zero content extracted. Book ${target.sirr_book_id}, Part ${failedPartId} (Part ${failedPartNum}), pages ${page_start}-${page_end}. Processing stopped — manual review required.`,
            };
            if (mergedE) updateE.pdf_parts = mergedE;
            await sdk.entities.SirrManuscriptBook.update(bookRecordId, updateE).catch(() => {});
            return Response.json({
              status: 'error',
              book_id: target.sirr_book_id,
              part_id: failedPartId,
              part_number: failedPartNum,
              part_index: partIdx,
              page_range: `${page_start}-${page_end}`,
              error: 'Zero content extracted — possible OCR or PDF failure',
              chunks_processed: chunksProcessed,
            });
          }
          chunksProcessed++;
          const returnedTotalPages = Number(result?.total_pages) || 0;
          const allEntriesCount = Number(result?.total_entries_all) ?? (target.total_entries || 0);

          // Update the current part's metadata.
          const partDone = returnedTotalPages > 0 && page_end >= returnedTotalPages;
          const partIdC = part.part_id || `SIRRP-${target.sirr_book_id}-${partIdx + 1}`;
          const partPatchC = {
            page_count: returnedTotalPages || part.page_count,
            page_end: page_end,
            processed: partDone,
            extraction_status: partDone ? 'completed' : 'processing',
            ocr_status: 'completed',
          };

          // ANTI-RACE: reload the LATEST pdf_parts and patch the processed
          // part into the FRESH array. This preserves any part appended
          // during the LLM call and recomputes book completion from the
          // fresh state — so appended parts are never skipped and the book
          // is only 'pending_verification' when EVERY part is fully done.
          const mergedC = await reloadAndMergeParts(bookRecordId, partIdC, partIdx, partPatchC);
          let finalParts;
          let combined;
          let bookComplete;
          if (mergedC) {
            finalParts = mergedC;
            combined = mergedC.reduce((s, p) => s + (p.page_count || 0), 0);
            const freshPartIdx = mergedC.findIndex((p) => (p.part_id || '') === partIdC);
            const freshCurrentIdx = freshPartIdx >= 0 ? freshPartIdx : partIdx;
            const isLastPartFresh = freshCurrentIdx === mergedC.length - 1;
            bookComplete = isLastPartFresh && partDone && mergedC.every((p) => p.processed && (p.page_count || 0) > 0 && (p.page_end || 0) >= (p.page_count || 0));
          } else {
            // Fresh state unavailable — fall back to the stale snapshot patch.
            finalParts = parts.map((p, i) => (i === partIdx ? { ...p, ...partPatchC } : p));
            combined = finalParts.reduce((s, p) => s + (p.page_count || 0), 0);
            const isLastPart = partIdx === parts.length - 1;
            bookComplete = isLastPart && partDone;
          }

          const bookUpdate = {
            pdf_parts: finalParts,
            last_processed_page: page_end,
            total_pages: returnedTotalPages || (target.total_pages || 0),
            total_entries: allEntriesCount,
            combined_total_pages: combined,
            extraction_status: bookComplete ? 'pending_verification' : 'processing',
          };
          await sdk.entities.SirrManuscriptBook.update(bookRecordId, bookUpdate).catch(() => {});
        }

        if (Date.now() - started > TIME_BUDGET_MS - 20000) break;
      } else {
        // ── LEGACY SINGLE-PDF PATH (unchanged) ──
        const page_start = (target.last_processed_page || 0) + 1;
        let page_end = page_start + CHUNK_SIZE - 1;
        if (target.total_pages > 0 && page_end > target.total_pages) {
          page_end = target.total_pages;
        }

        await sdk.entities.SirrManuscriptBook.update(bookRecordId, {
          extraction_status: 'processing',
        }).catch(() => {});

        let result = null;
        let success = false;
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
          try {
            const res = await sdk.functions.invoke('ingestSirrManuscript', {
              existing_book_id: target.sirr_book_id,
              pdf_file_url: target.original_file_url,
              original_file_name: target.original_file_name,
              page_start,
              page_end,
            });
            result = res?.data || res;
            if (result?.error) throw new Error(result.error);
            success = true;
            break;
          } catch (e) {
            if (attempt >= MAX_ATTEMPTS - 1) {
              await sdk.entities.SirrManuscriptBook.update(bookRecordId, {
                extraction_status: 'partial',
                extraction_error: String(e?.message || e).slice(0, 500),
              }).catch(() => {});
              return Response.json({
                status: 'error',
                book_id: target.sirr_book_id,
                error: String(e?.message || e),
                chunks_processed: chunksProcessed,
              });
            }
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          }
        }

        if (success) {
          const newEntries = Number(result?.total_entries) || 0;
          if (newEntries === 0) {
            await sdk.entities.SirrManuscriptBook.update(bookRecordId, {
              extraction_status: 'failed',
              extraction_error: `Zero content extracted from Book ${target.sirr_book_id}, pages ${page_start}-${page_end}. Processing stopped — manual review required.`,
            }).catch(() => {});
            return Response.json({
              status: 'error',
              book_id: target.sirr_book_id,
              page_range: `${page_start}-${page_end}`,
              error: 'Zero content extracted — possible OCR or PDF failure',
              chunks_processed: chunksProcessed,
            });
          }
          chunksProcessed++;
        }
        if (Date.now() - started > TIME_BUDGET_MS - 20000) break;
      }
    }

    // Release the lock on exit so the next run can pick the book up immediately (RULE 6).
    if (lockedBookId) {
      const lb = await sdk.entities.SirrManuscriptBook.filter({ sirr_book_id: lockedBookId }, undefined, 1).catch(() => []);
      if (lb[0]) await sdk.entities.SirrManuscriptBook.update(lb[0].id || lb[0]._id, { processing_lock_until: '' }).catch(() => {});
    }
    return Response.json({
      status: chunksProcessed > 0 ? 'processed' : 'idle',
      chunks_processed: chunksProcessed,
      last_book_id: lastBookId,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});