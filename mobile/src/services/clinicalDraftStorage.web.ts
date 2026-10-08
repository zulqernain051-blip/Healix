// A non-extractable AES key and ciphertext persist in the app origin's IndexedDB.
// Browser same-origin code can decrypt; this does not protect against XSS.
async function database(): Promise<IDBDatabase> {
 return new Promise((resolve, reject) => {
  const request = indexedDB.open('healix-clinical-drafts', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('drafts');
  request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
 });
}
async function readRecord(userId: string): Promise<any> {
 const db = await database();
 try { return await new Promise((resolve, reject) => { const request = db.transaction('drafts').objectStore('drafts').get(userId); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
 finally { db.close(); }
}
export const clinicalDraftStorage = {
 async read(userId: string): Promise<string | null> {
  const row = await readRecord(userId); if (!row) return null;
  const bytes = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: row.iv }, row.key, row.ciphertext);
  return new TextDecoder().decode(bytes);
 },
 async write(userId: string, value: string): Promise<void> {
  const old = await readRecord(userId);
  const key = old?.key ?? await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(value));
  const db = await database();
  try { await new Promise<void>((resolve, reject) => { const tx = db.transaction('drafts', 'readwrite'); tx.objectStore('drafts').put({ key, iv, ciphertext }, userId); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error); }); }
  finally { db.close(); }
 }
};
