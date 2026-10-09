import { describe, expect, it } from 'vitest';
import { resolveQuickAddTarget } from './quickAddTarget';

const goal = {
  goal_type: 'emergency_fund',
  id: '00000000-0000-4000-8000-000000000001',
  is_archived: false,
  name: 'Emergency fund',
  current_amount_cents: 10_000,
  target_amount_cents: 50_000,
};
const debt = {
  id: '00000000-0000-4000-8000-000000000002',
  is_archived: false,
  name: 'Card',
};

describe('resolveQuickAddTarget', () => {
  it('resolves a current savings priority at execution time', () => {
    expect(resolveQuickAddTarget(
      { id: 'a', label: 'Priority', description: '', amount_cents: 10_000, kind: 'expense', category: 'savings', target: { kind: 'active_priority' } },
      goal.id,
      [goal],
      [],
    )).toMatchObject({ status: 'resolved', draft: { goal_id: goal.id, kind: 'transfer' } });
  });

  it('resolves a linked debt priority to the debt allocation path', () => {
    const debtGoal = { ...goal, linked_debt_id: debt.id };
    expect(resolveQuickAddTarget(
      { id: 'a', label: 'Priority', description: '', amount_cents: 10_000, kind: 'expense', category: 'savings', target: { kind: 'active_priority' } },
      goal.id,
      [debtGoal],
      [debt],
    )).toMatchObject({ status: 'resolved', draft: { debt_id: debt.id, category: 'debt_payment' } });
  });

  it('blocks missing, stale, and foreign/unloaded targets', () => {
    const chip = { id: 'a', label: 'Priority', description: '', amount_cents: 10_000, kind: 'expense' as const, category: 'savings', target: { kind: 'active_priority' as const } };
    expect(resolveQuickAddTarget(chip, null, [], []).status).toBe('missing_priority');
    expect(resolveQuickAddTarget({ ...chip, target: { kind: 'goal', id: goal.id } }, null, [], []).status).toBe('invalid_target');
    expect(resolveQuickAddTarget(
      chip,
      goal.id,
      [{ ...goal, goal_type: 'debt_payoff', linked_debt_id: null }],
      [],
    )).toMatchObject({ status: 'invalid_target' });
  });
});
