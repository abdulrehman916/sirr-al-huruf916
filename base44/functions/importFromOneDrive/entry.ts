import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// ONEDRIVE IMPORT — DOWNLOAD PDF AND RUN VALIDATION PIPELINE
// ═══════════════════════════════════════════════════════════════
// Uses the SHARED OneDrive connector (Owner's account).
// Admin only.
//
// Workflow:
//   1. Fetch file metadata from OneDrive (name, etag, modified date, path)
//   2. Check for duplicate by onedrive_file_id
//      - If found AND etag unchanged → return "duplicate" (skip)
//      - If found AND etag changed → return "changed" (await confirmation)
//      - If not found OR force_reimport=true → proceed
//   3. Download PDF content from OneDrive
//   4. Compute SHA-256 hash for content-level dedup
//   5. Upload PDF to Base44 storage
//   6. Invoke validateManuscriptImport (Phase 1: extraction + images)
//   7. Update ManuscriptBook with OneDrive metadata + source='onedrive'
//
// Never stores the Microsoft password. Uses OAuth access token only.
// Never duplicates previously imported PDFs (checked by onedrive_file_id).
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { file_id, book_title, book_title_ar, author, language, tradition, force_reimport } = body;

    if (!file_id || !book_title) {
      return Response.json({ error: 'file_id and book_title are required' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('one_drive');

    // ══ 1. Fetch file metadata from OneDrive ══
    const metaUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${file_id}?$select=id,name,size,eTag,lastModifiedDateTime,parentReference`;
    const metaRes = await fetch(metaUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!metaRes.ok) {
      return Response.json({ error: `Failed to fetch OneDrive file metadata: ${metaRes.status}` }, { status: 502 });
    }
    const meta = await metaRes.json();
    const fileName = meta.name || 'document.pdf';
    const etag = meta.eTag || '';
    const modifiedDate = meta.lastModifiedDateTime || '';
    const filePath = meta.parentReference
      ? `${meta.parentReference.path || ''}/${fileName}`
      : `/${fileName}`;

    // ══ 2. Check for duplicate by onedrive_file_id ══
    const existing = await base44.asServiceRole.entities.ManuscriptBook.filter({ onedrive_file_id: file_id });

    if (existing && existing.length > 0 && !force_reimport) {
      const existingBook = existing[0];
      if (existingBook.onedrive_etag === etag) {
        // Same file, unchanged — do NOT re-import
        return Response.json({
          status: 'duplicate',
          book_id: existingBook.book_id,
          book_title: existingBook.book_title,
          onedrive_file_id: file_id,
          message: 'This PDF has already been imported and has not changed in OneDrive. No re-import needed.',
        });
      } else {
        // File has changed — notify user, await confirmation
        return Response.json({
          status: 'changed',
          book_id: existingBook.book_id,
          book_title: existingBook.book_title,
          old_etag: existingBook.onedrive_etag,
          new_etag: etag,
          old_modified: existingBook.onedrive_modified_date,
          new_modified: modifiedDate,
          message: 'This PDF has changed in OneDrive since the last import. Re-import to create a new version (the old version is preserved permanently).',
        });
      }
    }

    // ══ 3. Download file content from OneDrive ══
    const contentUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${file_id}/content`;
    const contentRes = await fetch(contentUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!contentRes.ok) {
      return Response.json({ error: `Failed to download file from OneDrive: ${contentRes.status}` }, { status: 502 });
    }
    const fileBuffer = await contentRes.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    // ══ 4. Compute SHA-256 hash for content-level dedup ══
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = hashArray.map((b: number) => b.toString(16).padStart(2, '0')).join('');

    // ══ 5. Upload file to Base44 storage (detect MIME type from extension) ══
    const fileExt = fileName.toLowerCase().split('.').pop() || '';
    const mimeType = fileExt === 'pdf' ? 'application/pdf'
      : fileExt === 'txt' ? 'text/plain'
      : fileExt === 'md' ? 'text/markdown'
      : fileExt === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : fileExt === 'jpg' || fileExt === 'jpeg' ? 'image/jpeg'
      : fileExt === 'png' ? 'image/png'
      : fileExt === 'webp' ? 'image/webp'
      : 'application/octet-stream';
    const blob = new Blob([fileBytes], { type: mimeType });
    const file = new File([blob], fileName, { type: mimeType });
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });
    const pdfUrl = uploadResult.file_url;

    // ══ 6. Split PDF into chunks and upload each ══
    // No LLM calls here — this is fast (PDF splitting + uploads only).
    // Each chunk is processed independently by processImportChunk.
    // This prevents HTTP 504 timeouts on large manuscripts.

    const isPdf = fileExt === 'pdf';
    const bookId = `MS-OD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const jobId = `JOB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    let chunksArr: any[] = [];
    let totalPages = 0;

    if (isPdf) {
      // Split PDF into 10-page chunks using pdf-lib
      const pdfLibMod = await import('npm:pdf-lib@1.17.1');
      const { PDFDocument } = pdfLibMod;
      const fullPdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      totalPages = fullPdfDoc.getPageCount();
      const CHUNK_SIZE = 10;
      const totalChunks = Math.ceil(totalPages / CHUNK_SIZE);

      for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
        const startPage = chunkIdx * CHUNK_SIZE + 1;
        const endPage = Math.min((chunkIdx + 1) * CHUNK_SIZE, totalPages);

        const chunkPdf = await PDFDocument.create();
        const pageIndices: number[] = [];
        for (let p = startPage - 1; p < endPage; p++) pageIndices.push(p);
        const copiedPages = await chunkPdf.copyPages(fullPdfDoc, pageIndices);
        copiedPages.forEach((p: any) => chunkPdf.addPage(p));

        const chunkBytes = await chunkPdf.save();
        const chunkBlob = new Blob([chunkBytes], { type: 'application/pdf' });
        const chunkFileName = `${bookId}_chunk_${chunkIdx + 1}_pages_${startPage}-${endPage}.pdf`;
        const chunkFile = new File([chunkBlob], chunkFileName, { type: 'application/pdf' });
        const chunkUpload = await base44.asServiceRole.integrations.Core.UploadFile({ file: chunkFile });

        chunksArr.push({
          chunk_number: chunkIdx + 1,
          chunk_url: chunkUpload.file_url,
          page_offset: startPage - 1,
          page_range: `${startPage}-${endPage}`,
          page_count: endPage - startPage + 1,
        });
      }
    } else {
      // Non-PDF: single chunk (whole file)
      chunksArr.push({
        chunk_number: 1,
        chunk_url: pdfUrl,
        page_offset: 0,
        page_range: '1-1',
        page_count: 1,
      });
    }

    const totalChunks = chunksArr.length;

    // ══ 7. Create ManuscriptBook (extraction pending) ══
    await base44.asServiceRole.entities.ManuscriptBook.create({
      book_id: bookId,
      book_title,
      book_title_ar: book_title_ar || '',
      author: author || '',
      language: language || 'Arabic',
      source: 'onedrive',
      original_file_url: pdfUrl,
      original_file_name: fileName,
      upload_date: now,
      version: '2.0-chunked',
      total_pages: totalPages,
      ocr_status: 'pending',
      verification_status: 'unverified',
      extraction_status: 'pending',
      categories_covered: [],
      total_entries_extracted: 0,
      tradition: tradition || '',
      validation_status: 'not_validated',
      validation_report: {},
      validation_date: now,
      onedrive_file_id: file_id,
      onedrive_file_path: filePath,
      onedrive_etag: etag,
      onedrive_file_hash: fileHash,
      onedrive_modified_date: modifiedDate,
      notes: `Chunked import — ${totalChunks} chunk(s). Process each chunk via processImportChunk.`,
    });

    // ══ 8. Create ManuscriptImportJob for resumable tracking ══
    await base44.asServiceRole.entities.ManuscriptImportJob.create({
      job_id: jobId,
      book_id: bookId,
      book_title,
      onedrive_file_id: file_id,
      onedrive_file_path: filePath,
      onedrive_etag: etag,
      onedrive_file_hash: fileHash,
      total_chunks: totalChunks,
      chunks: chunksArr.map((c: any) => ({
        chunk_number: c.chunk_number,
        chunk_url: c.chunk_url,
        page_offset: c.page_offset,
        page_range: c.page_range,
        status: 'pending',
        retry_count: 0,
        max_retries: 3,
        error: '',
        failed_stage: '',
        stage_timings: {},
        entries_extracted: 0,
        images_extracted: 0,
        processing_time_ms: 0,
        started_at: '',
        completed_at: '',
      })),
      current_stage: 'splitting',
      status: 'splitting',
      overall_progress: 0,
      started_at: now,
      completed_at: '',
      created_by: user.id,
      created_by_email: user.email,
    });

    return Response.json({
      status: 'chunked',
      job_id: jobId,
      book_id: bookId,
      book_title,
      onedrive_file_id: file_id,
      onedrive_file_path: filePath,
      file_hash: fileHash,
      total_pages: totalPages,
      total_chunks: totalChunks,
      chunks: chunksArr,
      message: `PDF split into ${totalChunks} chunk(s). Process each chunk via processImportChunk.`,
      next_step: `processImportChunk({ "job_id": "${jobId}", "chunk_number": 1 })`,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'import_failed' }, { status: 500 });
  }
});