import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { getBillReminderDate } from '../services/notifications/billReminders';
import { getNextBillDueDate, useBillsStore } from '../store/billsStore';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

describe('bills store', () => {
  beforeEach(() => { useBillsStore.setState({ bills: [] }); });

  it('rejects invalid bills and persists a valid bill', () => {
    expect(useBillsStore.getState().addBill({ title: '', amount: 0, category: 'bill', recurrence: 'monthly', nextDueDate: '', reminderDaysBefore: 3 })).toBeNull();
    const id = useBillsStore.getState().addBill({ title: 'Rent', amount: 5000, category: 'housing', recurrence: 'monthly', nextDueDate: '2026-08-10', reminderDaysBefore: 3 });
    expect(id).toBeTruthy();
    expect(useBillsStore.getState().bills[0]).toMatchObject({ title: 'Rent', amount: 5000, isActive: true });
  });

  it('calculates the local reminder date without UTC date drift', () => {
    const bill = { nextDueDate: '2026-08-10', reminderDaysBefore: 3 };
    const reminder = getBillReminderDate(bill);
    expect(reminder.getFullYear()).toBe(2026);
    expect(reminder.getMonth()).toBe(7);
    expect(reminder.getDate()).toBe(7);
    expect(reminder.getHours()).toBe(9);
  });

  it('advances a recurring bill and completes a one-time bill when paid', () => {
    expect(getNextBillDueDate('2026-08-10', 'weekly')).toBe('2026-08-17');
    const id = useBillsStore.getState().addBill({ title: 'Repair', amount: 200, category: 'bill', recurrence: 'once', nextDueDate: '2026-08-10', reminderDaysBefore: 1 })!;
    useBillsStore.getState().markBillPaid(id);
    expect(useBillsStore.getState().bills[0]).toMatchObject({ paid: true, isActive: false, notificationId: undefined });
  });
});
