import { apiClient } from './client';
import { User, LoginResponse, RegisterResponse } from '../types/auth';

export const authApi = {
  login: async (credentials: { emailOrPhone: string; password: string }) => {
    return apiClient.post<LoginResponse>('/auth/login', credentials, { retry: false });
  },
  googleLogin: (data: { credential: string }) => apiClient.post<any>('/auth/google', data, { retry: false }),

  register: async (data: Record<string, any>) => {
    return apiClient.post<RegisterResponse>('/auth/register', data, { retry: false });
  },

  verifyOtp: async (data: { emailOrPhone: string; code: string }) => {
    return apiClient.post<{ userId: string; role: string; status: string }>('/auth/verify-otp', data, { retry: false });
  },

  resendOtp: async (data: { emailOrPhone: string }) => {
    return apiClient.post<{ success: boolean; message: string }>('/auth/resend-otp', data, { retry: false });
  },

  getMe: async () => {
    return apiClient.get<User>('/auth/me');
  },
  
  logout: async (data: { refreshToken: string }) => {
    return apiClient.post('/auth/logout', data);
  },

  forgotPassword: async (data: { emailOrPhone: string }) => {
    return apiClient.post<{ success: boolean; message: string }>('/auth/forgot-password', data, { retry: false });
  },

  resetPassword: async (data: { emailOrPhone: string; code: string; password: string }) => {
    return apiClient.post<{ success: boolean; message: string }>('/auth/reset-password', data, { retry: false });
  },

  changePassword: async (data: { oldPassword: string; newPassword: string }) => {
    return apiClient.post<{ success: boolean; message: string }>('/auth/change-password', data);
  },

  registerInvited: (data: Record<string, unknown>) => apiClient.post('/auth/register-invited', data, { retry: false }),
  enableMfa: () => apiClient.post('/auth/mfa/enable', {}, { retry: false }),
  verifyEnableMfa: (code: string) => apiClient.post('/auth/mfa/verify-enable', { code }, { retry: false }),
  requestDisableMfa: () => apiClient.post('/auth/mfa/request-disable', {}, { retry: false }),
  disableMfa: (code: string) => apiClient.post('/auth/mfa/disable', { code }, { retry: false }),
  verifyMfaLogin: async (data: { emailOrPhone: string; code: string }) => {
    return apiClient.post<{ success: boolean; tokens: any; user: any }>('/auth/verify-mfa-login', data, { retry: false });
  }
};
