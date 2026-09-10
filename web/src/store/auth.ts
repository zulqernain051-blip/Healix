import { create } from 'zustand';

const BASE = '/api/v1';

interface AuthState {
  token: string | null;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('healix_web_token'),
  user: (() => { try { return JSON.parse(localStorage.getItem('healix_web_user') || 'null'); } catch { return null; } })(),

  login: async (email, password) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Login failed');

    const { accessToken, user } = data.data;
    localStorage.setItem('healix_web_token', accessToken);
    localStorage.setItem('healix_web_user', JSON.stringify(user));
    set({ token: accessToken, user });
  },

  logout: () => {
    localStorage.removeItem('healix_web_token');
    localStorage.removeItem('healix_web_user');
    set({ token: null, user: null });
  },
}));

// API helper
export const api = async (method: string, path: string, body?: any) => {
  const token = localStorage.getItem('healix_web_token');
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Request failed');
  return data.data;
};
