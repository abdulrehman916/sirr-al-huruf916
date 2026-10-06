import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Generate a cryptographically secure Reading Code.
 * Uses Deno's crypto.getRandomValues() for CSPRNG.
 * 
 * Input:  { code_length?: number, prefix?: string, expiry_days?: number }
 * Output: { code, expires_at, code_id }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const { code_length = 8, prefix = '', expiry_days = 365 } = await req.json();

    // Generate cryptographically secure random string
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous I, O, 1, 0
    const randomBytes = new Uint8Array(code_length);
    crypto.getRandomValues(randomBytes);
    
    let code = prefix.toUpperCase();
    for (let i = 0; i < code_length; i++) {
      code += chars[randomBytes[i] % chars.length];
    }

    // Verify uniqueness
    const existing = await base44.asServiceRole.entities.AccessCode.filter({ code }, null, 1);
    if (existing && existing.length > 0) {
      // Collision (extremely rare) - regenerate
      return Response.json({ error: 'Collision detected, retry' }, { status: 500 });
    }

    const expires_at = expiry_days > 0 
      ? new Date(Date.now() + expiry_days * 86400000).toISOString()
      : null;

    return Response.json({
      code,
      expires_at,
      code_length: code.length,
      generated_at: new Date().toISOString(),
      generated_by: user.id
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});