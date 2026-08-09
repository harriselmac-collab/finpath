import React, { useState } from 'react';
import { I18nManager, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInUp, useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppText from '../../../components/Text/AppText';
import { Button, Card, Icon, PressableCard } from '../../../components/ui';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../../constants/theme';
import { calculateFinancialProfile } from '../../../features/financial-engine/engine';
import { calculateActiveFinancialPeriod } from '../../../features/financial-engine/activePeriod';
import {
  hasRequiredMonthlyPlanInputs,
  isMonthlyPlanReady,
} from '../../../features/onboarding/quizFlow';
import { resolveIncomeTiming } from '../../../features/onboarding/incomeSchedule';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { useTransactionsStore } from '../../../store/transactionsStore';
import { useBillsStore } from '../../../store/billsStore';
import { useGoalsStore } from '../../../store/goalsStore';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { formatCurrency } from '../../../utils/currency';
import { useTabContentBottomInset } from '../../../hooks/useTabContentBottomInset';

const ENTRY_DURATION = 220;

export default function DashboardScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const { width, fontScale } = useWindowDimensions();
  const contentBottomInset = useTabContentBottomInset();
  const [setupExpanded, setSetupExpanded] = useState(false);
  const { answers, debts, onboardingCompleted } = useOnboardingStore();
  const { transactions } = useTransactionsStore();
  const currency = answers.currency || 'MAD';
  const bills = useBillsStore((state) => state.bills);
  const goals = useGoalsStore((state) => state.goals);
  const locale = i18n.resolvedLanguage || i18n.language || 'en';

  const profile = calculateFinancialProfile({ answers, debts });
  const additionalCommitments = profile.monthlyAnnualExpensesPortion
    + profile.requiredUpcomingContributions;
  const isPlanReady = isMonthlyPlanReady(answers, debts, onboardingCompleted);
  const hasRequiredInputs = hasRequiredMonthlyPlanInputs(answers, debts);

  const today = new Date();
  const monthName = new Intl.DateTimeFormat(locale, { month: 'long' }).format(today);
  const firstName = typeof answers.preferredName === 'string'
    ? answers.preferredName.trim()
    : '';
  const greeting = firstName
    ? t('dashboard.greeting', { name: firstName, defaultValue: 'Hi, {{name}}' })
    : t('dashboard.welcomeBack', 'Welcome back');
  const formatMoney = (amount: number) => formatCurrency(amount, currency, locale);
  const hasPlanValues = profile.totalMonthlyIncome > 0
    || profile.essentialMonthlyExpenses > 0
    || profile.flexibleMonthlyExpenses > 0
    || profile.minimumMonthlyDebtPayments > 0
    || additionalCommitments > 0;
  const periodStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const incomeTiming = resolveIncomeTiming(answers, today);
  const nextIncomeDate = incomeTiming.calculationDate;
  const activePeriod = calculateActiveFinancialPeriod({
    periodStart,
    nextIncomeDate,
    currentAvailableBalance: Number(answers.availableBalance ?? 0),
    plannedIncome: profile.totalMonthlyIncome,
    plannedEssential: Number(answers.essentialBillsDue ?? profile.essentialMonthlyExpenses),
    plannedFlexible: profile.flexibleMonthlyExpenses + Number(answers.upcomingFlexibleSpending || 0),
    plannedDebt: profile.minimumMonthlyDebtPayments + Number(answers.debtMinimumDue || 0),
    protectedBuffer: Number(answers.protectedBuffer || 0) + Number(answers.savingsGoalAmount || 0),
    currency,
    transactions,
    commitments: [
      ...(additionalCommitments + Number(answers.annualExpenseDue || 0) > 0
        ? [{ id: 'planned-commitments', amount: additionalCommitments + Number(answers.annualExpenseDue || 0), dueDate: nextIncomeDate, paid: false }]
        : []),
      ...bills.filter((bill) => bill.isActive).map((bill) => ({
        id: bill.id,
        amount: bill.amount,
        dueDate: bill.nextDueDate,
        paid: bill.paid,
      })),
    ],
    now: today,
  });
  const hasShortfall = activePeriod.safeToSpendTotal < 0;
  const formattedNextIncome = incomeTiming.expectedDate
    ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(
        new Date(`${incomeTiming.expectedDate}T00:00:00`),
      )
    : t('dashboard.nextIncomeUnknown', 'Not set');
  const stackMetrics = width < 360 || fontScale > 1.2;
  const calculationTime = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(activePeriod.calculatedAt));

  const guidance = hasShortfall
    ? {
        text: t(
          'dashboard.guidance.deficit',
          'Your planned income does not cover essential costs and commitments. Protect essentials first, then review safe options.',
        ),
        action: t('dashboard.reviewFlexibleExpenses', 'Review flexible expenses'),
        href: '/onboarding/essential-expenses' as const,
      }
    : profile.debtPressure === 'high' || profile.debtPressure === 'critical'
      ? {
          text: t(
            'dashboard.guidance.debt',
            'Minimum debt payments take a large share of planned income. Prioritize the highest-cost balance before adding flexible spending.',
          ),
          action: t('dashboard.reviewPlan', 'Review monthly plan'),
          href: '/plan' as const,
        }
      : profile.savingsCapacity > 0
        ? {
            text: t('dashboard.guidance.surplus', {
              amount: formatMoney(profile.savingsCapacity),
              defaultValue: '{{amount}} remains available for savings or goals in this monthly plan.',
            }),
            action: t('dashboard.reviewPlan', 'Review monthly plan'),
            href: '/plan' as const,
          }
        : {
            text: t(
              'dashboard.guidance.noValues',
              'This plan currently has no monthly remainder. Review the details if that does not match your situation.',
            ),
            action: t('dashboard.reviewPlan', 'Review monthly plan'),
            href: '/plan' as const,
          };

  const recentTransactions = [...transactions]
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 2);
  const progressiveSetup = [
    { key: 'bills', done: bills.length > 0, href: '/profile/bills' as const },
    { key: 'debts', done: debts.length > 0, href: '/debts' as const },
    { key: 'income', done: Number(answers.secondIncome || 0) > 0, href: '/profile/income' as const },
    { key: 'annual', done: answers.annualBills === true, href: '/profile/bills' as const },
    { key: 'goal', done: goals.length > 0, href: '/goals' as const },
    { key: 'profile', done: Boolean(answers.preferredName), href: '/profile/edit' as const },
  ];
  const completedSetup = progressiveSetup.filter(({ done }) => done).length;
  const nextSetup = progressiveSetup.filter(({ done }) => !done).slice(0, 3);

  const insuranceAmount = Number(answers.insuranceAmount || 0);
  const housingAmount = Number(answers.housingAmount || 0);
  const insuranceDate = answers.insuranceDate
    ? new Date(`${answers.insuranceDate}T00:00:00`)
    : null;
  const formattedInsuranceDate = insuranceDate && !Number.isNaN(insuranceDate.getTime())
    ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(insuranceDate)
    : null;
  const upcomingCommitment = answers.vehicleInsurance === true && insuranceAmount > 0
    ? {
        name: t('dashboard.vehicleInsurance', 'Vehicle insurance'),
        amount: insuranceAmount,
        due: formattedInsuranceDate
          ? t('dashboard.dueDate', { date: formattedInsuranceDate, defaultValue: 'Due {{date}}' })
          : t('dashboard.annualCommitment', 'Annual commitment'),
        icon: 'car',
      }
    : housingAmount > 0
      ? {
          name: t('dashboard.housing', 'Housing'),
          amount: housingAmount,
          due: t('dashboard.nextMonthlyCommitment', 'Monthly planned amount'),
          icon: 'home',
        }
      : null;

  const enter = (delay = 0) => reduceMotion
    ? undefined
    : FadeInUp.duration(ENTRY_DURATION).delay(delay);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: contentBottomInset }]}
        showsVerticalScrollIndicator={false}
        accessibilityLabel={t('tabs.home', 'Home')}
        role="main"
      >
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

        {!isPlanReady ? (
          <Animated.View entering={enter()}>
            <Card style={styles.setupCard} shadow="md">
              <View style={styles.setupIcon}>
                <Icon name="compass-outline" size={28} color={COLORS.surfaceTint} />
              </View>
              <AppText
                variant="sectionTitle"
                style={styles.setupTitle}
                role="heading"
                aria-level={1}
              >
                {t('dashboard.completePlanTitle', 'Complete your monthly plan')}
              </AppText>
              <AppText variant="body" style={styles.setupDescription}>
                {t(
                  'dashboard.completePlanDescription',
                  'Add your income and essential costs before Pocket Ahead shows balances or confidence indicators.',
                )}
              </AppText>
              <Button
                title={t('dashboard.completePlanAction', 'Complete plan setup')}
                onPress={() => router.push(
                  hasRequiredInputs ? '/onboarding/essential-expenses' : '/onboarding/quiz',
                )}
                style={styles.setupButton}
              />
            </Card>
          </Animated.View>
        ) : (
          <>
            <Animated.View entering={enter()}>
              <Card style={styles.balanceCard} shadow="md">
                <View style={styles.balanceHeading}>
                  <AppText variant="bodySemiBold" style={styles.balanceLabel} role="heading" aria-level={1}>
                    {t('dashboard.plannedRemainder', 'Safe to spend until next income')}
                  </AppText>
                  <AppText variant="caption" style={styles.balanceSource}>
                    {t('dashboard.basedOnSetup', 'Based on your plan and transactions')}
                  </AppText>
                  <AppText variant="caption" style={styles.balanceSource}>
                    {t('dashboard.calculatedAt', { time: calculationTime, defaultValue: 'Updated {{time}}' })}
                  </AppText>
                  {!incomeTiming.expectedDate && (
                    <AppText variant="caption" style={styles.balanceSource}>
                      {t('dashboard.dailyEstimate', 'Daily amount is estimated until you add a payday.')}
                    </AppText>
                  )}
                </View>
                <View
                  style={[styles.statusTag, hasShortfall && styles.statusTagDanger]}
                  accessibilityLabel={hasShortfall
                    ? t('dashboard.shortfallDetected', 'Shortfall detected')
                    : t('dashboard.planBalanced', 'Plan covered')}
                >
                  <Icon
                    name={hasShortfall ? 'warning-outline' : 'checkmark-circle-outline'}
                    size={16}
                    color={hasShortfall ? COLORS.onErrorContainer : COLORS.onSecondaryContainer}
                  />
                  <AppText variant="supporting" style={[styles.statusTagText, hasShortfall && styles.statusTagTextDanger]}>
                    {hasShortfall
                      ? t('dashboard.shortfallDetected', 'Shortfall detected')
                      : hasPlanValues
                        ? t('dashboard.planBalanced', 'Plan covered')
                        : t('dashboard.planReady', 'Plan ready')}
                  </AppText>
                </View>
                <AppText
                  variant="financialAmount"
                  style={[
                    styles.balanceAmount,
                    hasShortfall && styles.negativeAmount,
                  ]}
                  accessibilityLabel={`${t('dashboard.plannedRemainder', 'Safe to spend until next income')}: ${formatMoney(activePeriod.safeToSpendTotal)}`}
                >
                  {formatMoney(activePeriod.safeToSpendTotal)}
                </AppText>
                <View style={styles.balanceDivider} />
                <View style={[styles.balanceMeta, stackMetrics && styles.balanceMetaStack]}>
                  <View style={styles.metaBlock}>
                    <AppText variant="supporting" style={styles.metaLabel}>
                      {t('dashboard.plannedDailyAllowance', 'Safe per day')}
                    </AppText>
                    <AppText variant="sectionTitle" style={styles.metaValueGreen}>
                      {formatMoney(activePeriod.safeDailySpending)}
                    </AppText>
                  </View>
                  <View style={[styles.metaBlock, !stackMetrics && styles.metaRight]}>
                    <AppText variant="supporting" style={styles.metaLabel}>
                      {t('dashboard.planMonth', 'Next income')}
                    </AppText>
                    <AppText variant="sectionTitle" style={styles.metaValue}>{formattedNextIncome}</AppText>
                  </View>
                </View>
                <View style={styles.balanceDivider} />
                <View style={[styles.balanceMeta, stackMetrics && styles.balanceMetaStack]}>
                  <View style={styles.metaBlock}>
                    <AppText variant="supporting" style={styles.metaLabel}>
                      {t('dashboard.commitmentsStillDue', 'Bills still due')}
                    </AppText>
                    <AppText variant="sectionTitle" style={styles.metaValue}>
                      {formatMoney(
                        activePeriod.remainingEssentialCommitments
                        + activePeriod.remainingDebtCommitments
                        + activePeriod.remainingUpcomingCommitments,
                      )}
                    </AppText>
                  </View>
                  <View style={[styles.metaBlock, !stackMetrics && styles.metaRight]}>
                    <AppText variant="supporting" style={styles.metaLabel}>
                      {t('dashboard.planStatus', 'Plan status')}
                    </AppText>
                    <AppText variant="sectionTitle" style={hasShortfall ? styles.negativeAmount : styles.metaValueGreen}>
                      {hasShortfall
                        ? t('dashboard.shortfallDetected', 'Shortfall detected')
                        : t('dashboard.planBalanced', 'Plan covered')}
                    </AppText>
                  </View>
                </View>
              </Card>
            </Animated.View>

            <Animated.View entering={enter(50)}>
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
            </Animated.View>

            {nextSetup.length > 0 && (
              <View style={styles.progressiveSetup}>
                <Pressable
                  onPress={() => setSetupExpanded((expanded) => !expanded)}
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
                      {t('onboarding.progressive.subtitle', { done: completedSetup, total: progressiveSetup.length })}
                    </AppText>
                  </View>
                  <Icon name={setupExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.surfaceTint} />
                </Pressable>
                <ProgressBar progress={completedSetup / progressiveSetup.length} height={5} />
                <AppText variant="caption" style={styles.progressiveWhy}>{t('onboarding.progressive.why')}</AppText>
                {setupExpanded && nextSetup.map((item) => (
                  <Pressable key={item.key} onPress={() => router.push(item.href)} style={styles.setupRow} accessibilityRole="button">
                    <AppText variant="bodyMedium" style={styles.setupRowText}>{t(`onboarding.progressive.${item.key}`)}</AppText>
                    <Icon name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={COLORS.surfaceTint} />
                  </Pressable>
                ))}
              </View>
            )}

            <Animated.View entering={enter(100)} style={styles.sectionBlock}>
              <AppText
                variant="sectionTitle"
                style={styles.sectionTitle}
                role="heading"
                aria-level={2}
              >
                {t('dashboard.planBreakdown', 'Plan breakdown')}
              </AppText>
              <View style={styles.statusList}>
                <StatusRow
                  label={t('dashboard.plannedEssentials', 'Planned essentials')}
                  value={formatMoney(profile.essentialMonthlyExpenses)}
                />
                <StatusRow
                  label={t('dashboard.plannedFlexible', 'Planned flexible spending')}
                  value={formatMoney(profile.flexibleMonthlyExpenses)}
                />
                <StatusRow
                  label={t('dashboard.minimumDebtPayments', 'Minimum debt payments')}
                  value={formatMoney(profile.minimumMonthlyDebtPayments)}
                />
                <StatusRow
                  label={t('dashboard.actualSpending', 'Actual spending this period')}
                  value={formatMoney(activePeriod.actualSpending)}
                />
                <StatusRow
                  label={t('dashboard.commitmentsStillDue', 'Commitments still due')}
                  value={formatMoney(
                    activePeriod.remainingEssentialCommitments
                    + activePeriod.remainingDebtCommitments
                    + activePeriod.remainingUpcomingCommitments,
                  )}
                />
                <StatusRow
                  label={t('dashboard.projectedBalance', 'Projected balance before next income')}
                  value={formatMoney(activePeriod.projectedBalanceBeforeNextIncome)}
                  isLast
                />
              </View>
            </Animated.View>

            {profile.incomeCoverageRatio !== null && (
              <Animated.View entering={enter(150)}>
                <Card style={styles.coverageCard} shadow="sm">
                  <View style={styles.sectionHeadingRow}>
                    <View style={styles.sectionHeadingCopy}>
                      <AppText
                        variant="sectionTitle"
                        style={styles.sectionTitle}
                        role="heading"
                        aria-level={2}
                      >
                        {t('dashboard.incomeCoverage', 'Income coverage')}
                      </AppText>
                      <AppText variant="supporting" style={styles.sectionSubtitle}>
                        {t(
                          'dashboard.incomeCoverageExplanation',
                          'Planned income divided by essentials and minimum debt.',
                        )}
                      </AppText>
                    </View>
                    <Icon name="shield-checkmark-outline" size={24} color={COLORS.surfaceTint} />
                  </View>
                  <AppText
                    variant="financialAmount"
                    style={styles.coverageValue}
                    accessibilityLabel={`${t('dashboard.incomeCoverage', 'Income coverage')}: ${profile.incomeCoverageRatio.toLocaleString(locale, { maximumFractionDigits: 2 })}`}
                  >
                    {profile.incomeCoverageRatio.toLocaleString(locale, { maximumFractionDigits: 2 })}×
                  </AppText>
                  <AppText variant="caption" style={styles.coverageNote}>
                    {t(
                      'dashboard.notSavingsBalance',
                      'This ratio is part of your plan, not an emergency-savings balance.',
                    )}
                  </AppText>
                </Card>
              </Animated.View>
            )}

            {upcomingCommitment && (
              <Animated.View entering={enter(200)}>
                <Card style={styles.commitmentsCard} shadow="sm">
                  <AppText
                    variant="sectionTitle"
                    style={styles.sectionTitle}
                    role="heading"
                    aria-level={2}
                  >
                    {t('dashboard.upcomingCommitment', 'Recurring planned commitment')}
                  </AppText>
                  <Pressable
                    onPress={() => router.push('/plan')}
                    style={({ pressed }) => [styles.commitmentRow, pressed && styles.pressed]}
                    accessibilityRole="button"
                    accessibilityLabel={`${upcomingCommitment.name}, ${upcomingCommitment.due}, ${formatMoney(upcomingCommitment.amount)}`}
                    accessibilityHint={t('dashboard.reviewPlan', 'Review monthly plan')}
                  >
                    <View style={styles.commitmentIcon}>
                      <Icon name={upcomingCommitment.icon} size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.commitmentMeta}>
                      <AppText variant="bodySemiBold" style={styles.commitmentName} numberOfLines={1}>
                        {upcomingCommitment.name}
                      </AppText>
                      <AppText variant="caption" style={styles.commitmentDue} numberOfLines={1}>
                        {upcomingCommitment.due}
                      </AppText>
                    </View>
                    <AppText variant="bodySemiBold" style={styles.commitmentAmount} numberOfLines={1}>
                      {formatMoney(upcomingCommitment.amount)}
                    </AppText>
                  </Pressable>
                </Card>
              </Animated.View>
            )}

            {recentTransactions.length > 0 && (
              <Animated.View entering={enter(250)} style={styles.activitySection}>
                <View style={styles.sectionHeadingRow}>
                  <View style={styles.sectionHeadingCopy}>
                    <AppText
                      variant="sectionTitle"
                      style={styles.sectionTitle}
                      role="heading"
                      aria-level={2}
                    >
                      {t('dashboard.recordedActivity', 'Recorded activity')}
                    </AppText>
                    <AppText variant="caption" style={styles.sectionSubtitle}>
                      {t('dashboard.activitySeparate', 'Included in your safe-to-spend calculation.')}
                    </AppText>
                  </View>
                  <Pressable
                    onPress={() => router.push('/transactions')}
                    style={styles.viewAllButton}
                    accessibilityRole="link"
                    accessibilityLabel={`${t('dashboard.viewAll', 'View all')}: ${t('dashboard.recordedActivity', 'Recorded activity')}`}
                  >
                    <AppText variant="bodySemiBold" style={styles.viewAll}>
                      {t('dashboard.viewAll', 'View all')}
                    </AppText>
                  </Pressable>
                </View>
                <View style={styles.activityList}>
                  {recentTransactions.map((transaction, index) => {
                    const signedAmount = `${transaction.type === 'income' || transaction.type === 'refund' ? '+' : transaction.type === 'transfer' ? '' : '-'}${formatMoney(transaction.amount)}`;
                    return (
                      <Pressable
                        key={transaction.id}
                        onPress={() => router.push('/transactions')}
                        style={({ pressed }) => [
                          styles.activityRow,
                          index < recentTransactions.length - 1 && styles.rowDivider,
                          pressed && styles.pressed,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`${transaction.name}, ${transaction.category}, ${signedAmount}`}
                      >
                        <View style={styles.activityIcon}>
                          <Icon
                            name={transaction.type === 'income' ? 'cash-outline' : 'receipt-outline'}
                            size={20}
                            color={COLORS.surfaceTint}
                          />
                        </View>
                        <View style={styles.commitmentMeta}>
                          <AppText variant="bodySemiBold" style={styles.commitmentName} numberOfLines={1}>
                            {transaction.name}
                          </AppText>
                          <AppText variant="caption" style={styles.commitmentDue} numberOfLines={1}>
                            {transaction.category}
                          </AppText>
                        </View>
                        <AppText
                          variant="bodySemiBold"
                          style={transaction.type === 'income' ? styles.incomeAmount : styles.commitmentAmount}
                          numberOfLines={1}
                        >
                          {signedAmount}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </Animated.View>
            )}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function StatusRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      style={[styles.statusRow, !isLast && styles.rowDivider]}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <AppText variant="bodySemiBold" style={styles.statusLabel}>{label}</AppText>
      <AppText variant="bodySemiBold" style={styles.statusValue} numberOfLines={1}>{value}</AppText>
    </View>
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
  setupCard: {
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.xl,
  },
  setupIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.mintBackground,
  },
  setupTitle: {
    marginTop: SPACING.xs,
    color: COLORS.primary,
  },
  setupDescription: {
    maxWidth: 520,
    color: COLORS.textSecondary,
  },
  setupButton: {
    width: '100%',
    marginTop: SPACING.sm,
  },
  balanceCard: {
    padding: SPACING.lg,
  },
  balanceHeading: {
    width: '100%',
  },
  balanceLabel: {
    color: COLORS.textPrimary,
  },
  balanceSource: {
    marginTop: 2,
    color: COLORS.textSecondary,
  },
  statusTag: {
    minHeight: 32,
    maxWidth: '100%',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.secondaryContainer,
  },
  statusTagDanger: {
    backgroundColor: COLORS.errorContainer,
  },
  statusTagText: {
    flexShrink: 1,
    color: COLORS.onSecondaryContainer,
  },
  statusTagTextDanger: {
    color: COLORS.onErrorContainer,
  },
  balanceAmount: {
    marginTop: SPACING.md,
    color: COLORS.emerald,
    fontSize: 38,
    lineHeight: 46,
    letterSpacing: -1.2,
  },
  negativeAmount: {
    color: COLORS.error,
  },
  balanceDivider: {
    height: 1,
    marginVertical: SPACING.lg,
    backgroundColor: COLORS.outlineVariant,
  },
  balanceMeta: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  balanceMetaStack: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  metaBlock: {
    minWidth: 0,
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
  },
  metaRight: {
    alignItems: 'flex-end',
    paddingLeft: SPACING.sm,
  },
  metaLabel: {
    maxWidth: '100%',
    flexShrink: 1,
    color: COLORS.textSecondary,
  },
  metaValue: {
    maxWidth: '100%',
    marginTop: 2,
    color: COLORS.primary,
  },
  metaValueGreen: {
    maxWidth: '100%',
    marginTop: 2,
    color: COLORS.surfaceTint,
  },
  guidanceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.action,
    padding: SPACING.lg,
  },
  guidanceIcon: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  guidanceCopy: {
    minWidth: 0,
    flex: 1,
    gap: 3,
  },
  guidanceTitle: {
    color: COLORS.onAction,
  },
  guidanceText: {
    color: COLORS.onAction,
    lineHeight: 24,
  },
  guidanceAction: {
    marginTop: SPACING.xs,
    color: COLORS.onAction,
    textDecorationLine: 'underline',
  },
  sectionBlock: {
    gap: SPACING.sm,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  sectionHeadingCopy: {
    minWidth: 0,
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.primary,
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
  },
  viewAllButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusList: {
    overflow: 'hidden',
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.cardSurface,
    ...SHADOWS.sm,
  },
  statusRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  statusLabel: {
    minWidth: 0,
    flex: 1,
    color: COLORS.textSecondary,
  },
  statusValue: {
    color: COLORS.primary,
    fontSize: 18,
    lineHeight: 24,
  },
  coverageCard: {
    gap: SPACING.md,
  },
  coverageValue: {
    color: COLORS.emerald,
  },
  coverageNote: {
    color: COLORS.textSecondary,
  },
  commitmentsCard: {
    gap: SPACING.md,
  },
  commitmentRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  commitmentIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  commitmentMeta: {
    minWidth: 0,
    flex: 1,
  },
  commitmentName: {
    color: COLORS.textPrimary,
  },
  commitmentDue: {
    color: COLORS.textSecondary,
  },
  commitmentAmount: {
    maxWidth: '38%',
    color: COLORS.emerald,
  },
  activitySection: {
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  viewAll: {
    color: COLORS.secondary,
  },
  activityList: {
    overflow: 'hidden',
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  activityRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.mintBackground,
  },
  incomeAmount: {
    maxWidth: '38%',
    color: COLORS.emerald,
  },
  progressiveSetup: {
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  progressiveHeading: { gap: 2 },
  progressiveToggle: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  progressiveTitle: { color: COLORS.primary },
  progressiveCount: { color: COLORS.textSecondary },
  progressiveWhy: { color: COLORS.textSecondary },
  setupRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  setupRowText: { flex: 1, color: COLORS.textPrimary },
});
