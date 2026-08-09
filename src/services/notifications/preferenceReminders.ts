import * as Notifications from 'expo-notifications';
import { DebtInfo } from '../../store/onboardingStore';
import { Goal } from '../../store/goalsStore';

const cancel = (identifier: string) => Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined);

export const syncMonthlyReviewReminder = async (enabled: boolean, title: string, body: string) => {
  const identifier = 'monthly-budget-review';
  await cancel(identifier);
  if (!enabled) return;
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body, data: { route: '/plan' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day: 1, hour: 18, minute: 0 },
  });
};

export const syncDebtReminders = async (
  debts: DebtInfo[],
  enabled: boolean,
  content: (debt: DebtInfo) => { title: string; body: string },
) => Promise.all(debts.map(async (debt, index) => {
  const identifier = `debt-${index}-${debt.type.replace(/\W+/g, '-').toLowerCase()}`;
  await cancel(identifier);
  const day = Number(debt.dueDate);
  if (!enabled || !Number.isInteger(day) || day < 1 || day > 31) return;
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { ...content(debt), data: { route: '/debts' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day, hour: 9, minute: 0 },
  });
}));

export const syncGoalReminders = async (
  goals: Goal[],
  enabled: boolean,
  content: (goal: Goal) => { title: string; body: string },
  now = new Date(),
) => Promise.all(goals.map(async (goal) => {
  const identifier = `goal-${goal.id}`;
  await cancel(identifier);
  if (!enabled || goal.status !== 'active' || goal.reminder.frequency === 'none') return;
  const date = new Date(`${goal.reminder.date || goal.targetDate}T09:00:00`);
  if (Number.isNaN(date.getTime())) return;
  let trigger: Notifications.NotificationTriggerInput | null = null;
  if (goal.reminder.frequency === 'weekly') {
    trigger = { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 2, hour: 9, minute: 0 };
  } else if (goal.reminder.frequency === 'monthly') {
    trigger = { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day: Math.min(28, now.getDate()), hour: 9, minute: 0 };
  } else if (date > now) {
    trigger = { type: Notifications.SchedulableTriggerInputTypes.DATE, date };
  }
  if (!trigger) return;
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { ...content(goal), data: { route: '/goals' } },
    trigger,
  });
}));

export const cancelGoalReminder = (goalId: string) => cancel(`goal-${goalId}`);
