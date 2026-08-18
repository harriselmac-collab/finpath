import React, { memo } from 'react';
import { I18nManager, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  FadeOut,
  SharedValue,
  useAnimatedStyle,
  useReducedMotion,
} from 'react-native-reanimated';

import AppText from '../Text/AppText';
import { Icon } from '../ui';
import { ProgressBar } from '../ui/ProgressBar';
import { COLORS, SPACING } from '../../constants/theme';

export interface ProgressiveSetupItem {
  key: string;
  done: boolean;
  href: Href;
}

interface DashboardProgressiveSetupProps {
  completedSetup: number;
  totalSetup: number;
  nextSetup: ProgressiveSetupItem[];
  setupExpanded: boolean;
  onToggleExpand: () => void;
  chevronRotation: SharedValue<number>;
}

export const DashboardProgressiveSetup = memo(function DashboardProgressiveSetup({
  completedSetup,
  totalSetup,
  nextSetup,
  setupExpanded,
  onToggleExpand,
  chevronRotation,
}: DashboardProgressiveSetupProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const setupEnter = reduceMotion
    ? FadeIn.duration(160).easing(Easing.ease)
    : (Platform.OS === 'web'
      ? FadeIn.duration(200)
      : FadeInUp.duration(200).withInitialValues({
          opacity: 0,
          transform: [{ translateY: -8 }],
        }))
        .easing(Easing.bezier(0.23, 1, 0.32, 1));
  const setupExit = FadeOut.duration(reduceMotion ? 120 : 150).easing(Easing.ease);

  return (
    <View style={styles.progressiveSetup}>
      <Pressable
        onPress={onToggleExpand}
        style={styles.progressiveToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: setupExpanded }}
        accessibilityLabel={setupExpanded ? t('onboarding.progressive.collapse') : t('onboarding.progressive.expand')}
      >
        <View style={styles.progressiveHeading}>
          <AppText role="heading" aria-level={2} variant="bodySemiBold" style={styles.progressiveTitle}>
            {t('onboarding.progressive.title')}
          </AppText>
          <AppText variant="supporting" style={styles.progressiveCount}>
            {t('onboarding.progressive.subtitle', { done: completedSetup, total: totalSetup })}
          </AppText>
        </View>
        <Animated.View style={chevronStyle}>
          <Icon name="chevron-down" size={20} color={COLORS.surfaceTint} />
        </Animated.View>
      </Pressable>
      <ProgressBar progress={completedSetup / (totalSetup || 1)} height={5} />
      <AppText variant="caption" style={styles.progressiveWhy}>{t('onboarding.progressive.why')}</AppText>
      {setupExpanded && (
        <Animated.View entering={setupEnter} exiting={setupExit} style={styles.setupRows}>
          {nextSetup.map((item) => (
            <Pressable key={item.key} onPress={() => router.push(item.href)} style={styles.setupRow} accessibilityRole="button">
              <AppText variant="bodyMedium" style={styles.setupRowText}>{t(`onboarding.progressive.${item.key}`)}</AppText>
              <Icon name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={COLORS.surfaceTint} />
            </Pressable>
          ))}
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  progressiveSetup: {
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    gap: SPACING.sm,
  },
  progressiveToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressiveHeading: {
    gap: SPACING.base,
  },
  progressiveTitle: {
    color: COLORS.textPrimary,
  },
  progressiveCount: {
    color: COLORS.textSecondary,
  },
  progressiveWhy: {
    color: COLORS.textSecondary,
  },
  setupRows: {
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  setupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  setupRowText: {
    color: COLORS.textPrimary,
  },
});
