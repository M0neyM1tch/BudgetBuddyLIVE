import { useMutation, useQuery } from '@tanstack/react-query';
import { AppError } from '../../../shared/api/errors';
import { queryClient } from '../../../shared/api/queryClient';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  allocateDebtPayment,
  archiveDebt,
  createDebt,
  deleteDebtPermanently,
  fetchActiveDebts,
  fetchDebts,
  restoreDebt,
  updateDebt,
  updateDebtPaymentTransaction,
} from '../api/debts.api';
import type { DebtContributionDraft, DebtDraft } from '../types/debts.types';

export const debtKeys = {
  all: ['debts'] as const,
  lists: () => [...debtKeys.all, 'list'] as const,
  list: (userId: string) => [...debtKeys.lists(), userId] as const,
  active: (userId: string) => [...debtKeys.all, 'active', userId] as const,
};

function useRequiredUserId(): string | null {
  return useAuth().user?.id ?? null;
}

function requireUserId(userId: string | null): string {
  if (!userId) {
    throw new AppError('You must be signed in to update debts.', 'AUTH_REQUIRED', 401);
  }

  return userId;
}

async function invalidateDebtSurfaces(userId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: debtKeys.list(userId) }),
    queryClient.invalidateQueries({ queryKey: debtKeys.active(userId) }),
    queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    queryClient.invalidateQueries({ queryKey: ['recurring-rules'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    queryClient.invalidateQueries({ queryKey: ['analytics'] }),
    queryClient.invalidateQueries({ queryKey: ['calculator'] }),
  ]);
}

export function useDebts() {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId ? debtKeys.list(userId) : debtKeys.lists(),
    queryFn: () => fetchDebts(requireUserId(userId)),
    enabled: Boolean(userId),
  });
}

export function useActiveDebts(enabled = true) {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId ? debtKeys.active(userId) : debtKeys.active(''),
    queryFn: () => fetchActiveDebts(requireUserId(userId)),
    enabled: Boolean(userId) && enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateDebt() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (draft: DebtDraft) => createDebt(requireUserId(userId), draft),
    onSuccess: async () => {
      await invalidateDebtSurfaces(requireUserId(userId));
    },
  });
}

export function useUpdateDebt() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DebtDraft> }) =>
      updateDebt(requireUserId(userId), id, updates),
    onSuccess: async () => {
      await invalidateDebtSurfaces(requireUserId(userId));
    },
  });
}

export function useArchiveDebt() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (id: string) => archiveDebt(requireUserId(userId), id),
    onSuccess: async () => {
      await invalidateDebtSurfaces(requireUserId(userId));
    },
  });
}

export function useRestoreDebt() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (id: string) => restoreDebt(requireUserId(userId), id),
    onSuccess: async () => {
      await invalidateDebtSurfaces(requireUserId(userId));
    },
  });
}

export function useDeleteDebtPermanently() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (id: string) => {
      requireUserId(userId);
      return deleteDebtPermanently(id);
    },
    onSuccess: async () => {
      await invalidateDebtSurfaces(requireUserId(userId));
    },
  });
}

export function useAllocateDebtPayment() {
  return useMutation({
    mutationFn: (draft: DebtContributionDraft) => allocateDebtPayment(draft),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: debtKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['calculator'] }),
      ]);
    },
  });
}

export function useUpdateDebtPaymentTransaction() {
  return useMutation({
    mutationFn: ({
      transactionId,
      patch,
    }: {
      transactionId: string;
      patch: Parameters<typeof updateDebtPaymentTransaction>[1];
    }) => updateDebtPaymentTransaction(transactionId, patch),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: debtKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['calculator'] }),
      ]);
    },
  });
}
