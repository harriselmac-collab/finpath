import { useBillsStore } from '../../store/billsStore';
import { useGoalsStore } from '../../store/goalsStore';
import { useNotificationPreferencesStore } from '../../store/notificationPreferencesStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useTransactionsStore } from '../../store/transactionsStore';

export const clearLocalUserData = async (
  cancelNotifications?: () => Promise<void>,
) => {
  const cancel = cancelNotifications
    ?? (await import('expo-notifications')).cancelAllScheduledNotificationsAsync;
  await cancel();
  useTransactionsStore.getState().clearTransactions();
  useGoalsStore.getState().clearGoals();
  useBillsStore.getState().clearBills();
  useNotificationPreferencesStore.getState().resetPreferences();
  useOnboardingStore.getState().resetOnboarding();
};
