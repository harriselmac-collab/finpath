import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInRight,
  FadeInLeft,
  FadeInDown,
  FadeOutUp,
  useReducedMotion,
} from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SelectionCard } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import AppText from '../../components/Text/AppText';
import { FlagIcon } from '../../components/ui/FlagIcon';
import { IncomeDatePicker } from '../../components/ui/IncomeDatePicker';
import {
  getCurrencyOptionLabel,
  SUPPORTED_CURRENCIES,
} from '../../constants/currencies';
import {
  getActiveQuestions,
  getQuestionSchema,
  getResumeQuestionStep,
  QuestionConfig,
} from '../../features/onboarding/quizFlow';
import { useOnboardingStore, DebtInfo } from '../../store/onboardingStore';
import { getLanguageOption } from '../../services/localization/languages';

const VALIDATION_KEYS: Record<string, string> = {
  'This field is required': 'onboarding.validation.required',
  'Must be a number': 'onboarding.validation.number',
  'Must be a numeric amount': 'onboarding.validation.amount',
  'Must be positive': 'onboarding.validation.positive',
  'Please choose an option': 'onboarding.validation.chooseOption',
  'Please choose a date': 'onboarding.validation.chooseDate',
  'Choose a day from 1 to 31': 'onboarding.validation.dayOfMonth',
};

export default function QuizScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();

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
  const [debtType, setDebtType] = useState(() => t('onboarding.flow.defaultDebtType'));
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
  const resumeStep = getResumeQuestionStep(activeQuestions, answers, currentStep);

  const currentQuestion: QuestionConfig | undefined = activeQuestions[resumeStep];

  useEffect(() => {
    if (resumeStep !== currentStep) setCurrentStep(resumeStep);
  }, [currentStep, resumeStep, setCurrentStep]);

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

  if (!currentQuestion) return null;

  const currentSectionName = currentQuestion.section;
  const progressPercent = totalQuestions > 0 ? (resumeStep + 1) / totalQuestions : 0;

  // Handle Next step validation and transition
  const handleNext = () => {
    setValidationError(null);
    const schema = getQuestionSchema(currentQuestion);

    let parsedValue: any = inputValue;

    if (currentQuestion.type === 'yes-no') {
      const savedBool = answers[currentQuestion.id];
      if (savedBool === undefined && currentQuestion.required) {
        setValidationError(t('onboarding.validation.yesNo'));
        return;
      }
      parsedValue = savedBool;
    } else if (currentQuestion.type === 'select') {
      const savedSelect = answers[currentQuestion.id];
      if (!savedSelect && currentQuestion.required) {
        setValidationError(t('onboarding.validation.selectOption'));
        return;
      }
      parsedValue = savedSelect;
    } else if (currentQuestion.type === 'debts-list') {
      if (debts.length === 0 && currentQuestion.required) {
        setValidationError(t('onboarding.validation.debtRequired'));
        return;
      }
      parsedValue = debts;
    } else {
      // Validate string / number / currency input
      const validationResult = schema.safeParse(inputValue);
      if (!validationResult.success) {
        const errorMsg = validationResult.error.issues[0]?.message || 'Invalid input';
        setValidationError(t(VALIDATION_KEYS[errorMsg] || 'onboarding.validation.invalidInput'));
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
    if (resumeStep < totalQuestions - 1) {
      setCurrentStep(resumeStep + 1);
    } else {
      router.push('/onboarding/review');
    }
  };

  const handleBack = () => {
    setDirection('backward');
    if (resumeStep > 0) {
      setCurrentStep(resumeStep - 1);
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    setAnswer(currentQuestion.id, null);
    setDirection('forward');
    if (resumeStep < totalQuestions - 1) {
      setCurrentStep(resumeStep + 1);
    } else {
      router.push('/onboarding/review');
    }
  };

  const handleSaveAndExit = () => {
    Alert.alert(
      t('onboarding.flow.saveLater'),
      t('onboarding.flow.saveLaterMessage'),
      [{ text: t('onboarding.flow.ok'), onPress: () => router.replace('/onboarding/welcome') }]
    );
  };

  const handleAddDebt = () => {
    if (!debtTotal || !debtMinPayment || !debtInterest) {
      Alert.alert(t('onboarding.flow.error'), t('onboarding.validation.debtFields'));
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
              label={t('onboarding.options.yes')}
              selected={answers[currentQuestion.id] === true}
              onPress={() => setAnswer(currentQuestion.id, true)}
              style={styles.halfCard}
            />
            <SelectionCard
              label={t('onboarding.options.no')}
              selected={answers[currentQuestion.id] === false}
              onPress={() => setAnswer(currentQuestion.id, false)}
              style={styles.halfCard}
            />
          </View>
        );

      case 'select':
        return (
          <View style={styles.optionsList}>
            {currentQuestion.options?.map((option) => {
              const localizedLabel = currentQuestion.id === 'currency'
                ? t(`profile.currencies.${option.value}`, { defaultValue: option.labelKey })
                : t(option.labelKey, { defaultValue: option.labelKey });
              const currency = currentQuestion.id === 'currency'
                ? SUPPORTED_CURRENCIES.find(({ code }) => code === option.value)
                : undefined;

              return (
                <SelectionCard
                  key={option.value}
                  label={currency
                    ? getCurrencyOptionLabel(currency, i18n.resolvedLanguage || i18n.language, localizedLabel)
                    : localizedLabel}
                  icon={currentQuestion.id === 'language'
                    ? <FlagIcon countryCode={getLanguageOption(option.value).countryCode} size={22} />
                    : undefined}
                  selected={answers[currentQuestion.id] === option.value}
                  onPress={() => {
                    setAnswer(currentQuestion.id, option.value);
                    if (currentQuestion.id === 'language') void i18n.changeLanguage(option.value);
                  }}
                />
              );
            })}
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
            placeholder={['payday', 'firstPayday', 'secondPayday'].includes(currentQuestion.id) ? '1–31' : '0'}
            keyboardType="number-pad"
            error={validationError || undefined}
          />
        );

      case 'date':
        return (
          <IncomeDatePicker
            value={inputValue}
            onChange={setInputValue}
            locale={i18n.resolvedLanguage || i18n.language}
            label={t('onboarding.minimum.nextIncomeDate.choose')}
          />
        );

      case 'debts-list':
        return (
          <View style={styles.debtsFormContainer}>
            {/* Added debts list */}
            {debts.length > 0 && (
              <View style={styles.addedDebtsList}>
                <AppText variant="bodySemiBold" style={styles.sectionLabel}>
                  {t('onboarding.flow.addedDebts')}
                </AppText>
                {debts.map((item, idx) => (
                  <View key={idx} style={styles.debtItemRow}>
                    <AppText variant="bodyMedium" style={styles.debtItemText}>
                      • {t('onboarding.flow.debtSummary', {
                        type: item.type,
                        currency: currencySymbol,
                        total: item.totalAmount,
                        minimum: item.minimumPayment,
                      })}
                    </AppText>
                    <Button
                      title={t('onboarding.flow.deleteDebt')}
                      onPress={() => removeDebt(idx)}
                      variant="text"
                      style={styles.deleteDebtBtn}
                    />
                  </View>
                ))}
              </View>
            )}

            <View style={styles.debtCardAdder}>
              <AppText variant="bodySemiBold" style={styles.cardAdderHeader}>
                {t('onboarding.flow.addDebtTitle')}
              </AppText>
              <Input
                label={t('onboarding.flow.debtType')}
                value={debtType}
                onChangeText={setDebtType}
                placeholder={t('onboarding.placeholders.debtType')}
              />
              <Input
                label={t('onboarding.flow.totalAmount', { currency: currencySymbol })}
                value={debtTotal}
                onChangeText={setDebtTotal}
                placeholder="0.00"
                keyboardType="numeric"
              />
              <Input
                label={t('onboarding.flow.minimumPayment', { currency: currencySymbol })}
                value={debtMinPayment}
                onChangeText={setDebtMinPayment}
                placeholder="0.00"
                keyboardType="numeric"
              />
              <Input
                label={t('onboarding.flow.interestRate')}
                value={debtInterest}
                onChangeText={setDebtInterest}
                placeholder={t('onboarding.placeholders.interestRate')}
                keyboardType="numeric"
              />
              <Input
                label={t('onboarding.flow.dueDate')}
                value={debtDue}
                onChangeText={setDebtDue}
                placeholder={t('onboarding.placeholders.dueDate')}
                keyboardType="number-pad"
              />
              <AppText variant="bodySemiBold" style={styles.subLabel}>
                {t('onboarding.flow.isOverdue')}
              </AppText>
              <View style={styles.yesNoContainer}>
                <SelectionCard
                  label={t('onboarding.flow.yesOverdue')}
                  selected={debtOverdue === true}
                  onPress={() => setDebtOverdue(true)}
                  style={styles.halfCard}
                />
                <SelectionCard
                  label={t('onboarding.options.no')}
                  selected={debtOverdue === false}
                  onPress={() => setDebtOverdue(false)}
                  style={styles.halfCard}
                />
              </View>

              <Button
                title={t('onboarding.flow.addDebt')}
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
            placeholder={t(`onboarding.placeholders.${currentQuestion.id}`, {
              defaultValue: currentQuestion.placeholder || '',
            })}
            error={validationError || undefined}
          />
        );
    }
  };

  const enteringAnimation = reduceMotion
    ? undefined
    : direction === 'forward'
      ? FadeInRight.duration(220)
      : FadeInLeft.duration(220);

  const sectionIcon = ({
    localization: 'globe-outline',
    essentials: 'wallet-outline',
    personal: 'person-outline',
    income: 'wallet-outline',
    housing: 'home-outline',
    family: 'people-outline',
    vehicle: 'car-outline',
    healthcare: 'medical-outline',
    debt: 'card-outline',
    bills: 'receipt-outline',
    annual: 'calendar-outline',
    habits: 'compass-outline',
    cultural: 'globe-outline',
  } as Record<string, React.ComponentProps<typeof Ionicons>['name']>)[currentSectionName]
    || 'sparkles-outline';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.flow.back')}
          >
            <Ionicons name="chevron-back" size={26} color={COLORS.primary} accessible={false} />
          </Pressable>
          <View style={styles.progressBlock}>
            <ProgressBar
              progress={progressPercent}
              height={6}
              accessibilityLabel={t('onboarding.progress', {
                current: currentStep + 1,
                total: totalQuestions,
              })}
            />
            <AppText variant="supporting" style={styles.progressText}>
                {t('onboarding.progress', { current: resumeStep + 1, total: totalQuestions })}
            </AppText>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView role="main" contentContainerStyle={styles.scrollContent}>
          <Animated.View
            key={currentQuestion.id}
            entering={enteringAnimation}
            style={{ flex: 1 }}
          >
            <View style={styles.questionContainer}>
              <View style={styles.sectionIcon}>
                <Ionicons name={sectionIcon} size={28} color={COLORS.secondary} accessible={false} />
              </View>
              <AppText variant="supporting" style={styles.sectionTitle}>
                {t(`onboarding.sections.${currentSectionName}`)}
              </AppText>
              <AppText role="heading" aria-level={1} variant="h2" style={styles.questionTitle}>
                {t(currentQuestion.titleKey)}
              </AppText>
              <AppText variant="bodyLg" style={styles.questionSubtitle}>{t(currentQuestion.subtitleKey)}</AppText>
            </View>

            {/* Inline Validation Error */}
            {validationError && ['yes-no', 'select', 'debts-list'].includes(currentQuestion.type) && (
              <Animated.View
                entering={reduceMotion ? undefined : FadeInDown.duration(250)}
                exiting={reduceMotion ? undefined : FadeOutUp.duration(200)}
                style={styles.errorAlert}
                accessibilityRole="alert"
                accessibilityLiveRegion="assertive"
              >
                <AppText variant="supporting" style={styles.errorAlertText}>{validationError}</AppText>
              </Animated.View>
            )}

            {/* Question form container */}
            <View style={styles.formContainer}>{renderInputForm()}</View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>


      <View style={styles.footer}>
        <Button
          title={currentStep === totalQuestions - 1 ? t('onboarding.generatePlan') : t('onboarding.flow.continue')}
          onPress={handleNext}
          variant="primary"
          style={styles.continueBtn}
        />
        <View style={styles.footerLinks}>
          {!currentQuestion.required && (
            <Button title={t('onboarding.flow.skip')} onPress={handleSkip} variant="text" style={styles.footerLink} />
          )}
          <Button
            title={t('onboarding.flow.saveLater')}
            onPress={handleSaveAndExit}
            variant="text"
            style={styles.footerLink}
          />
        </View>
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
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  progressBlock: {
    flex: 1,
    gap: 5,
  },
  sectionTitle: {
    color: COLORS.secondary,
    textAlign: 'center',
  },
  progressText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  sectionIcon: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.secondaryContainer,
  },
  questionTitle: {
    color: COLORS.primary,
    maxWidth: 540,
    marginTop: SPACING.xs,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  questionSubtitle: {
    color: COLORS.textSecondary,
    maxWidth: 520,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 28,
  },
  formContainer: {
    marginBottom: SPACING.lg,
  },
  yesNoContainer: {
    flexDirection: 'column',
    marginBottom: SPACING.md,
  },
  halfCard: {
    width: '100%',
    minHeight: 72,
  },
  optionsList: {
    gap: SPACING.xs,
  },
  notesContainer: {
    marginTop: SPACING.md,
  },
  errorAlert: {
    backgroundColor: COLORS.errorBackground,
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorAlertText: {
    color: COLORS.error,
  },
  debtsFormContainer: {
    gap: SPACING.md,
  },
  addedDebtsList: {
    backgroundColor: COLORS.surfaceContainerLowest,
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
    backgroundColor: COLORS.surfaceContainerLowest,
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
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  footerLinks: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
  },
  footerLink: {
    minHeight: 44,
  },
  continueBtn: {
    width: '100%',
    minHeight: 56,
  },
});
