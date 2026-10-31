import { paymentHandlers } from '../../server/payments/index.js';

// Razorpay calls this URL directly. The raw body is verified with the webhook secret.
export const maxDuration = 20;
export function POST(request) {
  return paymentHandlers().webhook(request);
}
