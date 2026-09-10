import { apiClient } from './client';
import { RiskAssessment, KnowledgeEntry, VisitAiSummary } from '../types/clinical';

export const clinicalApi = {
  performRiskAssessment: (data: { visitId?: string; patientId: string; nurseConfidence: number }) =>
    apiClient.post<RiskAssessment>('/clinical/risk-assess', data),

  queryClinicalKnowledge: (query: string) =>
    apiClient.post<KnowledgeEntry[]>('/clinical/knowledge-query', { query }),

  getVisitAiSummary: (visitId: string) =>
    apiClient.get<VisitAiSummary>(`/visits/${visitId}/ai-summary`),

  getComplianceMetrics: (patientId: string) =>
    apiClient.get<any>(`/patients/${patientId}/compliance`),
};
