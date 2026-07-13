import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
// eslint-disable-next-line import/no-unresolved
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useOnboardingStore, DebtInfo } from '../../store/onboardingStore';
import { calculateFinancialProfile } from '../../features/financial-engine/engine';
import { formatCurrency } from '../../utils/currency';

export default function DebtsScreen() {
  const router = useRouter();
  const { answers, debts, addDebt, removeDebt } = useOnboardingStore();
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

  const handleAddDebt = () => {
    if (!debtTotal || !debtMinPayment || !debtInterest) {
      Alert.alert('Error', 'Please fill in all debt fields');
      return;
    }
    const newDebt: DebtInfo = {
      type: debtType,
      totalAmount: Number(debtTotal),
      minimumPayment: Number(debtMinPayment),
      interestRate: Number(debtInterest),
      dueDate: debtDue,
      isOverdue: !!debtOverdue,
    };
    addDebt(newDebt);
    setDebtTotal('');
    setDebtMinPayment('');
    setDebtInterest('');
    setDebtOverdue(null);
    setShowAdder(false);
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
        <Text style={styles.title}>Debt Accounts</Text>
        <TouchableOpacity style={styles.addTrigger} onPress={() => setShowAdder(!showAdder)}>
          <Ionicons name={showAdder ? 'close' : 'add'} size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Debt Pressure Metrics Card */}
        <Card style={styles.metricsCard}>
          <Text style={styles.metricLabel}>Overall Debt Pressure</Text>
          <Text style={[styles.metricVal, { color: getPressureColor() }]}>
            {profile.debtPressure.toUpperCase()}
          </Text>
          <Text style={styles.metricSub}>
            Minimum debt payments consume {Math.round(profile.debtPressureRatio * 100)}% of your total income.
          </Text>
          
          <View style={styles.divider} />
          
          <View style={styles.numbersRow}>
            <View style={styles.numBox}>
              <Text style={styles.numLabel}>Monthly Min Payment</Text>
              <Text style={styles.numVal}>
                {formatCurrency(profile.minimumMonthlyDebtPayments, currencySymbol)}
              </Text>
            </View>
            <View style={styles.numBox}>
              <Text style={styles.numLabel}>Total Debts Tracked</Text>
              <Text style={styles.numVal}>
                {formatCurrency(debts.reduce((sum, d) => sum + d.totalAmount, 0), currencySymbol)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Add debt form */}
        {showAdder && (
          <Card style={styles.adderCard}>
            <Text style={styles.adderTitle}>Add Debt Line</Text>
            <Input label="Debt Type" value={debtType} onChangeText={setDebtType} placeholder="e.g. Credit Card, Student Loan" />
            <Input label={`Total Balance (${currencySymbol})`} value={debtTotal} onChangeText={setDebtTotal} placeholder="0.00" keyboardType="numeric" />
            <Input label={`Minimum Monthly Payment (${currencySymbol})`} value={debtMinPayment} onChangeText={setDebtMinPayment} placeholder="0.00" keyboardType="numeric" />
            <Input label="Interest Rate (%)" value={debtInterest} onChangeText={setDebtInterest} placeholder="e.g. 15" keyboardType="numeric" />
            <Input label="Monthly Due Day" value={debtDue} onChangeText={setDebtDue} placeholder="e.g. 15" keyboardType="number-pad" />
            
            <Text style={styles.overdueLabel}>Is payment currently overdue?</Text>
            <View style={styles.yesNoContainer}>
              <TouchableOpacity
                style={[styles.yesNoBtn, debtOverdue === true && styles.yesNoActive]}
                onPress={() => setDebtOverdue(true)}
              >
                <Text style={[styles.yesNoText, debtOverdue === true && styles.yesNoTextActive]}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.yesNoBtn, debtOverdue === false && styles.yesNoActive]}
                onPress={() => setDebtOverdue(false)}
              >
                <Text style={[styles.yesNoText, debtOverdue === false && styles.yesNoTextActive]}>No</Text>
              </TouchableOpacity>
            </View>

            <Button title="Save Debt Account" onPress={handleAddDebt} variant="primary" style={styles.saveDebtBtn} />
          </Card>
        )}

        {/* List of active debts */}
        <View style={styles.listSection}>
          <Text style={styles.sectionHeader}>Monitored Debt Accounts</Text>
          {debts.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No active debts tracked. Excellent!</Text>
            </Card>
          ) : (
            debts.map((item, idx) => (
              <Card key={idx} style={[styles.debtCard, item.isOverdue && styles.overdueDebtCard]}>
                <View style={styles.debtHeader}>
                  <View>
                    <Text style={styles.debtName}>{item.type}</Text>
                    <Text style={styles.debtInterest}>Interest Rate: {item.interestRate}%</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteDebt(idx)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </View>

                {item.isOverdue && (
                  <View style={styles.overdueBanner}>
                    <Ionicons name="warning" size={14} color={COLORS.error} />
                    <Text style={styles.overdueBannerText}>PAYMENT OVERDUE</Text>
                  </View>
                )}

                <View style={styles.debtDivider} />

                <View style={styles.debtStats}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Total Balance</Text>
                    <Text style={styles.statVal}>
                      {formatCurrency(item.totalAmount, currencySymbol)}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Min Monthly</Text>
                    <Text style={styles.statVal}>
                      {formatCurrency(item.minimumPayment, currencySymbol)}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Due Day</Text>
                    <Text style={styles.statVal}>Day {item.dueDate}</Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Actionable Relief Suggestions */}
        {profile.debtPressure === 'critical' && (
          <Card style={styles.reliefCard}>
            <Text style={styles.reliefTitle}>🚨 Critical Debt Pressure Guide</Text>
            <Text style={styles.reliefText}>
              Your debt obligations consume a high portion of your income. We recommend:
            </Text>
            <Text style={styles.reliefBullet}>• Contact creditors immediately to explain your shortfall and request interest reductions.</Text>
            <Text style={styles.reliefBullet}>• Avoid taking on any new loans or credit card balances.</Text>
            <Text style={styles.reliefBullet}>• Explore non-profit debt consolidation or counseling options in your municipality.</Text>
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
    backgroundColor: COLORS.white,
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
    backgroundColor: '#FFF2F2',
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
    backgroundColor: '#FFF2F2',
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
