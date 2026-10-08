import { apiClient } from './client';

export interface Hospital { id: string; name: string; latitude: number; longitude: number; capacityStatus: string; affordabilityTier: string; isCharity: boolean; capacityUpdatedAt: string; distance?: number; staleCapacityWarning?: boolean }
export interface Ambulance { id: string; vehicleNumber: string; plateNumber: string; type: string; provider?: string; contactNumber?: string; status: string; dispatches?: { id: string; status: string }[] }
export interface Dispatch { id: string; status: string; etaMinutes: number; dispatchedAt: string; etaUpdatedAt?: string; latitude?: number; longitude?: number; locationUpdatedAt?: string; notes?: string; ambulance?: Ambulance; hospital: Hospital; patient: { user: { fullName: string; phone?: string } }; paramedic?: { user: { fullName: string } }; admissions: { id: string; status: string; dischargeNotes?: string }[] }
export const emergencyApi = {
  list: () => apiClient.get<Dispatch[]>('/dispatch'),
  tracking: (id: string) => apiClient.get(`/dispatch/${id}/tracking`),
  status: (id: string, status: string, notes?: string) => apiClient.put(`/dispatch/${id}/status`, { status, notes }),
  location: (id: string, latitude: number, longitude: number, etaMinutes?: number) => apiClient.put(`/dispatch/${id}/location`, { latitude, longitude, etaMinutes }),
  admission: (id: string) => apiClient.post(`/dispatch/${id}/admission`, {}),
  admissionStatus: (id: string, status: string, dischargeNotes?: string) => apiClient.put(`/admissions/${id}/status`, { status, dischargeNotes }),
  hospitals: (patientId: string, latitude: number, longitude: number, affordabilityTier: string) => apiClient.get<Hospital[]>(`/hospitals/recommend?${new URLSearchParams({ patientId, latitude: String(latitude), longitude: String(longitude), affordabilityTier })}`),
  fleet: () => apiClient.get<Ambulance[]>('/admin/ambulances'),
  saveVehicle: (id: string | undefined, data: Record<string, unknown>) => id ? apiClient.put(`/admin/ambulances/${id}`, data) : apiClient.post('/admin/ambulances', data),
  deleteVehicle: (id: string) => apiClient.delete(`/admin/ambulances/${id}`),
};
