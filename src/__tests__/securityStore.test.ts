import { describe, expect, it, beforeEach, jest } from '@jest/globals';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(async () => true),
  isEnrolledAsync: jest.fn(async () => true),
  supportedAuthenticationTypesAsync: jest.fn(async () => [1]),
  authenticateAsync: jest.fn(async () => ({ success: true })),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3,
  },
}));

import { useSecurityStore } from '../store/securityStore';

describe('Security Store & App Lock', () => {
  beforeEach(() => {
    useSecurityStore.setState({
      isBiometricsEnabled: false,
      isLocked: false,
      isSupported: true,
      isEnrolled: true,
      biometryType: 'Fingerprint',
      lastBackgroundedAt: null,
    });
  });

  it('initializes with unlocked and disabled state by default', () => {
    const state = useSecurityStore.getState();
    expect(state.isBiometricsEnabled).toBe(false);
    expect(state.isLocked).toBe(false);
  });

  it('locks the app only when biometrics is enabled', () => {
    const { lockApp } = useSecurityStore.getState();
    lockApp();
    expect(useSecurityStore.getState().isLocked).toBe(false);

    useSecurityStore.setState({ isBiometricsEnabled: true });
    useSecurityStore.getState().lockApp();
    expect(useSecurityStore.getState().isLocked).toBe(true);
  });

  it('unlocks the app when unlockApp is called', () => {
    useSecurityStore.setState({ isBiometricsEnabled: true, isLocked: true });
    useSecurityStore.getState().unlockApp();
    expect(useSecurityStore.getState().isLocked).toBe(false);
  });

  it('handles app state transitions and auto-locks on background timeout', () => {
    useSecurityStore.setState({ isBiometricsEnabled: true, isLocked: false });

    // Transition to background
    useSecurityStore.getState().handleAppStateChange('background');
    expect(useSecurityStore.getState().lastBackgroundedAt).not.toBeNull();

    // Simulate 20 seconds passed in background
    useSecurityStore.setState({ lastBackgroundedAt: Date.now() - 20000 });

    // Transition back to active
    useSecurityStore.getState().handleAppStateChange('active');
    expect(useSecurityStore.getState().isLocked).toBe(true);
    expect(useSecurityStore.getState().lastBackgroundedAt).toBeNull();
  });
});
