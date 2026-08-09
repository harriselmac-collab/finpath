import countries from 'i18n-iso-countries/index';
import ar from 'i18n-iso-countries/langs/ar.json';
import en from 'i18n-iso-countries/langs/en.json';
import fr from 'i18n-iso-countries/langs/fr.json';

countries.registerLocale(en);
countries.registerLocale(fr);
countries.registerLocale(ar);

const CURRENCY_BY_COUNTRY: Record<string, string> = {
  AE: 'AED', AU: 'AUD', CA: 'CAD', CH: 'CHF', GB: 'GBP', JP: 'JPY', MA: 'MAD',
  SA: 'SAR', TR: 'TRY', US: 'USD',
};

const EURO_COUNTRIES = new Set([
  'AD', 'AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT',
  'LT', 'LU', 'LV', 'MC', 'ME', 'MT', 'NL', 'PT', 'SI', 'SK', 'SM', 'VA',
]);

export interface CountryOption {
  code: string;
  name: string;
}

const supportedLocale = (locale: string) => {
  const language = locale.split('-')[0].toLowerCase();
  return language === 'ar' || language === 'fr' ? language : 'en';
};

export const getCountries = (locale: string): CountryOption[] => {
  const language = supportedLocale(locale);
  return Object.keys(countries.getAlpha2Codes())
    .map((code) => ({ code, name: countries.getName(code, language) || countries.getName(code, 'en') || code }))
    .sort((a, b) => a.name.localeCompare(b.name, language));
};

export const normalizeCountryCode = (country: unknown) => {
  if (typeof country !== 'string') return '';
  const value = country.trim();
  if (countries.isValid(value.toUpperCase())) return countries.toAlpha2(value.toUpperCase()) || '';
  return countries.getAlpha2Code(value, 'en')
    || countries.getAlpha2Code(value, 'fr')
    || countries.getAlpha2Code(value, 'ar')
    || '';
};

export const formatCountryCurrency = (country: unknown, currency: string, locale: string) => {
  const code = normalizeCountryCode(country);
  const name = getCountries(locale).find((option) => option.code === code)?.name || code;
  return [name, currency].filter(Boolean).join(' · ');
};

export const getSuggestedCurrency = (countryCode: string) => (
  EURO_COUNTRIES.has(countryCode) ? 'EUR' : CURRENCY_BY_COUNTRY[countryCode] || 'USD'
);
