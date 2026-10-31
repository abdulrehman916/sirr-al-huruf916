// Browser end-to-end check of the owner price page and the customer purchase
// flow, using the real built site, the real payment handlers, a stand-in
// database and a stand-in Razorpay window. No network, no real money.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHmac, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { createPaymentHandlers } from '../server/payments/handlers.js';

const PORT = 4789;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const OUT = 'dist-e2e';
const SECRET = 'e2e_secret';
const OWNER = { id: '00000000-0000-4000-8000-0000000000a0', email: 'owner@example.com', role: 'owner' };
const CUSTOMER = { id: '00000000-0000-4000-8000-0000000000c1', email: 'customer@example.com', role: 'customer' };
const users = { 'tok-owner': OWNER, 'tok-customer': CUSTOMER };
const SHOTS = process.env.E2E_SCREENSHOTS || '';
const shot = async (page, name) => { if (!SHOTS) return; await page.waitForTimeout(4000); await page.evaluate(() => { window.scrollTo(0, 0); document.querySelectorAll('*').forEach(el => { if (el.scrollTop) el.scrollTop = 0; }); }); await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true }); };
const ACCESS_SECONDS = Number(process.env.E2E_ACCESS_SECONDS || 8);

if (!process.env.E2E_SKIP_BUILD || !existsSync(OUT)) {
  execSync(`npx vite build --outDir ${OUT} --emptyOutDir`, {
    stdio: 'ignore',
    env: { ...process.env, VITE_SUPABASE_URL: `${ORIGIN}/sb`, VITE_SUPABASE_ANON_KEY: 'anon-e2e' },
  });
}

// ── In-memory stand-in for the database ─────────────────────────────────────
const state = { resources: [], orders: [], entitlements: [], rpcCalls: [], razorpayReady: true, settings: { upi_enabled: false, upi_id: null, payee_name: null } };
const now = () => new Date().toISOString();
const activeEnt = (userId, resourceId) => state.entitlements.find(e => e.user_id === userId
  && e.resource_id === resourceId && !e.revoked_at && (!e.expires_at || new Date(e.expires_at) > new Date()));
const resourceFor = (path) => state.resources.find(r => r.status === 'PUBLISHED' && r.metadata.route_path === path);

const rpc = {
  owner_page_prices: (user) => user.role === 'owner' ? state.resources.map(r => ({
    resource_id: r.id, route_path: r.metadata.route_path, title: r.title, on_sale: r.status === 'PUBLISHED',
    price_minor: r.price_minor, currency: r.currency, validity_days: r.validity_days, lifetime_access: r.lifetime_access, updated_at: r.updated_at,
  })) : [],
  owner_set_page_price: (user, { p_payload: p }) => {
    if (user.role !== 'owner') throw new Error('Owner access required');
    let r = state.resources.find(x => x.metadata.route_path === p.route_path);
    if (!r) { r = { id: randomUUID(), resource_type: 'PAGE', access_mode: 'PAID', currency: 'INR', title: { ml: p.title, en: p.title }, metadata: { route_path: p.route_path }, owner_id: user.id }; state.resources.push(r); }
    Object.assign(r, { status: p.on_sale ? 'PUBLISHED' : 'ARCHIVED', price_minor: p.price_minor ?? r.price_minor,
      validity_days: p.lifetime_access ? null : p.validity_days, lifetime_access: p.lifetime_access, updated_at: now() });
    return { success: true, resource_id: r.id, on_sale: r.status === 'PUBLISHED' };
  },
  owner_payment_orders: (_u, { p_payload: p = {} }) => ({ orders: state.orders
    .filter(o => (p.provider ? o.provider === p.provider : true) && o.status === (p.status || 'PAID'))
    .map(o => { const r = state.resources.find(x => x.id === o.resource_id); return { ...o, page_title: r.title, route_path: r.metadata.route_path, validity_days: r.validity_days, currency: 'INR' }; }) }),
  payment_options: () => ({ upi_enabled: state.settings.upi_enabled, upi_id: state.settings.upi_enabled ? state.settings.upi_id : null, payee_name: state.settings.payee_name }),
  owner_payment_settings: (user, { p_payload: p }) => {
    if (user.role !== 'owner') throw new Error('Owner access required');
    if (p) {
      if (p.upi_id && !/^[a-z0-9._-]{2,64}@[a-z0-9.-]{2,64}$/.test(p.upi_id.toLowerCase())) throw new Error('Invalid UPI ID');
      state.settings = { upi_enabled: p.upi_enabled, upi_id: p.upi_id.toLowerCase(), payee_name: p.payee_name };
    }
    return state.settings;
  },
  upi_submit_payment: (user, { p_resource_id, p_utr }) => {
    if (!/^[0-9]{12}$/.test(p_utr)) throw new Error('INVALID_UTR');
    if (state.orders.some(o => o.provider_payment_id === p_utr)) throw new Error('UTR_ALREADY_USED');
    const r = state.resources.find(x => x.id === p_resource_id);
    const o = { id: randomUUID(), provider: 'upi', user_id: user.id, resource_id: r.id, status: 'PENDING', total_minor: r.price_minor, created_at: now(), customer_email: user.email, provider_payment_id: p_utr };
    state.orders.push(o);
    return { success: true, order_id: o.id, status: 'PENDING' };
  },
  owner_upi_decide: (user, { p_order_id, p_approve }) => {
    if (user.role !== 'owner') throw new Error('Owner access required');
    const o = state.orders.find(x => x.id === p_order_id);
    if (!p_approve) { o.status = 'FAILED'; return { status: 'FAILED' }; }
    o.status = 'PAID'; o.paid_at = now();
    state.entitlements.push({ order_id: o.id, user_id: o.user_id, resource_id: o.resource_id, starts_at: now(), expires_at: new Date(Date.now() + 86400000).toISOString(), revoked_at: null });
    return { status: 'PAID' };
  },
  page_visibility: () => ({}),
  can_access_resource: (user, { target }) => user?.role === 'owner' || Boolean(activeEnt(user?.id, target)),
  can_access_legacy_page: (user, { p_path }) => Boolean(resourceFor(p_path) && activeEnt(user?.id, resourceFor(p_path).id)),
  legacy_permission_grants: () => [],
  my_page_purchases: (user) => state.orders.filter(o => o.user_id === user.id && (o.status === 'PAID' || o.provider === 'upi')).map(o => {
    const e = state.entitlements.find(x => x.order_id === o.id); const r = state.resources.find(x => x.id === o.resource_id);
    return { order_id: o.id, status: o.status, total_minor: o.total_minor, currency: 'INR', paid_at: o.paid_at, route_path: r.metadata.route_path,
      page_title: r.title, access_starts_at: e.starts_at, access_expires_at: e.expires_at, provider_payment_id: o.provider_payment_id };
  }),
};

const db = {
  async getUser(token) { return users[token] ? { id: users[token].id, email: users[token].email } : null; },
  async createOrder(userId, resourceId) {
    const r = state.resources.find(x => x.id === resourceId && x.status === 'PUBLISHED');
    if (!r) throw Object.assign(new Error('NOT_FOR_SALE'), { code: 'NOT_FOR_SALE' });
    const o = { id: randomUUID(), user_id: userId, resource_id: r.id, status: 'PENDING', total_minor: r.price_minor, created_at: now(), customer_email: CUSTOMER.email };
    state.orders.push(o);
    return { order_id: o.id, provider_order_id: null, amount_minor: o.total_minor, currency: 'INR', email: o.customer_email, title: r.title, validity_days: r.validity_days };
  },
  async attachProviderOrder(orderId, providerOrderId) { state.orders.find(o => o.id === orderId).provider_order_id = providerOrderId; },
  async markPaid({ providerOrderId, providerPaymentId, amount, expectedUserId }) {
    const o = state.orders.find(x => x.provider_order_id === providerOrderId);
    if (expectedUserId && o.user_id !== expectedUserId) throw Object.assign(new Error('ORDER_USER_MISMATCH'), { code: 'ORDER_USER_MISMATCH' });
    if (amount !== o.total_minor) throw Object.assign(new Error('AMOUNT_MISMATCH'), { code: 'AMOUNT_MISMATCH' });
    if (o.status !== 'PAID') {
      Object.assign(o, { status: 'PAID', provider_payment_id: providerPaymentId, paid_at: now() });
      // Short access window so the test can watch the page lock itself again.
      state.entitlements.push({ order_id: o.id, user_id: o.user_id, resource_id: o.resource_id, starts_at: now(),
        expires_at: new Date(Date.now() + ACCESS_SECONDS * 1000).toISOString(), revoked_at: null });
    }
    const e = state.entitlements.find(x => x.order_id === o.id);
    return { success: true, starts_at: e.starts_at, expires_at: e.expires_at, already_paid: false };
  },
  async markFailed() {}, async markRefunded() {}, async recordEvent() { return true; },
};
const razorpay = {
  async createOrder({ amount }) { const id = `order_E2E${String(state.orders.length).padStart(6, '0')}`; razorpay.amounts[id] = amount; return { id }; },
  async fetchPayment(id) { const orderId = id.replace('pay_', 'order_'); return { id, order_id: orderId, amount: razorpay.amounts[orderId], currency: 'INR', status: 'captured' }; },
  async capturePayment() { throw new Error('not used'); },
  amounts: {},
};
const handlers = createPaymentHandlers({ config: { ready: true, keyId: 'rzp_test_e2e', keySecret: SECRET, webhookSecret: 'w', mode: 'test' }, db, razorpay, log: { error() {}, warn() {} } });

// ── HTTP server: built site + /api/payments + /sb (database stand-in) ───────
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const body = (req) => new Promise(resolve => { let d = ''; req.on('data', c => { d += c; }); req.on('end', () => resolve(d)); });
const send = (res, status, data, headers = {}) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*', ...headers }); res.end(typeof data === 'string' ? data : JSON.stringify(data)); };

const server = createServer(async (req, res) => {
  const url = new URL(req.url, ORIGIN);
  if (req.method === 'OPTIONS') return send(res, 204, '');
  if (url.pathname.startsWith('/api/payments/')) {
    const name = url.pathname.split('/').pop();
    const request = new Request(url, { method: req.method, headers: req.headers, body: req.method === 'POST' ? await body(req) : undefined });
    const route = { 'create-order': handlers.createOrder, verify: handlers.verifyPayment, webhook: handlers.webhook }[name];
    const response = name === 'status'
      ? new Response(JSON.stringify({ ready: state.razorpayReady, razorpay_key_id: 'test', razorpay_key_secret: true, supabase_url: true, supabase_service_role_key: true, razorpay_webhook_secret: false }))
      : route ? await route(request) : new Response('{}', { status: 404 });
    return send(res, response.status, await response.text());
  }
  if (url.pathname.startsWith('/sb/')) {
    const user = users[(req.headers.authorization || '').replace(/^Bearer\s+/i, '')] || null;
    const wantsObject = String(req.headers.accept || '').includes('vnd.pgrst.object');
    if (url.pathname === '/sb/auth/v1/user') return user ? send(res, 200, { id: user.id, email: user.email, aud: 'authenticated', role: 'authenticated', user_metadata: { rules_accepted: true, rules_accepted_date: '2026-01-01T00:00:00Z' }, app_metadata: {} }) : send(res, 401, { message: 'no' });
    if (url.pathname.startsWith('/sb/rest/v1/rpc/')) {
      const name = url.pathname.split('/').pop();
      const args = JSON.parse((await body(req)) || '{}');
      state.rpcCalls.push({ name, args, user: user?.role });
      try { return send(res, 200, JSON.stringify(rpc[name] ? rpc[name](user, args) ?? null : null)); }
      catch (error) { return send(res, 400, { message: error.message }); }
    }
    const table = url.pathname.split('/').pop();
    if (table === 'profiles' && user) return send(res, 200, wantsObject ? { role: user.role, status: 'active', full_name: '', avatar_url: null } : [{ role: user.role, status: 'active' }]);
    if (table === 'resources') {
      const path = (url.searchParams.get('metadata->>route_path') || '').replace(/^eq\./, '');
      const found = resourceFor(path);
      return send(res, 200, found ? [found] : []);
    }
    if (table === 'entitlements') {
      const id = (url.searchParams.get('resource_id') || '').replace(/^eq\./, '');
      return send(res, 200, state.entitlements.filter(e => e.user_id === user?.id && e.resource_id === id && !e.revoked_at));
    }
    return send(res, 200, wantsObject ? {} : []);
  }
  let file = join(OUT, decodeURIComponent(url.pathname));
  if (!extname(file) || !existsSync(file)) file = join(OUT, 'index.html');
  res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
  res.end(await readFile(file));
});
await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));

const browser = await chromium.launch();
const sessionFor = (token, user) => JSON.stringify({ access_token: token, refresh_token: 'r', token_type: 'bearer', expires_in: 360000,
  expires_at: Math.floor(Date.now() / 1000) + 360000, user: { id: user.id, email: user.email, aud: 'authenticated', user_metadata: {}, app_metadata: {} } });
async function signedIn(token, user) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(([key, value]) => {
    localStorage.setItem(key, value);
    localStorage.setItem('sirr_rules_accepted', 'true');
  }, ['sb-127-auth-token', sessionFor(token, user)]);
  // Stand-in Razorpay window: "pays" with the UPI test flow and returns a signed result.
  await context.exposeBinding('__e2eSign', (_s, orderId) => {
    const paymentId = orderId.replace('order_', 'pay_');
    return { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: createHmac('sha256', SECRET).update(`${orderId}|${paymentId}`).digest('hex') };
  });
  await context.addInitScript(() => {
    window.Razorpay = function Razorpay(options) {
      this.on = () => {};
      this.open = async () => { window.__e2eCheckout = options; options.handler(await window.__e2eSign(options.order_id)); };
    };
  });
  const page = await context.newPage();
  page.on('pageerror', error => { console.error('page error:', error.message); });
  return page;
}

try {
  // ── Owner: every sellable page is listed; prices save with the right values ──
  const owner = await signedIn('tok-owner', OWNER);
  await owner.goto(`${ORIGIN}/admin/online-payments`);
  await owner.getByRole('heading', { name: /Online payments/ }).waitFor({ timeout: 20000 });
  await owner.getByText(/Razorpay \(തനിയെ തുറക്കുന്ന payment\) സജ്ജമാണ്/).waitFor();
  for (const name of ['Mizan 9', 'Plants Dictionary', 'Magical Holy Names', 'Astro Clock', 'Sirr al-Wafq', 'Faal Hasrath', 'Evil Jinn Names']) {
    assert.ok(await owner.getByText(name, { exact: true }).count(), `owner can price ${name}`);
  }
  assert.equal(await owner.getByText('/admin/online-payments').count(), 0, 'owner pages are not for sale');

  const priceRow = (name) => owner.locator('div.rounded-xl').filter({ has: owner.getByText(name, { exact: true }) }).first();
  const mizaan = priceRow('Mizan 9');
  await mizaan.getByLabel('Mizan 9 price').fill('499');
  await mizaan.getByLabel('Mizan 9 validity').selectOption('30');
  await mizaan.getByRole('button', { name: /വിൽക്കുക/ }).click();
  await priceRow('Mizan 9').getByText(/വിൽപ്പനയിൽ · ₹499/).waitFor();
  await shot(owner, '1-owner-online-payments');
  const saved = state.rpcCalls.filter(c => c.name === 'owner_set_page_price').at(-1).args.p_payload;
  assert.deepEqual({ ...saved, title: undefined }, { route_path: '/mizaan9', title: undefined, price_minor: 49900, validity_days: 30, lifetime_access: false, on_sale: true });

  const plants = priceRow('Plants Dictionary');
  await plants.getByLabel('Plants Dictionary price').fill('1250.50');
  await plants.getByLabel('Plants Dictionary validity').selectOption('CUSTOM');
  await plants.getByLabel('Plants Dictionary days').fill('45');
  await plants.getByRole('button', { name: /വിൽക്കുക/ }).click();
  await priceRow('Plants Dictionary').getByText(/വിൽപ്പനയിൽ · ₹1,250.50/).waitFor();
  const custom = state.rpcCalls.filter(c => c.name === 'owner_set_page_price').at(-1).args.p_payload;
  assert.equal(custom.price_minor, 125050, 'paise are exact');
  assert.equal(custom.validity_days, 45, 'custom days are saved');

  const astro = priceRow('Astro Clock');
  await astro.getByLabel('Astro Clock price').fill('0');
  await astro.getByRole('button', { name: /വിൽക്കുക/ }).click();
  await priceRow('Astro Clock').getByText(/₹1 മുതൽ/).waitFor();
  assert.ok(!state.resources.some(r => r.metadata.route_path === '/astro-clock'), 'invalid price is refused before saving');
  assert.ok(state.resources.every(r => r.owner_id === OWNER.id), 'priced pages belong to the owner');

  // ── Customer: sees price, buys, only that page opens, then it locks itself ──
  const customer = await signedIn('tok-customer', CUSTOMER);
  await customer.goto(`${ORIGIN}/mizaan9`);
  const buy = customer.getByRole('button', { name: /Buy · ₹499/ });
  await buy.waitFor({ timeout: 20000 }).catch(async (error) => {
    console.error('customer page text:', (await customer.locator('body').innerText()).slice(0, 800));
    console.error('rpc calls:', JSON.stringify(state.rpcCalls.filter(c => c.user !== 'owner').map(c => c.name)));
    throw error;
  });
  await customer.getByText(/1 മാസം \(30 ദിവസം\) access/).waitFor();
  await shot(customer, '2-customer-locked-page');
  assert.equal(await customer.getByText(/WhatsApp/i).count(), 0, 'no WhatsApp request on the lock screen');
  await buy.click();
  await customer.getByText(/Gift code ഉണ്ടോ/).waitFor({ state: 'detached', timeout: 20000 }).catch(async (error) => {
    console.error('after buy:', (await customer.locator('body').innerText()).slice(0, 600));
    throw error;
  });
  assert.equal(window_amount(), 49900, 'Razorpay was opened with the server price');
  assert.equal(state.entitlements.length, 1, 'one purchase recorded');
  assert.equal(await customer.getByText(/Gift code ഉണ്ടോ/).count(), 0, 'the bought page is open');

  await customer.goto(`${ORIGIN}/plants`);
  await customer.getByRole('button', { name: /Buy · ₹1,250.50/ }).waitFor({ timeout: 15000 });
  await customer.getByText(/45 ദിവസം access/).waitFor();

  await customer.goto(`${ORIGIN}/my-subscription`);
  await customer.getByText('Mizan 9').waitFor({ timeout: 15000 }).catch(async (error) => {
    console.error('purchases page:', (await customer.locator('body').innerText()).slice(0, 900));
    throw error;
  });
  await customer.getByText('Active').waitFor();
  await shot(customer, '3-customer-my-purchases');

  await customer.goto(`${ORIGIN}/mizaan9`);
  await customer.waitForTimeout(1500);
  assert.equal(await customer.getByText(/Gift code ഉണ്ടോ/).count(), 0, 'still open before expiry');
  await customer.getByRole('button', { name: /Buy · ₹499/ }).waitFor({ timeout: (ACCESS_SECONDS + 6) * 1000 });

  // ── UPI straight to the owner's bank, approved by the owner ──────────────
  state.razorpayReady = false;
  owner.on('dialog', dialog => dialog.accept());
  await owner.goto(`${ORIGIN}/admin/online-payments`);
  await owner.getByLabel('UPI ID').waitFor({ timeout: 20000 });
  await owner.getByLabel('UPI ID').fill('not-a-upi');
  await owner.getByRole('button', { name: 'UPI ഓൺ ആക്കുക' }).click();
  await owner.getByText(/UPI ID ശരിയല്ല/).waitFor();
  await owner.getByLabel('UPI ID').fill('owner.name@okaxis');
  await owner.getByLabel('Payee name').fill('Sirr al-Huruf');
  await owner.getByRole('button', { name: 'UPI ഓൺ ആക്കുക' }).click();
  await owner.getByText(/customers-ന് UPI വഴി അടയ്ക്കാം/).waitFor();
  const faal = priceRow('Faal Hasrath');
  await faal.getByLabel('Faal Hasrath price').fill('299');
  await faal.getByLabel('Faal Hasrath validity').selectOption('7');
  await faal.getByRole('button', { name: /വിൽക്കുക/ }).click();
  await priceRow('Faal Hasrath').getByText(/വിൽപ്പനയിൽ · ₹299/).waitFor();

  await customer.goto(`${ORIGIN}/faal-hasrath`);
  await customer.getByRole('button', { name: /UPI വഴി Buy · ₹299/ }).click({ timeout: 20000 });
  assert.equal(await customer.getByRole('button', { name: /^Buy · / }).count(), 0, 'Razorpay button hidden while Razorpay is off');
  await customer.getByAltText('UPI QR code').waitFor();
  await customer.getByText('owner.name@okaxis').waitFor();
  await shot(customer, '4-customer-upi-pay');
  await customer.getByLabel(/12 അക്ക UPI Ref/).fill('1234');
  await customer.getByRole('button', { name: /Payment വിവരം അയക്കുക/ }).click();
  await customer.getByText(/12 അക്കം ആയിരിക്കണം/).waitFor();
  await customer.getByLabel(/12 അക്ക UPI Ref/).fill('4123 4567 8901');
  await customer.getByRole('button', { name: /Payment വിവരം അയക്കുക/ }).click();
  await customer.getByText(/Owner പരിശോധിച്ച് approve ചെയ്താൽ/).waitFor();
  assert.equal(state.orders.at(-1).provider_payment_id, '412345678901', 'UPI reference saved without spaces');
  await customer.goto(`${ORIGIN}/faal-hasrath`);
  await customer.getByRole('button', { name: /UPI വഴി Buy/ }).waitFor({ timeout: 20000 });

  await owner.goto(`${ORIGIN}/admin/online-payments`);
  await owner.getByText('412345678901').waitFor({ timeout: 20000 });
  await shot(owner, '5-owner-upi-approval');
  await owner.getByRole('button', { name: 'Approve' }).click();
  await owner.getByText(/customer-ന് page തുറന്നു/).waitFor();

  await customer.goto(`${ORIGIN}/faal-hasrath`);
  await customer.waitForTimeout(3000);
  assert.equal(await customer.getByRole('button', { name: /UPI വഴി Buy/ }).count(), 0, 'approved UPI payment opens the page');
  assert.equal(await customer.getByText(/Gift code ഉണ്ടോ/).count(), 0, 'lock screen is gone');
  console.log('PASS: UPI — owner sets UPI ID (bad IDs refused), customer sees QR and pays to the owner, wrong reference refused, page stays locked until the owner approves, then opens.');
  console.log('PASS: owner prices every page (rupees, paise, custom days, lifetime), invalid prices refused, customer sees price, buys through the payment server, only that page opens, purchases list shows it, and the page locks itself at expiry.');
} finally {
  await browser.close();
  server.close();
}

function window_amount() {
  const order = state.orders.find(o => o.status === 'PAID');
  return razorpay.amounts[order.provider_order_id];
}
