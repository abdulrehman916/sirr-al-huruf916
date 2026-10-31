import { paymentHandlers } from '../../server/payments/index.js';

export const maxDuration = 20;
export function POST(request) {
  return paymentHandlers().verifyPayment(request);
}
