import '@/global.css';
import { DynamicColorIOS, I18nManager, Platform, PlatformColor } from 'react-native';

const APP_FONTS = Platform.OS === 'web'
  ? {
      regular: 'var(--pa-font-regular)',
      medium: 'var(--pa-font-medium)',
      semibold: 'var(--pa-font-semibold)',
      bold: 'var(--pa-font-bold)',
    }
  : I18nManager.isRTL
    ? {
      regular: 'Cairo',
      medium: 'Cairo',
      semibold: 'Cairo',
      bold: 'Cairo',
      }
    : {
      regular: 'SpaceGrotesk_400Regular',
      medium: 'SpaceGrotesk_500Medium',
      semibold: 'SpaceGrotesk_600SemiBold',
      bold: 'SpaceGrotesk_700Bold',
      };

export const LIGHT_COLORS = {
  primary: '#101B3A',
  onPrimary: '#ffffff',
  primaryContainer: '#101B3A',
  onPrimaryContainer: '#EFF3FF',
  primaryFixed: '#E8EEFF',
  primaryFixedDim: '#CEDAFF',
  onPrimaryFixed: '#0E255B',
  onPrimaryFixedVariant: '#294A9B',
  inversePrimary: '#AFC3FF',

  secondary: '#95B51D',
  onSecondary: '#101B3A',
  action: '#1858EB',
  onAction: '#ffffff',
  secondaryContainer: '#EAF3B9',
  onSecondaryContainer: '#354100',
  secondaryFixed: '#C4E02D',
  secondaryFixedDim: '#AFCB23',
  onSecondaryFixed: '#252E00',
  onSecondaryFixedVariant: '#4C5B00',

  tertiary: '#596176',
  onTertiary: '#ffffff',
  tertiaryContainer: '#E5E9F2',
  onTertiaryContainer: '#101B3A',
  tertiaryFixed: '#F1F3F9',
  tertiaryFixedDim: '#DDE2EF',
  onTertiaryFixed: '#101B3A',
  onTertiaryFixedVariant: '#596176',

  background: '#F7F8FC',
  onBackground: '#101B3A',
  surface: '#F7F8FC',
  surfaceBright: '#F7F8FC',
  surfaceContainerLowest: '#ffffff',
  cardSurface: '#ffffff',
  surfaceContainerLow: '#F1F3F9',
  surfaceContainer: '#EBEEF6',
  surfaceContainerHigh: '#E5E9F2',
  surfaceContainerHighest: '#DDE2EF',
  surfaceDim: '#D5DAE7',
  surfaceVariant: '#E5E9F2',
  onSurface: '#101B3A',
  onSurfaceVariant: '#596176',
  inverseSurface: '#202B49',
  inverseOnSurface: '#F5F7FF',
  surfaceTint: '#1858EB',

  outline: '#747C90',
  outlineVariant: '#D7DCE8',

  error: '#C64E32',
  onError: '#ffffff',
  errorContainer: '#F9E3DD',
  onErrorContainer: '#7B2415',
  errorBackground: '#FFF4F1',

  white: '#ffffff',
  textPrimary: '#101B3A',
  textSecondary: '#596176',
  border: '#DDE2EF',
  shadowColor: '#101B3A',
  warning: '#9A6A22',
  warningBackground: '#F7EEDB',
  emerald: '#95B51D',
  darkEmerald: '#566B00',
  mintBackground: '#F0F6CE',
  warmBackground: '#F7F8FC',
} as const;

export const DARK_COLORS: Record<keyof typeof LIGHT_COLORS, string> = {
  primary: '#B6C4FF',
  onPrimary: '#00287D',
  primaryContainer: '#1958EB',
  onPrimaryContainer: '#DEE3FF',
  primaryFixed: '#DCE1FF',
  primaryFixedDim: '#B6C4FF',
  onPrimaryFixed: '#00164E',
  onPrimaryFixedVariant: '#003BAF',
  inversePrimary: '#0250E3',

  secondary: '#C4E02D',
  onSecondary: '#2C3400',
  action: '#1858EB',
  onAction: '#FFFFFF',
  secondaryContainer: '#A4BF01',
  onSecondaryContainer: '#2C3500',
  secondaryFixed: '#D3F044',
  secondaryFixedDim: '#B7D325',
  onSecondaryFixed: '#181E00',
  onSecondaryFixedVariant: '#404C00',

  tertiary: '#AEB7C8',
  onTertiary: '#2F3131',
  tertiaryContainer: '#242A32',
  onTertiaryContainer: '#DDE3ED',
  tertiaryFixed: '#242A32',
  tertiaryFixedDim: '#2F353D',
  onTertiaryFixed: '#DDE3ED',
  onTertiaryFixedVariant: '#AEB7C8',

  background: '#0E141B',
  onBackground: '#DDE3ED',
  surface: '#0E141B',
  surfaceBright: '#333A42',
  surfaceContainerLowest: '#080F16',
  cardSurface: '#161C24',
  surfaceContainerLow: '#161C24',
  surfaceContainer: '#1A2028',
  surfaceContainerHigh: '#242A32',
  surfaceContainerHighest: '#2F353D',
  surfaceDim: '#0E141B',
  surfaceVariant: '#2F353D',
  onSurface: '#DDE3ED',
  onSurfaceVariant: '#C3C5D8',
  inverseSurface: '#DDE3ED',
  inverseOnSurface: '#2B3139',
  surfaceTint: '#B6C4FF',

  outline: '#8D90A1',
  outlineVariant: '#434655',

  error: '#FFB4A6',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
  errorBackground: '#2B1718',

  white: '#ffffff',
  textPrimary: '#DDE3ED',
  textSecondary: '#C3C5D8',
  border: '#434655',
  shadowColor: '#080F16',
  warning: '#E0B46D',
  warningBackground: '#2B2114',
  emerald: '#C4E02D',
  darkEmerald: '#C4E02D',
  mintBackground: '#252D12',
  warmBackground: '#0E141B',
};

export type ThemeMode = 'light' | 'dark';
type ThemeColorKey = keyof typeof LIGHT_COLORS;

// Expo Compose views do not accept React Native PlatformColor objects.
// Use this at native-module boundaries that require a concrete color value.
export const getThemeHexColor = (key: ThemeColorKey, mode: ThemeMode): string =>
  (mode === 'dark' ? DARK_COLORS : LIGHT_COLORS)[key];

const resolveThemeColor = (key: ThemeColorKey): string => {
  const light = LIGHT_COLORS[key];
  const dark = DARK_COLORS[key];

  if (Platform.OS === 'web') return `var(--pa-${key})`;
  if (Platform.OS === 'ios') return DynamicColorIOS({ light, dark }) as unknown as string;
  return PlatformColor(`@color/pa_${key.replace(/([A-Z])/g, '_$1').toLowerCase()}`) as unknown as string;
};

export const applyWebPalette = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return;

  const palette = mode === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  for (const [key, value] of Object.entries(palette)) {
    document.documentElement.style.setProperty(`--pa-${key}`, value);
  }
  document.documentElement.style.colorScheme = mode;
};

if (typeof document !== 'undefined') applyWebPalette('light');

export const COLORS = Object.fromEntries(
  (Object.keys(LIGHT_COLORS) as ThemeColorKey[]).map((key) => [key, resolveThemeColor(key)]),
) as Record<ThemeColorKey, string>;

export const SPACING = {
  base: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  containerPadding: 20,
  gutter: 16,
} as const;

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
} as const;

const FLAT_SHADOW = {
  shadowColor: 'transparent',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
} as const;

export const SHADOWS = {
  sm: FLAT_SHADOW,
  md: FLAT_SHADOW,
  lg: FLAT_SHADOW,
} as const;

export const TYPOGRAPHY = {
  displayLg: {
    fontFamily: APP_FONTS.bold,
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 48,
    color: COLORS.textPrimary,
    letterSpacing: -0.02,
  },
  displayLgMobile: {
    fontFamily: APP_FONTS.bold,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: COLORS.textPrimary,
    letterSpacing: -0.02,
  },
  headlineMd: {
    fontFamily: APP_FONTS.semibold,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: COLORS.textPrimary,
  },
  bodyLg: {
    fontFamily: APP_FONTS.regular,
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
    color: COLORS.textPrimary,
  },
  bodyMd: {
    fontFamily: APP_FONTS.regular,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: COLORS.textPrimary,
  },
  bodySemiBold: {
    fontFamily: APP_FONTS.semibold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: COLORS.textPrimary,
  },
  bodyMedium: {
    fontFamily: APP_FONTS.medium,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: COLORS.textPrimary,
  },
  labelSm: {
    fontFamily: APP_FONTS.semibold,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: COLORS.textSecondary,
    letterSpacing: 0.05,
  },
  amountLg: {
    fontFamily: APP_FONTS.semibold,
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 40,
    color: COLORS.textPrimary,
  } as const,
  amountMd: {
    fontFamily: APP_FONTS.semibold,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    color: COLORS.textPrimary,
  } as const,
  buttonText: {
    fontFamily: APP_FONTS.semibold,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: COLORS.white,
  },
  h1: {
    fontFamily: APP_FONTS.bold,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: COLORS.textPrimary,
  },
  h2: {
    fontFamily: APP_FONTS.bold,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: COLORS.textPrimary,
  },
  h3: {
    fontFamily: APP_FONTS.semibold,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: COLORS.textPrimary,
  },
  caption: {
    fontFamily: APP_FONTS.medium,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: COLORS.textSecondary,
  },
  arabicBody: {
    fontFamily: 'Cairo',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: COLORS.textPrimary,
  },
  arabicBodySemiBold: {
    fontFamily: 'Cairo',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: COLORS.textPrimary,
  },
  arabicDisplay: {
    fontFamily: 'Cairo',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: COLORS.textPrimary,
  },
  display: {
    fontFamily: APP_FONTS.bold,
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 44,
    letterSpacing: 0.25,
  },
  screenTitle: {
    fontFamily: APP_FONTS.bold,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontFamily: APP_FONTS.semibold,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: 0.15,
  },
  cardTitle: {
    fontFamily: APP_FONTS.semibold,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  body: {
    fontFamily: APP_FONTS.regular,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  supporting: {
    fontFamily: APP_FONTS.regular,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: 0.15,
  },
  button: {
    fontFamily: APP_FONTS.semibold,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: 0.15,
  },
  financialAmount: {
    fontFamily: APP_FONTS.bold,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: 0.2,
  },
  warning: {
    fontFamily: APP_FONTS.semibold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    letterSpacing: 0.15,
  },
  legalTitle: {
    fontFamily: APP_FONTS.bold,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    letterSpacing: 0.15,
  },
  legalBody: {
    fontFamily: APP_FONTS.regular,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: 0.15,
  },
  navLabel: {
    fontFamily: APP_FONTS.medium,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  inputLabel: {
    fontFamily: APP_FONTS.medium,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
    letterSpacing: 0.15,
  },
  inputValue: {
    fontFamily: APP_FONTS.regular,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  inputFinancial: {
    fontFamily: APP_FONTS.semibold,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.15,
  },
} as const;

export const Colors = {
  light: {
    text: LIGHT_COLORS.textPrimary,
    background: LIGHT_COLORS.background,
    backgroundElement: LIGHT_COLORS.surfaceContainerLowest,
    backgroundSelected: LIGHT_COLORS.mintBackground,
    textSecondary: LIGHT_COLORS.textSecondary,
  },
  dark: {
    text: DARK_COLORS.textPrimary,
    background: DARK_COLORS.background,
    backgroundElement: DARK_COLORS.surfaceContainerLowest,
    backgroundSelected: DARK_COLORS.mintBackground,
    textSecondary: DARK_COLORS.textSecondary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: APP_FONTS.regular,
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monoto',
  },
  default: {
    sans: APP_FONTS.regular,
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: APP_FONTS.regular,
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
