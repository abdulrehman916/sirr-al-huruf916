import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { batch } = await req.json();
    if (!batch || !Array.isArray(batch)) {
      return Response.json({ error: 'batch array required' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const item of batch) {
      try {
        const existing = await base44.entities.HolyOneName.filter({ name_id: item.name_id });
        if (existing && existing.length > 0) {
          results.push({ name_id: item.name_id, status: 'skipped_exists' });
          continue;
        }
        await base44.entities.HolyOneName.create(item);
        results.push({ name_id: item.name_id, arabic_name: item.arabic_name, status: 'created' });
      } catch (err) {
        errors.push({ name_id: item.name_id, error: err.message });
      }
    }

    return Response.json({
      success: true,
      created: results.filter(r => r.status === 'created').length,
      skipped: results.filter(r => r.status === 'skipped_exists').length,
      errors: errors.length,
      details: results,
      error_details: errors
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});