const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadTs } = require('./load-ts.cjs');
const { ApiError } = loadTs('src/types/api.ts');
function setup(post) {
 const stored = new Map(); let user = { id: 'nurse-a', role: 'NURSE' }; let counter = 0;
 const storage = { read: async id => stored.get(id) ?? null, write: async (id, value) => { stored.set(id, value); } };
 const { clinicalDrafts } = loadTs('src/services/clinicalDrafts.ts', {
  'expo-crypto': { randomUUID: () => `submission-${++counter}` },
  './clinicalDraftStorage': { clinicalDraftStorage: storage },
  '../store/auth': { useAuthStore: { getState: () => ({ user }) } },
  '../api/client': { apiClient: { post } }, '../types/api': { ApiError }
 }, { AbortController });
 return { clinicalDrafts, stored, switchUser: value => { user = value; } };
}
test('an ambiguous network failure preserves a durable draft and retries its original ID', async () => {
 let fail = true; const ids = [];
 const s = setup(async (_, body) => { ids.push(body.id); if (fail) throw new TypeError('Network unavailable'); return { queued: false, message: 'Saved' }; });
 const outcome = await s.clinicalDrafts.submit('visit-a', 'VITALS', { heartRate: 75 });
 assert.equal(outcome.queued, true); assert.equal((await s.clinicalDrafts.list()).length, 1);
 fail = false; assert.equal((await s.clinicalDrafts.sync()).length, 0); assert.equal(ids[0], ids[1]);
});
test('definitive validation failures are returned to the form without silently queuing', async () => {
 const s = setup(async () => { throw new ApiError('Visit already completed', 409); });
 await assert.rejects(s.clinicalDrafts.submit('visit-a', 'VITALS', {}), e => e.statusCode === 409);
 assert.equal((await s.clinicalDrafts.list()).length, 0);
});
test('drafts are isolated across nurse accounts and survive switching back', async () => {
 const s = setup(async () => { throw new TypeError('Offline'); });
 await s.clinicalDrafts.submit('visit-a', 'VITALS', {});
 s.switchUser({ id: 'nurse-b', role: 'NURSE' }); assert.equal((await s.clinicalDrafts.list()).length, 0);
 s.switchUser({ id: 'nurse-a', role: 'NURSE' }); assert.equal((await s.clinicalDrafts.list()).length, 1);
 s.switchUser({ id: 'patient-a', role: 'PATIENT' }); await assert.rejects(s.clinicalDrafts.list(), /Sign in as a nurse/);
});
test('a later conflict remains visible instead of discarding previously saved observations', async () => {
 let fail = true; const s = setup(async () => { if (fail) throw new TypeError('Offline'); throw new ApiError('Visit closed; review this draft', 409); });
 await s.clinicalDrafts.submit('visit-a', 'SYMPTOMS', { symptoms: [] }); fail = false;
 const pending = await s.clinicalDrafts.sync(); assert.equal(pending.length, 1); assert.match(pending[0].error, /Visit closed/);
});
test('concurrent submissions cannot overwrite one another', async () => {
 const s = setup(async () => { throw new TypeError('Offline'); });
 await Promise.all([s.clinicalDrafts.submit('a', 'VITALS', {}), s.clinicalDrafts.submit('b', 'VITALS', {})]);
 assert.equal((await s.clinicalDrafts.list()).length, 2);
});

test('archiving preserves observations and excludes them from synchronization until restored', async () => {
 let fail = true; let calls = 0;
 const s = setup(async () => { calls++; if (fail) throw new TypeError('Offline'); return { queued: false }; });
 await s.clinicalDrafts.submit('visit-a', 'VITALS', {});
 const id = (await s.clinicalDrafts.list())[0].id;
 await s.clinicalDrafts.archive(id, true); fail = false;
 await s.clinicalDrafts.sync(); assert.equal(calls, 1); assert.equal((await s.clinicalDrafts.list()).length, 1);
 await s.clinicalDrafts.archive(id, false); await s.clinicalDrafts.sync(); assert.equal(calls, 2); assert.equal((await s.clinicalDrafts.list()).length, 0);
});

test('browser draft storage encrypts Unicode data, survives reload and rejects tampering', async () => {
 const { webcrypto } = require('node:crypto'); const rows = new Map();
 const indexedDB = { open: () => {
  const request = {}; queueMicrotask(() => {
   request.result = { close() {}, createObjectStore() {}, transaction() {
    const tx = { objectStore: () => ({
     get: key => { const read = {}; queueMicrotask(() => { read.result = rows.get(key); read.onsuccess(); }); return read; },
     put: (value, key) => { rows.set(key, value); queueMicrotask(() => tx.oncomplete()); }
    }) }; return tx;
   } }; request.onupgradeneeded(); request.onsuccess();
  }); return request;
 } };
 const load = () => loadTs('src/services/clinicalDraftStorage.web.ts', {}, { indexedDB, crypto: webcrypto, TextEncoder, TextDecoder }).clinicalDraftStorage;
 const text = JSON.stringify({ notes: 'Patient observation محفوظ', value: 75 });
 await load().write('nurse-a', text);
 const row = rows.get('nurse-a'); assert.equal(row.key.extractable, false);
 assert.equal(Buffer.from(row.ciphertext).includes(Buffer.from('Patient observation')), false);
 assert.equal(await load().read('nurse-a'), text); assert.equal(await load().read('nurse-b'), null);
 new Uint8Array(row.ciphertext)[0] ^= 1; await assert.rejects(load().read('nurse-a'));
});
