import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../../constants/theme';
import { Card, AlertCard } from '../../../components/ui/Card';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { calculateFinancialProfile } from '../../../features/financial-engine/engine';
import { evaluateBudgetSafety } from '../../../features/financial-engine/safetyRules';
import { formatCurrency } from '../../../utils/currency';

export default function DashboardScreen() {
  const router = useRouter();
  const { answers, debts } = useOnboardingStore();

  const currencySymbol = answers['currency'] || 'MAD';

  // Card metallic shine animation
  const shineProgress = useSharedValue(-1.5);

  useEffect(() => {
    shineProgress.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 1500 }),
        withDelay(3000, withTiming(-1.5, { duration: 0 }))
      ),
      -1,
      false
    );
  }, [shineProgress]);

  const animatedShineStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: shineProgress.value * 320 },
      ],
    };
  });

  const profile = calculateFinancialProfile({ answers, debts });
  const safetyReport = evaluateBudgetSafety(
    profile.totalMonthlyIncome,
    profile.essentialMonthlyExpenses,
    profile.minimumMonthlyDebtPayments,
    answers
  );

  const recentTransactions = [
    { id: '1', name: 'Grocery Store', amount: 450, type: 'essential', category: 'Essential', date: 'Yesterday, 14:20', icon: 'shopping-basket' },
    { id: '2', name: 'Salary Deposit', amount: 15000, type: 'income', category: 'Income', date: '2 days ago', icon: 'payments' },
    { id: '3', name: "L'Hote Cafe", amount: 35, type: 'flexible', category: 'Lifestyle', date: '2 days ago', icon: 'cafe' },
  ];

  const upcomingBills = [
    { id: '1', name: 'Rent Payment', amount: 2500, dueIn: 'In 3 days', icon: 'home', color: COLORS.primary },
    { id: '2', name: 'Electricity Bill', amount: 320, dueIn: 'In 8 days', icon: 'flash', color: COLORS.secondary },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="menu" size={24} color={COLORS.primary} />
            <Text style={styles.headerTitle}>FinPath</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={20} color={COLORS.textSecondary} />
            </View>
          </View>
        </View>

        {/* Shortfall Warning */}
        {safetyReport.hasDeficit && safetyReport.warningMessage && (
          <AlertCard
            type="danger"
            title="Income Shortfall Detected"
            description={safetyReport.warningMessage}
            style={styles.shortfallAlert}
          />
        )}

        {/* Hero Metrics Section */}
        <View style={styles.metricsGrid}>
          {/* Primary Balance Card */}
          <Animated.View entering={FadeInUp.duration(500).delay(100)}>
            <Card style={styles.balanceCard}>
              <View style={styles.balanceContent}>
                <Text style={styles.balanceLabel}>Available this month</Text>
                <Text
                  style={[
                    styles.balanceAmount,
                    profile.realAvailableMonthlyBalance < 0 && { color: COLORS.error },
                  ]}
                >
                  {formatCurrency(profile.realAvailableMonthlyBalance, currencySymbol)}
                </Text>
                <View style={styles.balanceFooter}>
                  <View>
                    <Text style={styles.balanceSubLabel}>Safe daily spending</Text>
                    <Text style={styles.balanceSubValue}>
                      {formatCurrency(profile.safeDailySpending, currencySymbol)}
                    </Text>
                  </View>
                  <View style={styles.balanceIconBox}>
                    <Ionicons name="trending-up" size={24} color={COLORS.white} />
                  </View>
                </View>
              </View>
              <View style={styles.balanceDecoration} />
              <Animated.View style={[styles.shineBar, animatedShineStyle]} pointerEvents="none" />
            </Card>
          </Animated.View>


          {/* Savings Goal Card */}
          <Animated.View entering={FadeInUp.duration(500).delay(200)}>
            <Card style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalLabel}>Savings progress</Text>
                  <Text style={styles.goalTitle}>Emergency Fund</Text>
                </View>
                <View style={[styles.goalIconBox, { backgroundColor: `${COLORS.secondary}15` }]}>
                  <Ionicons name="shield" size={20} color={COLORS.secondary} />
                </View>
              </View>
              <View style={styles.progressRow}>
                <View style={styles.progressBarWrapper}>
                  <View style={[styles.progressBarFill, { width: '60%' }]} />
                </View>
              </View>
              <View style={styles.goalFooter}>
                <Text style={styles.goalProgress}>60% achieved</Text>
                <Text style={styles.goalAmount}>+1,200 MAD this week</Text>
              </View>
            </Card>
          </Animated.View>
        </View>

        {/* AI Insight Card */}
        <Animated.View entering={FadeInUp.duration(500).delay(300)}>
          <Card style={styles.aiCard}>
            <View style={styles.aiIconBox}>
              <Ionicons name="auto-awesome" size={20} color={COLORS.secondary} />
            </View>
            <View style={styles.aiContent}>
              <Text style={styles.aiTitle}>FinPath Intelligence</Text>
              <Text style={styles.aiText}>
                You are on track to save <Text style={styles.aiHighlight}>500 MAD</Text> more this month than last. Great job!
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <SectionHeader
            title="Recent Transactions"
            subtitle="Your latest activity"
            icon="receipt-long"
          />
          <Card style={styles.transactionsCard}>
            {recentTransactions.map((tx, index) => (
              <Animated.View key={tx.id} entering={FadeInUp.duration(400).delay(400 + index * 60)}>
                <TouchableOpacity
                  style={[
                    styles.txRow,
                    index < recentTransactions.length - 1 && styles.txDivider,
                  ]}
                  onPress={() => router.push('/transactions')}
                >
                  <View style={[styles.txIconBox, { backgroundColor: `${COLORS.primary}15` }]}>
                    <Ionicons name={tx.icon as any} size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.txMeta}>
                    <Text style={styles.txName}>{tx.name}</Text>
                    <Text style={styles.txDate}>{tx.date}</Text>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={[
                      styles.txAmount,
                      tx.type === 'income' ? styles.txAmountGreen : styles.txAmountDefault,
                    ]}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currencySymbol)}
                    </Text>
                    <View style={[styles.categoryChip, { backgroundColor: `${COLORS.textSecondary}15` }]}>
                      <Text style={styles.categoryChipText}>{tx.category}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Card>
        </View>

        {/* Upcoming Bills */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.sectionAction}>Calendar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.billsContainer}>
            {upcomingBills.map((bill, index) => (
              <Animated.View key={bill.id} entering={FadeInUp.duration(400).delay(550 + index * 60)}>
                <Card style={styles.billCard}>
                  <View style={[styles.billAccent, { backgroundColor: bill.color }]} />
                  <View style={[styles.billIconBox, { backgroundColor: `${bill.color}15` }]}>
                    <Ionicons name={bill.icon as any} size={20} color={bill.color} />
                  </View>
                  <View style={styles.billMeta}>
                    <Text style={styles.billName}>{bill.name}</Text>
                    <Text style={styles.billDue}>{bill.dueIn}</Text>
                  </View>
                  <Text style={styles.billAmount}>{formatCurrency(bill.amount, currencySymbol)}</Text>
                </Card>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Financial Literacy Card */}
        <Animated.View entering={FadeInUp.duration(500).delay(700)}>
          <Card style={styles.literacyCard}>
            <Text style={styles.literacyLabel}>Financial Literacy</Text>
            <Text style={styles.literacyTitle}>Master the 50/30/20 budget rule</Text>
            <TouchableOpacity style={styles.literacyAction}>
              <Text style={styles.literacyActionText}>Learn More</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.onPrimaryContainer} />
            </TouchableOpacity>
          </Card>
        </Animated.View>

        {/* Bottom spacer */}
        <View style={{ height: SPACING.xl * 2 }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.primary,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryFixed,
  },
  shortfallAlert: {
    marginBottom: SPACING.xs,
  },
  metricsGrid: {
    gap: SPACING.md,
  },
  balanceCard: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primaryContainer,
    ...SHADOWS.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  shineBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    transform: [{ rotate: '25deg' }, { skewX: '-20deg' }],
  },

  balanceContent: {
    position: 'relative',
    zIndex: 1,
  },
  balanceLabel: {
    ...TYPOGRAPHY.labelSm,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    ...TYPOGRAPHY.amountLg,
    color: COLORS.white,
    fontSize: 36,
    marginBottom: SPACING.md,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  balanceSubLabel: {
    ...TYPOGRAPHY.labelSm,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  balanceSubValue: {
    ...TYPOGRAPHY.amountMd,
    color: COLORS.white,
  },
  balanceIconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceDecoration: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  goalCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderColor: COLORS.outlineVariant,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  goalTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  goalIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRow: {
    marginBottom: SPACING.sm,
  },
  progressBarWrapper: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceContainerHigh,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 3,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalProgress: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.primary,
    fontWeight: '700',
  },
  goalAmount: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundImage: 'linear-gradient(#EAF8EF, #EAF8EF), linear-gradient(135deg, #071e3d, #48C774)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
  },
  aiIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.secondaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  aiContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  aiTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.primary,
    fontSize: 14,
  },
  aiText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  aiHighlight: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.textPrimary,
    fontSize: 18,
  },
  sectionAction: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onPrimaryContainer,
    fontWeight: '600',
  },
  transactionsCard: {
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  txDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txMeta: {
    flex: 1,
  },
  txName: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  txDate: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  txAmount: {
    ...TYPOGRAPHY.amountMd,
    fontSize: 14,
  },
  txAmountGreen: {
    color: COLORS.secondary,
  },
  txAmountDefault: {
    color: COLORS.textPrimary,
  },
  categoryChip: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  categoryChipText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  billsContainer: {
    gap: SPACING.sm,
  },
  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  billAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.lg,
  },
  billIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  billMeta: {
    flex: 1,
  },
  billName: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  billDue: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  billAmount: {
    ...TYPOGRAPHY.amountMd,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  literacyCard: {
    backgroundColor: COLORS.primaryFixed,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.xs,
    position: 'relative',
    overflow: 'hidden',
  },
  literacyLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onPrimaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  literacyTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.onPrimaryFixed,
    fontSize: 14,
  },
  literacyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  literacyActionText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onPrimaryContainer,
    fontWeight: '600',
  },
});
