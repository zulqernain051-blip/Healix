import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

// Queries
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getDashboardStats(),
  });
}

export function useAdminUsers(role?: string) {
  return useQuery({
    queryKey: ['admin', 'users', role],
    queryFn: () => adminApi.getUsers(role),
  });
}

export function useAdminPatients() {
  return useAdminUsers('PATIENT');
}

export function useAdminParamedics() {
  return useAdminUsers('PARAMEDIC');
}

export function useAdminNurses() {
  return useQuery({
    queryKey: ['admin', 'nurses'],
    queryFn: () => adminApi.getNurses(),
  });
}

export function useAdminPendingNurses() {
  return useQuery({
    queryKey: ['admin', 'nurses', 'pending'],
    queryFn: () => adminApi.getPendingNurses(),
  });
}

export function useAdminDoctors() {
  return useQuery({
    queryKey: ['admin', 'doctors'],
    queryFn: () => adminApi.getDoctors(),
  });
}

export function useAdminPendingDoctors() {
  return useQuery({
    queryKey: ['admin', 'doctors', 'pending'],
    queryFn: () => adminApi.getPendingDoctors(),
  });
}

export function useAdminAuditLogs() {
  return useQuery({
    queryKey: ['admin', 'audit-logs'],
    queryFn: () => adminApi.getAuditLogs(),
  });
}

// Mutations
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      adminApi.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useApproveNurse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nurseId: string) => adminApi.approveNurse(nurseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'nurses'] });
    },
  });
}

export function useRejectNurse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nurseId, reason }: { nurseId: string; reason: string }) =>
      adminApi.rejectNurse(nurseId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'nurses'] });
    },
  });
}

export function useRevokeNurse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nurseId, reason }: { nurseId: string; reason: string }) =>
      adminApi.revokeNurse(nurseId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'nurses'] });
    },
  });
}

export function useApproveDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (doctorId: string) => adminApi.approveDoctor(doctorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors'] });
    },
  });
}

export function useRejectDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ doctorId, reason }: { doctorId: string; reason: string }) =>
      adminApi.rejectDoctor(doctorId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors'] });
    },
  });
}

export function useRevokeDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ doctorId, reason }: { doctorId: string; reason: string }) =>
      adminApi.revokeDoctor(doctorId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors'] });
    },
  });
}


export function useAdminCases(status?: string) {
  return useQuery({
    queryKey: ['admin', 'cases', status],
    queryFn: () => adminApi.getClinicalCases(status),
  });
}

export function useOverrideCaseAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, doctorId, reason }: { caseId: string; doctorId: string; reason: string }) =>
      adminApi.overrideCaseAssignment(caseId, doctorId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cases'] });
    },
  });
}

export function useAdminConfig() {
  return useQuery({
    queryKey: ['admin', 'config'],
    queryFn: () => adminApi.getConfig(),
  });
}

export function useUpdateAdminConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      adminApi.updateConfig(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'config'] });
    },
  });
}

// Care Operations
export function useAdminCareRequests() {
  return useQuery({ queryKey: ['admin', 'care-requests'], queryFn: () => adminApi.getCareRequests() });
}

export function useAdminOffers() {
  return useQuery({ queryKey: ['admin', 'offers'], queryFn: () => adminApi.getMarketplaceOffers() });
}

export function useAdminContracts() {
  return useQuery({ queryKey: ['admin', 'contracts'], queryFn: () => adminApi.getContracts() });
}

export function useAdminVisits() {
  return useQuery({ queryKey: ['admin', 'visits'], queryFn: () => adminApi.getVisits() });
}

// Emergencies
export function useAdminEmergencies() {
  return useQuery({
    queryKey: ['admin', 'emergencies'],
    queryFn: () => adminApi.getActiveEmergencies(),
    refetchInterval: 5000,
  });
}

export function useEscalateEmergency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.escalateEmergency(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'emergencies'] }),
  });
}

export function useAssignEmergencyDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, doctorId }: { id: string; doctorId: string }) => adminApi.assignEmergencyDoctor(id, doctorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'emergencies'] }),
  });
}

// Network (Hospitals)
export function useAdminHospitals() {
  return useQuery({ queryKey: ['admin', 'hospitals'], queryFn: () => adminApi.getHospitals() });
}

export function useCreateHospital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.createHospital(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'hospitals'] }),
  });
}

export function useUpdateHospital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateHospital(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'hospitals'] }),
  });
}

export function useDeleteHospital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteHospital(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'hospitals'] }),
  });
}


// Reviews (Moderation)
export function useAdminReviews() {
  return useQuery({ queryKey: ['admin', 'reviews'], queryFn: () => adminApi.getReviews() });
}

export function useModerateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'APPROVED' | 'HIDDEN' }) => adminApi.moderateReview(id, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  });
}


export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.createDoctor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors'] });
    },
  });
}

export function useCreateParamedic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.createParamedic(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'paramedics'] });
    },
  });
}

export function useInviteUser() {
  return useMutation({
    mutationFn: (data: { email?: string; phone?: string; role: 'DOCTOR' | 'PARAMEDIC' }) => adminApi.inviteUser(data),
  });
}
