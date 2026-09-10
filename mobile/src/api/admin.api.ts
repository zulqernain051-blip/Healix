import { apiClient } from './client';
import { 
  AdminStats, AdminUser, AdminNurse, AdminDoctor, AuditLog, 
  AdminCareRequest, AdminOffer, AdminContract, AdminVisit,
  AdminHospital, AdminAmbulance, AdminEmergency, AdminReview
} from '../types/admin';

export const adminApi = {
  getDashboardStats: () => apiClient.get<AdminStats>('/admin/stats'),

  getUsers: (role?: string) => apiClient.get<AdminUser[]>('/admin/users' + (role ? `?role=${role}` : '')),

  updateUserStatus: (userId: string, status: string, reason: string = 'Status updated by admin') =>
    apiClient.put(`/admin/users/${userId}/status`, { status, reason }),

  deleteUser: (userId: string, reason: string = 'Deleted by admin') => apiClient.delete(`/admin/users/${userId}`, { data: { reason } }),

  getNurses: () => apiClient.get<AdminNurse[]>('/admin/nurses'),

  getPendingNurses: () => apiClient.get<AdminNurse[]>('/admin/nurses/pending'),

  approveNurse: (nurseId: string) =>
    apiClient.put(`/admin/nurses/${nurseId}/approve`, {}),

  rejectNurse: (nurseId: string, reason: string) =>
    apiClient.put(`/admin/nurses/${nurseId}/reject`, { reason }),

  revokeNurse: (nurseId: string, reason: string) =>
    apiClient.put(`/admin/nurses/${nurseId}/revoke`, { reason }),

  getDoctors: () => apiClient.get<AdminDoctor[]>('/admin/doctors'),

  getPendingDoctors: () => apiClient.get<AdminDoctor[]>('/admin/doctors/pending'),

  createDoctor: (data: any) => apiClient.post('/admin/users/doctor', data),
  createParamedic: (data: any) => apiClient.post('/admin/users/paramedic', data),
  inviteUser: (data: { email?: string; phone?: string; role: 'DOCTOR' | 'PARAMEDIC' }) => apiClient.post('/admin/users/invite', data),

  approveDoctor: (doctorId: string) =>
    apiClient.put(`/admin/doctors/${doctorId}/approve`, {}),

  rejectDoctor: (doctorId: string, reason: string) =>
    apiClient.put(`/admin/doctors/${doctorId}/reject`, { reason }),

  revokeDoctor: (doctorId: string, reason: string) =>
    apiClient.put(`/admin/doctors/${doctorId}/revoke`, { reason }),

  getAuditLogs: () => apiClient.get<AuditLog[]>('/admin/audit-logs'),

  getConfig: () => apiClient.get<any[]>('/admin/config'),

  updateConfig: (key: string, value: any, changeReason: string = 'Updated by admin') => apiClient.put(`/admin/config/${key}`, { value, changeReason }),

  // Clinical Cases
  getClinicalCases: (status?: string) => apiClient.get<any[]>('/admin/cases' + (status ? `?status=${status}` : '')),
  overrideCaseAssignment: (caseId: string, doctorId: string, reason: string) => apiClient.put<any>('/admin/cases/override-assignment', { caseId, doctorId, reason }),

  // Care Operations
  getCareRequests: () => apiClient.get<AdminCareRequest[]>('/admin/care-requests'),
  getMarketplaceOffers: () => apiClient.get<AdminOffer[]>('/admin/marketplace/offers'),
  getContracts: () => apiClient.get<AdminContract[]>('/admin/contracts'),
  getVisits: () => apiClient.get<AdminVisit[]>('/admin/visits'),

  // Emergencies
  getActiveEmergencies: () => apiClient.get<AdminEmergency[]>('/admin/emergencies?slaStatus=active'),
  escalateEmergency: (emergencyId: string) => apiClient.put(`/admin/emergencies/${emergencyId}/escalate`, {}), // TODO: Backend doesn't support this
  assignEmergencyDoctor: (emergencyId: string, doctorId: string) => apiClient.post(`/admin/emergencies/${emergencyId}/assign-doctor`, { doctorId }),

  // Network (Hospitals & Ambulances)
  getHospitals: () => apiClient.get<AdminHospital[]>('/admin/hospitals'),
  createHospital: (data: Partial<AdminHospital>) => apiClient.post('/admin/hospitals', data),
  updateHospital: (id: string, data: Partial<AdminHospital>) => apiClient.put(`/admin/hospitals/${id}`, data),
  deleteHospital: (id: string) => apiClient.delete(`/admin/hospitals/${id}`),



  // Moderation
  getReviews: () => apiClient.get<AdminReview[]>('/admin/reviews'),
  moderateReview: (reviewId: string, action: 'APPROVED' | 'HIDDEN') => apiClient.put(`/admin/reviews/${reviewId}/moderate`, { flagged: action === 'HIDDEN' }),
};
