import { describe, expect, test } from '@jest/globals';
import {
  safeAdd,
  safeSubtract,
  safeMultiply,
  safeDivide,
  safeSum,
} from '../utils/currency';
import {
  calculateFinancialProfile,
  calculateMonthlyAnnualPortion,
} from '../features/financial-engine/engine';
import { evaluateBudgetSafety } from '../features/financial-engine/safetyRules';
import { analyzeGoalFeasibility } from '../features/financial-engine/goalCalculations';

describe('Financial Engine Decimal Precision Math', () => {
  test('should execute decimal additions safely without floating-point leaks', () => {
    // Standard JS: 0.1 + 0.2 = 0.30000000000000004
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(safeAdd(0.1, 0.2)).toBe(0.3);
  });

  test('should execute decimal subtractions safely', () => {
    // Standard JS: 1.0 - 0.9 = 0.09999999999999998
    expect(1.0 - 0.9).not.toBe(0.1);
    expect(safeSubtract(1.0, 0.9)).toBe(0.1);
  });

  test('should execute safe multiplication and rounding division', () => {
    expect(safeMultiply(10.25, 3)).toBe(30.75);
    // 10 / 3 = 3.33333... -> rounded to nearest cent: 3.33
    expect(safeDivide(10, 3)).toBe(3.33);
  });

  test('should accumulate sum of currency values safely', () => {
    const list = [10.15, 20.30, 30.45]; // Total = 60.90
    expect(safeSum(list)).toBe(60.90);
  });
});

describe('Annual Bill Handling & Calculations', () => {
  test('should divide annual bill by 12 months by default', () => {
    const bill = { name: 'Insurance', amount: 2400 };
    expect(calculateMonthlyAnnualPortion(bill)).toBe(200);
  });

  test('should divide annual bill by months remaining if approaching soon', () => {
    const bill = { name: 'Insurance', amount: 2400, monthsRemaining: 4 };
    expect(calculateMonthlyAnnualPortion(bill)).toBe(600); // 2400 / 4 months = 600/month
  });
});

describe('Deterministic Financial Profile calculations', () => {
  test('should calculate correct disponible balances, safe daily spending, and deficit flags', () => {
    const mockOnboardingData = {
      answers: {
        preferredName: 'Hamza',
        currency: 'MAD',
        mainIncome: 7000,
        secondIncome: 1000,
        hasIncome: true,
        housingAmount: 2500,
        electricity: 200,
        water: 100,
        internet: 150,
        phone: 50,
        groceries: 1500,
        medicationExpenses: 100,
        hasVehicle: 'yes',
        vehicleInsurance: false,
        insuranceAmount: 2400,
        insuranceDate: '2026-11-13', // ~4 months from now
        roadTax: false,
        culturalPref: 'muslim', // Event contribution: 100
      },
      debts: [
        {
          type: 'Credit Card',
          totalAmount: 5000,
          minimumPayment: 300,
          interestRate: 12,
          dueDate: '15',
          isOverdue: false,
        },
      ],
    };

    // Months remaining helper is evaluated dynamically inside, so we stub input annual bills specifically
    // to keep test execution fully deterministic.
    const customAnnuals = [{ name: 'Vehicle Insurance', amount: 2400, monthsRemaining: 8 }];

    const profile = calculateFinancialProfile({
      answers: mockOnboardingData.answers,
      debts: mockOnboardingData.debts,
      annualBills: customAnnuals,
    });

    expect(profile.totalMonthlyIncome).toBe(8000);
    // Essentials = housing (2500) + electricity (200) + water (100) + internet (150) + phone (50) + groceries (1500) + medication (100) = 4600
    expect(profile.essentialMonthlyExpenses).toBe(4600);
    // Debts = card (300)
    expect(profile.minimumMonthlyDebtPayments).toBe(300);
    // Annual portion = 2400 / 8 = 300
    expect(profile.monthlyAnnualExpensesPortion).toBe(300);
    // Cultural portion = muslim (100)
    expect(profile.requiredUpcomingContributions).toBe(100);

    // Total essential outflows = 4600 (essentials) + 300 (debt) + 300 (annual) + 100 (cultural) = 5300
    // Real Available Balance = 8000 - 5300 = 2700
    expect(profile.realAvailableMonthlyBalance).toBe(2700);

    // Safe daily spending = 2700 / 30 = 90
    expect(profile.safeDailySpending).toBe(90);

    expect(profile.budgetDeficit).toBe(false);
  });
});

describe('Financial Safety Rule Warning Checks', () => {
  test('should trigger income shortfall warnings if expenses exceed income', () => {
    const totalIncome = 3000;
    const essentialExpenses = 3500;
    const minimumDebt = 200; // Total essential outflows = 3700

    const safetyReport = evaluateBudgetSafety(totalIncome, essentialExpenses, minimumDebt, {});

    expect(safetyReport.hasDeficit).toBe(true);
    expect(safetyReport.warningMessage).toBe(
      'Your current income does not fully cover your essential needs. This is an income shortfall, not simply a spending-discipline problem.'
    );

    // Verify recommendations contain creditor support actions
    const hasCreditorAdvice = safetyReport.recommendations.some((text) =>
      text.toLowerCase().includes('contact creditors')
    );
    expect(hasCreditorAdvice).toBe(true);
  });
});

describe('Goal Feasibility Suggestions Engine', () => {
  test('should return isRealistic true if savings fit in available balance', () => {
    const goal = {
      name: 'Buy Phone',
      targetAmount: 2000,
      alreadySaved: 500,
      targetDate: '2026-12-13', // ~5 months away
      isEssential: false,
    };
    const availableBalance = 400; // Needs 1500 / 5 = 300 monthly. 300 <= 400.
    const analysis = analyzeGoalFeasibility(goal, availableBalance);

    expect(analysis.isRealistic).toBe(true);
    expect(analysis.requiredMonthlyContribution).toBe(300);
  });

  test('should return isRealistic false and generate alternatives if savings exceed available balance', () => {
    const goal = {
      name: 'Buy Laptop',
      targetAmount: 4000,
      alreadySaved: 1000,
      targetDate: '2026-12-13', // ~5 months away
      isEssential: false,
    };
    const availableBalance = 200; // Needs 3000 / 5 = 600 monthly. 600 > 200.
    const analysis = analyzeGoalFeasibility(goal, availableBalance);

    expect(analysis.isRealistic).toBe(false);
    expect(analysis.explanation).toBeDefined();

    // Verify suggestions contain extension suggestion and target reducing suggestion
    expect(analysis.suggestions.length).toBeGreaterThanOrEqual(2);
    
    // Check reduced target amount
    const reduceTargetOpt = analysis.suggestions.find((s) =>
      s.text.toLowerCase().includes('reduce target amount')
    );
    expect(reduceTargetOpt).toBeDefined();
    // 200 (balance) * 5 (months) = 1000 + 1000 (already saved) = 2000 affordable target
    expect(reduceTargetOpt?.recommendedTargetAmount).toBe(2000);
  });
});
