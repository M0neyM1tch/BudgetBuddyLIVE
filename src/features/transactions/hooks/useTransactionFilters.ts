import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { transactionFiltersSchema } from '../schemas/transactions.schema';
import type { TransactionFilters } from '../types/transactions.types';

const FILTER_KEYS = [
  'from',
  'to',
  'category',
  'debt_id',
  'kind',
  'amountMin',
  'amountMax',
  'q',
] as const;

function readFilters(searchParams: URLSearchParams): TransactionFilters {
  const rawFilters = {
    from: searchParams.get('from') || undefined,
    to: searchParams.get('to') || undefined,
    category: searchParams.get('category') || undefined,
    debt_id: searchParams.get('debt_id') || undefined,
    kind: searchParams.get('kind') || undefined,
    amountMin: searchParams.get('amountMin') || undefined,
    amountMax: searchParams.get('amountMax') || undefined,
    q: searchParams.get('q') || undefined,
  };

  const parsed = transactionFiltersSchema.safeParse(rawFilters);
  return parsed.success ? parsed.data : {};
}

function writeFilters(
  searchParams: URLSearchParams,
  nextFilters: TransactionFilters,
): URLSearchParams {
  const nextParams = new URLSearchParams(searchParams);
  FILTER_KEYS.forEach((key) => nextParams.delete(key));

  Object.entries(nextFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      nextParams.set(key, String(value));
    }
  });

  return nextParams;
}

export function useTransactionFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);

  const setFilters = useCallback(
    (updates: Partial<TransactionFilters>) => {
      const nextFilters = { ...filters, ...updates };
      const parsed = transactionFiltersSchema.safeParse(nextFilters);
      setSearchParams(writeFilters(searchParams, parsed.success ? parsed.data : nextFilters), {
        replace: true,
      });
    },
    [filters, searchParams, setSearchParams],
  );

  const clearFilters = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams);
    FILTER_KEYS.forEach((key) => nextParams.delete(key));
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  return {
    filters,
    hasFilters: FILTER_KEYS.some((key) => Boolean(filters[key])),
    setFilters,
    clearFilters,
  };
}
