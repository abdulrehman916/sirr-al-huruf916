import { readPaymentConfig } from '../../server/payments/razorpay.js';
import { readDatabaseConfig } from '../../server/payments/database.js';

// Setup check for the owner: says which settings are present. Never returns values.
export function GET() {
  const payment = readPaymentConfig();
  const database = readDatabaseConfig();
  return new Response(JSON.stringify({
    razorpay_key_id: payment.keyId ? payment.mode : 'missing',
    razorpay_key_secret: Boolean(payment.keySecret),
    razorpay_webhook_secret: Boolean(payment.webhookSecret),
    supabase_url: Boolean(database.url),
    supabase_service_role_key: Boolean(database.serviceKey),
    ready: payment.ready && database.ready,
    problems: [...payment.problems, ...(database.ready ? [] : ['SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'])],
  }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
