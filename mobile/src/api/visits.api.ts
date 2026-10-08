import { apiClient } from './client';
import { clinicalDrafts } from '../services/clinicalDrafts';
import {
  Visit,
  VerifyQrDto,
  VerifyGpsDto,
  VerifyManualDto,
  SubmitVitalsDto,
  SubmitSymptomsDto,
  SubmitClinicalRemarkDto,
} from '../types/visit';

export const visitsApi = {
  // ─── Queries ──────────────────────────────────────────────

  getNurseVisits: (nurseId: string) =>
    apiClient.get<Visit[]>(`/nurses/${nurseId}/visits`),

  getVisitDetail: (visitId: string) =>
    apiClient.get<Visit>(`/visits/${visitId}`),

  getQrToken: (visitId: string) =>
    apiClient.get<{ token: string }>(`/visits/${visitId}/qr-code`),

  getAttendance: (visitId: string) =>
    apiClient.get<{ checkInAt?: string; checkOutAt?: string }>(`/visits/${visitId}/attendance`),

  // ─── Verification Mutations ───────────────────────────────

  checkInVisit: (visitId: string) =>
    apiClient.put<{ message: string }>(`/visits/${visitId}/check-in`, {}),

  checkOutVisit: (visitId: string) =>
    apiClient.put<{ message: string }>(`/visits/${visitId}/check-out`, {}),

  confirmArrival: (visitId: string) =>
    apiClient.put<{ message: string }>(`/visits/${visitId}/confirm-arrival`, {}),

  verifyQr: (visitId: string, data: VerifyQrDto) =>
    apiClient.post<{ result: boolean }>(`/visits/${visitId}/verify-qr`, data),

  verifyGps: (visitId: string, data: VerifyGpsDto) =>
    apiClient.post<{ result: boolean; distance?: number }>(`/visits/${visitId}/verify-gps`, data),

  verifyManual: (visitId: string, data: VerifyManualDto) =>
    apiClient.post<{ result: boolean }>(`/visits/${visitId}/verify-manual`, data),

  // ─── Clinical Mutations ───────────────────────────────────

  submitVitals: (visitId: string, data: SubmitVitalsDto) =>
    clinicalDrafts.submit(visitId, 'VITALS', data),

  submitSymptoms: (visitId: string, data: SubmitSymptomsDto) =>
    clinicalDrafts.submit(visitId, 'SYMPTOMS', data),

  submitClinicalRemarks: (visitId: string, data: SubmitClinicalRemarkDto) =>
    apiClient.post<{ message: string }>(`/visits/${visitId}/clinical-remarks`, data),

  acceptVisit: (visitId: string) => apiClient.post(`/visits/${visitId}/accept`, {}),
  submitReview: (visitId: string, data: { stars: number; reviewText?: string; recommend: boolean }) => apiClient.post(`/visits/${visitId}/rating`, data),
  // ─── Lifecycle Mutations ──────────────────────────────────

  completeVisit: async (visitId: string) => {
    if ((await clinicalDrafts.list()).some(item => item.visitId === visitId && !item.archivedAt)) throw new Error('Sync your pending clinical drafts before completing this visit.');
    return apiClient.post<{ message: string }>(`/visits/${visitId}/complete`, {});
  },

  saveNotes: (visitId: string, notes: string) =>
    apiClient.put<{ message: string }>(`/visits/${visitId}/notes`, { notes }),
};
