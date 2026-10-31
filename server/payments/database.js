// Server-side Supabase access for payments (service role, never sent to browsers).
import { createClient } from '@supabase/supabase-js';

export function readDatabaseConfig(env = process.env) {
  const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim();
  const serviceKey = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  return { url, serviceKey, ready: Boolean(url && serviceKey) };
}

/** Database error messages raised by payment_* SQL functions, e.g. 'NOT_FOR_SALE'. */
export const dbCode = (error) => {
  const message = String(error?.message || '');
  const match = message.match(/\b[A-Z][A-Z_]{3,}\b/);
  return match ? match[0] : 'DATABASE_ERROR';
};

export function createPaymentDatabase({ url, serviceKey }) {
  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const rpc = async (name, args) => {
    const { data, error } = await db.rpc(name, args);
    if (error) {
      const wrapped = new Error(error.message);
      wrapped.code = dbCode(error);
      throw wrapped;
    }
    return data;
  };
  return {
    async getUser(token) {
      const { data, error } = await db.auth.getUser(token);
      if (error || !data?.user) return null;
      return { id: data.user.id, email: data.user.email || '' };
    },
    createOrder: (userId, resourceId) => rpc('payment_create_order', { p_user_id: userId, p_resource_id: resourceId }),
    attachProviderOrder: (orderId, providerOrderId) =>
      rpc('payment_attach_provider_order', { p_order_id: orderId, p_provider_order_id: providerOrderId }),
    markPaid: ({ providerOrderId, providerPaymentId, amount, currency, expectedUserId = null }) =>
      rpc('payment_mark_paid', {
        p_provider_order_id: providerOrderId, p_provider_payment_id: providerPaymentId,
        p_amount_minor: amount, p_currency: currency, p_expected_user_id: expectedUserId,
      }),
    markFailed: (providerOrderId, reason) =>
      rpc('payment_mark_failed', { p_provider_order_id: providerOrderId, p_reason: reason }),
    markRefunded: (providerPaymentId) => rpc('payment_mark_refunded', { p_provider_payment_id: providerPaymentId }),
    recordEvent: ({ eventId, eventType, providerOrderId, providerPaymentId, payload }) =>
      rpc('payment_record_event', {
        p_event_id: eventId, p_event_type: eventType, p_provider_order_id: providerOrderId,
        p_provider_payment_id: providerPaymentId, p_payload: payload,
      }),
  };
}
