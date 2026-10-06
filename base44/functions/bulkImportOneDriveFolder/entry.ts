import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// ENTERPRISE BULK ONEDRIVE FOLDER IMPORT
// ═══════════════════════════════════════════════════════════════
// Recursively scans a OneDrive folder for ALL PDFs, then imports
// each through the existing importFromOneDrive pipeline.
//
// Features:
//   - Recursive subfolder scanning (all levels)
//   - SHA-256 hash dedup (via importFromOneDrive)
//   - OneDrive file ID dedup (via importFromOneDrive)
//   - ETag change detection (via importFromOneDrive)
//   - Resume support (job_id + current_index)
//   - Batch processing: 1 PDF per call (under 70s Deno timeout)
//   - Never stops on single PDF failure
//   - Live progress tracking via BulkImportJob entity
//   - Final report with complete stats
//
// Flow:
//   1. New job (no job_id): scan folder → create job → return 'job_created'
//   2. Resume (job_id): process 1 PDF → update job → return 'batch_complete'
//   3. When all PDFs processed: return 'completed' with final report
//
// ADMIN ONLY. Uses shared OneDrive connector (Owner's account).
// Never stores the Microsoft password. OAuth access token only.
// ═══════════════════════════════════════════════════════════════

// ── Supported file types for manuscript import ──
const SUPPORTED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

// ── Recursive folder scanner — returns all importable files in folder + subfolders ──
async function scanFolderRecursively(
  accessToken: string,
  folderId: string,
  path: string = ''
): Promise<any[]> {
  const allPdfs: any[] = [];
  let url: string | null = `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children?$top=1000&$select=id,name,size,eTag,lastModifiedDateTime,file,folder,parentReference`;

  while (url) {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Failed to scan folder: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();

    for (const item of (data.value || [])) {
      if (item.folder) {
        // Recurse into subfolder
        const subPdfs = await scanFolderRecursively(
          accessToken,
          item.id,
          `${path}/${item.name}`
        );
        allPdfs.push(...subPdfs);
      } else if (item.file && SUPPORTED_MIME_TYPES.has(item.file.mimeType)) {
        allPdfs.push({
          file_id: item.id,
          file_name: item.name,
          file_path: `${path}/${item.name}`,
          etag: item.eTag || '',
          size: item.size || 0,
          modified_date: item.lastModifiedDateTime || '',
        });
      }
    }

    // Handle pagination
    url = data['@odata.nextLink'] || null;
  }

  return allPdfs;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { folder_id, job_id } = body;

    // ═════════════════════════════════════════════════════════════
    // RESUME: Load existing job and process next PDF
    // ═════════════════════════════════════════════════════════════
    if (job_id) {
      const existing = await base44.asServiceRole.entities.BulkImportJob.filter({ job_id });
      if (!existing || existing.length === 0) {
        return Response.json({ error: 'Job not found: ' + job_id }, { status: 404 });
      }
      const job = existing[0];
      const jobId = job.id;
      const pdfList = job.pdf_list || [];
      const startIndex = job.current_index || 0;

      // Already completed?
      if (job.status === 'completed' || startIndex >= pdfList.length) {
        return Response.json({
          status: 'already_completed',
          job_id: job.job_id,
          total_pdfs: pdfList.length,
          imported: job.imported || 0,
          updated: job.updated || 0,
          skipped: job.skipped || 0,
          failed: job.failed || 0,
          processing_time_ms: job.processing_time_ms || 0,
          results: job.results || [],
        });
      }

      // ── Process 1 PDF (with 60s timeout to prevent gateway kills) ──
      const pdf = pdfList[startIndex];
      const pdfStartTime = Date.now();
      let resultStatus = 'failed';
      let resultBookId = '';
      let resultMessage = '';
      let resultError = '';

      // Timeout wrapper — ensures job advances even for slow/hung PDFs
      const IMPORT_TIMEOUT_MS = 60000;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Import timeout (60s) — PDF skipped to prevent gateway kill')), IMPORT_TIMEOUT_MS)
      );

      try {
        const importPromise = (async () => {
          // Reuse the proven importFromOneDrive logic
          const importRes = await base44.functions.invoke('importFromOneDrive', {
            file_id: pdf.file_id,
            book_title: pdf.file_name.replace(/\.[^/.]+$/, ''),
          });
          const importData = importRes.data || importRes;

          if (importData.status === 'imported') {
            return { status: 'imported', book_id: importData.book_id || '', message: importData.message || 'Imported successfully' };
          } else if (importData.status === 'duplicate') {
            return { status: 'skipped', book_id: importData.book_id || '', message: importData.message || 'Already imported (unchanged)' };
          } else if (importData.status === 'changed') {
            // File changed in OneDrive — re-import as new version
            // Old version is preserved permanently (never overwritten)
            const reimportRes = await base44.functions.invoke('importFromOneDrive', {
              file_id: pdf.file_id,
              book_title: pdf.file_name.replace(/\.[^/.]+$/, ''),
              force_reimport: true,
            });
            const reimportData = reimportRes.data || reimportRes;
            return { status: 'updated', book_id: reimportData.book_id || '', message: 'File changed in OneDrive. New version imported (old version preserved).' };
          } else if (importData.error) {
            throw new Error(importData.error);
          } else {
            throw new Error('Unexpected status: ' + importData.status);
          }
        })();

        const result = await Promise.race([importPromise, timeoutPromise]);
        resultStatus = result.status;
        resultBookId = result.book_id;
        resultMessage = result.message;
      } catch (e: any) {
        // Never stop because one PDF fails — record error and continue
        resultError = e?.response?.data?.error || e?.message || 'Import failed';
      }

      const pdfTime = Date.now() - pdfStartTime;
      const newResult = {
        file_id: pdf.file_id,
        file_name: pdf.file_name,
        status: resultStatus,
        book_id: resultBookId,
        message: resultMessage,
        error: resultError,
        processing_time_ms: pdfTime,
      };

      // Update counts
      const newResults = [...(job.results || []), newResult];
      const newIndex = startIndex + 1;
      const imported = (job.imported || 0) + (resultStatus === 'imported' ? 1 : 0);
      const updated = (job.updated || 0) + (resultStatus === 'updated' ? 1 : 0);
      const skipped = (job.skipped || 0) + (resultStatus === 'skipped' ? 1 : 0);
      const failed = (job.failed || 0) + (resultStatus === 'failed' ? 1 : 0);
      const remaining = pdfList.length - newIndex;
      const totalElapsed = Date.now() - new Date(job.started_at).getTime();

      // Build update object
      const updateData: any = {
        current_index: newIndex,
        imported,
        updated,
        skipped,
        failed,
        results: newResults,
        status: remaining > 0 ? 'processing' : 'completed',
        last_batch_at: new Date().toISOString(),
        processing_time_ms: totalElapsed,
      };
      if (remaining === 0) {
        updateData.completed_at = new Date().toISOString();
      }

      await base44.asServiceRole.entities.BulkImportJob.update(jobId, updateData);

      // Return status
      if (remaining > 0) {
        return Response.json({
          status: 'batch_complete',
          job_id: job.job_id,
          total_pdfs: pdfList.length,
          current_index: newIndex,
          remaining,
          imported,
          updated,
          skipped,
          failed,
          current_pdf: pdfList[newIndex]?.file_name || '',
          last_result: newResult,
          processing_time_ms: totalElapsed,
          next_step: `bulkImportOneDriveFolder({ "job_id": "${job.job_id}" })`,
        });
      } else {
        // All PDFs processed — final report
        return Response.json({
          status: 'completed',
          job_id: job.job_id,
          total_pdfs: pdfList.length,
          imported,
          updated,
          skipped,
          failed,
          processing_time_ms: totalElapsed,
          results: newResults,
          message: `Bulk import complete. ${imported} imported, ${updated} updated, ${skipped} skipped, ${failed} failed.`,
        });
      }
    }

    // ═════════════════════════════════════════════════════════════
    // NEW JOB: Scan folder recursively and create job
    // ═════════════════════════════════════════════════════════════
    if (!folder_id) {
      return Response.json({ error: 'folder_id or job_id is required' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('one_drive');

    // Fetch folder metadata
    const folderMetaUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${folder_id}?$select=id,name,parentReference`;
    const folderMetaRes = await fetch(folderMetaUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    let folderName = 'OneDrive Folder';
    let folderPath = '';
    if (folderMetaRes.ok) {
      const folderMeta = await folderMetaRes.json();
      folderName = folderMeta.name || folderName;
      folderPath = folderMeta.parentReference?.path || '';
    }

    // Scan recursively — finds ALL PDFs in folder + subfolders
    const pdfList = await scanFolderRecursively(accessToken, folder_id, folderPath);

    // Generate job_id
    const timestamp = Date.now();
    const rand = Math.random().toString(36).substring(2, 8);
    const newJobId = `BULK-${timestamp}-${rand}`;

    // Create job
    const created = await base44.asServiceRole.entities.BulkImportJob.create({
      job_id: newJobId,
      folder_id,
      folder_name: folderName,
      folder_path: folderPath,
      total_pdfs: pdfList.length,
      current_index: 0,
      pdf_list: pdfList,
      imported: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      results: [],
      status: 'processing',
      started_at: new Date().toISOString(),
      last_batch_at: new Date().toISOString(),
      processing_time_ms: 0,
      created_by: user.id,
      created_by_email: user.email,
    });

    return Response.json({
      status: 'job_created',
      job_id: newJobId,
      folder_name: folderName,
      total_pdfs: pdfList.length,
      pdf_list: pdfList.map((p: any) => ({ file_name: p.file_name, size: p.size })),
      message: `Found ${pdfList.length} PDF${pdfList.length === 1 ? '' : 's'} in "${folderName}". Call bulkImportOneDriveFolder again with this job_id to start processing.`,
      next_step: `bulkImportOneDriveFolder({ "job_id": "${newJobId}" })`,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'bulk_import_failed' }, { status: 500 });
  }
});