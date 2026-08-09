import { useBillsStore } from '../../store/billsStore';
import { useGoalsStore } from '../../store/goalsStore';
import { defaultNotificationPreferences, useNotificationPreferencesStore } from '../../store/notificationPreferencesStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useTransactionsStore } from '../../store/transactionsStore';
import { synchronizeFinancialData } from './financialSync';

export interface LocalFinancialSnapshot {
  transactions: ReturnType<typeof useTransactionsStore.getState>['transactions'];
  goals: ReturnType<typeof useGoalsStore.getState>['goals'];
  contributions: ReturnType<typeof useGoalsStore.getState>['contributions'];
  bills: ReturnType<typeof useBillsStore.getState>['bills'];
  onboarding: Pick<ReturnType<typeof useOnboardingStore.getState>, 'answers' | 'currentStep' | 'debts' | 'onboardingCompleted' | 'updatedAt' | 'syncState'>;
  preferences: typeof defaultNotificationPreferences;
}

export const captureLocalFinancialData = (): LocalFinancialSnapshot => {
  const transactions = useTransactionsStore.getState();
  const goals = useGoalsStore.getState();
  const bills = useBillsStore.getState();
  const onboarding = useOnboardingStore.getState();
  const preferences = useNotificationPreferencesStore.getState();
  const localOnboarding = onboarding.activeOwnerId === 'local'
    ? onboarding
    : onboarding.dataByOwner.local;
  return {
    transactions: transactions.activeOwnerId === 'local' ? transactions.transactions : transactions.transactionsByOwner.local || [],
    goals: goals.activeOwnerId === 'local' ? goals.goals : goals.dataByOwner.local?.goals || [],
    contributions: goals.activeOwnerId === 'local' ? goals.contributions : goals.dataByOwner.local?.contributions || [],
    bills: bills.activeOwnerId === 'local' ? bills.bills : bills.billsByOwner.local || [],
    onboarding: localOnboarding || { answers: {}, currentStep: 0, debts: [], onboardingCompleted: false, updatedAt: null, syncState: 'localOnly' },
    preferences: Object.fromEntries(Object.keys(defaultNotificationPreferences).map((key) => [
      key,
      preferences.activeOwnerId === 'local'
        ? preferences[key as keyof typeof defaultNotificationPreferences]
        : preferences.preferencesByOwner.local?.[key as keyof typeof defaultNotificationPreferences] ?? defaultNotificationPreferences[key as keyof typeof defaultNotificationPreferences],
    ])) as unknown as typeof defaultNotificationPreferences,
  };
};

export const hasLocalFinancialData = (snapshot: LocalFinancialSnapshot) => (
  snapshot.transactions.length > 0
  || snapshot.goals.length > 0
  || snapshot.bills.length > 0
  || snapshot.onboarding.onboardingCompleted
  || Object.keys(snapshot.onboarding.answers).length > 0
);

export const applyLocalSnapshot = (snapshot: LocalFinancialSnapshot, userId: string) => {
  useTransactionsStore.setState({
    transactions: snapshot.transactions.map((item) => ({ ...item, ownerId: userId, syncState: 'localOnly' })),
    deletedIds: [],
  });
  useGoalsStore.setState({
    goals: snapshot.goals.map((item) => ({ ...item, ownerId: userId, syncState: 'localOnly' })),
    contributions: snapshot.contributions.map((item) => ({ ...item, ownerId: userId, syncState: 'localOnly' })),
    deletedGoalIds: [],
    deletedContributionIds: [],
  });
  useBillsStore.setState({ bills: snapshot.bills, deletedIds: [] });
  useOnboardingStore.setState({ ...snapshot.onboarding, syncState: 'pendingUpload' });
  useNotificationPreferencesStore.setState(snapshot.preferences);
};

export const migrateLocalDataToAccount = async (snapshot: LocalFinancialSnapshot, userId: string) => {
  applyLocalSnapshot(snapshot, userId);
  return synchronizeFinancialData();
};
