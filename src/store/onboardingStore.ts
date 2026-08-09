import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { encryptedFinancialStorage } from '../services/storage/encryptedStorage';
import { normalizeCountryCode } from '../services/localization/countries';

export interface DebtInfo {
  type: string;
  totalAmount: number;
  minimumPayment: number;
  interestRate: number;
  dueDate: string;
  isOverdue: boolean;
}

export interface OnboardingState {
  answers: Record<string, any>;
  currentStep: number;
  debts: DebtInfo[];
  onboardingCompleted: boolean;
  updatedAt: string | null;
  syncState: 'localOnly' | 'pendingUpload' | 'synced' | 'failed';
  dataByOwner: Record<string, Pick<OnboardingState, 'answers' | 'currentStep' | 'debts' | 'onboardingCompleted' | 'updatedAt' | 'syncState'>>;
  activeOwnerId: string | null;
  setActiveOwner: (ownerId: string | null) => void;
  setAnswer: (key: string, value: any) => void;
  setAnswers: (answers: Record<string, any>) => void;
  setCurrentStep: (step: number) => void;
  addDebt: (debt: DebtInfo) => void;
  removeDebt: (index: number) => void;
  updateDebt: (index: number, debt: DebtInfo) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  resetOnboarding: () => void;
}

export const migrateOnboardingState = (persistedState: any) => {
  const countryCode = normalizeCountryCode(persistedState?.answers?.country);
  const answers = countryCode
    ? { ...persistedState?.answers, country: countryCode }
    : { ...(persistedState?.answers || {}) };
  if (answers.nextIncomeDate && !answers.incomeFrequency) {
    answers.incomeFrequency = 'irregular';
    answers.incomeDateCertainty = 'exact';
  }
  return {
    ...persistedState,
    answers,
    updatedAt: persistedState?.updatedAt || null,
    syncState: persistedState?.syncState || 'localOnly',
  };
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      answers: {},
      currentStep: 0,
      debts: [],
      onboardingCompleted: false,
      updatedAt: null,
      syncState: 'localOnly',
      dataByOwner: {},
      activeOwnerId: 'local',

      setActiveOwner: (ownerId) => set((state) => {
        const current = { answers: state.answers, currentStep: state.currentStep, debts: state.debts, onboardingCompleted: state.onboardingCompleted, updatedAt: state.updatedAt, syncState: state.syncState };
        const dataByOwner = state.activeOwnerId ? { ...state.dataByOwner, [state.activeOwnerId]: current } : state.dataByOwner;
        const data = ownerId ? dataByOwner[ownerId] : undefined;
        return { activeOwnerId: ownerId, dataByOwner, ...(data || { answers: {}, currentStep: 0, debts: [], onboardingCompleted: false, updatedAt: null, syncState: 'localOnly' as const }) };
      }),

      setAnswer: (key, value) =>
        set((state) => {
          const answers = { ...state.answers, [key]: value };
          if (key !== 'reviewedExpenses') {
            delete answers.reviewedExpenses;
            delete answers.reviewedExpensesVersion;
          }
          return {
            answers,
            onboardingCompleted: state.onboardingCompleted,
            updatedAt: new Date().toISOString(),
            syncState: 'localOnly',
          };
        }),

      setAnswers: (answers) =>
        set(() => ({
          answers,
          updatedAt: new Date().toISOString(),
          syncState: 'localOnly',
        })),

      setCurrentStep: (step) =>
        set(() => ({
          currentStep: step,
          updatedAt: new Date().toISOString(),
        })),

      addDebt: (debt) =>
        set((state) => {
          const answers = { ...state.answers };
          delete answers.reviewedExpenses;
          delete answers.reviewedExpensesVersion;
          return { debts: [...state.debts, debt], answers, onboardingCompleted: state.onboardingCompleted, updatedAt: new Date().toISOString(), syncState: 'localOnly' };
        }),

      removeDebt: (index) =>
        set((state) => {
          const answers = { ...state.answers };
          delete answers.reviewedExpenses;
          delete answers.reviewedExpensesVersion;
          return {
            debts: state.debts.filter((_, i) => i !== index),
            answers,
            onboardingCompleted: state.onboardingCompleted,
            updatedAt: new Date().toISOString(),
            syncState: 'localOnly',
          };
        }),

      updateDebt: (index, updatedDebt) =>
        set((state) => {
          const answers = { ...state.answers };
          delete answers.reviewedExpenses;
          delete answers.reviewedExpensesVersion;
          return {
            debts: state.debts.map((debt, i) => (i === index ? updatedDebt : debt)),
            answers,
            onboardingCompleted: state.onboardingCompleted,
            updatedAt: new Date().toISOString(),
            syncState: 'localOnly',
          };
        }),

      setOnboardingCompleted: (completed) =>
        set(() => ({
          onboardingCompleted: completed,
          updatedAt: new Date().toISOString(),
          syncState: 'localOnly',
        })),

      resetOnboarding: () =>
        set(() => ({
          answers: {},
          currentStep: 0,
          debts: [],
          onboardingCompleted: false,
          updatedAt: new Date().toISOString(),
          syncState: 'localOnly',
        })),
    }),
    {
      name: 'finpath-onboarding-storage',
      storage: createJSONStorage(() => encryptedFinancialStorage),
      version: 5,
      migrate: (persisted: any) => {
        if (persisted?.dataByOwner) {
          const activeOwnerId = persisted.activeOwnerId || 'local';
          const dataByOwner = Object.fromEntries(Object.entries(persisted.dataByOwner).map(([ownerId, data]) => [ownerId, migrateOnboardingState(data)]));
          return { ...migrateOnboardingState(persisted), ...(dataByOwner[activeOwnerId] || {}), activeOwnerId, dataByOwner };
        }
        return { ...migrateOnboardingState(persisted), activeOwnerId: 'local', dataByOwner: { local: migrateOnboardingState(persisted) } };
      },
      partialize: (state) => ({
        answers: state.answers, currentStep: state.currentStep, debts: state.debts, onboardingCompleted: state.onboardingCompleted, updatedAt: state.updatedAt, syncState: state.syncState, activeOwnerId: state.activeOwnerId,
        dataByOwner: state.activeOwnerId ? { ...state.dataByOwner, [state.activeOwnerId]: { answers: state.answers, currentStep: state.currentStep, debts: state.debts, onboardingCompleted: state.onboardingCompleted, updatedAt: state.updatedAt, syncState: state.syncState } } : state.dataByOwner,
      }),
    }
  )
);
