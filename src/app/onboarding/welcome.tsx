import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import AppText from '../../components/Text/AppText';
import { Button } from '../../components/ui/Button';
import { FlagIcon } from '../../components/ui/FlagIcon';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { getLanguageOption } from '../../services/localization/languages';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t, i18n, ready } = useTranslation();

  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  const currentLanguage = getLanguageOption(i18n.resolvedLanguage || i18n.language);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(200)} style={styles.header}>
          <Image
            source={require('../../../assets/branding/pocket-ahead-wordmark.svg')}
            style={styles.brandLogo}
            contentFit="contain"
            accessibilityLabel="Pocket Ahead"
          />
          <Pressable
            onPress={() => router.push('/profile/language')}
            style={({ pressed }) => [styles.languageButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={t('profile.language', { defaultValue: 'Language' })}
          >
            <FlagIcon countryCode={currentLanguage.countryCode} size={18} />
            <AppText variant="bodySemiBold" style={styles.languageText}>
              {currentLanguage.label}
            </AppText>
            <Ionicons name="chevron-down" size={16} color={COLORS.primary} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(240).delay(40)} style={styles.visual}>
          <Svg width="100%" height={230} viewBox="0 0 340 230" accessibilityLabel="Financial growth path">
            <Path
              d="M18 201 C92 204 95 40 174 38 C246 36 235 177 322 181"
              fill="none"
              stroke={COLORS.secondary}
              strokeWidth={8}
              strokeLinecap="round"
            />
            <Circle cx="18" cy="201" r="10" fill={COLORS.secondary} />
            <Circle cx="174" cy="38" r="10" fill={COLORS.secondary} />
            <Circle cx="322" cy="181" r="10" fill={COLORS.primary} />
          </Svg>

          <Animated.View entering={FadeInUp.duration(220).delay(90)} style={[styles.metricCard, styles.growthCard]}>
            <Ionicons name="trending-up" size={22} color={COLORS.secondary} />
            <View>
              <AppText variant="supporting" style={styles.metricLabel}>
                {t('welcome.wealthGrowth', { defaultValue: 'Wealth growth' })}
              </AppText>
              <AppText variant="financialAmount" style={styles.metricAmount}>+12.4%</AppText>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(220).delay(140)} style={[styles.metricCard, styles.fundCard]}>
            <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.secondary} />
            <View>
              <AppText variant="supporting" style={styles.metricLabel}>
                {t('dashboard.emergencyFund', { defaultValue: 'Emergency fund' })}
              </AppText>
              <AppText variant="financialAmount" style={styles.metricAmount}>MAD 10,000</AppText>
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(220).delay(160)} style={styles.copy}>
          <AppText variant="displayLgMobile" style={styles.title}>
            {t('welcome.referenceTitle', {
              defaultValue: 'A financial plan built around your real life.',
            })}
          </AppText>
          <AppText variant="bodyLg" style={styles.description}>
            {t('welcome.referenceDescription', {
              defaultValue: 'Take control of your future with a personalized roadmap. Plan your spending, track your goals, and find stability in every decision.',
            })}
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(220).delay(210)} style={styles.actions}>
          <Button
            title={t('onboarding.entry.continueLocal')}
            onPress={() => router.push('/onboarding/quiz')}
            style={styles.primaryButton}
          />
          <Button
            title={t('onboarding.entry.createAccount')}
            onPress={() => router.push({ pathname: '/auth', params: { mode: 'signup' } })}
            variant="secondary"
            style={styles.secondaryButton}
          />
          <Button
            title={t('onboarding.entry.signIn')}
            onPress={() => router.push('/auth')}
            variant="text"
          />
        </Animated.View>

        <Animated.View entering={FadeIn.duration(200).delay(250)} style={styles.privacyRow}>
          <View style={styles.privacyIcon}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.secondary} />
          </View>
          <AppText variant="supporting" style={styles.privacyText}>
            {t('onboarding.entry.localWarning')}
          </AppText>
        </Animated.View>

        <View style={styles.footer}>
          <Pressable onPress={() => router.push('/profile/legal/terms')} accessibilityRole="link">
            <AppText variant="supporting" style={styles.footerLink}>
              {t('legal.terms', { defaultValue: 'Terms' })}
            </AppText>
          </Pressable>
          <Pressable onPress={() => router.push('/profile/security')} accessibilityRole="link">
            <AppText variant="supporting" style={styles.footerLink}>
              {t('profile.security', { defaultValue: 'Security' })}
            </AppText>
          </Pressable>
          <Pressable onPress={() => router.push('/profile/contact')} accessibilityRole="link">
            <AppText variant="supporting" style={styles.footerLink}>
              {t('profile.support', { defaultValue: 'Support' })}
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLogo: {
    width: 154,
    height: 63,
  },
  languageButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  languageText: {
    color: COLORS.primary,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  visual: {
    height: 270,
    marginTop: SPACING.lg,
  },
  metricCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLowest,
    ...SHADOWS.md,
  },
  growthCard: {
    left: 0,
    bottom: 18,
  },
  fundCard: {
    right: 0,
    top: 72,
  },
  metricLabel: {
    color: COLORS.textSecondary,
  },
  metricAmount: {
    color: COLORS.primary,
    fontSize: 22,
    lineHeight: 28,
  },
  copy: {
    maxWidth: 540,
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },
  title: {
    color: COLORS.primary,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -1.1,
  },
  description: {
    color: COLORS.textSecondary,
    lineHeight: 30,
  },
  actions: {
    gap: SPACING.sm,
    marginTop: SPACING.xl,
  },
  primaryButton: {
    minHeight: 56,
  },
  secondaryButton: {
    minHeight: 52,
  },
  privacyRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  privacyIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.mintBackground,
  },
  privacyText: {
    flex: 1,
    color: COLORS.textPrimary,
  },
  footer: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
  footerLink: {
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});
