import { apiClient } from './client';
import { PatientProfile, UpdateProfileDTO, CreateEmergencyContactDTO } from '../types/patient';

export const patientApi = {
  getProfile: (patientId: string) => 
    apiClient.get<PatientProfile>(`/patients/${patientId}/profile`),

  updateProfile: (patientId: string, data: UpdateProfileDTO) =>
    apiClient.put<PatientProfile>(`/patients/${patientId}/profile`, data),

  addEmergencyContact: (patientId: string, data: CreateEmergencyContactDTO) =>
    apiClient.post<PatientProfile>(`/patients/${patientId}/emergency-contacts`, data),

  deleteEmergencyContact: (patientId: string, contactId: string) =>
    apiClient.delete<PatientProfile>(`/patients/${patientId}/emergency-contacts/${contactId}`),

  searchUserByPhone: (phone: string) =>
    apiClient.get<any>(`/patients/users/search-phone?phone=${encodeURIComponent(phone)}`),

  getActiveEmergency: (patientId: string) =>
    apiClient.get<any>(`/patients/${patientId}/emergency/active`),
};
