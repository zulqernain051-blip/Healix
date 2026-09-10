import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { ApiError } from '../types/api';
import { secureStorage } from '../utils/secureStorage';

export const getApiUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:3000/api/v1';

  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.developer?.tool;
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

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

export const apiClient = {
  async fetch(endpoint: string, options: FetchOptions = {}): Promise<Response> {
    const { retry = true, ...customOptions } = options;
    const token = await secureStorage.getItemAsync('token');

    const headers: Record<string, string> = {
      ...((customOptions.headers as Record<string, string>) || {}),
    };

    if (!(customOptions.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...customOptions,
      headers,
    };

    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    let response = await fetch(url, config);

    if (response.status === 401 && retry) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(async (newToken: string) => {
          if (!newToken) {
            reject(new ApiError('Authentication failed', 401));
            return;
          }
          headers.Authorization = `Bearer ${newToken}`;
          config.headers = headers;
          try {
            const retryResponse = await fetch(url, config);
            if (!retryResponse.ok) {
              const err = await this.parseError(retryResponse);
              reject(err);
              return;
            }
            resolve(retryResponse);
          } catch (e) {
            reject(e);
          }
        });

        if (!isRefreshing) {
          isRefreshing = true;
          this.refreshToken().then((success) => {
            isRefreshing = false;
            if (success) {
              secureStorage.getItemAsync('token').then((t) => onRefreshed(t || ''));
            } else {
              onRefreshed('');
            }
          });
        }
      });
    }

    if (!response.ok) {
      throw await this.parseError(response);
    }

    return response;
  },

  async parseError(response: Response): Promise<ApiError> {
    let errorMessage = 'An error occurred';
    let fieldErrors = undefined;
    let rawErrors = null;

    try {
      const data = await response.json();
      errorMessage = data.message || errorMessage;
      fieldErrors = data.errors;
      rawErrors = data;
    } catch (e) {
      errorMessage = await response.text();
    }

    return new ApiError(errorMessage, response.status, fieldErrors, rawErrors);
  },

  async refreshToken(): Promise<boolean> {
    try {
      const refreshTokenStr = await secureStorage.getItemAsync('refreshToken');
      if (!refreshTokenStr) return false;

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenStr }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.accessToken) {
          await secureStorage.setItemAsync('token', data.data.accessToken);
          if (data.data.refreshToken) {
            await secureStorage.setItemAsync('refreshToken', data.data.refreshToken);
          }
          return true;
        }
      }
      
      // If refresh fails, clear tokens
      await secureStorage.deleteItemAsync('token');
      await secureStorage.deleteItemAsync('refreshToken');
      return false;
    } catch (e) {
      return false;
    }
  },

  async get<T = any>(endpoint: string, options?: FetchOptions): Promise<T> {
    const response = await this.fetch(endpoint, { ...options, method: 'GET' });
    const data = await response.json();
    return data.success ? data.data : data;
  },

  async post<T = any>(endpoint: string, body: any, options?: FetchOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    
    // Automatically remove Content-Type if it's FormData so fetch sets boundary correctly
    const headers = options?.headers as Record<string, string> || {};
    if (isFormData && headers['Content-Type'] === 'multipart/form-data') {
      delete headers['Content-Type'];
    }

    const response = await this.fetch(endpoint, {
      ...options,
      headers: isFormData ? headers : options?.headers,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
    const data = await response.json();
    return data.success ? data.data : data;
  },

  async put<T = any>(endpoint: string, body: any, options?: FetchOptions): Promise<T> {
    const response = await this.fetch(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return data.success ? data.data : data;
  },

  async delete<T = any>(endpoint: string, options?: FetchOptions): Promise<T> {
    const response = await this.fetch(endpoint, { ...options, method: 'DELETE' });
    const data = await response.json();
    return data.success ? data.data : data;
  },
};
