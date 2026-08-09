import { describe, expect, it, jest } from '@jest/globals';
import { normalizeThemePreference } from '../services/theme';
import { DARK_COLORS, getThemeHexColor, LIGHT_COLORS } from '../constants/theme';

jest.mock('@/global.css', () => ({}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn() },
}));
jest.mock('../constants/theme', () => {
  const actual = jest.requireActual<typeof import('../constants/theme')>('../constants/theme');
  return { ...actual, applyWebPalette: jest.fn() };
});

describe('theme preference', () => {
  it('accepts supported modes and safely falls back to system', () => {
    expect(['light', 'dark', 'system'].map(normalizeThemePreference)).toEqual([
      'light',
      'dark',
      'system',
    ]);
    expect(normalizeThemePreference('unknown')).toBe('system');
    expect(normalizeThemePreference(null)).toBe('system');
  });

  it('provides concrete hex colors for native Compose view props', () => {
    expect(getThemeHexColor('surfaceTint', 'light')).toBe(LIGHT_COLORS.surfaceTint);
    expect(getThemeHexColor('surfaceTint', 'dark')).toBe(DARK_COLORS.surfaceTint);
    expect(getThemeHexColor('surfaceTint', 'dark')).toMatch(/^#[0-9A-F]{6}$/i);
  });
});
