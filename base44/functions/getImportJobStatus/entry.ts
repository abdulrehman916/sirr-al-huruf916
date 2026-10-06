import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// GET IMPORT JOB STATUS — Poll import progress for UI
// ═══════════════════════════════════════════════════════════════
// Called by the UI to poll import progress instead of keeping
// one long HTTP request open. Returns per-chunk status, timings,
// errors, and overall progress.
//
// ADMIN ONLY.
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const url = new URL(req.url);
    const jobId = url.searchParams.get('job_id');

    if (!jobId) {
      return Response.json({ error: 'job_id query parameter is required' }, { status: 400 });
    }

    const jobs = await base44.asServiceRole.entities.ManuscriptImportJob.filter({ job_id: jobId });
    if (!jobs?.length) {
      return Response.json({ error: 'Import job not found', job_id: jobId }, { status: 404 });
    }

    const job = jobs[0];

    // Compute summary
    const chunks = job.chunks || [];
    const completed = chunks.filter((c: any) => c.status === 'completed');
    const failed = chunks.filter((c: any) => c.status === 'failed');
    const pending = chunks.filter((c: any) => c.status === 'pending');
    const processing = chunks.filter((c: any) => c.status === 'processing');

    const totalEntries = completed.reduce((sum: number, c: any) => sum + (c.entries_extracted || 0), 0);
    const totalImages = completed.reduce((sum: number, c: any) => sum + (c.images_extracted || 0), 0);
    const totalTime = completed.reduce((sum: number, c: any) => sum + (c.processing_time_ms || 0), 0);

    // Find the currently processing chunk (if any)
    const currentChunk = processing[0] || null;

    // Find the next pending chunk
    const nextPendingChunk = pending.length > 0
      ? pending.sort((a: any, b: any) => a.chunk_number - b.chunk_number)[0]
      : null;

    // Find failed chunks that can be retried
    const retryable = failed.filter((c: any) => c.retry_count < (c.max_retries || 3));

    // All stage timings aggregated
    const allStageTimings: Record<string, number[]> = {};
    for (const c of completed) {
      const st = c.stage_timings || {};
      for (const [stage, ms] of Object.entries(st)) {
        if (!allStageTimings[stage]) allStageTimings[stage] = [];
        allStageTimings[stage].push(ms as number);
      }
    }

    const avgStageTimings: Record<string, number> = {};
    for (const [stage, times] of Object.entries(allStageTimings)) {
      avgStageTimings[stage] = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    }

    return Response.json({
      job_id: job.job_id,
      book_id: job.book_id,
      book_title: job.book_title,
      status: job.status,
      current_stage: job.current_stage,
      overall_progress: job.overall_progress,
      started_at: job.started_at,
      completed_at: job.completed_at,

      total_chunks: job.total_chunks,
      chunks_completed: completed.length,
      chunks_failed: failed.length,
      chunks_pending: pending.length,
      chunks_processing: processing.length,

      current_chunk: currentChunk
        ? {
            chunk_number: currentChunk.chunk_number,
            page_range: currentChunk.page_range,
            started_at: currentChunk.started_at,
          }
        : null,

      next_pending_chunk: nextPendingChunk?.chunk_number || null,
      retryable_chunks: retryable.map((c: any) => ({
        chunk_number: c.chunk_number,
        retry_count: c.retry_count,
        max_retries: c.max_retries || 3,
        error: c.error,
        failed_stage: c.failed_stage,
      })),

      // Detailed per-chunk status
      chunk_details: chunks.map((c: any) => ({
        chunk_number: c.chunk_number,
        page_range: c.page_range,
        status: c.status,
        retry_count: c.retry_count,
        error: c.error || '',
        failed_stage: c.failed_stage || '',
        entries_extracted: c.entries_extracted || 0,
        images_extracted: c.images_extracted || 0,
        processing_time_ms: c.processing_time_ms || 0,
        stage_timings: c.stage_timings || {},
        started_at: c.started_at || '',
        completed_at: c.completed_at || '',
      })),

      // Aggregated stats
      stats: {
        total_entries_extracted: totalEntries,
        total_images_extracted: totalImages,
        total_processing_time_ms: totalTime,
        avg_chunk_time_ms: completed.length > 0 ? Math.round(totalTime / completed.length) : 0,
        avg_stage_timings: avgStageTimings,
      },

      // Overall error (if job failed)
      job_error: job.status === 'failed'
        ? `${failed.length} chunk(s) failed: ${failed.map((c: any) => `Chunk ${c.chunk_number} (${c.failed_stage})`).join(', ')}`
        : '',

      next_step: completed.length === job.total_chunks
        ? `verifyBookEntries({ "book_id": "${job.book_id}" })`
        : nextPendingChunk
          ? `processImportChunk({ "job_id": "${job.job_id}", "chunk_number": ${nextPendingChunk.chunk_number} })`
          : retryable.length > 0
            ? `Retry: processImportChunk({ "job_id": "${job.job_id}", "chunk_number": ${retryable[0].chunk_number} })`
            : 'All chunks processed or exhausted retries.',
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'status_check_failed' }, { status: 500 });
  }
});