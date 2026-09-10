import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careApi } from '../api/care.api';
import { CreateCareRequestDto, RescheduleRequestDto, CancelRequestDto } from '../types/care';

export const CARE_REQUESTS_KEY = ['careRequests'];

export const useCareRequests = () => {
  return useQuery({
    queryKey: CARE_REQUESTS_KEY,
    queryFn: async () => {
      const response = await careApi.getCareRequests();
      return response || [];
    },
  });
};

export const useCareRequestDetails = (id: string) => {
  return useQuery({
    queryKey: [...CARE_REQUESTS_KEY, id],
    queryFn: async () => {
      const response = await careApi.getCareRequestDetails(id);
      return response;
    },
    enabled: !!id,
    // Poll every 10 seconds to keep request status up to date (e.g. ASSIGNED, COMPLETED)
    refetchInterval: 10000,
  });
};

export const useCreateCareRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCareRequestDto) => careApi.createCareRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARE_REQUESTS_KEY });
    },
  });
};

export const useCancelCareRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelRequestDto }) => careApi.cancelCareRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CARE_REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: [...CARE_REQUESTS_KEY, variables.id] });
    },
  });
};

export const useRescheduleCareRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RescheduleRequestDto }) => careApi.rescheduleCareRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CARE_REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: [...CARE_REQUESTS_KEY, variables.id] });
    },
  });
};
