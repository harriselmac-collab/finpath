import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppText from '../Text/AppText';
import { Icon } from '../ui';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export function OfflineSyncBanner() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let previousConnected = true;

    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(offline);

      if (!offline && !previousConnected) {
        setShowReconnected(true);
        const timer = setTimeout(() => setShowReconnected(false), 3500);
        return () => clearTimeout(timer);
      }

      previousConnected = !offline;
    });

    return () => unsubscribe();
  }, []);

  if (!isOffline && !showReconnected) {
    return null;
  }

  const topOffset = Math.max(insets.top, 12);

  return (
    <Animated.View
      entering={FadeInUp.duration(250)}
      exiting={FadeOutUp.duration(250)}
      style={[styles.container, { top: topOffset }]}
      pointerEvents="none"
      role="status"
    >
      <View style={[styles.pill, isOffline ? styles.offlinePill : styles.onlinePill]}>
        <Icon
          name={isOffline ? 'cloud-offline-outline' : 'checkmark-circle-outline'}
          size={16}
          color={isOffline ? COLORS.onErrorContainer : COLORS.onSecondaryContainer}
        />
        <AppText
          variant="caption"
          style={[styles.pillText, isOffline ? styles.offlineText : styles.onlineText]}
        >
          {isOffline
            ? t('sync.offlineMode', 'Offline Mode • Changes saved locally')
            : t('sync.reconnected', 'Online • Synced with cloud')}
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  offlinePill: {
    backgroundColor: COLORS.errorContainer,
  },
  onlinePill: {
    backgroundColor: COLORS.secondaryContainer,
  },
  pillText: {
    fontWeight: '600',
  },
  offlineText: {
    color: COLORS.onErrorContainer,
  },
  onlineText: {
    color: COLORS.onSecondaryContainer,
  },
});
