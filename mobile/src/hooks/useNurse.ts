import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nurseApi } from '../api/nurse.api';

// Queries
export function useNurseProfile(nurseId: string) {
  return useQuery({
    queryKey: ['nurse', nurseId, 'profile'],
    queryFn: () => nurseApi.getProfile(nurseId),
    enabled: !!nurseId,
  });
}

export function useNurseVerification(nurseId: string) {
  return useQuery({
    queryKey: ['nurse', nurseId, 'verification'],
    queryFn: () => nurseApi.getVerificationStatus(nurseId),
    enabled: !!nurseId,
  });
}

export function useNurseAvailability(nurseId: string) {
  return useQuery({
    queryKey: ['nurse', nurseId, 'availability'],
    queryFn: () => nurseApi.getAvailability(nurseId),
    enabled: !!nurseId,
  });
}

export function useNurseEarnings(nurseId: string) {
  return useQuery({
    queryKey: ['nurse', nurseId, 'earnings'],
    queryFn: () => nurseApi.getEarnings(nurseId),
    enabled: !!nurseId,
  });
}

export function useNurseScore(nurseId: string) {
  return useQuery({
    queryKey: ['nurse', nurseId, 'score'],
    queryFn: () => nurseApi.getScore(nurseId),
    enabled: !!nurseId,
  });
}

export function useNurseReviews(nurseId: string) {
  return useQuery({
    queryKey: ['nurse', nurseId, 'reviews'],
    queryFn: () => nurseApi.getReviews(nurseId),
    enabled: !!nurseId,
  });
}

export function useNurseBadges(nurseId: string) {
  return useQuery({
    queryKey: ['nurse', nurseId, 'badges'],
    queryFn: () => nurseApi.getBadges(nurseId),
    enabled: !!nurseId,
  });
}

// Mutations
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nurseId, data }: { nurseId: string; data: Parameters<typeof nurseApi.updateProfile>[1] }) =>
      nurseApi.updateProfile(nurseId, data),
    onSuccess: (_, { nurseId }) => {
      queryClient.invalidateQueries({ queryKey: ['nurse', nurseId, 'profile'] });
    },
  });
}

export function useAddQualification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nurseId, data }: { nurseId: string; data: Parameters<typeof nurseApi.addQualification>[1] }) =>
      nurseApi.addQualification(nurseId, data),
    onSuccess: (_, { nurseId }) => {
      queryClient.invalidateQueries({ queryKey: ['nurse', nurseId, 'profile'] });
    },
  });
}

export function useDeleteQualification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nurseId, qualId }: { nurseId: string; qualId: string }) =>
      nurseApi.deleteQualification(nurseId, qualId),
    onSuccess: (_, { nurseId }) => {
      queryClient.invalidateQueries({ queryKey: ['nurse', nurseId, 'profile'] });
    },
  });
}

export function useAddSpecialization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nurseId, data }: { nurseId: string; data: Parameters<typeof nurseApi.addSpecialization>[1] }) =>
      nurseApi.addSpecialization(nurseId, data),
    onSuccess: (_, { nurseId }) => {
      queryClient.invalidateQueries({ queryKey: ['nurse', nurseId, 'profile'] });
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nurseId, data }: { nurseId: string; data: { documentType: string; fileUrl: string } }) =>
      nurseApi.uploadDocument(nurseId, data),
    onSuccess: (_, { nurseId }) => {
      queryClient.invalidateQueries({ queryKey: ['nurse', nurseId, 'verification'] });
    },
  });
}

export function useAddAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nurseId, data }: { nurseId: string; data: Parameters<typeof nurseApi.addAvailabilitySlot>[1] }) =>
      nurseApi.addAvailabilitySlot(nurseId, data),
    onSuccess: (_, { nurseId }) => {
      queryClient.invalidateQueries({ queryKey: ['nurse', nurseId, 'availability'] });
    },
  });
}

export function useDeleteAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nurseId, slotId }: { nurseId: string; slotId: string }) =>
      nurseApi.deleteAvailabilitySlot(nurseId, slotId),
    onSuccess: (_, { nurseId }) => {
      queryClient.invalidateQueries({ queryKey: ['nurse', nurseId, 'availability'] });
    },
  });
}

export function useAddVacation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nurseId, data }: { nurseId: string; data: Parameters<typeof nurseApi.addVacation>[1] }) =>
      nurseApi.addVacation(nurseId, data),
    onSuccess: (_, { nurseId }) => {
      queryClient.invalidateQueries({ queryKey: ['nurse', nurseId, 'vacations'] });
    },
  });
}
