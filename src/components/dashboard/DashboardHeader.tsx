import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import AppText from '../Text/AppText';
import { Icon } from '../ui';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface DashboardHeaderProps {
  greeting: string;
  monthName: string;
}

export const DashboardHeader = memo(function DashboardHeader({
  greeting,
  monthName,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Icon name="person-outline" size={22} color={COLORS.surfaceTint} />
        </View>
        <View style={styles.identityCopy}>
          <AppText variant="bodySemiBold" style={styles.greeting} numberOfLines={1}>
            {greeting}
          </AppText>
          <AppText variant="supporting" style={styles.month}>{monthName}</AppText>
        </View>
      </View>
      <Pressable
        onPress={() => router.push('/profile/notifications')}
        style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={t('dashboard.notifications', 'Notifications')}
      >
        <Icon name="notifications-outline" size={22} color={COLORS.primary} />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  identity: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  identityCopy: {
    minWidth: 0,
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.mintBackground,
    borderWidth: 1,
    borderColor: COLORS.surfaceTint,
  },
  greeting: {
    color: COLORS.textPrimary,
  },
  month: {
    color: COLORS.textSecondary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
