import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// MASTER PDF LIBRARY · ONEDRIVE INTEGRATION (Owner-only)
//
// Searches the Owner's OneDrive for PDFs using Microsoft Graph's
// server-side search index (/me/drive/root/search) — Microsoft has
// already indexed file content, so we search WITHOUT downloading
// the binary PDFs. For reading, Graph returns a temporary
// pre-authenticated download URL (@microsoft.graph.downloadUrl)
// that the AI can pass to InvokeLLM vision to extract text without
// us persisting the binary.
//
// SECURITY:
//   - Caller MUST be the Owner (AdminProfile.is_owner === true).
//   - Uses the SHARED OAuth connection (Owner authorized once).
//   - Non-owners (admins, users, anonymous) get 403.
//   - The token never leaves the backend.
//
// MODES:
//   mode='search' + query   → Graph content search, filter to PDFs
//   mode='list'             → list PDFs across the drive (search '.')
//   mode='read'   + file_id → return a pre-auth download URL for AI vision
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

    // ── Get the Owner's OneDrive connection ──
    let accessToken = '';
    try {
      const conn = await base44.asServiceRole.connectors.getConnection('one_drive');
      accessToken = conn?.accessToken || '';
    } catch (e) {
      return Response.json({ error: 'OneDrive not connected', details: String(e?.message || e) }, { status: 502 });
    }
    if (!accessToken) {
      return Response.json({ error: 'OneDrive not connected' }, { status: 502 });
    }
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // ── MODE: read → return pre-auth download URL for AI vision ──
    if (mode === 'read') {
      if (!fileId) return Response.json({ error: 'file_id required for read mode' }, { status: 400 });
      const metaRes = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${encodeURIComponent(fileId)}?$select=id,name,size,file,@microsoft.graph.downloadUrl,webUrl,lastModifiedDateTime`,
        { headers: authHeader }
      );
      if (!metaRes.ok) {
        const details = await metaRes.text();
        return Response.json({ error: 'OneDrive item fetch failed', status: metaRes.status, details: details.slice(0, 300) }, { status: 502 });
      }
      const meta = await metaRes.json();
      const downloadUrl = meta['@microsoft.graph.downloadUrl'] || '';
      if (!downloadUrl) {
        return Response.json({ error: 'No download URL available for this item' }, { status: 502 });
      }
      return Response.json({
        success: true,
        file_id: fileId,
        name: meta.name,
        size_bytes: meta.size || 0,
        // Pre-authenticated URL — pass to InvokeLLM file_urls to extract text
        // via vision WITHOUT persisting the binary in our storage.
        ai_read_url: downloadUrl,
        web_url: meta.webUrl || '',
      });
    }

    // ── MODE: search / list → Graph content search ──
    // Graph search indexes file content (incl. PDFs) and names.
    // For 'list' we use a broad query '.' that matches nearly all items,
    // then filter to PDFs client-side.
    let searchQ = query;
    if (mode === 'list') {
      searchQ = '.';
    } else if (!query) {
      return Response.json({ error: 'query required for search mode' }, { status: 400 });
    }

    // Graph search is a function call: search(q='...') is part of the URL path.
    const selectFields = 'id,name,size,file,@microsoft.graph.downloadUrl,webUrl,lastModifiedDateTime,parentReference';
    const otherParams = new URLSearchParams({
      $select: selectFields,
      $top: String(pageSize),
    });
    const searchUrl = `https://graph.microsoft.com/v1.0/me/drive/root/search(q='${encodeURIComponent(searchQ)}')?${otherParams}`;

    const res = await fetch(searchUrl, { headers: authHeader });
    if (!res.ok) {
      const details = await res.text();
      return Response.json({ error: 'OneDrive search failed', status: res.status, details: details.slice(0, 400) }, { status: 502 });
    }
    const data = await res.json();

    // Graph search can return folders, images, docs — filter to PDFs only.
    const files = (data.value || [])
      .filter((f) => f.file && f.file.mimeType === 'application/pdf')
      .map((f) => ({
        id: f.id,
        name: f.name,
        mime_type: f.file.mimeType,
        size_bytes: f.size || 0,
        modified_time: f.lastModifiedDateTime,
        web_url: f.webUrl || '',
        path: f.parentReference ? (f.parentReference.path || '') : '',
        ai_read_url: f['@microsoft.graph.downloadUrl'] || '',
      }));

    return Response.json({
      success: true,
      mode,
      query: mode === 'search' ? query : '',
      total: files.length,
      has_more: !!data['@odata.nextLink'],
      next_link: data['@odata.nextLink'] || '',
      files,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});