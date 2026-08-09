import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { migrateGoalsState, useGoalsStore } from '../store/goalsStore';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

const goalInput = {
  name: 'Emergency fund',
  targetAmount: 1000,
  alreadySaved: 100,
  targetDate: '2027-01-01',
  isEssential: true,
  classification: 'essential' as const,
};

describe('persisted goals and contribution history', () => {
  beforeEach(() => {
    useGoalsStore.setState({ goals: [], contributions: [] });
  });

  test('creates a goal without production starter data and records its opening balance', () => {
    const id = useGoalsStore.getState().addGoal(goalInput);
    expect(useGoalsStore.getState().goals).toHaveLength(1);
    expect(useGoalsStore.getState().goals[0]).toMatchObject({ id, status: 'active', alreadySaved: 100, category: 'other', vectorKey: 'target', colorKey: 'pocket_blue' });
    expect(useGoalsStore.getState().contributions[0]).toMatchObject({ goalId: id, amount: 100 });
  });

  test('migrates legacy goals idempotently without replaying completed celebrations', () => {
    const legacy = { goals: [{ ...goalInput, id: 'legacy', status: 'completed', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' }], contributions: [] };
    const once = migrateGoalsState(legacy);
    const twice = migrateGoalsState(once);
    expect(twice.goals[0]).toMatchObject({ id: 'legacy', category: 'other', vectorKey: 'target', colorKey: 'pocket_blue', completedAt: '2026-02-01T00:00:00Z', celebrationShownAt: '2026-02-01T00:00:00Z' });
    expect(twice.goals).toHaveLength(1);
  });

  test('creates, edits, and deletes contributions atomically', () => {
    const goalId = useGoalsStore.getState().addGoal({ ...goalInput, alreadySaved: 0 });
    const contributionId = useGoalsStore.getState().addContribution(goalId, 200)!;
    expect(useGoalsStore.getState().goals[0].alreadySaved).toBe(200);

    useGoalsStore.getState().updateContribution(contributionId, 350);
    expect(useGoalsStore.getState().goals[0].alreadySaved).toBe(350);

    useGoalsStore.getState().deleteContribution(contributionId);
    expect(useGoalsStore.getState().goals[0].alreadySaved).toBe(0);
    expect(useGoalsStore.getState().contributions).toHaveLength(0);
  });

  test('supports pause, resume, completion, and deletion with history cleanup', () => {
    const id = useGoalsStore.getState().addGoal(goalInput);
    useGoalsStore.getState().setGoalStatus(id, 'paused');
    expect(useGoalsStore.getState().goals[0].status).toBe('paused');
    useGoalsStore.getState().setGoalStatus(id, 'active');
    expect(useGoalsStore.getState().goals[0].status).toBe('active');

    useGoalsStore.getState().setGoalStatus(id, 'completed');
    expect(useGoalsStore.getState().goals[0]).toMatchObject({ status: 'completed', alreadySaved: 100 });
    expect(useGoalsStore.getState().goals[0].completedAt).toBeTruthy();
    expect(useGoalsStore.getState().contributions.reduce((sum, item) => sum + item.amount, 0)).toBe(100);

    useGoalsStore.getState().deleteGoal(id);
    expect(useGoalsStore.getState().goals).toHaveLength(0);
    expect(useGoalsStore.getState().contributions).toHaveLength(0);
  });

  test('rejects invalid contributions before persistence', () => {
    const id = useGoalsStore.getState().addGoal(goalInput);
    expect(useGoalsStore.getState().addContribution(id, -1)).toBeNull();
    expect(useGoalsStore.getState().addContribution(id, Number.NaN)).toBeNull();
  });

  test('completes automatically once and prevents duplicate contribution submissions', () => {
    const id = useGoalsStore.getState().addGoal({ ...goalInput, alreadySaved: 900 });
    const contributionId = useGoalsStore.getState().addContribution(id, 100, '2026-08-04', undefined, 'submission-1');
    expect(contributionId).toBe('submission-1');
    expect(useGoalsStore.getState().goals[0]).toMatchObject({ status: 'completed', alreadySaved: 1000 });
    expect(useGoalsStore.getState().goals[0].completedAt).toBeTruthy();
    useGoalsStore.getState().addContribution(id, 100, '2026-08-04', undefined, 'submission-1');
    expect(useGoalsStore.getState().goals[0].alreadySaved).toBe(1000);
  });
});
