/**
 * Convert a float decimal currency value to integer minor units (cents)
 * e.g., 10.25 -> 1025, 10.2 -> 1020, 10 -> 1000
 */
export const toMinorUnits = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Convert an integer minor units (cents) back to float decimal currency value
 * e.g., 1025 -> 10.25
 */
export const fromMinorUnits = (minorUnits: number): number => {
  return minorUnits / 100;
};

/**
 * Safe addition of two floating-point currency values
 */
export const safeAdd = (a: number, b: number): number => {
  return fromMinorUnits(toMinorUnits(a) + toMinorUnits(b));
};

/**
 * Safe subtraction of two floating-point currency values
 */
export const safeSubtract = (a: number, b: number): number => {
  return fromMinorUnits(toMinorUnits(a) - toMinorUnits(b));
};

/**
 * Safe multiplication of a currency value by a numeric factor
 */
export const safeMultiply = (amount: number, factor: number): number => {
  return fromMinorUnits(Math.round(toMinorUnits(amount) * factor));
};

/**
 * Safe division of a currency value by a numeric divisor
 */
export const safeDivide = (amount: number, divisor: number): number => {
  if (divisor === 0) return 0;
  return fromMinorUnits(Math.round(toMinorUnits(amount) / divisor));
};

/**
 * Helper to sum an array of currency values safely
 */
export const safeSum = (amounts: number[]): number => {
  const sumMinor = amounts.reduce((total, amt) => total + toMinorUnits(amt), 0);
  return fromMinorUnits(sumMinor);
};

/**
 * Format a number into currency representation
 * e.g., 2500 -> "MAD 2,500.00"
 */
export const formatCurrency = (amount: number, currency = 'MAD'): string => {
  const roundedAmount = Math.round(amount * 100) / 100;
  const parts = roundedAmount.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${currency} ${parts.join('.')}`;
};
