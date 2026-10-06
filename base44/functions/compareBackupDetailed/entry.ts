import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';
import JSZip from 'npm:jszip@3.10.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - admin required' }, { status: 403 });
    }

    const BACKUP_URL = 'https://media.base44.com/files/public/69f3dea51ce92ee2fde20be6/324d7fc1c_sirrulhurufcode.zip';

    // Download ZIP
    const zipResponse = await fetch(BACKUP_URL);
    if (!zipResponse.ok) {
      throw new Error(`Failed to download ZIP: ${zipResponse.status} ${zipResponse.statusText}`);
    }

    const zipBuffer = await zipResponse.arrayBuffer();
    const jszip = new JSZip();
    const zip = await jszip.loadAsync(zipBuffer);
    
    // Extract ALL files from ZIP
    const backupFiles = {};
    for (const [filePath, file] of Object.entries(zip.files)) {
      if (!file.dir && (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.css'))) {
        const content = await file.async('text');
        backupFiles[filePath] = content;
      }
    }

    console.log(`Extracted ${Object.keys(backupFiles).length} files from backup`);

    // Return backup files for comparison
    return Response.json({
      success: true,
      totalFiles: Object.keys(backupFiles).length,
      backupFiles: Object.keys(backupFiles).sort(),
      // Return key files content for direct comparison
      keyFilesContent: {
        'PageLayout.jsx': backupFiles['src/components/PageLayout.jsx'] || backupFiles['components/PageLayout.jsx'],
        'index.css': backupFiles['src/index.css'] || backupFiles['index.css'],
        'SirrPage.jsx': backupFiles['src/pages/SirrPage.jsx'] || backupFiles['pages/SirrPage.jsx'],
        'Home.jsx': backupFiles['src/pages/Home.jsx'] || backupFiles['pages/Home.jsx'],
        'HadimPage.jsx': backupFiles['src/pages/HadimPage.jsx'] || backupFiles['pages/HadimPage.jsx'],
        'AbjadKabirPage.jsx': backupFiles['src/pages/AbjadKabirPage.jsx'] || backupFiles['pages/AbjadKabirPage.jsx'],
      }
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
});