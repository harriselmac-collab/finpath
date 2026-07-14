import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'essential' | 'flexible' | 'debt' | 'savings';
  category: string;
  date: string;
  timeGroup: string;
  timestamp: number;
}

interface TransactionsState {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
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

      addTransaction: (transaction) => {
        const newTransaction = {
          ...transaction,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
        };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },

      removeTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
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
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);