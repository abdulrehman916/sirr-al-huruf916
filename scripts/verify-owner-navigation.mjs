import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { ADMIN_NAVIGATION, ADMIN_MAINTENANCE } from '../src/lib/adminNavigation.js';
import manifest from '../src/lib/routeManifest.js';

const bundled = await build({ entryPoints: ['src/lib/rbac.js'], bundle: true, write: false,
  platform: 'node', format: 'esm', alias: { '@': new URL('../src', import.meta.url).pathname } });
const rbac = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);
const daily = ADMIN_NAVIGATION.flatMap(section => section.items);
assert.equal(daily.length, 9);
assert.ok(daily.some(item => item.path === '/admin/online-payments'), 'Online payments is a daily owner page');
assert.ok(!daily.some(item => ['/admin/access-requests', '/admin/redeem-approvals'].includes(item.path)), 'Retired customer request flows are not daily pages');
for (const item of [...daily, ...ADMIN_MAINTENANCE.flatMap(section => section.items)]) {
  assert.ok(manifest.some(route => route.path === item.path), `Missing route: ${item.path}`);
  assert.equal(rbac.canAccessAdminRoute('owner', item.path, null), true);
  assert.equal(rbac.canAccessAdminRoute('customer', item.path, null), false);
  assert.equal(rbac.canAccessAdminRoute('guest', item.path, null), false);
}
const limited = rbac.filterAdminSections(ADMIN_NAVIGATION, 'admin', { perm_support_messages: true });
assert.deepEqual(limited, []);
assert.ok(!manifest.some(route => route.path === '/admin/admins'));
for (const path of ['/admin/content-studio', '/admin/books-studio', '/admin/resource-studio']) {
  assert.ok(!manifest.some(route => route.path === path));
  assert.ok(!ADMIN_MAINTENANCE.some(section => section.items.some(item => item.path === path)));
  assert.equal(rbac.canAccessAdminRoute('admin', path, { perm_system_settings: true }), false);
}
for (const path of ['/resources', '/content/:slug', '/books', '/books/:slug', '/my-library']) {
  assert.ok(!manifest.some(route => route.path === path));
}
console.log('PASS: nine daily routes, removed publishing studios/catalogues, owner-only navigation and admin/guest/customer denial.');
