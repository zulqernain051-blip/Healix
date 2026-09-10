import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractsApi } from '../api/contracts.api';
import { CreateContractDto, RejectContractDto, CancelContractDto } from '../types/contract';

export const CONTRACT_KEYS = {
  all: ['contracts'] as const,
  detail: (id: string) => [...CONTRACT_KEYS.all, id] as const,
  patientList: (patientId: string) => [...CONTRACT_KEYS.all, 'patient', patientId] as const,
  nurseList: (nurseId: string) => [...CONTRACT_KEYS.all, 'nurse', nurseId] as const,
};

export const useContract = (id: string, options?: { pollingInterval?: number }) => {
  return useQuery({
    queryKey: CONTRACT_KEYS.detail(id),
    queryFn: () => contractsApi.getContract(id),
    enabled: !!id,
    refetchInterval: options?.pollingInterval,
  });
};

export const usePatientContracts = (patientId: string, options?: { pollingInterval?: number }) => {
  return useQuery({
    queryKey: CONTRACT_KEYS.patientList(patientId),
    queryFn: () => contractsApi.getPatientContracts(patientId),
    enabled: !!patientId,
    refetchInterval: options?.pollingInterval,
  });
};

export const useNurseContracts = (nurseId: string, options?: { pollingInterval?: number }) => {
  return useQuery({
    queryKey: CONTRACT_KEYS.nurseList(nurseId),
    queryFn: () => contractsApi.getNurseContracts(nurseId),
    enabled: !!nurseId,
    refetchInterval: options?.pollingInterval,
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateContractDto) => contractsApi.createContract(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.all });
    },
  });
};

export const useApproveContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contractsApi.approveContract(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.all });
    },
  });
};

export const useRejectContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectContractDto }) => contractsApi.rejectContract(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.all });
    },
  });
};

export const useCancelContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelContractDto }) => contractsApi.cancelContract(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.all });
    },
  });
};
