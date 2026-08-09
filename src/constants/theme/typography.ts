// src/constants/theme/typography.ts

// Cairo font weights bundled from Google Fonts
// Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)

// Define the typography scales based on the existing design system
export const typography = {
  display: {
    fontFamily: 'Cairo',
    fontSize: 36,
    lineHeight: 44,
    // Adjust lineHeight to accommodate Arabic diacritics
    letterSpacing: 0.25,
  },
  screenTitle: {
    fontFamily: 'Cairo',
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontFamily: 'Cairo',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.15,
  },
  cardTitle: {
    fontFamily: 'Cairo',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  body: {
    fontFamily: 'Cairo',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  supporting: {
    fontFamily: 'Cairo',
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.15,
  },
  caption: {
    fontFamily: 'Cairo',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.15,
  },
  button: {
    fontFamily: 'Cairo',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.15,
  },
  financialAmount: {
    fontFamily: 'Cairo',
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: 0.2,
  },
  // Additional variants for specific use cases
  warning: {
    fontFamily: 'Cairo',
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.15,
  },
  legalTitle: {
    fontFamily: 'Cairo',
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0.15,
  },
  legalBody: {
    fontFamily: 'Cairo',
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.15,
  },
  navLabel: {
    fontFamily: 'Cairo',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  inputLabel: {
    fontFamily: 'Cairo',
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.15,
  },
  inputValue: {
    fontFamily: 'Cairo',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  // For financial inputs that need to stand out slightly more
  inputFinancial: {
    fontFamily: 'Cairo',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
};
