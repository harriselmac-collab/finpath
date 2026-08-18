import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { useColorScheme, I18nManager, AppState, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../services/localization/i18n';
import { isRtlLanguage, normalizeLanguageCode } from '../services/localization/languages';
import { COLORS } from '../constants/theme';
import { initializeThemePreference, syncSystemTheme } from '../services/theme';
import { useSessionStore } from '../store/sessionStore';
import { isSupabaseConfigured, supabase } from '../services/supabase/supabaseClient';
import { useSecurityStore } from '../store/securityStore';
import { AppLockOverlay } from '../components/security/AppLockOverlay';
import { OfflineSyncBanner } from '../components/common/OfflineSyncBanner';

// Prevent splash screen from auto-hiding until assets are loaded
SplashScreen.preventAutoHideAsync().catch(() => {});

const FONT_FAMILIES = {
  SpaceGrotesk_400Regular: require('../../assets/fonts/SpaceGrotesk-Variable.ttf'),
  SpaceGrotesk_500Medium: require('../../assets/fonts/SpaceGrotesk-Variable.ttf'),
  SpaceGrotesk_600SemiBold: require('../../assets/fonts/SpaceGrotesk-Variable.ttf'),
  SpaceGrotesk_700Bold: require('../../assets/fonts/SpaceGrotesk-Variable.ttf'),
  
  Cairo: require('../../assets/fonts/Cairo-Variable.ttf'),
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initializeAuth = useSessionStore((state) => state.initializeAuth);
  const authLoading = useSessionStore((state) => state.loading);
  const userId = useSessionStore((state) => state.user?.id);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [initializeAuth]);

  useEffect(() => {
    if (Platform.OS === 'web' || !isSupabaseConfigured) return;

    const updateRefreshState = (state: string) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    };

    updateRefreshState(AppState.currentState);
    const subscription = AppState.addEventListener('change', updateRefreshState);
    return () => {
      subscription.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    const sync = () => { void import('../services/sync/financialSync').then(({ synchronizeFinancialData }) => synchronizeFinancialData()); };
    sync();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });
    return () => subscription.remove();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    void AsyncStorage.getItem('pocket-ahead-welcome-back').then(async (shouldWelcomeBack) => {
      if (shouldWelcomeBack !== 'true') return;
      await AsyncStorage.removeItem('pocket-ahead-welcome-back');
      Alert.alert(i18n.t('dashboard.welcomeBack', 'Welcome back'));
    });
  }, [userId]);

  useEffect(() => {
    syncSystemTheme(colorScheme);
  }, [colorScheme]);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        await initializeThemePreference();

        // 1. Load stored language preference first to determine font requirements
        const storedLang = await AsyncStorage.getItem('user-language');
        if (storedLang) {
          const language = normalizeLanguageCode(storedLang);
          await i18n.changeLanguage(language);
          const isRTL = isRtlLanguage(language);
          if (I18nManager.isRTL !== isRTL) {
            I18nManager.allowRTL(isRTL);
            I18nManager.forceRTL(isRTL);
          }
          if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('lang', language);
            document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
          }
        }

        // 2. Load all font families unconditionally
        const fontsToLoad = FONT_FAMILIES;

        await Font.loadAsync(fontsToLoad);
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      }
    };
    loadAssets();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      useSecurityStore.getState().handleAppStateChange(nextState);
    });
    return () => subscription.remove();
  }, []);

  if (authLoading) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <OfflineSyncBanner />
      <Stack
        key={colorScheme ?? 'light'}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.surface },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/index" />
        <Stack.Screen name="auth/update-password" />
        <Stack.Screen name="onboarding/welcome" />
        <Stack.Screen name="onboarding/quiz" />
        <Stack.Screen name="onboarding/review" />
        <Stack.Screen name="onboarding/essential-expenses" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="transaction-form" />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="profile/notifications" />
        <Stack.Screen name="profile/security" />
        <Stack.Screen name="profile/privacy" />
        <Stack.Screen name="profile/export-data" />
        <Stack.Screen name="profile/delete-account" />
        <Stack.Screen name="profile/help" />
        <Stack.Screen name="profile/about" />
        <Stack.Screen name="profile/legal/privacy" />
        <Stack.Screen name="profile/legal/terms" />
        <Stack.Screen name="profile/legal/financial-disclaimer" />
        <Stack.Screen name="profile/legal/licenses" />
      </Stack>
      <AppLockOverlay />
    </SafeAreaProvider>
  );
}

export { FONT_FAMILIES };
