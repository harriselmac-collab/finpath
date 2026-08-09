import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Storage adapter mapping Supabase Session Cache to Expo SecureStore keychain
export const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key);
  },
};

export const BrowserStorageAdapter = {
  getItem: async (key: string) => globalThis.localStorage?.getItem(key) ?? null,
  setItem: async (key: string, value: string) => { globalThis.localStorage?.setItem(key, value); },
  removeItem: async (key: string) => { globalThis.localStorage?.removeItem(key); },
};

export const ServerStorageAdapter = {
  getItem: async () => null,
  setItem: async () => undefined,
  removeItem: async () => undefined,
};

const isBrowser = typeof globalThis.localStorage !== 'undefined';
export const authStorage = Platform.OS === 'web'
  ? (isBrowser ? BrowserStorageAdapter : ServerStorageAdapter)
  : ExpoSecureStoreAdapter;

const configuredUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const configuredAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const hasSupabaseCredentials = (url?: string, anonKey?: string) => Boolean(
  url?.trim()
  && anonKey?.trim()
  && !url.includes('mock-url.supabase.co')
  && anonKey !== 'mock-anon-key-placeholder',
);

export const shouldEnableAuthSimulation = (isDevelopment: boolean, flag?: string) =>
  isDevelopment && flag === 'true';

export const isSupabaseConfigured = hasSupabaseCredentials(configuredUrl, configuredAnonKey);

export const isAuthSimulationEnabled = shouldEnableAuthSimulation(
  __DEV__,
  process.env.EXPO_PUBLIC_ENABLE_AUTH_SIMULATION,
);

const supabaseUrl = configuredUrl || 'https://mock-url.supabase.co';
const supabaseAnonKey = configuredAnonKey || 'mock-anon-key-placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: Platform.OS !== 'web' || isBrowser,
    detectSessionInUrl: false, // Prevents redirection bugs in mobile React Native clients
  },
});
