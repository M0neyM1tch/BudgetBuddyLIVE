import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fromMock = vi.fn();
vi.mock('../../../shared/lib/supabase', () => ({ supabase: { from: fromMock } }));
const { fetchDashboardKpis, fetchRecentDashboardTransactions } = await import('./dashboard.api');

type Response = { data: unknown[]; count: number | null; error?: unknown };
function configure(overrides: Partial<Record<string, Response>> = {}) {
  const queries = Object.fromEntries(['transactions', 'goals', 'debts'].map((table) => {
    const response = overrides[table] ?? { data: [], count: 0 };
    const query = Object.assign(Promise.resolve({ ...response, error: response.error ?? null }), {
      select: vi.fn(), eq: vi.fn(), in: vi.fn(), gte: vi.fn(), lt: vi.fn(), order: vi.fn(), limit: vi.fn(),
    });
    for (const step of [query.select, query.eq, query.in, query.gte, query.lt, query.order, query.limit]) step.mockReturnValue(query);
    return [table, query];
  }));
  fromMock.mockImplementation((table: string) => queries[table]);
  return queries;
}

beforeEach(() => {
  fromMock.mockReset();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-08T12:00:00'));
});
afterEach(() => vi.useRealTimers());

describe('complete dashboard totals', () => {
  it('calculates correct month and balance totals only from complete responses', async () => {
    const queries = configure({
      transactions: { data: [
        { amount_cents: 10_000, kind: 'income', transaction_date: '2026-10-01' },
        { amount_cents: 2_000, kind: 'expense', transaction_date: '2026-10-02' },
        { amount_cents: 3_000, kind: 'income', transaction_date: '2026-09-01' },
      ], count: 3 },
      goals: { data: [{ current_amount_cents: 4_000 }], count: 1 },
      debts: { data: [{ current_balance_cents: 5_000 }], count: 1 },
    });
    await expect(fetchDashboardKpis('owner')).resolves.toEqual({
      currentMonth: { incomeCents: 10_000, expenseCents: 2_000, netCents: 8_000 },
      previousMonth: { incomeCents: 3_000, expenseCents: 0, netCents: 3_000 },
      totalSavingsCents: 4_000,
      totalDebtCents: 5_000,
    });
    for (const query of Object.values(queries)) {
      expect(query.select).toHaveBeenCalledWith(expect.any(String), { count: 'exact' });
      expect(query.eq).toHaveBeenCalledWith('user_id', 'owner');
    }
  });

  it.each(['transactions', 'goals', 'debts'])('rejects incomplete or unverified %s before summing', async (table) => {
    for (const count of [1, null]) {
      configure({ [table]: { data: [], count } });
      await expect(fetchDashboardKpis('owner')).rejects.toMatchObject({ code: 'INCOMPLETE_DATA' });
    }
  });

  it('accepts complete empty data', async () => {
    configure();
    await expect(fetchDashboardKpis('owner')).resolves.toMatchObject({
      currentMonth: { netCents: 0 }, totalSavingsCents: 0, totalDebtCents: 0,
    });
  });

  it('preserves intentional recent-ten browsing without requiring a complete history', async () => {
    const queries = configure({ transactions: { data: [], count: null } });
    await expect(fetchRecentDashboardTransactions('owner')).resolves.toEqual([]);
    expect(queries.transactions.limit).toHaveBeenCalledWith(10);
    expect(queries.transactions.select).toHaveBeenCalledWith(expect.any(String));
  });

  it('propagates backend failure', async () => {
    configure({ transactions: { data: [], count: null, error: { message: 'Backend unavailable' } } });
    await expect(fetchDashboardKpis('owner')).rejects.toMatchObject({ message: 'Backend unavailable' });
  });
});
