import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCalculatorTransactions } from './useCalculator';

const mocks = vi.hoisted(() => ({ fetchTransactions: vi.fn() }));
vi.mock('../../auth/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'owner' } }) }));
vi.mock('../api/calculator.api', () => ({ fetchCalculatorTransactions: mocks.fetchTransactions }));

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => mocks.fetchTransactions.mockReset());

describe('calculator history changes', () => {
  it('does not retain old history for a pending or failed new period', async () => {
    mocks.fetchTransactions.mockResolvedValueOnce([{ id: 'old-period' }]);
    const { result, rerender } = renderHook(({ range }) => useCalculatorTransactions(range), {
      initialProps: { range: { from: '2026-01-01', to: '2026-06-30' } }, wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    let rejectNext!: (reason: Error) => void;
    mocks.fetchTransactions.mockImplementationOnce(() => new Promise((_resolve, reject) => { rejectNext = reject; }));
    rerender({ range: { from: '2026-02-01', to: '2026-07-31' } });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    await act(async () => { rejectNext(new Error('Complete history unavailable')); });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
