import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { email, phone, full_name, notes } = await req.json();

    if (!email || !email.trim()) {
      return Response.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await base44.entities.ApprovedUser.filter({ email: normalizedEmail });
    if (existing && existing.length > 0) {
      return Response.json({ 
        success: false, 
        error: 'User with this email already exists',
        user_id: existing[0].id
      }, { status: 409 });
    }

    // Create approved user
    const now = new Date().toISOString();
    const approvedUser = await base44.entities.ApprovedUser.create({
      email: normalizedEmail,
      phone: phone?.trim() || '',
      full_name: full_name?.trim() || '',
      status: 'ACTIVE',
      approved_by: user.id,
      approved_at: now,
      notes: notes || '',
      login_count: 0
    });

    return Response.json({
      success: true,
      message: 'User approved successfully',
      user: approvedUser
    });
  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});