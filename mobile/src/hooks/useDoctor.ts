import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi } from '../api/doctor.api';

// Queries
export function useDoctorQueue() {
  return useQuery({
    queryKey: ['doctor', 'queue'],
    queryFn: () => doctorApi.getQueue(),
  });
}

export function useDoctorHighRiskQueue() {
  return useQuery({
    queryKey: ['doctor', 'queue', 'high-risk'],
    queryFn: () => doctorApi.getHighRiskQueue(),
  });
}

export function useCaseReview(caseId: string) {
  return useQuery({
    queryKey: ['doctor', 'case', caseId, 'review'],
    queryFn: () => doctorApi.getCaseReview(caseId),
    enabled: !!caseId,
  });
}

export function useConsultationDoctors() {
  return useQuery({
    queryKey: ['doctor', 'consultation-list'],
    queryFn: () => doctorApi.getConsultationDoctors(),
  });
}

// Mutations
export function useStartCaseReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (caseId: string) => doctorApi.startReview(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'queue'] });
      queryClient.invalidateQueries({ queryKey: ['doctor', 'queue', 'high-risk'] });
    },
  });
}

export function useRequestSecondOpinion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, consultedDoctorId }: { caseId: string; consultedDoctorId: string }) =>
      doctorApi.requestSecondOpinion(caseId, consultedDoctorId),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'case', caseId] });
    },
  });
}

export function useSubmitDiagnosis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: Parameters<typeof doctorApi.submitDiagnosis>[1] }) =>
      doctorApi.submitDiagnosis(caseId, data),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'case', caseId] });
    },
  });
}

export function useSubmitCarePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: Parameters<typeof doctorApi.submitCarePlan>[1] }) =>
      doctorApi.submitCarePlan(caseId, data),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'case', caseId] });
    },
  });
}

export function useSubmitPrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: Parameters<typeof doctorApi.submitPrescription>[1] }) =>
      doctorApi.submitPrescription(caseId, data),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'case', caseId] });
    },
  });
}

export function useSubmitClinicalDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: Parameters<typeof doctorApi.submitClinicalDecision>[1] }) =>
      doctorApi.submitClinicalDecision(caseId, data),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'case', caseId] });
      queryClient.invalidateQueries({ queryKey: ['doctor', 'queue'] });
    },
  });
}

export function useSubmitAiFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: Parameters<typeof doctorApi.submitAiFeedback>[1] }) =>
      doctorApi.submitAiFeedback(caseId, data),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'case', caseId] });
    },
  });
}

export function useResolveCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, summary }: { caseId: string; summary?: string }) => doctorApi.resolveCase(caseId, summary),
    onSuccess: (_, { caseId }) => {
      // Invalidate the queue
      queryClient.invalidateQueries({ queryKey: ['doctor', 'queue'] });
      // Invalidate the specific case review
      queryClient.invalidateQueries({ queryKey: ['doctor', 'case', caseId] });
      // Invalidate admin cases if exposed
      queryClient.invalidateQueries({ queryKey: ['admin', 'cases'] });
    },
  });
}


export function useScheduleFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: Parameters<typeof doctorApi.scheduleFollowUp>[1] }) =>
      doctorApi.scheduleFollowUp(caseId, data),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'case', caseId] });
    },
  });
}
