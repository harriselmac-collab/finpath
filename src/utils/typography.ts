// src/utils/typography.ts

export type SupportedLocale = 'en' | 'fr' | 'ar' | 'es' | 'de' | 'pt' | 'it' | 'nl' | 'tr';
export type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

/**
 * Returns the resolved custom font family name based on the active language locale and weight.
 * Latin-script languages resolve to Space Grotesk.
 * Arabic resolves exclusively to Cairo.
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
        regular: 'Cairo',
        medium: 'Cairo',
        semibold: 'Cairo',
        bold: 'Cairo',
        extrabold: 'Cairo',
      }
    : {
        regular: 'SpaceGrotesk_400Regular',
        medium: 'SpaceGrotesk_500Medium',
        semibold: 'SpaceGrotesk_600SemiBold',
        bold: 'SpaceGrotesk_700Bold',
        extrabold: 'SpaceGrotesk_700Bold',
      };

  return families[weight] || families.regular;
}
