import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import AppText from '../Text/AppText';
import { COLORS, SPACING } from '../../constants/theme';

interface StatusRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

function StatusRow({
  label,
  value,
  isLast = false,
}: StatusRowProps) {
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

interface DashboardPlanBreakdownProps {
  plannedEssentials: number;
  plannedFlexible: number;
  minimumDebtPayments: number;
  actualSpending: number;
  commitmentsStillDue: number;
  projectedBalance: number;
  formatMoney: (amount: number) => string;
}

export const DashboardPlanBreakdown = memo(function DashboardPlanBreakdown({
  plannedEssentials,
  plannedFlexible,
  minimumDebtPayments,
  actualSpending,
  commitmentsStillDue,
  projectedBalance,
  formatMoney,
}: DashboardPlanBreakdownProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.sectionBlock}>
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
          value={formatMoney(plannedEssentials)}
        />
        <StatusRow
          label={t('dashboard.plannedFlexible', 'Planned flexible spending')}
          value={formatMoney(plannedFlexible)}
        />
        <StatusRow
          label={t('dashboard.minimumDebtPayments', 'Minimum debt payments')}
          value={formatMoney(minimumDebtPayments)}
        />
        <StatusRow
          label={t('dashboard.actualSpending', 'Actual spending this period')}
          value={formatMoney(actualSpending)}
        />
        <StatusRow
          label={t('dashboard.commitmentsStillDue', 'Commitments still due')}
          value={formatMoney(commitmentsStillDue)}
        />
        <StatusRow
          label={t('dashboard.projectedBalance', 'Projected balance before next income')}
          value={formatMoney(projectedBalance)}
          isLast
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  sectionBlock: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
  },
  statusList: {
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  statusLabel: {
    flex: 1,
    color: COLORS.textSecondary,
  },
  statusValue: {
    color: COLORS.textPrimary,
  },
});
