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

const {
  createRecurringRule,
  createQuickAddTransaction,
  createTransaction,
  fetchQuickAddChips,
  fetchTransactionSummary,
  updateRecurringRule,
  updateTransaction,
} = await import('./transactions.api');

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

describe('summary and retarget RPC adapters', () => {
  beforeEach(() => {
    rpcMock.mockReset();
    fromMock.mockReset();
  });

  it('uses the server aggregate with the same normalized filters and keeps transfers out of totals', async () => {
    rpcMock.mockResolvedValueOnce({
      data: [{ income_cents: '50000', expense_cents: '12000', net_cents: '38000', transaction_count: '4' }],
      error: null,
    });

    await expect(fetchTransactionSummary({ category: 'food', amountMin: 10, q: ' lunch% ' })).resolves.toEqual({
      income_cents: 50_000,
      expense_cents: 12_000,
      net_cents: 38_000,
      transaction_count: 4,
    });
    expect(rpcMock).toHaveBeenCalledWith('get_transaction_summary', expect.objectContaining({
      p_category: 'food',
      p_amount_min_cents: 1000,
      p_search: 'lunch',
    }));
  });

  it('uses the atomic retarget RPC for moves into, out of, and between allocation targets', async () => {
    rpcMock.mockResolvedValueOnce({ data: { id: 'transaction-id' }, error: null });

    await updateTransaction('user-id', 'transaction-id', {
      amount_cents: 12_500,
      kind: 'transfer',
      category: 'debt_payment',
      transaction_date: '2026-07-21',
      description: 'Payment',
      notes: null,
      debt_id: '00000000-0000-4000-8000-000000000002',
      goal_id: null,
    });

    expect(rpcMock).toHaveBeenCalledWith('update_transaction_and_retarget', expect.objectContaining({
      p_transaction_id: 'transaction-id',
      p_debt_id: '00000000-0000-4000-8000-000000000002',
      p_goal_id: null,
    }));
  });
});

describe('quick-add persistence compatibility', () => {
  beforeEach(() => {
    rpcMock.mockReset();
    fromMock.mockReset();
  });

  it('preserves a valid saved custom configuration instead of replacing it with defaults', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        quick_add_chips: [{
          id: 'custom',
          label: 'My lunch',
          description: 'Lunch',
          amount_cents: 1_250,
          kind: 'expense',
          category: 'food',
        }],
      },
      error: null,
    });
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    fromMock.mockReturnValue({ select });

    await expect(fetchQuickAddChips('user-id')).resolves.toEqual([
      expect.objectContaining({ id: 'custom', label: 'My lunch', amount_cents: 1_250 }),
    ]);
  });
});

describe('quick-add transaction idempotency adapter', () => {
  beforeEach(() => {
    rpcMock.mockReset();
    fromMock.mockReset();
  });

  it('sends a stable client operation id through the atomic quick-add RPC', async () => {
    rpcMock.mockResolvedValueOnce({ data: { id: 'transaction-id' }, error: null });

    await createQuickAddTransaction('user-id', '00000000-0000-4000-8000-000000000099', {
      ...baseDraft,
      goal_id: '00000000-0000-4000-8000-000000000001',
      kind: 'transfer',
      category: 'savings',
    });

    expect(rpcMock).toHaveBeenCalledWith('create_quick_add_transaction', expect.objectContaining({
      p_client_operation_id: '00000000-0000-4000-8000-000000000099',
      p_goal_id: '00000000-0000-4000-8000-000000000001',
      p_debt_id: null,
    }));
  });
});
