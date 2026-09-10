import { router } from 'expo-router';

/**
 * Type-safe navigation helper that wraps Expo Router.
 * Usage: `navigate('/(nurse)/home')` or `navigate('/(nurse)/visits', { id: '123' })`.
 */
export const navigate = (path: string, params?: Record<string, unknown>) => {
  if (params) {
    const search = new URLSearchParams(params as any).toString();
    router.push(`${path}?${search}` as any);
  } else {
    router.push(path as any);
  }
};

export const replace = (path: string, params?: Record<string, unknown>) => {
  if (params) {
    const search = new URLSearchParams(params as any).toString();
    router.replace(`${path}?${search}` as any);
  } else {
    router.replace(path as any);
  }
};

export const goBack = () => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
};
