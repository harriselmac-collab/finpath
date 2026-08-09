import { beforeEach, expect, jest, test } from '@jest/globals';
import { clearLocalUserData } from '../services/data/clearLocalUserData';
import { applyLocalSnapshot, captureLocalFinancialData, migrateLocalDataToAccount } from '../services/sync/guestMigration';
import { synchronizeFinancialData } from '../services/sync/financialSync';
import { useBillsStore } from '../store/billsStore';
import { useGoalsStore } from '../store/goalsStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { useTransactionsStore } from '../store/transactionsStore';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));
jest.mock('../services/sync/financialSync', () => ({ synchronizeFinancialData: jest.fn() }));

const syncMock = synchronizeFinancialData as jest.MockedFunction<typeof synchronizeFinancialData>;
const transaction = { id: 'local-tx', name: 'Food', amount: 20, type: 'essential' as const, category: 'food', date: '2026-08-03', timeGroup: '', timestamp: 1, createdAt: '2026-08-03T00:00:00Z', updatedAt: '2026-08-03T00:00:00Z', ownerId: 'local', syncState: 'localOnly' as const };

beforeEach(() => {
  useTransactionsStore.setState({ activeOwnerId: 'local', transactions: [transaction], transactionsByOwner: {} });
  useGoalsStore.setState({ activeOwnerId: 'local', goals: [], contributions: [], dataByOwner: {} });
  useBillsStore.setState({ activeOwnerId: 'local', bills: [], billsByOwner: {} });
  useOnboardingStore.setState({ activeOwnerId: 'local', answers: { currency: 'MAD' }, currentStep: 3, debts: [], onboardingCompleted: true, dataByOwner: {} });
  syncMock.mockReset();
});

test('keeps stable IDs and prevents duplicate records during local-to-account migration', () => {
  const snapshot = captureLocalFinancialData();
  useTransactionsStore.getState().setActiveOwner('user-1');
  applyLocalSnapshot(snapshot, 'user-1');
  applyLocalSnapshot(snapshot, 'user-1');
  expect(useTransactionsStore.getState().transactions).toHaveLength(1);
  expect(useTransactionsStore.getState().transactions[0]).toMatchObject({ id: 'local-tx', ownerId: 'user-1' });
  expect(useTransactionsStore.getState().transactionsByOwner.local).toEqual([transaction]);
});

test('reports failed upload while keeping guest data intact', async () => {
  const snapshot = captureLocalFinancialData();
  useTransactionsStore.getState().setActiveOwner('user-1');
  syncMock.mockResolvedValue(false);
  await expect(migrateLocalDataToAccount(snapshot, 'user-1')).resolves.toBe(false);
  expect(useTransactionsStore.getState().transactionsByOwner.local).toEqual([transaction]);
});

test('successful migration uploads the preserved local snapshot', async () => {
  const snapshot = captureLocalFinancialData();
  useTransactionsStore.getState().setActiveOwner('user-1');
  syncMock.mockResolvedValue(true);
  await expect(migrateLocalDataToAccount(snapshot, 'user-1')).resolves.toBe(true);
  expect(syncMock).toHaveBeenCalledTimes(1);
});

test('clearing account data does not delete unrelated guest data', async () => {
  useTransactionsStore.getState().setActiveOwner('user-1');
  useTransactionsStore.setState({ transactions: [{ ...transaction, id: 'account-tx', ownerId: 'user-1' }] });
  await clearLocalUserData(jest.fn<() => Promise<void>>().mockResolvedValue(undefined));
  useTransactionsStore.getState().setActiveOwner('local');
  expect(useTransactionsStore.getState().transactions).toEqual([transaction]);
});
