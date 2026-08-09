import { create } from 'zustand';

export type FinancialSyncStatus = 'localOnly' | 'syncing' | 'synced' | 'offline' | 'failed' | 'conflict';

interface SyncStatusState {
  status: FinancialSyncStatus;
  lastSyncedAt: string | null;
  error: string | null;
  setSyncStatus: (status: FinancialSyncStatus, error?: string | null) => void;
}

export const useSyncStatusStore = create<SyncStatusState>((set) => ({
  status: 'localOnly',
  lastSyncedAt: null,
  error: null,
  setSyncStatus: (status, error = null) => set((state) => ({
    status,
    error,
    lastSyncedAt: status === 'synced' ? new Date().toISOString() : state.lastSyncedAt,
  })),
}));
