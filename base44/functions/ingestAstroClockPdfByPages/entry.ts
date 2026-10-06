import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { PDFDocument } from 'npm:pdf-lib@1.17.1';

// ═══════════════════════════════════════════════════════════════
// INGEST ASTRO CLOCK PDF — PAGE BY PAGE (additive, source-preserving)
//
// Splits a range-PDF into single-page PDFs and ingests EACH page through the
// existing `unifiedIngestKnowledge` additive pipeline, with the exact book page
// number in the source label. This maximises extraction fidelity (no skipped
// sentences) compared to feeding a multi-page PDF in one vision call.
//
// Resumable: processes `page_count` pages per invocation starting at
// `start_page` (1-based within the range PDF), returns `next_start_page`.
//
// `page_offset` is added to the page label so a range PDF starting at book
// page 31 labels its first page "p.31".
//
// Reuses `unifiedIngestKnowledge` — never overwrites, never deletes, dedups by
// content_hash / rule_record_key / full_context_key, preserves every source.
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { pdf_url, book_title, start_page = 1, page_count = 5, page_offset = 0 } = body;
    if (!pdf_url) return Response.json({ error: 'pdf_url is required' }, { status: 400 });

    const start = Math.max(1, Math.floor(Number(start_page) || 1));
    const count = Math.max(1, Math.min(Math.floor(Number(page_count) || 5), 20));
    const offset = Math.max(0, Math.floor(Number(page_offset) || 0));
    const title = book_title || 'Astro Clock PDF';

    // Fetch + load source PDF
    const pdfRes = await fetch(pdf_url);
    if (!pdfRes.ok) return Response.json({ error: `Failed to fetch PDF: ${pdfRes.status}` }, { status: 502 });
    const pdfBytes = new Uint8Array(await pdfRes.arrayBuffer());
    const srcDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    const end = Math.min(start + count - 1, totalPages);

    const results = [];
    let totalEntries = 0, totalCreated = 0, totalMerged = 0, totalRejected = 0;

    for (let i = start; i <= end; i++) {
      const bookPage = offset + i;
      try {
        // Build a 1-page PDF for page i
        const singleDoc = await PDFDocument.create();
        const [copied] = await singleDoc.copyPages(srcDoc, [i - 1]);
        singleDoc.addPage(copied);
        const singleBytes = await singleDoc.save();
        const fileObj = new File([singleBytes], `page-${bookPage}.pdf`, { type: 'application/pdf' });

        const upRes: any = await base44.asServiceRole.integrations.Core.UploadFile({ file: fileObj });
        const pageUrl = upRes?.data?.file_url || upRes?.file_url;
        if (!pageUrl) { results.push({ page: bookPage, error: 'upload_failed' }); continue; }

        const sourceLabel = `${title} — p.${bookPage}`;
        const inv: any = await base44.functions.invoke('unifiedIngestKnowledge', {
          file_url: pageUrl, source_label: sourceLabel, source_type: 'pdf_page'
        });
        const d = inv?.data || inv;
        totalEntries += Number(d?.entries_found || 0);
        totalCreated += Number(d?.records_created || 0);
        totalMerged += Number(d?.records_merged || 0);
        totalRejected += Number(d?.rejected || 0);
        results.push({
          page: bookPage, status: d?.status, entries: d?.entries_found,
          created: d?.records_created, merged: d?.records_merged, rejected: d?.rejected,
          error: d?.error
        });
      } catch (e) {
        results.push({ page: bookPage, error: String(e?.message || e).slice(0, 200) });
      }
    }

    return Response.json({
      status: 'batch_complete',
      pdf_url, book_title: title, total_pages: totalPages,
      processed_range: `p.${offset + start}-${offset + end}`,
      pages_processed: end - start + 1,
      next_start_page: end < totalPages ? end + 1 : null,
      has_more: end < totalPages,
      totals: { entries_found: totalEntries, records_created: totalCreated, records_merged: totalMerged, rejected: totalRejected },
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'failed' }, { status: 500 });
  }
});