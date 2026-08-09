import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Bill } from '../../store/billsStore';

const CHANNEL_ID = 'bill-reminders';

export const getBillReminderDate = (bill: Pick<Bill, 'nextDueDate' | 'reminderDaysBefore'>) => {
  const date = new Date(`${bill.nextDueDate}T09:00:00`);
  date.setDate(date.getDate() - bill.reminderDaysBefore);
  return date;
};

export const ensureNotificationPermission = async () => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
};

export const scheduleBillReminder = async (
  bill: Bill,
  content: { title: string; body: string },
  now = new Date(),
) => {
  const reminderDate = getBillReminderDate(bill);
  if (!bill.isActive || bill.paid || reminderDate <= now) return null;
  if (!(await ensureNotificationPermission())) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Bill reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return Notifications.scheduleNotificationAsync({
    content: { ...content, data: { billId: bill.id, route: '/profile/bills' } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
      channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
    },
  });
};

export const cancelBillReminder = async (notificationId?: string) => {
  if (notificationId) await Notifications.cancelScheduledNotificationAsync(notificationId);
};

export const rescheduleBillReminder = async (
  bill: Bill,
  content: { title: string; body: string },
) => {
  await cancelBillReminder(bill.notificationId);
  return scheduleBillReminder({ ...bill, notificationId: undefined }, content);
};
