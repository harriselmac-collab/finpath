import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  useReducedMotion,
} from 'react-native-reanimated';

import AppText from '../../components/Text/AppText';
import { Button, Card } from '../../components/ui';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { calculateActiveFinancialPlan } from '../../features/financial-engine/activeFinancialPlan';
import { useOnboardingStore } from '../../store/onboardingStore';
import { formatCurrency } from '../../utils/currency';

export default function ReviewScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const { answers, debts, setOnboardingCompleted, setCurrentStep } = useOnboardingStore();
  const currency = answers.currency || 'MAD';
  const locale = i18n.resolvedLanguage || i18n.language;
  const today = new Date();
  const { incomeTiming, activePeriod: result } = calculateActiveFinancialPlan({ answers, debts, now: today });
  const money = (amount: number) => formatCurrency(amount, currency, locale);
  const metrics = [
    ['availableUntilIncome', Number(answers.availableBalance || 0)],
    ['commitmentsDue', result.remainingEssentialCommitments],
    ['safeToSpend', result.safeToSpendTotal],
    ['safeDaily', result.safeDailySpending],
    ['projectedBalance', result.projectedBalanceBeforeNextIncome],
  ] as const;
  const enter = (delay = 0) => reduceMotion
    ? FadeIn.duration(200).easing(Easing.ease)
    : (Platform.OS === 'web'
      ? FadeIn.duration(220)
      : FadeInUp.duration(220).withInitialValues({
          opacity: 0,
          transform: [{ translateY: 8 }],
        }))
        .delay(delay)
        .easing(Easing.bezier(0.23, 1, 0.32, 1));

  const usePlan = () => {
    setOnboardingCompleted(true);
    router.replace('/dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} role="main">
        <Animated.View entering={enter()} style={styles.heading}>
          <AppText role="heading" aria-level={1} variant="h1" style={styles.title}>
            {t('onboarding.minimum.resultTitle')}
          </AppText>
          <AppText variant="body" style={styles.subtitle}>{t('onboarding.minimum.resultSubtitle')}</AppText>
          {!incomeTiming.expectedDate && (
            <AppText variant="supporting" style={styles.subtitle}>{t('dashboard.dailyEstimate')}</AppText>
          )}
        </Animated.View>

        <Animated.View entering={enter(50)}>
          <Card style={styles.resultCard} shadow="none">
            {metrics.map(([key, value], index) => (
              <View key={key} style={[styles.metric, index > 0 && styles.metricBorder]}>
                <AppText variant="supporting" style={styles.metricLabel}>{t(`onboarding.minimum.${key}`)}</AppText>
                <AppText variant="financialAmount" style={[styles.metricValue, key === 'safeToSpend' && styles.heroValue]}>
                  {money(value)}
                </AppText>
              </View>
            ))}
          </Card>
        </Animated.View>

        <Animated.View entering={enter(100)} style={styles.localNotice}>
          <AppText variant="supporting" style={styles.noticeText}>{t('onboarding.minimum.localNotice')}</AppText>
        </Animated.View>

        <Button title={t('onboarding.minimum.usePlan')} onPress={usePlan} />
        <Button title={t('onboarding.minimum.editAnswers')} onPress={() => { setCurrentStep(3); router.replace('/onboarding/quiz'); }} variant="text" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: SPACING.lg, gap: SPACING.lg },
  heading: { gap: SPACING.sm },
  title: { color: COLORS.primary },
  subtitle: { color: COLORS.textSecondary },
  resultCard: { padding: 0, overflow: 'hidden', borderRadius: RADIUS.lg },
  metric: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: 4 },
  metricBorder: { borderTopWidth: 1, borderTopColor: COLORS.outlineVariant },
  metricLabel: { color: COLORS.textSecondary },
  metricValue: { color: COLORS.primary },
  heroValue: { fontSize: 34, lineHeight: 42 },
  localNotice: { padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceContainerLow },
  noticeText: { color: COLORS.textPrimary },
});
