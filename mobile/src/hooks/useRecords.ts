import { useQuery } from '@tanstack/react-query';
import { recordsApi } from '../api/records.api';

export const RECORDS_KEYS = {
  all: ['records'] as const,
  vitals: (patientId: string) => [...RECORDS_KEYS.all, 'vitals', patientId] as const,
  risks: (patientId: string) => [...RECORDS_KEYS.all, 'risks', patientId] as const,
};

export function useVitalsHistory(patientId: string) {
  return useQuery({
    queryKey: RECORDS_KEYS.vitals(patientId),
    queryFn: () => recordsApi.getVitalsHistory(patientId),
    enabled: !!patientId,
  });
}

export function useRiskHistory(patientId: string) {
  return useQuery({
    queryKey: RECORDS_KEYS.risks(patientId),
    queryFn: () => recordsApi.getRiskHistory(patientId),
    enabled: !!patientId,
  });
}
