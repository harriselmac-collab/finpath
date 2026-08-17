import React from 'react';
import { I18nManager, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { Easing, FadeIn, FadeInUp, useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppText from '../../../components/Text/AppText';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { calculateFinancialProfile } from '../../../features/financial-engine/engine';
import {
  hasRequiredMonthlyPlanInputs,
  isMonthlyPlanReady,
} from '../../../features/onboarding/quizFlow';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { formatCurrency, safeMultiply } from '../../../utils/currency';
import { useTabContentBottomInset } from '../../../hooks/useTabContentBottomInset';
import { getAnnualProjectionLabelKey } from '../../../utils/planPresentation';

export default function PlanScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const contentBottomInset = useTabContentBottomInset();
  const { answers, debts, onboardingCompleted } = useOnboardingStore();
  const currency = answers.currency || 'MAD';
  const locale = i18n.resolvedLanguage || i18n.language || 'en';
  const profile = calculateFinancialProfile({ answers, debts });
  const isPlanReady = isMonthlyPlanReady(answers, debts, onboardingCompleted);
  const hasRequiredInputs = hasRequiredMonthlyPlanInputs(answers, debts);
  const formatMoney = (amount: number) => formatCurrency(amount, currency, locale);

  const plannedCommitments = profile.monthlyAnnualExpensesPortion + profile.requiredUpcomingContributions;
  const plannedMonthlyOutflow = profile.essentialMonthlyExpenses
    + profile.flexibleMonthlyExpenses
    + profile.minimumMonthlyDebtPayments
    + plannedCommitments;

  const budgetCategories = [
    {
      name: t('planDetails.plannedEssentials'),
      planned: profile.essentialMonthlyExpenses,
      icon: 'shield-checkmark-outline',
    },
    {
      name: t('planDetails.plannedFlexible'),
      planned: profile.flexibleMonthlyExpenses,
      icon: 'options-outline',
    },
    {
      name: t('planDetails.minimumDebtPayments'),
      planned: profile.minimumMonthlyDebtPayments,
      icon: 'card-outline',
    },
    {
      name: t('planDetails.annualCommitment'),
      planned: plannedCommitments,
      icon: 'calendar-outline',
    },
  ].filter((category) => category.planned > 0);

  const annualProjection = safeMultiply(profile.realAvailableMonthlyBalance, 12);
  const mapInsight = profile.budgetDeficit
    ? t('planDetails.insightDeficit', { amount: formatMoney(Math.abs(profile.realAvailableMonthlyBalance)) })
    : profile.upcomingExpenseRisk === 'high'
      ? t('planDetails.insightUpcoming')
      : profile.debtPressure === 'high' || profile.debtPressure === 'critical'
        ? t('planDetails.insightDebt')
        : t('planDetails.insightBalanced');
  const planTip = profile.budgetDeficit
    ? t('planDetails.tipDeficit')
    : t('planDetails.tipBalanced');
  const enter = (delay = 0) => reduceMotion
    ? undefined
    : (Platform.OS === 'web'
      ? FadeIn.duration(220)
      : FadeInUp.duration(220).withInitialValues({
          opacity: 0,
          transform: [{ translateY: 8 }],
        }))
        .delay(delay)
        .easing(Easing.bezier(0.23, 1, 0.32, 1));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: contentBottomInset }]}
        showsVerticalScrollIndicator={false}
        role="main"
      >
        <View style={styles.header}>
          <View>
            <AppText variant="supporting" style={styles.eyebrow}>
              {answers.preferredName
                ? t('planDetails.greeting', { name: answers.preferredName })
                : t('planDetails.greetingFallback')}
            </AppText>
            <AppText variant="screenTitle" style={styles.title} role="heading" aria-level={1}>
              {t('planDetails.title')}
            </AppText>
          </View>
          <Pressable
            onPress={() => router.push('/profile/notifications')}
            style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={t('planDetails.notifications')}
          >
            <Ionicons name="notifications-outline" size={21} color={COLORS.primary} accessible={false} />
          </Pressable>
        </View>

        {!isPlanReady ? (
          <Card style={styles.setupCard} shadow="md">
            <AppText variant="sectionTitle" style={styles.setupTitle} role="heading" aria-level={2}>
              {t('dashboard.completePlanTitle')}
            </AppText>
            <AppText variant="body" style={styles.setupDescription}>
              {t('dashboard.completePlanDescription')}
            </AppText>
            <Button
              title={t('dashboard.completePlanAction')}
              onPress={() => router.push(
                hasRequiredInputs ? '/onboarding/essential-expenses' : '/onboarding/quiz',
              )}
            />
          </Card>
        ) : (
          <>
        <Animated.View entering={enter()}>
          <View style={styles.projectionCard}>
            <AppText variant="supporting" style={styles.projectionLabel}>
              {t('planDetails.projectionLabel')}
            </AppText>
            <AppText
              variant="financialAmount"
              style={[styles.projectionAmount, profile.budgetDeficit && styles.projectionAmountDeficit]}
            >
              {formatMoney(annualProjection)}
            </AppText>
            <AppText variant="supporting" style={styles.projectionCaption}>
              {t(getAnnualProjectionLabelKey(annualProjection))}
            </AppText>
            <View style={styles.estimateExplanation}>
              <AppText variant="supporting" style={styles.projectionCaveat}>
                {t('planDetails.projectionCaveat')}
              </AppText>
              <AppText variant="caption" style={styles.estimateBasis}>
                {t('planDetails.projectionBasis', { amount: formatMoney(profile.realAvailableMonthlyBalance) })}
              </AppText>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={enter(50)} style={styles.insightRow}>
          <View style={styles.insightIcon}>
            <Ionicons name="map-outline" size={24} color={COLORS.secondary} accessible={false} />
          </View>
          <View style={styles.insightCopy}>
            <AppText variant="cardTitle" style={styles.insightTitle}>
              {t('planDetails.mapInsightTitle')}
            </AppText>
            <AppText variant="supporting" style={styles.insightText}>{mapInsight}</AppText>
          </View>
          <Pressable
            onPress={() => router.push(profile.budgetDeficit ? '/onboarding/essential-expenses' : '/goals')}
            style={({ pressed }) => [styles.planAhead, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={profile.budgetDeficit
              ? t('dashboard.reviewFlexibleExpenses')
              : t('planDetails.planAhead')}
          >
            <AppText variant="bodySemiBold" style={styles.planAheadText}>
              {profile.budgetDeficit ? t('dashboard.reviewFlexibleExpenses') : t('planDetails.planAhead')}
            </AppText>
            <Ionicons
              name={I18nManager.isRTL ? 'arrow-back' : 'arrow-forward'}
              size={17}
              color={COLORS.secondary}
              accessible={false}
            />
          </Pressable>
        </Animated.View>

        <Animated.View entering={enter(100)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderCopy}>
              <AppText variant="sectionTitle" style={styles.sectionTitle} role="heading" aria-level={2}>
                {t('planDetails.monthlyObligations')}
              </AppText>
              <AppText variant="supporting" style={styles.sectionSubtitle}>
                {t('planDetails.obligationsSubtitle')}
              </AppText>
            </View>
            <AppText variant="bodySemiBold" style={styles.totalOutflow}>
              {formatMoney(plannedMonthlyOutflow)}
            </AppText>
          </View>

          {budgetCategories.length === 0 ? (
            <Card style={styles.emptyState} shadow="none">
              <Ionicons name="document-text-outline" size={24} color={COLORS.secondary} accessible={false} />
              <View style={styles.insightCopy}>
                <AppText variant="bodySemiBold" style={styles.categoryName}>
                  {t('planDetails.noObligationsTitle')}
                </AppText>
                <AppText variant="supporting" style={styles.sectionSubtitle}>
                  {t('planDetails.noObligationsDescription')}
                </AppText>
              </View>
            </Card>
          ) : (
            <View style={styles.obligationsList}>
              {budgetCategories.map((category, index) => {
                return (
                  <View
                    key={category.name}
                    style={[
                      styles.obligationRow,
                      index < budgetCategories.length - 1 && styles.divider,
                    ]}
                  >
                    <View style={styles.categoryIcon}>
                      <Ionicons name={category.icon as any} size={19} color={COLORS.secondary} accessible={false} />
                    </View>
                    <View style={styles.categoryCopy}>
                      <View style={styles.categoryTopRow}>
                        <AppText variant="bodySemiBold" style={styles.categoryName}>{category.name}</AppText>
                        <AppText variant="supporting" style={styles.categoryAmount}>
                          {t('planDetails.plannedAmount', { amount: formatMoney(category.planned) })}
                        </AppText>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Animated.View>

        <Animated.View entering={enter(150)}>
          <Card style={styles.tipCard} shadow="none">
            <View style={styles.tipIcon}>
              <Ionicons name="sparkles-outline" size={22} color={COLORS.secondary} accessible={false} />
            </View>
            <View style={styles.insightCopy}>
              <AppText variant="bodySemiBold" style={styles.tipTitle}>
                {t('planDetails.tipTitle')}
              </AppText>
              <AppText variant="supporting" style={styles.tipText}>{planTip}</AppText>
            </View>
          </Card>
        </Animated.View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: COLORS.textSecondary,
  },
  title: {
    color: COLORS.primary,
    letterSpacing: -0.8,
  },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
  },
  setupCard: {
    gap: SPACING.md,
  },
  setupTitle: {
    color: COLORS.primary,
  },
  setupDescription: {
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  projectionCard: {
    overflow: 'hidden',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  projectionLabel: {
    color: COLORS.textSecondary,
  },
  projectionAmount: {
    marginTop: SPACING.sm,
    color: COLORS.primary,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -1,
  },
  projectionAmountDeficit: {
    color: COLORS.error,
  },
  projectionCaption: {
    color: COLORS.textPrimary,
  },
  estimateExplanation: {
    gap: SPACING.xs,
    marginTop: SPACING.xl,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
  estimateBasis: {
    color: COLORS.textSecondary,
  },
  projectionCaveat: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  insightRow: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.mintBackground,
  },
  insightCopy: {
    flex: 1,
  },
  insightTitle: {
    color: COLORS.primary,
  },
  insightText: {
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  planAhead: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planAheadText: {
    color: COLORS.secondary,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  sectionHeaderCopy: {
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.primary,
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
  },
  totalOutflow: {
    color: COLORS.secondary,
  },
  obligationsList: {
    overflow: 'hidden',
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  obligationRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.mintBackground,
  },
  categoryCopy: {
    flex: 1,
    gap: 8,
  },
  categoryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  categoryName: {
    flex: 1,
    color: COLORS.textPrimary,
  },
  categoryAmount: {
    flexShrink: 1,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  emptyState: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.mintBackground,
    borderWidth: 1,
    borderColor: COLORS.secondaryContainer,
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.66)',
  },
  tipTitle: {
    color: COLORS.secondary,
  },
  tipText: {
    color: COLORS.textPrimary,
  },
});
