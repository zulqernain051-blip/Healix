import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { ApiError } from '../types/api';
import { secureStorage } from '../utils/secureStorage';

export const getApiUrl = () => {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  if (Platform.OS === 'web') return 'http://localhost:3000/api/v1';

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:3000/api/v1`;
    }
  }

  return Platform.select({
    android: 'http://10.0.2.2:3000/api/v1',
    default: 'http://localhost:3000/api/v1',
  });
};

export const API_URL = getApiUrl();

interface FetchOptions extends RequestInit {
  retry?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

export const apiClient = {
  async fetch(endpoint: string, options: FetchOptions = {}): Promise<Response> {
    const { retry = true, ...customOptions } = options;
    const { getSessionVersion } = await import('../store/auth');
    const version = getSessionVersion();
    const token = await secureStorage.getItemAsync('token');
    const headers = new Headers(customOptions.headers);
    if (customOptions.body instanceof FormData) headers.delete('Content-Type');
    else if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', 'Bearer ' + token);
    const config: RequestInit = { ...customOptions, headers };
    const url = endpoint.startsWith('http') ? endpoint : API_URL + endpoint;
    let response = await fetch(url, config);
    if (version !== getSessionVersion()) throw new ApiError('Session changed', 401);
    if (response.status === 401 && retry && token) {
      const currentToken = await secureStorage.getItemAsync('token');
      // A slow response may arrive after another request has already rotated tokens.
      if (currentToken === token) {
        if (!refreshPromise) refreshPromise = this.refreshToken().finally(() => { refreshPromise = null; });
        if (!await refreshPromise) throw await this.parseError(response);
      }
      const refreshedToken = await secureStorage.getItemAsync('token');
      if (!refreshedToken) throw await this.parseError(response);
      headers.set('Authorization', 'Bearer ' + refreshedToken);
      response = await fetch(url, config);
    }
    if (!response.ok) throw await this.parseError(response);
    return response;
  },

  async parseError(response: Response): Promise<ApiError> {
    let errorMessage = 'An error occurred';
    let fieldErrors = undefined;
    let rawErrors = null;

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      errorMessage = data.message || errorMessage;
      fieldErrors = data.errors;
      rawErrors = data;
    } catch {
      errorMessage = text || response.statusText || errorMessage;
    }

    return new ApiError(errorMessage, response.status, fieldErrors, rawErrors);
  },

  async refreshToken(): Promise<boolean> {
    try {
      const refreshTokenStr = await secureStorage.getItemAsync('refreshToken');
      const { useAuthStore, getSessionVersion } = await import('../store/auth');
      const version = getSessionVersion();
      if (!refreshTokenStr) { await useAuthStore.getState().clearSession(); return false; }
      const response = await fetch(API_URL + '/auth/refresh', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenStr }),
      });
      // Never revive a signed-out session or overwrite a different account.
      if (getSessionVersion() !== version || await secureStorage.getItemAsync('refreshToken') !== refreshTokenStr) return false;
      if (response.ok) {
        const result = await response.json();
        if (getSessionVersion() !== version) return false;
        const tokens = result.data;
        if (result.success && tokens?.accessToken && tokens?.refreshToken) {
          await secureStorage.setItemAsync('token', tokens.accessToken);
          await secureStorage.setItemAsync('refreshToken', tokens.refreshToken);
          useAuthStore.setState({ accessToken: tokens.accessToken });
          return true;
        }
      }
      if (response.status === 401 || response.status === 403 || response.ok) {
        await useAuthStore.getState().clearSession();
      }
      return false;
    } catch {
      // Keep the stored session when the network is temporarily unavailable.
      return false;
    }
  },

  async get<T = any>(endpoint: string, options?: FetchOptions): Promise<T> {
    const response = await this.fetch(endpoint, { ...options, method: 'GET' });
    if (response.status === 204) return undefined as T;
    const data = await response.json();
    return data.success ? data.data : data;
  },

  async post<T = any>(endpoint: string, body: any, options?: FetchOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    
    // Automatically remove Content-Type if it's FormData so fetch sets boundary correctly
    const headers = new Headers(options?.headers);
    if (isFormData) {
      headers.delete('Content-Type');
    }

    const response = await this.fetch(endpoint, {
      ...options,
      headers: isFormData ? headers : options?.headers,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
    if (response.status === 204) return undefined as T;
    const data = await response.json();
    return data.success ? data.data : data;
  },

  async put<T = any>(endpoint: string, body: any, options?: FetchOptions): Promise<T> {
    const response = await this.fetch(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
    if (response.status === 204) return undefined as T;
    const data = await response.json();
    return data.success ? data.data : data;
  },

  async delete<T = any>(endpoint: string, options?: FetchOptions): Promise<T> {
    const response = await this.fetch(endpoint, { ...options, method: 'DELETE' });
    if (response.status === 204) return undefined as T;
    const data = await response.json();
    return data.success ? data.data : data;
  },
};
