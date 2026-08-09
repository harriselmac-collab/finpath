import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as Notifications from 'expo-notifications';
import { syncDebtReminders, syncGoalReminders, syncMonthlyReviewReminder } from '../services/notifications/preferenceReminders';

jest.mock('expo-notifications', () => ({
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  scheduleNotificationAsync: jest.fn(async () => 'scheduled'),
  SchedulableTriggerInputTypes: { DATE: 'date', MONTHLY: 'monthly', WEEKLY: 'weekly' },
}));

const schedule = Notifications.scheduleNotificationAsync as jest.MockedFunction<typeof Notifications.scheduleNotificationAsync>;

describe('preference reminder schedules', () => {
  beforeEach(() => { schedule.mockClear(); });

  test('uses one stable monthly review identifier and disables without rescheduling', async () => {
    await syncMonthlyReviewReminder(true, 'Review', 'Body');
    expect(schedule).toHaveBeenCalledWith(expect.objectContaining({ identifier: 'monthly-budget-review' }));
    await syncMonthlyReviewReminder(false, 'Review', 'Body');
    expect(schedule).toHaveBeenCalledTimes(1);
  });

  test('rejects invalid debt due days', async () => {
    await syncDebtReminders([{ type: 'Loan', totalAmount: 100, minimumPayment: 10, interestRate: 2, dueDate: '32', isOverdue: false }], true, () => ({ title: '', body: '' }));
    expect(schedule).not.toHaveBeenCalled();
  });

  test('creates a stable goal reminder before its deadline', async () => {
    await syncGoalReminders([{ id: 'g1', name: 'Fund', targetAmount: 100, alreadySaved: 0, targetDate: '2027-01-15', isEssential: false, classification: 'optional', category: 'other', vectorKey: 'target', colorKey: 'pocket_blue', reminder: { frequency: 'once', date: '2027-01-08' }, status: 'active', ownerId: 'local', syncState: 'localOnly', createdAt: '', updatedAt: '' }], true, () => ({ title: '', body: '' }), new Date('2026-01-01'));
    expect(schedule).toHaveBeenCalledWith(expect.objectContaining({ identifier: 'goal-g1' }));
  });
});
