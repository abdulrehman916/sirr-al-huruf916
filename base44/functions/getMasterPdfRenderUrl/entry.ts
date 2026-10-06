// ═══════════════════════════════════════════════════════════════
// getMasterPdfRenderUrl — Resolve an approved Master PDF Library
// book (Google Drive live-index) to a renderable PDF URL.
//
// Used ONLY by the Section D (and Section B) visual pipelines to
// fetch an approved source PDF from the Owner's Google Drive and
// expose it as a plain CDN URL the browser can fetch + render with
// pdfjs-dist (no auth headers needed in the browser).
//
// CONTRACT
//   Input : { book_title: string }   — must match MasterPdfBook.book_title
//   Output: { file_url, master_book_id, book_title, file_size }
//
// RULES
//   - Admin/Owner only.
//   - Source = the Owner's approved Google Drive (MasterPdfBook with
//     google_drive_file_id). NEVER the internet.
//   - Read-only Drive scope only.
//   - The fetched PDF is uploaded to Base44 storage once and the
//     resulting file_url returned. The visual pipeline renders cited
//     pages from this URL; it never modifies the source.
// ═══════════════════════════════════════════════════════════════
import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // ── Admin/Owner gate ──
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin" && user.role !== "owner") {
      return Response.json({ error: "Admin/Owner only" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const bookTitle = String(body?.book_title || "").trim();
    if (!bookTitle) {
      return Response.json({ error: "book_title is required" }, { status: 400 });
    }

    // ── Find the approved Master Library book by exact title ──
    const matches = await base44.asServiceRole.entities.MasterPdfBook.filter(
      { book_title: bookTitle },
      null,
      5
    );
    const book = (matches || [])[0];
    if (!book) {
      return Response.json({ error: `No approved book found for title: ${bookTitle}` }, { status: 404 });
    }

    const fileId = String(book.google_drive_file_id || "").trim();
    if (!fileId) {
      return Response.json({ error: `Book has no Google Drive file id: ${bookTitle}` }, { status: 404 });
    }

    // ── Get the Owner's Google Drive access token (read-only) ──
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googledrive");
    if (!accessToken) {
      return Response.json({ error: "Google Drive connection not authorized" }, { status: 500 });
    }

    // ── Fetch the PDF bytes from Drive (alt=media = file content) ──
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`;
    const driveRes = await fetch(driveUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!driveRes.ok) {
      const errText = await driveRes.text().catch(() => "");
      return Response.json(
        { error: `Drive fetch failed (${driveRes.status}) for ${bookTitle}: ${errText.slice(0, 200)}` },
        { status: 502 }
      );
    }
    const pdfBytes = new Uint8Array(await driveRes.arrayBuffer());
    if (pdfBytes.length === 0) {
      return Response.json({ error: `Empty PDF bytes for ${bookTitle}` }, { status: 502 });
    }

    // ── Upload the approved PDF to Base44 storage (one-time, per book) ──
    const safeName = String(bookTitle || "source.pdf").replace(/[^\p{L}\p{N}._-]+/gu, "_").slice(0, 80) + ".pdf";
    const fileObj = new File([pdfBytes], safeName, { type: "application/pdf" });
    const uploadRes = await base44.asServiceRole.integrations.Core.UploadFile({ file: fileObj });
    const fileUrl = uploadRes?.file_url || "";
    if (!fileUrl) {
      return Response.json({ error: "UploadFile returned no url" }, { status: 500 });
    }

    return Response.json({
      file_url: fileUrl,
      master_book_id: book.master_book_id,
      book_title: book.book_title,
      file_size: pdfBytes.length,
    });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});