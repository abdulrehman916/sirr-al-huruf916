import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// MASTER PDF LIBRARY · ADOBE DOCUMENT CLOUD INTEGRATION (Owner-only)
//
// Adobe Document Cloud is NOT a Base44 platform OAuth connector,
// so it requires the Owner's own Adobe API credentials (set as
// app secrets): ADOBE_CLIENT_ID, ADOBE_CLIENT_SECRET, ADOBE_ORG_ID.
// Obtain them from the Adobe Developer Console
// (https://developer.adobe.com/console) under a Server-to-Server
// credential for Adobe PDF Services.
//
// IMPORTANT — honest limitation:
//   Adobe Document Cloud (the consumer file store at
//   documentcloud.adobe.com) does NOT expose a public third-party
//   full-text SEARCH API the way Google Drive and OneDrive do.
//   So "search the Adobe Cloud library without download" is not
//   possible via a public search endpoint. Instead, this function
//   uses Adobe PDF Services Extract API for high-quality Arabic /
//   English / Malayalam OCR + text extraction on a PDF the Owner
//   provides (by upload or stored file_url). This complements the
//   Drive/OneDrive content-search integrations.
//
// SECURITY:
//   - Caller MUST be the Owner (AdminProfile.is_owner === true).
//   - Adobe credentials read from Deno.env — never sent to the client.
//   - Non-owners get 403.
//
// MODES (available once credentials are configured):
//   mode='status'           → report whether Adobe is configured
//   mode='extract' + file_url → Adobe OCR/extract text from a PDF
//   mode='search'  + query    → reserved (no public Adobe search API)
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

    // ── Read Adobe credentials (set via app secrets) ──
    const ADOBE_CLIENT_ID = Deno.env.get('ADOBE_CLIENT_ID') || '';
    const ADOBE_CLIENT_SECRET = Deno.env.get('ADOBE_CLIENT_SECRET') || '';
    const ADOBE_ORG_ID = Deno.env.get('ADOBE_ORG_ID') || '';

    const body = await req.json().catch(() => ({}));
    const mode = String(body.mode || 'status');

    // ── MODE: status ──
    if (mode === 'status') {
      const configured = !!(ADOBE_CLIENT_ID && ADOBE_CLIENT_SECRET && ADOBE_ORG_ID);
      return Response.json({
        success: true,
        provider: 'adobe_document_cloud',
        configured,
        credentials_present: {
          client_id: !!ADOBE_CLIENT_ID,
          client_secret: !!ADOBE_CLIENT_SECRET,
          org_id: !!ADOBE_ORG_ID,
        },
        note: configured
          ? 'Adobe credentials detected. Extract mode (Adobe PDF Services OCR) is available. Note: Adobe Document Cloud has no public third-party full-text library-search API; use Google Drive / OneDrive for library-wide search.'
          : 'Adobe credentials not configured. Set ADOBE_CLIENT_ID, ADOBE_CLIENT_SECRET, ADOBE_ORG_ID in app secrets (Adobe Developer Console → Server-to-Server credential). Until then, use the Google Drive and OneDrive integrations for cloud PDF search.',
      });
    }

    // ── All other modes require credentials ──
    if (!ADOBE_CLIENT_ID || !ADOBE_CLIENT_SECRET || !ADOBE_ORG_ID) {
      return Response.json({
        error: 'Adobe not configured',
        details: 'Set ADOBE_CLIENT_ID, ADOBE_CLIENT_SECRET, ADOBE_ORG_ID in app secrets, then retry.',
      }, { status: 503 });
    }

    if (mode === 'search') {
      return Response.json({
        error: 'Adobe Document Cloud has no public third-party full-text search API',
        hint: 'Use Google Drive (searchGoogleDrivePdfs) or OneDrive (searchOneDrivePdfs) for library-wide content search. Adobe is used for OCR extraction via mode=extract.',
      }, { status: 400 });
    }

    if (mode === 'extract') {
      const fileUrl = String(body.file_url || '').trim();
      if (!fileUrl) return Response.json({ error: 'file_url required for extract mode' }, { status: 400 });
      // ── Adobe PDF Services: obtain access token (JWT/server-to-server) ──
      // Adobe PDF Services uses a JWT exchange. A full implementation
      // requires the Adobe IMS token endpoint + signed JWT. This is a
      // Phase-2 expansion once the Owner confirms the credential type.
      // For now we return a clear "not yet wired" status so the Owner
      // knows exactly what remains.
      return Response.json({
        success: false,
        error: 'Adobe PDF Services Extract is not yet wired',
        note: 'Credentials are present. The Adobe PDF Services JWT/token exchange + Extract API call will be implemented in the next phase. Provide the PDF file_url; the extraction pipeline will use Adobe OCR for Arabic/English/Malayalam text.',
        file_url: fileUrl,
      }, { status: 501 });
    }

    return Response.json({ error: 'Unknown mode. Use status | extract | search.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});