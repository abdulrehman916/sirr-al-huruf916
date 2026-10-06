import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { page_path, page_name, pricing_updates } = await req.json();

    if (!page_path || !pricing_updates || !Array.isArray(pricing_updates)) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const results = [];

    for (const update of pricing_updates) {
      const { plan_name, price, currency = 'AED', is_active = true } = update;

      if (!plan_name || typeof price !== 'number') {
        results.push({ plan_name, success: false, error: 'Invalid data' });
        continue;
      }

      const existing = await base44.asServiceRole.entities.SubscriptionPricing.filter({
        page_path,
        plan_name
      });

      if (existing.length > 0) {
        await base44.asServiceRole.entities.SubscriptionPricing.update(existing[0].id, {
          price,
          currency,
          is_active,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        });
        results.push({ plan_name, success: true, action: 'updated' });
      } else {
        const pricing_id = `PRICE-${String(Date.now()).slice(-6)}`;
        await base44.asServiceRole.entities.SubscriptionPricing.create({
          pricing_id,
          page_path,
          page_name,
          plan_name,
          price,
          currency,
          is_active,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_by: user.id,
          updated_at: new Date().toISOString()
        });
        results.push({ plan_name, success: true, action: 'created' });
      }
    }

    return Response.json({ 
      success: true, 
      message: 'Pricing updated successfully',
      results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});