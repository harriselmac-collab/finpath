const isMock =
  !process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL.includes('mock-url.supabase.co');

export const MOCK_SESSION_DELAY = 750;

export function createMockSession(email: string, userId = 'mock-user-id', preferredName?: string) {
  const name = preferredName || email.split('@')[0];
  return {
    access_token: `mock-access-token-${userId}`,
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: `mock-refresh-token-${userId}`,
    user: {
      id: userId,
      email,
      app_metadata: {},
      user_metadata: { preferredName: name },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    },
  };
}

export const mockSupabaseEmails = ['demo@finpath.com', 'google-guest@finpath.com'] as const;

export default { isMock, createMockSession, MOCK_SESSION_DELAY, mockSupabaseEmails };
