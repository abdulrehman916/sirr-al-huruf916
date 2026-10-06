import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { subscription_id, days_to_add, action } = await req.json();

    const subscription = await base44.entities.Subscription.get(subscription_id);

    if (!subscription) {
       return new Response(JSON.stringify({ error: 'Subscription not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    let updateData = {};

    if (action === 'cancel') {
      updateData.status = 'CANCELLED';
    } else {
      const currentExpiry = new Date(subscription.expiry_date);
      const newExpiry = new Date(currentExpiry.getTime() + (days_to_add * 24 * 60 * 60 * 1000));
      updateData.expiry_date = newExpiry.toISOString();
    }
    
    updateData.last_modified_by = user.id;
    updateData.last_modified_at = new Date().toISOString();

    const updatedSubscription = await base44.entities.Subscription.update(subscription_id, updateData);

    return new Response(JSON.stringify(updatedSubscription), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});