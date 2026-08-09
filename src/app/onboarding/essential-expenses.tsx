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
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  FadeInDown,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import AppText from '../../components/Text/AppText';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useSessionStore } from '../../store/sessionStore';
import { EXPENSE_REVIEW_VERSION } from '../../features/onboarding/quizFlow';
import { formatCurrency } from '../../utils/currency';

interface EssentialExpenseItem {
  id: string;
  category: string;
  name: string;
  amount: number;
  isEssential: boolean;
}

const PROTECTED_EXPENSE_IDS = new Set(['vehicleLoan', 'debtsMinimum']);

const DEFAULT_EXPENSE_LABEL_KEYS: Record<string, { category: string; name: string }> = {
  housing: { category: 'categoryHousing', name: 'mortgage' },
  electricity: { category: 'categoryUtilities', name: 'electricity' },
  water: { category: 'categoryUtilities', name: 'water' },
  internet: { category: 'categoryUtilities', name: 'internet' },
  phone: { category: 'categoryUtilities', name: 'phone' },
  groceries: { category: 'categoryGroceries', name: 'groceries' },
  medication: { category: 'categoryHealthcare', name: 'medication' },
  healthInsurance: { category: 'categoryHealthcare', name: 'healthInsurance' },
  medicalAppointments: { category: 'categoryHealthcare', name: 'medicalAppointments' },
  supportOtherHealthcare: { category: 'categoryHealthcare', name: 'otherHealthcareSupport' },
  schoolFees: { category: 'categoryFamily', name: 'schoolFees' },
  childcare: { category: 'categoryFamily', name: 'childcare' },
  vehicleLoan: { category: 'categoryVehicle', name: 'carLoanPayment' },
  fuel: { category: 'categoryVehicle', name: 'fuel' },
  vehicleMaintenance: { category: 'categoryVehicle', name: 'vehicleMaintenance' },
  debtsMinimum: { category: 'categoryDebts', name: 'minimumDebtPayments' },
  subscriptions: { category: 'categoryFlexible', name: 'subscriptions' },
  otherBills: { category: 'categoryFlexible', name: 'otherBills' },
};

const isEssentialExpenseItem = (value: unknown): value is EssentialExpenseItem => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'string'
    && typeof item.category === 'string'
    && typeof item.name === 'string'
    && typeof item.amount === 'number'
    && Number.isFinite(item.amount)
    && item.amount >= 0
    && typeof item.isEssential === 'boolean';
};

export default function EssentialExpensesReviewScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const { answers, debts, setAnswers, setOnboardingCompleted } = useOnboardingStore();

  const [expenses, setExpenses] = useState<EssentialExpenseItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  // Adder form fields
  const [showAdder, setShowAdder] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState(() => t('onboarding.essentialExpenses.categoryGroceries'));
  const [newAmount, setNewAmount] = useState('');
  const [newIsEssential, setNewIsEssential] = useState(true);

  const currencyCode = answers['currency'] || 'MAD';
  const locale = i18n.resolvedLanguage || i18n.language;

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (Array.isArray(answers.reviewedExpenses)) {
      const validExpenses = answers.reviewedExpenses.filter(isEssentialExpenseItem);
      if (validExpenses.length > 0 || answers.reviewedExpenses.length === 0) {
        setExpenses(validExpenses);
        return;
      }
    }

    // Populate default list of essential expenses based on onboarding answers
    const list: EssentialExpenseItem[] = [];

    // 1. Housing
    if (answers['housingAmount']) {
      list.push({
        id: 'housing',
        category: 'housing',
        name: 'housing',
        amount: Number(answers['housingAmount']),
        isEssential: true,
      });
    }

    // 2. Utilities
    if (answers['electricity']) {
      list.push({
        id: 'electricity',
        category: 'utilities',
        name: 'electricity',
        amount: Number(answers['electricity']),
        isEssential: true,
      });
    }
    if (answers['water']) {
      list.push({
        id: 'water',
        category: 'utilities',
        name: 'water',
        amount: Number(answers['water']),
        isEssential: true,
      });
    }
    if (answers['internet']) {
      list.push({
        id: 'internet',
        category: 'utilities',
        name: 'internet',
        amount: Number(answers['internet']),
        isEssential: true,
      });
    }
    if (answers['phone']) {
      list.push({
        id: 'phone',
        category: 'utilities',
        name: 'phone',
        amount: Number(answers['phone']),
        isEssential: true,
      });
    }

    // 3. Groceries
    if (answers['groceries']) {
      list.push({
        id: 'groceries',
        category: 'groceries',
        name: 'groceries',
        amount: Number(answers['groceries']),
        isEssential: true,
      });
    }

    // 4. Healthcare
    if (answers['medicationExpenses']) {
      list.push({
        id: 'medication',
        category: 'healthcare',
        name: 'medication',
        amount: Number(answers['medicationExpenses']),
        isEssential: true,
      });
    }
    if (answers['healthInsurance']) {
      list.push({
        id: 'healthInsurance',
        category: 'healthcare',
        name: 'healthInsurance',
        amount: Number(answers['healthInsurance']),
        isEssential: true,
      });
    }
    if (answers['medicalAppointments']) {
      list.push({
        id: 'medicalAppointments',
        category: 'healthcare',
        name: 'medicalAppointments',
        amount: Number(answers['medicalAppointments']),
        isEssential: true,
      });
    }
    if (answers['supportOtherHealthcare']) {
      list.push({
        id: 'supportOtherHealthcare',
        category: 'healthcare',
        name: 'otherHealthcareSupport',
        amount: Number(answers['supportOtherHealthcare']),
        isEssential: true,
      });
    }
    if (answers['subscriptions']) {
      list.push({
        id: 'subscriptions',
        category: 'flexible',
        name: 'subscriptions',
        amount: Number(answers['subscriptions']),
        isEssential: false,
      });
    }
    if (answers['otherBills']) {
      list.push({
        id: 'otherBills',
        category: 'flexible',
        name: 'otherBills',
        amount: Number(answers['otherBills']),
        isEssential: false,
      });
    }

    // 5. Family Support
    if (answers['schoolFees']) {
      list.push({
        id: 'schoolFees',
        category: 'family',
        name: 'schoolFees',
        amount: Number(answers['schoolFees']),
        isEssential: true,
      });
    }
    if (answers['childcareExpenses']) {
      list.push({
        id: 'childcare',
        category: 'family',
        name: 'childcare',
        amount: Number(answers['childcareExpenses']),
        isEssential: true,
      });
    }

    // 6. Vehicle
    if (answers['vehiclePayment']) {
      list.push({
        id: 'vehicleLoan',
        category: 'vehicle',
        name: 'carLoanPayment',
        amount: Number(answers['vehiclePayment']),
        isEssential: true,
      });
    }
    if (answers['fuelSpending']) {
      list.push({
        id: 'fuel',
        category: 'vehicle',
        name: 'fuel',
        amount: Number(answers['fuelSpending']),
        isEssential: true,
      });
    }
    if (answers['vehicleMaintenance']) {
      list.push({
        id: 'vehicleMaintenance',
        category: 'vehicle',
        name: 'vehicleMaintenance',
        amount: Number(answers['vehicleMaintenance']),
        isEssential: true,
      });
    }

    // 7. Minimum debt payments
    if (debts && debts.length > 0) {
      const totalMinDebts = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
      if (totalMinDebts > 0) {
        list.push({
          id: 'debtsMinimum',
          category: 'debts',
          name: 'minimumDebtPayments',
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
      Alert.alert(
        t('common.error'),
        t('onboarding.essentialExpenses.validPositiveNumber')
      );
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
      Alert.alert(
        t('common.error'),
        t('onboarding.essentialExpenses.enterNameAndAmount')
      );
      return;
    }
    const amt = Number(newAmount);
    if (isNaN(amt) || amt < 0) {
      Alert.alert(
        t('common.error'),
        t('onboarding.essentialExpenses.validAmount')
      );
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

  const syncOnboardingAnswers = useSessionStore((state) => state.syncOnboardingAnswers);
  const user = useSessionStore((state) => state.user);

  const getExpenseCategoryLabel = (item: EssentialExpenseItem) => {
    const key = DEFAULT_EXPENSE_LABEL_KEYS[item.id]?.category;
    return key ? t(`onboarding.essentialExpenses.${key}`) : item.category;
  };

  const getExpenseNameLabel = (item: EssentialExpenseItem) => {
    const key = item.id === 'housing'
      ? (answers['hasRent'] ? 'rent' : 'mortgage')
      : DEFAULT_EXPENSE_LABEL_KEYS[item.id]?.name;
    return key ? t(`onboarding.essentialExpenses.${key}`) : item.name;
  };

  const handleConfirmAll = async () => {
    const confirmedAnswers = {
      ...answers,
      reviewedExpenses: expenses,
      reviewedExpensesVersion: EXPENSE_REVIEW_VERSION,
    };
    setAnswers(confirmedAnswers);
    setOnboardingCompleted(true);
    if (user) {
      try {
        await syncOnboardingAnswers(confirmedAnswers, true);
      } catch (err) {
        console.warn('Failed to sync onboarding answers with live database:', err);
      }
    }
    router.replace(user ? '/dashboard' : '/auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text role="heading" aria-level={1} style={styles.title}>
          {t('onboarding.essentialExpenses.title')}
        </Text>
        <Text style={styles.subtitle}>{t('onboarding.essentialExpenses.subtitle')}</Text>
      </View>

      <ScrollView role="main" contentContainerStyle={styles.scrollContent}>
        {expenses.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={reduceMotion ? undefined : FadeInUp.delay(index * 50).duration(400)}
            exiting={reduceMotion ? undefined : FadeOut.duration(250)}
            layout={reduceMotion ? undefined : LinearTransition}
          >
            <Card style={styles.expenseCard}>
              <View style={styles.row}>
                <View style={styles.meta}>
                  <Text style={styles.categoryLabel}>{getExpenseCategoryLabel(item)}</Text>
                  <Text style={styles.expenseName}>{getExpenseNameLabel(item)}</Text>
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
                        title={t('onboarding.essentialExpenses.saveAmount')}
                        onPress={() => handleSaveEdit(item.id)}
                        variant="text"
                        style={styles.checkBtn}
                      />
                    </View>
                  ) : PROTECTED_EXPENSE_IDS.has(item.id) ? (
                    <Text style={styles.amountText}>
                      {formatCurrency(item.amount, currencyCode, locale)}
                    </Text>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleEdit(item.id, item.amount)}
                      accessibilityRole="button"
                      accessibilityLabel={t('onboarding.essentialExpenses.editAmount', {
                        name: getExpenseNameLabel(item),
                      })}
                    >
                      <Text style={styles.amountText}>
                        {formatCurrency(item.amount, currencyCode, locale)}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <View
                    style={[
                      styles.badge,
                      item.isEssential ? styles.essentialBadge : styles.flexibleBadge,
                    ]}
                  >
                    <AppText
                      variant="labelSm"
                      style={[
                        styles.badgeText,
                        item.isEssential ? styles.essentialBadgeText : styles.flexibleBadgeText,
                      ]}
                    >
                      {t(item.isEssential
                        ? 'onboarding.essentialExpenses.essential'
                        : 'onboarding.essentialExpenses.flexible')}
                    </AppText>
                  </View>
                </View>
              </View>

              {!PROTECTED_EXPENSE_IDS.has(item.id) && (
                <View style={styles.cardActions}>
                  <Button
                    title={t(item.isEssential
                      ? 'onboarding.essentialExpenses.makeFlexible'
                      : 'onboarding.essentialExpenses.makeEssential')}
                    onPress={() => handleReclassify(item.id)}
                    variant="text"
                    textStyle={styles.actionBtnText}
                  />
                  <Button
                    title={t('onboarding.essentialExpenses.delete')}
                    onPress={() => handleDelete(item.id)}
                    variant="text"
                    textStyle={styles.deleteBtnText}
                  />
                </View>
              )}
            </Card>
          </Animated.View>
        ))}

        {/* Add custom expense button / drawer */}
        {!showAdder ? (
          <Animated.View
            entering={reduceMotion ? undefined : FadeIn.duration(200)}
            exiting={reduceMotion ? undefined : FadeOut.duration(150)}
          >
            <Button
              title={t('onboarding.essentialExpenses.addCustomExpense')}
              onPress={() => setShowAdder(true)}
              variant="secondary"
              style={styles.showAdderBtn}
            />
          </Animated.View>
        ) : (
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(300)}
            exiting={reduceMotion ? undefined : FadeOut.duration(150)}
          >
            <Card style={styles.adderForm}>
              <Text style={styles.adderTitle}>
                {t('onboarding.essentialExpenses.addCustomExpense')}
              </Text>
              <Input
                label={t('onboarding.essentialExpenses.expenseName')}
                value={newName}
                onChangeText={setNewName}
                placeholder={t('onboarding.essentialExpenses.expenseNamePlaceholder')}
              />
              <Input
                label={t('onboarding.essentialExpenses.category')}
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder={t('onboarding.essentialExpenses.categoryPlaceholder')}
              />
              <Input
                label={t('onboarding.essentialExpenses.amount', { currency: currencyCode })}
                value={newAmount}
                onChangeText={setNewAmount}
                placeholder={t('onboarding.essentialExpenses.amountPlaceholder')}
                keyboardType="numeric"
              />
              <View style={styles.yesNoContainer}>
                <TouchableOpacity
                  style={[styles.typeSelect, newIsEssential && styles.typeSelectActive]}
                  onPress={() => setNewIsEssential(true)}
                  accessibilityRole="button"
                  accessibilityLabel={t('onboarding.essentialExpenses.essential')}
                  accessibilityState={{ selected: newIsEssential }}
                >
                  <Text style={[styles.typeText, newIsEssential && styles.typeTextActive]}>
                    {t('onboarding.essentialExpenses.essential')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeSelect, !newIsEssential && styles.typeSelectActive]}
                  onPress={() => setNewIsEssential(false)}
                  accessibilityRole="button"
                  accessibilityLabel={t('onboarding.essentialExpenses.flexible')}
                  accessibilityState={{ selected: !newIsEssential }}
                >
                  <Text style={[styles.typeText, !newIsEssential && styles.typeTextActive]}>
                    {t('onboarding.essentialExpenses.flexible')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.adderButtons}>
                <Button
                  title={t('onboarding.essentialExpenses.cancel')}
                  onPress={() => setShowAdder(false)}
                  variant="text"
                />
                <Button
                  title={t('onboarding.essentialExpenses.add')}
                  onPress={handleAddExpense}
                  variant="primary"
                  style={styles.addBtn}
                />
              </View>
            </Card>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('onboarding.essentialExpenses.confirmGeneratePlan')}
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
    backgroundColor: COLORS.surfaceContainerLowest,
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
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  confirmBtn: {
    width: '100%',
  },
});
