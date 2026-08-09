export const SUPPORTED_CURRENCIES = [
  { code: 'MAD', name: 'Moroccan dirham' },
  { code: 'EUR', name: 'Euro' },
  { code: 'USD', name: 'US dollar' },
  { code: 'GBP', name: 'British pound' },
  { code: 'CAD', name: 'Canadian dollar' },
  { code: 'AUD', name: 'Australian dollar' },
  { code: 'CHF', name: 'Swiss franc' },
  { code: 'AED', name: 'UAE dirham' },
  { code: 'SAR', name: 'Saudi riyal' },
  { code: 'TRY', name: 'Turkish lira' },
  { code: 'JPY', name: 'Japanese yen' },
] as const;

export type SupportedCurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]['code'];
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: SupportedCurrencyCode = 'MAD';

export function normalizeCurrencyCode(currency: unknown): SupportedCurrencyCode {
  const code = typeof currency === 'string' ? currency.trim().toUpperCase() : '';
  return SUPPORTED_CURRENCIES.some((option) => option.code === code)
    ? code as SupportedCurrencyCode
    : DEFAULT_CURRENCY;
}

export function getCurrencySymbol(currency: string, locale?: string): string {
  const code = normalizeCurrencyCode(currency);

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0).find(({ type }) => type === 'currency')?.value || code;
  } catch {
    return code;
  }
}

export function getCurrencyOptionLabel(
  currency: SupportedCurrency,
  locale?: string,
  translatedName: string = currency.name,
): string {
  const name = translatedName
    .replace(new RegExp(`\\s*\\(${currency.code}\\)\\s*$`, 'i'), '')
    .trim();
  const symbol = getCurrencySymbol(currency.code, locale);

  return symbol === currency.code
    ? `${currency.code} - ${name}`
    : `${symbol} - ${name} (${currency.code})`;
}
