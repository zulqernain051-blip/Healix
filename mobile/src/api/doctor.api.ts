import { apiClient } from './client';
import {
  CaseAssignment,
  CaseReviewPayload,
  ConsultationDoctor,
} from '../types/doctor';

export const doctorApi = {
  getQueue: () => 
    apiClient.get<CaseAssignment[]>('/doctors/queue'),

  getHighRiskQueue: () =>
    apiClient.get<CaseAssignment[]>('/doctors/queue/high-risk'),

  startReview: (caseId: string) =>
    apiClient.put(`/cases/${caseId}/start-review`, {}),

  getCaseReview: (caseId: string) =>
    apiClient.get<CaseReviewPayload>(`/cases/${caseId}/review`),

  getConsultationDoctors: () =>
    apiClient.get<ConsultationDoctor[]>('/doctors/list'),

  requestSecondOpinion: (caseId: string, consultedDoctorId: string) =>
    apiClient.post(`/cases/${caseId}/second-opinion`, { consultedDoctorId }),

  submitDiagnosis: (caseId: string, data: { code: string; description: string; notes?: string; parentId?: string }) =>
    apiClient.post(`/cases/${caseId}/diagnosis`, data),

  submitCarePlan: (caseId: string, data: { title: string; description?: string; milestones: Array<{ title: string; targetDate: string }> }) =>
    apiClient.post(`/cases/${caseId}/care-plan`, data),

  submitPrescription: (caseId: string, data: { instructions?: string; items: any[]; supersedesId?: string; bypassAllergyCheck?: boolean }) =>
    apiClient.post(`/cases/${caseId}/prescriptions`, data),

  submitClinicalDecision: (caseId: string, data: { decision: string; justification: string; autoDispatch?: boolean }) =>
    apiClient.post(`/cases/${caseId}/decision`, data),

  scheduleFollowUp: (caseId: string, data: { targetDate: string; instructions?: string; preferCurrentNurse?: boolean }) =>
    apiClient.post(`/cases/${caseId}/follow-up`, data),



  resolveCase: (caseId: string, summary?: string) =>
    apiClient.put(`/cases/${caseId}/resolve`, { summary }),

  submitAiFeedback: (caseId: string, data: { targetType: 'SUMMARY' | 'RECOMMENDATION'; comment: string }) =>
    apiClient.post(`/cases/${caseId}/ai-feedback`, data),
};
