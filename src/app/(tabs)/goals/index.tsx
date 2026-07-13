import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../../constants/theme';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { calculateFinancialProfile } from '../../../features/financial-engine/engine';
import { analyzeGoalFeasibility, GoalInput } from '../../../features/financial-engine/goalCalculations';
import { formatCurrency } from '../../../utils/currency';
import { CelebrationOverlay } from '../../../components/ui/CelebrationOverlay';

interface UpcomingSuggestion {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
}

export default function GoalsScreen() {
  const { answers, debts } = useOnboardingStore();
  const currencySymbol = answers['currency'] || 'MAD';

  const profile = calculateFinancialProfile({ answers, debts });
  const availableBalance = profile.realAvailableMonthlyBalance;

  const [activeTab, setActiveTab] = useState<'upcoming' | 'personal'>('upcoming');

  const [goals, setGoals] = useState<GoalInput[]>([
    { name: 'Emergency Protection Fund', targetAmount: 15000, alreadySaved: 3000, targetDate: '2027-07-13', isEssential: true },
    { name: 'New Laptop for Work', targetAmount: 8000, alreadySaved: 2000, targetDate: '2026-11-13', isEssential: false },
  ]);

  const [suggestions, setSuggestions] = useState<UpcomingSuggestion[]>([]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const list: UpcomingSuggestion[] = [];
    if (answers.hasVehicle === 'yes' && answers.vehicleInsurance === true) {
      list.push({
        id: '1',
        name: 'Annual Vehicle Insurance Premium',
        amount: Number(answers.insuranceAmount || 2400),
        dueDate: answers.insuranceDate || '2026-11-13',
        category: 'Vehicle',
      });
    }

    if (answers.hasVehicle === 'yes' && answers.roadTax === true) {
      list.push({
        id: '2',
        name: 'Annual Road Tax / Vignette',
        amount: Number(answers.taxAmount || 700),
        dueDate: '2027-01-20',
        category: 'Vehicle',
      });
    }

    if (answers.culturalPref === 'muslim') {
      list.push({
        id: '3',
        name: 'Ramadan Preparation & Feast',
        amount: 1500,
        dueDate: '2027-03-01',
        category: 'Cultural',
      });
      list.push({
        id: '4',
        name: 'Eid al-Adha Sheep Purchase',
        amount: 3000,
        dueDate: '2027-05-15',
        category: 'Cultural',
      });
    }

    setSuggestions(list);
  }, [answers]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [alreadySaved, setAlreadySaved] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isEssential, setIsEssential] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [contributeIndex, setContributeIndex] = useState<number | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');

  const handleContribute = (index: number) => {
    const amt = Number(contributeAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const updated = [...goals];
    const target = updated[index];
    const oldSaved = target.alreadySaved;
    target.alreadySaved = oldSaved + amt;

    setGoals(updated);
    setContributeIndex(null);
    setContributeAmount('');

    if (target.alreadySaved >= target.targetAmount && oldSaved < target.targetAmount) {
      setShowCelebration(true);
    }
  };

  const handleAddGoal = () => {
    if (!goalName || !targetAmount || !targetDate) {
      Alert.alert('Error', 'Please fill in Name, Target, and Date');
      return;
    }
    const targetAmt = Number(targetAmount);
    const savedAmt = Number(alreadySaved || 0);

    if (isNaN(targetAmt) || targetAmt <= 0 || isNaN(savedAmt) || savedAmt < 0) {
      Alert.alert('Error', 'Amounts must be valid positive numbers');
      return;
    }

    const newGoal: GoalInput = {
      name: goalName,
      targetAmount: targetAmt,
      alreadySaved: savedAmt,
      targetDate,
      isEssential,
    };

    setGoals([...goals, newGoal]);
    setGoalName('');
    setTargetAmount('');
    setAlreadySaved('');
    setTargetDate('');
    setShowGoalForm(false);
  };

  const handleDeleteGoal = (index: number) => {
    setGoals(goals.filter((_, idx) => idx !== index));
  };

  const handleDeleteSuggestion = (id: string) => {
    setSuggestions(suggestions.filter((s) => s.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Goals & Expenses</Text>
            <Text style={styles.subtitle}>Set targets and prepare for annual cycles</Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'upcoming' && styles.tabItemActive]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={activeTab === 'upcoming' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'personal' && styles.tabItemActive]}
            onPress={() => setActiveTab('personal')}
          >
            <Ionicons
              name="trophy-outline"
              size={18}
              color={activeTab === 'personal' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'personal' && styles.tabTextActive]}>
              Personal Goals
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'upcoming' ? (
          /* Tab 1: Upcoming Expenses Suggestions */
          <View style={styles.suggestionsContainer}>
            {suggestions.length === 0 ? (
              <EmptyState
                icon="calendar-outline"
                title="No upcoming expenses"
                description="We'll suggest annual cycles based on your profile."
              />
            ) : (
              suggestions.map((item) => (
                <Card key={item.id} style={styles.suggestionCard}>
                  <View style={styles.suggestionRow}>
                    <View style={[styles.suggestionIcon, { backgroundColor: COLORS.surfaceContainerLow }]}>
                      <Ionicons name="calendar" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.suggestionMeta}>
                      <Text style={styles.suggestionName}>{item.name}</Text>
                      <Text style={styles.suggestionDate}>Due: {item.dueDate}</Text>
                    </View>
                    <View style={styles.suggestionActions}>
                      <Text style={styles.suggestionAmount}>
                        {formatCurrency(item.amount, currencySymbol)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteSuggestion(item.id)}
                        style={styles.deleteBtn}
                      >
                        <Ionicons name="trash-outline" size={18} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </View>
        ) : (
          /* Tab 2: Personal Goals Feasibility Check */
          <View style={styles.personalGoalsContainer}>
            {/* Show Add Goal button */}
            {!showGoalForm ? (
              <Button
                title="+ Add New Savings Goal"
                onPress={() => setShowGoalForm(true)}
                variant="secondary"
                style={styles.showFormBtn}
              />
            ) : (
              <Card style={styles.goalFormCard}>
                <SectionHeader
                  title="Create Goal"
                  subtitle="Set a new savings target"
                  icon="flag-outline"
                />
                <Input label="Goal Name" value={goalName} onChangeText={setGoalName} placeholder="e.g. Vacation" />
                <Input label={`Target Amount (${currencySymbol})`} value={targetAmount} onChangeText={setTargetAmount} placeholder="0.00" keyboardType="numeric" />
                <Input label={`Already Saved (${currencySymbol})`} value={alreadySaved} onChangeText={setAlreadySaved} placeholder="0.00" keyboardType="numeric" />
                <Input label="Target Date" value={targetDate} onChangeText={setTargetDate} placeholder="YYYY-MM-DD" />
                
                <View style={styles.yesNoContainer}>
                  <Text style={styles.essentialLabel}>Is this goal essential?</Text>
                  <View style={styles.yesNoBtnRow}>
                    <TouchableOpacity
                      style={[styles.yesNoBtn, isEssential && styles.yesNoBtnActive]}
                      onPress={() => setIsEssential(true)}
                    >
                      <Text style={[styles.yesNoBtnText, isEssential && styles.yesNoBtnTextActive]}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.yesNoBtn, !isEssential && styles.yesNoBtnActive]}
                      onPress={() => setIsEssential(false)}
                    >
                      <Text style={[styles.yesNoBtnText, !isEssential && styles.yesNoBtnTextActive]}>No</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formActions}>
                  <Button title="Cancel" onPress={() => setShowGoalForm(false)} variant="text" />
                  <Button title="Save Goal" onPress={handleAddGoal} variant="primary" style={styles.saveGoalBtn} />
                </View>
              </Card>
            )}

            {/* Render goals list */}
            {goals.map((goal, idx) => {
              const analysis = analyzeGoalFeasibility(goal, availableBalance);
              const progress = goal.targetAmount > 0 ? goal.alreadySaved / goal.targetAmount : 0;

              return (
                <Card key={idx} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalTitleRow}>
                      <Text style={styles.goalTitle}>{goal.name}</Text>
                      {goal.isEssential && (
                        <View style={styles.essentialBadge}>
                          <Text style={styles.essentialBadgeText}>Essential</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteGoal(idx)} style={styles.deleteGoalBtn}>
                      <Ionicons name="trash-outline" size={18} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.goalTarget}>
                    {formatCurrency(goal.alreadySaved, currencySymbol)} of {formatCurrency(goal.targetAmount, currencySymbol)}
                  </Text>

                  <View style={styles.progressRow}>
                    <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
                    <View style={styles.progressBarWrapper}>
                      <View style={[styles.progressBarFill, { width: `${Math.min(Math.round(progress * 100), 100)}%` }]} />
                    </View>
                  </View>

                  <View style={styles.goalMetaRow}>
                    <Text style={styles.goalDeadline}>
                      {analysis.monthsRemaining} months left
                    </Text>
                    <Text style={[styles.monthlyReqVal, !analysis.isRealistic && { color: COLORS.error }]}>
                      {formatCurrency(analysis.requiredMonthlyContribution, currencySymbol)} / month
                    </Text>
                  </View>

                  {/* Add Funds / Contribution Form */}
                  {contributeIndex === idx ? (
                    <View style={styles.contributeInlineRow}>
                      <Input
                        value={contributeAmount}
                        onChangeText={setContributeAmount}
                        placeholder="Amount"
                        keyboardType="numeric"
                        containerStyle={styles.contributeInput}
                      />
                      <Button title="Save" onPress={() => handleContribute(idx)} variant="primary" style={styles.contributeBtn} />
                      <Button title="Cancel" onPress={() => setContributeIndex(null)} variant="text" />
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addFundsBtn}
                      onPress={() => {
                        setContributeIndex(idx);
                        setContributeAmount('');
                      }}
                    >
                      <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
                      <Text style={styles.addFundsBtnText}>Add Funds</Text>
                    </TouchableOpacity>
                  )}

                  {/* Warning and suggestions if unrealistic */}
                  {!analysis.isRealistic && analysis.explanation && (
                    <View style={styles.unrealisticBox}>
                      <View style={styles.unrealisticHeaderRow}>
                        <Ionicons name="warning-outline" size={18} color="#B27B00" />
                        <Text style={styles.unrealisticHeader}>Target is Unrealistic</Text>
                      </View>
                      <Text style={styles.unrealisticText}>{analysis.explanation}</Text>
                      <View style={styles.unrealisticDivider} />
                      <Text style={styles.suggestionsTitle}>Suggested Adjustments:</Text>
                      {analysis.suggestions.map((s, i) => (
                        <Text key={i} style={styles.suggestionText}>
                          - {s.text}
                        </Text>
                      ))}
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
      <CelebrationOverlay active={showCelebration} onComplete={() => setShowCelebration(false)} />
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
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: RADIUS.md,
    padding: 4,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  tabItemActive: {
    backgroundColor: COLORS.surfaceContainerLowest,
    ...SHADOWS.sm,
  },
  tabText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  suggestionsContainer: {
    gap: SPACING.sm,
  },
  suggestionCard: {
    padding: SPACING.md,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  suggestionIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionMeta: {
    flex: 1,
  },
  suggestionName: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  suggestionDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  suggestionActions: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  suggestionAmount: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  deleteBtn: {
    padding: SPACING.xs,
  },
  personalGoalsContainer: {
    gap: SPACING.md,
  },
  showFormBtn: {
    marginBottom: SPACING.xs,
  },
  goalFormCard: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  yesNoContainer: {
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  essentialLabel: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
  },
  yesNoBtnRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  yesNoBtn: {
    flex: 1,
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yesNoBtnActive: {
    borderColor: COLORS.emerald,
    backgroundColor: COLORS.mintBackground,
  },
  yesNoBtnText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
  },
  yesNoBtnTextActive: {
    color: COLORS.darkEmerald,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  saveGoalBtn: {
    height: 36,
  },
  goalCard: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  goalTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  essentialBadge: {
    backgroundColor: COLORS.mintBackground,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  essentialBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.darkEmerald,
    textTransform: 'uppercase',
  },
  deleteGoalBtn: {
    padding: SPACING.xs,
  },
  goalTarget: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  progressPct: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textPrimary,
    width: 32,
  },
  progressBarWrapper: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceContainerHigh,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.emerald,
    borderRadius: 3,
  },
  goalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalDeadline: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  monthlyReqVal: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  addFundsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.mintBackground,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.emerald,
  },
  addFundsBtnText: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.primary,
    fontSize: 13,
  },
  contributeInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    width: '100%',
  },
  contributeInput: {
    flex: 1,
    marginBottom: 0,
  },
  contributeBtn: {
    height: 48,
  },
  unrealisticBox: {
    backgroundColor: '#FFF8EA',
    borderWidth: 1,
    borderColor: COLORS.warning,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  unrealisticHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  unrealisticHeader: {
    ...TYPOGRAPHY.bodySemiBold,
    color: '#B27B00',
  },
  unrealisticText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  unrealisticDivider: {
    height: 1,
    backgroundColor: 'rgba(178, 123, 0, 0.15)',
    marginVertical: SPACING.xs,
  },
  suggestionsTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: '#B27B00',
    marginBottom: 2,
  },
  suggestionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    lineHeight: 16,
    marginTop: 2,
  },
});
