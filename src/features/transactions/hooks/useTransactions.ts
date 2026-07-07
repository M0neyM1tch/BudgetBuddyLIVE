import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { AppError } from '../../../shared/api/errors';
import { queryClient } from '../../../shared/api/queryClient';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  createRecurringRule,
  createTransaction,
  deleteRecurringRule,
  deleteTransaction,
  fetchQuickAddChips,
  fetchRecurringRules,
  fetchTransactions,
  processDueRecurringRules,
  saveQuickAddChips,
  updateRecurringRule,
  updateTransaction,
} from '../api/transactions.api';
import { today } from '../../../shared/utils/dates';
import type {
  QuickAddChip,
  RecurringRuleDraft,
  RecurringRuleUpdate,
  TransactionDraft,
  TransactionFilters,
  TransactionUpdate,
} from '../types/transactions.types';

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (userId: string, filters: TransactionFilters) =>
    [...transactionKeys.lists(), userId, filters] as const,
  recurringRules: (userId: string) =>
    [...transactionKeys.all, 'recurring-rules', userId] as const,
  quickAddChips: (userId: string) =>
    [...transactionKeys.all, 'quick-add-chips', userId] as const,
  page: (userId: string, filters: TransactionFilters, page: number, pageSize: number) =>
    [...transactionKeys.list(userId, filters), page, pageSize] as const,
};

function useRequiredUserId(): string | null {
  return useAuth().user?.id ?? null;
}

function requireUserId(userId: string | null): string {
  if (!userId) {
    throw new AppError('You must be signed in to update transactions.', 'AUTH_REQUIRED', 401);
  }

  return userId;
}

async function invalidateTransactions(userId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: transactionKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: transactionKeys.recurringRules(userId) }),
    queryClient.invalidateQueries({ queryKey: ['debts'] }),
    queryClient.invalidateQueries({ queryKey: ['goals'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    queryClient.invalidateQueries({ queryKey: ['analytics'] }),
    queryClient.invalidateQueries({ queryKey: ['calculator'] }),
  ]);
}

export function useTransactionsPage(filters: TransactionFilters, page = 0, pageSize = 25) {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId
      ? transactionKeys.page(userId, filters, page, pageSize)
      : transactionKeys.lists(),
    queryFn: () => fetchTransactions(requireUserId(userId), filters, page, pageSize),
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
  });
}

export function useTransactions(filters: TransactionFilters) {
  const query = useTransactionsPage(filters, 0, 500);

  return {
    ...query,
    data: query.data?.rows,
  };
}

export function useCreateTransaction() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (draft: TransactionDraft) => createTransaction(requireUserId(userId), draft),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: ['debts'] }),
        queryClient.invalidateQueries({ queryKey: ['goals'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['calculator'] }),
      ]);
    },
  });
}

export function useUpdateTransaction() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TransactionUpdate }) =>
      updateTransaction(requireUserId(userId), id, updates),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: ['debts'] }),
        queryClient.invalidateQueries({ queryKey: ['goals'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['calculator'] }),
      ]);
    },
  });
}

export function useDeleteTransaction() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(requireUserId(userId), id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: ['debts'] }),
        queryClient.invalidateQueries({ queryKey: ['goals'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['calculator'] }),
      ]);
    },
  });
}

export function useRecurringRules() {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId ? transactionKeys.recurringRules(userId) : transactionKeys.recurringRules(''),
    queryFn: () => fetchRecurringRules(requireUserId(userId)),
    enabled: Boolean(userId),
  });
}

export function useCreateRecurringRule() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (draft: RecurringRuleDraft) => createRecurringRule(requireUserId(userId), draft),
    onSuccess: async () => {
      await invalidateTransactions(requireUserId(userId));
    },
  });
}

export function useUpdateRecurringRule() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: RecurringRuleUpdate }) =>
      updateRecurringRule(requireUserId(userId), id, updates),
    onSuccess: async () => {
      await invalidateTransactions(requireUserId(userId));
    },
  });
}

export function useDeleteRecurringRule() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (id: string) => deleteRecurringRule(requireUserId(userId), id),
    onSuccess: async () => {
      await invalidateTransactions(requireUserId(userId));
    },
  });
}

export function useProcessRecurringRules() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: ({ throughDate }: { throughDate?: string } = {}) => {
      requireUserId(userId);
      return processDueRecurringRules(throughDate ?? today());
    },
    onSuccess: async () => {
      await invalidateTransactions(requireUserId(userId));
    },
  });
}

export function useQuickAddChips() {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId ? transactionKeys.quickAddChips(userId) : transactionKeys.quickAddChips(''),
    queryFn: () => fetchQuickAddChips(requireUserId(userId)),
    enabled: Boolean(userId),
  });
}

export function useSaveQuickAddChips() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (chips: QuickAddChip[]) => saveQuickAddChips(requireUserId(userId), chips),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: transactionKeys.quickAddChips(requireUserId(userId)),
      });
    },
  });
}
