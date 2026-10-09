import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../../../shared/api/errors';
import type { TransactionFilters } from '../types/transactions.types';
import { useTransactions } from './useTransactions';

const mocks = vi.hoisted(() => ({ fetchHistory: vi.fn() }));
vi.mock('../../auth/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'owner' } }) }));
vi.mock('../api/transactions.api', () => ({ fetchCompleteTransactionHistory: mocks.fetchHistory }));

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => mocks.fetchHistory.mockReset());

describe('complete history consumers', () => {
  it('removes cached history when a refresh cannot verify a complete response', async () => {
    mocks.fetchHistory.mockResolvedValueOnce([{ id: 'previously-complete' }]);
    const { result } = renderHook(() => useTransactions({}), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 'previously-complete' }]);

    mocks.fetchHistory.mockRejectedValueOnce(new AppError('Complete history unavailable', 'INCOMPLETE_DATA'));
    await act(async () => { await result.current.refetch(); });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toMatchObject({ code: 'INCOMPLETE_DATA' });
  });

  it('does not reuse another filter history while the new request is pending', async () => {
    mocks.fetchHistory.mockResolvedValueOnce([{ id: 'old-filter' }]);
    const { result, rerender } = renderHook(({ filters }) => useTransactions(filters), {
      initialProps: { filters: {} as TransactionFilters }, wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    let resolveNext!: (value: unknown[]) => void;
    mocks.fetchHistory.mockImplementationOnce(() => new Promise((resolve) => { resolveNext = resolve; }));
    rerender({ filters: { category: 'debt_payment' } });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    await act(async () => { resolveNext([]); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
