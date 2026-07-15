// src/utils/typography.ts

export type SupportedLocale = 'en' | 'fr' | 'ar';
export type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

/**
 * Returns the resolved custom font family name based on the active language locale and weight.
 * English/French resolves to Plus Jakarta Sans.
 * Arabic resolves to Changa.
 */
export function getFontFamily(
  locale: string,
  weight: FontWeight,
): string {
  // Normalize locale key (e.g. "en-US" -> "en")
  const lang = (locale || 'en').split('-')[0].toLowerCase();
  const isArabic = lang === 'ar';

  const families = isArabic
    ? {
        regular: 'Changa_400Regular',
        medium: 'Changa_500Medium',
        semibold: 'Changa_600SemiBold',
        bold: 'Changa_700Bold',
        extrabold: 'Changa_800ExtraBold',
      }
    : {
        regular: 'PlusJakartaSans_400Regular',
        medium: 'PlusJakartaSans_500Medium',
        semibold: 'PlusJakartaSans_600SemiBold',
        bold: 'PlusJakartaSans_700Bold',
        extrabold: 'PlusJakartaSans_800ExtraBold',
      };

  return families[weight] || families.regular;
}
