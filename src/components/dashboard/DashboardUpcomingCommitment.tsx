import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import AppText from '../Text/AppText';
import { Card, Icon } from '../ui';
import { COLORS, SPACING } from '../../constants/theme';

export interface UpcomingCommitmentData {
  name: string;
  amount: number;
  due: string;
  icon: string;
}

interface DashboardUpcomingCommitmentProps {
  upcomingCommitment: UpcomingCommitmentData;
  formatMoney: (amount: number) => string;
}

export const DashboardUpcomingCommitment = memo(function DashboardUpcomingCommitment({
  upcomingCommitment,
  formatMoney,
}: DashboardUpcomingCommitmentProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
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
  );
});

const styles = StyleSheet.create({
  commitmentsCard: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
  },
  commitmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceContainerLow,
    gap: SPACING.sm,
  },
  commitmentIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  commitmentMeta: {
    flex: 1,
    gap: SPACING.base,
  },
  commitmentName: {
    color: COLORS.textPrimary,
  },
  commitmentDue: {
    color: COLORS.textSecondary,
  },
  commitmentAmount: {
    color: COLORS.textPrimary,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
