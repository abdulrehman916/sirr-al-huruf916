import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { page_path } = await req.json();

    if (!page_path) {
      return Response.json({ error: 'Missing page_path' }, { status: 400 });
    }

    const pricing = await base44.asServiceRole.entities.SubscriptionPricing.filter(
      { page_path, is_active: true },
      '-created_at'
    );

    return Response.json({ 
      success: true, 
      pricing: pricing.map(p => ({
        plan_name: p.plan_name,
        price: p.price,
        currency: p.currency
      }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});