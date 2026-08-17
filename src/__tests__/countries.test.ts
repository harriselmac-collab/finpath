import { describe, expect, test } from '@jest/globals';
import { formatCountryCurrency, getCountries, getSuggestedCurrency, normalizeCountryCode } from '../services/localization/countries';

describe('global country selection', () => {
  test('provides the complete ISO country and territory list with stable codes', () => {
    const options = getCountries('en');
    expect(options.length).toBeGreaterThanOrEqual(249);
    expect(options).toContainEqual({ code: 'MA', name: 'Morocco' });
    expect(options.some(({ code }) => code === 'GF')).toBe(true);
  });

  test('bundles a flag for every selectable country and territory', () => {
    const missingFlags = getCountries('en').filter(({ code }) => {
      try {
        require.resolve(`flag-icons/flags/4x3/${code.toLowerCase()}.svg`);
        return false;
      } catch {
        return true;
      }
    });
    expect(missingFlags).toEqual([]);
  });

  test('localizes names and migrates stored names to stable country codes', () => {
    expect(getCountries('ar').find(({ code }) => code === 'MA')?.name).not.toBe('Morocco');
    expect(normalizeCountryCode('Morocco')).toBe('MA');
    expect(normalizeCountryCode('FR')).toBe('FR');
  });

  test('suggests rather than couples currency to country', () => {
    expect(getSuggestedCurrency('MA')).toBe('MAD');
    expect(getSuggestedCurrency('FR')).toBe('EUR');
  });

  test('formats country and currency from independent stored values', () => {
    expect(formatCountryCurrency('MA', 'USD', 'en')).toBe('Morocco · USD');
    expect(formatCountryCurrency('FR', 'JPY', 'fr')).toBe('France · JPY');
    expect(formatCountryCurrency('US', 'EUR', 'ar')).toContain('· EUR');
  });
});
