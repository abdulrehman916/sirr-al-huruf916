import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// ONEDRIVE BROWSER — LIST FOLDERS AND FILES
// ═══════════════════════════════════════════════════════════════
// Uses the SHARED OneDrive connector (Owner's account).
// Admin only. Returns folders and PDF files for the given folder.
//
// Microsoft Graph API:
//   Root:   GET /me/drive/root/children
//   Folder: GET /me/drive/items/{id}/children
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const folderId = body.folder_id || 'root';

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('one_drive');

    const select = '$select=id,name,folder,file,size,eTag,lastModifiedDateTime,parentReference';
    const url = folderId === 'root'
      ? `https://graph.microsoft.com/v1.0/me/drive/root/children?${select}`
      : `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children?${select}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json({ error: `OneDrive API error: ${response.status} ${errText}` }, { status: 502 });
    }

    const data = await response.json();
    const SUPPORTED_MIME_TYPES = new Set([
      'application/pdf',
      'text/plain',
      'text/markdown',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]);
    const items = (data.value || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      is_folder: !!item.folder,
      is_pdf: !!(item.file && item.file.mimeType === 'application/pdf'),
      is_importable: !!(item.file && SUPPORTED_MIME_TYPES.has(item.file.mimeType)),
      mime_type: item.file ? item.file.mimeType : '',
      size: item.size || 0,
      etag: item.eTag || '',
      modified_date: item.lastModifiedDateTime || '',
      path: item.parentReference ? (item.parentReference.path || '') : '',
    }));

    const folders = items.filter((i: any) => i.is_folder);
    const files = items.filter((i: any) => !i.is_folder);

    return Response.json({
      folder_id: folderId,
      folders,
      files,
      total: items.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});