/**
 * Browser side of the Razorpay purchase. The browser never decides access:
 * it only opens Razorpay Checkout and forwards the result to the server,
 * which checks the signature and the captured payment before granting access.
 */
import { supabase } from '@/api/platformClient';

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
let scriptPromise = null;

export function loadRazorpayScript(doc = document) {
  if (typeof window !== 'undefined' && /** @type {any} */ (window).Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = doc.createElement('script');
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => { scriptPromise = null; reject(new Error('Payment window തുറക്കാൻ കഴിഞ്ഞില്ല. Internet പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.')); };
    doc.head.appendChild(script);
  });
  return scriptPromise;
}

async function accessToken() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw Object.assign(new Error('ആദ്യം email ഉപയോഗിച്ച് login ചെയ്യുക.'), { code: 'SIGN_IN_REQUIRED' });
  return token;
}

export async function callPaymentApi(path, body, { fetchImpl = fetch, token = '' } = {}) {
  const response = await fetchImpl(`/api/payments/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || await accessToken()}` },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw Object.assign(new Error(data.message || 'Payment പൂർത്തിയാക്കാൻ കഴിഞ്ഞില്ല.'),
      { code: data.code || `HTTP_${response.status}`, status: response.status });
  }
  return data;
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/** Retries verification a few times: a slow network must not lose a paid order. */
export async function verifyWithRetry(result, { attempts = 4, call = callPaymentApi, delay = wait } = {}) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await call('verify', result);
    } catch (error) {
      lastError = error;
      const retryable = error.code === 'PAYMENT_PENDING' || error.code === 'PROVIDER_ERROR'
        || error.code === 'SERVER_ERROR' || !error.status || error.status >= 500;
      if (!retryable) break;
      await delay(1500 * (attempt + 1));
    }
  }
  throw lastError;
}

/**
 * Opens Razorpay Checkout for one page resource.
 * Resolves with { success, expires_at } after the server confirms payment,
 * or rejects with code 'DISMISSED' when the customer closes the window.
 */
export async function purchasePage(resource) {
  if (!resource?.id) throw new Error('ഈ page ഇപ്പോൾ വാങ്ങാൻ കഴിയില്ല.');
  const [order] = await Promise.all([
    callPaymentApi('create-order', { resource_id: resource.id }),
    loadRazorpayScript(),
  ]);
  const title = order.title?.ml || order.title?.en || resource.title?.ml || resource.title?.en || 'Premium page';

  const checkoutResult = await new Promise((resolve, reject) => {
    const Razorpay = /** @type {any} */ (window).Razorpay;
    const checkout = new Razorpay({
      key: order.key_id,
      order_id: order.razorpay_order_id,
      amount: order.amount,
      currency: order.currency,
      name: 'Sirr al-Huruf',
      description: title,
      prefill: { email: order.email },
      readonly: { email: true },
      theme: { color: '#C98A14' },
      retry: { enabled: true, max_count: 3 },
      handler: (response) => resolve(response),
      modal: {
        confirm_close: true,
        ondismiss: () => reject(Object.assign(new Error('Payment നിർത്തി.'), { code: 'DISMISSED' })),
      },
    });
    checkout.on('payment.failed', () => { /* Razorpay shows its own retry screen. */ });
    checkout.open();
  });

  return verifyWithRetry({
    razorpay_order_id: checkoutResult.razorpay_order_id,
    razorpay_payment_id: checkoutResult.razorpay_payment_id,
    razorpay_signature: checkoutResult.razorpay_signature,
  });
}

export function describeValidity(resource) {
  if (!resource) return '';
  if (resource.lifetime_access) return 'Lifetime access';
  const days = Number(resource.validity_days || 0);
  if (!days) return '';
  if (days % 365 === 0) return `${days / 365} വർഷം (${days} ദിവസം) access`;
  if (days % 30 === 0) return `${days / 30} മാസം (${days} ദിവസം) access`;
  return `${days} ദിവസം access`;
}
