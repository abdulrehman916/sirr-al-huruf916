import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// MASTER PDF LIBRARY · GOOGLE DRIVE INTEGRATION (Owner-only)
//
// Searches the Owner's Google Drive for PDFs using Google's
// server-side full-text index (fullText contains '...') — Google
// has already OCR'd and indexed every PDF, so we search WITHOUT
// downloading the binary PDFs. For reading a specific PDF's text,
// we use files/export to text/plain (server-side extraction), not
// a binary download.
//
// SECURITY:
//   - Caller MUST be the Owner (AdminProfile.is_owner === true).
//   - Uses the SHARED OAuth connection (Owner authorized once).
//   - Non-owners (admins, users, anonymous) get 403.
//   - The token never leaves the backend.
//
// MODES:
//   mode='search'  + query  → list PDFs whose indexed text matches
//   mode='list'             → list all PDFs in the Drive (no query)
//   mode='read'    + file_id → server-side text extraction of one PDF
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // ── Owner-only gate ──
    let isOwner = false;
    try {
      const profiles = await base44.asServiceRole.entities.AdminProfile.list(null, 500);
      const profile = (profiles || []).find(
        (p) =>
          (p.user_id && p.user_id === user.id) ||
          (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
      );
      isOwner = profile?.is_owner === true;
    } catch { isOwner = false; }
    if (!isOwner) {
      return Response.json({ error: 'Only the Owner can access cloud libraries' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const mode = String(body.mode || 'search');
    const query = String(body.query || '').trim();
    const fileId = String(body.file_id || '').trim();
    const pageSize = Math.min(Math.max(parseInt(body.page_size, 10) || 50, 1), 200);
    const pageToken = String(body.page_token || '');

    // ── Get the Owner's Google Drive connection ──
    let accessToken = '';
    try {
      const conn = await base44.asServiceRole.connectors.getConnection('googledrive');
      accessToken = conn?.accessToken || '';
    } catch (e) {
      return Response.json({ error: 'Google Drive not connected', details: String(e?.message || e) }, { status: 502 });
    }
    if (!accessToken) {
      return Response.json({ error: 'Google Drive not connected' }, { status: 502 });
    }
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    const fields = 'files(id,name,mimeType,modifiedTime,size,webViewLink,thumbnailLink,parents),nextPageToken';

    // ── MODE: read one PDF's text (server-side OCR extraction, not binary download) ──
    if (mode === 'read') {
      if (!fileId) return Response.json({ error: 'file_id required for read mode' }, { status: 400 });
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/export?mimeType=text/plain`,
        { headers: authHeader }
      );
      if (!res.ok) {
        const details = await res.text();
        return Response.json({ error: 'Export failed', status: res.status, details: details.slice(0, 300) }, { status: 502 });
      }
      const text = await res.text();
      return Response.json({
        success: true,
        file_id: fileId,
        text,
        char_count: text.length,
      });
    }

    // ── MODE: list or search PDFs ──
    let q = "mimeType='application/pdf' and trashed=false";
    if (mode === 'search') {
      if (!query) return Response.json({ error: 'query required for search mode' }, { status: 400 });
      // Escape single quotes in the query for the Drive API q syntax
      const escaped = query.replace(/'/g, "\\'");
      q += ` and fullText contains '${escaped}'`;
    }

    const params = new URLSearchParams({
      q,
      fields,
      pageSize: String(pageSize),
      orderBy: 'modifiedTime desc',
    });
    if (pageToken) params.set('pageToken', pageToken);

    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, { headers: authHeader });
    if (!res.ok) {
      const details = await res.text();
      return Response.json({ error: 'Drive search failed', status: res.status, details: details.slice(0, 400) }, { status: 502 });
    }
    const data = await res.json();
    const files = (data.files || []).map((f) => ({
      id: f.id,
      name: f.name,
      mime_type: f.mimeType,
      modified_time: f.modifiedTime,
      size_bytes: Number(f.size) || 0,
      view_link: f.webViewLink || '',
      thumbnail: f.thumbnailLink || '',
    }));

    return Response.json({
      success: true,
      mode,
      query: mode === 'search' ? query : '',
      total: files.length,
      has_more: !!data.nextPageToken,
      next_page_token: data.nextPageToken || '',
      files,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});