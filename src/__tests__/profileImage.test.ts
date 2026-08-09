import { describe, expect, it } from '@jest/globals';

import { createStoredProfileImage, getCenteredSquareCrop } from '../utils/profileImage';

describe('profile image storage helpers', () => {
  it('centres a square crop for landscape and portrait images', () => {
    expect(getCenteredSquareCrop(1200, 800)).toEqual({ originX: 200, originY: 0, width: 800, height: 800 });
    expect(getCenteredSquareCrop(600, 900)).toEqual({ originX: 0, originY: 150, width: 600, height: 600 });
    expect(getCenteredSquareCrop(0, 900)).toBeNull();
  });

  it('creates a JPEG data URI and rejects oversized data', () => {
    expect(createStoredProfileImage('abc')).toBe('data:image/jpeg;base64,abc');
    expect(createStoredProfileImage('')).toBeNull();
    expect(createStoredProfileImage('a'.repeat(2_800_000))).toBeNull();
  });
});
