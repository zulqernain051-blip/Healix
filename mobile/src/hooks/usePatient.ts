import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '../api/patient.api';
import { UpdateProfileDTO, CreateEmergencyContactDTO } from '../types/patient';

export const PATIENT_KEYS = {
  all: ['patient'] as const,
  profile: (patientId: string) => [...PATIENT_KEYS.all, 'profile', patientId] as const,
};

export function usePatientProfile(patientId: string) {
  return useQuery({
    queryKey: PATIENT_KEYS.profile(patientId),
    queryFn: () => patientApi.getProfile(patientId),
    enabled: !!patientId,
  });
}

export function useUpdatePatientProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: UpdateProfileDTO }) =>
      patientApi.updateProfile(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.profile(variables.patientId) });
    },
  });
}

export function useAddEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: CreateEmergencyContactDTO }) =>
      patientApi.addEmergencyContact(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.profile(variables.patientId) });
    },
  });
}

export function useDeleteEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, contactId }: { patientId: string; contactId: string }) =>
      patientApi.deleteEmergencyContact(patientId, contactId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.profile(variables.patientId) });
    },
  });
}


export function useActiveEmergency(patientId?: string) {
  return useQuery({
    queryKey: ['patient', 'emergency', 'active', patientId],
    queryFn: () => patientApi.getActiveEmergency(patientId!),
    enabled: !!patientId,
    refetchInterval: 15000, // Poll every 15s to keep it fresh
  });
}
