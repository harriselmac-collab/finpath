import { describe, expect, test } from '@jest/globals';
import { isFutureDate, isValidDebt, isValidIsoDate, parseFinancialAmount } from '../utils/financialValidation';

describe('financial validation boundaries', () => {
  test.each(['', '-1', 'abc', 'Infinity', '1000000000001', '1.234'])('rejects invalid two-decimal amount %s', (value) => {
    expect(parseFinancialAmount(value, 'MAD')).toBeNull();
  });

  test('enforces zero-decimal currencies and accepts harmless comma formatting', () => {
    expect(parseFinancialAmount('12,50', 'MAD')).toBe(12.5);
    expect(parseFinancialAmount('12.5', 'JPY')).toBeNull();
  });

  test('rejects impossible and past dates', () => {
    expect(isValidIsoDate('2026-02-30')).toBe(false);
    expect(isFutureDate('2026-08-02', new Date('2026-08-03T12:00:00'))).toBe(false);
    expect(isFutureDate('2026-08-03', new Date('2026-08-03T12:00:00'))).toBe(true);
  });

  test('rejects invalid debt terms', () => {
    expect(isValidDebt({ totalAmount: 100, minimumPayment: 101, interestRate: 5, dueDate: '10' })).toBe(false);
    expect(isValidDebt({ totalAmount: 100, minimumPayment: 10, interestRate: 101, dueDate: '10' })).toBe(false);
    expect(isValidDebt({ totalAmount: 100, minimumPayment: 10, interestRate: 5, dueDate: '32' })).toBe(false);
  });
});
