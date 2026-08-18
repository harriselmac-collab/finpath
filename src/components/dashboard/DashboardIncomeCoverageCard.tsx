import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import AppText from '../Text/AppText';
import { Card, Icon } from '../ui';
import { COLORS, SPACING } from '../../constants/theme';

interface DashboardIncomeCoverageCardProps {
  incomeCoverageRatio: number;
  locale: string;
}

export const DashboardIncomeCoverageCard = memo(function DashboardIncomeCoverageCard({
  incomeCoverageRatio,
  locale,
}: DashboardIncomeCoverageCardProps) {
  const { t } = useTranslation();

  return (
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
        accessibilityLabel={`${t('dashboard.incomeCoverage', 'Income coverage')}: ${incomeCoverageRatio.toLocaleString(locale, { maximumFractionDigits: 2 })}`}
      >
        {incomeCoverageRatio.toLocaleString(locale, { maximumFractionDigits: 2 })}×
      </AppText>
      <AppText variant="caption" style={styles.coverageNote}>
        {t(
          'dashboard.notSavingsBalance',
          'This ratio is part of your plan, not an emergency-savings balance.',
        )}
      </AppText>
    </Card>
  );
});

const styles = StyleSheet.create({
  coverageCard: {
    padding: SPACING.xl,
    gap: SPACING.md,
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
  coverageValue: {
    color: COLORS.primary,
  },
  coverageNote: {
    color: COLORS.textSecondary,
  },
});
