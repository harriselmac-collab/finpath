import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useOnboardingStore, DebtInfo } from '../../store/onboardingStore';
import { calculateFinancialProfile } from '../../features/financial-engine/engine';
import { formatCurrency } from '../../utils/currency';
import AppText from '../../components/Text/AppText';
import { useTranslation } from 'react-i18next';
import { isValidDebt, parseFinancialAmount } from '../../utils/financialValidation';

export default function DebtsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language;
  const { answers, debts, addDebt, removeDebt, updateDebt } = useOnboardingStore();
  const currencySymbol = answers['currency'] || 'MAD';

  // Calculate metrics
  const profile = calculateFinancialProfile({ answers, debts });

  // Adder form states
  const [showAdder, setShowAdder] = useState(false);
  const [debtType, setDebtType] = useState('Credit Card');
  const [debtTotal, setDebtTotal] = useState('');
  const [debtMinPayment, setDebtMinPayment] = useState('');
  const [debtInterest, setDebtInterest] = useState('');
  const [debtDue, setDebtDue] = useState('15');
  const [debtOverdue, setDebtOverdue] = useState<boolean | null>(null);
  const [editingDebtIndex, setEditingDebtIndex] = useState<number | null>(null);

  const resetDebtForm = () => {
    setDebtType('Credit Card');
    setDebtTotal('');
    setDebtMinPayment('');
    setDebtInterest('');
    setDebtDue('15');
    setDebtOverdue(null);
    setEditingDebtIndex(null);
  };

  const closeDebtForm = () => {
    resetDebtForm();
    setShowAdder(false);
  };

  const handleEditDebt = (index: number) => {
    const debt = debts[index];
    setDebtType(debt.type);
    setDebtTotal(String(debt.totalAmount));
    setDebtMinPayment(String(debt.minimumPayment));
    setDebtInterest(String(debt.interestRate));
    setDebtDue(debt.dueDate);
    setDebtOverdue(debt.isOverdue);
    setEditingDebtIndex(index);
    setShowAdder(true);
  };

  const handleAddDebt = () => {
    if (!debtTotal || !debtMinPayment || !debtInterest) {
      Alert.alert('Error', 'Please fill in all debt fields');
      return;
    }
    const totalAmount = parseFinancialAmount(debtTotal, currencySymbol);
    const minimumPayment = parseFinancialAmount(debtMinPayment, currencySymbol);
    const interestRate = Number(debtInterest);
    const newDebt: DebtInfo = {
      type: debtType,
      totalAmount: totalAmount ?? Number.NaN,
      minimumPayment: minimumPayment ?? Number.NaN,
      interestRate,
      dueDate: debtDue,
      isOverdue: !!debtOverdue,
    };
    if (!debtType.trim() || !isValidDebt(newDebt)) {
      Alert.alert(t('common.error', 'Error'), t('validation.invalidDebt', 'Check the balance, minimum payment, interest rate (0–100), and due day (1–31).'));
      return;
    }
    if (editingDebtIndex === null) addDebt(newDebt);
    else updateDebt(editingDebtIndex, newDebt);
    closeDebtForm();
  };

  const handleDeleteDebt = (idx: number) => {
    Alert.alert(
      'Remove Debt',
      'Are you sure you want to remove this debt account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeDebt(idx) }
      ]
    );
  };

  const getPressureColor = () => {
    switch (profile.debtPressure) {
      case 'critical': return COLORS.error;
      case 'high': return COLORS.warning;
      case 'medium': return '#2980B9';
      default: return COLORS.emerald;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <AppText variant="h3" style={styles.title}>Debt Accounts</AppText>
        <TouchableOpacity
          style={styles.addTrigger}
          onPress={() => showAdder ? closeDebtForm() : setShowAdder(true)}
          accessibilityRole="button"
          accessibilityLabel={showAdder ? 'Close debt form' : 'Add debt account'}
        >
          <Ionicons name={showAdder ? 'close' : 'add'} size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Debt Pressure Metrics Card */}
        <Card style={styles.metricsCard}>
          <AppText variant="caption" style={styles.metricLabel}>Overall Debt Pressure</AppText>
          <AppText variant="h1" style={[styles.metricVal, { color: getPressureColor() }]}>
            {profile.debtPressure.toUpperCase()}
          </AppText>
          <AppText variant="caption" style={styles.metricSub}>
            Minimum debt payments consume {Math.round(profile.debtPressureRatio * 100)}% of your total income.
          </AppText>
          
          <View style={styles.divider} />
          
          <View style={styles.numbersRow}>
            <View style={styles.numBox}>
              <AppText variant="caption" style={styles.numLabel}>Monthly Min Payment</AppText>
              <AppText variant="bodySemiBold" style={styles.numVal}>
                {formatCurrency(profile.minimumMonthlyDebtPayments, currencySymbol, locale)}
              </AppText>
            </View>
            <View style={styles.numBox}>
              <AppText variant="caption" style={styles.numLabel}>Total Debts Tracked</AppText>
              <AppText variant="bodySemiBold" style={styles.numVal}>
                {formatCurrency(debts.reduce((sum, d) => sum + d.totalAmount, 0), currencySymbol, locale)}
              </AppText>
            </View>
          </View>
        </Card>

        {/* Add debt form */}
        {showAdder && (
          <Card style={styles.adderCard}>
            <AppText variant="bodySemiBold" style={styles.adderTitle}>{editingDebtIndex === null ? 'Add Debt Line' : 'Edit Debt Line'}</AppText>
            <Input label="Debt Type" value={debtType} onChangeText={setDebtType} placeholder="e.g. Credit Card, Student Loan" />
            <Input label={`Total Balance (${currencySymbol})`} value={debtTotal} onChangeText={setDebtTotal} placeholder="0.00" keyboardType="numeric" />
            <Input label={`Minimum Monthly Payment (${currencySymbol})`} value={debtMinPayment} onChangeText={setDebtMinPayment} placeholder="0.00" keyboardType="numeric" />
            <Input label="Interest Rate (%)" value={debtInterest} onChangeText={setDebtInterest} placeholder="e.g. 15" keyboardType="numeric" />
            <Input label="Monthly Due Day" value={debtDue} onChangeText={setDebtDue} placeholder="e.g. 15" keyboardType="number-pad" />
            
            <AppText variant="bodySemiBold" style={styles.overdueLabel}>Is payment currently overdue?</AppText>
            <View style={styles.yesNoContainer}>
              <TouchableOpacity
                style={[styles.yesNoBtn, debtOverdue === true && styles.yesNoActive]}
                onPress={() => setDebtOverdue(true)}
              >
                <AppText variant="bodyMedium" style={[styles.yesNoText, debtOverdue === true && styles.yesNoTextActive]}>Yes</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.yesNoBtn, debtOverdue === false && styles.yesNoActive]}
                onPress={() => setDebtOverdue(false)}
              >
                <AppText variant="bodyMedium" style={[styles.yesNoText, debtOverdue === false && styles.yesNoTextActive]}>No</AppText>
              </TouchableOpacity>
            </View>

            <Button title={editingDebtIndex === null ? 'Save Debt Account' : 'Update Debt Account'} onPress={handleAddDebt} variant="primary" style={styles.saveDebtBtn} />
          </Card>
        )}

        {/* List of active debts */}
        <View style={styles.listSection}>
          <AppText variant="bodySemiBold" style={styles.sectionHeader}>Monitored Debt Accounts</AppText>
          {debts.length === 0 ? (
            <Card style={styles.emptyCard}>
              <AppText variant="bodyMedium" style={styles.emptyText}>No active debts tracked. Excellent!</AppText>
            </Card>
          ) : (
            debts.map((item, idx) => (
              <Card key={idx} style={[styles.debtCard, item.isOverdue && styles.overdueDebtCard]}>
                <View style={styles.debtHeader}>
                  <View>
                    <AppText variant="bodySemiBold" style={styles.debtName}>{item.type}</AppText>
                    <AppText variant="caption" style={styles.debtInterest}>Interest Rate: {item.interestRate}%</AppText>
                  </View>
                  <View style={styles.debtActions}>
                    <TouchableOpacity onPress={() => handleEditDebt(idx)} style={styles.deleteBtn} accessibilityRole="button" accessibilityLabel="Edit debt account">
                      <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteDebt(idx)} style={styles.deleteBtn} accessibilityRole="button" accessibilityLabel="Remove debt account">
                      <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                {item.isOverdue && (
                  <View style={styles.overdueBanner}>
                    <Ionicons name="warning" size={14} color={COLORS.error} />
                    <AppText variant="labelSm" style={styles.overdueBannerText}>PAYMENT OVERDUE</AppText>
                  </View>
                )}

                <View style={styles.debtDivider} />

                <View style={styles.debtStats}>
                  <View style={styles.statBox}>
                    <AppText variant="caption" style={styles.statLabel}>Total Balance</AppText>
                    <AppText variant="bodySemiBold" style={styles.statVal}>
                      {formatCurrency(item.totalAmount, currencySymbol, locale)}
                    </AppText>
                  </View>
                  <View style={styles.statBox}>
                    <AppText variant="caption" style={styles.statLabel}>Min Monthly</AppText>
                    <AppText variant="bodySemiBold" style={styles.statVal}>
                      {formatCurrency(item.minimumPayment, currencySymbol, locale)}
                    </AppText>
                  </View>
                  <View style={styles.statBox}>
                    <AppText variant="caption" style={styles.statLabel}>Due Day</AppText>
                    <AppText variant="bodySemiBold" style={styles.statVal}>Day {item.dueDate}</AppText>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Actionable Relief Suggestions */}
        {profile.debtPressure === 'critical' && (
          <Card style={styles.reliefCard}>
            <AppText variant="bodySemiBold" style={styles.reliefTitle}>🚨 Critical Debt Pressure Guide</AppText>
            <AppText variant="caption" style={styles.reliefText}>
              Your debt obligations consume a high portion of your income. We recommend:
            </AppText>
            <AppText variant="caption" style={styles.reliefBullet}>• Contact creditors immediately to explain your shortfall and request interest reductions.</AppText>
            <AppText variant="caption" style={styles.reliefBullet}>• Avoid taking on any new loans or credit card balances.</AppText>
            <AppText variant="caption" style={styles.reliefBullet}>• Explore non-profit debt consolidation or counseling options in your municipality.</AppText>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  addTrigger: {
    padding: SPACING.xs,
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  metricsCard: {
    alignItems: 'center',
  },
  metricLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricVal: {
    ...TYPOGRAPHY.h1,
    marginVertical: SPACING.xs,
  },
  metricSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: '100%',
    marginVertical: SPACING.md,
  },
  numbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  numBox: {
    flex: 1,
    alignItems: 'center',
  },
  numLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  numVal: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  adderCard: {
    gap: SPACING.sm,
  },
  adderTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.primary,
  },
  overdueLabel: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
  },
  yesNoContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  yesNoBtn: {
    flex: 1,
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yesNoActive: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorBackground,
  },
  yesNoText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
  },
  yesNoTextActive: {
    color: COLORS.error,
    fontWeight: '600',
  },
  saveDebtBtn: {
    marginTop: SPACING.sm,
  },
  listSection: {
    gap: SPACING.sm,
  },
  sectionHeader: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
  },
  debtCard: {
    padding: SPACING.md,
  },
  overdueDebtCard: {
    borderColor: COLORS.error,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  debtName: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  debtInterest: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  debtActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  deleteBtn: {
    padding: SPACING.xs,
  },
  overdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  overdueBannerText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.error,
  },
  debtDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  debtStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  statVal: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  reliefCard: {
    backgroundColor: COLORS.errorBackground,
    borderColor: COLORS.error,
  },
  reliefTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  reliefText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    lineHeight: 18,
    fontWeight: '600',
  },
  reliefBullet: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    lineHeight: 16,
    marginTop: SPACING.xs,
  },
});
