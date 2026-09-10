import { apiClient } from './client';
import { VitalSign, RiskAssessment } from '../types/records';

export const recordsApi = {
  getVitalsHistory: (patientId: string) =>
    apiClient.get<VitalSign[]>(`/patients/${patientId}/vitals-history`),

  getRiskHistory: (patientId: string) =>
    apiClient.get<RiskAssessment[]>(`/patients/${patientId}/risk-history`),
};
