import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import AppText from '../Text/AppText';
import { Button, Card, Icon } from '../ui';
import { COLORS, SPACING } from '../../constants/theme';

interface DashboardIncompletePlanCardProps {
  hasRequiredInputs: boolean;
}

export const DashboardIncompletePlanCard = memo(function DashboardIncompletePlanCard({
  hasRequiredInputs,
}: DashboardIncompletePlanCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
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
  );
});

const styles = StyleSheet.create({
  setupCard: {
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.xl,
  },
  setupIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.mintBackground,
  },
  setupTitle: {
    color: COLORS.textPrimary,
  },
  setupDescription: {
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  setupButton: {
    marginTop: SPACING.xs,
    alignSelf: 'stretch',
  },
});
