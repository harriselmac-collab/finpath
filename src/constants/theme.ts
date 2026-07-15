import '@/global.css';
import { Platform } from 'react-native';

export const COLORS = {
  primary: '#071E3D',
  onPrimary: '#ffffff',
  primaryContainer: '#071e3d',
  onPrimaryContainer: '#7387ab',
  primaryFixed: '#d6e3ff',
  primaryFixedDim: '#b3c7ef',
  onPrimaryFixed: '#041b3a',
  onPrimaryFixedVariant: '#344768',
  inversePrimary: '#b3c7ef',

  secondary: '#4c6700',
  onSecondary: '#ffffff',
  secondaryContainer: '#bcf137',
  onSecondaryContainer: '#506c00',
  secondaryFixed: '#bff43a',
  secondaryFixedDim: '#a4d716',
  onSecondaryFixed: '#151f00',
  onSecondaryFixedVariant: '#394d00',

  tertiary: '#000610',
  onTertiary: '#ffffff',
  tertiaryContainer: '#002039',
  onTertiaryContainer: '#6689af',
  tertiaryFixed: '#d0e4ff',
  tertiaryFixedDim: '#a6caf3',
  onTertiaryFixed: '#001d34',
  onTertiaryFixedVariant: '#23496c',

  background: '#f9f9ff',
  onBackground: '#071b37',
  surface: '#f9f9ff',
  surfaceBright: '#f9f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0f3ff',
  surfaceContainer: '#e8eeff',
  surfaceContainerHigh: '#dfe8ff',
  surfaceContainerHighest: '#d6e3ff',
  surfaceDim: '#c9dbff',
  surfaceVariant: '#d6e3ff',
  onSurface: '#071b37',
  onSurfaceVariant: '#44474e',
  inverseSurface: '#1f314d',
  inverseOnSurface: '#ecf0ff',
  surfaceTint: '#4c5f81',

  outline: '#74777f',
  outlineVariant: '#c4c6cf',

  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  white: '#ffffff',
  textPrimary: '#071b37',
  textSecondary: '#44474e',
  border: '#e4e7ec',
  warning: '#F5B942',
  emerald: '#48C774',
  darkEmerald: '#1D8A55',
  mintBackground: '#EAF8EF',
  warmBackground: '#f9f9ff',
} as const;

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

export const SHADOWS = {
  sm: {
    shadowColor: '#071b37',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#071b37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
  },
  lg: {
    shadowColor: '#071b37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 6,
  },
} as const;

export const TYPOGRAPHY = {
  displayLg: {
    fontFamily: 'Changa_700Bold',
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 48,
    color: '#071b37',
    letterSpacing: -0.02,
  },
  displayLgMobile: {
    fontFamily: 'Changa_700Bold',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: '#071b37',
    letterSpacing: -0.02,
  },
  headlineMd: {
    fontFamily: 'Changa_600SemiBold',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: '#071b37',
  },
  bodyLg: {
    fontFamily: 'Changa_400Regular',
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
    color: '#071b37',
  },
  bodyMd: {
    fontFamily: 'Changa_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#071b37',
  },
  bodySemiBold: {
    fontFamily: 'Changa_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#071b37',
  },
  bodyMedium: {
    fontFamily: 'Changa_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#071b37',
  },
  labelSm: {
    fontFamily: 'Changa_600SemiBold',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: '#44474e',
    letterSpacing: 0.05,
  },
  amountLg: {
    fontFamily: 'Changa_600SemiBold',
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 40,
    color: '#071b37',
  } as const,
  amountMd: {
    fontFamily: 'Changa_600SemiBold',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    color: '#071b37',
  } as const,
  buttonText: {
    fontFamily: 'Changa_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#ffffff',
  },
  h1: {
    fontFamily: 'Changa_700Bold',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: '#071b37',
  },
  h2: {
    fontFamily: 'Changa_700Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: '#071b37',
  },
  h3: {
    fontFamily: 'Changa_600SemiBold',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: '#071b37',
  },
  caption: {
    fontFamily: 'Changa_500Medium',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#44474e',
  },
  arabicBody: {
    fontFamily: 'Changa_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#071b37',
  },
  arabicBodySemiBold: {
    fontFamily: 'Changa_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#071b37',
  },
  arabicDisplay: {
    fontFamily: 'Changa_700Bold',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: '#071b37',
  },
  display: {
    fontFamily: 'Changa_800ExtraBold',
    fontSize: 36,
    lineHeight: 44,
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
  inputFinancial: {
    fontFamily: 'Changa_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
} as const;

export const Colors = {
  light: {
    text: '#071b37',
    background: '#f9f9ff',
    backgroundElement: '#ffffff',
    backgroundSelected: '#f0f3ff',
    textSecondary: '#44474e',
  },
  dark: {
    text: '#ecf0ff',
    background: '#071e3d',
    backgroundElement: '#103A5C',
    backgroundSelected: '#071e3d',
    textSecondary: '#7387ab',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'PlusJakartaSans_400Regular',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monoto',
  },
  default: {
    sans: 'PlusJakartaSans_400Regular',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
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
