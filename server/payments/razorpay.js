// Razorpay helpers used only by server functions. Never import from src/.
import { createHmac, timingSafeEqual } from 'node:crypto';

const API = 'https://api.razorpay.com/v1';

export function readPaymentConfig(env = process.env) {
  const keyId = (env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (env.RAZORPAY_KEY_SECRET || '').trim();
  const webhookSecret = (env.RAZORPAY_WEBHOOK_SECRET || '').trim();
  const mode = keyId.startsWith('rzp_live_') ? 'live' : keyId.startsWith('rzp_test_') ? 'test' : 'unknown';
  const liveAllowed = env.RAZORPAY_ALLOW_LIVE === 'true';
  const problems = [];
  if (!keyId || !keySecret) problems.push('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required');
  if (mode === 'unknown' && keyId) problems.push('RAZORPAY_KEY_ID must start with rzp_test_ or rzp_live_');
  if (mode === 'live' && !liveAllowed) problems.push('Live keys are blocked until RAZORPAY_ALLOW_LIVE=true');
  return { keyId, keySecret, webhookSecret, mode, ready: problems.length === 0, problems };
}

const hmacHex = (secret, payload) => createHmac('sha256', secret).update(payload).digest('hex');

export function safeEqualHex(expected, received) {
  if (typeof expected !== 'string' || typeof received !== 'string') return false;
  if (!/^[a-f0-9]+$/i.test(received) || expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received.toLowerCase(), 'hex'));
}

/** Checkout success callback: HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
export function verifyCheckoutSignature({ orderId, paymentId, signature, keySecret }) {
  if (!orderId || !paymentId || !signature || !keySecret) return false;
  return safeEqualHex(hmacHex(keySecret, `${orderId}|${paymentId}`), signature);
}

/** Webhook: HMAC_SHA256(raw request body, webhook_secret). */
export function verifyWebhookSignature({ rawBody, signature, webhookSecret }) {
  if (typeof rawBody !== 'string' || !signature || !webhookSecret) return false;
  return safeEqualHex(hmacHex(webhookSecret, rawBody), signature);
}

export function createRazorpayClient({ keyId, keySecret, fetchImpl = fetch, timeoutMs = 10000 }) {
  const authorization = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
  const call = async (method, path, body) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(`${API}${path}`, {
        method,
        headers: { Authorization: authorization, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(data?.error?.description || `Razorpay ${response.status}`);
        error.status = response.status;
        error.code = 'RAZORPAY_ERROR';
        throw error;
      }
      return data;
    } finally {
      clearTimeout(timer);
    }
  };
  return {
    createOrder: ({ amount, currency, receipt, notes }) =>
      call('POST', '/orders', { amount, currency, receipt, notes, payment_capture: 1 }),
    fetchPayment: (paymentId) => call('GET', `/payments/${encodeURIComponent(paymentId)}`),
    capturePayment: (paymentId, amount, currency) =>
      call('POST', `/payments/${encodeURIComponent(paymentId)}/capture`, { amount, currency }),
  };
}
