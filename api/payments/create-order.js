import { paymentHandlers } from '../../server/payments/index.js';

export const maxDuration = 15;
export function POST(request) {
  return paymentHandlers().createOrder(request);
}
