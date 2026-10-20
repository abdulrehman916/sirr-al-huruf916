import assert from 'node:assert/strict';
import fs from 'node:fs';
import { matchPath } from 'react-router-dom';
import manifest from '../src/lib/routeManifest.js';
import { backDestination } from '../src/lib/backNavigation.js';
import { effectiveCodeExpiry, getCodeStatus, isLifetime } from '../src/lib/codeDuration.js';
for (const route of manifest) {
  const path = route.path.replace(/:[^/]+/g, 'example');
  const back = backDestination(0, path);
  assert.ok(manifest.some(r => matchPath(r.path, back.split('?')[0])), `${path} -> ${back}`);
  assert.equal(backDestination(2, path), -1);
}
const code = {expiry_date:'2000-01-01',page_paths:['/abjad','/hadim'],page_grants:{
  '/abjad':{expires_at:null},'/hadim':{expires_at:'2000-01-01'}}};
assert.equal(effectiveCodeExpiry(code),null);
assert.equal(isLifetime(code),true);
assert.equal(getCodeStatus(code).value,'active');
assert.equal(getCodeStatus({...code,is_disabled:true}).value,'disabled');
assert.equal(getCodeStatus({...code,page_paths:['/hadim']}).value,'expired');
assert.equal(getCodeStatus({expiry_date:'2000-01-01'}).value,'expired');
assert.equal(effectiveCodeExpiry({...code,page_grants:{'/abjad':{expires_at:'2090-01-01'},'/hadim':{expires_at:'2100-01-01'}}}),'2100-01-01');
for (const page of ['PagePermissions','UserDetailPage']) {
 const source=fs.readFileSync(`src/pages/${page}.jsx`,'utf8');
 assert.ok(source.includes('!["owner", "admin"].includes(user.role)'));
}
console.log('PASS: all route direct-open Back destinations exist; mixed lifetime/expiry status; owner page access.');
