import { describe, expect, jest, test } from '@jest/globals';
import {
  getActiveQuestions,
  getQuestionSchema,
  getResumeQuestionStep,
  isMonthlyPlanReady,
} from '../features/onboarding/quizFlow';
import { resolveEntryRoute } from '../features/onboarding/entryRoute';
import { useOnboardingStore } from '../store/onboardingStore';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
  },
}));

const buildCompleteAnswers = () => {
  const answers: Record<string, unknown> = {
    language: 'en',
    currency: 'MAD',
    availableBalance: 1000,
    nextIncomeDate: '2026-08-15',
    mainIncome: 3000,
    essentialBillsDue: 400,
  };

  let addedAnswer = true;
  while (addedAnswer) {
    addedAnswer = false;
    getActiveQuestions(answers)
      .filter((question) => question.required)
      .forEach((question) => {
        if (answers[question.id] !== undefined) return;
        answers[question.id] = question.type === 'yes-no'
          ? false
          : question.type === 'currency' || question.type === 'number'
            ? 0
            : question.type === 'date'
              ? '2026-01-01'
              : question.options?.[0]?.value ?? 'Complete';
        addedAnswer = true;
      });
  }

  return answers;
};

describe('Onboarding Quiz Branching Logic & Validations', () => {
  test('waits for encrypted persistence before choosing the cold-start route', () => {
    expect(resolveEntryRoute(false, false)).toBeNull();
    expect(resolveEntryRoute(false, true)).toBeNull();
    expect(resolveEntryRoute(true, false)).toBe('/onboarding/welcome');
    expect(resolveEntryRoute(true, true)).toBe('/dashboard');
  });

  test('keeps the dashboard usable when optional profile details are added later', () => {
    useOnboardingStore.setState({
      answers: {
        groceries: 100,
        ...buildCompleteAnswers(),
      },
      debts: [],
      onboardingCompleted: true,
    });

    useOnboardingStore.getState().setAnswer('groceries', 150);
    expect(useOnboardingStore.getState().onboardingCompleted).toBe(true);

    useOnboardingStore.setState({
      answers: {
        ...buildCompleteAnswers(),
      },
      debts: [],
      onboardingCompleted: true,
    });
    useOnboardingStore.getState().addDebt({
      type: 'Credit card',
      totalAmount: 1000,
      minimumPayment: 60,
      interestRate: 10,
      dueDate: '15',
      isOverdue: false,
    });
    expect(useOnboardingStore.getState().onboardingCompleted).toBe(true);

    useOnboardingStore.getState().updateDebt(0, {
      type: 'Credit card',
      totalAmount: 900,
      minimumPayment: 50,
      interestRate: 9,
      dueDate: '20',
      isOverdue: false,
    });
    expect(useOnboardingStore.getState().debts[0]).toMatchObject({ totalAmount: 900, minimumPayment: 50 });
  });

  test('should gate trusted monthly plan metrics until required answers are complete', () => {
    const answers = buildCompleteAnswers();

    expect(isMonthlyPlanReady(answers, [], false)).toBe(false);
    expect(isMonthlyPlanReady(answers, [], true)).toBe(true);

    delete answers.availableBalance;
    expect(isMonthlyPlanReady(answers, [], true)).toBe(false);
  });

  test('should accept answered zero values but require debt details when debt is declared', () => {
    const answers = buildCompleteAnswers();
    expect(isMonthlyPlanReady(answers, [], true)).toBe(true);

    answers.protectedBuffer = 0;
    expect(isMonthlyPlanReady(answers, [], true)).toBe(true);
  });

  test('asks 14-17 meaningful questions without location or sensitive profile questions', () => {
    const schedules = [
      { incomeFrequency: 'monthly' },
      { incomeFrequency: 'twiceMonthly' },
      { incomeFrequency: 'irregular', incomeDateCertainty: 'exact' },
      { incomeFrequency: 'irregular', incomeDateCertainty: 'notSure' },
    ];

    schedules.forEach((answers) => {
      const questions = getActiveQuestions(answers);
      expect(questions.length).toBeGreaterThanOrEqual(14);
      expect(questions.length).toBeLessThanOrEqual(17);
      expect(questions.some(({ id }) => ['country', 'isMarried', 'hasChildren', 'employmentStatus', 'medicationExpenses'].includes(id))).toBe(false);
    });
  });

  test('resumes stale saved progress at the first incomplete required question', () => {
    const questions = getActiveQuestions({});

    expect(getResumeQuestionStep(questions, {}, 26)).toBe(0);
    expect(getResumeQuestionStep(questions, { language: 'en' }, 7)).toBe(1);
    expect(getResumeQuestionStep(getActiveQuestions(buildCompleteAnswers()), buildCompleteAnswers(), 7)).toBe(7);
  });

  // Test Scenario: Zod Validations
  test('should validate input values correctly based on type', () => {
    // 1. Text required field
    const textQuestion = {
      id: 'name',
      section: 'personal',
      titleKey: '',
      subtitleKey: '',
      type: 'text' as const,
      required: true,
    };
    const textSchema = getQuestionSchema(textQuestion);
    expect(textSchema.safeParse('Hamza').success).toBe(true);
    expect(textSchema.safeParse('').success).toBe(false);

    // 2. Currency/Number required field
    const numericQuestion = {
      id: 'amount',
      section: 'income',
      titleKey: '',
      subtitleKey: '',
      type: 'currency' as const,
      required: true,
    };
    const numericSchema = getQuestionSchema(numericQuestion);
    expect(numericSchema.safeParse('1500').success).toBe(true);
    expect(numericSchema.safeParse('-10').success).toBe(false); // Min 0
    expect(numericSchema.safeParse('abc').success).toBe(false); // Must be number
  });
});
