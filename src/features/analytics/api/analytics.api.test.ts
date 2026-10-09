import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DateRange } from '../types/analytics.types';

const fromMock = vi.fn();
vi.mock('../../../shared/lib/supabase', () => ({ supabase: { from: fromMock } }));
const { fetchAnalyticsTransactions, fetchAnalyticsGoals, fetchAnalyticsDebts } = await import('./analytics.api');

function respond(data: unknown[], count: number | null, error: unknown = null) {
  const query = Object.assign(Promise.resolve({ data, count, error }), {
    select: vi.fn(), eq: vi.fn(), gte: vi.fn(), lte: vi.fn(), order: vi.fn(),
  });
  for (const step of [query.select, query.eq, query.gte, query.lte, query.order]) step.mockReturnValue(query);
  fromMock.mockReturnValue(query);
  return query;
}

beforeEach(() => fromMock.mockReset());

describe('complete analytics data', () => {
  const range: DateRange = { from: '2026-07-01', to: '2026-07-31', preset: 'custom' };

  it('preserves owner/date filters and maps a complete result', async () => {
    const query = respond([{ id: 'row', transaction_date: range.from, amount_cents: 123, kind: 'income', category: 'pay' }], 1);
    await expect(fetchAnalyticsTransactions('owner', range)).resolves.toEqual([
      { id: 'row', date: range.from, amountCents: 123, kind: 'income', category: 'pay' },
    ]);
    expect(query.eq).toHaveBeenCalledWith('user_id', 'owner');
    expect(query.gte).toHaveBeenCalledWith('transaction_date', range.from);
    expect(query.lte).toHaveBeenCalledWith('transaction_date', range.to);
  });

  it('refuses a server-capped response instead of returning partial charts', async () => {
    respond(Array.from({ length: 1_000 }, (_, id) => ({ id })), 1_001);
    await expect(fetchAnalyticsTransactions('owner', range)).rejects.toMatchObject({ code: 'INCOMPLETE_DATA' });
  });

  it.each([
    ['transactions', () => fetchAnalyticsTransactions('owner', range)],
    ['goals', () => fetchAnalyticsGoals('owner')],
    ['debts', () => fetchAnalyticsDebts('owner')],
  ] as const)('requires an exact complete response for %s', async (_label, fetchRows) => {
    for (const count of [1, null]) {
      const query = respond([], count);
      await expect(fetchRows()).rejects.toMatchObject({ code: 'INCOMPLETE_DATA' });
      expect(query.select).toHaveBeenCalledWith(expect.any(String), { count: 'exact' });
    }
    respond([], 0);
    await expect(fetchRows()).resolves.toEqual([]);
  });

  it('propagates backend failure', async () => {
    respond([], null, { message: 'Backend unavailable', code: '503' });
    await expect(fetchAnalyticsTransactions('owner', range)).rejects.toMatchObject({ message: 'Backend unavailable' });
  });
});
