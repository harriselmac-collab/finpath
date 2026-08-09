import { describe, expect, it, jest } from '@jest/globals';
import { normalizeThemePreference } from '../services/theme';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn() },
}));
jest.mock('../constants/theme', () => ({ applyWebPalette: jest.fn() }));

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
});
