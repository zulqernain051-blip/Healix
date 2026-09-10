import { Role, UserStatus } from '@prisma/client';

export interface RegisterPayload {
  email: string;
  phone: string;
  fullName: string;
  password: string;
  role: Role;
  cnic?: string;
  pncNumber?: string;  // For Nurse only
  pmdcNumber?: string; // For Doctor only
}

export interface VerifyOtpPayload {
  emailOrPhone: string;
  code: string;
}

export interface ResendOtpPayload {
  emailOrPhone: string;
}

export interface LoginPayload {
  emailOrPhone: string;
  password: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  patientId?: string;
  nurseId?: string;
  doctorId?: string;
}
