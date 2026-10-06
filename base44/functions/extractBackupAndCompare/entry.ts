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
    
    // Extract ZIP
    const jszip = new JSZip();
    const zip = await jszip.loadAsync(zipBuffer);
    
    // Key files to extract (layout, keyboard, viewport behavior)
    const keyFiles = [
      'src/components/PageLayout.jsx',
      'components/PageLayout.jsx',
      'src/index.css',
      'index.css',
      'src/pages/SirrPage.jsx',
      'pages/SirrPage.jsx',
      'src/pages/Home.jsx',
      'pages/Home.jsx',
      'src/pages/HadimPage.jsx',
      'pages/HadimPage.jsx',
      'src/pages/AbjadKabirPage.jsx',
      'pages/AbjadKabirPage.jsx',
      'src/App.jsx',
      'App.jsx',
      'src/main.jsx',
      'main.jsx',
      'src/lib/deviceUtils.js',
      'lib/deviceUtils.js',
      'src/hooks/useDeviceType.js',
      'hooks/useDeviceType.js',
    ];

    const extractedFiles = {};
    for (const filePath of keyFiles) {
      try {
        const file = zip.file(filePath);
        if (file) {
          const content = await file.async('text');
          extractedFiles[filePath] = content;
          console.log(`Extracted: ${filePath}`);
        }
      } catch (e) {
        console.log(`Could not extract ${filePath}: ${e.message}`);
      }
    }

    // Get current project files for comparison
    const currentProjectPaths = [
      'components/PageLayout.jsx',
      'index.css',
      'pages/SirrPage.jsx',
      'pages/Home.jsx',
      'pages/HadimPage.jsx',
      'pages/AbjadKabirPage.jsx',
      'App.jsx',
      'main.jsx',
      'lib/deviceUtils.js',
      'hooks/useDeviceType.js',
    ];

    const comparison = [];
    for (const [backupPath, backupContent] of Object.entries(extractedFiles)) {
      const normalizedPath = backupPath.replace('src/', '');
      try {
        const currentFile = await base44.integrations.Core.InvokeLLM({
          prompt: `Read the file at ${normalizedPath} in the current project and return its full content.`,
          add_context_from_internet: false,
        });
        
        if (backupContent !== currentFile) {
          comparison.push({
            file: normalizedPath,
            hasDifference: true,
            backupSize: backupContent.length,
            currentSize: currentFile?.length || 0,
            backupPreview: backupContent.substring(0, 500),
            currentPreview: currentFile?.substring(0, 500) || 'N/A',
          });
        } else {
          comparison.push({
            file: normalizedPath,
            hasDifference: false,
          });
        }
      } catch (e) {
        comparison.push({
          file: normalizedPath,
          error: e.message,
        });
      }
    }

    return Response.json({
      success: true,
      extractedFiles: Object.keys(extractedFiles),
      comparison,
      totalFiles: Object.keys(extractedFiles).length,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
});