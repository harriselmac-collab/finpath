import React, { memo } from 'react';
import { I18nManager, StyleSheet, View } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import AppText from '../Text/AppText';
import { Icon, PressableCard } from '../ui';
import { COLORS, SPACING } from '../../constants/theme';

export interface GuidanceData {
  text: string;
  action: string;
  href: Href;
}

interface DashboardGuidanceCardProps {
  guidance: GuidanceData;
}

export const DashboardGuidanceCard = memo(function DashboardGuidanceCard({
  guidance,
}: DashboardGuidanceCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <PressableCard
      onPress={() => router.push(guidance.href)}
      style={styles.guidanceCard}
      shadow="none"
      accessibilityLabel={`${t('dashboard.guidanceTitle', "Today's guidance")}. ${guidance.text}. ${guidance.action}`}
      accessibilityHint={guidance.action}
    >
      <View style={styles.guidanceIcon}>
        <Icon name="bulb" size={24} color={COLORS.emerald} />
      </View>
      <View style={styles.guidanceCopy}>
        <AppText
          variant="cardTitle"
          style={styles.guidanceTitle}
          role="heading"
          aria-level={2}
        >
          {t('dashboard.guidanceTitle', "Today's guidance")}
        </AppText>
        <AppText variant="body" style={styles.guidanceText}>{guidance.text}</AppText>
        <AppText variant="bodySemiBold" style={styles.guidanceAction}>{guidance.action}</AppText>
      </View>
      <Icon
        name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'}
        size={18}
        color={COLORS.onAction}
      />
    </PressableCard>
  );
});

const styles = StyleSheet.create({
  guidanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  guidanceIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.mintBackground,
  },
  guidanceCopy: {
    flex: 1,
    gap: SPACING.base,
  },
  guidanceTitle: {
    color: COLORS.textPrimary,
  },
  guidanceText: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  guidanceAction: {
    color: COLORS.primary,
    marginTop: SPACING.base,
  },
});
