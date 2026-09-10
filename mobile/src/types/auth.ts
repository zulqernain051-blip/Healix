export type Role = 'PATIENT' | 'NURSE' | 'DOCTOR' | 'ADMIN' | 'PARAMEDIC';
export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  patientId?: string;
  nurseId?: string;
  doctorId?: string;
  adminId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterResponse {
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
