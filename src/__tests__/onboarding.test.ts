import { describe, expect, test } from '@jest/globals';
import { getActiveQuestions, getQuestionSchema } from '../features/onboarding/quizFlow';

describe('Onboarding Quiz Branching Logic & Validations', () => {
  // Test Scenario: Vehicle ownership branching
  test('should include vehicle financing questions only when hasVehicle is "yes"', () => {
    // When user says YES to vehicle
    const answersWithVehicle = { hasVehicle: 'yes' };
    const activeQuestionsWithVehicle = getActiveQuestions(answersWithVehicle);
    const vehicleFinancingQuestion = activeQuestionsWithVehicle.find(
      (q) => q.id === 'vehicleFinancing'
    );
    expect(vehicleFinancingQuestion).toBeDefined();

    // When user says NO to vehicle
    const answersWithoutVehicle = { hasVehicle: 'no' };
    const activeQuestionsWithoutVehicle = getActiveQuestions(answersWithoutVehicle);
    const missingVehicleFinancing = activeQuestionsWithoutVehicle.find(
      (q) => q.id === 'vehicleFinancing'
    );
    expect(missingVehicleFinancing).toBeUndefined();
  });

  // Test Scenario: Children school fees branching
  test('should include childcare and school fees questions only when hasChildren is true', () => {
    // Has children
    const answersWithChildren = { hasChildren: true };
    const activeWithChildren = getActiveQuestions(answersWithChildren);
    const schoolFeesQuestion = activeWithChildren.find((q) => q.id === 'schoolFees');
    expect(schoolFeesQuestion).toBeDefined();

    // No children
    const answersWithoutChildren = { hasChildren: false };
    const activeWithoutChildren = getActiveQuestions(answersWithoutChildren);
    const missingSchoolFees = activeWithoutChildren.find((q) => q.id === 'schoolFees');
    expect(missingSchoolFees).toBeUndefined();
  });

  // Test Scenario: Secondary income branching
  test('should include secondary income amount only when hasIncome and hasSecondIncome are both true', () => {
    // Has second income
    const answersWithSecondIncome = { hasIncome: true, hasSecondIncome: true };
    const activeWithSecond = getActiveQuestions(answersWithSecondIncome);
    const secondIncomeAmt = activeWithSecond.find((q) => q.id === 'secondIncome');
    expect(secondIncomeAmt).toBeDefined();

    // No second income
    const answersWithoutSecondIncome = { hasIncome: true, hasSecondIncome: false };
    const activeWithoutSecond = getActiveQuestions(answersWithoutSecondIncome);
    const missingSecondIncome = activeWithoutSecond.find((q) => q.id === 'secondIncome');
    expect(missingSecondIncome).toBeUndefined();
  });

  // Test Scenario: Debts list branching
  test('should include debts-list question only when hasDebt is true', () => {
    // Has debt
    const answersWithDebt = { hasDebt: true };
    const activeWithDebt = getActiveQuestions(answersWithDebt);
    const debtsList = activeWithDebt.find((q) => q.id === 'debts');
    expect(debtsList).toBeDefined();

    // No debt
    const answersWithoutDebt = { hasDebt: false };
    const activeWithoutDebt = getActiveQuestions(answersWithoutDebt);
    const missingDebtsList = activeWithoutDebt.find((q) => q.id === 'debts');
    expect(missingDebtsList).toBeUndefined();
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
