import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DateRange } from '../types/analytics.types';
import { useAnalyticsTransactions, usePriorPeriodTransactions } from './useAnalytics';

const mocks = vi.hoisted(() => ({ fetchTransactions: vi.fn() }));
vi.mock('../../auth/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'owner' } }) }));
vi.mock('../api/analytics.api', () => ({ fetchAnalyticsTransactions: mocks.fetchTransactions }));

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => mocks.fetchTransactions.mockReset());

describe('analytics period changes', () => {
  it.each([
    ['current', useAnalyticsTransactions],
    ['comparison', usePriorPeriodTransactions],
  ] as const)('does not show the old %s totals for a pending or failed new period', async (_label, useHistory) => {
    mocks.fetchTransactions.mockResolvedValueOnce([{ id: 'old-period' }]);
    const { result, rerender } = renderHook(({ range }) => useHistory(range), {
      initialProps: { range: { from: '2026-07-01', to: '2026-07-31', preset: 'custom' } as DateRange }, wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    let rejectNext!: (reason: Error) => void;
    mocks.fetchTransactions.mockImplementationOnce(() => new Promise((_resolve, reject) => { rejectNext = reject; }));
    rerender({ range: { from: '2026-08-01', to: '2026-08-31', preset: 'custom' } });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    await act(async () => { rejectNext(new Error('Complete history unavailable')); });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
