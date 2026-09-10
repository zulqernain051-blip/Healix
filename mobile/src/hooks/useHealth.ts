import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthApi } from '../api/health.api';
import { ConditionDTO, AllergyDTO, MedicationDTO } from '../types/health';

export const HEALTH_KEYS = {
  all: ['health'] as const,
  medicalHistory: (patientId: string) => [...HEALTH_KEYS.all, 'medical-history', patientId] as const,
  prescriptions: (patientId: string) => [...HEALTH_KEYS.all, 'prescriptions', patientId] as const,
  carePlans: (patientId: string) => [...HEALTH_KEYS.all, 'care-plans', patientId] as const,
  caregivers: (patientId: string) => [...HEALTH_KEYS.all, 'caregivers', patientId] as const,
  outcomes: (patientId: string) => [...HEALTH_KEYS.all, 'outcomes', patientId] as const,
};

export function useMedicalHistory(patientId: string) {
  return useQuery({
    queryKey: HEALTH_KEYS.medicalHistory(patientId),
    queryFn: () => healthApi.getMedicalHistory(patientId),
    enabled: !!patientId,
  });
}

export function useAddCondition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: ConditionDTO }) =>
      healthApi.addCondition(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: HEALTH_KEYS.medicalHistory(variables.patientId) });
    },
  });
}

export function useAddAllergy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: AllergyDTO }) =>
      healthApi.addAllergy(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: HEALTH_KEYS.medicalHistory(variables.patientId) });
    },
  });
}

export function useAddMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: MedicationDTO }) =>
      healthApi.addMedication(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: HEALTH_KEYS.medicalHistory(variables.patientId) });
    },
  });
}

export function usePrescriptions(patientId: string) {
  return useQuery({
    queryKey: HEALTH_KEYS.prescriptions(patientId),
    queryFn: () => healthApi.getPrescriptions(patientId),
    enabled: !!patientId,
  });
}

export function useCarePlans(patientId: string) {
  return useQuery({
    queryKey: HEALTH_KEYS.carePlans(patientId),
    queryFn: () => healthApi.getCarePlans(patientId),
    enabled: !!patientId,
  });
}

export function useCaregivers(patientId: string) {
  return useQuery({
    queryKey: HEALTH_KEYS.caregivers(patientId),
    queryFn: () => healthApi.getCaregivers(patientId),
    enabled: !!patientId,
  });
}

export function useCompleteMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (milestoneId: string) => healthApi.completeMilestone(milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HEALTH_KEYS.all });
    },
  });
}

export function useClinicalOutcomes(patientId: string) {
  return useQuery({
    queryKey: HEALTH_KEYS.outcomes(patientId),
    queryFn: () => healthApi.getClinicalOutcomes(patientId),
    enabled: !!patientId,
  });
}
