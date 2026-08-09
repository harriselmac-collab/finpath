import { encryptedFinancialStorage } from '../services/storage/encryptedStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  DEFAULT_GOAL_CATEGORY,
  DEFAULT_GOAL_COLOR,
  DEFAULT_GOAL_VECTOR,
  GoalCategoryKey,
  GoalColorKey,
  GoalVectorKey,
  isGoalCategoryKey,
  isGoalColorKey,
  isGoalVectorKey,
} from '../constants/goals';
import { safeAdd, safeSubtract } from '../utils/currency';
import type { DeletionTombstone, SyncState } from './transactionsStore';

export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived';
export type GoalPriority = 'essential' | 'important' | 'optional';
export type GoalReminderFrequency = 'none' | 'weekly' | 'monthly' | 'once';

export interface GoalReminder {
  frequency: GoalReminderFrequency;
  date?: string;
  notificationId?: string;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  alreadySaved: number;
  targetDate: string;
  isEssential: boolean;
  classification: GoalPriority;
  category: GoalCategoryKey;
  vectorKey: GoalVectorKey;
  colorKey: GoalColorKey;
  reminder: GoalReminder;
  status: GoalStatus;
  completedAt?: string;
  celebrationShownAt?: string;
  ownerId: string;
  syncState: SyncState;
  createdAt: string;
  updatedAt: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  contributionDate: string;
  note?: string;
  ownerId: string;
  syncState: SyncState;
  createdAt: string;
  updatedAt: string;
}

type NewGoal = Omit<Goal, 'id' | 'status' | 'completedAt' | 'celebrationShownAt' | 'createdAt' | 'updatedAt' | 'ownerId' | 'syncState' | 'category' | 'vectorKey' | 'colorKey' | 'reminder'>
  & Partial<Pick<Goal, 'category' | 'vectorKey' | 'colorKey' | 'reminder'>>;

interface GoalsState {
  goals: Goal[];
  contributions: GoalContribution[];
  dataByOwner: Record<string, { goals: Goal[]; contributions: GoalContribution[] }>;
  activeOwnerId: string | null;
  deletedGoalIds: DeletionTombstone[];
  deletedContributionIds: DeletionTombstone[];
  setActiveOwner: (ownerId: string | null) => void;
  addGoal: (goal: NewGoal) => string;
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void;
  deleteGoal: (id: string) => void;
  setGoalStatus: (id: string, status: GoalStatus) => void;
  markCelebrationShown: (id: string) => void;
  addContribution: (goalId: string, amount: number, contributionDate?: string, note?: string, submissionId?: string) => string | null;
  updateContribution: (id: string, amount: number, contributionDate?: string, note?: string) => void;
  deleteContribution: (id: string) => void;
  clearGoals: () => void;
}

const createId = () => globalThis.crypto?.randomUUID?.()
  ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const migrateGoal = (goal: any): Goal => {
  const now = goal.updatedAt || goal.createdAt || new Date().toISOString();
  const status: GoalStatus = ['active', 'paused', 'completed', 'archived'].includes(goal.status) ? goal.status : 'active';
  return {
    ...goal,
    id: goal.id || createId(),
    name: String(goal.name || goal.title || ''),
    description: goal.description || undefined,
    category: isGoalCategoryKey(goal.category) ? goal.category : DEFAULT_GOAL_CATEGORY,
    vectorKey: isGoalVectorKey(goal.vectorKey) ? goal.vectorKey : DEFAULT_GOAL_VECTOR,
    colorKey: isGoalColorKey(goal.colorKey) ? goal.colorKey : DEFAULT_GOAL_COLOR,
    reminder: goal.reminder && ['none', 'weekly', 'monthly', 'once'].includes(goal.reminder.frequency)
      ? goal.reminder
      : { frequency: 'none' },
    classification: ['essential', 'important', 'optional'].includes(goal.classification)
      ? goal.classification
      : goal.isEssential ? 'essential' : 'important',
    status,
    completedAt: goal.completedAt || (status === 'completed' ? now : undefined),
    celebrationShownAt: goal.celebrationShownAt || (status === 'completed' ? now : undefined),
    ownerId: goal.ownerId || 'local',
    syncState: goal.syncState || 'localOnly',
    createdAt: goal.createdAt || now,
    updatedAt: now,
  };
};

const migrateContribution = (item: any): GoalContribution => ({
  ...item,
  id: item.id || createId(),
  note: item.note || undefined,
  ownerId: item.ownerId || 'local',
  syncState: item.syncState || 'localOnly',
  createdAt: item.createdAt || item.updatedAt || new Date().toISOString(),
  updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
});

export const migrateGoalsState = (persisted: any) => {
  const migrateOwner = (data: any) => ({
    goals: Array.isArray(data?.goals) ? data.goals.map(migrateGoal) : [],
    contributions: Array.isArray(data?.contributions) ? data.contributions.map(migrateContribution) : [],
  });
  const dataByOwner = persisted?.dataByOwner
    ? Object.fromEntries(Object.entries(persisted.dataByOwner).map(([owner, data]) => [owner, migrateOwner(data)]))
    : { local: migrateOwner(persisted) };
  const activeOwnerId = persisted?.activeOwnerId || 'local';
  const active = migrateOwner(persisted?.dataByOwner ? persisted : dataByOwner[activeOwnerId]);
  const migrateTombstones = (items: (string | DeletionTombstone)[] | undefined) => Array.isArray(items)
    ? items.map((item) => typeof item === 'string'
      ? { id: item, deletedAt: new Date(0).toISOString(), ownerId: activeOwnerId }
      : item)
    : [];
  return {
    ...persisted,
    ...active,
    activeOwnerId,
    dataByOwner,
    deletedGoalIds: migrateTombstones(persisted?.deletedGoalIds),
    deletedContributionIds: migrateTombstones(persisted?.deletedContributionIds),
  };
};

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      goals: [],
      contributions: [],
      dataByOwner: {},
      activeOwnerId: 'local',
      deletedGoalIds: [],
      deletedContributionIds: [],
      setActiveOwner: (ownerId) => set((state) => {
        const dataByOwner = state.activeOwnerId
          ? { ...state.dataByOwner, [state.activeOwnerId]: { goals: state.goals, contributions: state.contributions } }
          : state.dataByOwner;
        const ownerData = ownerId ? dataByOwner[ownerId] : undefined;
        return { activeOwnerId: ownerId, dataByOwner, goals: ownerData?.goals || [], contributions: ownerData?.contributions || [] };
      }),
      addGoal: (goal) => {
        const id = createId();
        const now = new Date().toISOString();
        set((state) => ({
          goals: [...state.goals, {
            ...goal,
            id,
            category: goal.category || DEFAULT_GOAL_CATEGORY,
            vectorKey: goal.vectorKey || DEFAULT_GOAL_VECTOR,
            colorKey: goal.colorKey || DEFAULT_GOAL_COLOR,
            reminder: goal.reminder || { frequency: 'none' },
            status: 'active',
            ownerId: state.activeOwnerId || 'local',
            syncState: 'localOnly',
            createdAt: now,
            updatedAt: now,
          }],
          contributions: goal.alreadySaved > 0
            ? [...state.contributions, {
                id: createId(),
                goalId: id,
                amount: goal.alreadySaved,
                contributionDate: now.slice(0, 10),
                ownerId: state.activeOwnerId || 'local',
                syncState: 'localOnly',
                createdAt: now,
                updatedAt: now,
              }]
            : state.contributions,
        }));
        return id;
      },
      updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map((goal) => goal.id === id
          ? { ...goal, ...updates, updatedAt: new Date().toISOString(), syncState: 'localOnly' }
          : goal),
      })),
      deleteGoal: (id) => set((state) => {
        const goal = state.goals.find((item) => item.id === id);
        if (!goal) return state;
        const deletedAt = new Date().toISOString();
        return {
          goals: state.goals.filter((item) => item.id !== id),
          contributions: state.contributions.filter((contribution) => contribution.goalId !== id),
          deletedGoalIds: [
            ...state.deletedGoalIds.filter((item) => item.id !== id || item.ownerId !== goal.ownerId),
            { id, deletedAt, ownerId: goal.ownerId },
          ],
          deletedContributionIds: [
            ...state.deletedContributionIds,
            ...state.contributions
              .filter((item) => item.goalId === id)
              .map((item) => ({ id: item.id, deletedAt, ownerId: item.ownerId })),
          ],
        };
      }),
      setGoalStatus: (id, status) => set((state) => {
        const goal = state.goals.find((item) => item.id === id);
        if (!goal) return state;
        const now = new Date().toISOString();
        return {
          goals: state.goals.map((item) => item.id === id
            ? {
                ...item,
                status,
                completedAt: status === 'completed' ? item.completedAt || now : undefined,
                celebrationShownAt: status === 'completed' ? item.celebrationShownAt : undefined,
                reminder: status === 'completed' ? { frequency: 'none' } : item.reminder,
                syncState: 'localOnly',
                updatedAt: now,
              }
            : item),
          contributions: state.contributions,
        };
      }),
      markCelebrationShown: (id) => set((state) => ({
        goals: state.goals.map((goal) => goal.id === id
          ? { ...goal, celebrationShownAt: new Date().toISOString(), updatedAt: new Date().toISOString(), syncState: 'localOnly' }
          : goal),
      })),
      addContribution: (goalId, amount, contributionDate, note, submissionId) => {
        if (!Number.isFinite(amount) || amount <= 0) return null;
        const id = submissionId || createId();
        const now = new Date().toISOString();
        set((state) => {
          if (state.contributions.some((item) => item.id === id)) return state;
          return { goals: state.goals.map((goal) => {
            if (goal.id !== goalId) return goal;
            const alreadySaved = safeAdd(goal.alreadySaved, amount);
            const completed = alreadySaved >= goal.targetAmount;
            return { ...goal, alreadySaved, status: completed ? 'completed' : goal.status, completedAt: completed ? goal.completedAt || now : goal.completedAt, reminder: completed ? { frequency: 'none' } : goal.reminder, syncState: 'localOnly', updatedAt: now };
          }), contributions: [...state.contributions, {
            id,
            goalId,
            amount,
            contributionDate: contributionDate || now.slice(0, 10),
            note: note?.trim() || undefined,
            ownerId: state.activeOwnerId || 'local',
            syncState: 'localOnly',
            createdAt: now,
            updatedAt: now,
          }] };
        });
        return id;
      },
      updateContribution: (id, amount, contributionDate, note) => {
        if (!Number.isFinite(amount) || amount <= 0) return;
        set((state) => {
          const previous = state.contributions.find((contribution) => contribution.id === id);
          if (!previous) return state;
          const difference = amount - previous.amount;
          const now = new Date().toISOString();
          return {
            contributions: state.contributions.map((contribution) => contribution.id === id
              ? { ...contribution, amount, contributionDate: contributionDate || contribution.contributionDate, note: note?.trim() || undefined, updatedAt: now, syncState: 'localOnly' }
              : contribution),
            goals: state.goals.map((goal) => goal.id === previous.goalId
              ? (() => {
                  const alreadySaved = Math.max(0, safeAdd(goal.alreadySaved, difference));
                  const completed = alreadySaved >= goal.targetAmount;
                  return { ...goal, alreadySaved, status: completed ? 'completed' : goal.status === 'completed' ? 'active' : goal.status, completedAt: completed ? goal.completedAt || now : undefined, celebrationShownAt: completed ? goal.celebrationShownAt : undefined, reminder: completed ? { frequency: 'none' } : goal.reminder, syncState: 'localOnly' as const, updatedAt: now };
                })()
              : goal),
          };
        });
      },
      deleteContribution: (id) => set((state) => {
        const contribution = state.contributions.find((item) => item.id === id);
        if (!contribution) return state;
        return {
          contributions: state.contributions.filter((item) => item.id !== id),
          deletedContributionIds: [
            ...state.deletedContributionIds.filter((item) => item.id !== id || item.ownerId !== contribution.ownerId),
            { id, deletedAt: new Date().toISOString(), ownerId: contribution.ownerId },
          ],
          goals: state.goals.map((goal) => goal.id === contribution.goalId
            ? {
                ...goal,
                alreadySaved: Math.max(0, safeSubtract(goal.alreadySaved, contribution.amount)),
                status: goal.status === 'completed' ? 'active' : goal.status,
                completedAt: goal.status === 'completed' ? undefined : goal.completedAt,
                celebrationShownAt: goal.status === 'completed' ? undefined : goal.celebrationShownAt,
                syncState: 'localOnly',
                updatedAt: new Date().toISOString(),
              }
            : goal),
        };
      }),
      clearGoals: () => set({ goals: [], contributions: [] }),
    }),
    {
      name: 'finpath-goals-storage',
      storage: createJSONStorage(() => encryptedFinancialStorage),
      version: 3,
      migrate: migrateGoalsState,
      partialize: (state) => ({
        goals: state.goals, contributions: state.contributions, activeOwnerId: state.activeOwnerId, deletedGoalIds: state.deletedGoalIds, deletedContributionIds: state.deletedContributionIds,
        dataByOwner: state.activeOwnerId
          ? { ...state.dataByOwner, [state.activeOwnerId]: { goals: state.goals, contributions: state.contributions } }
          : state.dataByOwner,
      }),
    },
  ),
);
