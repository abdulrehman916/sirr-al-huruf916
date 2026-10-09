import assert from 'node:assert/strict';
import vm from 'node:vm';
import { build } from 'esbuild';
import { createMemoryHistory } from '@remix-run/router';
import { backDestination } from '../src/lib/backNavigation.js';

const history = createMemoryHistory({ initialEntries: ['/'] });
history.push('/holy-names');
history.push('/holy-names?section=section-b');
history.push('/holy-names/one/PDF-HN-001?tab=b');
history.go(backDestination(history.index, history.location.pathname, history.location.search));
assert.equal(history.location.pathname + history.location.search, '/holy-names?section=section-b');
history.go(-1);
assert.equal(history.location.pathname + history.location.search, '/holy-names');
history.go(1);
assert.equal(history.location.search, '?section=section-b');
for (const [path, search, expected] of [
  ['/holy-names', '?section=section-b', '/holy-names'],
  ['/holy-names/one/PDF-HN-001', '', '/holy-names?section=section-b'],
  ['/holy-names/one/001', '?tab=b', '/holy-names?section=section-b'],
  ['/holy-names/one/001', '', '/holy-names/one'],
  ['/plants/example', '', '/plants'],
  ['/shop/example', '', '/shop'],
]) {
  assert.equal(backDestination(0, path, search), expected);
  assert.equal(backDestination(2, path, search), -1);
}
assert.equal(backDestination(undefined, '/admin/user-detail/u', '', '/admin/access-dashboard?tab=users'), '/admin/access-dashboard?tab=users');
assert.equal(backDestination(3, '/admin/user-detail/u', '', '/admin/access-dashboard?tab=users'), -1);

// Exercise the real restoration effect with a list that arrives asynchronously.
const bundle = await build({
  entryPoints: ['src/components/RouteScrollRestore.jsx'], bundle: true,
  write: false, format: 'iife', globalName: 'ScrollTest',
  plugins: [{ name: 'hook-harness', setup(builder) {
    builder.onResolve({ filter: /^(react|react-router-dom)$/ }, args => ({ path: args.path, namespace: 'harness' }));
    builder.onLoad({ filter: /.*/, namespace: 'harness' }, args => ({ contents: args.path === 'react'
      ? 'export const useLayoutEffect = callback => { globalThis.effect = callback; };'
      : 'export const useLocation = () => globalThis.route; export const useNavigationType = () => globalThis.navType;' }));
  } }],
});
let now = 0, cleanup;
const frames = new Map(), listeners = new Map(), storage = new Map();
let container = null;
const on = (event, callback) => { if (!listeners.has(event)) listeners.set(event, new Set()); listeners.get(event).add(callback); };
const off = (event, callback) => listeners.get(event)?.delete(callback);
const ctx = {
  route: { key: 'list-entry' }, navType: 'POP',
  performance: { now: () => now },
  sessionStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  document: { querySelector: () => container, addEventListener: on, removeEventListener: off },
  window: { scrollY: 0, scrollTo({ top }) { this.scrollY = top; }, addEventListener: on, removeEventListener: off },
  requestAnimationFrame: callback => { const id = Symbol(); frames.set(id, callback); return id; },
  cancelAnimationFrame: id => frames.delete(id),
};
storage.set('sirr_route_scroll:list-entry', JSON.stringify({ window: 0, container: 900 }));
vm.createContext(ctx);
vm.runInContext(bundle.outputFiles[0].text, ctx);
const mount = () => { ctx.ScrollTest.default(); cleanup = ctx.effect(); };
const tick = time => { now = time; const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()); };
mount();
tick(200);
assert.ok(frames.size, 'wait for lazy page');
let top = 0, maxTop = 0;
container = { get scrollTop() { return top; }, set scrollTop(value) { top = Math.min(value, maxTop); } };
tick(600);
assert.ok(frames.size, 'wait for API-loaded list height');
maxTop = 1500;
tick(1400);
assert.equal(top, 900);
assert.equal(frames.size, 0);
top = 1100;
listeners.get('scroll').forEach(callback => callback());
assert.equal(JSON.parse(storage.get('sirr_route_scroll:list-entry')).container, 1100);
cleanup();
mount();
tick(1500);
listeners.get('wheel').forEach(callback => callback());
top = 1200;
tick(1700);
assert.equal(top, 1200, 'user scrolling cancels restoration');
cleanup();
ctx.route = { key: 'new-detail-entry' };
ctx.navType = 'PUSH';
mount();
tick(1800);
assert.equal(top, 0, 'new page starts at top');
cleanup();
assert.equal(frames.size, 0);
assert.ok([...listeners.values()].every(set => set.size === 0), 'route cleanup removes listeners');
console.log('PASS: previous section, browser back/forward, direct-link parents, admin fallback, delayed list scroll, user interruption and cleanup.');
