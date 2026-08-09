import { normalizeCurrencyCode } from '../constants/currencies';

/**
 * Convert a float decimal currency value to integer minor units (cents)
 * e.g., 10.25 -> 1025, 10.2 -> 1020, 10 -> 1000
 */
export const getCurrencyFractionDigits = (currency = 'USD'): number => {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: normalizeCurrencyCode(currency),
    }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
};

const minorUnitFactor = (currency?: string) => 10 ** (currency ? getCurrencyFractionDigits(currency) : 2);

export const toMinorUnits = (amount: number, currency?: string): number => {
  return Math.round(amount * minorUnitFactor(currency));
};

/**
 * Convert an integer minor units (cents) back to float decimal currency value
 * e.g., 1025 -> 10.25
 */
export const fromMinorUnits = (minorUnits: number, currency?: string): number => {
  return minorUnits / minorUnitFactor(currency);
};

/**
 * Safe addition of two floating-point currency values
 */
export const safeAdd = (a: number, b: number, currency?: string): number => {
  return fromMinorUnits(toMinorUnits(a, currency) + toMinorUnits(b, currency), currency);
};

/**
 * Safe subtraction of two floating-point currency values
 */
export const safeSubtract = (a: number, b: number, currency?: string): number => {
  return fromMinorUnits(toMinorUnits(a, currency) - toMinorUnits(b, currency), currency);
};

/**
 * Safe multiplication of a currency value by a numeric factor
 */
export const safeMultiply = (amount: number, factor: number, currency?: string): number => {
  return fromMinorUnits(Math.round(toMinorUnits(amount, currency) * factor), currency);
};

/**
 * Safe division of a currency value by a numeric divisor
 */
export const safeDivide = (amount: number, divisor: number, currency?: string): number => {
  if (divisor === 0) return 0;
  return fromMinorUnits(Math.round(toMinorUnits(amount, currency) / divisor), currency);
};

/**
 * Helper to sum an array of currency values safely
 */
export const safeSum = (amounts: number[], currency?: string): number => {
  const sumMinor = amounts.reduce((total, amt) => total + toMinorUnits(amt, currency), 0);
  return fromMinorUnits(sumMinor, currency);
};

/**
 * Format a number using the active locale and ISO currency code.
 */
export const formatCurrency = (
  amount: number,
  currency = 'MAD',
  locale?: string,
  fractionDigits?: number,
): string => {
  const roundedAmount = Math.round(amount * 100) / 100;
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: normalizeCurrencyCode(currency),
    currencyDisplay: 'narrowSymbol',
    ...(fractionDigits !== undefined
      ? { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }
      : Number.isInteger(roundedAmount)
        ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
        : {}),
  };

  return new Intl.NumberFormat(locale, options).format(roundedAmount);
};
