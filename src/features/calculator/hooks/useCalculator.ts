import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AppError } from '../../../shared/api/errors';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  fetchCalculatorGoals,
  fetchCalculatorRecurringRules,
  fetchCalculatorTransactions,
} from '../api/calculator.api';
import { lastSixFullMonthsRange } from '../utils/calculator.utils';

export const calculatorKeys = {
  all: ['calculator'] as const,
  transactions: (userId: string, from: string, to: string) =>
    [...calculatorKeys.all, 'transactions', userId, from, to] as const,
  recurringRules: (userId: string) =>
    [...calculatorKeys.all, 'recurring-rules', userId] as const,
  goals: (userId: string) => [...calculatorKeys.all, 'goals', userId] as const,
};

function useRequiredUserId(): string | null {
  return useAuth().user?.id ?? null;
}

function requireUserId(userId: string | null): string {
  if (!userId) {
    throw new AppError('You must be signed in to use calculators.', 'AUTH_REQUIRED', 401);
  }

  return userId;
}

export function useCalculatorTransactions(range = lastSixFullMonthsRange()) {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId
      ? calculatorKeys.transactions(userId, range.from, range.to)
      : calculatorKeys.all,
    queryFn: () => fetchCalculatorTransactions(requireUserId(userId), range.from, range.to),
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });
}

export function useCalculatorRecurringRules() {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId ? calculatorKeys.recurringRules(userId) : calculatorKeys.all,
    queryFn: () => fetchCalculatorRecurringRules(requireUserId(userId)),
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
  });
}

export function useCalculatorGoals() {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId ? calculatorKeys.goals(userId) : calculatorKeys.all,
    queryFn: () => fetchCalculatorGoals(requireUserId(userId)),
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
  });
}

export function useCalculatorPrefillData() {
  const range = lastSixFullMonthsRange();
  const transactionsQuery = useCalculatorTransactions(range);
  const recurringRulesQuery = useCalculatorRecurringRules();
  const goalsQuery = useCalculatorGoals();

  return {
    data: {
      transactions: transactionsQuery.data ?? [],
      recurringRules: recurringRulesQuery.data ?? [],
      goals: goalsQuery.data ?? [],
      historyRange: range,
    },
    error: transactionsQuery.error ?? recurringRulesQuery.error ?? goalsQuery.error,
    isError: transactionsQuery.isError || recurringRulesQuery.isError || goalsQuery.isError,
    isLoading:
      transactionsQuery.isLoading || recurringRulesQuery.isLoading || goalsQuery.isLoading,
    refetch: () => {
      void transactionsQuery.refetch();
      void recurringRulesQuery.refetch();
      void goalsQuery.refetch();
    },
  };
}
