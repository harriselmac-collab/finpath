import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { encryptedFinancialStorage } from '../services/storage/encryptedStorage';

export type SyncState = 'localOnly' | 'pendingUpload' | 'synced' | 'conflict' | 'failed' | 'pendingDelete';

export interface DeletionTombstone {
  id: string;
  deletedAt: string;
  ownerId: string;
}

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'essential' | 'flexible' | 'debt' | 'savings' | 'refund' | 'transfer';
  category: string;
  date: string;
  timeGroup: string;
  timestamp: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  syncState: SyncState;
  receiptUri?: string;
}

export const migrateTransactionsState = (persistedState: any) => {
  const now = new Date().toISOString();
  return {
    ...persistedState,
    transactions: Array.isArray(persistedState?.transactions)
      ? persistedState.transactions.map((transaction: any) => ({
          ...transaction,
          createdAt: transaction.createdAt || new Date(transaction.timestamp || Date.now()).toISOString(),
          updatedAt: transaction.updatedAt || transaction.createdAt || now,
          ownerId: transaction.ownerId || 'local',
          syncState: transaction.syncState || 'localOnly',
        }))
      : [],
  };
};

export const migrateTransactionsByOwner = (persistedState: any) => {
  const migrated = migrateTransactionsState(persistedState);
  if (persistedState?.transactionsByOwner) {
    const ownerId = persistedState.activeOwnerId || 'local';
    const deletedIds = Array.isArray(persistedState.deletedIds)
      ? persistedState.deletedIds.map((item: string | DeletionTombstone) => typeof item === 'string'
        ? { id: item, deletedAt: new Date(0).toISOString(), ownerId }
        : item)
      : [];
    return { ...migrated, ...persistedState, deletedIds };
  }
  const grouped = migrated.transactions.reduce((owners: Record<string, Transaction[]>, transaction: Transaction) => {
    (owners[transaction.ownerId] ||= []).push(transaction);
    return owners;
  }, {});
  return { ...migrated, activeOwnerId: null, transactions: [], transactionsByOwner: grouped, deletedIds: [] };
};

interface TransactionsState {
  transactions: Transaction[];
  transactionsByOwner: Record<string, Transaction[]>;
  activeOwnerId: string | null;
  deletedIds: DeletionTombstone[];
  setActiveOwner: (ownerId: string | null) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp' | 'createdAt' | 'updatedAt' | 'ownerId' | 'syncState'>) => void;
  removeTransaction: (id: string) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  clearTransactions: () => void;
  getTransactionsByType: (type: Transaction['type']) => Transaction[];
  getTransactionsByCategory: (category: string) => Transaction[];
  getTotalByType: (type: Transaction['type']) => number;
  getTotalByCategory: (category: string) => number;
  getDailyTotals: () => Record<string, number>;
  getMonthlyTotals: () => Record<string, number>;
}

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set, get) => ({
      transactions: [],
      transactionsByOwner: {},
      activeOwnerId: 'local',
      deletedIds: [],

      setActiveOwner: (ownerId) => set((state) => {
        const transactionsByOwner = state.activeOwnerId
          ? { ...state.transactionsByOwner, [state.activeOwnerId]: state.transactions }
          : state.transactionsByOwner;
        return { activeOwnerId: ownerId, transactionsByOwner, transactions: ownerId ? transactionsByOwner[ownerId] || [] : [] };
      }),

      addTransaction: (transaction) => {
        const now = new Date();
        const newTransaction = {
          ...transaction,
          id: globalThis.crypto?.randomUUID?.() ?? `${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
          timestamp: now.getTime(),
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          ownerId: get().activeOwnerId || 'local',
          syncState: 'localOnly' as const,
        };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },

      removeTransaction: (id) => {
        set((state) => {
          const transaction = state.transactions.find((item) => item.id === id);
          if (!transaction) return state;
          return {
            transactions: state.transactions.filter((item) => item.id !== id),
            deletedIds: [
              ...state.deletedIds.filter((item) => item.id !== id || item.ownerId !== transaction.ownerId),
              { id, deletedAt: new Date().toISOString(), ownerId: transaction.ownerId },
            ],
          };
        });
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date().toISOString(), syncState: 'localOnly' }
              : t
          ),
        }));
      },

      clearTransactions: () => {
        set({ transactions: [] });
      },

      getTransactionsByType: (type) => {
        return get().transactions.filter((t) => t.type === type);
      },

      getTransactionsByCategory: (category) => {
        return get().transactions.filter((t) => t.category === category);
      },

      getTotalByType: (type) => {
        return get()
          .transactions.filter((t) => t.type === type)
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getTotalByCategory: (category) => {
        return get()
          .transactions.filter((t) => t.category === category)
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getDailyTotals: () => {
        const dailyTotals: Record<string, number> = {};
        get().transactions.forEach((t) => {
          if (t.timestamp) {
            const date = new Date(t.timestamp);
            const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + t.amount;
          }
        });
        return dailyTotals;
      },

      getMonthlyTotals: () => {
        const monthlyTotals: Record<string, number> = {};
        get().transactions.forEach((t) => {
          if (t.timestamp) {
            const date = new Date(t.timestamp);
            const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + t.amount;
          }
        });
        return monthlyTotals;
      },
    }),
    {
      name: 'finpath-transactions-storage',
      storage: createJSONStorage(() => encryptedFinancialStorage),
      version: 3,
      migrate: migrateTransactionsByOwner,
      partialize: (state) => ({
        transactions: state.transactions,
        activeOwnerId: state.activeOwnerId,
        deletedIds: state.deletedIds,
        transactionsByOwner: state.activeOwnerId
          ? { ...state.transactionsByOwner, [state.activeOwnerId]: state.transactions }
          : state.transactionsByOwner,
      }),
    }
  )
);
