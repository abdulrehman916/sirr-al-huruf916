import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import AdmZip from 'npm:adm-zip@0.5.17';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const { file_url, create_safety_backup = true } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    // Download ZIP file
    const zipResponse = await fetch(file_url);
    if (!zipResponse.ok) {
      return Response.json({ error: 'Failed to download ZIP file' }, { status: 500 });
    }

    const zipBuffer = await zipResponse.arrayBuffer();
    const zip = new AdmZip(Buffer.from(zipBuffer));
    const zipEntries = zip.getEntries();

    const restoredFiles = [];
    const removedFiles = [];
    const changedFiles = [];
    const errors = [];

    // Extract all files from ZIP
    const backupFiles = new Map();
    zipEntries.forEach(entry => {
      if (!entry.isDirectory) {
        // Convert src/ paths to project root paths
        let entryName = entry.entryName;
        if (entryName.startsWith('src/')) {
          entryName = entryName.substring(4); // Remove 'src/' prefix
        }
        backupFiles.set(entryName, entry.getData().toString('utf8'));
      }
    });

    // Create safety backup of current state (list current files)
    const safetyBackup = {
      timestamp: new Date().toISOString(),
      backup_type: 'pre_restoration_safety_backup',
      files: {}
    };

    if (create_safety_backup) {
      // Note: We can't actually backup all current files via SDK, 
      // but we'll log what we're about to change
      backupFiles.forEach((content, filePath) => {
        safetyBackup.files[filePath] = 'will_be_overwritten';
      });
    }

    // Process each file from backup
    for (const [filePath, content] of backupFiles.entries()) {
      // Skip certain files that shouldn't be restored
      if (filePath.includes('node_modules') || filePath.includes('.git')) {
        continue;
      }

      try {
        // For this function, we'll return the file list for restoration
        // Actual file writing would need to be done by the platform
        restoredFiles.push({
          path: filePath,
          size: content.length,
          status: 'ready_for_restoration'
        });
      } catch (err) {
        errors.push({
          file: filePath,
          error: err.message
        });
      }
    }

    return Response.json({
      success: true,
      message: 'Backup analysis complete',
      summary: {
        total_files_in_backup: backupFiles.size,
        files_to_restore: restoredFiles.length,
        files_to_remove: removedFiles.length,
        files_changed: changedFiles.length,
        errors: errors.length
      },
      restored_files: restoredFiles.slice(0, 50), // Limit to first 50 for response size
      removed_files: removedFiles,
      changed_files: changedFiles,
      errors: errors,
      safety_backup: create_safety_backup ? safetyBackup : null,
      note: 'Full restoration requires platform file write access. Use the restored_files list to manually restore each file.'
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});