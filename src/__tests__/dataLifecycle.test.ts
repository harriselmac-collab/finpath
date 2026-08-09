import { jest, test, expect } from '@jest/globals';
import { clearLocalUserData } from '../services/data/clearLocalUserData';
import { useBillsStore } from '../store/billsStore';
import { useGoalsStore } from '../store/goalsStore';
import { useTransactionsStore } from '../store/transactionsStore';

const mockCancelAll = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

test('account cleanup cancels reminders and clears financial stores', async () => {
  useBillsStore.setState({ bills: [{ id: 'b', title: 'Rent', amount: 1, category: 'bill', recurrence: 'once', nextDueDate: '2026-09-01', reminderDaysBefore: 1, paid: false, isActive: true, ownerId: 'u', createdAt: '', updatedAt: '' }] });
  useGoalsStore.setState({ goals: [{ id: 'g', name: 'Goal', targetAmount: 1, alreadySaved: 0, targetDate: '2027-01-01', isEssential: false, classification: 'optional', category: 'other', vectorKey: 'target', colorKey: 'pocket_blue', reminder: { frequency: 'none' }, status: 'active', ownerId: 'local', syncState: 'localOnly', createdAt: '', updatedAt: '' }], contributions: [] });
  useTransactionsStore.setState({ transactions: [{ id: 't', name: 'Coffee', amount: 1, type: 'flexible', category: 'food', date: '', timeGroup: '', timestamp: 1, createdAt: '', updatedAt: '', ownerId: 'u', syncState: 'localOnly' }] });
  await clearLocalUserData(mockCancelAll);
  expect(mockCancelAll).toHaveBeenCalled();
  expect(useBillsStore.getState().bills).toEqual([]);
  expect(useGoalsStore.getState().goals).toEqual([]);
  expect(useTransactionsStore.getState().transactions).toEqual([]);
});
