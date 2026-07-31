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

function hasFilterValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

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

  const filters: TransactionFilters = {};

  for (const key of FILTER_KEYS) {
    const value = rawFilters[key];
    if (value === undefined) continue;

    // Validate each URL field independently. A malformed field must not erase
    // other valid filters while users correct or share a query string.
    const parsed = transactionFiltersSchema.safeParse({ [key]: value });
    if (parsed.success && parsed.data[key] !== undefined) {
      filters[key] = parsed.data[key] as never;
    }
  }

  // URL input can still combine otherwise valid values into an invalid range.
  // Retain the first boundary and discard only the conflicting later boundary.
  if (filters.from && filters.to && filters.from > filters.to) {
    delete filters.to;
  }
  if (
    filters.amountMin !== undefined &&
    filters.amountMax !== undefined &&
    filters.amountMin > filters.amountMax
  ) {
    delete filters.amountMax;
  }

  return filters;
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
      if (!parsed.success) return;

      setSearchParams(writeFilters(searchParams, parsed.data), { replace: true });
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
    hasFilters: FILTER_KEYS.some((key) => hasFilterValue(filters[key])),
    activeFilterCount: FILTER_KEYS.filter((key) => hasFilterValue(filters[key])).length,
    setFilters,
    clearFilters,
  };
}
