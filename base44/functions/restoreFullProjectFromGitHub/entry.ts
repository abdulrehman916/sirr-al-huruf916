import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { writeAll } from 'https://deno.land/std@0.168.0/streams/conversion.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const { commit_hash, owner = 'abdulrehman916', repo = 'sirr-al-huruf' } = await req.json();

    if (!commit_hash) {
      return Response.json({ error: 'commit_hash is required' }, { status: 400 });
    }

    // Get GitHub connector token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('github');
    
    if (!accessToken) {
      return Response.json({ error: 'GitHub connector not authorized' }, { status: 400 });
    }

    const headers = {
      'Authorization': `token ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'base44-app-restoration'
    };

    // Step 1: Get the commit
    const commitUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${commit_hash}`;
    const commitRes = await fetch(commitUrl, { headers });
    
    if (!commitRes.ok) {
      return Response.json({ error: `Failed to fetch commit: ${commitRes.status}` }, { status: 500 });
    }

    const commitData = await commitRes.json();
    const treeSha = commitData.commit.tree?.sha;
    
    if (!treeSha) {
      return Response.json({ error: 'No tree found in commit' }, { status: 404 });
    }

    // Step 2: Get complete tree
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`;
    const treeRes = await fetch(treeUrl, { headers });
    
    if (!treeRes.ok) {
      return Response.json({ error: `Failed to fetch tree: ${treeRes.status}` }, { status: 500 });
    }

    const treeData = await treeRes.json();
    const allFiles = treeData.tree.filter(item => item.type === 'blob');

    // Step 3: Filter source files
    const sourceFiles = allFiles.filter(file => 
      file.path.startsWith('src/') && 
      (file.path.endsWith('.js') || file.path.endsWith('.jsx') || 
       file.path.endsWith('.json') || file.path.endsWith('.css') ||
       file.path.endsWith('.html'))
    );

    console.log(`[RESTORE] Found ${sourceFiles.length} files to restore`);

    // Step 4: Restore files in batches - WRITE DIRECTLY TO FILESYSTEM
    const restored = [];
    const failed = [];
    const BATCH_SIZE = 10;

    for (let i = 0; i < sourceFiles.length; i += BATCH_SIZE) {
      const batch = sourceFiles.slice(i, i + BATCH_SIZE);
      console.log(`[RESTORE] Processing batch ${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(sourceFiles.length/BATCH_SIZE)}`);

      for (const file of batch) {
        try {
          const blobUrl = `https://api.github.com/repos/${owner}/${repo}/git/blobs/${file.sha}`;
          const blobRes = await fetch(blobUrl, { headers });
          
          if (!blobRes.ok) {
            failed.push({ path: file.path, error: `HTTP ${blobRes.status}` });
            continue;
          }

          const blobData = await blobRes.json();
          const content = atob(blobData.content);
          const appPath = file.path.replace('src/', '');
          const fullPath = `/src/${appPath}`;
          
          // Write file to filesystem
          const encoder = new TextEncoder();
          const data = encoder.encode(content);
          await Deno.writeFile(fullPath, data);
          
          restored.push({ path: appPath, size: content.length });
          console.log(`[RESTORED] ${appPath}`);
          
        } catch (error) {
          failed.push({ path: file.path, error: error.message });
          console.error(`[FAILED] ${file.path}: ${error.message}`);
        }
      }
      
      // Rate limit protection
      if (i + BATCH_SIZE < sourceFiles.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return Response.json({
      success: true,
      commit_hash,
      commit_info: {
        message: commitData.commit?.message,
        date: commitData.commit?.author?.date,
        author: commitData.commit?.author?.name,
        url: commitData.html_url
      },
      summary: {
        total_files_in_tree: allFiles.length,
        source_files_found: sourceFiles.length,
        restored: restored.length,
        failed: failed.length
      },
      files_restored: restored,
      files_failed: failed,
      note: 'Files have been written directly to the filesystem. Project restoration complete.'
    });

  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});