import { describe, expect, it } from '@jest/globals';

import { resolveProfileDisplayName } from '../utils/profileDisplayName';

describe('profile display name', () => {
  it('prefers the name entered in Pocket Ahead', () => {
    expect(resolveProfileDisplayName('Harris', { email: 'person@example.com', user_metadata: { full_name: 'Google Name' } }, 'Guest user')).toBe('Harris');
  });

  it('uses the authenticated provider name before showing a guest label', () => {
    expect(resolveProfileDisplayName('', { email: 'person@example.com', user_metadata: { full_name: 'Google Name' } }, 'Guest user')).toBe('Google Name');
  });

  it('falls back to the authenticated email name when provider metadata is absent', () => {
    expect(resolveProfileDisplayName('', { email: 'person@example.com' }, 'Guest user')).toBe('person');
  });

  it('shows the translated guest label only without an authenticated identity', () => {
    expect(resolveProfileDisplayName('', null, 'Guest user')).toBe('Guest user');
  });
});
