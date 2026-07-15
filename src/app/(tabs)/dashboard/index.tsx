import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, Platform, I18nManager } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../../constants/theme';
import { Card, AlertCard, ProgressBar, Icon, Badge } from '../../../components/ui';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { SpendingTrendsChart } from '../../../components/ui/SpendingTrendsChart';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { useTransactionsStore } from '../../../store/transactionsStore';
import { useSessionStore } from '../../../store/sessionStore';
import { calculateFinancialProfile } from '../../../features/financial-engine/engine';
import { evaluateBudgetSafety } from '../../../features/financial-engine/safetyRules';
import { formatCurrency } from '../../../utils/currency';

const isRTL = I18nManager.isRTL;

export default function DashboardScreen() {
  const router = useRouter();
  const { answers, debts, resetOnboarding } = useOnboardingStore();
  const { transactions } = useTransactionsStore();
  const { user, signOut } = useSessionStore();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const currencySymbol = answers['currency'] || 'MAD';



  const profile = calculateFinancialProfile({ answers, debts });
  const safetyReport = evaluateBudgetSafety(
    profile.totalMonthlyIncome,
    profile.essentialMonthlyExpenses,
    profile.minimumMonthlyDebtPayments,
    answers
  );

  // Format recent transactions from store
  const getRecentTransactions = () => {
    // Sort by timestamp descending (most recent first), take top 3
    const sortedTx = [...transactions]
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 3);

    return sortedTx.map(tx => {
      // Map transaction type to display type (debt/savings shown as essential/flexible for simplicity)
      const displayType = tx.type === 'debt' ? 'essential' :
                        tx.type === 'savings' ? 'flexible' : tx.type;

      // Format date: combine timeGroup and time
      const date = `${tx.timeGroup}, ${tx.date}`;

      // Map category to icon
      const iconMap: Record<string, string> = {
        'Housing': 'home',
        'Mortgage': 'home',
        'Rent': 'home',
        'Groceries': 'shopping-basket',
        'Food': 'restaurant',
        'Snacks': 'restaurant',
        'Beverages': 'restaurant',
        'Household Essentials': 'cart',
        'Personal Care': 'medical',
        'Utilities': 'flash',
        'Electricity': 'flash',
        'Water': 'water',
        'Internet': 'wifi',
        'Phone': 'call',
        'Gas': 'fire',
        'Trash': 'trash',
        'Sewer': 'water',
        'Healthcare': 'medical',
        'Medication': 'medical',
        'Doctor': 'medical',
        'Dental': 'medical',
        'Vision': 'eyes',
        'Insurance': 'document',
        'Pharmacy': 'medical',
        'Medical Supplies': 'medical',
        'Salary': 'cash',
        'Bonus': 'cash',
        'Freelance': 'briefcase',
        'Dividend': 'trending-up',
        'Interest': 'trending-up',
        'Gift': 'gift',
        // Default mappings for transaction types
        'Essential': 'home',
        'Lifestyle': 'cafe',
        'Income': 'cash',
      };

      const icon = iconMap[tx.category] ||
                  (tx.type === 'income' ? 'cash' :
                   tx.type === 'essential' ? 'home' :
                   'cafe');

      return {
        id: tx.id,
        name: tx.name,
        amount: tx.amount,
        type: displayType as 'essential' | 'income' | 'flexible',
        category: tx.category,
        date: date,
        icon: icon as any,
      };
    });
  };

  const recentTransactions = getRecentTransactions();

  const upcomingBills = [
    { id: '1', name: 'Rent Payment', amount: 2500, dueIn: 'Due in 3 days', icon: 'home', color: COLORS.primary },
    { id: '2', name: 'Electricity Bill', amount: 320, dueIn: 'Due in 8 days', icon: 'flash', color: COLORS.secondary },
  ];

  // AI insight configuration based on financial health
  const getAiInsight = () => {
    if (safetyReport.hasDeficit) {
      const deficitAmount = (profile.essentialMonthlyExpenses + profile.minimumMonthlyDebtPayments) - profile.totalMonthlyIncome;
      return {
        type: 'warning' as const,
        icon: 'warning',
        iconColor: COLORS.error,
        title: 'Budget Shortfall Alert',
        text: `Your essential needs exceed your income by `,
        highlight: `${formatCurrency(deficitAmount, currencySymbol)}`,
        subText: '. Review planned outflows and explore relief options.',
        actionLabel: 'Review Plan',
        actionRoute: '/plan',
        cardBg: '#FFF2F2',
        cardBorder: COLORS.error,
      };
    } else if (profile.debtPressure === 'critical' || profile.debtPressure === 'high') {
      return {
        type: 'warning' as const,
        icon: 'alert-circle',
        iconColor: COLORS.warning,
        title: 'High Debt Pressure Alert',
        text: 'Minimum debt payments consume ',
        highlight: `${Math.round(profile.debtPressureRatio * 100)}%`,
        subText: ' of your total monthly income. Consider prioritizing high-interest payoffs.',
        actionLabel: 'View Details',
        actionRoute: '/plan',
        cardBg: '#FFF8EA',
        cardBorder: COLORS.warning,
      };
    } else {
      return {
        type: 'positive' as const,
        icon: 'sparkles',
        iconColor: COLORS.emerald,
        title: 'FinPath Intelligence',
        text: 'You are currently on track to save ',
        highlight: `500 ${currencySymbol}`,
        subText: ' more than last month. Steady budgeting keeps your safety buffer strong.',
        actionLabel: 'View Insight',
        actionRoute: '/plan',
        cardBg: COLORS.mintBackground,
        cardBorder: COLORS.emerald,
      };
    }
  };

  const aiInsight = getAiInsight();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => setIsMenuVisible(true)} style={styles.menuIconButton} accessibilityRole="button" accessibilityLabel="Menu">
              <Icon name="menu" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>FinPath</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.headerRight} accessibilityRole="link" accessibilityLabel="Profile">
            <View style={styles.avatarContainer}>
              <Icon name="person" size={20} color={COLORS.textSecondary} />
            </View>
          </TouchableOpacity>
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

        {/* 1 & 2. Hero Metrics Section */}
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
                    <Icon name="trending-up" size={24} color={COLORS.white} />
                  </View>
                </View>
              </View>
              <View style={styles.balanceDecoration} />
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
                  <Icon name="shield" size={20} color={COLORS.secondary} />
                </View>
              </View>
              
              <View style={styles.goalAmountsRow}>
                <Text style={styles.goalSavedText}>
                  {formatCurrency(3000, currencySymbol)} saved of {formatCurrency(5000, currencySymbol)}
                </Text>
              </View>

              <View style={styles.progressRow}>
                <ProgressBar progress={0.6} height={6} color={COLORS.emerald} />
              </View>
              
              <View style={styles.goalFooter}>
                <Text style={styles.goalProgress}>60% achieved</Text>
                <Text style={styles.goalAmount}>Goal contribution: +1,200 {currencySymbol} saved this week</Text>
              </View>
            </Card>
          </Animated.View>
        </View>

        {/* 3. AI Insight Card */}
        <Animated.View entering={FadeInUp.duration(500).delay(300)}>
          <Card style={[styles.aiCard, { backgroundColor: aiInsight.cardBg, borderColor: aiInsight.cardBorder }]}>
            <View style={[styles.insightHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.insightTitleGroup, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={styles.insightIconContainer}>
                  <Icon name={aiInsight.icon} size={20} color={aiInsight.iconColor} />
                </View>

                <Text style={styles.insightTitle}>
                  {aiInsight.title}
                </Text>
              </View>

              <Pressable
                style={[styles.insightAction, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                accessibilityRole="button"
                accessibilityLabel={aiInsight.actionLabel}
                onPress={() => router.push(aiInsight.actionRoute as any)}
              >
                <Text style={styles.insightActionText}>{aiInsight.actionLabel}</Text>
                <Icon name="arrow-forward" size={14} color={aiInsight.iconColor} />
              </Pressable>
            </View>

            <Text style={styles.insightDescription}>
              {aiInsight.text}
              <Text style={[styles.insightHighlight, { color: aiInsight.iconColor }]}>
                {aiInsight.highlight}</Text>
              {aiInsight.subText}
            </Text>
          </Card>
        </Animated.View>

        {/* 4. Upcoming Bills */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <TouchableOpacity onPress={() => router.push('/goals')} accessibilityRole="button" accessibilityLabel="Calendar">
              <Text style={styles.sectionAction}>Calendar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.billsContainer}>
            {upcomingBills.slice(0, 2).map((bill, index) => {
              const isDueSoon = bill.dueIn.toLowerCase().includes('3') || bill.dueIn.toLowerCase().includes('soon') || bill.dueIn.toLowerCase().includes('1') || bill.dueIn.toLowerCase().includes('2');
              return (
                <Animated.View key={bill.id} entering={FadeInUp.duration(400).delay(350 + index * 60)}>
                  <Card style={styles.billCard}>
                    <View style={[styles.billIconBox, { backgroundColor: isDueSoon ? '#FFF8EA' : COLORS.surfaceContainerLow }]}>
                      <Icon name={bill.icon} size={20} color={isDueSoon ? '#B27B00' : COLORS.primary} />
                    </View>
                    <View style={styles.billMeta}>
                      <Text style={styles.billName}>{bill.name}</Text>
                      <View style={styles.billDueRow}>
                        {isDueSoon && (
                          <Icon name="warning" size={12} color="#B27B00" style={{ marginRight: 4 }} />
                        )}
                        <Text style={[styles.billDue, isDueSoon && { color: '#B27B00', fontWeight: '600' }]}>{bill.dueIn}</Text>
                      </View>
                    </View>
                    <Text style={styles.billAmount}>{formatCurrency(bill.amount, currencySymbol)}</Text>
                  </Card>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* 5. Recent Transactions */}
        <View style={styles.section}>
          <SectionHeader
            title="Recent Transactions"
            subtitle="Your latest activity"
            icon="receipt"
            actionLabel="View all"
            onAction={() => router.push('/transactions')}
          />
          {recentTransactions.length === 0 ? (
            <Card style={styles.emptyTransactionsCard}>
              <Icon name="receipt" size={32} color={COLORS.textSecondary} style={{ marginBottom: SPACING.xs }} />
              <Text style={styles.emptyTransactionsTitle}>No recent transactions</Text>
              <Text style={styles.emptyTransactionsSub}>Your latest income and expenses will appear here.</Text>
              <TouchableOpacity
                style={styles.emptyTransactionsBtn}
                onPress={() => router.push('/transactions?openForm=true')}
                accessibilityRole="button"
                accessibilityLabel="Add Transaction"
              >
                <Text style={styles.emptyTransactionsBtnText}>+ Add Transaction</Text>
              </TouchableOpacity>
            </Card>
          ) : (
            <Card style={styles.transactionsCard}>
              {recentTransactions.slice(0, 3).map((tx, index) => (
                <Animated.View key={tx.id} entering={FadeInUp.duration(400).delay(400 + index * 60)}>
                  <TouchableOpacity
                    style={[
                      styles.txRow,
                      index < Math.min(recentTransactions.length, 3) - 1 && styles.txDivider,
                    ]}
                    onPress={() => router.push('/transactions')}
                    accessibilityRole="button"
                  >
                    <View style={[styles.txIconBox, { backgroundColor: `${COLORS.primary}15` }]}>
                      <Icon name={tx.icon} size={20} color={COLORS.primary} />
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
          )}
        </View>

        {/* 6. Spending Trends Chart */}
        <View style={styles.section}>
          <SectionHeader
            title="Spending Trends"
            subtitle="Monthly income vs expenses"
            icon="trending-up"
          />
          <SpendingTrendsChart currencySymbol={currencySymbol} />
        </View>

        {/* 7. Financial Literacy Card */}
        <Animated.View entering={FadeInUp.duration(500).delay(700)}>
          <Card style={styles.literacyCard}>
            <Text style={styles.literacyLabel}>Financial Literacy</Text>
            <Text style={styles.literacyTitle}>Master the 50/30/20 budget rule</Text>
            <TouchableOpacity style={styles.literacyAction} accessibilityRole="button" accessibilityLabel="Learn More">
              <Text style={styles.literacyActionText}>Learn More</Text>
              <Icon name="arrow-forward" size={16} color={COLORS.onPrimaryContainer} />
            </TouchableOpacity>
          </Card>
        </Animated.View>

        {/* Bottom spacer - to avoid clipping under floating tabs bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Slide-out Sidebar Drawer Modal */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.backdrop} onPress={() => setIsMenuVisible(false)} />
          
          <Animated.View 
            entering={SlideInLeft.duration(300)} 
            exiting={SlideOutLeft.duration(250)} 
            style={styles.drawerPanel}
          >
            <View style={styles.drawerHeader}>
              <View style={styles.drawerLogoRow}>
                <View style={styles.drawerLogoBadge}>
                  <Text style={styles.drawerLogoText}>FP</Text>
                </View>
                <Text style={styles.drawerBrandName}>FinPath</Text>
              </View>
              <TouchableOpacity onPress={() => setIsMenuVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.drawerScroll} contentContainerStyle={styles.drawerContent}>
              <Text style={styles.drawerUserEmail}>
                {user?.email ? `Logged in: ${user.email}` : 'Guest Mode'}
              </Text>
              
              <View style={styles.drawerDivider} />

              <TouchableOpacity style={styles.drawerLink} onPress={() => { setIsMenuVisible(false); router.push('/dashboard'); }}>
                <Ionicons name="home-outline" size={20} color={COLORS.primary} />
                <Text style={styles.drawerLinkText}>Home Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerLink} onPress={() => { setIsMenuVisible(false); router.push('/goals'); }}>
                <Ionicons name="trophy-outline" size={20} color={COLORS.primary} />
                <Text style={styles.drawerLinkText}>Goals & Expenses</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerLink} onPress={() => { setIsMenuVisible(false); router.push('/debts'); }}>
                <Ionicons name="card-outline" size={20} color={COLORS.primary} />
                <Text style={styles.drawerLinkText}>Debt Tracker</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerLink} onPress={() => { setIsMenuVisible(false); router.push('/plan'); }}>
                <Ionicons name="analytics-outline" size={20} color={COLORS.primary} />
                <Text style={styles.drawerLinkText}>Monthly Plan</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerLink} onPress={() => { setIsMenuVisible(false); router.push('/profile'); }}>
                <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                <Text style={styles.drawerLinkText}>Profile & Settings</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.drawerFooter}>
              {user ? (
                <TouchableOpacity
                  style={styles.drawerLogoutBtn}
                  onPress={async () => {
                    setIsMenuVisible(false);
                    await signOut();
                    resetOnboarding();
                    router.replace('/auth');
                  }}
                >
                  <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
                  <Text style={styles.drawerLogoutText}>Sign Out</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.drawerLoginBtn}
                  onPress={() => {
                    setIsMenuVisible(false);
                    router.replace('/auth');
                  }}
                >
                  <Ionicons name="log-in-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.drawerLoginText}>Sign In / Register</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.drawerVersion}>v1.0.0 (Premium)</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
    marginBottom: SPACING.xs,
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
    marginTop: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionAction: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  transactionsCard: {
    padding: SPACING.md,
    gap: SPACING.xs,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
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
    width: 40,
    height: 40,
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
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
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
    backgroundColor: COLORS.surfaceContainerLowest,
    borderColor: COLORS.outlineVariant,
    borderWidth: 1,
    overflow: 'hidden',
  },
  billAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
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
  // Chart styles
  chartContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  chartTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.primary,
    fontSize: 14,
    marginBottom: 4,
  },
  chartSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: SPACING.sm,
  },
  emptyState: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    ...SHADOWS.sm,
  },
  tooltipMonth: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 2,
  },
  tooltipAmount: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  zeroLineLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  zeroLineText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginHorizontal: 4,
  },
  // Sidebar Drawer styles
  menuIconButton: {
    padding: SPACING.xs,
    marginRight: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 30, 61, 0.4)',
  },
  drawerPanel: {
    width: 280,
    height: '100%',
    backgroundColor: COLORS.surface,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 30,
    borderTopRightRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    ...SHADOWS.lg,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  drawerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  drawerLogoBadge: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerLogoText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
  drawerBrandName: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  drawerScroll: {
    flex: 1,
  },
  drawerContent: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  drawerUserEmail: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
  },
  drawerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },
  drawerLinkText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  drawerFooter: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    gap: SPACING.sm,
  },
  drawerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  drawerLogoutText: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.error,
    fontSize: 14,
  },
  drawerLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  drawerLoginText: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.primary,
    fontSize: 14,
  },
  drawerVersion: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: SPACING.xs,
  },
  goalAmountsRow: {
    marginTop: 4,
    marginBottom: SPACING.xs,
  },
  goalSavedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  aiFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.xs,
  },
  aiActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  aiActionText: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '700',
  },
  billDueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  emptyTransactionsCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.xs,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  emptyTransactionsTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  emptyTransactionsSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  emptyTransactionsBtn: {
    backgroundColor: COLORS.secondaryFixed,
    paddingVertical: 10,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTransactionsBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSecondaryFixed,
    fontWeight: '700',
  },
  insightCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundImage: 'linear-gradient(#EAF8EF, #EAF8EF), linear-gradient(135deg, #071e3d, #48C774)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  insightTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  insightIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  insightActionText: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '700',
  },
  insightDescription: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  insightHighlight: {
    fontWeight: '700',
  },
});