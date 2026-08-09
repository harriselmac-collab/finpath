import { describe, expect, it } from '@jest/globals';

import { FontWeight, getFontFamily } from '../utils/typography';

const weights: FontWeight[] = ['regular', 'medium', 'semibold', 'bold', 'extrabold'];

describe('locale typography', () => {
  it('uses Cairo only for Arabic and Space Grotesk for Latin locales', () => {
    expect(weights.map((weight) => getFontFamily('ar', weight))).toEqual([
      'Cairo',
      'Cairo',
      'Cairo',
      'Cairo',
      'Cairo',
    ]);
    expect(weights.every((weight) => getFontFamily('en', weight).startsWith('SpaceGrotesk_'))).toBe(true);
  });
});
