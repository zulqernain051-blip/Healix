import { apiClient } from './client';
import {
  Contract,
  CreateContractDto,
  RejectContractDto,
  CancelContractDto,
} from '../types/contract';

export const contractsApi = {
  createContract: (data: CreateContractDto) =>
    apiClient.post<Contract>('/contracts', data),

  getContract: (id: string) =>
    apiClient.get<Contract>(`/contracts/${id}`),

  getPatientContracts: (patientId: string) =>
    apiClient.get<Contract[]>(`/patients/${patientId}/contracts`),

  getNurseContracts: (nurseId: string) =>
    apiClient.get<Contract[]>(`/nurses/${nurseId}/contracts`),

  approveContract: (id: string) =>
    apiClient.put<Contract>(`/contracts/${id}/approve`, {}),

  rejectContract: (id: string, data: RejectContractDto) =>
    apiClient.put<Contract>(`/contracts/${id}/reject`, data),

  cancelContract: (id: string, data: CancelContractDto) =>
    apiClient.put<Contract>(`/contracts/${id}/cancel`, data),
};
