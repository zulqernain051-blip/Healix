import { apiClient } from './client';
import { 
  MedicalHistoryResponse, 
  ConditionDTO, 
  AllergyDTO, 
  MedicationDTO,
  Prescription,
  CarePlan,
  CaregiverLink
} from '../types/health';

export const healthApi = {
  getMedicalHistory: (patientId: string) => 
    apiClient.get<MedicalHistoryResponse>(`/patients/${patientId}/medical-history`),

  addCondition: (patientId: string, data: ConditionDTO) =>
    apiClient.post<MedicalHistoryResponse>(`/patients/${patientId}/conditions`, data),

  addAllergy: (patientId: string, data: AllergyDTO) =>
    apiClient.post<MedicalHistoryResponse>(`/patients/${patientId}/allergies`, data),

  addMedication: (patientId: string, data: MedicationDTO) =>
    apiClient.post<MedicalHistoryResponse>(`/patients/${patientId}/medications`, data),

  getPrescriptions: (patientId: string) =>
    apiClient.get<Prescription[]>(`/patients/${patientId}/prescriptions`),

  getCarePlans: (patientId: string) =>
    apiClient.get<CarePlan[]>(`/patients/${patientId}/care-plans`),

  getCaregivers: (patientId: string) =>
    apiClient.get<CaregiverLink[]>(`/patients/${patientId}/caregivers`),

  getClinicalOutcomes: (patientId: string) =>
    apiClient.get<any[]>(`/patients/${patientId}/clinical-outcomes`),

  completeMilestone: (milestoneId: string) =>
    apiClient.put(`/care-plans/milestones/${milestoneId}/complete`, {}),
};
