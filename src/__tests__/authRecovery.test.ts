import { describe, expect, it } from '@jest/globals';

import { parseAuthCallback, parseRecoveryTokens } from '../services/auth/recovery';

describe('password recovery links', () => {
  it('reads tokens from the URL fragment returned by Supabase', () => {
    expect(parseRecoveryTokens('pocketahead://auth/update-password#access_token=access-1&refresh_token=refresh-1&type=recovery')).toEqual({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      type: 'recovery',
      errorCode: undefined,
    });
  });

  it('reads encoded tokens from query parameters', () => {
    expect(parseRecoveryTokens('pocketahead://auth/update-password?access_token=access%2F2&refresh_token=refresh%3D2')).toEqual({
      accessToken: 'access/2',
      refreshToken: 'refresh=2',
      type: undefined,
      errorCode: undefined,
    });
  });

  it('returns no tokens for an unrelated link', () => {
    expect(parseRecoveryTokens('pocketahead://auth/update-password')).toEqual({
      accessToken: undefined,
      refreshToken: undefined,
      type: undefined,
      errorCode: undefined,
    });
  });

  it('identifies confirmation callbacks and errors', () => {
    expect(parseAuthCallback('pocketahead://auth#access_token=access&refresh_token=refresh&type=signup')).toMatchObject({
      type: 'signup',
      errorCode: undefined,
    });
    expect(parseAuthCallback('pocketahead://auth?error_code=otp_expired&type=signup')).toMatchObject({
      type: 'signup',
      errorCode: 'otp_expired',
    });
  });
});
