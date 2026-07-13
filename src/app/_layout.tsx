import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { useColorScheme } from 'react-native';

// Import i18n configuration
import '../services/localization/i18n';
import { COLORS } from '../constants/theme';

// Prevent splash screen from auto-hiding until assets are loaded
SplashScreen.preventAutoHideAsync().catch(() => {});

const FONT_FAMILIES = {
  PlusJakartaSans_400Regular: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yw.woff2',
  PlusJakartaSans_600SemiBold: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yw.woff2',
  PlusJakartaSans_700Bold: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yw.woff2',
  PlusJakartaSans_800ExtraBold: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yw.woff2',
  Inter_400Regular: 'https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2',
  Inter_600SemiBold: 'https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2',
  Cairo_400Regular: 'https://fonts.gstatic.com/s/cairo/v31/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscRiyS.woff2',
  Cairo_600SemiBold: 'https://fonts.gstatic.com/s/cairo/v31/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscRiyS.woff2',
  Cairo_700Bold: 'https://fonts.gstatic.com/s/cairo/v31/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscRiyS.woff2',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const loadAssets = async () => {
      try {
        await Font.loadAsync(FONT_FAMILIES);
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
        <Stack.Screen name="dashboard/index" />
      </Stack>
    </SafeAreaProvider>
  );
}

export { FONT_FAMILIES };
