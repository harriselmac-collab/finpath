// src/index.js
import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { SplashScreen } from 'expo-splash-screen';
import { useFonts, Changa_400Regular, Changa_500Medium, Changa_600SemiBold, Changa_700Bold, Changa_800ExtraBold } from '@expo-google-fonts/changa';
import { Router } from 'expo-router';

export default function Index() {
  // Keep the splash screen visible while we load fonts
  useEffect(() => {
    (async () => {
      await SplashScreen.preventAutoHideAsync();
    })();
  }, []);

  const [fontsLoaded] = useFonts({
    Changa_400Regular,
    Changa_500Medium,
    Changa_600SemiBold,
    Changa_700Bold,
    Changa_800ExtraBold,
  });
  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  if (!fontsLoaded) {
    return null; // We'll show nothing until fonts load, but the splash screen is visible
  }

  return (
    <View onLayout={onLayoutRootView}>
      <Router />
    </View>
  );
}