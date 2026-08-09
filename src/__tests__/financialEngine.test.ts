import { describe, expect, test } from '@jest/globals';
import {
  safeAdd,
  safeSubtract,
  safeMultiply,
  safeDivide,
  safeSum,
  formatCurrency,
} from '../utils/currency';
import {
  calculateFinancialProfile,
  calculateMonthlyAnnualPortion,
} from '../features/financial-engine/engine';
import { evaluateBudgetSafety } from '../features/financial-engine/safetyRules';
import { analyzeGoalFeasibility } from '../features/financial-engine/goalCalculations';

const monthsFromToday = (months: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
};

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

  test('should format currency with locale-aware separators and no forced decimals', () => {
    expect(formatCurrency(2500, 'MAD', 'en-US')).toContain('2,500');
    expect(formatCurrency(2500, 'MAD', 'en-US')).not.toContain('.00');
    expect(formatCurrency(2500.5, 'EUR', 'de-DE')).toContain('2.500,50');
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
        culturalPref: 'muslim',
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
    // Cultural preference alone never fabricates a monetary commitment.
    expect(profile.requiredUpcomingContributions).toBe(0);

    // Total planned outflows = 4600 (essentials) + 300 (debt) + 300 (annual) = 5200
    // Planned remainder = 8000 - 5200 = 2800
    expect(profile.realAvailableMonthlyBalance).toBe(2800);

    // 30-day planned allowance = 2800 / 30 = 93.33
    expect(profile.safeDailySpending).toBe(93.33);

    expect(profile.budgetDeficit).toBe(false);
    expect(profile.incomeCoverageRatio).toBe(1.63);
  });

  test('should mark annual commitments as a plan deficit when they exceed the remainder', () => {
    const profile = calculateFinancialProfile({
      answers: { mainIncome: 1000, housingAmount: 900 },
      debts: [],
      annualBills: [{ name: 'Insurance', amount: 2400, monthsRemaining: 12 }],
    });

    expect(profile.realAvailableMonthlyBalance).toBe(-100);
    expect(profile.budgetDeficit).toBe(true);
  });

  test('should not claim income coverage when no essential costs exist', () => {
    const profile = calculateFinancialProfile({ answers: { mainIncome: 1000 }, debts: [] });
    expect(profile.incomeCoverageRatio).toBeNull();
  });

  test('should use confirmed reviewed expenses as the authoritative plan input', () => {
    const profile = calculateFinancialProfile({
      answers: {
        mainIncome: 2000,
        housingAmount: 900,
        groceries: 500,
        reviewedExpenses: [
          { id: 'housing', amount: 800, isEssential: true },
          { id: 'custom-care', amount: 200, isEssential: true },
          { id: 'optional', amount: 300, isEssential: false },
        ],
      },
      debts: [],
    });

    expect(profile.essentialMonthlyExpenses).toBe(1000);
    expect(profile.flexibleMonthlyExpenses).toBe(300);
    expect(profile.realAvailableMonthlyBalance).toBe(700);
  });

  test('should include unreviewed flexible bills in the monthly plan fallback', () => {
    const profile = calculateFinancialProfile({
      answers: {
        mainIncome: 1000,
        subscriptions: 100,
        otherBills: 50,
      },
      debts: [],
    });

    expect(profile.flexibleMonthlyExpenses).toBe(150);
    expect(profile.realAvailableMonthlyBalance).toBe(850);
  });

  test('should always use current debt inputs instead of reviewed display rows', () => {
    const profile = calculateFinancialProfile({
      answers: {
        mainIncome: 2000,
        hasVehicle: 'yes',
        vehicleFinancing: true,
        vehiclePayment: 120,
        reviewedExpenses: [
          { id: 'housing', amount: 800, isEssential: true },
          { id: 'vehicleLoan', amount: 1, isEssential: true },
          { id: 'debtsMinimum', amount: 1, isEssential: true },
        ],
      },
      debts: [{
        type: 'Credit card',
        totalAmount: 1000,
        minimumPayment: 300,
        interestRate: 10,
        dueDate: '15',
        isOverdue: false,
      }],
    });

    expect(profile.minimumMonthlyDebtPayments).toBe(420);
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

  test('should include explicit planned commitments in shortfall detection', () => {
    const safetyReport = evaluateBudgetSafety(1000, 900, 0, {}, 200);
    expect(safetyReport.hasDeficit).toBe(true);
  });

  test('should not report a floating-point equality as a deficit', () => {
    expect(evaluateBudgetSafety(1000.3, 1000.1, 0.2, {}).hasDeficit).toBe(false);
  });
});

describe('Goal Feasibility Suggestions Engine', () => {
  test('should return isRealistic true if savings fit in available balance', () => {
    const goal = {
      name: 'Buy Phone',
      targetAmount: 2000,
      alreadySaved: 500,
      targetDate: monthsFromToday(5),
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
      targetDate: monthsFromToday(5),
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
