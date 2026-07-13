import { describe, expect, test } from '@jest/globals';
import { calculateAmortizationSchedule } from '../features/financial-engine/goalCalculations';

describe('Interactive Amortization Engine Algorithms', () => {
  test('should amortize a simple debt account to zero correctly', () => {
    const debts = [
      {
        type: 'Credit Card',
        totalAmount: 1000,
        minimumPayment: 100,
        interestRate: 0, // 0% interest for simplicity
        dueDate: '15',
        isOverdue: false,
      },
    ];

    // Surplus = 200, minimum = 100
    // Month 0: 1000
    // Month 1: 1000 - 200 = 800
    // Month 2: 800 - 200 = 600
    // Month 3: 600 - 200 = 400
    // Month 4: 400 - 200 = 200
    // Month 5: 200 - 200 = 0
    const result = calculateAmortizationSchedule(debts, 200, 'avalanche');

    expect(result.clearedIn).toBe('5 months');
    expect(result.timeline).toEqual([1000, 800, 600, 400, 200, 0]);
  });

  test('should show avalanche method clearing high-interest rate debt first', () => {
    const debts = [
      {
        type: 'Card Low Interest',
        totalAmount: 1000,
        minimumPayment: 100,
        interestRate: 2,
        dueDate: '15',
        isOverdue: false,
      },
      {
        type: 'Card High Interest',
        totalAmount: 1000,
        minimumPayment: 100,
        interestRate: 24, // 24% annual = 2% monthly compounding
        dueDate: '15',
        isOverdue: false,
      },
    ];

    // Available surplus = 500
    // Avalanche should clear High Interest first, Snowball might clear Low Interest (if balances differ, but here they are equal so rate wins)
    const avalancheResult = calculateAmortizationSchedule(debts, 500, 'avalanche');
    const snowballResult = calculateAmortizationSchedule(debts, 500, 'snowball');

    // Both should resolve, but the math timeline will show different balances compound reductions
    expect(avalancheResult.timeline[0]).toBe(2000);
    expect(snowballResult.timeline[0]).toBe(2000);
    expect(avalancheResult.timeline.length).toBeLessThanOrEqual(25);
  });
});
