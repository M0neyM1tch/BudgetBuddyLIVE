import { beforeEach, describe, expect, it, vi } from 'vitest';

const fromMock = vi.fn();
vi.mock('../../../shared/lib/supabase', () => ({ supabase: { from: fromMock } }));

const { fetchCalculatorTransactions, fetchCalculatorGoals, fetchCalculatorRecurringRules } = await import('./calculator.api');

function respond(data: unknown[], count: number | null, error: unknown = null) {
  const query = Object.assign(Promise.resolve({ data, count, error }), {
    select: vi.fn(), eq: vi.fn(), gte: vi.fn(), lte: vi.fn(), order: vi.fn(), limit: vi.fn(),
  });
  for (const step of [query.select, query.eq, query.gte, query.lte, query.order, query.limit]) step.mockReturnValue(query);
  fromMock.mockReturnValue(query);
  return query;
}

beforeEach(() => fromMock.mockReset());

describe('calculator transaction allocations', () => {
  it('loads the authoritative applied amount separately from the requested transfer amount', async () => {
    const query = respond([{
        id: 'transaction-id',
        amount_cents: 10_000,
        allocation_applied_cents: 4_000,
        category: 'debt_payment',
        description: 'Synthetic capped allocation',
        goal_id: null,
        kind: 'transfer',
        transaction_date: '2026-07-01',
      }], 1);

    const result = await fetchCalculatorTransactions('user-id', '2026-07-01', '2026-07-31');

    expect(query.select).toHaveBeenCalledWith(expect.stringContaining('allocation_applied_cents'), { count: 'exact' });
    expect(query.eq).toHaveBeenCalledWith('user_id', 'user-id');
    expect(result).toEqual([expect.objectContaining({ amountCents: 10_000, allocationAppliedCents: 4_000 })]);
  });

  it('accepts complete history above the former 750-row client cap', async () => {
    const query = respond(Array.from({ length: 751 }, (_, id) => ({ id, amount_cents: 100, kind: 'expense' })), 751);
    await expect(fetchCalculatorTransactions('owner', '2026-01-01', '2026-06-30')).resolves.toHaveLength(751);
    expect(query.limit).not.toHaveBeenCalled();
    expect(query.gte).toHaveBeenCalledWith('transaction_date', '2026-01-01');
    expect(query.lte).toHaveBeenCalledWith('transaction_date', '2026-06-30');
  });

  it.each([
    ['transactions', () => fetchCalculatorTransactions('owner', '2026-01-01', '2026-06-30')],
    ['goals', () => fetchCalculatorGoals('owner')],
    ['recurring rules', () => fetchCalculatorRecurringRules('owner')],
  ] as const)('refuses incomplete or unverified %s and permits complete empty data', async (_label, fetchRows) => {
    for (const count of [1, null]) {
      const query = respond([], count);
      await expect(fetchRows()).rejects.toMatchObject({ code: 'INCOMPLETE_DATA' });
      expect(query.select).toHaveBeenCalledWith(expect.any(String), { count: 'exact' });
    }
    respond([], 0);
    await expect(fetchRows()).resolves.toEqual([]);
  });

  it('preserves backend errors instead of treating them as an empty history', async () => {
    respond([], null, { message: 'Access denied', code: '42501' });
    await expect(fetchCalculatorTransactions('owner', '2026-01-01', '2026-06-30'))
      .rejects.toMatchObject({ message: 'Access denied', code: '42501' });
  });
});
