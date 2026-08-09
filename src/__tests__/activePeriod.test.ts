import { describe, expect, test } from '@jest/globals';
import {
  calculateActiveFinancialPeriod,
  type ActiveFinancialPeriodInput,
  type PeriodTransaction,
} from '../features/financial-engine/activePeriod';

const timestamp = (date: string) => new Date(`${date}T12:00:00Z`).getTime();
const base: ActiveFinancialPeriodInput = {
  periodStart: '2026-08-01',
  nextIncomeDate: '2026-08-11',
  currentAvailableBalance: 5000,
  plannedIncome: 5000,
  plannedEssential: 2500,
  plannedFlexible: 1000,
  plannedDebt: 500,
  protectedBuffer: 500,
  currency: 'MAD',
  transactions: [],
  now: new Date('2026-08-03T12:00:00Z'),
};

const tx = (id: string, type: PeriodTransaction['type'], amount: number): PeriodTransaction => ({
  id,
  type,
  amount,
  timestamp: timestamp('2026-08-03'),
});

describe('active financial period safe-to-spend', () => {
  test('reserves unpaid essentials, debt, and protected buffer', () => {
    const result = calculateActiveFinancialPeriod(base);
    expect(result.safeToSpendTotal).toBe(1500);
    expect(result.remainingDays).toBe(8);
    expect(result.safeDailySpending).toBe(187.5);
  });

  test('does not subtract an essential purchase twice', () => {
    const result = calculateActiveFinancialPeriod({ ...base, transactions: [tx('essential', 'essential', 500)] });
    expect(result.currentAvailableBalance).toBe(4500);
    expect(result.remainingEssentialCommitments).toBe(2000);
    expect(result.safeToSpendTotal).toBe(1500);
  });

  test('reduces safe spending for flexible purchases', () => {
    const result = calculateActiveFinancialPeriod({ ...base, transactions: [tx('flexible', 'flexible', 500)] });
    expect(result.safeToSpendTotal).toBe(1000);
    expect(result.categoryOverspending.flexible).toBe(false);
  });

  test('does not subtract a paid debt commitment twice', () => {
    const result = calculateActiveFinancialPeriod({ ...base, transactions: [tx('debt', 'debt', 500)] });
    expect(result.remainingDebtCommitments).toBe(0);
    expect(result.safeToSpendTotal).toBe(1500);
  });

  test('uses confirmed income when income has been received', () => {
    const result = calculateActiveFinancialPeriod({ ...base, transactions: [tx('income', 'income', 3000)] });
    expect(result.confirmedIncome).toBe(3000);
    expect(result.safeToSpendTotal).toBe(4500);
    expect(result.shortfallAmount).toBe(0);
    expect(result.safeDailySpending).toBe(562.5);
  });

  test('edited and deleted expenses recalculate from the current balance', () => {
    const purchase = tx('purchase', 'flexible', 500);
    expect(calculateActiveFinancialPeriod({ ...base, transactions: [purchase] }).safeToSpendTotal).toBe(1000);
    expect(calculateActiveFinancialPeriod({ ...base, transactions: [{ ...purchase, amount: 200 }] }).safeToSpendTotal).toBe(1300);
    expect(calculateActiveFinancialPeriod({ ...base, transactions: [] }).safeToSpendTotal).toBe(1500);
  });

  test('keeps overdue commitments and excludes paid commitments', () => {
    const result = calculateActiveFinancialPeriod({
      ...base,
      commitments: [
        { id: 'overdue', amount: 200, dueDate: '2026-08-02', paid: false },
        { id: 'paid', amount: 300, dueDate: '2026-08-05', paid: true },
      ],
    });
    expect(result.remainingUpcomingCommitments).toBe(200);
    expect(result.safeToSpendTotal).toBe(1300);
  });

  test('refunds reverse spending and deleted transactions disappear from totals', () => {
    const purchase = tx('purchase', 'flexible', 500);
    const refund = tx('refund', 'refund', 100);
    expect(calculateActiveFinancialPeriod({ ...base, transactions: [purchase, refund] }).actualFlexible).toBe(400);
    expect(calculateActiveFinancialPeriod({ ...base, transactions: [refund] }).safeToSpendTotal).toBe(1600);
  });

  test('internal transfers do not change safe-to-spend', () => {
    expect(calculateActiveFinancialPeriod({ ...base, transactions: [tx('transfer', 'transfer', 900)] }).safeToSpendTotal).toBe(1500);
  });

  test('uses one day when the next income is today', () => {
    const result = calculateActiveFinancialPeriod({ ...base, nextIncomeDate: '2026-08-03' });
    expect(result.remainingDays).toBe(1);
    expect(result.safeDailySpending).toBe(1500);
  });

  test('respects zero-decimal currencies', () => {
    const result = calculateActiveFinancialPeriod({
      ...base,
      currency: 'JPY',
      currentAvailableBalance: 1000,
      plannedIncome: 1000,
      plannedEssential: 0,
      plannedDebt: 0,
      protectedBuffer: 0,
      nextIncomeDate: '2026-08-06',
    });
    expect(result.remainingDays).toBe(3);
    expect(result.safeDailySpending).toBe(333);
  });

  test('keeps high-value calculations deterministic', () => {
    const result = calculateActiveFinancialPeriod({
      ...base,
      currentAvailableBalance: 999_999_999.99,
      plannedIncome: 999_999_999.99,
      plannedEssential: 400_000_000.11,
      plannedDebt: 100_000_000.22,
      protectedBuffer: 0,
    });
    expect(result.safeToSpendTotal).toBe(499_999_999.66);
  });
});
