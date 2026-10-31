// Unit tests for the Razorpay server handlers and browser helpers (no network).
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { build } from 'esbuild';
import { createPaymentHandlers } from '../server/payments/handlers.js';
import {
  readPaymentConfig, verifyCheckoutSignature, verifyWebhookSignature, createRazorpayClient,
} from '../server/payments/razorpay.js';
import { dbCode } from '../server/payments/database.js';

const SECRET = 'test_key_secret';
const WEBHOOK = 'test_webhook_secret';
const USER = { id: '11111111-1111-4111-8111-111111111111', email: 'a@example.com' };
const OTHER = { id: '22222222-2222-4222-8222-222222222222', email: 'b@example.com' };
const RESOURCE = '33333333-3333-4333-8333-333333333333';
const sign = (secret, text) => createHmac('sha256', secret).update(text).digest('hex');
const silent = { error() {}, warn() {} };

// ── Config: test keys only unless live is explicitly allowed ────────────────
assert.equal(readPaymentConfig({ RAZORPAY_KEY_ID: 'rzp_test_x', RAZORPAY_KEY_SECRET: 's' }).ready, true);
assert.equal(readPaymentConfig({ RAZORPAY_KEY_ID: 'rzp_live_x', RAZORPAY_KEY_SECRET: 's' }).ready, false, 'live keys blocked');
assert.equal(readPaymentConfig({ RAZORPAY_KEY_ID: 'rzp_live_x', RAZORPAY_KEY_SECRET: 's', RAZORPAY_ALLOW_LIVE: 'true' }).ready, true);
assert.equal(readPaymentConfig({}).ready, false, 'missing keys');
assert.equal(readPaymentConfig({ RAZORPAY_KEY_ID: 'abc', RAZORPAY_KEY_SECRET: 's' }).ready, false, 'unknown key format');

// ── Signatures ──────────────────────────────────────────────────────────────
const good = sign(SECRET, 'order_ABC123|pay_DEF456');
assert.ok(verifyCheckoutSignature({ orderId: 'order_ABC123', paymentId: 'pay_DEF456', signature: good, keySecret: SECRET }));
assert.ok(!verifyCheckoutSignature({ orderId: 'order_ABC123', paymentId: 'pay_OTHER1', signature: good, keySecret: SECRET }), 'payment swap rejected');
assert.ok(!verifyCheckoutSignature({ orderId: 'order_ABC123', paymentId: 'pay_DEF456', signature: good.slice(0, -1), keySecret: SECRET }), 'short signature');
assert.ok(!verifyCheckoutSignature({ orderId: 'order_ABC123', paymentId: 'pay_DEF456', signature: 'zz', keySecret: SECRET }), 'non-hex');
assert.ok(verifyWebhookSignature({ rawBody: '{"a":1}', signature: sign(WEBHOOK, '{"a":1}'), webhookSecret: WEBHOOK }));
assert.ok(!verifyWebhookSignature({ rawBody: '{"a":2}', signature: sign(WEBHOOK, '{"a":1}'), webhookSecret: WEBHOOK }), 'tampered body');
assert.equal(dbCode({ message: 'NOT_FOR_SALE' }), 'NOT_FOR_SALE');
assert.equal(dbCode({ message: 'permission denied for function x' }), 'DATABASE_ERROR');

// ── In-memory ledger that mirrors the SQL rules (idempotent, per-user) ──────
function fakeWorld({ price = 49900, paymentStatus = 'captured' } = {}) {
  const calls = { razorpayOrders: 0, captures: 0, markPaid: 0 };
  const orders = new Map(); // provider order id -> order
  const pendingByUser = new Map();
  const entitlements = [];
  let seq = 0;
  const payments = new Map();
  const db = {
    async getUser(token) { return token === 'tok-a' ? USER : token === 'tok-b' ? OTHER : null; },
    async createOrder(userId, resourceId) {
      if (resourceId !== RESOURCE) throw Object.assign(new Error('NOT_FOR_SALE'), { code: 'NOT_FOR_SALE' });
      const reuse = pendingByUser.get(userId);
      if (reuse?.provider_order_id && reuse.status === 'PENDING') return { ...reuse, reused: true };
      const order = { order_id: `00000000-0000-4000-8000-${String(++seq).padStart(12, '0')}`, provider_order_id: null,
        amount_minor: price, currency: 'INR', email: USER.email, user_id: userId, status: 'PENDING', title: { ml: 'Page' } };
      pendingByUser.set(userId, order);
      return { ...order };
    },
    async attachProviderOrder(orderId, providerOrderId) {
      const order = [...pendingByUser.values()].find(o => o.order_id === orderId);
      order.provider_order_id = providerOrderId;
      orders.set(providerOrderId, order);
    },
    async markPaid({ providerOrderId, providerPaymentId, amount, currency, expectedUserId }) {
      calls.markPaid++;
      const order = orders.get(providerOrderId);
      if (!order) throw Object.assign(new Error('ORDER_NOT_FOUND'), { code: 'ORDER_NOT_FOUND' });
      if (expectedUserId && order.user_id !== expectedUserId) throw Object.assign(new Error('ORDER_USER_MISMATCH'), { code: 'ORDER_USER_MISMATCH' });
      if (order.status === 'PAID') return { already_paid: true, expires_at: order.expires_at };
      if (amount !== order.amount_minor || currency.toUpperCase() !== 'INR') throw Object.assign(new Error('AMOUNT_MISMATCH'), { code: 'AMOUNT_MISMATCH' });
      order.status = 'PAID';
      order.payment_id = providerPaymentId;
      order.expires_at = new Date(Date.now() + 30 * 86400000).toISOString();
      entitlements.push({ user_id: order.user_id, order: providerOrderId });
      return { already_paid: false, expires_at: order.expires_at };
    },
    async markFailed(providerOrderId, reason) { const o = orders.get(providerOrderId); if (o) o.failure = reason; },
    async markRefunded(paymentId) { const o = [...orders.values()].find(x => x.payment_id === paymentId); if (o) o.status = 'REFUNDED'; },
    events: new Set(),
    async recordEvent({ eventId }) { const isNew = !this.events.has(eventId); this.events.add(eventId); return isNew; },
  };
  const razorpay = {
    async createOrder({ amount, currency, receipt }) {
      calls.razorpayOrders++;
      assert.equal(currency, 'INR');
      const id = `order_RZP${String(calls.razorpayOrders).padStart(6, '0')}`;
      payments.set(id, { amount, receipt });
      return { id, amount, currency };
    },
    async fetchPayment(id) {
      const orderId = id.replace('pay_', 'order_');
      return { id, order_id: orderId, amount: payments.get(orderId)?.amount ?? price, currency: 'INR', status: paymentStatus };
    },
    async capturePayment(id, amount, currency) { calls.captures++; return { id, order_id: id.replace('pay_', 'order_'), amount, currency, status: 'captured' }; },
  };
  const config = { ready: true, keyId: 'rzp_test_key', keySecret: SECRET, webhookSecret: WEBHOOK, mode: 'test' };
  return { calls, orders, entitlements, db, razorpay, handlers: createPaymentHandlers({ config, db, razorpay, log: silent }) };
}

const post = (path, body, token, headers = {}) => new Request(`https://site.test/api/payments/${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});
const read = async (response) => ({ status: response.status, body: await response.json() });

// ── create-order ────────────────────────────────────────────────────────────
{
  const w = fakeWorld();
  assert.equal((await read(await w.handlers.createOrder(post('create-order', { resource_id: RESOURCE })))).status, 401, 'login required');
  assert.equal((await read(await w.handlers.createOrder(post('create-order', { resource_id: 'x' }, 'tok-a')))).status, 400, 'uuid required');
  assert.equal((await read(await w.handlers.createOrder(post('create-order', '[1]', 'tok-a')))).status, 400, 'object body');
  const ignoredPrice = await read(await w.handlers.createOrder(post('create-order', { resource_id: RESOURCE, amount: 1 }, 'tok-a')));
  assert.equal(ignoredPrice.status, 200);
  assert.equal(ignoredPrice.body.amount, 49900, 'browser amount is ignored');
  assert.equal(ignoredPrice.body.key_id, 'rzp_test_key');
  assert.equal(ignoredPrice.body.mode, 'test');
  assert.ok(!JSON.stringify(ignoredPrice.body).includes(SECRET), 'secret never leaves the server');
  const again = await read(await w.handlers.createOrder(post('create-order', { resource_id: RESOURCE }, 'tok-a')));
  assert.equal(again.body.razorpay_order_id, ignoredPrice.body.razorpay_order_id, 'double click reuses order');
  assert.equal(w.calls.razorpayOrders, 1);
  const notForSale = await read(await w.handlers.createOrder(post('create-order', { resource_id: '44444444-4444-4444-8444-444444444444' }, 'tok-a')));
  assert.equal(notForSale.status, 409);
  assert.equal(notForSale.body.code, 'NOT_FOR_SALE');
  const off = createPaymentHandlers({ config: { ready: false }, db: w.db, razorpay: w.razorpay, log: silent });
  assert.equal((await off.createOrder(post('create-order', { resource_id: RESOURCE }, 'tok-a'))).status, 503, 'unconfigured is safe');
}

// ── verify ──────────────────────────────────────────────────────────────────
{
  const w = fakeWorld();
  const order = (await read(await w.handlers.createOrder(post('create-order', { resource_id: RESOURCE }, 'tok-a')))).body;
  const orderId = order.razorpay_order_id;
  const paymentId = orderId.replace('order_', 'pay_');
  const body = { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: sign(SECRET, `${orderId}|${paymentId}`) };

  const forged = await read(await w.handlers.verifyPayment(post('verify', { ...body, razorpay_signature: sign('wrong', `${orderId}|${paymentId}`) }, 'tok-a')));
  assert.equal(forged.status, 400);
  assert.equal(w.calls.markPaid, 0, 'forged signature never reaches the database');
  assert.equal(w.entitlements.length, 0);

  const stranger = await read(await w.handlers.verifyPayment(post('verify', body, 'tok-b')));
  assert.equal(stranger.body.code, 'ORDER_USER_MISMATCH', 'someone else cannot claim this payment');
  assert.equal(w.entitlements.length, 0);

  const ok = await read(await w.handlers.verifyPayment(post('verify', body, 'tok-a')));
  assert.equal(ok.status, 200);
  assert.equal(ok.body.success, true);
  assert.ok(ok.body.expires_at);
  const repeat = await read(await w.handlers.verifyPayment(post('verify', body, 'tok-a')));
  assert.equal(repeat.body.already_paid, true);
  assert.equal(w.entitlements.length, 1, 'repeat verify is idempotent');
}
{
  const w = fakeWorld({ paymentStatus: 'authorized' });
  const order = (await read(await w.handlers.createOrder(post('create-order', { resource_id: RESOURCE }, 'tok-a')))).body;
  const paymentId = order.razorpay_order_id.replace('order_', 'pay_');
  const ok = await read(await w.handlers.verifyPayment(post('verify', {
    razorpay_order_id: order.razorpay_order_id, razorpay_payment_id: paymentId,
    razorpay_signature: sign(SECRET, `${order.razorpay_order_id}|${paymentId}`),
  }, 'tok-a')));
  assert.equal(ok.status, 200);
  assert.equal(w.calls.captures, 1, 'authorized payment is captured before access');
}
{
  const w = fakeWorld({ paymentStatus: 'created' });
  const order = (await read(await w.handlers.createOrder(post('create-order', { resource_id: RESOURCE }, 'tok-a')))).body;
  const paymentId = order.razorpay_order_id.replace('order_', 'pay_');
  const pending = await read(await w.handlers.verifyPayment(post('verify', {
    razorpay_order_id: order.razorpay_order_id, razorpay_payment_id: paymentId,
    razorpay_signature: sign(SECRET, `${order.razorpay_order_id}|${paymentId}`),
  }, 'tok-a')));
  assert.equal(pending.status, 202);
  assert.equal(w.entitlements.length, 0, 'no access until captured');
}

// ── webhook ─────────────────────────────────────────────────────────────────
{
  const w = fakeWorld();
  const order = (await read(await w.handlers.createOrder(post('create-order', { resource_id: RESOURCE }, 'tok-a')))).body;
  const payment = { id: 'pay_WEBHOOK01', order_id: order.razorpay_order_id, amount: 49900, currency: 'INR', status: 'captured', method: 'upi' };
  const raw = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: payment } }, created_at: 1 });
  const hook = (text, signature = sign(WEBHOOK, text), id = 'evt_1') => w.handlers.webhook(new Request('https://site.test/api/payments/webhook', {
    method: 'POST', headers: { 'x-razorpay-signature': signature, 'x-razorpay-event-id': id }, body: text,
  }));

  assert.equal((await hook(raw, sign('wrong', raw))).status, 401, 'unsigned webhook rejected');
  assert.equal(w.entitlements.length, 0);
  // Razorpay retries and the browser callback can race; all land on one entitlement.
  const results = await Promise.all(Array.from({ length: 25 }, (_, i) => hook(raw, undefined, `evt_${i % 3}`)));
  assert.ok(results.every(r => r.status === 200));
  assert.equal(w.entitlements.length, 1, 'concurrent deliveries grant once');

  const foreign = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { ...payment, order_id: 'order_OTHERAPP1' } } } });
  assert.equal((await hook(foreign)).status, 200, 'other apps on the account are ignored, not retried forever');

  const tampered = JSON.stringify({ event: 'order.paid', payload: { payment: { entity: { ...payment, id: 'pay_X0000001', amount: 100 } }, order: { entity: { id: payment.order_id } } } });
  assert.equal((await hook(tampered)).status, 200);
  assert.equal(w.entitlements.length, 1);

  const partial = JSON.stringify({ event: 'refund.processed', payload: { refund: { entity: { payment_id: 'pay_WEBHOOK01', amount: 100 } }, payment: { entity: { ...payment, amount_refunded: 100 } } } });
  await hook(partial);
  assert.equal(w.orders.get(payment.order_id).status, 'PAID', 'partial refund keeps access');
  const full = JSON.stringify({ event: 'refund.processed', payload: { refund: { entity: { payment_id: 'pay_WEBHOOK01', amount: 49900 } }, payment: { entity: { ...payment, amount_refunded: 49900 } } } });
  await hook(full);
  assert.equal(w.orders.get(payment.order_id).status, 'REFUNDED', 'full refund revokes access');

  const failingDb = { ...w.db, markPaid: async () => { throw Object.assign(new Error('timeout'), { code: 'DATABASE_ERROR' }); } };
  const flaky = createPaymentHandlers({ config: { ready: true, keySecret: SECRET, webhookSecret: WEBHOOK }, db: failingDb, razorpay: w.razorpay, log: silent });
  const retry = await flaky.webhook(new Request('https://site.test/x', { method: 'POST', headers: { 'x-razorpay-signature': sign(WEBHOOK, raw) }, body: raw }));
  assert.equal(retry.status, 500, 'temporary database failure asks Razorpay to retry');
}

// ── Razorpay REST client builds authenticated requests ──────────────────────
{
  const seen = [];
  const client = createRazorpayClient({ keyId: 'rzp_test_k', keySecret: 's', fetchImpl: async (url, init) => {
    seen.push({ url, init });
    return new Response(JSON.stringify({ id: 'order_NEW000001' }), { status: 200 });
  } });
  await client.createOrder({ amount: 100, currency: 'INR', receipt: 'r', notes: {} });
  assert.equal(seen[0].url, 'https://api.razorpay.com/v1/orders');
  assert.equal(seen[0].init.headers.Authorization, `Basic ${Buffer.from('rzp_test_k:s').toString('base64')}`);
  const failing = createRazorpayClient({ keyId: 'k', keySecret: 's', fetchImpl: async () => new Response('{"error":{"description":"bad"}}', { status: 400 }) });
  await assert.rejects(() => failing.fetchPayment('pay_1'), /bad/);
}

// ── Browser helpers (bundled with the app's @ alias) ────────────────────────
const bundle = async (entry) => {
  const out = await build({ entryPoints: [entry], bundle: true, write: false, platform: 'node', format: 'esm',
    alias: { '@': new URL('../src', import.meta.url).pathname }, loader: { '.jsx': 'jsx' }, jsx: 'automatic',
    define: { 'import.meta.env.VITE_SUPABASE_URL': '""', 'import.meta.env.VITE_SUPABASE_ANON_KEY': '""' } });
  return import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`);
};
const checkout = await bundle('src/lib/razorpayCheckout.js');
assert.equal(checkout.describeValidity({ lifetime_access: true }), 'Lifetime access');
assert.match(checkout.describeValidity({ validity_days: 30 }), /^1 മാസം/);
assert.match(checkout.describeValidity({ validity_days: 365 }), /^1 വർഷം/);
assert.match(checkout.describeValidity({ validity_days: 7 }), /^7 ദിവസം/);
{
  let tries = 0;
  const result = await checkout.verifyWithRetry({}, { delay: async () => {}, call: async () => {
    tries++;
    if (tries < 3) throw Object.assign(new Error('pending'), { code: 'PAYMENT_PENDING', status: 202 });
    return { success: true };
  } });
  assert.equal(result.success, true);
  assert.equal(tries, 3, 'slow confirmation is retried');
  tries = 0;
  await assert.rejects(() => checkout.verifyWithRetry({}, { delay: async () => {}, call: async () => {
    tries++; throw Object.assign(new Error('forged'), { code: 'BAD_SIGNATURE', status: 400 });
  } }), /forged/);
  assert.equal(tries, 1, 'a rejected signature is not retried');
}
const upi = await bundle('src/lib/upiPayment.js');
{
  const link = upi.buildUpiLink({ upiId: 'owner.name@okaxis', payeeName: 'Sirr al-Huruf', amountMinor: 29950, note: 'Faal Hasrath' });
  const params = new URL(link.replace('upi://pay', 'https://x/pay')).searchParams;
  assert.ok(link.startsWith('upi://pay?'));
  assert.equal(params.get('pa'), 'owner.name@okaxis');
  assert.equal(params.get('am'), '299.50', 'amount in rupees with paise');
  assert.equal(params.get('cu'), 'INR');
  assert.equal(params.get('pn'), 'Sirr al-Huruf');
  assert.ok(!link.includes('+'), 'spaces encoded for UPI apps');
  assert.equal(upi.normalizeUtr('4123 4567 8901'), '412345678901');
  assert.equal(upi.normalizeUtr('41234567890'), null, '11 digits refused');
  assert.equal(upi.normalizeUtr('41234567890a'), null, 'letters refused');
  assert.match(upi.upiErrorMessage({ message: 'UTR_ALREADY_USED' }), /ഇതിനകം ഉപയോഗിച്ചിട്ടുണ്ട്/);
}
const access = await bundle('src/lib/unifiedAccess.js');
assert.deepEqual(access.priceLookupPaths('/plants/:id'), ['/plants/:id', '/plants']);
assert.deepEqual(access.priceLookupPaths('/mizaan9'), ['/mizaan9']);
assert.equal(access.formatResourcePrice({ price_minor: 49900, currency: 'INR' }), '₹499');
assert.equal(access.formatResourcePrice({ price_minor: 49950, currency: 'INR' }), '₹499.50');

console.log('PASS: Razorpay handlers — test-key guard, signatures, server price, user binding, capture, idempotent webhook, refunds, retries.');
