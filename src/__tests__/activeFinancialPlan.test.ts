import { describe, expect, test } from '@jest/globals';
import { calculateActiveFinancialPlan } from '../features/financial-engine/activeFinancialPlan';

describe('active financial plan assembly', () => {
  test('uses one plan definition for profile, income timing, commitments, and safe-to-spend', () => {
    const result = calculateActiveFinancialPlan({
      answers: {
        currency: 'MAD',
        mainIncome: 5000,
        availableBalance: 5000,
        essentialBillsDue: 2500,
        debtMinimumDue: 500,
        upcomingFlexibleSpending: 1000,
        protectedBuffer: 500,
        annualExpenseDue: 200,
        incomeFrequency: 'irregular',
        incomeDateCertainty: 'exact',
        nextIncomeDate: '2026-08-11',
      },
      debts: [],
      bills: [
        { id: 'active', amount: 300, nextDueDate: '2026-08-09', paid: false, isActive: true },
        { id: 'inactive', amount: 900, nextDueDate: '2026-08-09', paid: false, isActive: false },
      ],
      now: new Date('2026-08-03T12:00:00Z'),
    });

    expect(result.profile.totalMonthlyIncome).toBe(5000);
    expect(result.profile.flexibleMonthlyExpenses).toBe(1000);
    expect(result.profile.minimumMonthlyDebtPayments).toBe(500);
    expect(result.incomeTiming.calculationDate).toBe('2026-08-11');
    expect(result.activePeriod.remainingUpcomingCommitments).toBe(500);
    expect(result.activePeriod.safeToSpendTotal).toBe(1000);
  });
});
