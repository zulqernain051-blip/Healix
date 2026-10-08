export interface AdminStats {
  totalUsers: number;
  totalPatients: number;
  totalNurses: number;
  totalDoctors: number;
  pendingNurseVerifications: number;
  pendingDoctorVerifications: number;
  openRequests: number;
}

export interface AdminUser {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: 'PATIENT' | 'NURSE' | 'DOCTOR' | 'ADMIN';
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface AdminNurse {
  id: string;
  userId: string;
  cnic: string;
  pncNumber: string;
  licenseNumber?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'REVOKED';
  rejectionReason?: string;
  user: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface AdminDoctor {
  id: string;
  userId: string;
  cnic: string;
  pmdcNumber: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'REVOKED';
  rejectionReason?: string;
  user: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface AuditLog {
  id: string;
  actorId: string;
  targetId?: string;
  action: string;
  details?: string;
  createdAt: string;
}

export interface AdminCareRequest {
  id: string;
  patientId: string;
  serviceType: string;
  status: string;
  createdAt: string;
}

export interface AdminOffer {
  id: string;
  requestId: string;
  providerId: string;
  status: string;
  amount: number;
}

export interface AdminContract {
  id: string;
  requestId: string;
  providerId: string;
  patientId: string;
  status: string;
  createdAt: string;
}

export interface AdminVisit {
  id: string;
  contractId: string;
  status: string;
  scheduledTime: string;
}

export interface AdminHospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacityStatus: string;
  affordabilityTier: string;
  isCharity: boolean;
  location?: string;
  capacity?: number;
}

export interface AdminAmbulance {
  id: string;
  plateNumber: string;
  status: string;
  driverName?: string;
}

export interface AdminEmergency {
  id: string;
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  status: string; // ACTIVE, RESOLVED, CANCELLED
  source?: string;
  severity?: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  slaBreach: boolean;
  slaDeadline?: string;
  createdAt: string;
  resolvedAt?: string;
  activeDispatch?: {
    id: string;
    status: string; // PENDING, DISPATCHED, EN_ROUTE, ARRIVED, COMPLETED, CANCELLED
    etaMinutes: number;
    dispatchedAt: string;
    arrivedAt?: string;
    completedAt?: string;
    ambulance?: {
      id: string;
      vehicleNumber: string;
      plateNumber: string;
      type: string;
      status: string;
    } | null;
    paramedic?: {
      id: string;
      name: string;
      phone?: string;
      certificationNumber: string;
    } | null;
    hospital?: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export interface AdminReview {
  id: string;
  reviewerId: string;
  targetId: string;
  rating: number;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'HIDDEN';
}
