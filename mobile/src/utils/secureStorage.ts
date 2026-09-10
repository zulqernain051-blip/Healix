import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Cross-platform secure storage utility.
 * Uses expo-secure-store on native (iOS/Android) and localStorage on web.
 * Prevents the "ExpoSecureStore.default.getValueWithKeyAsync is not a function" crash on web.
 */
export const secureStorage = {
  async getItemAsync(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },

  async setItemAsync(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },

  async deleteItemAsync(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};
