import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeInLeft, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SelectionCard } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import {
  getActiveQuestions,
  getQuestionSchema,
  QuestionConfig,
} from '../../features/onboarding/quizFlow';
import { useOnboardingStore, DebtInfo } from '../../store/onboardingStore';

export default function QuizScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // Onboarding Store State
  const {
    answers,
    currentStep,
    debts,
    setAnswer,
    setCurrentStep,
    addDebt,
    removeDebt,
  } = useOnboardingStore();

  // Local validation error
  const [validationError, setValidationError] = useState<string | null>(null);

  // For Text, Number, Date, Currency inputs
  const [inputValue, setInputValue] = useState('');

  // Local form for adding a debt
  const [debtType, setDebtType] = useState('Credit Card');
  const [debtTotal, setDebtTotal] = useState('');
  const [debtMinPayment, setDebtMinPayment] = useState('');
  const [debtInterest, setDebtInterest] = useState('');
  const [debtDue, setDebtDue] = useState('15');
  const [debtOverdue, setDebtOverdue] = useState<boolean | null>(null);

  // Track page transition direction
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Compute active questions based on current answers
  const activeQuestions = getActiveQuestions(answers);
  const totalQuestions = activeQuestions.length;

  // Protect index overflow/underflow
  const currentQuestion: QuestionConfig | undefined = activeQuestions[currentStep];

  // Sync input value with stored answers when step changes
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (currentQuestion) {
      setValidationError(null);
      const savedValue = answers[currentQuestion.id];
      if (savedValue !== undefined && savedValue !== null) {
        setInputValue(savedValue.toString());
      } else {
        setInputValue('');
      }
    }
  }, [currentStep, currentQuestion?.id]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  if (!currentQuestion) {
    // If we overshoot, redirect to review
    return null;
  }

  const currentSectionName = currentQuestion.section;
  const progressPercent = totalQuestions > 0 ? (currentStep + 1) / totalQuestions : 0;

  // Handle Next step validation and transition
  const handleNext = () => {
    setValidationError(null);
    const schema = getQuestionSchema(currentQuestion);

    let parsedValue: any = inputValue;

    if (currentQuestion.type === 'yes-no') {
      const savedBool = answers[currentQuestion.id];
      if (savedBool === undefined && currentQuestion.required) {
        setValidationError('Please choose Yes or No');
        return;
      }
      parsedValue = savedBool;
    } else if (currentQuestion.type === 'select') {
      const savedSelect = answers[currentQuestion.id];
      if (!savedSelect && currentQuestion.required) {
        setValidationError('Please select an option');
        return;
      }
      parsedValue = savedSelect;
    } else if (currentQuestion.type === 'debts-list') {
      if (debts.length === 0 && currentQuestion.required) {
        setValidationError('Please add at least one debt or answer No on the previous question');
        return;
      }
      parsedValue = debts;
    } else {
      // Validate string / number / currency input
      const validationResult = schema.safeParse(inputValue);
      if (!validationResult.success) {
        const errorMsg = validationResult.error.issues[0]?.message || 'Invalid input';
        setValidationError(errorMsg);
        return;
      }
      parsedValue = validationResult.data;
    }

    // Save answer to store
    if (currentQuestion.type !== 'debts-list') {
      setAnswer(currentQuestion.id, parsedValue);
    }

    // Advance screen
    setDirection('forward');
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/onboarding/review');
    }
  };

  const handleBack = () => {
    setDirection('backward');
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    setAnswer(currentQuestion.id, null);
    setDirection('forward');
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/onboarding/review');
    }
  };

  const handleSaveAndExit = () => {
    Alert.alert(
      t('common.saveLater'),
      'Your onboarding progress is saved. You can close the app and resume anytime.',
      [{ text: 'OK', onPress: () => router.replace('/auth') }]
    );
  };

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
    // Reset local inputs
    setDebtTotal('');
    setDebtMinPayment('');
    setDebtInterest('');
    setDebtOverdue(null);
  };

  // Render question-specific forms
  const renderInputForm = () => {
    const currencySymbol = answers['currency'] || 'MAD';

    switch (currentQuestion.type) {
      case 'yes-no':
        return (
          <View style={styles.yesNoContainer}>
            <SelectionCard
              label={t('common.yes')}
              selected={answers[currentQuestion.id] === true}
              onPress={() => setAnswer(currentQuestion.id, true)}
              style={styles.halfCard}
            />
            <SelectionCard
              label={t('common.no')}
              selected={answers[currentQuestion.id] === false}
              onPress={() => setAnswer(currentQuestion.id, false)}
              style={styles.halfCard}
            />
          </View>
        );

      case 'select':
        return (
          <View style={styles.optionsList}>
            {currentQuestion.options?.map((option) => (
              <SelectionCard
                key={option.value}
                label={option.labelKey}
                selected={answers[currentQuestion.id] === option.value}
                onPress={() => setAnswer(currentQuestion.id, option.value)}
              />
            ))}
          </View>
        );

      case 'currency':
        return (
          <Input
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="0.00"
            keyboardType="numeric"
            prefix={currencySymbol}
            error={validationError || undefined}
          />
        );

      case 'number':
        return (
          <Input
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="0"
            keyboardType="number-pad"
            error={validationError || undefined}
          />
        );

      case 'date':
        return (
          <Input
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="YYYY-MM-DD"
            keyboardType="default"
            error={validationError || undefined}
          />
        );

      case 'debts-list':
        return (
          <View style={styles.debtsFormContainer}>
            {/* Added debts list */}
            {debts.length > 0 && (
              <View style={styles.addedDebtsList}>
                <Text style={styles.sectionLabel}>Added Debts:</Text>
                {debts.map((item, idx) => (
                  <View key={idx} style={styles.debtItemRow}>
                    <Text style={styles.debtItemText}>
                      • {item.type}: {currencySymbol} {item.totalAmount} (Min: {item.minimumPayment})
                    </Text>
                    <Button
                      title="🗑️"
                      onPress={() => removeDebt(idx)}
                      variant="text"
                      style={styles.deleteDebtBtn}
                    />
                  </View>
                ))}
              </View>
            )}

            <View style={styles.debtCardAdder}>
              <Text style={styles.cardAdderHeader}>Add a Debt:</Text>
              <Input
                label="Debt Type"
                value={debtType}
                onChangeText={setDebtType}
                placeholder="e.g. Credit Card, Personal Loan"
              />
              <Input
                label={`Total Amount (${currencySymbol})`}
                value={debtTotal}
                onChangeText={setDebtTotal}
                placeholder="0.00"
                keyboardType="numeric"
              />
              <Input
                label={`Minimum Monthly Payment (${currencySymbol})`}
                value={debtMinPayment}
                onChangeText={setDebtMinPayment}
                placeholder="0.00"
                keyboardType="numeric"
              />
              <Input
                label="Interest Rate (%)"
                value={debtInterest}
                onChangeText={setDebtInterest}
                placeholder="e.g. 12"
                keyboardType="numeric"
              />
              <Input
                label="Monthly Due Date (Day of Month)"
                value={debtDue}
                onChangeText={setDebtDue}
                placeholder="e.g. 15"
                keyboardType="number-pad"
              />
              <Text style={styles.subLabel}>Is payment currently overdue?</Text>
              <View style={styles.yesNoContainer}>
                <SelectionCard
                  label="Yes, overdue"
                  selected={debtOverdue === true}
                  onPress={() => setDebtOverdue(true)}
                  style={styles.halfCard}
                />
                <SelectionCard
                  label="No"
                  selected={debtOverdue === false}
                  onPress={() => setDebtOverdue(false)}
                  style={styles.halfCard}
                />
              </View>

              <Button
                title="+ Add Debt"
                onPress={handleAddDebt}
                variant="secondary"
                style={styles.addDebtBtn}
              />
            </View>
          </View>
        );

      default:
        return (
          <Input
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={currentQuestion.placeholder}
            error={validationError || undefined}
          />
        );
    }
  };

  const enteringAnimation = direction === 'forward'
    ? FadeInRight.duration(300).springify().damping(18)
    : FadeInLeft.duration(300).springify().damping(18);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header and Progress Bar */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Button title="← Back" onPress={handleBack} variant="text" />
          <Text style={styles.sectionTitle}>
            {t(`onboarding.sections.${currentSectionName}`)}
          </Text>
          <Button title={t('common.saveLater')} onPress={handleSaveAndExit} variant="text" />
        </View>
        <View style={styles.progressRow}>
          <View style={styles.progressBarContainer}>
            <ProgressBar progress={progressPercent} />
          </View>
          <Text style={styles.progressText}>
            {t('onboarding.progress', { current: currentStep + 1, total: totalQuestions })}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View
            key={currentQuestion.id}
            entering={enteringAnimation}
            style={{ flex: 1 }}
          >
            {/* Question Text */}
            <View style={styles.questionContainer}>
              <Text style={styles.questionTitle}>{t(currentQuestion.titleKey)}</Text>
              <Text style={styles.questionSubtitle}>{t(currentQuestion.subtitleKey)}</Text>
            </View>

            {/* Inline Validation Error */}
            {validationError && currentQuestion.type !== 'currency' && currentQuestion.type !== 'number' && (
              <Animated.View
                entering={FadeInDown.duration(250)}
                exiting={FadeOutUp.duration(200)}
                style={styles.errorAlert}
              >
                <Text style={styles.errorAlertText}>{validationError}</Text>
              </Animated.View>
            )}

            {/* Question form container */}
            <View style={styles.formContainer}>{renderInputForm()}</View>

            {/* Optional notes explanation */}
            {currentQuestion.type !== 'debts-list' && (
              <Input
                value={answers[`${currentQuestion.id}_notes`] || ''}
                onChangeText={(txt) => setAnswer(`${currentQuestion.id}_notes`, txt)}
                placeholder={t('common.notes')}
                multiline
                numberOfLines={3}
                containerStyle={styles.notesContainer}
              />
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>


      {/* Footer Navigation */}
      <View style={styles.footer}>
        {!currentQuestion.required && (
          <Button title={t('common.skip')} onPress={handleSkip} variant="text" style={styles.skipBtn} />
        )}
        <Button
          title={currentStep === totalQuestions - 1 ? t('onboarding.generatePlan') : t('common.continue')}
          onPress={handleNext}
          variant="primary"
          style={styles.continueBtn}
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressRow: {
    gap: SPACING.xs,
  },
  progressBarContainer: {
    flex: 1,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    marginTop: 4,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  questionContainer: {
    marginBottom: SPACING.lg,
  },
  questionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  questionSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: SPACING.lg,
  },
  yesNoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  halfCard: {
    flex: 1,
    height: 56,
  },
  optionsList: {
    gap: SPACING.xs,
  },
  notesContainer: {
    marginTop: SPACING.md,
  },
  errorAlert: {
    backgroundColor: '#FFF2F2',
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorAlertText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.error,
    fontWeight: '600',
  },
  debtsFormContainer: {
    gap: SPACING.md,
  },
  addedDebtsList: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionLabel: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  debtItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  debtItemText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    flex: 1,
  },
  deleteDebtBtn: {
    padding: SPACING.xs,
  },
  debtCardAdder: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  cardAdderHeader: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  subLabel: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  addDebtBtn: {
    marginTop: SPACING.md,
    height: 44,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipBtn: {
    marginRight: SPACING.md,
  },
  continueBtn: {
    flex: 1,
  },
});
