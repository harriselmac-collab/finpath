import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface NotificationPreferences {
  bills: boolean;
  debts: boolean;
  savings: boolean;
  goals: boolean;
  weeklySummary: boolean;
  monthlyReview: boolean;
  culturalEvents: boolean;
  productUpdates: boolean;
  marketing: boolean;
}

interface NotificationPreferencesState extends NotificationPreferences {
  updatedAt: string | null;
  syncState: 'localOnly' | 'synced' | 'failed';
  preferencesByOwner: Record<string, NotificationPreferences & Pick<NotificationPreferencesState, 'updatedAt' | 'syncState'>>;
  activeOwnerId: string | null;
  setActiveOwner: (ownerId: string | null) => void;
  updatePreference: (key: keyof NotificationPreferences, value: boolean) => void;
  resetPreferences: () => void;
}

export const defaultNotificationPreferences: NotificationPreferences = {
  bills: true,
  debts: true,
  savings: true,
  goals: true,
  weeklySummary: true,
  monthlyReview: false,
  culturalEvents: true,
  productUpdates: false,
  marketing: false,
};

export const useNotificationPreferencesStore = create<NotificationPreferencesState>()(
  persist(
    (set) => ({
      ...defaultNotificationPreferences,
      updatedAt: null,
      syncState: 'localOnly',
      preferencesByOwner: {},
      activeOwnerId: 'local',
      setActiveOwner: (ownerId) => set((state) => {
        const current = {
          ...Object.fromEntries(Object.keys(defaultNotificationPreferences).map((key) => [key, state[key as keyof NotificationPreferences]])) as unknown as NotificationPreferences,
          updatedAt: state.updatedAt,
          syncState: state.syncState,
        };
        const preferencesByOwner = state.activeOwnerId ? { ...state.preferencesByOwner, [state.activeOwnerId]: current } : state.preferencesByOwner;
        return {
          activeOwnerId: ownerId,
          preferencesByOwner,
          ...(ownerId ? preferencesByOwner[ownerId] || { ...defaultNotificationPreferences, updatedAt: null, syncState: 'localOnly' as const } : { ...defaultNotificationPreferences, updatedAt: null, syncState: 'localOnly' as const }),
        };
      }),
      updatePreference: (key, value) => set({ [key]: value, updatedAt: new Date().toISOString(), syncState: 'localOnly' }),
      resetPreferences: () => set({ ...defaultNotificationPreferences, updatedAt: new Date().toISOString(), syncState: 'localOnly' }),
    }),
    {
      name: 'finpath-notification-preferences',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persisted: any) => {
        const withMetadata = (value: any) => ({
          ...defaultNotificationPreferences,
          ...value,
          updatedAt: value?.updatedAt || null,
          syncState: value?.syncState || 'localOnly',
        });
        if (persisted?.preferencesByOwner) {
          return {
            ...withMetadata(persisted),
            ...persisted,
            preferencesByOwner: Object.fromEntries(Object.entries(persisted.preferencesByOwner).map(([ownerId, value]) => [ownerId, withMetadata(value)])),
          };
        }
        return {
          ...withMetadata(persisted),
          activeOwnerId: null,
          preferencesByOwner: { local: withMetadata(persisted) },
        };
      },
      partialize: (state) => {
        const current = {
          ...Object.fromEntries(Object.keys(defaultNotificationPreferences).map((key) => [key, state[key as keyof NotificationPreferences]])) as unknown as NotificationPreferences,
          updatedAt: state.updatedAt,
          syncState: state.syncState,
        };
        return {
          ...current,
          activeOwnerId: state.activeOwnerId,
          preferencesByOwner: state.activeOwnerId ? { ...state.preferencesByOwner, [state.activeOwnerId]: current } : state.preferencesByOwner,
        };
      },
    },
  ),
);
