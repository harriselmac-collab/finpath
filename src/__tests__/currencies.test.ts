import { describe, expect, test } from '@jest/globals';
import {
  getCurrencyOptionLabel,
  getCurrencySymbol,
  SUPPORTED_CURRENCIES,
} from '../constants/currencies';
import { QUIZ_QUESTIONS } from '../features/onboarding/quizFlow';
import { formatCurrency } from '../utils/currency';

describe('supported currencies', () => {
  test('keeps the required catalog unique and available during onboarding', () => {
    const codes = SUPPORTED_CURRENCIES.map(({ code }) => code);
    const required = ['MAD', 'EUR', 'USD', 'GBP', 'CAD', 'AUD', 'CHF', 'AED', 'SAR', 'TRY', 'JPY'];
    const quizCurrency = QUIZ_QUESTIONS.find(({ id }) => id === 'currency');

    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).toEqual(expect.arrayContaining(required));
    expect(quizCurrency?.options?.map(({ value }) => value)).toEqual(codes);
  });

  test('uses locale-aware narrow symbols and keeps the ISO code in option labels', () => {
    const euro = SUPPORTED_CURRENCIES.find(({ code }) => code === 'EUR')!;

    expect(getCurrencySymbol('EUR', 'en-US')).toBe('€');
    expect(getCurrencySymbol('USD', 'en-US')).toBe('$');
    expect(getCurrencyOptionLabel(euro, 'fr-FR', 'Euro (EUR)')).toBe('€ - Euro (EUR)');
  });

  test('falls back safely for invalid currency codes', () => {
    expect(getCurrencySymbol('BAD-CODE', 'en-US')).toBe('MAD');
    expect(formatCurrency(1250, 'BAD-CODE', 'en-US')).toContain('MAD');
  });

  test('formats amounts with symbols and locale-aware separators', () => {
    expect(formatCurrency(2500, 'USD', 'en-US')).toBe('$2,500');
    expect(formatCurrency(2500.5, 'EUR', 'de-DE')).toContain('2.500,50');
    expect(formatCurrency(2500.5, 'JPY', 'ja-JP')).toContain('2,501');
    expect(formatCurrency(2500.5, 'EUR', 'de-DE', 0)).toContain('2.501');
  });
});
