import { apiClient } from './client';
import { User, LoginResponse, RegisterResponse, AuthTokens } from '../types/auth';

export const authApi = {
  login: async (credentials: { emailOrPhone: string; password: string }) => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  register: async (data: Record<string, any>) => {
    return apiClient.post<RegisterResponse>('/auth/register', data);
  },

  verifyOtp: async (data: { emailOrPhone: string; code: string }) => {
    return apiClient.post<{ success: boolean; message: string }>('/auth/verify-otp', data);
  },

  resendOtp: async (data: { emailOrPhone: string }) => {
    return apiClient.post<{ success: boolean; message: string }>('/auth/resend-otp', data);
  },

  getMe: async () => {
    return apiClient.get<User>('/auth/me');
  },
  
  logout: async (data: { refreshToken: string }) => {
    return apiClient.post('/auth/logout', data);
  },

  forgotPassword: async (data: { emailOrPhone: string }) => {
    return apiClient.post<{ success: boolean; message: string }>('/auth/forgot-password', data);
  },

  resetPassword: async (data: { emailOrPhone: string; code: string; password: string }) => {
    return apiClient.post<{ success: boolean; message: string }>('/auth/reset-password', data);
  },

  changePassword: async (data: { oldPassword: string; newPassword: string }) => {
    return apiClient.post<{ success: boolean; message: string }>('/auth/change-password', data);
  },

  verifyMfaLogin: async (data: { emailOrPhone: string; code: string }) => {
    return apiClient.post<{ success: boolean; tokens: any; user: any }>('/auth/verify-mfa-login', data);
  }
};
