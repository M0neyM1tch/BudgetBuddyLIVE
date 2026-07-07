import { useQuery } from '@tanstack/react-query';
import { AppError } from '../../../shared/api/errors';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  fetchDashboardDebts,
  fetchDashboardGoals,
  fetchDashboardKpis,
  fetchRecentDashboardTransactions,
} from '../api/dashboard.api';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  kpis: (userId: string) => [...dashboardKeys.all, 'kpis', userId] as const,
  goals: (userId: string) => [...dashboardKeys.all, 'goals', userId] as const,
  debts: (userId: string) => [...dashboardKeys.all, 'debts', userId] as const,
  recentTransactions: (userId: string) =>
    [...dashboardKeys.all, 'recent-transactions', userId] as const,
};

function useRequiredUserId(): string | null {
  return useAuth().user?.id ?? null;
}

function requireUserId(userId: string | null): string {
  if (!userId) {
    throw new AppError('You must be signed in to view the dashboard.', 'AUTH_REQUIRED', 401);
  }

  return userId;
}

export function useDashboardKpis() {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId ? dashboardKeys.kpis(userId) : dashboardKeys.all,
    queryFn: () => fetchDashboardKpis(requireUserId(userId)),
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
  });
}

export function useDashboardGoals() {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId ? dashboardKeys.goals(userId) : dashboardKeys.all,
    queryFn: () => fetchDashboardGoals(requireUserId(userId)),
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
  });
}

export function useDashboardDebts() {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId ? dashboardKeys.debts(userId) : dashboardKeys.all,
    queryFn: () => fetchDashboardDebts(requireUserId(userId)),
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
  });
}

export function useRecentDashboardTransactions() {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId ? dashboardKeys.recentTransactions(userId) : dashboardKeys.all,
    queryFn: () => fetchRecentDashboardTransactions(requireUserId(userId)),
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
  });
}

export function useDashboard() {
  return {
    kpisQuery: useDashboardKpis(),
    goalsQuery: useDashboardGoals(),
    debtsQuery: useDashboardDebts(),
    recentTransactionsQuery: useRecentDashboardTransactions(),
  };
}
