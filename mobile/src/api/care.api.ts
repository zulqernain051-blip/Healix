import { apiClient } from './client';
import { 
  CreateCareRequestDto, 
  CareRequestResponse, 
  RescheduleRequestDto, 
  CancelRequestDto 
} from '../types/care';

export const careApi = {
  createCareRequest: async (data: CreateCareRequestDto) => {
    return apiClient.post<CareRequestResponse>('/patients/requests', data);
  },

  getCareRequests: async () => {
    return apiClient.get<CareRequestResponse[]>('/patients/requests');
  },

  getCareRequestDetails: async (id: string) => {
    return apiClient.get<CareRequestResponse>(`/patients/requests/${id}`);
  },

  cancelCareRequest: async (id: string, data: CancelRequestDto) => {
    return apiClient.put<any>(`/patients/requests/${id}/cancel`, data);
  },

  rescheduleCareRequest: async (id: string, data: RescheduleRequestDto) => {
    return apiClient.put<any>(`/patients/requests/${id}/reschedule`, data);
  },
};
