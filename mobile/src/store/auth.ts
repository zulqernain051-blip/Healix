import { queryClient } from '../lib/queryClient';
import { create } from 'zustand';
import { User } from '../types/auth';
import { secureStorage } from '../utils/secureStorage';

let sessionVersion = 0;
export const getSessionVersion = () => sessionVersion;

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isInitializing: boolean;
  setSession: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  clearSession: () => Promise<void>;
  logout: () => Promise<void>;
  setInitializing: (isInit: boolean) => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isInitializing: true,

  setSession: async (user: User, accessToken: string, refreshToken: string) => {
    sessionVersion += 1;
    queryClient.clear();
    await secureStorage.setItemAsync('token', accessToken);
    await secureStorage.setItemAsync('refreshToken', refreshToken);
    set({ user, accessToken, isInitializing: false });
  },

  clearSession: async () => {
    sessionVersion += 1;
    set({ user: null, accessToken: null, isInitializing: false });
    queryClient.clear();
    await Promise.all([secureStorage.deleteItemAsync('token'), secureStorage.deleteItemAsync('refreshToken')]);
    const { disconnectSocket } = await import('../services/socket');
    disconnectSocket();
  },

  logout: async () => {
    const refreshToken = await secureStorage.getItemAsync('refreshToken');
    await get().clearSession();
    if (refreshToken) {
      try { const { authApi } = await import('../api/auth.api'); await authApi.logout({ refreshToken }); } catch { /* Local session is cleared even if offline. */ }
    }
  },

  setInitializing: (isInit: boolean) => {
    set({ isInitializing: isInit });
  },

  loadUser: async () => {
    const version = sessionVersion;
    try {
      const token = await secureStorage.getItemAsync('token');
      if (!token) {
        set({ user: null, accessToken: null, isInitializing: false });
        return;
      }
      
      // Import here to avoid circular dependencies if any
      const { authApi } = require('../api/auth.api');
      const data = await authApi.getMe();
      if (version !== sessionVersion) return;
      if (data && data.id) {
        const currentToken = await secureStorage.getItemAsync('token');
        if (currentToken) set({ user: data, accessToken: currentToken, isInitializing: false });
        else set({ user: null, accessToken: null, isInitializing: false });
      } else {
        set({ user: null, accessToken: null, isInitializing: false });
      }
    } catch (e) {
      if (version === sessionVersion) set({ user: null, accessToken: null, isInitializing: false });
    }
  }
}));
