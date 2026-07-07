import { useMutation, useQuery } from '@tanstack/react-query';
import { AppError } from '../../../shared/api/errors';
import { queryClient } from '../../../shared/api/queryClient';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  completeGoalAction,
  createGoalAction,
  createGoalPackOnboardingSetup,
  createGoalPlanSnapshot,
  dismissGoalAction,
  fetchActiveFinancialPriority,
  fetchGoalActions,
  fetchGoalPackDashboardData,
  fetchGoalPlanSnapshots,
  recalculateActiveGoalPlan,
  recalculateGoalPlan,
  updateFinancialPriority,
  updateGoalAction,
  updateGoalPlanFields,
  upsertFinancialPriority,
  type CompleteGoalActionOptions,
  type FetchGoalActionsOptions,
  type GoalPackOnboardingSetupDraft,
  type RecalculateGoalPlanOptions,
  type DismissGoalActionOptions,
} from '../api/goalPacks.api';
import type {
  FinancialPriorityDraft,
  FinancialPriorityUpdateDraft,
  GoalActionDraft,
  GoalActionUpdateDraft,
  GoalPlanGoalUpdateDraft,
  GoalPlanSnapshotDraft,
} from '../schemas/goalPacks.schema';

export const goalPackKeys = {
  all: ['goal-packs'] as const,
  priority: (userId: string) => [...goalPackKeys.all, 'priority', userId] as const,
  dashboard: (userId: string) => [...goalPackKeys.all, 'dashboard', userId] as const,
  snapshots: (userId: string, goalId: string, limit: number) =>
    [...goalPackKeys.all, 'snapshots', userId, goalId, limit] as const,
  actions: (userId: string, options: FetchGoalActionsOptions) =>
    [...goalPackKeys.all, 'actions', userId, options] as const,
};

function useRequiredUserId(): string | null {
  return useAuth().user?.id ?? null;
}

function requireUserId(userId: string | null): string {
  if (!userId) {
    throw new AppError('You must be signed in to update Goal Packs.', 'AUTH_REQUIRED', 401);
  }

  return userId;
}

async function invalidateGoalPackSurfaces(userId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: goalPackKeys.all }),
    queryClient.invalidateQueries({ queryKey: ['goals', 'list', userId] }),
    queryClient.invalidateQueries({ queryKey: ['debts'] }),
    queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    queryClient.invalidateQueries({ queryKey: ['analytics'] }),
    queryClient.invalidateQueries({ queryKey: ['calculator'] }),
  ]);
}

export function useActiveFinancialPriority() {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId ? goalPackKeys.priority(userId) : goalPackKeys.all,
    queryFn: () => fetchActiveFinancialPriority(requireUserId(userId)),
    enabled: Boolean(userId),
  });
}

export function useGoalPackDashboard() {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId ? goalPackKeys.dashboard(userId) : goalPackKeys.all,
    queryFn: () => fetchGoalPackDashboardData(requireUserId(userId)),
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
  });
}

export function useUpsertFinancialPriority() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (draft: FinancialPriorityDraft) =>
      upsertFinancialPriority(requireUserId(userId), draft),
    onSuccess: async () => {
      await invalidateGoalPackSurfaces(requireUserId(userId));
    },
  });
}

export function useCreateGoalPackOnboardingSetup() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (draft: GoalPackOnboardingSetupDraft) =>
      createGoalPackOnboardingSetup(requireUserId(userId), draft),
    onSuccess: async () => {
      await invalidateGoalPackSurfaces(requireUserId(userId));
    },
  });
}

export function useUpdateFinancialPriority() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (updates: FinancialPriorityUpdateDraft) =>
      updateFinancialPriority(requireUserId(userId), updates),
    onSuccess: async () => {
      await invalidateGoalPackSurfaces(requireUserId(userId));
    },
  });
}

export function useUpdateGoalPlanFields() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: ({ goalId, updates }: { goalId: string; updates: GoalPlanGoalUpdateDraft }) =>
      updateGoalPlanFields(requireUserId(userId), goalId, updates),
    onSuccess: async () => {
      await invalidateGoalPackSurfaces(requireUserId(userId));
    },
  });
}

export function useGoalPlanSnapshots(goalId: string | null | undefined, limit = 5) {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId && goalId ? goalPackKeys.snapshots(userId, goalId, limit) : goalPackKeys.all,
    queryFn: () => fetchGoalPlanSnapshots(requireUserId(userId), goalId as string, limit),
    enabled: Boolean(userId && goalId),
  });
}

export function useCreateGoalPlanSnapshot() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (draft: GoalPlanSnapshotDraft) =>
      createGoalPlanSnapshot(requireUserId(userId), draft),
    onSuccess: async () => {
      await invalidateGoalPackSurfaces(requireUserId(userId));
    },
  });
}

export function useRecalculateGoalPlan() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: ({
      goalId,
      options,
    }: {
      goalId: string;
      options?: RecalculateGoalPlanOptions;
    }) => recalculateGoalPlan(requireUserId(userId), goalId, options),
    onSuccess: async () => {
      await invalidateGoalPackSurfaces(requireUserId(userId));
    },
  });
}

export function useRecalculateActiveGoalPlan() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (options?: RecalculateGoalPlanOptions) =>
      recalculateActiveGoalPlan(requireUserId(userId), options),
    onSuccess: async () => {
      await invalidateGoalPackSurfaces(requireUserId(userId));
    },
  });
}

export function useGoalActions(options: FetchGoalActionsOptions = {}) {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId ? goalPackKeys.actions(userId, options) : goalPackKeys.all,
    queryFn: () => fetchGoalActions(requireUserId(userId), options),
    enabled: Boolean(userId),
  });
}

export function useCreateGoalAction() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (draft: GoalActionDraft) => createGoalAction(requireUserId(userId), draft),
    onSuccess: async () => {
      await invalidateGoalPackSurfaces(requireUserId(userId));
    },
  });
}

export function useUpdateGoalAction() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: ({ actionId, updates }: { actionId: string; updates: GoalActionUpdateDraft }) =>
      updateGoalAction(requireUserId(userId), actionId, updates),
    onSuccess: async () => {
      await invalidateGoalPackSurfaces(requireUserId(userId));
    },
  });
}

export function useCompleteGoalAction() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: ({
      actionId,
      options,
    }: {
      actionId: string;
      options?: CompleteGoalActionOptions;
    }) => completeGoalAction(requireUserId(userId), actionId, options),
    onSuccess: async () => {
      await invalidateGoalPackSurfaces(requireUserId(userId));
    },
  });
}

export function useDismissGoalAction() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: ({
      actionId,
      options,
    }: {
      actionId: string;
      options?: DismissGoalActionOptions;
    }) => dismissGoalAction(requireUserId(userId), actionId, options),
    onSuccess: async () => {
      await invalidateGoalPackSurfaces(requireUserId(userId));
    },
  });
}
