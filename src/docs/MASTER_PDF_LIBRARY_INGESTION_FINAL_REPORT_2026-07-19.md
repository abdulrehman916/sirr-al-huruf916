# Master PDF Library — Final Ingestion Report

**Date:** 2026-07-19
**Engine:** `processMasterPdfChunk` (fault-tolerant, idempotent, per-book transactional queue)
**Architecture:** In-memory unpdf text extraction (Google Drive live-index, zero binary persistence) + vision OCR (uploaded/OneDrive PDFs)

---

## Summary

| Metric | Value |
|---|---|
| Total books in library | 268 |
| Successfully indexed (pending Owner verification) | 264 |
| Failed / unprocessable (flagged for Owner review) | 4 |
| Remaining in queue | **0** |
| Total MasterPdfPage records indexed | 5,000 (API-list cap) |
| Pages flagged for Owner review (low confidence / quality flags) | 4,488 |

**Queue status:** EMPTY. All processable books have been indexed.

---

## Pipeline integrity guarantees honored

1. **Per-book transactional isolation** — each book is processed in its own transaction; a crash on one book never corrupts another. Verified: crashed batches still saved all books completed before the crash (per-book checkpointing).
2. **Idempotent resume** — the queue resumes from the natural checkpoint: every already-indexed book (pending_verification / completed / failed) is skipped; only pending/processing/partial books are processed. Re-running is safe.
3. **Append-only** — OCR text is never overwritten; per-page idempotency (existing MasterPdfPage records skipped by content_hash).
4. **Zero binary persistence** — no PDF binary is ever stored. Google Drive PDFs are fetched in-memory, text-extracted via unpdf, and the binary discarded immediately.
5. **Owner-only access** — entity RLS (admin-only) + backend Owner-verification gate on every read/write.
6. **Never auto-approved** — every page enters `review_status: pending_review`; nothing becomes permanent without Owner approval.
7. **Never auto-retried corrupt PDFs** — verified crashers are marked failed once and routed to Owner Review.

---

## Failed / Unprocessable PDFs (4)

All four failed books are flagged `owner_review_status: needs_revision` and are visible in the **Owner Pending Reviews** queue. Each was verified via isolated retry (batch_size=1) before marking — no book was marked failed on assumption.

### 1. Adobe Pre-Activated Softwares 2024.pdf — `FAILED_CORRUPT_PDF`
- **ID:** `MPB-1784475501561-bs8pub`
- **Source:** Google Drive (`1P5mnMjnOCHe2lI8qCH3CsmSaOMRoIP2F`)
- **Size:** 0.6 MB
- **Root cause:** pdfjs WASM abort during in-memory extraction. The file is a software installer / non-manuscript PDF with a corrupt/empty stream structure that crashes the native pdfjs parser.
- **Exact parser error:** `pdfjs WASM abort during in-memory extraction (0.6 MB)`
- **Action:** Skipped, never auto-retried. Not a scholarly manuscript — safe to ignore or delete from the library.

### 2. Aleister Crowley - Goetia Duquette.pdf — `FAILED_CORRUPT_PDF`
- **ID:** `MPB-1784475501653-m2ce3s`
- **Source:** Google Drive (`1ggg06Ap7W8hbWsL5IYTngaXcpgYJBO98`)
- **Root cause:** Structurally corrupt FlateDecode streams. pdfjs emitted repeated `Warning: Empty "FlateDecode" stream.` across pages, then the native worker aborted (OOM/abort signal). This is a verified corrupt PDF, not a transient error.
- **Exact parser error:** `Warning: Empty "FlateDecode" stream` (repeated) → native pdfjs worker abort
- **Action:** Skipped, never auto-retried. Re-upload a clean copy of the PDF to retry.

### 3. Ninja Calling Pro Plus.pdf — `UNPROCESSABLE (pdfjs standardFontDataUrl limitation)`
- **ID:** `MPB-1784475501833-po2q72`
- **Source:** Google Drive (`12IWFoLQDLPTq1XjX4HoyHI8kCKEtgQOJ`)
- **Size:** 19.1 MB
- **Root cause:** The PDF references unembedded standard fonts (Helvetica/Times/Courier). The in-process pdfjs bundle (via unpdf) has no `standardFontDataUrl` configured, so it cannot load the standard font data and the native worker throws an abort. **This is a tooling limitation, not file corruption** — the PDF is readable by any fully-configured pdfjs.
- **Exact parser error:** `UnknownErrorException: Ensure that the standardFontDataUrl API parameter is provided.`
- **Action:** Skipped, never auto-retried. To process: either re-upload a version with embedded fonts, or configure a `standardFontDataUrl` CDN in the extraction pipeline.

### 4. gharabadin2.pdf — `UNPROCESSABLE (pdfjs standardFontDataUrl limitation)`
- **ID:** `MPB-1784475502489-ak6u6h`
- **Source:** Google Drive (`1jnlLJ2AlYvaaKqm31QlF9St5xu1Wx0Kh`)
- **Size:** 8.2 MB
- **Root cause:** Same as #3 — unembedded standard fonts; in-process pdfjs cannot load them without a `standardFontDataUrl`. Not file corruption.
- **Exact parser error:** `UnknownErrorException: Ensure that the standardFontDataUrl API parameter is provided.`
- **Action:** Skipped, never auto-retried. Same remediation as #3.

---

## Recommendations

### To recover books #3 and #4 (standardFontDataUrl limitation)
The unpdf extraction call in `processMasterPdfChunk` can be extended to pass a `standardFontDataUrl` pointing to a CDN hosting pdfjs standard font data (e.g. `https://unpkg.com/pdfjs-dist@<version>/standard_fonts/`). This is a **pipeline change that affects all Google Drive extractions** — per project policy, it requires Owner confirmation before applying. Once approved, books #3 and #4 can be reset to `pending` and re-indexed automatically.

### To recover book #2 (Aleister Crowley — corrupt FlateDecode)
Re-upload a clean/repaired copy to Google Drive. The live-index sync will detect the new file; reset the book record to `pending` to re-index.

### Book #1 (Adobe Pre-Activated Softwares)
This is not a manuscript. Recommend deleting it from the library entirely.

### Owner Review queue
4,488 indexed pages carry `needs_owner_review: true` (OCR confidence < 100 or quality flags). These are all in `review_status: pending_review` and await Owner approval via the Pending Reviews gateway before becoming permanent. No page was auto-approved.