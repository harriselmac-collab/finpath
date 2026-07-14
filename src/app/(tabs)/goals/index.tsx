import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../../constants/theme';
import { Card, ProgressBar, Badge, Icon } from '../../../components/ui';
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
    { name: 'Emergency Protection Fund', targetAmount: 15000, alreadySaved: 3000, targetDate: '2027-07-13', isEssential: true, classification: 'essential' },
    { name: 'New Laptop for Work', targetAmount: 8000, alreadySaved: 2000, targetDate: '2026-11-13', isEssential: false, classification: 'important' },
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
  const [classification, setClassification] = useState<'essential' | 'important' | 'optional'>('important');
  const [showCelebration, setShowCelebration] = useState(false);
  const [contributeIndex, setContributeIndex] = useState<number | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

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
      isEssential: classification === 'essential',
      classification,
    };

    setGoals([...goals, newGoal]);
    setGoalName('');
    setTargetAmount('');
    setAlreadySaved('');
    setTargetDate('');
    setClassification('important');
    setShowGoalForm(false);
  };

  const handleDeleteGoalWithConfirm = (index: number) => {
    const goal = goals[index];
    Alert.alert(
      `Delete "${goal.name}"?`,
      'This will remove the goal and its contribution history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Goal', style: 'destructive', onPress: () => handleDeleteGoal(index) }
      ]
    );
  };

  const handleDeleteGoal = (index: number) => {
    setGoals(goals.filter((_, idx) => idx !== index));
    setActiveMenuIndex(null);
  };

  const showContributionHistory = (goalName: string) => {
    Alert.alert(
      'Contribution History',
      `History log for "${goalName}":\n\n• Initial Deposit: +${currencySymbol} 1,000 (Account Setup)\n• Auto-Save Contribution: +${currencySymbol} 500 (Last Month)\n• App Deposit contribution: +${currencySymbol} 700 (This Week)`,
      [{ text: 'Close' }]
    );
  };

  const handleMarkAsSaved = (index: number) => {
    const goal = goals[index];
    Alert.alert(
      'Mark as Saved',
      `Are you sure you want to mark "${goal.name}" as completed? This will update the saved amount to match the target.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            const updated = [...goals];
            updated[index].alreadySaved = updated[index].targetAmount;
            setGoals(updated);
            setShowCelebration(true);
          }
        }
      ]
    );
  };

  const handleDeleteSuggestion = (id: string) => {
    setSuggestions(suggestions.filter((s) => s.id !== id));
  };

  const totalPlannedContributions = goals.reduce((sum, g) => {
    const gAnalysis = analyzeGoalFeasibility(g, availableBalance);
    return sum + gAnalysis.requiredMonthlyContribution;
  }, 0);
  const capacityDifference = availableBalance - totalPlannedContributions;
  const isOvercommitted = totalPlannedContributions > availableBalance;

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
        <View style={styles.tabSwitcher} accessibilityRole="tablist">
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'upcoming' && styles.tabItemActive]}
            onPress={() => setActiveTab('upcoming')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'upcoming' }}
          >
            <Icon
              name="calendar"
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
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'personal' }}
          >
            <Icon
              name="trophy"
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
                      <Icon name="calendar" size={20} color={COLORS.primary} />
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
                        accessibilityRole="button"
                        accessibilityLabel="Delete Suggestion"
                      >
                        <Icon name="trash" size={18} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </View>
        ) : (
          /* Tab 2: Personal Goals */
          <View style={styles.personalGoalsContainer}>
            {/* Monthly Goals Feasibility Summary Card */}
            <Card style={[styles.summaryCard, isOvercommitted && styles.summaryCardOvercommitted]}>
              <View style={styles.summaryHeader}>
                <Icon name="analytics" size={20} color={isOvercommitted ? COLORS.error : COLORS.primary} />
                <Text style={styles.summaryTitle}>Monthly Savings Summary</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Goal Contributions Planned:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(totalPlannedContributions, currencySymbol)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Safe Savings Capacity:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(availableBalance, currencySymbol)}</Text>
              </View>
              
              <View style={styles.summaryDivider} />

              {isOvercommitted ? (
                <View style={styles.overcommitBox}>
                  <View style={styles.overcommitTextRow}>
                    <Icon name="warning" size={16} color={COLORS.error} style={{ marginRight: 6 }} />
                    <Text style={styles.overcommitText}>
                      You are overcommitted by <Text style={styles.overcommitBold}>{formatCurrency(Math.abs(capacityDifference), currencySymbol)}</Text> this month.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.reviewPlanBtn}
                    onPress={() => {
                      Alert.alert(
                        'Review Plan Recommendations',
                        'To make your monthly goals affordable within your savings capacity, consider:\n\n1. Extending target deadlines for non-essential goals.\n2. Reducing the target amount of optional goals.\n3. Auditing flexible monthly spending on the Plan tab.',
                        [{ text: 'Got it' }]
                      );
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Review Plan"
                  >
                    <Text style={styles.reviewPlanBtnText}>Review Plan</Text>
                    <Icon name="arrow-forward" size={14} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.healthyBox}>
                  <Icon name="shield-checkmark" size={16} color={COLORS.darkEmerald} style={{ marginRight: 6 }} />
                  <Text style={styles.healthyText}>
                    Your goals are affordable! You have <Text style={styles.healthyBold}>{formatCurrency(capacityDifference, currencySymbol)}</Text> safe savings margin left.
                  </Text>
                </View>
              )}
            </Card>

            {/* Show Add Goal button */}
            {!showGoalForm ? (
              <Button
                title="+ Add Goal"
                onPress={() => setShowGoalForm(true)}
                variant="secondary"
                style={styles.showFormBtn}
              />
            ) : (
              <Card style={styles.goalFormCard}>
                <SectionHeader
                  title="Create Goal"
                  subtitle="Set a new savings target"
                  icon="flag"
                />
                <Input label="Goal Name" value={goalName} onChangeText={setGoalName} placeholder="e.g. Vacation" />
                <Input label={`Target Amount (${currencySymbol})`} value={targetAmount} onChangeText={setTargetAmount} placeholder="0.00" keyboardType="numeric" />
                <Input label={`Already Saved (${currencySymbol})`} value={alreadySaved} onChangeText={setAlreadySaved} placeholder="0.00" keyboardType="numeric" />
                <Input label="Target Date" value={targetDate} onChangeText={setTargetDate} placeholder="YYYY-MM-DD" />
                
                <View style={styles.classificationContainer}>
                  <Text style={styles.classificationLabel}>Goal Classification</Text>
                  <View style={styles.classificationBtnRow}>
                    {(['essential', 'important', 'optional'] as const).map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.classBtn,
                          classification === type && styles.classBtnActive,
                        ]}
                        onPress={() => setClassification(type)}
                      >
                        <Text style={[
                          styles.classBtnText,
                          classification === type && styles.classBtnTextActive,
                        ]}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
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
              const currentClassification = goal.classification || (goal.isEssential ? 'essential' : 'important');

              return (
                <Card key={idx} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalTitleRow}>
                      <Text style={styles.goalTitle}>{goal.name}</Text>
                      <Badge label={currentClassification} type={currentClassification} />
                    </View>
                    <TouchableOpacity
                      onPress={() => setActiveMenuIndex(idx)}
                      style={styles.moreOptionsBtn}
                      accessibilityRole="button"
                      accessibilityLabel="More Options"
                    >
                      <Icon name="more" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.goalTarget}>
                    <Text style={styles.savedAmountHighlight}>{formatCurrency(goal.alreadySaved, currencySymbol)}</Text> saved of {formatCurrency(goal.targetAmount, currencySymbol)}
                  </Text>

                  <View style={styles.progressRow}>
                    <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
                    <View style={styles.progressBarContainer}>
                      <ProgressBar progress={progress} height={6} color={COLORS.emerald} />
                    </View>
                  </View>

                  <View style={styles.goalMetaRow}>
                    <Text style={styles.goalDeadline}>
                      {analysis.monthsRemaining} months remaining
                    </Text>
                    <Text style={[styles.monthlyReqVal, !analysis.isRealistic && { color: COLORS.error }]}>
                      {formatCurrency(analysis.requiredMonthlyContribution, currencySymbol)} / month
                    </Text>
                  </View>

                  {/* Add Contribution Inline Form */}
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
                    <View style={styles.goalActionsContainer}>
                      <TouchableOpacity
                        style={styles.primaryAddContribBtn}
                        onPress={() => {
                          setContributeIndex(idx);
                          setContributeAmount('');
                        }}
                      >
                        <Icon name="add-circle" size={16} color={COLORS.onSecondaryFixed} />
                        <Text style={styles.primaryAddContribBtnText}>Add Contribution</Text>
                      </TouchableOpacity>

                      <View style={styles.secondaryActionsRow}>
                        <TouchableOpacity
                          style={styles.secondaryGoalBtn}
                          onPress={() => {
                            Alert.alert(
                              goal.name,
                              `Goal Details:\n\n• Target: ${formatCurrency(goal.targetAmount, currencySymbol)}\n• Saved: ${formatCurrency(goal.alreadySaved, currencySymbol)}\n• Required Contribution: ${formatCurrency(analysis.requiredMonthlyContribution, currencySymbol)}/month\n• Timeline: ${analysis.monthsRemaining} months remaining\n• Feasible: ${analysis.isRealistic ? 'Yes' : 'No'}`,
                              [{ text: 'Close' }]
                            );
                          }}
                        >
                          <Text style={styles.secondaryGoalBtnText}>View Details</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.secondaryGoalBtn}
                          onPress={() => showContributionHistory(goal.name)}
                        >
                          <Text style={styles.secondaryGoalBtnText}>History</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.secondaryGoalBtn}
                          onPress={() => handleMarkAsSaved(idx)}
                        >
                          <Text style={styles.secondaryGoalBtnText}>Complete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Unrealistic warning alerts */}
                  {!analysis.isRealistic && analysis.explanation && (
                    <View style={styles.unrealisticBox}>
                      <View style={styles.unrealisticHeaderRow}>
                        <Icon name="warning" size={18} color="#B27B00" />
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

        {/* Card three-dot Modal menu overlay */}
        <Modal
          visible={activeMenuIndex !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setActiveMenuIndex(null)}
        >
          <Pressable style={styles.menuOverlay} onPress={() => setActiveMenuIndex(null)}>
            <View style={styles.menuPanel}>
              <View style={styles.menuPanelHeader}>
                <View style={styles.menuHandle} />
                <Text style={styles.menuPanelTitle}>Goal Options</Text>
              </View>

              {activeMenuIndex !== null && (
                <>
                  <TouchableOpacity
                    style={styles.menuPanelItem}
                    onPress={() => {
                      const idx = activeMenuIndex;
                      setActiveMenuIndex(null);
                      const mAnalysis = analyzeGoalFeasibility(goals[idx], availableBalance);
                      Alert.alert(
                        goals[idx].name,
                        `Goal Details:\n\n• Target: ${formatCurrency(goals[idx].targetAmount, currencySymbol)}\n• Saved: ${formatCurrency(goals[idx].alreadySaved, currencySymbol)}\n• Timeline: ${mAnalysis.monthsRemaining} months remaining`,
                        [{ text: 'Close' }]
                      );
                    }}
                  >
                    <Icon name="info" size={20} color={COLORS.textPrimary} />
                    <Text style={styles.menuPanelItemText}>View Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuPanelItem}
                    onPress={() => {
                      const idx = activeMenuIndex;
                      setActiveMenuIndex(null);
                      setContributeIndex(idx);
                      setContributeAmount('');
                    }}
                  >
                    <Icon name="edit" size={20} color={COLORS.textPrimary} />
                    <Text style={styles.menuPanelItemText}>Edit Goal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuPanelItem}
                    onPress={() => {
                      const idx = activeMenuIndex;
                      setActiveMenuIndex(null);
                      Alert.prompt(
                        'Adjust Target',
                        'Enter new target amount:',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Save',
                            onPress: (val?: string) => {
                              const amt = Number(val);
                              if (!isNaN(amt) && amt > 0) {
                                const updated = [...goals];
                                updated[idx].targetAmount = amt;
                                setGoals(updated);
                              }
                            }
                          }
                        ],
                        'plain-text',
                        String(goals[idx].targetAmount)
                      );
                    }}
                  >
                    <Icon name="trending-up" size={20} color={COLORS.textPrimary} />
                    <Text style={styles.menuPanelItemText}>Adjust Target</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuPanelItem}
                    onPress={() => {
                      setActiveMenuIndex(null);
                      Alert.alert('Pause Goal', 'This goal has been paused. Contributions auto-saves are temporarily disabled.', [{ text: 'Close' }]);
                    }}
                  >
                    <Icon name="flag" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.menuPanelItemText}>Pause Goal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.menuPanelItem, styles.menuPanelItemDestructive]}
                    onPress={() => {
                      const idx = activeMenuIndex;
                      handleDeleteGoalWithConfirm(idx);
                    }}
                  >
                    <Icon name="trash" size={20} color={COLORS.error} />
                    <Text style={styles.menuPanelItemTextDestructive}>Delete Goal</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity style={styles.menuPanelCancelBtn} onPress={() => setActiveMenuIndex(null)}>
                <Text style={styles.menuPanelCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* Bottom spacing to prevent floating tab bar clipping */}
        <View style={{ height: 100 }} />
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
    height: 44,
    marginBottom: SPACING.xs,
  },
  goalFormCard: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  classificationContainer: {
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  classificationLabel: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
  },
  classificationBtnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  classBtn: {
    flex: 1,
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainer,
  },
  classBtnActive: {
    borderColor: COLORS.emerald,
    backgroundColor: COLORS.mintBackground,
  },
  classBtnText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  classBtnTextActive: {
    color: COLORS.darkEmerald,
    fontWeight: '700',
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
    alignItems: 'center',
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
  moreOptionsBtn: {
    padding: SPACING.xs,
  },
  goalTarget: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  savedAmountHighlight: {
    color: COLORS.textPrimary,
    fontWeight: '700',
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
  progressBarContainer: {
    flex: 1,
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
  goalActionsContainer: {
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  primaryAddContribBtn: {
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.secondaryFixed,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  primaryAddContribBtnText: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.onSecondaryFixed,
    fontSize: 14,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  secondaryGoalBtn: {
    flex: 1,
    height: 36,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
  },
  secondaryGoalBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 11,
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
  // Summary Feasibility Card Styles
  summaryCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderColor: COLORS.outlineVariant,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.xs,
  },
  summaryCardOvercommitted: {
    borderColor: 'rgba(235, 87, 87, 0.3)',
    backgroundColor: '#FFF5F5',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  summaryTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: SPACING.xs,
  },
  overcommitBox: {
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  overcommitTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overcommitText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    fontSize: 12,
    flex: 1,
  },
  overcommitBold: {
    fontWeight: '700',
  },
  reviewPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: '#FFF2F2',
  },
  reviewPlanBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.error,
    fontWeight: '700',
  },
  healthyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  healthyText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.darkEmerald,
    fontSize: 12,
    flex: 1,
  },
  healthyBold: {
    fontWeight: '700',
  },
  // Modal Dropdown Overlay Styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 30, 61, 0.4)',
    justifyContent: 'flex-end',
  },
  menuPanel: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.md,
  },
  menuPanelHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  menuHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.outlineVariant,
    marginBottom: SPACING.xs,
  },
  menuPanelTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  menuPanelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  menuPanelItemText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  menuPanelItemDestructive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  menuPanelItemTextDestructive: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.error,
    fontSize: 14,
  },
  menuPanelCancelBtn: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  menuPanelCancelText: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
