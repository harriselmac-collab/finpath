import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import AppText from '../Text/AppText';
import { Card, Icon } from '../ui';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface DashboardBalanceCardProps {
  safeToSpendTotal: number;
  safeDailySpending: number;
  remainingCommitments: number;
  formattedNextIncome: string;
  calculationTime: string;
  hasShortfall: boolean;
  hasPlanValues: boolean;
  expectedDatePresent: boolean;
  stackMetrics: boolean;
  formatMoney: (amount: number) => string;
}

export const DashboardBalanceCard = memo(function DashboardBalanceCard({
  safeToSpendTotal,
  safeDailySpending,
  remainingCommitments,
  formattedNextIncome,
  calculationTime,
  hasShortfall,
  hasPlanValues,
  expectedDatePresent,
  stackMetrics,
  formatMoney,
}: DashboardBalanceCardProps) {
  const { t } = useTranslation();

  return (
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
        {!expectedDatePresent && (
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
        variant="amountLg"
        style={[
          styles.balanceAmount,
          hasShortfall && styles.negativeAmount,
        ]}
        accessibilityLabel={`${t('dashboard.plannedRemainder', 'Safe to spend until next income')}: ${formatMoney(safeToSpendTotal)}`}
      >
        {formatMoney(safeToSpendTotal)}
      </AppText>
      <View style={styles.balanceDivider} />
      <View style={[styles.balanceMeta, stackMetrics && styles.balanceMetaStack]}>
        <View style={styles.metaBlock}>
          <AppText variant="supporting" style={styles.metaLabel}>
            {t('dashboard.plannedDailyAllowance', 'Safe per day')}
          </AppText>
          <AppText variant="sectionTitle" style={styles.metaValueGreen}>
            {formatMoney(safeDailySpending)}
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
            {formatMoney(remainingCommitments)}
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
  );
});

const styles = StyleSheet.create({
  balanceCard: {
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  balanceHeading: {
    gap: SPACING.base,
  },
  balanceLabel: {
    color: COLORS.textPrimary,
  },
  balanceSource: {
    color: COLORS.textSecondary,
  },
  statusTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.base,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.secondaryContainer,
  },
  statusTagDanger: {
    backgroundColor: COLORS.errorContainer,
  },
  statusTagText: {
    color: COLORS.onSecondaryContainer,
    fontWeight: '600',
  },
  statusTagTextDanger: {
    color: COLORS.onErrorContainer,
  },
  balanceAmount: {
    color: COLORS.primary,
  },
  negativeAmount: {
    color: COLORS.error,
  },
  balanceDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
  },
  balanceMeta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  balanceMetaStack: {
    flexDirection: 'column',
    gap: SPACING.sm,
  },
  metaBlock: {
    flex: 1,
    gap: SPACING.base,
  },
  metaRight: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    color: COLORS.textSecondary,
  },
  metaValue: {
    color: COLORS.textPrimary,
  },
  metaValueGreen: {
    color: COLORS.emerald,
  },
});
