import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clinicalApi } from '../api/clinical.api';

export function useVisitAiSummary(visitId: string) {
  return useQuery({
    queryKey: ['clinical', 'visitAiSummary', visitId],
    queryFn: () => clinicalApi.getVisitAiSummary(visitId),
    enabled: !!visitId,
  });
}

export function usePerformRiskAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof clinicalApi.performRiskAssessment>[0]) =>
      clinicalApi.performRiskAssessment(data),
    onSuccess: (_, variables) => {
      if (variables.visitId) {
        queryClient.invalidateQueries({ queryKey: ['visit', variables.visitId] });
      }
    },
  });
}

export function useQueryClinicalKnowledge() {
  return useMutation({
    mutationFn: (query: string) => clinicalApi.queryClinicalKnowledge(query),
  });
}

export function useComplianceMetrics(patientId: string) {
  return useQuery({
    queryKey: ['clinical', 'compliance', patientId],
    queryFn: () => clinicalApi.getComplianceMetrics(patientId),
    enabled: !!patientId,
  });
}
