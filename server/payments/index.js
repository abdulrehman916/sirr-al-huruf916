// Builds the payment handlers from environment variables (Vercel encrypted env).
import { createPaymentHandlers } from './handlers.js';
import { createRazorpayClient, readPaymentConfig } from './razorpay.js';
import { createPaymentDatabase, readDatabaseConfig } from './database.js';

let cached;
export function paymentHandlers(env = process.env) {
  if (cached) return cached;
  const payment = readPaymentConfig(env);
  const database = readDatabaseConfig(env);
  const config = { ...payment, ready: payment.ready && database.ready };
  if (!config.ready) console.error('Payments not configured:', [...payment.problems, ...(database.ready ? [] : ['SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'])].join('; '));
  const db = database.ready ? createPaymentDatabase(database) : null;
  const razorpay = payment.keyId && payment.keySecret ? createRazorpayClient(payment) : null;
  cached = createPaymentHandlers({ config: { ...config, webhookSecret: database.ready ? payment.webhookSecret : '' }, db, razorpay });
  return cached;
}
