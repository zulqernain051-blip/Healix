import { create } from 'zustand';
import { User } from '../types/auth';
import { secureStorage } from '../utils/secureStorage';

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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isInitializing: true,

  setSession: async (user: User, accessToken: string, refreshToken: string) => {
    await secureStorage.setItemAsync('token', accessToken);
    await secureStorage.setItemAsync('refreshToken', refreshToken);
    set({ user, accessToken, isInitializing: false });
  },

  clearSession: async () => {
    await secureStorage.deleteItemAsync('token');
    await secureStorage.deleteItemAsync('refreshToken');
    set({ user: null, accessToken: null, isInitializing: false });
  },

  logout: async () => {
    await secureStorage.deleteItemAsync('token');
    await secureStorage.deleteItemAsync('refreshToken');
    set({ user: null, accessToken: null, isInitializing: false });
  },

  setInitializing: (isInit: boolean) => {
    set({ isInitializing: isInit });
  },

  loadUser: async () => {
    try {
      const token = await secureStorage.getItemAsync('token');
      if (!token) {
        set({ isInitializing: false });
        return;
      }
      
      // Import here to avoid circular dependencies if any
      const { authApi } = require('../api/auth.api');
      const data = await authApi.getMe();
      if (data && data.id) {
        set({ user: data, accessToken: token, isInitializing: false });
      } else {
        set({ user: null, accessToken: null, isInitializing: false });
      }
    } catch (e) {
      set({ user: null, accessToken: null, isInitializing: false });
    }
  }
}));
