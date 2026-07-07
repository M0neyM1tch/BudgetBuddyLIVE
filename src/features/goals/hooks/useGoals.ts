import { useMutation, useQuery } from '@tanstack/react-query';
import { AppError } from '../../../shared/api/errors';
import { queryClient } from '../../../shared/api/queryClient';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  allocateToGoal,
  archiveGoal,
  createGoal,
  deleteGoalPermanently,
  fetchGoals,
  restoreGoal,
  updateGoal,
} from '../api/goals.api';
import type {
  GoalContributionDraft,
  GoalDraft,
  GoalWithProgress,
} from '../types/goals.types';

export const goalKeys = {
  all: ['goals'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  list: (userId: string) => [...goalKeys.lists(), userId] as const,
};

function useRequiredUserId(): string | null {
  return useAuth().user?.id ?? null;
}

function requireUserId(userId: string | null): string {
  if (!userId) {
    throw new AppError('You must be signed in to update goals.', 'AUTH_REQUIRED', 401);
  }

  return userId;
}

async function invalidateGoalSurfaces(userId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: goalKeys.list(userId) }),
    queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    queryClient.invalidateQueries({ queryKey: ['recurring-rules'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    queryClient.invalidateQueries({ queryKey: ['analytics'] }),
    queryClient.invalidateQueries({ queryKey: ['calculator'] }),
  ]);
}

export function useGoals() {
  const userId = useRequiredUserId();

  return useQuery({
    queryKey: userId ? goalKeys.list(userId) : goalKeys.lists(),
    queryFn: () => fetchGoals(requireUserId(userId)),
    enabled: Boolean(userId),
  });
}

export function useCreateGoal() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (draft: GoalDraft) => createGoal(requireUserId(userId), draft),
    onSuccess: async () => {
      await invalidateGoalSurfaces(requireUserId(userId));
    },
  });
}

export function useUpdateGoal() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<GoalDraft> }) =>
      updateGoal(requireUserId(userId), id, updates),
    onSuccess: async () => {
      await invalidateGoalSurfaces(requireUserId(userId));
    },
  });
}

export function useArchiveGoal() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (id: string) => archiveGoal(requireUserId(userId), id),
    onSuccess: async () => {
      await invalidateGoalSurfaces(requireUserId(userId));
    },
  });
}

export function useRestoreGoal() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (id: string) => restoreGoal(requireUserId(userId), id),
    onSuccess: async () => {
      await invalidateGoalSurfaces(requireUserId(userId));
    },
  });
}

export function useDeleteGoalPermanently() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (id: string) => {
      requireUserId(userId);
      return deleteGoalPermanently(id);
    },
    onSuccess: async () => {
      await invalidateGoalSurfaces(requireUserId(userId));
    },
  });
}

export function useAllocateToGoal() {
  const userId = useRequiredUserId();

  return useMutation({
    mutationFn: (draft: GoalContributionDraft) => allocateToGoal(draft),
    onMutate: async (draft) => {
      const resolvedUserId = requireUserId(userId);
      const queryKey = goalKeys.list(resolvedUserId);

      await queryClient.cancelQueries({ queryKey });
      const previousGoals = queryClient.getQueryData<GoalWithProgress[]>(queryKey);

      queryClient.setQueryData<GoalWithProgress[]>(queryKey, (current) =>
        current?.map((goal) =>
          goal.id === draft.goal_id
            ? {
                ...goal,
                current_amount_cents: goal.current_amount_cents + draft.amount_cents,
                amount_remaining_cents: Math.max(
                  0,
                  goal.amount_remaining_cents - draft.amount_cents,
                ),
                progress_pct: Math.min(
                  100,
                  ((goal.current_amount_cents + draft.amount_cents) /
                    goal.target_amount_cents) *
                    100,
                ),
              }
            : goal,
        ),
      );

      return { previousGoals, queryKey };
    },
    onError: (_error, _draft, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(context.queryKey, context.previousGoals);
      }
    },
    onSettled: async () => {
      await invalidateGoalSurfaces(requireUserId(userId));
    },
  });
}
