// src/constants/theme/typography.ts

// Changa font weights available via @expo-google-fonts/changa
// Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)

// Define the typography scales based on the existing design system
export const typography = {
  display: {
    fontFamily: 'Changa_800ExtraBold',
    fontSize: 36,
    lineHeight: 44,
    // Adjust lineHeight to accommodate Arabic diacritics
    letterSpacing: 0.25,
  },
  screenTitle: {
    fontFamily: 'Changa_700Bold',
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontFamily: 'Changa_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.15,
  },
  cardTitle: {
    fontFamily: 'Changa_600SemiBold',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  body: {
    fontFamily: 'Changa_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  supporting: {
    fontFamily: 'Changa_400Regular',
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.15,
  },
  caption: {
    fontFamily: 'Changa_500Medium',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.15,
  },
  button: {
    fontFamily: 'Changa_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.15,
  },
  financialAmount: {
    fontFamily: 'Changa_700Bold',
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: 0.2,
  },
  // Additional variants for specific use cases
  warning: {
    fontFamily: 'Changa_600SemiBold',
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.15,
  },
  legalTitle: {
    fontFamily: 'Changa_700Bold',
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0.15,
  },
  legalBody: {
    fontFamily: 'Changa_400Regular',
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.15,
  },
  navLabel: {
    fontFamily: 'Changa_500Medium',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  inputLabel: {
    fontFamily: 'Changa_500Medium',
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.15,
  },
  inputValue: {
    fontFamily: 'Changa_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  // For financial inputs that need to stand out slightly more
  inputFinancial: {
    fontFamily: 'Changa_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
};