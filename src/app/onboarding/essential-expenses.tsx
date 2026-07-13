import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, FadeOut, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useOnboardingStore } from '../../store/onboardingStore';

interface EssentialExpenseItem {
  id: string;
  category: string;
  name: string;
  amount: number;
  isEssential: boolean;
}

export default function EssentialExpensesReviewScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { answers, debts, setOnboardingCompleted } = useOnboardingStore();

  const [expenses, setExpenses] = useState<EssentialExpenseItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  // Adder form fields
  const [showAdder, setShowAdder] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Groceries');
  const [newAmount, setNewAmount] = useState('');
  const [newIsEssential, setNewIsEssential] = useState(true);

  const currencySymbol = answers['currency'] || 'MAD';

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Populate default list of essential expenses based on onboarding answers
    const list: EssentialExpenseItem[] = [];

    // 1. Housing
    if (answers['housingAmount']) {
      list.push({
        id: 'housing',
        category: 'Housing',
        name: answers['hasRent'] ? 'Rent' : 'Mortgage',
        amount: Number(answers['housingAmount']),
        isEssential: true,
      });
    }

    // 2. Utilities
    if (answers['electricity']) {
      list.push({
        id: 'electricity',
        category: 'Utilities',
        name: 'Electricity',
        amount: Number(answers['electricity']),
        isEssential: true,
      });
    }
    if (answers['water']) {
      list.push({
        id: 'water',
        category: 'Utilities',
        name: 'Water',
        amount: Number(answers['water']),
        isEssential: true,
      });
    }
    if (answers['internet']) {
      list.push({
        id: 'internet',
        category: 'Utilities',
        name: 'Internet',
        amount: Number(answers['internet']),
        isEssential: true,
      });
    }
    if (answers['phone']) {
      list.push({
        id: 'phone',
        category: 'Utilities',
        name: 'Phone',
        amount: Number(answers['phone']),
        isEssential: true,
      });
    }

    // 3. Groceries
    if (answers['groceries']) {
      list.push({
        id: 'groceries',
        category: 'Groceries',
        name: 'Groceries',
        amount: Number(answers['groceries']),
        isEssential: true,
      });
    }

    // 4. Healthcare
    if (answers['medicationExpenses']) {
      list.push({
        id: 'medication',
        category: 'Healthcare',
        name: 'Medication',
        amount: Number(answers['medicationExpenses']),
        isEssential: true,
      });
    }
    if (answers['healthInsurance']) {
      list.push({
        id: 'healthInsurance',
        category: 'Healthcare',
        name: 'Health Insurance',
        amount: Number(answers['healthInsurance']),
        isEssential: true,
      });
    }
    if (answers['medicalAppointments']) {
      list.push({
        id: 'medicalAppointments',
        category: 'Healthcare',
        name: 'Medical Appointments',
        amount: Number(answers['medicalAppointments']),
        isEssential: true,
      });
    }

    // 5. Family Support
    if (answers['schoolFees']) {
      list.push({
        id: 'schoolFees',
        category: 'Family',
        name: 'School Fees',
        amount: Number(answers['schoolFees']),
        isEssential: true,
      });
    }
    if (answers['childcareExpenses']) {
      list.push({
        id: 'childcare',
        category: 'Family',
        name: 'Childcare',
        amount: Number(answers['childcareExpenses']),
        isEssential: true,
      });
    }

    // 6. Vehicle
    if (answers['vehiclePayment']) {
      list.push({
        id: 'vehicleLoan',
        category: 'Vehicle',
        name: 'Car Loan Payment',
        amount: Number(answers['vehiclePayment']),
        isEssential: true,
      });
    }
    if (answers['fuelSpending']) {
      list.push({
        id: 'fuel',
        category: 'Vehicle',
        name: 'Fuel',
        amount: Number(answers['fuelSpending']),
        isEssential: true,
      });
    }

    // 7. Minimum debt payments
    if (debts && debts.length > 0) {
      const totalMinDebts = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
      if (totalMinDebts > 0) {
        list.push({
          id: 'debtsMinimum',
          category: 'Debts',
          name: 'Minimum Debt Payments',
          amount: totalMinDebts,
          isEssential: true,
        });
      }
    }

    setExpenses(list);
  }, [answers, debts]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Actions
  const handleEdit = (id: string, currentAmount: number) => {
    setEditingId(id);
    setEditAmount(currentAmount.toString());
  };

  const handleSaveEdit = (id: string) => {
    const amt = Number(editAmount);
    if (isNaN(amt) || amt < 0) {
      Alert.alert('Error', 'Please enter a valid positive number');
      return;
    }
    setExpenses(expenses.map((e) => (e.id === id ? { ...e, amount: amt } : e)));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const handleReclassify = (id: string) => {
    setExpenses(
      expenses.map((e) => (e.id === id ? { ...e, isEssential: !e.isEssential } : e))
    );
  };

  const handleAddExpense = () => {
    if (!newName || !newAmount) {
      Alert.alert('Error', 'Please enter name and amount');
      return;
    }
    const amt = Number(newAmount);
    if (isNaN(amt) || amt < 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const newItem: EssentialExpenseItem = {
      id: Math.random().toString(36).substr(2, 9),
      category: newCategory,
      name: newName,
      amount: amt,
      isEssential: newIsEssential,
    };

    setExpenses([...expenses, newItem]);
    setNewName('');
    setNewAmount('');
    setShowAdder(false);
  };

  const handleConfirmAll = () => {
    // In final stage, we save finalized essential expenses to the profile
    setOnboardingCompleted(true);
    router.replace('/dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('onboarding.essentialTitle')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.essentialSubtitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {expenses.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInUp.delay(index * 50).duration(400)}
            exiting={FadeOut.duration(250)}
            layout={LinearTransition}
          >
            <Card style={styles.expenseCard}>
              <View style={styles.row}>
                <View style={styles.meta}>
                  <Text style={styles.categoryLabel}>{item.category}</Text>
                  <Text style={styles.expenseName}>{item.name}</Text>
                </View>

                <View style={styles.amountSec}>
                  {editingId === item.id ? (
                    <View style={styles.inlineEdit}>
                      <TextInput
                        style={styles.editInput}
                        value={editAmount}
                        onChangeText={setEditAmount}
                        keyboardType="numeric"
                        autoFocus
                      />
                      <Button
                        title="✓"
                        onPress={() => handleSaveEdit(item.id)}
                        variant="text"
                        style={styles.checkBtn}
                      />
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => handleEdit(item.id, item.amount)}>
                      <Text style={styles.amountText}>
                        {currencySymbol} {item.amount} 📝
                      </Text>
                    </TouchableOpacity>
                  )}
                  <View
                    style={[
                      styles.badge,
                      item.isEssential ? styles.essentialBadge : styles.flexibleBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        item.isEssential ? styles.essentialBadgeText : styles.flexibleBadgeText,
                      ]}
                    >
                      {item.isEssential ? 'Essential' : 'Flexible'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardActions}>
                <Button
                  title={item.isEssential ? 'Make Flexible' : 'Make Essential'}
                  onPress={() => handleReclassify(item.id)}
                  variant="text"
                  textStyle={styles.actionBtnText}
                />
                <Button
                  title="Delete"
                  onPress={() => handleDelete(item.id)}
                  variant="text"
                  textStyle={styles.deleteBtnText}
                />
              </View>
            </Card>
          </Animated.View>
        ))}

        {/* Add custom expense button / drawer */}
        {!showAdder ? (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
            <Button
              title="+ Add Custom Expense"
              onPress={() => setShowAdder(true)}
              variant="secondary"
              style={styles.showAdderBtn}
            />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(300)} exiting={FadeOut.duration(150)}>
            <Card style={styles.adderForm}>
              <Text style={styles.adderTitle}>Add Custom Expense</Text>
              <Input label="Expense Name" value={newName} onChangeText={setNewName} placeholder="e.g. Water Filter" />
              <Input label="Category" value={newCategory} onChangeText={setNewCategory} placeholder="e.g. Groceries" />
              <Input label={`Amount (${currencySymbol})`} value={newAmount} onChangeText={setNewAmount} placeholder="0.00" keyboardType="numeric" />
              <View style={styles.yesNoContainer}>
                <TouchableOpacity
                  style={[styles.typeSelect, newIsEssential && styles.typeSelectActive]}
                  onPress={() => setNewIsEssential(true)}
                >
                  <Text style={[styles.typeText, newIsEssential && styles.typeTextActive]}>Essential</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeSelect, !newIsEssential && styles.typeSelectActive]}
                  onPress={() => setNewIsEssential(false)}
                >
                  <Text style={[styles.typeText, !newIsEssential && styles.typeTextActive]}>Flexible</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.adderButtons}>
                <Button title="Cancel" onPress={() => setShowAdder(false)} variant="text" />
                <Button title="Add" onPress={handleAddExpense} variant="primary" style={styles.addBtn} />
              </View>
            </Card>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Confirm & Generate Plan"
          onPress={handleConfirmAll}
          variant="primary"
          style={styles.confirmBtn}
        />
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmBackground,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  expenseCard: {
    padding: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    flex: 1,
  },
  categoryLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expenseName: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.primary,
    fontSize: 16,
    marginTop: 2,
  },
  amountSec: {
    alignItems: 'flex-end',
  },
  amountText: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
  },
  inlineEdit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.xs,
    paddingHorizontal: SPACING.xs,
    height: 32,
    width: 80,
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
  },
  checkBtn: {
    height: 32,
    paddingHorizontal: SPACING.xs,
  },
  badge: {
    borderRadius: RADIUS.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    marginTop: 4,
  },
  essentialBadge: {
    backgroundColor: COLORS.mintBackground,
  },
  flexibleBadge: {
    backgroundColor: COLORS.border,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  essentialBadgeText: {
    color: COLORS.darkEmerald,
  },
  flexibleBadgeText: {
    color: COLORS.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.xs,
  },
  actionBtnText: {
    color: COLORS.secondary,
    fontSize: 12,
  },
  deleteBtnText: {
    color: COLORS.error,
    fontSize: 12,
  },
  showAdderBtn: {
    marginTop: SPACING.sm,
  },
  adderForm: {
    gap: SPACING.sm,
  },
  adderTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.primary,
  },
  yesNoContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  typeSelect: {
    flex: 1,
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeSelectActive: {
    borderColor: COLORS.emerald,
    backgroundColor: COLORS.mintBackground,
  },
  typeText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
  },
  typeTextActive: {
    color: COLORS.darkEmerald,
    fontWeight: '600',
  },
  adderButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  addBtn: {
    height: 36,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  confirmBtn: {
    width: '100%',
  },
});
