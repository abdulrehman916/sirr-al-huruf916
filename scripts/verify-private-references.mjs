import assert from 'node:assert/strict';
import { createReferenceResolver } from '../src/api/privateReferenceAssets.js';

let session = null;
let allowed = true;
let requests = 0;
const client = {
  auth: { getSession: async () => ({ data: { session } }) },
  storage: { from: () => ({ createSignedUrl: async (path) => {
    requests++;
    return allowed ? { data: { signedUrl: `https://own-storage.example/${path}` } }
      : { error: { message: 'Permission denied' } };
  } }) },
};
const resolver = createReferenceResolver(() => client);
const ref = 'storage://private-documents/imported-reference/manuscript.pdf';
assert.equal(await resolver.resolve(ref), null);
assert.equal(requests, 0, 'Anonymous readers cannot request personal source files');
session = { user: { id: 'owner' } };
const content = await resolver.resolve({ sources: [ref, ref], arabic_text: 'الْأَحْكَم' });
assert.equal(requests, 1, 'Repeated references share one signing request');
assert.equal(content.arabic_text, 'الْأَحْكَم');
assert.match(content.sources[0], /^https:\/\/own-storage/);
allowed = false;
resolver.clear();
assert.equal(await resolver.resolve(ref), null, 'A denied source never falls back to an external book');
session = null;
resolver.clear();
assert.equal(await resolver.resolve(ref), null, 'Owner URLs are not reused after sign-out');
console.log('Private reference access and session cache isolation verified.');
