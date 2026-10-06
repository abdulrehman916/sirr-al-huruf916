import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const { commit_hash, owner = 'Sirrulhuruf', repo = 'SirrulHuruf', file_paths = [] } = await req.json();

    if (!commit_hash) {
      return Response.json({ error: 'commit_hash is required' }, { status: 400 });
    }

    // Get GitHub token from workspace connector or use provided token
    let accessToken = null;
    try {
      const connection = await base44.asServiceRole.connectors.getConnection('github');
      accessToken = connection.accessToken;
    } catch (e) {
      return Response.json({ 
        error: 'GitHub connector not authorized. Please authorize GitHub access first.',
        details: e.message 
      }, { status: 400 });
    }

    // Fetch commit details
    const commitUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${commit_hash}`;
    const commitRes = await fetch(commitUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!commitRes.ok) {
      return Response.json({ 
        error: 'Failed to fetch commit details',
        status: commitRes.status,
        details: await commitRes.text()
      }, { status: 500 });
    }

    const commitData = await commitRes.json();

    // If no file_paths specified, return commit info only
    if (!file_paths || file_paths.length === 0) {
      return Response.json({
        success: true,
        commit_hash,
        commit_info: {
          message: commitData.commit?.message,
          date: commitData.commit?.author?.date,
          author: commitData.commit?.author?.name,
          url: commitData.html_url,
        },
        files_changed: commitData.files?.map(f => ({
          filename: f.filename,
          status: f.status,
          additions: f.additions,
          deletions: f.deletions,
        })) || [],
        total_files: commitData.files?.length || 0,
      });
    }

    // Fetch specific files
    const fileContents = [];
    for (const filePath of file_paths) {
      const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${commit_hash}`;
      const fileRes = await fetch(fileUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!fileRes.ok) {
        fileContents.push({
          path: filePath,
          error: `Failed to fetch: ${fileRes.status}`,
        });
        continue;
      }

      const fileData = await fileRes.json();
      
      // Decode base64 content
      const decoder = new TextDecoder();
      const binaryString = atob(fileData.content.replace(/\s/g, ''));
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const content = decoder.decode(bytes);

      fileContents.push({
        path: filePath,
        content: content,
        sha: fileData.sha,
        size: fileData.size,
      });
    }

    return Response.json({
      success: true,
      commit_hash,
      files: fileContents,
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});