import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AppError } from '../../../shared/api/errors';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  fetchAnalyticsDebts,
  fetchAnalyticsGoals,
  fetchAnalyticsTransactions,
} from '../api/analytics.api';
import { getPriorDateRange } from '../utils/analytics.utils';
import type { DateRange } from '../types/analytics.types';

export const analyticsKeys = {
  all: ['analytics'] as const,
  transactions: (userId: string, range: DateRange) =>
    [...analyticsKeys.all, 'transactions', userId, range.from, range.to] as const,
  priorTransactions: (userId: string, range: DateRange) =>
    [...analyticsKeys.all, 'prior-transactions', userId, range.from, range.to] as const,
  goals: (userId: string) => [...analyticsKeys.all, 'goals', userId] as const,
  debts: (userId: string) => [...analyticsKeys.all, 'debts', userId] as const,
};

function useRequiredUserId(): string | null {
  return useAuth().user?.id ?? null;
}

function requireUserId(userId: string | null): string {
  if (!userId) {
    throw new AppError('You must be signed in to view analytics.', 'AUTH_REQUIRED', 401);
  }

  return userId;
}

export function useAnalyticsTransactions(range: DateRange) {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId ? analyticsKeys.transactions(userId, range) : analyticsKeys.all,
    queryFn: () => fetchAnalyticsTransactions(requireUserId(userId), range),
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });
}

export function usePriorPeriodTransactions(range: DateRange) {
  const userId = useRequiredUserId();
  const priorRange = getPriorDateRange(range);

  return useQuery({
    queryKey: userId ? analyticsKeys.priorTransactions(userId, priorRange) : analyticsKeys.all,
    queryFn: () => fetchAnalyticsTransactions(requireUserId(userId), priorRange),
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });
}

export function useAnalyticsGoals() {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId ? analyticsKeys.goals(userId) : analyticsKeys.all,
    queryFn: () => fetchAnalyticsGoals(requireUserId(userId)),
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
  });
}

export function useAnalyticsDebts() {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId ? analyticsKeys.debts(userId) : analyticsKeys.all,
    queryFn: () => fetchAnalyticsDebts(requireUserId(userId)),
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
  });
}

export function useAnalytics(range: DateRange) {
  return {
    transactionsQuery: useAnalyticsTransactions(range),
    priorTransactionsQuery: usePriorPeriodTransactions(range),
    goalsQuery: useAnalyticsGoals(),
    debtsQuery: useAnalyticsDebts(),
  };
}
