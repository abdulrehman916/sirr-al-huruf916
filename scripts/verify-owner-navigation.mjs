import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { ADMIN_NAVIGATION, ADMIN_MAINTENANCE } from '../src/lib/adminNavigation.js';
import manifest from '../src/lib/routeManifest.js';

const bundled = await build({ entryPoints: ['src/lib/rbac.js'], bundle: true, write: false,
  platform: 'node', format: 'esm', alias: { '@': new URL('../src', import.meta.url).pathname } });
const rbac = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);
const daily = ADMIN_NAVIGATION.flatMap(section => section.items);
assert.equal(daily.length, 9);
for (const item of [...daily, ...ADMIN_MAINTENANCE.flatMap(section => section.items)]) {
  assert.ok(manifest.some(route => route.path === item.path), `Missing route: ${item.path}`);
  assert.equal(rbac.canAccessAdminRoute('owner', item.path, null), true);
  assert.equal(rbac.canAccessAdminRoute('customer', item.path, null), false);
  assert.equal(rbac.canAccessAdminRoute('guest', item.path, null), false);
}
const limited = rbac.filterAdminSections(ADMIN_NAVIGATION, 'admin', { perm_support_messages: true });
assert.deepEqual(limited, []);
assert.equal(rbac.canAccessAdminRoute('owner', '/admin/admins'), false);
assert.ok(!manifest.some(route => route.path === '/admin/admins'));
for (const path of ['/admin/content-studio', '/admin/books-studio', '/admin/resource-studio']) {
  assert.ok(ADMIN_MAINTENANCE.some(section => section.items.some(item => item.path === path)));
  assert.equal(rbac.canAccessAdminRoute('admin', path, { perm_system_settings: true }), false);
}
console.log('PASS: nine daily routes, retained independent studios, owner-only navigation and admin/guest/customer denial.');
