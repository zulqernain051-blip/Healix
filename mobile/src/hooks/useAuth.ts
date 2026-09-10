import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth';

export const useLogin = () => {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data: any) => {
      if (data.mfaRequired) {
        return;
      }
      await setSession(data.user, data.tokens.accessToken, data.tokens.refreshToken);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: authApi.verifyOtp,
  });
};

export const useGetMe = (enabled = true) => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogout = () => {
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: async () => {
      const { secureStorage } = require('../utils/secureStorage');
      const refreshToken = await secureStorage.getItemAsync('refreshToken');
      if (refreshToken) {
        try {
          await authApi.logout({ refreshToken });
        } catch(e) {}
      }
      await clearSession();
    },
    onSuccess: () => {
      // The _layout auth guard will redirect automatically
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
  });
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: authApi.resendOtp,
  });
};
