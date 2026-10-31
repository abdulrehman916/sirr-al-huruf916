// Payment request handlers (Web Request -> Response). Dependencies are injected
// so the whole flow is unit-tested without network access.
import { createHash } from 'node:crypto';
import { verifyCheckoutSignature, verifyWebhookSignature } from './razorpay.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RZP_ORDER = /^order_[A-Za-z0-9]{6,40}$/;
const RZP_PAYMENT = /^pay_[A-Za-z0-9]{6,40}$/;

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

// Customer-facing messages are simple Malayalam; codes stay stable for the UI.
const ERRORS = {
  NOT_CONFIGURED: [503, 'Online payment ഇപ്പോൾ ലഭ്യമല്ല. കുറച്ച് കഴിഞ്ഞ് ശ്രമിക്കുക.'],
  SIGN_IN_REQUIRED: [401, 'ആദ്യം email ഉപയോഗിച്ച് login ചെയ്യുക.'],
  BAD_REQUEST: [400, 'അപേക്ഷ ശരിയല്ല. Page refresh ചെയ്ത് വീണ്ടും ശ്രമിക്കുക.'],
  ACCOUNT_INACTIVE: [403, 'ഈ account ഇപ്പോൾ ഉപയോഗിക്കാൻ കഴിയില്ല.'],
  EMAIL_NOT_VERIFIED: [403, 'ആദ്യം നിങ്ങളുടെ email confirm ചെയ്യുക.'],
  NOT_FOR_SALE: [409, 'ഈ page ഇപ്പോൾ online-ൽ വിൽപ്പനയ്ക്കില്ല.'],
  ALREADY_LIFETIME: [409, 'ഈ page നിങ്ങൾക്ക് ഇതിനകം lifetime ആയി തുറന്നിട്ടുണ്ട്.'],
  TOO_MANY_ATTEMPTS: [429, 'ഒരുപാട് ശ്രമങ്ങൾ നടന്നു. ഒരു മണിക്കൂർ കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക.'],
  BAD_SIGNATURE: [400, 'Payment പരിശോധന പരാജയപ്പെട്ടു. പണം പോയിട്ടുണ്ടെങ്കിൽ കുറച്ച് മിനിറ്റിനുള്ളിൽ തനിയെ ശരിയാകും.'],
  PAYMENT_PENDING: [202, 'Payment ഇനിയും പൂർത്തിയായിട്ടില്ല. കുറച്ച് മിനിറ്റിനുള്ളിൽ page തനിയെ തുറക്കും.'],
  ORDER_USER_MISMATCH: [403, 'ഈ payment മറ്റൊരു account-ന്റേതാണ്.'],
  AMOUNT_MISMATCH: [409, 'Payment തുക ശരിയല്ല. Support-നെ ബന്ധപ്പെടുക.'],
  ORDER_NOT_FOUND: [404, 'Order കണ്ടെത്തിയില്ല.'],
  ORDER_CLOSED: [409, 'ഈ order ഇതിനകം അവസാനിച്ചു.'],
  PROVIDER_ERROR: [502, 'Payment സേവനവുമായി ബന്ധപ്പെടാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.'],
  SERVER_ERROR: [500, 'എന്തോ പിശക് സംഭവിച്ചു. വീണ്ടും ശ്രമിക്കുക.'],
};
const fail = (code, extra = {}) => {
  const [status, message] = ERRORS[code] || ERRORS.SERVER_ERROR;
  return json({ success: false, code: ERRORS[code] ? code : 'SERVER_ERROR', message, ...extra }, status);
};

async function readJson(request, maxBytes = 8192) {
  const text = await request.text();
  if (!text || text.length > maxBytes) return null;
  try {
    const body = JSON.parse(text);
    return body && typeof body === 'object' && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}

const bearer = (request) => (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();

export function createPaymentHandlers({ config, db, razorpay, log = console }) {
  const requireUser = async (request) => {
    const token = bearer(request);
    if (!token || token.length > 4096) return null;
    return db.getUser(token);
  };

  async function createOrder(request) {
    if (!config.ready) return fail('NOT_CONFIGURED');
    const user = await requireUser(request);
    if (!user) return fail('SIGN_IN_REQUIRED');
    const body = await readJson(request);
    if (!body || !UUID.test(String(body.resource_id || ''))) return fail('BAD_REQUEST');

    let order;
    try {
      order = await db.createOrder(user.id, body.resource_id);
    } catch (error) {
      if (ERRORS[error.code]) return fail(error.code);
      log.error('payment_create_order failed', error.message);
      return fail('SERVER_ERROR');
    }

    let providerOrderId = order.provider_order_id;
    if (!providerOrderId) {
      try {
        const created = await razorpay.createOrder({
          amount: order.amount_minor,
          currency: order.currency,
          receipt: order.order_id,
          notes: { order_id: order.order_id, user_id: user.id, resource_id: body.resource_id },
        });
        providerOrderId = created.id;
        if (!RZP_ORDER.test(String(providerOrderId || ''))) throw new Error('Unexpected Razorpay order id');
        await db.attachProviderOrder(order.order_id, providerOrderId);
      } catch (error) {
        log.error('razorpay order failed', error.message);
        return fail('PROVIDER_ERROR');
      }
    }

    return json({
      success: true,
      key_id: config.keyId,
      mode: config.mode,
      razorpay_order_id: providerOrderId,
      amount: order.amount_minor,
      currency: order.currency,
      email: order.email,
      title: order.title,
      validity_days: order.validity_days,
      lifetime_access: order.lifetime_access,
    });
  }

  async function grantCaptured(payment, { expectedUserId = null } = {}) {
    return db.markPaid({
      providerOrderId: payment.order_id,
      providerPaymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      expectedUserId,
    });
  }

  async function verifyPayment(request) {
    if (!config.ready) return fail('NOT_CONFIGURED');
    const user = await requireUser(request);
    if (!user) return fail('SIGN_IN_REQUIRED');
    const body = await readJson(request);
    const orderId = String(body?.razorpay_order_id || '');
    const paymentId = String(body?.razorpay_payment_id || '');
    const signature = String(body?.razorpay_signature || '');
    if (!RZP_ORDER.test(orderId) || !RZP_PAYMENT.test(paymentId) || !signature) return fail('BAD_REQUEST');
    if (!verifyCheckoutSignature({ orderId, paymentId, signature, keySecret: config.keySecret })) return fail('BAD_SIGNATURE');

    let payment;
    try {
      payment = await razorpay.fetchPayment(paymentId);
      if (payment.order_id !== orderId) return fail('BAD_SIGNATURE');
      if (payment.status === 'authorized') payment = await razorpay.capturePayment(paymentId, payment.amount, payment.currency);
    } catch (error) {
      log.error('razorpay payment lookup failed', error.message);
      return fail('PROVIDER_ERROR');
    }
    if (payment.status !== 'captured') return fail('PAYMENT_PENDING');

    try {
      const result = await grantCaptured(payment, { expectedUserId: user.id });
      return json({ success: true, starts_at: result.starts_at, expires_at: result.expires_at, already_paid: result.already_paid });
    } catch (error) {
      if (ERRORS[error.code]) return fail(error.code);
      log.error('payment_mark_paid failed', error.message);
      return fail('SERVER_ERROR');
    }
  }

  async function webhook(request) {
    if (!config.webhookSecret) return json({ ok: false, error: 'Webhook not configured' }, 503);
    const rawBody = await request.text();
    if (rawBody.length > 1_000_000) return json({ ok: false }, 413);
    const signature = request.headers.get('x-razorpay-signature') || '';
    if (!verifyWebhookSignature({ rawBody, signature, webhookSecret: config.webhookSecret })) {
      return json({ ok: false, error: 'Invalid signature' }, 401);
    }
    let event;
    try { event = JSON.parse(rawBody); } catch { return json({ ok: false }, 400); }

    const type = String(event?.event || '');
    const payment = event?.payload?.payment?.entity || null;
    const order = event?.payload?.order?.entity || null;
    const refund = event?.payload?.refund?.entity || null;
    const providerOrderId = payment?.order_id || order?.id || null;
    const providerPaymentId = payment?.id || refund?.payment_id || null;
    const eventId = request.headers.get('x-razorpay-event-id')
      || createHash('sha256').update(rawBody).digest('hex');

    try {
      if ((type === 'payment.captured' || type === 'order.paid') && payment?.status === 'captured' && payment.order_id) {
        await grantCaptured(payment);
      } else if (type === 'payment.failed' && payment?.order_id) {
        await db.markFailed(payment.order_id, payment.error_description || payment.error_code || 'FAILED');
      } else if (type === 'refund.processed' && refund?.payment_id) {
        const full = payment ? Number(payment.amount_refunded || 0) >= Number(payment.amount || Infinity)
          : false;
        if (full) await db.markRefunded(refund.payment_id);
      }
    } catch (error) {
      // Orders from other apps on the same Razorpay account, or a tampered amount,
      // must not be retried forever. Anything else returns 500 so Razorpay retries.
      if (['ORDER_NOT_FOUND', 'AMOUNT_MISMATCH', 'ORDER_CLOSED'].includes(error.code)) {
        log.warn('webhook ignored', type, error.code);
      } else {
        log.error('webhook processing failed', type, error.message);
        return json({ ok: false }, 500);
      }
    }

    try {
      await db.recordEvent({
        eventId, eventType: type, providerOrderId, providerPaymentId,
        payload: {
          status: payment?.status || order?.status || refund?.status || null,
          amount: payment?.amount ?? order?.amount ?? refund?.amount ?? null,
          currency: payment?.currency || order?.currency || refund?.currency || null,
          method: payment?.method || null,
          created_at: event?.created_at || null,
        },
      });
    } catch (error) {
      log.warn('webhook audit log failed', error.message);
    }
    return json({ ok: true });
  }

  return { createOrder, verifyPayment, webhook };
}
