const countryFlag = (countryCode: string) =>
  String.fromCodePoint(
    ...countryCode.toUpperCase().split('').map((letter) => 127397 + letter.charCodeAt(0)),
  );

export const SUPPORTED_LANGUAGES = [
  { key: 'en', label: 'English', shortLabel: 'EN', countryCode: 'GB', flag: countryFlag('GB'), rtl: false },
  { key: 'fr', label: 'Français', shortLabel: 'FR', countryCode: 'FR', flag: countryFlag('FR'), rtl: false },
  { key: 'ar', label: 'العربية', shortLabel: 'AR', countryCode: 'MA', flag: countryFlag('MA'), rtl: true },
  { key: 'es', label: 'Español', shortLabel: 'ES', countryCode: 'ES', flag: countryFlag('ES'), rtl: false },
  { key: 'de', label: 'Deutsch', shortLabel: 'DE', countryCode: 'DE', flag: countryFlag('DE'), rtl: false },
  { key: 'pt', label: 'Português', shortLabel: 'PT', countryCode: 'PT', flag: countryFlag('PT'), rtl: false },
  { key: 'it', label: 'Italiano', shortLabel: 'IT', countryCode: 'IT', flag: countryFlag('IT'), rtl: false },
  { key: 'nl', label: 'Nederlands', shortLabel: 'NL', countryCode: 'NL', flag: countryFlag('NL'), rtl: false },
  { key: 'tr', label: 'Türkçe', shortLabel: 'TR', countryCode: 'TR', flag: countryFlag('TR'), rtl: false },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['key'];

export const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map(({ key }) => key);

export function normalizeLanguageCode(language?: string | null): SupportedLanguageCode {
  const code = (language || 'en').split('-')[0].toLowerCase();
  return SUPPORTED_LANGUAGE_CODES.includes(code as SupportedLanguageCode)
    ? code as SupportedLanguageCode
    : 'en';
}

export function getLanguageOption(language?: string | null) {
  const code = normalizeLanguageCode(language);
  return SUPPORTED_LANGUAGES.find((option) => option.key === code) ?? SUPPORTED_LANGUAGES[0];
}

export const isRtlLanguage = (language?: string | null) =>
  getLanguageOption(language).rtl;
