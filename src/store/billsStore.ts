import { encryptedFinancialStorage } from '../services/storage/encryptedStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { DeletionTombstone } from './transactionsStore';

export type BillRecurrence = 'weekly' | 'monthly' | 'yearly' | 'once';

export interface Bill {
  id: string;
  title: string;
  amount: number;
  category: string;
  recurrence: BillRecurrence;
  nextDueDate: string;
  endDate?: string;
  reminderDaysBefore: number;
  paid: boolean;
  isActive: boolean;
  notificationId?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

type NewBill = Omit<Bill, 'id' | 'paid' | 'isActive' | 'notificationId' | 'createdAt' | 'updatedAt' | 'ownerId'>;

interface BillsState {
  bills: Bill[];
  billsByOwner: Record<string, Bill[]>;
  activeOwnerId: string | null;
  deletedIds: DeletionTombstone[];
  setActiveOwner: (ownerId: string | null) => void;
  addBill: (bill: NewBill) => string | null;
  updateBill: (id: string, updates: Partial<Omit<Bill, 'id' | 'createdAt'>>) => void;
  deleteBill: (id: string) => void;
  markBillPaid: (id: string) => void;
  setNotificationId: (id: string, notificationId?: string) => void;
  clearBills: () => void;
}

const createId = () => globalThis.crypto?.randomUUID?.()
  ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const isValidBill = (bill: NewBill) => (
  bill.title.trim().length > 0
  && Number.isFinite(bill.amount)
  && bill.amount > 0
  && !Number.isNaN(new Date(`${bill.nextDueDate}T12:00:00`).getTime())
  && Number.isInteger(bill.reminderDaysBefore)
  && bill.reminderDaysBefore >= 0
  && (!bill.endDate || bill.endDate >= bill.nextDueDate)
);

export const getNextBillDueDate = (dueDate: string, recurrence: BillRecurrence) => {
  if (recurrence === 'once') return null;
  const date = new Date(`${dueDate}T12:00:00`);
  if (recurrence === 'weekly') date.setDate(date.getDate() + 7);
  if (recurrence === 'monthly') date.setMonth(date.getMonth() + 1);
  if (recurrence === 'yearly') date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

export const useBillsStore = create<BillsState>()(
  persist(
    (set) => ({
      bills: [],
      billsByOwner: {},
      activeOwnerId: 'local',
      deletedIds: [],
      setActiveOwner: (ownerId) => set((state) => {
        const billsByOwner = state.activeOwnerId
          ? { ...state.billsByOwner, [state.activeOwnerId]: state.bills }
          : state.billsByOwner;
        return { activeOwnerId: ownerId, billsByOwner, bills: ownerId ? billsByOwner[ownerId] || [] : [] };
      }),
      addBill: (bill) => {
        if (!isValidBill(bill)) return null;
        const id = createId();
        const now = new Date().toISOString();
        set((state) => ({ bills: [...state.bills, {
          ...bill,
          title: bill.title.trim(),
          id,
          paid: false,
          isActive: true,
          ownerId: state.activeOwnerId || 'local',
          createdAt: now,
          updatedAt: now,
        }] }));
        return id;
      },
      updateBill: (id, updates) => set((state) => ({
        bills: state.bills.map((bill) => bill.id === id
          ? { ...bill, ...updates, updatedAt: new Date().toISOString() }
          : bill),
      })),
      deleteBill: (id) => set((state) => {
        const bill = state.bills.find((item) => item.id === id);
        if (!bill) return state;
        return {
          bills: state.bills.filter((item) => item.id !== id),
          deletedIds: [
            ...state.deletedIds.filter((item) => item.id !== id || item.ownerId !== bill.ownerId),
            { id, deletedAt: new Date().toISOString(), ownerId: bill.ownerId },
          ],
        };
      }),
      markBillPaid: (id) => set((state) => ({
        bills: state.bills.map((bill) => {
          if (bill.id !== id) return bill;
          const nextDueDate = getNextBillDueDate(bill.nextDueDate, bill.recurrence);
          const isActive = Boolean(nextDueDate && (!bill.endDate || nextDueDate <= bill.endDate));
          return {
            ...bill,
            paid: !isActive,
            isActive,
            nextDueDate: nextDueDate || bill.nextDueDate,
            notificationId: undefined,
            updatedAt: new Date().toISOString(),
          };
        }),
      })),
      setNotificationId: (id, notificationId) => set((state) => ({
        bills: state.bills.map((bill) => bill.id === id
          ? { ...bill, notificationId, updatedAt: new Date().toISOString() }
          : bill),
      })),
      clearBills: () => set({ bills: [] }),
    }),
    {
      name: 'finpath-bills-storage',
      storage: createJSONStorage(() => encryptedFinancialStorage),
      version: 2,
      migrate: (persisted: any) => {
        const activeOwnerId = persisted?.activeOwnerId || 'local';
        const migrateBill = (bill: any, ownerId: string) => ({ ...bill, ownerId: bill.ownerId || ownerId });
        const migrateTombstones = (items: (string | DeletionTombstone)[] | undefined) => Array.isArray(items)
          ? items.map((item) => typeof item === 'string'
            ? { id: item, deletedAt: new Date(0).toISOString(), ownerId: activeOwnerId }
            : item)
          : [];
        if (persisted?.billsByOwner) {
          const billsByOwner = Object.fromEntries(Object.entries(persisted.billsByOwner).map(([ownerId, bills]) => [
            ownerId,
            Array.isArray(bills) ? bills.map((bill) => migrateBill(bill, ownerId)) : [],
          ]));
          return {
            ...persisted,
            billsByOwner,
            bills: Array.isArray(persisted.bills) ? persisted.bills.map((bill: any) => migrateBill(bill, activeOwnerId)) : [],
            deletedIds: migrateTombstones(persisted.deletedIds),
          };
        }
        return {
          ...persisted,
          bills: [],
          activeOwnerId: null,
          deletedIds: [],
          billsByOwner: { local: Array.isArray(persisted?.bills) ? persisted.bills.map((bill: any) => migrateBill(bill, 'local')) : [] },
        };
      },
      partialize: (state) => ({
        bills: state.bills, activeOwnerId: state.activeOwnerId, deletedIds: state.deletedIds,
        billsByOwner: state.activeOwnerId
          ? { ...state.billsByOwner, [state.activeOwnerId]: state.bills }
          : state.billsByOwner,
      }),
    },
  ),
);
