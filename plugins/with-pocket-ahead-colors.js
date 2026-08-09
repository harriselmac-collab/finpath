const {
  AndroidConfig,
  withAndroidColors,
  withAndroidColorsNight,
} = require('@expo/config-plugins');

const LIGHT_COLORS = {
  primary: '#101B3A', onPrimary: '#ffffff', primaryContainer: '#101B3A', onPrimaryContainer: '#EFF3FF',
  primaryFixed: '#E8EEFF', primaryFixedDim: '#CEDAFF', onPrimaryFixed: '#0E255B', onPrimaryFixedVariant: '#294A9B', inversePrimary: '#AFC3FF',
  secondary: '#95B51D', onSecondary: '#101B3A', action: '#1858EB', onAction: '#ffffff', secondaryContainer: '#EAF3B9', onSecondaryContainer: '#354100',
  secondaryFixed: '#C4E02D', secondaryFixedDim: '#AFCB23', onSecondaryFixed: '#252E00', onSecondaryFixedVariant: '#4C5B00',
  tertiary: '#596176', onTertiary: '#ffffff', tertiaryContainer: '#E5E9F2', onTertiaryContainer: '#101B3A', tertiaryFixed: '#F1F3F9',
  tertiaryFixedDim: '#DDE2EF', onTertiaryFixed: '#101B3A', onTertiaryFixedVariant: '#596176',
  background: '#F7F8FC', onBackground: '#101B3A', surface: '#F7F8FC', surfaceBright: '#F7F8FC', surfaceContainerLowest: '#ffffff',
  cardSurface: '#ffffff', surfaceContainerLow: '#F1F3F9', surfaceContainer: '#EBEEF6', surfaceContainerHigh: '#E5E9F2',
  surfaceContainerHighest: '#DDE2EF', surfaceDim: '#D5DAE7', surfaceVariant: '#E5E9F2', onSurface: '#101B3A', onSurfaceVariant: '#596176',
  inverseSurface: '#202B49', inverseOnSurface: '#F5F7FF', surfaceTint: '#1858EB', outline: '#747C90', outlineVariant: '#D7DCE8',
  error: '#C64E32', onError: '#ffffff', errorContainer: '#F9E3DD', onErrorContainer: '#7B2415', errorBackground: '#FFF4F1',
  white: '#ffffff', textPrimary: '#101B3A', textSecondary: '#596176', border: '#DDE2EF', shadowColor: '#101B3A', warning: '#9A6A22',
  warningBackground: '#F7EEDB', emerald: '#95B51D', darkEmerald: '#566B00', mintBackground: '#F0F6CE', warmBackground: '#F7F8FC',
};

const DARK_COLORS = {
  primary: '#B6C4FF', onPrimary: '#00287D', primaryContainer: '#1958EB', onPrimaryContainer: '#DEE3FF',
  primaryFixed: '#DCE1FF', primaryFixedDim: '#B6C4FF', onPrimaryFixed: '#00164E', onPrimaryFixedVariant: '#003BAF', inversePrimary: '#0250E3',
  secondary: '#C4E02D', onSecondary: '#2C3400', action: '#1858EB', onAction: '#FFFFFF', secondaryContainer: '#A4BF01', onSecondaryContainer: '#2C3500',
  secondaryFixed: '#D3F044', secondaryFixedDim: '#B7D325', onSecondaryFixed: '#181E00', onSecondaryFixedVariant: '#404C00',
  tertiary: '#AEB7C8', onTertiary: '#2F3131', tertiaryContainer: '#242A32', onTertiaryContainer: '#DDE3ED', tertiaryFixed: '#242A32',
  tertiaryFixedDim: '#2F353D', onTertiaryFixed: '#DDE3ED', onTertiaryFixedVariant: '#AEB7C8',
  background: '#0E141B', onBackground: '#DDE3ED', surface: '#0E141B', surfaceBright: '#333A42', surfaceContainerLowest: '#080F16',
  cardSurface: '#161C24', surfaceContainerLow: '#161C24', surfaceContainer: '#1A2028', surfaceContainerHigh: '#242A32',
  surfaceContainerHighest: '#2F353D', surfaceDim: '#0E141B', surfaceVariant: '#2F353D', onSurface: '#DDE3ED', onSurfaceVariant: '#C3C5D8',
  inverseSurface: '#DDE3ED', inverseOnSurface: '#2B3139', surfaceTint: '#B6C4FF', outline: '#8D90A1', outlineVariant: '#434655',
  error: '#FFB4A6', onError: '#690005', errorContainer: '#93000A', onErrorContainer: '#FFDAD6', errorBackground: '#2B1718',
  white: '#ffffff', textPrimary: '#DDE3ED', textSecondary: '#C3C5D8', border: '#434655', shadowColor: '#080F16', warning: '#E0B46D',
  warningBackground: '#2B2114', emerald: '#C4E02D', darkEmerald: '#C4E02D', mintBackground: '#252D12', warmBackground: '#0E141B',
};

const toResourceName = (key) => `pa_${key.replace(/([A-Z])/g, '_$1').toLowerCase()}`;

const assignPalette = (xml, palette) => Object.entries(palette).reduce(
  (result, [key, value]) => AndroidConfig.Colors.assignColorValue(result, {
    name: toResourceName(key),
    value,
  }),
  xml,
);

const withPocketAheadColors = (config) => {
  config = withAndroidColors(config, (modConfig) => {
    modConfig.modResults = assignPalette(modConfig.modResults, LIGHT_COLORS);
    return modConfig;
  });

  return withAndroidColorsNight(config, (modConfig) => {
    modConfig.modResults = assignPalette(modConfig.modResults, DARK_COLORS);
    return modConfig;
  });
};

module.exports = withPocketAheadColors;
module.exports.LIGHT_COLORS = LIGHT_COLORS;
module.exports.DARK_COLORS = DARK_COLORS;
