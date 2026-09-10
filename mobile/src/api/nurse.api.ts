import { apiClient } from './client';
import {
  NurseProfile,
  VerificationStatus,
  AvailabilitySlot,
  NurseEarnings,
  NurseScore,
  NurseReview,
  NurseBadge,
  NurseVacation
} from '../types/nurse';

export const nurseApi = {
  getProfile: (nurseId: string) => 
    apiClient.get<NurseProfile>(`/nurses/${nurseId}/profile`),

  updateProfile: (nurseId: string, data: Partial<{ bio: string; experience: number; photoUrl: string; available: boolean }>) =>
    apiClient.put<NurseProfile>(`/nurses/${nurseId}/profile`, data),

  getVerificationStatus: (nurseId: string) =>
    apiClient.get<VerificationStatus>(`/nurses/${nurseId}/verification`),

  uploadDocument: (nurseId: string, data: { documentType: string; fileUrl: string }) =>
    apiClient.post(`/nurses/${nurseId}/verification/upload`, data),

  addQualification: (nurseId: string, data: { title: string; issuingBody: string; yearObtained: number }) =>
    apiClient.post(`/nurses/${nurseId}/qualifications`, data),

  deleteQualification: (nurseId: string, qualId: string) =>
    apiClient.delete(`/nurses/${nurseId}/qualifications/${qualId}`),

  addSpecialization: (nurseId: string, data: { specialization: string }) =>
    apiClient.post(`/nurses/${nurseId}/specializations`, data),

  getAvailability: (nurseId: string) =>
    apiClient.get<AvailabilitySlot[]>(`/nurses/${nurseId}/availability`),

  addAvailabilitySlot: (nurseId: string, data: { dayOfWeek: number; startTime: string; endTime: string; shiftType?: string }) =>
    apiClient.post<AvailabilitySlot>(`/nurses/${nurseId}/availability`, data),

  deleteAvailabilitySlot: (nurseId: string, slotId: string) =>
    apiClient.delete(`/nurses/${nurseId}/availability/${slotId}`),

  getEarnings: (nurseId: string) =>
    apiClient.get<NurseEarnings>(`/nurses/${nurseId}/earnings`),

  getScore: (nurseId: string) =>
    apiClient.get<NurseScore>(`/nurses/${nurseId}/score`),

  getReviews: (nurseId: string) =>
    apiClient.get<NurseReview[]>(`/nurses/${nurseId}/reviews`),

  getBadges: (nurseId: string) =>
    apiClient.get<NurseBadge[]>(`/nurses/${nurseId}/badges`),

  getVacations: (nurseId: string) =>
    apiClient.get<NurseVacation[]>(`/nurses/${nurseId}/vacations`),

  addVacation: (nurseId: string, data: { startDate: string; endDate: string; reason?: string }) =>
    apiClient.post<NurseVacation>(`/nurses/${nurseId}/vacations`, data),

  deleteVacation: (nurseId: string, vacationId: string) =>
    apiClient.delete(`/nurses/${nurseId}/vacations/${vacationId}`),
};
