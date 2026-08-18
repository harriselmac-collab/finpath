import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING } from '../../../constants/theme';
import { calculateActiveFinancialPlan } from '../../../features/financial-engine/activeFinancialPlan';
import {
  hasRequiredMonthlyPlanInputs,
  isMonthlyPlanReady,
} from '../../../features/onboarding/quizFlow';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { useTransactionsStore } from '../../../store/transactionsStore';
import { useBillsStore } from '../../../store/billsStore';
import { useGoalsStore } from '../../../store/goalsStore';
import { formatCurrency } from '../../../utils/currency';
import { useTabContentBottomInset } from '../../../hooks/useTabContentBottomInset';
import {
  DashboardBalanceCard,
  DashboardGuidanceCard,
  DashboardHeader,
  DashboardIncomeCoverageCard,
  DashboardIncompletePlanCard,
  DashboardPlanBreakdown,
  DashboardProgressiveSetup,
  DashboardRecentActivity,
  DashboardUpcomingCommitment,
  GuidanceData,
  ProgressiveSetupItem,
  UpcomingCommitmentData,
} from '../../../components/dashboard';

const ENTRY_DURATION = 220;

export default function DashboardScreen() {
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const { width, fontScale } = useWindowDimensions();
  const contentBottomInset = useTabContentBottomInset();
  const [setupExpanded, setSetupExpanded] = useState(false);
  const chevronRotation = useSharedValue(0);

  const { answers, debts, onboardingCompleted } = useOnboardingStore();
  const { transactions } = useTransactionsStore();
  const bills = useBillsStore((state) => state.bills);
  const goals = useGoalsStore((state) => state.goals);

  const currency = answers.currency || 'MAD';
  const locale = i18n.resolvedLanguage || i18n.language || 'en';

  useEffect(() => {
    const target = setupExpanded ? 180 : 0;
    chevronRotation.value = reduceMotion
      ? target
      : withTiming(target, {
          duration: 180,
          easing: Easing.bezier(0.77, 0, 0.175, 1),
        });
  }, [chevronRotation, reduceMotion, setupExpanded]);

  const handleToggleExpand = useCallback(() => {
    setSetupExpanded((expanded) => !expanded);
  }, []);

  const today = useMemo(() => new Date(), []);
  const { profile, additionalCommitments, incomeTiming, activePeriod } = useMemo(
    () => calculateActiveFinancialPlan({
      answers,
      debts,
      transactions,
      bills,
      now: today,
    }),
    [answers, debts, transactions, bills, today],
  );

  const isPlanReady = isMonthlyPlanReady(answers, debts, onboardingCompleted);
  const hasRequiredInputs = hasRequiredMonthlyPlanInputs(answers, debts);

  const monthName = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long' }).format(today),
    [locale, today],
  );

  const firstName = typeof answers.preferredName === 'string'
    ? answers.preferredName.trim()
    : '';

  const greeting = firstName
    ? t('dashboard.greeting', { name: firstName, defaultValue: 'Hi, {{name}}' })
    : t('dashboard.welcomeBack', 'Welcome back');

  const formatMoney = useCallback(
    (amount: number) => formatCurrency(amount, currency, locale),
    [currency, locale],
  );

  const hasPlanValues = profile.totalMonthlyIncome > 0
    || profile.essentialMonthlyExpenses > 0
    || profile.flexibleMonthlyExpenses > 0
    || profile.minimumMonthlyDebtPayments > 0
    || additionalCommitments > 0;

  const hasShortfall = activePeriod.safeToSpendTotal < 0;

  const formattedNextIncome = useMemo(
    () => incomeTiming.expectedDate
      ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(
          new Date(`${incomeTiming.expectedDate}T00:00:00`),
        )
      : t('dashboard.nextIncomeUnknown', 'Not set'),
    [incomeTiming.expectedDate, locale, t],
  );

  const stackMetrics = width < 360 || fontScale > 1.2;

  const calculationTime = useMemo(
    () => new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(activePeriod.calculatedAt)),
    [locale, activePeriod.calculatedAt],
  );

  const guidance: GuidanceData = useMemo(() => {
    if (hasShortfall) {
      return {
        text: t(
          'dashboard.guidance.deficit',
          'Your planned income does not cover essential costs and commitments. Protect essentials first, then review safe options.',
        ),
        action: t('dashboard.reviewFlexibleExpenses', 'Review flexible expenses'),
        href: '/onboarding/essential-expenses' as const,
      };
    }

    if (profile.debtPressure === 'high' || profile.debtPressure === 'critical') {
      return {
        text: t(
          'dashboard.guidance.debt',
          'Minimum debt payments take a large share of planned income. Prioritize the highest-cost balance before adding flexible spending.',
        ),
        action: t('dashboard.reviewPlan', 'Review monthly plan'),
        href: '/plan' as const,
      };
    }

    if (profile.savingsCapacity > 0) {
      return {
        text: t('dashboard.guidance.surplus', {
          amount: formatMoney(profile.savingsCapacity),
          defaultValue: '{{amount}} remains available for savings or goals in this monthly plan.',
        }),
        action: t('dashboard.reviewPlan', 'Review monthly plan'),
        href: '/plan' as const,
      };
    }

    return {
      text: t(
        'dashboard.guidance.noValues',
        'This plan currently has no monthly remainder. Review the details if that does not match your situation.',
      ),
      action: t('dashboard.reviewPlan', 'Review monthly plan'),
      href: '/plan' as const,
    };
  }, [hasShortfall, profile.debtPressure, profile.savingsCapacity, formatMoney, t]);

  const recentTransactions = useMemo(
    () => [...transactions]
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 2),
    [transactions],
  );

  const progressiveSetup: ProgressiveSetupItem[] = useMemo(
    () => [
      { key: 'bills', done: bills.length > 0, href: '/profile/bills' as const },
      { key: 'debts', done: debts.length > 0, href: '/debts' as const },
      { key: 'income', done: Number(answers.secondIncome || 0) > 0, href: '/profile/income' as const },
      { key: 'annual', done: answers.annualBills === true, href: '/profile/bills' as const },
      { key: 'goal', done: goals.length > 0, href: '/goals' as const },
      { key: 'profile', done: Boolean(answers.preferredName), href: '/profile/edit' as const },
    ],
    [bills.length, debts.length, answers.secondIncome, answers.annualBills, answers.preferredName, goals.length],
  );

  const completedSetup = progressiveSetup.filter(({ done }) => done).length;
  const nextSetup = progressiveSetup.filter(({ done }) => !done).slice(0, 3);

  const upcomingCommitment: UpcomingCommitmentData | null = useMemo(() => {
    const insuranceAmount = Number(answers.insuranceAmount || 0);
    const housingAmount = Number(answers.housingAmount || 0);
    const insuranceDate = answers.insuranceDate
      ? new Date(`${answers.insuranceDate}T00:00:00`)
      : null;
    const formattedInsuranceDate = insuranceDate && !Number.isNaN(insuranceDate.getTime())
      ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(insuranceDate)
      : null;

    if (answers.vehicleInsurance === true && insuranceAmount > 0) {
      return {
        name: t('dashboard.vehicleInsurance', 'Vehicle insurance'),
        amount: insuranceAmount,
        due: formattedInsuranceDate
          ? t('dashboard.dueDate', { date: formattedInsuranceDate, defaultValue: 'Due {{date}}' })
          : t('dashboard.annualCommitment', 'Annual commitment'),
        icon: 'car',
      };
    }

    if (housingAmount > 0) {
      return {
        name: t('dashboard.housing', 'Housing'),
        amount: housingAmount,
        due: t('dashboard.nextMonthlyCommitment', 'Monthly planned amount'),
        icon: 'home',
      };
    }

    return null;
  }, [answers.insuranceAmount, answers.insuranceDate, answers.vehicleInsurance, answers.housingAmount, locale, t]);

  const enter = useCallback((delay = 0) => reduceMotion
    ? undefined
    : (Platform.OS === 'web'
      ? FadeIn.duration(ENTRY_DURATION)
      : FadeInUp.duration(ENTRY_DURATION).withInitialValues({
          opacity: 0,
          transform: [{ translateY: 8 }],
        }))
        .delay(delay)
        .easing(Easing.bezier(0.23, 1, 0.32, 1)), [reduceMotion]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: contentBottomInset }]}
        showsVerticalScrollIndicator={false}
        accessibilityLabel={t('tabs.home', 'Home')}
        role="main"
      >
        <DashboardHeader
          greeting={greeting}
          monthName={monthName}
        />

        {!isPlanReady ? (
          <Animated.View entering={enter()}>
            <DashboardIncompletePlanCard
              hasRequiredInputs={hasRequiredInputs}
            />
          </Animated.View>
        ) : (
          <>
            <Animated.View entering={enter()}>
              <DashboardBalanceCard
                safeToSpendTotal={activePeriod.safeToSpendTotal}
                safeDailySpending={activePeriod.safeDailySpending}
                remainingCommitments={
                  activePeriod.remainingEssentialCommitments
                  + activePeriod.remainingDebtCommitments
                  + activePeriod.remainingUpcomingCommitments
                }
                formattedNextIncome={formattedNextIncome}
                calculationTime={calculationTime}
                hasShortfall={hasShortfall}
                hasPlanValues={hasPlanValues}
                expectedDatePresent={Boolean(incomeTiming.expectedDate)}
                stackMetrics={stackMetrics}
                formatMoney={formatMoney}
              />
            </Animated.View>

            <Animated.View entering={enter(50)}>
              <DashboardGuidanceCard
                guidance={guidance}
              />
            </Animated.View>

            {nextSetup.length > 0 && (
              <DashboardProgressiveSetup
                completedSetup={completedSetup}
                totalSetup={progressiveSetup.length}
                nextSetup={nextSetup}
                setupExpanded={setupExpanded}
                onToggleExpand={handleToggleExpand}
                chevronRotation={chevronRotation}
              />
            )}

            <Animated.View entering={enter(100)}>
              <DashboardPlanBreakdown
                plannedEssentials={profile.essentialMonthlyExpenses}
                plannedFlexible={profile.flexibleMonthlyExpenses}
                minimumDebtPayments={profile.minimumMonthlyDebtPayments}
                actualSpending={activePeriod.actualSpending}
                commitmentsStillDue={
                  activePeriod.remainingEssentialCommitments
                  + activePeriod.remainingDebtCommitments
                  + activePeriod.remainingUpcomingCommitments
                }
                projectedBalance={activePeriod.projectedBalanceBeforeNextIncome}
                formatMoney={formatMoney}
              />
            </Animated.View>

            {profile.incomeCoverageRatio !== null && (
              <Animated.View entering={enter(150)}>
                <DashboardIncomeCoverageCard
                  incomeCoverageRatio={profile.incomeCoverageRatio}
                  locale={locale}
                />
              </Animated.View>
            )}

            {upcomingCommitment && (
              <Animated.View entering={enter(200)}>
                <DashboardUpcomingCommitment
                  upcomingCommitment={upcomingCommitment}
                  formatMoney={formatMoney}
                />
              </Animated.View>
            )}

            {recentTransactions.length > 0 && (
              <Animated.View entering={enter(250)}>
                <DashboardRecentActivity
                  recentTransactions={recentTransactions}
                  formatMoney={formatMoney}
                />
              </Animated.View>
            )}
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
    maxWidth: 720,
    boxSizing: 'border-box',
    alignSelf: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
});
