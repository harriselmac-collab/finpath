import { describe, expect, test } from '@jest/globals';
import { calculateFinancialProfile } from '../features/financial-engine/engine';
import { evaluateBudgetSafety } from '../features/financial-engine/safetyRules';

describe('Dashboard Component Integration Logic', () => {
  // Test Scenario: Healthy Profile Data
  test('should compute correct available balance for healthy profile inputs', () => {
    const stateAnswers = {
      currency: 'MAD',
      mainIncome: 10000,
      secondIncome: 2000, // Total = 12000
      hasIncome: true,
      housingAmount: 3000,
      electricity: 150,
      water: 50,
      internet: 100,
      phone: 50,
      groceries: 2000,
      medicationExpenses: 0,
      healthInsurance: 0,
      medicalAppointments: 0,
      hasVehicle: 'no',
      culturalPref: 'none',
    };

    const debts: any[] = [];

    const profile = calculateFinancialProfile({ answers: stateAnswers, debts });
    const safety = evaluateBudgetSafety(
      profile.totalMonthlyIncome,
      profile.essentialMonthlyExpenses,
      profile.minimumMonthlyDebtPayments,
      stateAnswers
    );

    expect(profile.totalMonthlyIncome).toBe(12000);
    // Essentials = 3000 + 150 + 50 + 100 + 50 + 2000 = 5350
    expect(profile.essentialMonthlyExpenses).toBe(5350);
    expect(profile.realAvailableMonthlyBalance).toBe(6650);
    expect(safety.hasDeficit).toBe(false);
    expect(safety.warningMessage).toBeNull();
  });

  // Test Scenario: Deficit Profile Data
  test('should trigger deficit warnings on dashboard calculation with low income', () => {
    const stateAnswers = {
      currency: 'MAD',
      mainIncome: 4000,
      hasIncome: true,
      housingAmount: 3000,
      groceries: 2000, // Total Essentials = 5000 (Exceeds 4000)
      electricity: 0,
      water: 0,
      internet: 0,
      phone: 0,
      medicationExpenses: 0,
      healthInsurance: 0,
      medicalAppointments: 0,
      hasVehicle: 'no',
      culturalPref: 'none',
    };

    const debts: any[] = [];

    const profile = calculateFinancialProfile({ answers: stateAnswers, debts });
    const safety = evaluateBudgetSafety(
      profile.totalMonthlyIncome,
      profile.essentialMonthlyExpenses,
      profile.minimumMonthlyDebtPayments,
      stateAnswers
    );

    expect(profile.totalMonthlyIncome).toBe(4000);
    expect(profile.essentialMonthlyExpenses).toBe(5000);
    expect(safety.hasDeficit).toBe(true);
    expect(safety.warningMessage).toBe(
      'Your current income does not fully cover your essential needs. This is an income shortfall, not simply a spending-discipline problem.'
    );
  });

  // Test Scenario: Debt Pressure scale on Dashboard
  test('should calculate critical debt pressure if payments exceed 40% of income', () => {
    const stateAnswers = {
      mainIncome: 5000,
      hasIncome: true,
      hasVehicle: 'no',
    };
    const debts = [
      { type: 'Personal Loan', totalAmount: 20000, minimumPayment: 2200, interestRate: 10, dueDate: '10', isOverdue: false }
    ]; // 2200 / 5000 = 44% (> 40%)

    const profile = calculateFinancialProfile({ answers: stateAnswers, debts });
    expect(profile.debtPressure).toBe('critical');
    expect(profile.debtPressureRatio).toBe(0.44);
  });
});
