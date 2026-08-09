import { useBillsStore } from '../../store/billsStore';
import { Goal, GoalContribution, useGoalsStore } from '../../store/goalsStore';
import { defaultNotificationPreferences, useNotificationPreferencesStore } from '../../store/notificationPreferencesStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useSessionStore } from '../../store/sessionStore';
import { useSyncStatusStore } from '../../store/syncStatusStore';
import { DeletionTombstone, Transaction, useTransactionsStore } from '../../store/transactionsStore';
import { isSupabaseConfigured, supabase } from '../supabase/supabaseClient';

type RemoteRow = Record<string, any> & { id?: string; user_id?: string; updated_at: string };

const assertNoError = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

const asTime = (value?: string | null) => {
  const time = value ? new Date(value).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
};

export const remoteUpdatedAt = (row: RemoteRow) => row.client_updated_at || row.updated_at || row.created_at;

export const localVersionWins = (localUpdatedAt: string, row?: RemoteRow) => (
  !row || asTime(localUpdatedAt) > asTime(remoteUpdatedAt(row))
);

export const reconcileRemoteDeletions = <T extends RemoteRow>(
  rows: T[],
  tombstones: DeletionTombstone[],
  ownerId: string,
) => {
  const ownerTombstones = tombstones.filter((item) => item.ownerId === ownerId);
  const byId = new Map(ownerTombstones.map((item) => [item.id, item]));
  const deletions: { tombstone: DeletionTombstone; row: T }[] = [];
  const survivingRows = rows.filter((row) => {
    if (!row.id) return true;
    const tombstone = byId.get(row.id);
    if (!tombstone || asTime(tombstone.deletedAt) < asTime(remoteUpdatedAt(row))) return true;
    deletions.push({ tombstone, row });
    return false;
  });
  return { survivingRows, deletions };
};

export const mergeTransactions = (local: Transaction[], remote: RemoteRow[], ownerId: string) => {
  const byId = new Map(local.map((item) => [item.id, item]));
  for (const row of remote) {
    const current = row.id ? byId.get(row.id) : undefined;
    if (!row.id || (current && localVersionWins(current.updatedAt, row))) continue;
    const updatedAt = remoteUpdatedAt(row);
    byId.set(row.id, {
      id: row.id,
      name: row.name,
      amount: Number(row.amount),
      type: row.type,
      category: row.category,
      date: row.transaction_date,
      timeGroup: row.transaction_date,
      timestamp: new Date(row.transaction_date).getTime(),
      createdAt: row.created_at,
      updatedAt,
      ownerId,
      syncState: 'synced',
    });
  }
  return [...byId.values()].sort((a, b) => b.timestamp - a.timestamp);
};

const mapGoal = (row: RemoteRow, ownerId: string): Goal => ({
  id: row.id!,
  name: row.name,
  description: row.description || undefined,
  targetAmount: Number(row.target_amount),
  alreadySaved: Number(row.already_saved),
  targetDate: row.target_date,
  isEssential: row.is_essential,
  classification: row.classification,
  category: row.category || 'other',
  vectorKey: row.vector_key || 'target',
  colorKey: row.color_key || 'pocket_blue',
  reminder: {
    frequency: row.reminder_frequency || 'none',
    date: row.reminder_date || undefined,
    notificationId: row.reminder_notification_id || undefined,
  },
  status: row.status,
  completedAt: row.completed_at || undefined,
  celebrationShownAt: row.celebration_shown_at || undefined,
  ownerId,
  syncState: 'synced',
  createdAt: row.created_at,
  updatedAt: remoteUpdatedAt(row),
});

const mapContribution = (row: RemoteRow, ownerId: string): GoalContribution => ({
  id: row.id!,
  goalId: row.goal_id,
  amount: Number(row.amount),
  contributionDate: row.contribution_date,
  note: row.note || undefined,
  ownerId,
  syncState: 'synced',
  createdAt: row.created_at,
  updatedAt: remoteUpdatedAt(row),
});

const pullFinancialRows = async (userId: string) => {
  const results = await Promise.all([
    supabase.from('onboarding_answers').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('transactions').select('*').eq('user_id', userId),
    supabase.from('goals').select('*').eq('user_id', userId),
    supabase.from('goal_contributions').select('*').eq('user_id', userId),
    supabase.from('recurring_expenses').select('*').eq('user_id', userId),
    supabase.from('notification_preferences').select('*').eq('user_id', userId).maybeSingle(),
  ]);
  results.forEach(({ error }) => assertNoError(error));
  return {
    onboarding: results[0].data as RemoteRow | null,
    transactions: (results[1].data || []) as RemoteRow[],
    goals: (results[2].data || []) as RemoteRow[],
    contributions: (results[3].data || []) as RemoteRow[],
    bills: (results[4].data || []) as RemoteRow[],
    preferences: results[5].data as RemoteRow | null,
  };
};

const insertOrUpdateObserved = async (
  table: string,
  payload: Record<string, any>,
  observed: RemoteRow | undefined,
  userId: string,
) => {
  if (!observed) {
    const { error } = await supabase.from(table).insert(payload);
    if (error && (error as any).code !== '23505') throw new Error(error.message);
    return;
  }
  const query = supabase
    .from(table)
    .update(payload)
    .eq('user_id', userId)
    .eq('updated_at', observed.updated_at);
  const { error } = observed.id ? await query.eq('id', observed.id) : await query;
  assertNoError(error);
};

const deleteObserved = async (
  table: string,
  deletions: { tombstone: DeletionTombstone; row: RemoteRow }[],
  userId: string,
) => {
  for (const { row } of deletions) {
    if (!row.id) continue;
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', row.id)
      .eq('user_id', userId)
      .eq('updated_at', row.updated_at);
    assertNoError(error);
  }
};

const hydrateStores = (rows: Awaited<ReturnType<typeof pullFinancialRows>>, userId: string) => {
  if (rows.onboarding?.answers_json) {
    const { __debts = [], ...answers } = rows.onboarding.answers_json as any;
    useOnboardingStore.setState({
      answers,
      debts: __debts,
      onboardingCompleted: rows.onboarding.onboarding_completed,
      updatedAt: rows.onboarding.updated_at,
      syncState: 'synced',
    });
  }
  useTransactionsStore.setState({
    transactions: mergeTransactions([], rows.transactions, userId),
  });
  useGoalsStore.setState({
    goals: rows.goals.map((row) => mapGoal(row, userId)),
    contributions: rows.contributions.map((row) => mapContribution(row, userId)),
  });
  useBillsStore.setState({
    bills: rows.bills.map((row) => ({
      id: row.id!,
      title: row.name,
      amount: Number(row.amount),
      category: row.category,
      recurrence: row.recurrence,
      nextDueDate: row.next_due_date,
      endDate: row.end_date || undefined,
      reminderDaysBefore: row.reminder_days_before,
      paid: row.paid,
      isActive: row.is_active,
      notificationId: row.notification_id || undefined,
      ownerId: userId,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  });
  if (rows.preferences) {
    const row = rows.preferences;
    useNotificationPreferencesStore.setState({
      ...defaultNotificationPreferences,
      bills: row.push_enabled,
      debts: row.debt_reminders,
      savings: row.savings_reminders,
      goals: row.goal_reminders,
      weeklySummary: row.weekly_summary,
      monthlyReview: row.monthly_review,
      culturalEvents: row.cultural_events,
      productUpdates: row.product_updates,
      marketing: row.marketing,
      updatedAt: row.updated_at,
      syncState: 'synced',
    });
  }
};

export const synchronizeFinancialData = async () => {
  const user = useSessionStore.getState().user;
  if (!isSupabaseConfigured || !user) {
    useSyncStatusStore.getState().setSyncStatus('localOnly');
    return false;
  }

  useSyncStatusStore.getState().setSyncStatus('syncing');
  try {
    const onboarding = useOnboardingStore.getState();
    const transactions = useTransactionsStore.getState();
    const goals = useGoalsStore.getState();
    const bills = useBillsStore.getState();
    const preferences = useNotificationPreferencesStore.getState();

    // Pull before writing so a stale device never blindly overwrites the server.
    const pulled = await pullFinancialRows(user.id);
    const transactionDeletion = reconcileRemoteDeletions(pulled.transactions, transactions.deletedIds, user.id);
    const contributionDeletion = reconcileRemoteDeletions(pulled.contributions, goals.deletedContributionIds, user.id);
    const goalDeletion = reconcileRemoteDeletions(pulled.goals, goals.deletedGoalIds, user.id);
    const billDeletion = reconcileRemoteDeletions(pulled.bills, bills.deletedIds, user.id);

    await deleteObserved('goal_contributions', contributionDeletion.deletions, user.id);
    await deleteObserved('goals', goalDeletion.deletions, user.id);
    await deleteObserved('transactions', transactionDeletion.deletions, user.id);
    await deleteObserved('recurring_expenses', billDeletion.deletions, user.id);

    const remoteTransactions = new Map(transactionDeletion.survivingRows.map((row) => [row.id, row]));
    for (const item of transactions.transactions.filter((record) => record.ownerId === user.id && localVersionWins(record.updatedAt, remoteTransactions.get(record.id)))) {
      await insertOrUpdateObserved('transactions', {
        id: item.id,
        user_id: user.id,
        name: item.name,
        amount: item.amount,
        type: item.type,
        category: item.category,
        transaction_date: new Date(item.timestamp).toISOString().slice(0, 10),
        client_updated_at: item.updatedAt,
      }, remoteTransactions.get(item.id), user.id);
    }

    const remoteGoals = new Map(goalDeletion.survivingRows.map((row) => [row.id, row]));
    for (const goal of goals.goals.filter((record) => record.ownerId === user.id && localVersionWins(record.updatedAt, remoteGoals.get(record.id)))) {
      await insertOrUpdateObserved('goals', {
        id: goal.id,
        user_id: user.id,
        name: goal.name,
        target_amount: goal.targetAmount,
        already_saved: goal.alreadySaved,
        target_date: goal.targetDate,
        is_essential: goal.isEssential,
        classification: goal.classification,
        status: goal.status,
        description: goal.description || null,
        category: goal.category,
        vector_key: goal.vectorKey,
        color_key: goal.colorKey,
        reminder_frequency: goal.reminder.frequency,
        reminder_date: goal.reminder.date || null,
        reminder_notification_id: goal.reminder.notificationId || null,
        completed_at: goal.completedAt || null,
        celebration_shown_at: goal.celebrationShownAt || null,
        client_updated_at: goal.updatedAt,
      }, remoteGoals.get(goal.id), user.id);
    }

    const remoteContributions = new Map(contributionDeletion.survivingRows.map((row) => [row.id, row]));
    for (const item of goals.contributions.filter((record) => record.ownerId === user.id && localVersionWins(record.updatedAt, remoteContributions.get(record.id)))) {
      await insertOrUpdateObserved('goal_contributions', {
        id: item.id,
        user_id: user.id,
        goal_id: item.goalId,
        amount: item.amount,
        contribution_date: item.contributionDate,
        note: item.note || null,
        client_updated_at: item.updatedAt,
      }, remoteContributions.get(item.id), user.id);
    }

    const remoteBills = new Map(billDeletion.survivingRows.map((row) => [row.id, row]));
    for (const bill of bills.bills.filter((record) => record.ownerId === user.id && localVersionWins(record.updatedAt, remoteBills.get(record.id)))) {
      await insertOrUpdateObserved('recurring_expenses', {
        id: bill.id,
        user_id: user.id,
        name: bill.title,
        amount: bill.amount,
        category: bill.category,
        is_essential: true,
        recurrence: bill.recurrence,
        next_due_date: bill.nextDueDate,
        end_date: bill.endDate || null,
        reminder_days_before: bill.reminderDaysBefore,
        paid: bill.paid,
        is_active: bill.isActive,
        notification_id: bill.notificationId || null,
      }, remoteBills.get(bill.id), user.id);
    }

    if (onboarding.syncState !== 'synced' && onboarding.updatedAt && localVersionWins(onboarding.updatedAt, pulled.onboarding || undefined)) {
      await insertOrUpdateObserved('onboarding_answers', {
        user_id: user.id,
        answers_json: { ...onboarding.answers, __debts: onboarding.debts },
        onboarding_completed: onboarding.onboardingCompleted,
      }, pulled.onboarding || undefined, user.id);
    }

    if (preferences.syncState !== 'synced' && preferences.updatedAt && localVersionWins(preferences.updatedAt, pulled.preferences || undefined)) {
      await insertOrUpdateObserved('notification_preferences', {
        user_id: user.id,
        push_enabled: preferences.bills,
        email_enabled: false,
        shortfall_alerts: true,
        goal_reminders: preferences.goals,
        debt_reminders: preferences.debts,
        savings_reminders: preferences.savings,
        weekly_summary: preferences.weeklySummary,
        monthly_review: preferences.monthlyReview,
        cultural_events: preferences.culturalEvents,
        product_updates: preferences.productUpdates,
        marketing: preferences.marketing,
      }, pulled.preferences || undefined, user.id);
    }

    // Pull again so conditional-write races always resolve to the server's current version.
    const finalRows = await pullFinancialRows(user.id);
    hydrateStores(finalRows, user.id);
    useTransactionsStore.setState({ deletedIds: transactions.deletedIds.filter((item) => item.ownerId !== user.id) });
    useGoalsStore.setState({
      deletedGoalIds: goals.deletedGoalIds.filter((item) => item.ownerId !== user.id),
      deletedContributionIds: goals.deletedContributionIds.filter((item) => item.ownerId !== user.id),
    });
    useBillsStore.setState({ deletedIds: bills.deletedIds.filter((item) => item.ownerId !== user.id) });
    useSyncStatusStore.getState().setSyncStatus('synced');
    return true;
  } catch (error) {
    useSyncStatusStore.getState().setSyncStatus('failed', error instanceof Error ? error.message : 'Synchronization failed.');
    return false;
  }
};
