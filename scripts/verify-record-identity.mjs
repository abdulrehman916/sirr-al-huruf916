import assert from 'node:assert/strict';
import { toRecord, byRecordId } from '../src/api/recordIdentity.js';

const uuid = '7c3a54a2-0a17-4fbe-9d55-8162842dec5c';
const imported = '6a3eb24c7f23de95a46e0a9f';
const data = { _base44_legacy_id: imported, arabic_name: 'الْأَحْكَم' };
assert.equal(toRecord({ id: uuid, data }).id, imported);
assert.equal(toRecord({ id: uuid, data }).arabic_name, data.arabic_name);
assert.equal(toRecord({ id: uuid, data: {} }).id, uuid);
assert.equal(toRecord(null), null);
const query = { eq: (column, value) => ({ column, value }) };
assert.deepEqual(byRecordId(query, imported), { column: 'data->>_base44_legacy_id', value: imported });
assert.deepEqual(byRecordId(query, uuid), { column: 'id', value: uuid });
console.log('Imported and new record relationship identifiers verified.');
