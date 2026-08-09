import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, Platform, type ColorSchemeName } from 'react-native';

import { applyWebPalette, type ThemeMode } from '../constants/theme';

export type ThemePreference = ThemeMode | 'system';

const THEME_STORAGE_KEY = 'user-theme';
let activePreference: ThemePreference = 'system';

export const normalizeThemePreference = (value: string | null): ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system' ? value : 'system';

const resolvedMode = (preference: ThemePreference): ThemeMode => {
  if (preference !== 'system') return preference;
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
};

export const applyThemePreference = (preference: ThemePreference) => {
  activePreference = preference;
  if (Platform.OS !== 'web') {
    Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
  }
  applyWebPalette(resolvedMode(preference));

  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = preference;
  }
};

export const getThemePreference = async (): Promise<ThemePreference> =>
  normalizeThemePreference(await AsyncStorage.getItem(THEME_STORAGE_KEY));

export const initializeThemePreference = async (): Promise<ThemePreference> => {
  const preference = await getThemePreference();
  applyThemePreference(preference);
  return preference;
};

export const saveThemePreference = async (preference: ThemePreference) => {
  await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
  applyThemePreference(preference);
};

export const syncSystemTheme = (scheme: ColorSchemeName) => {
  if (activePreference === 'system') applyWebPalette(scheme === 'dark' ? 'dark' : 'light');
};
