import { apiClient } from './client';
import { DashboardSummaryResponse } from '../types/dashboard';

export const dashboardApi = {
  getSummary: (patientId: string) =>
    apiClient.get<DashboardSummaryResponse>(`/patients/${patientId}/dashboard`),
};
