import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import AppText from '../Text/AppText';
import { Icon } from '../ui';
import { COLORS, SPACING } from '../../constants/theme';
import { Transaction } from '../../store/transactionsStore';

interface DashboardRecentActivityProps {
  recentTransactions: Transaction[];
  formatMoney: (amount: number) => string;
}

export const DashboardRecentActivity = memo(function DashboardRecentActivity({
  recentTransactions,
  formatMoney,
}: DashboardRecentActivityProps) {
  const router = useRouter();
  const { t } = useTranslation();

  if (!recentTransactions.length) return null;

  return (
    <View style={styles.activitySection}>
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
              <View style={styles.activityMeta}>
                <AppText variant="bodySemiBold" style={styles.activityName} numberOfLines={1}>
                  {transaction.name}
                </AppText>
                <AppText variant="caption" style={styles.activityCategory} numberOfLines={1}>
                  {transaction.category}
                </AppText>
              </View>
              <AppText
                variant="bodySemiBold"
                style={transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount}
                numberOfLines={1}
              >
                {signedAmount}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  activitySection: {
    gap: SPACING.sm,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  sectionHeadingCopy: {
    flex: 1,
    gap: SPACING.base,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
  },
  viewAllButton: {
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.xs,
  },
  viewAll: {
    color: COLORS.primary,
  },
  activityList: {
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  activityIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  activityMeta: {
    flex: 1,
    gap: SPACING.base,
  },
  activityName: {
    color: COLORS.textPrimary,
  },
  activityCategory: {
    color: COLORS.textSecondary,
  },
  expenseAmount: {
    color: COLORS.textPrimary,
  },
  incomeAmount: {
    color: COLORS.emerald,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
