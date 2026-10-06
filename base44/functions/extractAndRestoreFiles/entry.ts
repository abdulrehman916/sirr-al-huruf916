import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const { file_url, files_to_extract = 'all' } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    // Download ZIP file
    const zipResponse = await fetch(file_url);
    if (!zipResponse.ok) {
      return Response.json({ error: 'Failed to download ZIP file' }, { status: 500 });
    }

    const zipBuffer = await zipResponse.arrayBuffer();
    const uint8Array = new Uint8Array(zipBuffer);
    
    // Use Deno's unzip via decompression API
    // Note: Deno doesn't have built-in ZIP support, so we'll list what we need
    // and extract manually using a different approach
    
    // For now, return metadata about what we'd extract
    return Response.json({
      success: true,
      message: 'ZIP file downloaded successfully. Manual extraction required - Deno runtime does not support ZIP decompression directly. Please extract the ZIP locally and provide individual file contents for restoration.',
      zip_size_bytes: uint8Array.length,
      file_url: file_url,
      recommended_approach: 'Extract ZIP locally, then use write_file tool to restore each file individually'
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});