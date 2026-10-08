import { randomUUID } from 'expo-crypto';
import { clinicalDraftStorage } from './clinicalDraftStorage';
import { useAuthStore } from '../store/auth';
import { apiClient } from '../api/client';
import { ApiError } from '../types/api';
import { SubmitVitalsDto, SubmitSymptomsDto } from '../types/visit';
export type ClinicalDraft = { id: string; visitId: string; capturedAt: string; kind: 'VITALS' | 'SYMPTOMS'; data: SubmitVitalsDto | SubmitSymptomsDto; error?: string; archivedAt?: string };
let chain: Promise<unknown> = Promise.resolve();
const serial = <T,>(work: () => Promise<T>): Promise<T> => { const result = chain.then(work, work); chain = result.catch(() => undefined); return result; };
async function deliver(item: ClinicalDraft) { const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 15_000); try { return await apiClient.post<{ queued: false; message: string }>(`/visits/${item.visitId}/clinical-sync`, item, { signal: controller.signal }); } finally { clearTimeout(timeout); } }
function owner() { const user = useAuthStore.getState().user; if (!user || user.role !== 'NURSE') throw new Error('Sign in as a nurse to access your drafts.'); return user.id; }
async function list(userId: string): Promise<ClinicalDraft[]> { const data = await clinicalDraftStorage.read(userId); return data ? JSON.parse(data) : []; }
async function save(userId: string, drafts: ClinicalDraft[]) { await clinicalDraftStorage.write(userId, JSON.stringify(drafts)); }
export const clinicalDrafts = {
 list: () => serial(() => list(owner())),
 submit: (visitId: string, kind: ClinicalDraft['kind'], data: ClinicalDraft['data']) => serial(async () => {
  const userId = owner(); const drafts = await list(userId);
  if (drafts.filter(item => !item.archivedAt).length >= 100) throw new Error('Sync your existing drafts before saving more observations.');
  const item: ClinicalDraft = { id: randomUUID(), visitId, kind, data, capturedAt: new Date().toISOString() };
  await save(userId, [...drafts, item]);
  try {
   if (owner() !== userId) throw new Error('Session changed');
   const result = await deliver(item);
   await save(userId, drafts); return result;
  } catch (error) {
   // An HTTP rejection is definitive. Keep the input in the form; do not queue it for automatic retry.
   if (error instanceof ApiError && error.statusCode < 500) { await save(userId, drafts); throw error; }
   item.error = 'Delivery was not confirmed. Retry from Offline drafts.';
   await save(userId, [...drafts, item]); return { queued: true, message: item.error };
  }
 }),
 archive: (id: string, archived: boolean) => serial(async () => { const userId = owner(); const drafts = (await list(userId)).map(item => item.id === id ? { ...item, archivedAt: archived ? new Date().toISOString() : undefined } : item); await save(userId, drafts); return drafts; }),
 sync: () => serial(async () => {
  const userId = owner(); let drafts = await list(userId);
  for (const item of drafts.filter(draft => !draft.archivedAt)) {
   if (owner() !== userId) throw new Error('Session changed. Remaining drafts were preserved.');
   try { await deliver(item); drafts = drafts.filter(draft => draft.id !== item.id); }
   catch (error) { item.error = error instanceof ApiError ? error.message : 'Delivery could not be confirmed. Try again when connected.'; drafts = drafts.map(draft => draft.id === item.id ? item : draft); }
   await save(userId, drafts);
   if (owner() !== userId) break;
  }
  return drafts;
 })
};
