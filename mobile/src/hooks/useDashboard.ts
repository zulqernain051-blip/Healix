import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export const DASHBOARD_KEYS = {
  all: ['dashboard'] as const,
  summary: (patientId: string) => [...DASHBOARD_KEYS.all, 'summary', patientId] as const,
};

export function useDashboardSummary(patientId: string) {
  return useQuery({
    queryKey: DASHBOARD_KEYS.summary(patientId),
    queryFn: () => dashboardApi.getSummary(patientId),
    enabled: !!patientId,
  });
}
