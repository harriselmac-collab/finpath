import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { useColorScheme, I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../services/localization/i18n';
import { COLORS } from '../constants/theme';
import { useSessionStore } from '../store/sessionStore';

// Prevent splash screen from auto-hiding until assets are loaded
SplashScreen.preventAutoHideAsync().catch(() => {});

const FONT_FAMILIES = {
  PlusJakartaSans_400Regular: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_qU7NSg.ttf',
  PlusJakartaSans_500Medium: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_m07NSg.ttf',
  PlusJakartaSans_600SemiBold: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_d0nNSg.ttf',
  PlusJakartaSans_700Bold: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_TknNSg.ttf',
  PlusJakartaSans_800ExtraBold: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_KUnNSg.ttf',
  
  Inter_400Regular: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_qU7NSg.ttf',
  Inter_600SemiBold: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_d0nNSg.ttf',
  
  Cairo_400Regular: 'https://fonts.gstatic.com/s/changa/v29/2-c79JNi2YuVOUcOarRPgnNGooxCZ62xQjA.ttf',
  Cairo_600SemiBold: 'https://fonts.gstatic.com/s/changa/v29/2-c79JNi2YuVOUcOarRPgnNGooxCZ3O2QjA.ttf',
  Cairo_700Bold: 'https://fonts.gstatic.com/s/changa/v29/2-c79JNi2YuVOUcOarRPgnNGooxCZ0q2QjA.ttf',
  
  Changa_300Light: 'https://fonts.gstatic.com/s/changa/v29/2-c79JNi2YuVOUcOarRPgnNGooxCZ_OxQjA.ttf',
  Changa_400Regular: 'https://fonts.gstatic.com/s/changa/v29/2-c79JNi2YuVOUcOarRPgnNGooxCZ62xQjA.ttf',
  Changa_500Medium: 'https://fonts.gstatic.com/s/changa/v29/2-c79JNi2YuVOUcOarRPgnNGooxCZ5-xQjA.ttf',
  Changa_600SemiBold: 'https://fonts.gstatic.com/s/changa/v29/2-c79JNi2YuVOUcOarRPgnNGooxCZ3O2QjA.ttf',
  Changa_700Bold: 'https://fonts.gstatic.com/s/changa/v29/2-c79JNi2YuVOUcOarRPgnNGooxCZ0q2QjA.ttf',
  Changa_800ExtraBold: 'https://fonts.gstatic.com/s/changa/v29/2-c79JNi2YuVOUcOarRPgnNGooxCZy22QjA.ttf',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initializeAuth = useSessionStore((state) => state.initializeAuth);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [initializeAuth]);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        // 1. Load stored language preference first to determine font requirements
        const storedLang = await AsyncStorage.getItem('user-language');
        if (storedLang) {
          await i18n.changeLanguage(storedLang);
          const isRTL = storedLang === 'ar';
          if (I18nManager.isRTL !== isRTL) {
            I18nManager.allowRTL(isRTL);
            I18nManager.forceRTL(isRTL);
          }
          if (typeof document !== 'undefined') {
            document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
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

  return (
    <SafeAreaProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.surface },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/index" />
        <Stack.Screen name="onboarding/welcome" />
        <Stack.Screen name="onboarding/quiz" />
        <Stack.Screen name="onboarding/review" />
        <Stack.Screen name="onboarding/essential-expenses" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="profile/notifications" />
        <Stack.Screen name="profile/security" />
        <Stack.Screen name="profile/privacy" />
        <Stack.Screen name="profile/ai-consent" />
        <Stack.Screen name="profile/export-data" />
        <Stack.Screen name="profile/delete-account" />
        <Stack.Screen name="profile/help" />
        <Stack.Screen name="profile/about" />
        <Stack.Screen name="profile/legal/privacy" />
        <Stack.Screen name="profile/legal/terms" />
        <Stack.Screen name="profile/legal/financial-disclaimer" />
        <Stack.Screen name="profile/legal/ai-disclaimer" />
        <Stack.Screen name="profile/legal/licenses" />
      </Stack>
    </SafeAreaProvider>
  );
}

export { FONT_FAMILIES };
