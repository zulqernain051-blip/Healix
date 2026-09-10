import { apiClient } from './client';
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
    apiClient.post<{ message: string }>(`/visits/${visitId}/vitals`, data),

  submitSymptoms: (visitId: string, data: SubmitSymptomsDto) =>
    apiClient.post<{ message: string }>(`/visits/${visitId}/symptoms`, data),

  submitClinicalRemarks: (visitId: string, data: SubmitClinicalRemarkDto) =>
    apiClient.post<{ message: string }>(`/visits/${visitId}/clinical-remarks`, data),

  // ─── Lifecycle Mutations ──────────────────────────────────

  completeVisit: (visitId: string) =>
    apiClient.post<{ message: string }>(`/visits/${visitId}/complete`, {}),

  saveNotes: (visitId: string, notes: string) =>
    apiClient.put<{ message: string }>(`/visits/${visitId}/notes`, { notes }),
};
