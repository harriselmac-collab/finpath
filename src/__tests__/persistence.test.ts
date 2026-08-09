import { describe, expect, jest, test } from '@jest/globals';
import { migrateOnboardingState } from '../store/onboardingStore';
import { migrateTransactionsByOwner, migrateTransactionsState, useTransactionsStore } from '../store/transactionsStore';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

describe('local persistence migrations', () => {
  test('preserves legacy onboarding data while adding metadata', () => {
    const legacy = { answers: { mainIncome: 5000, nextIncomeDate: '2026-08-15' }, debts: [], onboardingCompleted: true };
    expect(migrateOnboardingState(legacy)).toMatchObject({
      answers: { mainIncome: 5000, nextIncomeDate: '2026-08-15', incomeFrequency: 'irregular', incomeDateCertainty: 'exact' },
      onboardingCompleted: true,
      updatedAt: null,
      syncState: 'localOnly',
    });
  });

  test('preserves legacy transactions while adding stable persistence metadata', () => {
    const legacy = {
      transactions: [{ id: 'legacy-1', name: 'Rent', amount: 1000, timestamp: 1700000000000 }],
    };
    const migrated = migrateTransactionsState(legacy).transactions[0];

    expect(migrated).toMatchObject({
      id: 'legacy-1',
      name: 'Rent',
      amount: 1000,
      ownerId: 'local',
      syncState: 'localOnly',
    });
    expect(migrated.createdAt).toBe(new Date(1700000000000).toISOString());
    expect(migrated.updatedAt).toBeTruthy();
  });
});

describe('transaction account isolation', () => {
  test('migrates legacy records into owner buckets', () => {
    const migrated = migrateTransactionsByOwner({ transactions: [{ id: '1', name: 'Old', amount: 1, type: 'flexible', category: 'Other', date: '', timeGroup: '', timestamp: 1, ownerId: 'user-a' }] });
    expect(migrated.transactionsByOwner['user-a']).toHaveLength(1);
    expect(migrated.transactions).toEqual([]);
  });

  test('does not expose records when switching accounts', () => {
    useTransactionsStore.setState({ transactions: [], transactionsByOwner: {}, activeOwnerId: null });
    useTransactionsStore.getState().setActiveOwner('user-a');
    useTransactionsStore.getState().addTransaction({ name: 'A only', amount: 10, type: 'flexible', category: 'Other', date: '', timeGroup: '' });
    useTransactionsStore.getState().setActiveOwner('user-b');
    expect(useTransactionsStore.getState().transactions).toEqual([]);
    useTransactionsStore.getState().addTransaction({ name: 'B only', amount: 20, type: 'flexible', category: 'Other', date: '', timeGroup: '' });
    useTransactionsStore.getState().setActiveOwner('user-a');
    expect(useTransactionsStore.getState().transactions.map(({ name }) => name)).toEqual(['A only']);
  });
});
