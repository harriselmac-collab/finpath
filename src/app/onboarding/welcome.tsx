import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t, ready } = useTranslation();

  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Brand */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.brandSection}>
          <Animated.View entering={ZoomIn.duration(500).delay(200)} style={styles.logoBadge}>
            <Text style={styles.logoText}>FP</Text>
          </Animated.View>
          <Animated.Text entering={FadeIn.duration(400).delay(400)} style={styles.brandName}>FinPath</Animated.Text>
        </Animated.View>

        {/* Hero */}
        <View style={styles.heroSection}>
          <Animated.Text entering={FadeInUp.duration(600).delay(300)} style={styles.title}>{t('welcome.title')}</Animated.Text>
          <Animated.Text entering={FadeInUp.duration(600).delay(450)} style={styles.subtitle}>{t('welcome.subtitle')}</Animated.Text>
          <Animated.Text entering={FadeInUp.duration(600).delay(600)} style={styles.description}>{t('welcome.description')}</Animated.Text>
        </View>

        {/* Privacy Card */}
        <Animated.View entering={FadeInUp.duration(600).delay(750)} style={styles.privacyCard}>
          <View style={styles.privacyIconBox}>
            <Text style={styles.privacyIcon}>🛡️</Text>
          </View>
          <View style={styles.privacyContent}>
            <Text style={styles.privacyTitle}>Private & Honest</Text>
            <Text style={styles.privacyText}>
              {t('welcome.privacyNotice')}
            </Text>
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInUp.duration(600).delay(900)} style={styles.actions}>
          <Button
            title={t('welcome.getStarted')}
            onPress={() => router.push('/onboarding/quiz')}
            variant="primary"
            style={styles.primaryButton}
          />
          <Button
            title={t('welcome.signIn')}
            onPress={() => router.push('/auth')}
            variant="secondary"
            style={styles.secondaryButton}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
    paddingVertical: SPACING.xl * 1.5,
  },
  brandSection: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  logoText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
    fontWeight: '800',
  },
  brandName: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.displayLgMobile,
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.darkEmerald,
    textAlign: 'center',
    fontSize: 15,
  },
  description: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  privacyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.mintBackground,
    borderWidth: 1,
    borderColor: COLORS.emerald,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  privacyIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyIcon: {
    fontSize: 24,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.darkEmerald,
    marginBottom: SPACING.xs,
  },
  privacyText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  actions: {
    gap: SPACING.sm,
    width: '100%',
  },
  primaryButton: {
    width: '100%',
    height: 56,
  },
  secondaryButton: {
    width: '100%',
    height: 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
});
