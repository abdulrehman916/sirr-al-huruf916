import assert from 'node:assert/strict';
import { mergePermissionGrants, featureGrantActive } from '../src/lib/permissionGrants.js';
const now=Date.parse('2026-10-21T00:00:00Z');
const grants=[
 {page_path:'/holy-names',expiry_date:'2026-10-22T00:00:00Z',sub_features:[]},
 {page_path:'/holy-names',expiry_date:null,sub_features:['section_b']},
];
const pages=mergePermissionGrants(grants);
assert.equal(pages.length,1);assert.equal(pages[0].grants.length,2);
assert.ok(pages[0].grants.some(g=>featureGrantActive(g,'section_a',now)));
assert.equal(pages[0].grants.some(g=>featureGrantActive(g,'section_a',now+2*86400000)),false);
assert.equal(pages[0].grants.some(g=>featureGrantActive(g,'section_b',now+2*86400000)),true);
assert.equal(featureGrantActive({expiry_date:null,sub_features:['section_b'],feature_expiries:{section_b:{expiry_date:'2026-10-20T00:00:00Z'}}},'section_b',now),false);
assert.equal(featureGrantActive({expiry_date:null,sub_features:['section_a']},'section_b',now),false);
console.log('PASS independent feature grants, overlapping codes, wildcard expiry, lifetime, and per-feature expiry.');
