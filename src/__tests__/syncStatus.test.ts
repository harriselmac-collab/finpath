import { expect, test } from '@jest/globals';
import { useSyncStatusStore } from '../store/syncStatusStore';

test('keeps the last successful sync time while a later sync is in progress', () => {
  useSyncStatusStore.setState({ status: 'synced', lastSyncedAt: '2026-08-03T10:00:00.000Z', error: null });
  useSyncStatusStore.getState().setSyncStatus('syncing');

  expect(useSyncStatusStore.getState().lastSyncedAt).toBe('2026-08-03T10:00:00.000Z');
});
