import { describe, expect, jest, test } from '@jest/globals';
import { mergeTransactions, reconcileRemoteDeletions } from '../services/sync/financialSync';
import { Transaction } from '../store/transactionsStore';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

const local: Transaction = {
  id: '1', name: 'Local', amount: 10, type: 'flexible', category: 'Other', date: '2026-08-01',
  timeGroup: '', timestamp: Date.parse('2026-08-01'), createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-03T10:00:00Z', ownerId: 'user-1', syncState: 'localOnly',
};

describe('financial synchronization merge', () => {
  test('keeps a newer local edit', () => {
    const merged = mergeTransactions([local], [{ id: '1', name: 'Remote old', amount: 5, type: 'flexible', category: 'Other', transaction_date: '2026-08-01', created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-02T10:00:00Z' }], 'user-1');
    expect(merged[0].name).toBe('Local');
  });

  test('accepts a newer remote edit and scopes it to the current owner', () => {
    const merged = mergeTransactions([local], [{ id: '1', name: 'Remote new', amount: '12.50', type: 'flexible', category: 'Other', transaction_date: '2026-08-01', created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-04T10:00:00Z' }], 'user-1');
    expect(merged[0]).toMatchObject({ name: 'Remote new', amount: 12.5, ownerId: 'user-1', syncState: 'synced' });
  });

  test('applies a newer deletion only to the matching owner', () => {
    const remote = [{ id: '1', user_id: 'user-1', updated_at: '2026-08-03T09:00:00Z' }];
    const result = reconcileRemoteDeletions(remote, [
      { id: '1', ownerId: 'user-1', deletedAt: '2026-08-03T11:00:00Z' },
      { id: '1', ownerId: 'user-2', deletedAt: '2026-08-03T12:00:00Z' },
    ], 'user-1');

    expect(result.survivingRows).toEqual([]);
    expect(result.deletions).toHaveLength(1);
    expect(result.deletions[0].tombstone.ownerId).toBe('user-1');
  });

  test('keeps a remotely updated record when the deletion is stale', () => {
    const remote = [{ id: '1', user_id: 'user-1', updated_at: '2026-08-03T12:00:00Z' }];
    const result = reconcileRemoteDeletions(remote, [
      { id: '1', ownerId: 'user-1', deletedAt: '2026-08-03T11:00:00Z' },
    ], 'user-1');

    expect(result.survivingRows).toEqual(remote);
    expect(result.deletions).toEqual([]);
  });
});
