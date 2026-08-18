import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { encryptedFinancialStorage } from '../services/storage/encryptedStorage';

export interface SecurityState {
  isBiometricsEnabled: boolean;
  isLocked: boolean;
  isSupported: boolean;
  isEnrolled: boolean;
  biometryType: string;
  lastBackgroundedAt: number | null;
  checkBiometricsSupport: () => Promise<{ supported: boolean; enrolled: boolean; type: string }>;
  setBiometricsEnabled: (enabled: boolean) => Promise<boolean>;
  lockApp: () => void;
  unlockApp: () => void;
  authenticate: () => Promise<boolean>;
  handleAppStateChange: (nextState: string) => void;
}

const LOCK_TIMEOUT_MS = 15000; // Lock if backgrounded for 15+ seconds

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      isBiometricsEnabled: false,
      isLocked: false,
      isSupported: false,
      isEnrolled: false,
      biometryType: 'Biometrics',
      lastBackgroundedAt: null,

      checkBiometricsSupport: async () => {
        if (Platform.OS === 'web') {
          set({ isSupported: false, isEnrolled: false, biometryType: 'None' });
          return { supported: false, enrolled: false, type: 'None' };
        }

        try {
          const supported = await LocalAuthentication.hasHardwareAsync();
          const enrolled = supported ? await LocalAuthentication.isEnrolledAsync() : false;
          const types = supported ? await LocalAuthentication.supportedAuthenticationTypesAsync() : [];

          let type = 'Biometrics';
          if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            type = 'Face ID';
          } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            type = 'Fingerprint';
          } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
            type = 'Iris';
          }

          set({ isSupported: supported, isEnrolled: enrolled, biometryType: type });
          return { supported, enrolled, type };
        } catch {
          set({ isSupported: false, isEnrolled: false, biometryType: 'None' });
          return { supported: false, enrolled: false, type: 'None' };
        }
      },

      setBiometricsEnabled: async (enabled: boolean) => {
        if (!enabled) {
          set({ isBiometricsEnabled: false, isLocked: false });
          return true;
        }

        const { supported, enrolled } = await get().checkBiometricsSupport();
        if (!supported || !enrolled) {
          return false;
        }

        const authResult = await get().authenticate();
        if (authResult) {
          set({ isBiometricsEnabled: true, isLocked: false });
          return true;
        }
        return false;
      },

      lockApp: () => {
        if (get().isBiometricsEnabled) {
          set({ isLocked: true });
        }
      },

      unlockApp: () => {
        set({ isLocked: false });
      },

      authenticate: async () => {
        if (Platform.OS === 'web') {
          set({ isLocked: false });
          return true;
        }

        try {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Unlock Pocket Ahead',
            cancelLabel: 'Cancel',
            fallbackLabel: 'Use Passcode',
            disableDeviceFallback: false,
          });

          if (result.success) {
            set({ isLocked: false });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      handleAppStateChange: (nextState: string) => {
        const { isBiometricsEnabled, lastBackgroundedAt } = get();
        if (!isBiometricsEnabled) return;

        if (nextState === 'background' || nextState === 'inactive') {
          set({ lastBackgroundedAt: Date.now() });
        } else if (nextState === 'active') {
          if (lastBackgroundedAt && Date.now() - lastBackgroundedAt >= LOCK_TIMEOUT_MS) {
            set({ isLocked: true });
          }
          set({ lastBackgroundedAt: null });
        }
      },
    }),
    {
      name: 'pocket-ahead-security',
      storage: createJSONStorage(() => encryptedFinancialStorage),
      partialize: (state) => ({
        isBiometricsEnabled: state.isBiometricsEnabled,
      }),
    },
  ),
);
