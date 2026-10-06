import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// PROCESS IMPORT CHUNK — Process ONE chunk with retry + stage timing
// ═══════════════════════════════════════════════════════════════
// Called by the UI for each chunk, one at a time.
//
// Features:
//   - Resumable: If chunk already completed, returns immediately.
//   - Retry: Failed chunks retry with exponential backoff (max 3).
//   - Stage timing: Records execution time for every stage.
//   - Failed stage detection: Identifies which stage failed.
//   - Progress saved: ManuscriptImportJob updated after every chunk.
//   - Never restarts entire import: Only the failed chunk is retried.
//
// ADMIN ONLY.
// ═══════════════════════════════════════════════════════════════

function detectFailedStage(errorMsg: string): string {
  const e = (errorMsg || '').toLowerCase();
  if (e.includes('quality') || e.includes('confidence')) return 'quality_gate';
  if (e.includes('pdf-lib') || e.includes('pdf load') || e.includes('chunk') || e.includes('split')) return 'chunk_creation';
  if (e.includes('upload')) return 'chunk_upload';
  if (e.includes('extract') || e.includes('invokellm') || e.includes('llm') || e.includes('gemini')) return 'extraction';
  if (e.includes('image') || e.includes('png') || e.includes('jpeg')) return 'image_extraction';
  if (e.includes('heading') || e.includes('manuscriptheading')) return 'heading_creation';
  if (e.includes('entry') || e.includes('manuscriptentry') || e.includes('bulkcreate')) return 'entry_creation';
  if (e.includes('book') || e.includes('manuscriptbook') || e.includes('update')) return 'book_update';
  return 'unknown';
}

Deno.serve(async (req) => {
  const chunkStartTime = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { job_id, chunk_number, retry_attempt } = body;
    if (!job_id || !chunk_number) {
      return Response.json({ error: 'job_id and chunk_number are required' }, { status: 400 });
    }

    // ══ 1. Get ManuscriptImportJob ══
    const jobs = await base44.asServiceRole.entities.ManuscriptImportJob.filter({ job_id });
    if (!jobs?.length) {
      return Response.json({ error: 'Import job not found', job_id }, { status: 404 });
    }
    const job = jobs[0];
    const chunkIdx = job.chunks.findIndex((c: any) => c.chunk_number === chunk_number);
    if (chunkIdx === -1) {
      return Response.json({ error: `Chunk ${chunk_number} not found in job`, job_id }, { status: 404 });
    }

    const chunk = job.chunks[chunkIdx];

    // ══ 2. Resumability — skip already completed chunks ══
    if (chunk.status === 'completed') {
      return Response.json({
        status: 'already_completed',
        job_id,
        book_id: job.book_id,
        chunk_number,
        entries_extracted: chunk.entries_extracted,
        images_extracted: chunk.images_extracted,
        processing_time_ms: chunk.processing_time_ms,
        stage_timings: chunk.stage_timings,
        message: `Chunk ${chunk_number} was already completed. Skipping (resumable).`,
      });
    }

    // ══ 2b. Recovery — check if entries already exist for this chunk ══
    // Handles the timeout case: validateManuscriptImport completed and created entries,
    // but processImportChunk timed out before updating the job. On retry, we detect the
    // existing entries and mark the chunk as completed WITHOUT reprocessing.
    // This prevents: (a) duplicate entries, (b) stuck "processing" status, (c) infinite retry loops.
    {
      const chunkPrefix = `ME-${job.book_id}-C${chunk_number}_`;
      const allBookEntries = await base44.asServiceRole.entities.ManuscriptEntry.filter({ book_id: job.book_id });
      const chunkEntryCount = allBookEntries.filter((e: any) =>
        e.entry_id && String(e.entry_id).startsWith(chunkPrefix)
      ).length;

      if (chunkEntryCount > 0) {
        const recoveredChunks = [...job.chunks];
        recoveredChunks[chunkIdx] = {
          ...recoveredChunks[chunkIdx],
          status: 'completed',
          entries_extracted: chunkEntryCount,
          processing_time_ms: 0,
          completed_at: new Date().toISOString(),
          error: '',
          failed_stage: '',
          retry_count: chunk.retry_count,
        };

        const completedCount = recoveredChunks.filter((c: any) => c.status === 'completed').length;
        const overallProgress = Math.round((completedCount / job.total_chunks) * 100);
        const allComplete = completedCount === job.total_chunks;

        await base44.asServiceRole.entities.ManuscriptImportJob.update(job.id, {
          chunks: recoveredChunks,
          overall_progress: overallProgress,
          current_stage: allComplete ? 'extraction_complete' : `chunk_${chunk_number}_recovered`,
          status: allComplete ? 'completed' : 'extracting',
          completed_at: allComplete ? new Date().toISOString() : '',
        });

        return Response.json({
          status: 'already_completed',
          job_id,
          book_id: job.book_id,
          chunk_number,
          entries_extracted: chunkEntryCount,
          overall_progress: overallProgress,
          chunks_completed: completedCount,
          chunks_remaining: job.total_chunks - completedCount,
          all_chunks_complete: allComplete,
          recovered: true,
          message: `Chunk ${chunk_number} was already processed (${chunkEntryCount} entries found in database). Marked as completed — no reprocessing needed.`,
          next_step: allComplete
            ? `verifyBookEntries({ "book_id": "${job.book_id}" })`
            : `processImportChunk({ "job_id": "${job_id}", "chunk_number": ${chunk_number + 1} })`,
        });
      }
    }

    // ══ 3. Check max retries ══
    const MAX_RETRIES = chunk.max_retries || 3;
    if (chunk.retry_count >= MAX_RETRIES) {
      return Response.json({
        status: 'max_retries_exceeded',
        job_id,
        book_id: job.book_id,
        chunk_number,
        retry_count: chunk.retry_count,
        error: chunk.error,
        failed_stage: chunk.failed_stage,
        message: `Chunk ${chunk_number} exceeded max retries (${MAX_RETRIES}). Last error: ${chunk.error}`,
      });
    }

    // ══ 4. Update chunk status to "processing" ══
    const now = new Date().toISOString();
    const updatedChunks = [...job.chunks];
    updatedChunks[chunkIdx] = {
      ...chunk,
      status: 'processing',
      started_at: chunk.started_at || now,
      error: '',
      failed_stage: '',
    };
    await base44.asServiceRole.entities.ManuscriptImportJob.update(job.id, {
      chunks: updatedChunks,
      current_stage: `extracting_chunk_${chunk_number}`,
      status: 'extracting',
    });

    // ══ 5. Call validateManuscriptImport for this chunk ══
    const isChunk1 = chunk_number === 1;
    const isFinalChunk = chunk_number === job.total_chunks;

    let stageTimings: Record<string, number> = {};
    let failedStage = '';
    let chunkError = '';

    try {
      const invokeStartTime = Date.now();
      const chunkResult: any = await base44.functions.invoke('validateManuscriptImport', {
        pdf_url: chunk.chunk_url,
        book_title: job.book_title,
        existing_book_id: job.book_id,
        page_offset: chunk.page_offset,
        chunk_number,
        total_chunks: job.total_chunks,
        do_quality_gate: isChunk1, // Quality gate only on chunk 1
        is_final_chunk: isFinalChunk,
        original_file_name: `chunk_${chunk_number}.pdf`,
      });
      const invokeEndTime = Date.now();
      stageTimings.total_ms = invokeEndTime - invokeStartTime;

      const chunkData = chunkResult.data || chunkResult;

      // ══ 6. Handle quality rejection ══
      if (chunkData.status === 'import_rejected') {
        updatedChunks[chunkIdx] = {
          ...updatedChunks[chunkIdx],
          status: 'failed',
          error: `Quality rejected: ${chunkData.reason || 'below threshold'}`,
          failed_stage: 'quality_gate',
          retry_count: chunk.retry_count + 1,
          completed_at: new Date().toISOString(),
          processing_time_ms: Date.now() - chunkStartTime,
        };
        await base44.asServiceRole.entities.ManuscriptImportJob.update(job.id, {
          chunks: updatedChunks,
          status: 'failed',
          current_stage: 'quality_rejected',
        });
        return Response.json({
          status: 'import_rejected',
          job_id,
          book_id: job.book_id,
          chunk_number,
          overall_confidence: chunkData.overall_confidence,
          reason: chunkData.reason,
          problem_pages: chunkData.problem_pages,
          quality_details: chunkData.quality_details,
          failed_stage: 'quality_gate',
          message: chunkData.message,
        });
      }

      // ══ 7. Handle chunk processing errors ══
      if (chunkData.status === 'validation_failed' || chunkData.error) {
        chunkError = chunkData.error || 'Validation failed';
        failedStage = detectFailedStage(chunkError);
        throw new Error(chunkError);
      }

      // ══ 8. Success — update chunk status ══
      const entriesExtracted = chunkData.entries_created || chunkData.entries_in_chunk || 0;
      const imagesExtracted = chunkData.validation_report?.summary?.total_images_extracted || 0;

      // Extract stage timings from validation report if available
      if (chunkData.validation_report?.stage_details) {
        const sd = chunkData.validation_report.stage_details;
        if (sd.stage_1_extraction) stageTimings.extraction_ms = sd.stage_1_extraction.duration_ms || 0;
        if (sd.stage_4_images) stageTimings.image_extraction_ms = sd.stage_4_images.duration_ms || 0;
      }

      updatedChunks[chunkIdx] = {
        ...updatedChunks[chunkIdx],
        status: 'completed',
        entries_extracted: entriesExtracted,
        images_extracted: imagesExtracted,
        stage_timings: stageTimings,
        processing_time_ms: Date.now() - chunkStartTime,
        completed_at: new Date().toISOString(),
        retry_count: chunk.retry_count,
      };

      // Calculate overall progress
      const completedCount = updatedChunks.filter((c: any) => c.status === 'completed').length;
      const overallProgress = Math.round((completedCount / job.total_chunks) * 100);
      const allComplete = completedCount === job.total_chunks;

      await base44.asServiceRole.entities.ManuscriptImportJob.update(job.id, {
        chunks: updatedChunks,
        overall_progress: overallProgress,
        current_stage: allComplete ? 'extraction_complete' : `chunk_${chunk_number}_done`,
        status: allComplete ? 'completed' : 'extracting',
        completed_at: allComplete ? new Date().toISOString() : '',
      });

      return Response.json({
        status: chunkData.status, // 'chunk_processed' or 'chunk_merge_complete'
        job_id,
        book_id: job.book_id,
        chunk_number,
        total_chunks: job.total_chunks,
        entries_extracted: entriesExtracted,
        images_extracted: imagesExtracted,
        processing_time_ms: Date.now() - chunkStartTime,
        stage_timings: stageTimings,
        overall_progress: overallProgress,
        chunks_completed: completedCount,
        chunks_remaining: job.total_chunks - completedCount,
        all_chunks_complete: allComplete,
        next_step: allComplete
          ? `verifyBookEntries({ "book_id": "${job.book_id}" })`
          : `processImportChunk({ "job_id": "${job_id}", "chunk_number": ${chunk_number + 1} })`,
        message: allComplete
          ? `All ${job.total_chunks} chunks processed. Phase 1 complete. Ready for verification.`
          : `Chunk ${chunk_number}/${job.total_chunks} completed in ${Date.now() - chunkStartTime}ms. ${job.total_chunks - completedCount} remaining.`,
      });

    } catch (invokeError) {
      // ══ 9. Handle failure — record error, increment retry count ══
      chunkError = invokeError.message || String(invokeError);
      failedStage = detectFailedStage(chunkError);

      const newRetryCount = chunk.retry_count + 1;
      updatedChunks[chunkIdx] = {
        ...updatedChunks[chunkIdx],
        status: 'failed',
        error: chunkError,
        failed_stage: failedStage,
        retry_count: newRetryCount,
        processing_time_ms: Date.now() - chunkStartTime,
        completed_at: new Date().toISOString(),
      };

      // Check if ALL chunks have failed or max retries exceeded
      const allFailed = updatedChunks.every((c: any) => c.status === 'failed');
      const hasRemainingRetries = newRetryCount < MAX_RETRIES;

      await base44.asServiceRole.entities.ManuscriptImportJob.update(job.id, {
        chunks: updatedChunks,
        current_stage: `chunk_${chunk_number}_failed`,
        status: allFailed ? 'failed' : 'extracting',
      });

      // Exponential backoff: 2^retry_attempt seconds (2s, 4s, 8s)
      const backoffSeconds = Math.pow(2, newRetryCount);
      const canRetry = hasRemainingRetries;

      return Response.json({
        status: 'chunk_failed',
        job_id,
        book_id: job.book_id,
        chunk_number,
        error: chunkError,
        failed_stage: failedStage,
        retry_count: newRetryCount,
        max_retries: MAX_RETRIES,
        can_retry: canRetry,
        retry_after_seconds: canRetry ? backoffSeconds : 0,
        stage_timings: stageTimings,
        processing_time_ms: Date.now() - chunkStartTime,
        chunks_completed: updatedChunks.filter((c: any) => c.status === 'completed').length,
        chunks_remaining: job.total_chunks - updatedChunks.filter((c: any) => c.status === 'completed').length,
        message: canRetry
          ? `Chunk ${chunk_number} failed at stage "${failedStage}" (retry ${newRetryCount}/${MAX_RETRIES}). Retry in ${backoffSeconds}s. Error: ${chunkError}`
          : `Chunk ${chunk_number} failed at stage "${failedStage}" after ${MAX_RETRIES} retries. Error: ${chunkError}`,
        next_step: canRetry
          ? `Retry: processImportChunk({ "job_id": "${job_id}", "chunk_number": ${chunk_number}, "retry_attempt": ${newRetryCount} })`
          : `Chunk exhausted retries. Other chunks can still be processed.`,
      });
    }
  } catch (error) {
    return Response.json({
      error: error.message,
      status: 'process_chunk_failed',
      processing_time_ms: Date.now() - chunkStartTime,
    }, { status: 500 });
  }
});