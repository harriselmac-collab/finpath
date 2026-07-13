import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  setAnswer: (key: string, value: any) => void;
  setAnswers: (answers: Record<string, any>) => void;
  setCurrentStep: (step: number) => void;
  addDebt: (debt: DebtInfo) => void;
  removeDebt: (index: number) => void;
  updateDebt: (index: number, debt: DebtInfo) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      answers: {},
      currentStep: 0,
      debts: [],
      onboardingCompleted: false,

      setAnswer: (key, value) =>
        set((state) => ({
          answers: { ...state.answers, [key]: value },
        })),

      setAnswers: (answers) =>
        set(() => ({
          answers,
        })),

      setCurrentStep: (step) =>
        set(() => ({
          currentStep: step,
        })),

      addDebt: (debt) =>
        set((state) => ({
          debts: [...state.debts, debt],
        })),

      removeDebt: (index) =>
        set((state) => ({
          debts: state.debts.filter((_, i) => i !== index),
        })),

      updateDebt: (index, updatedDebt) =>
        set((state) => ({
          debts: state.debts.map((debt, i) => (i === index ? updatedDebt : debt)),
        })),

      setOnboardingCompleted: (completed) =>
        set(() => ({
          onboardingCompleted: completed,
        })),

      resetOnboarding: () =>
        set(() => ({
          answers: {},
          currentStep: 0,
          debts: [],
          onboardingCompleted: false,
        })),
    }),
    {
      name: 'finpath-onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
