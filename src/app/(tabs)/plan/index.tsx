import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../constants/theme';
import { Card } from '../../../components/ui/Card';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { calculateFinancialProfile } from '../../../features/financial-engine/engine';
import { formatCurrency } from '../../../utils/currency';
import { SavingsProjectionChart, DebtPaydownChart } from '../../../components/ui/TrajectoryChart';

export default function PlanScreen() {
  const { answers, debts } = useOnboardingStore();

  const currencySymbol = answers['currency'] || 'MAD';

  const profile = calculateFinancialProfile({ answers, debts });

  const budgetCategories = [
    {
      name: 'Housing',
      planned: Number(answers.housingAmount || 0),
      actual: Number(answers.housingAmount || 0),
      color: COLORS.primary,
      icon: 'home-outline',
    },
    {
      name: 'Groceries & Essentials',
      planned: Number(answers.groceries || 0),
      actual: Math.round(Number(answers.groceries || 0) * 0.85),
      color: COLORS.emerald,
      icon: 'cart-outline',
    },
    {
      name: 'Utilities & Phone',
      planned:
        Number(answers.electricity || 0) +
        Number(answers.water || 0) +
        Number(answers.internet || 0) +
        Number(answers.phone || 0),
      actual:
        Number(answers.electricity || 0) +
        Number(answers.water || 0) +
        Number(answers.internet || 0) +
        Number(answers.phone || 0),
      color: COLORS.secondary,
      icon: 'flash-outline',
    },
    {
      name: 'Healthcare & Medication',
      planned:
        Number(answers.medicationExpenses || 0) +
        Number(answers.healthInsurance || 0) +
        Number(answers.medicalAppointments || 0) +
        Number(answers.supportOtherHealthcare || 0),
      actual:
        Number(answers.medicationExpenses || 0) +
        Number(answers.healthInsurance || 0),
      color: COLORS.error,
      icon: 'medical-outline',
    },
    {
      name: 'Debt Services',
      planned: profile.minimumMonthlyDebtPayments,
      actual: profile.minimumMonthlyDebtPayments,
      color: COLORS.warning,
      icon: 'card-outline',
    },
  ];

  const activeCategories = budgetCategories.filter((cat) => cat.planned > 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Monthly Plan</Text>
          <Text style={styles.subtitle}>Allocated budget vs actual outflows</Text>
        </View>

        {/* Plan Overview Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.sumBox}>
              <Text style={styles.sumLabel}>Total Inflows</Text>
              <Text style={[styles.sumVal, { color: COLORS.emerald }]}>
                {formatCurrency(profile.totalMonthlyIncome, currencySymbol)}
              </Text>
            </View>
            <View style={styles.dividerCol} />
            <View style={styles.sumBox}>
              <Text style={styles.sumLabel}>Essential Outflows</Text>
              <Text style={[styles.sumVal, { color: COLORS.primary }]}>
                {formatCurrency(profile.essentialMonthlyExpenses + profile.minimumMonthlyDebtPayments, currencySymbol)}
              </Text>
            </View>
          </View>
          <View style={styles.dividerRow} />
          <View style={styles.balanceRow}>
            <Text style={styles.balLabel}>Discretionary / Available Balance</Text>
            <Text style={[styles.balVal, profile.realAvailableMonthlyBalance < 0 && { color: COLORS.error }]}>
              {formatCurrency(profile.realAvailableMonthlyBalance, currencySymbol)}
            </Text>
          </View>
        </Card>

        {/* Categories budget trackers */}
        <View style={styles.categoriesSection}>
          <SectionHeader
            title="Planned Allocations"
            subtitle="Budget vs actual spending"
            icon="pie-chart-outline"
          />
          {activeCategories.map((cat, idx) => {
            const progress = cat.planned > 0 ? cat.actual / cat.planned : 0;
            const progressColor = progress >= 1 ? COLORS.error : progress >= 0.9 ? COLORS.warning : COLORS.emerald;
            return (
              <Card key={idx} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}15` }]}>
                      <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                    </View>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                  </View>
                  <Text style={styles.categoryNumbers}>
                    {formatCurrency(cat.actual, currencySymbol)} / {formatCurrency(cat.planned, currencySymbol)}
                  </Text>
                </View>
                <ProgressBar progress={progress > 1 ? 1 : progress} color={progressColor} />
              </Card>
            );
          })}
        </View>

        {/* Interactive Trajectory Projections */}
        <View style={styles.categoriesSection}>
          <SectionHeader
            title="Interactive Projections"
            subtitle="Visualize your financial trajectory"
            icon="trending-up-outline"
          />
          <SavingsProjectionChart
            initialSaved={0}
            monthlySave={profile.realAvailableMonthlyBalance > 0 ? profile.realAvailableMonthlyBalance : 0}
            currencySymbol={currencySymbol}
          />
          {debts.length > 0 && (
            <DebtPaydownChart
              debts={debts}
              availableSurplus={profile.realAvailableMonthlyBalance > 0 ? profile.realAvailableMonthlyBalance : 0}
              currencySymbol={currencySymbol}
            />
          )}
        </View>

        {/* Non-essential reminder box */}
        <Card style={styles.reminderCard}>
          <View style={styles.reminderHeader}>
            <View style={styles.reminderIconBox}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.darkEmerald} />
            </View>
            <Text style={styles.reminderTitle}>Protected First Principles</Text>
          </View>
          <Text style={styles.reminderText}>
            Always cover Food, Housing, and Medications first before making any discretionary purchases or saving for optional personal goals.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sumBox: {
    flex: 1,
    alignItems: 'center',
  },
  sumLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  sumVal: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 16,
  },
  dividerCol: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.outlineVariant,
  },
  dividerRow: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: SPACING.md,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
  },
  balVal: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  categoriesSection: {
    gap: SPACING.sm,
  },
  categoryCard: {
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  categoryNumbers: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  reminderCard: {
    backgroundColor: COLORS.mintBackground,
    borderColor: COLORS.emerald,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  reminderIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.darkEmerald,
  },
  reminderText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
});
