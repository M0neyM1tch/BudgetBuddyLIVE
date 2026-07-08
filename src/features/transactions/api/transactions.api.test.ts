import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RecurringRuleDraft, TransactionDraft } from '../types/transactions.types';

const rpcMock = vi.fn();
const fromMock = vi.fn();

vi.mock('../../../shared/lib/supabase', () => ({
  supabase: {
    rpc: rpcMock,
    from: fromMock,
  },
}));

const { createRecurringRule, createTransaction, updateRecurringRule } = await import('./transactions.api');

const baseDraft: TransactionDraft = {
  amount_cents: 12_345,
  kind: 'expense',
  category: 'food',
  transaction_date: '2026-06-24',
  description: 'Launch test',
  notes: null,
  source: 'manual',
};

describe('createTransaction linked RPC behavior', () => {
  beforeEach(() => {
    rpcMock.mockReset();
    fromMock.mockReset();
    vi.useRealTimers();
  });

  it('uses allocate_goal_contribution for goal-linked transactions', async () => {
    rpcMock.mockResolvedValueOnce({
      data: { id: 'transaction-id', goal_id: 'goal-id' },
      error: null,
    });

    await createTransaction('user-id', {
      ...baseDraft,
      goal_id: '00000000-0000-4000-8000-000000000001',
    });

    expect(rpcMock).toHaveBeenCalledWith('allocate_goal_contribution', {
      p_goal_id: '00000000-0000-4000-8000-000000000001',
      p_amount_cents: 12_345,
      p_transaction_date: '2026-06-24',
      p_description: 'Launch test',
      p_notes: undefined,
    });
  });

  it('uses allocate_debt_payment for debt-linked transactions', async () => {
    rpcMock.mockResolvedValueOnce({
      data: { id: 'transaction-id', debt_id: 'debt-id' },
      error: null,
    });

    await createTransaction('user-id', {
      ...baseDraft,
      debt_id: '00000000-0000-4000-8000-000000000002',
    });

    expect(rpcMock).toHaveBeenCalledWith('allocate_debt_payment', {
      p_debt_id: '00000000-0000-4000-8000-000000000002',
      p_amount_cents: 12_345,
      p_transaction_date: '2026-06-24',
      p_description: 'Launch test',
      p_notes: undefined,
      p_source: 'manual',
      p_recurring_rule_id: undefined,
    });
  });
});

describe('createRecurringRule', () => {
  beforeEach(() => {
    rpcMock.mockReset();
    fromMock.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-04T12:00:00'));
  });

  it('prevents skip-backdate rules from saving a past next run date', async () => {
    const insertSingleMock = vi.fn().mockResolvedValueOnce({
      data: {
        id: 'rule-id',
        start_date: '2026-06-01',
        next_run_date: '2026-06-01',
      },
      error: null,
    });
    const insertSelectMock = vi.fn(() => ({ single: insertSingleMock }));
    const insertMock = vi.fn(() => ({ select: insertSelectMock }));
    const updateSingleMock = vi.fn().mockResolvedValueOnce({
      data: {
        id: 'rule-id',
        start_date: '2026-06-01',
        next_run_date: '2026-07-04',
      },
      error: null,
    });
    const updateSelectMock = vi.fn(() => ({ single: updateSingleMock }));
    const userEqMock = vi.fn(() => ({ select: updateSelectMock }));
    const idEqMock = vi.fn(() => ({ eq: userEqMock }));
    const updateMock = vi.fn(() => ({ eq: idEqMock }));

    fromMock
      .mockReturnValueOnce({ insert: insertMock })
      .mockReturnValueOnce({ update: updateMock });

    const draft: RecurringRuleDraft = {
      amount_cents: 250_00,
      category: 'housing',
      day_of_month: 1,
      description: 'Monthly essential bills',
      frequency: 'monthly',
      is_active: true,
      kind: 'expense',
      next_run_date: '2026-06-01',
      notes: 'Created during priority setup.',
      skip_backdate: true,
      start_date: '2026-06-01',
    };

    const result = await createRecurringRule('user-id', draft);

    expect(fromMock).toHaveBeenNthCalledWith(1, 'recurring_rules');
    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'user-id',
      amount_cents: 250_00,
      category: 'housing',
      day_of_month: 1,
      description: 'Monthly essential bills',
      frequency: 'monthly',
      is_active: true,
      kind: 'expense',
      next_run_date: '2026-07-04',
      notes: 'Created during priority setup.',
      start_date: '2026-06-01',
    });
    expect(updateMock).toHaveBeenCalledWith({ next_run_date: '2026-07-04' });
    expect(result.next_run_date).toBe('2026-07-04');
  });

  it('keeps a past next run date when backdating is requested', async () => {
    const insertSingleMock = vi.fn().mockResolvedValueOnce({
      data: {
        id: 'rule-id',
        start_date: '2026-06-01',
        next_run_date: '2026-06-01',
      },
      error: null,
    });
    const insertSelectMock = vi.fn(() => ({ single: insertSingleMock }));
    const insertMock = vi.fn(() => ({ select: insertSelectMock }));

    fromMock.mockReturnValueOnce({ insert: insertMock });

    const draft: RecurringRuleDraft = {
      amount_cents: 250_00,
      category: 'housing',
      day_of_month: 1,
      description: 'Monthly essential bills',
      frequency: 'monthly',
      is_active: true,
      kind: 'expense',
      next_run_date: '2026-06-01',
      notes: 'Created during priority setup.',
      skip_backdate: false,
      start_date: '2026-06-01',
    };

    const result = await createRecurringRule('user-id', draft);

    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'user-id',
      amount_cents: 250_00,
      category: 'housing',
      day_of_month: 1,
      description: 'Monthly essential bills',
      frequency: 'monthly',
      is_active: true,
      kind: 'expense',
      next_run_date: '2026-06-01',
      notes: 'Created during priority setup.',
      start_date: '2026-06-01',
    });
    expect(fromMock).toHaveBeenCalledTimes(1);
    expect(result.next_run_date).toBe('2026-06-01');
  });
});

describe('updateRecurringRule', () => {
  beforeEach(() => {
    rpcMock.mockReset();
    fromMock.mockReset();
    vi.useRealTimers();
  });

  it('does not apply create defaults to partial toggle updates', async () => {
    const updateSingleMock = vi.fn().mockResolvedValueOnce({
      data: {
        id: 'rule-id',
        description: 'Monthly essential bills',
        is_active: false,
      },
      error: null,
    });
    const updateSelectMock = vi.fn(() => ({ single: updateSingleMock }));
    const userEqMock = vi.fn(() => ({ select: updateSelectMock }));
    const idEqMock = vi.fn(() => ({ eq: userEqMock }));
    const updateMock = vi.fn(() => ({ eq: idEqMock }));

    fromMock.mockReturnValueOnce({ update: updateMock });

    await updateRecurringRule('user-id', 'rule-id', { is_active: false });

    expect(updateMock).toHaveBeenCalledWith({ is_active: false });
  });
});
