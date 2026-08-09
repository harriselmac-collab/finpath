import { describe, expect, test } from '@jest/globals';
import { resolveIncomeTiming } from '../features/onboarding/incomeSchedule';

describe('income schedule timing', () => {
  const now = new Date(2027, 1, 10, 12);

  test('derives monthly and twice-monthly dates without changing saved answers', () => {
    expect(resolveIncomeTiming({ incomeFrequency: 'monthly', payday: 31 }, now)).toMatchObject({
      calculationDate: '2027-02-28', expectedDate: '2027-02-28', estimated: false,
    });
    expect(resolveIncomeTiming({ incomeFrequency: 'twiceMonthly', firstPayday: 5, secondPayday: 20 }, now).expectedDate).toBe('2027-02-20');
  });

  test('preserves explicit legacy dates and never fabricates an unknown payday', () => {
    expect(resolveIncomeTiming({ nextIncomeDate: '2027-03-04' }, now).expectedDate).toBe('2027-03-04');
    expect(resolveIncomeTiming({ incomeFrequency: 'irregular', incomeDateCertainty: 'notSure' }, now)).toEqual({
      calculationDate: '2027-03-12', expectedDate: null, estimated: true,
    });
  });
});
