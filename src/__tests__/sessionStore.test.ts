import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase/supabaseClient';
import { useSessionStore } from '../store/sessionStore';

jest.mock('../services/supabase/supabaseClient', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

const mockAuth = supabase.auth as jest.Mocked<typeof supabase.auth>;

const session = {
  access_token: 'token',
  refresh_token: 'refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'user-1', email: 'user@example.com' },
} as Session;

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

describe('session restoration trust', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSessionStore.setState({
      session: null,
      user: null,
      loading: true,
      authStatus: 'idle',
      authError: null,
      syncing: false,
    });
    mockAuth.signOut.mockResolvedValue({ error: null });
  });

  test('restores a server-validated session', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session }, error: null });
    mockAuth.getUser.mockResolvedValue({ data: { user: session.user }, error: null });

    const unsubscribe = useSessionStore.getState().initializeAuth();
    await flush();

    expect(useSessionStore.getState().authStatus).toBe('authenticated');
    expect(useSessionStore.getState().user?.id).toBe('user-1');
    unsubscribe();
  });

  test('clears an invalid restored session', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session }, error: null });
    mockAuth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('expired') as any });

    useSessionStore.getState().initializeAuth();
    await flush();

    expect(mockAuth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(useSessionStore.getState().session).toBeNull();
    expect(useSessionStore.getState().authStatus).toBe('unauthenticated');
  });

  test('leaves the loading state when session initialization rejects', async () => {
    mockAuth.getSession.mockRejectedValue(new Error('storage unavailable'));

    useSessionStore.getState().initializeAuth();
    await flush();

    expect(useSessionStore.getState().loading).toBe(false);
    expect(useSessionStore.getState().session).toBeNull();
    expect(useSessionStore.getState().authStatus).toBe('error');
  });

  test('clears local authentication on logout', async () => {
    useSessionStore.getState().setSession(session as any);
    await useSessionStore.getState().signOut();

    expect(mockAuth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(useSessionStore.getState().session).toBeNull();
    expect(useSessionStore.getState().authStatus).toBe('unauthenticated');
  });
});
