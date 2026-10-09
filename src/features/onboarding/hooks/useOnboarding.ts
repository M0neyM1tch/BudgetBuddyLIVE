import { useCallback, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../../../shared/api/queryClient';
import { useAuth } from '../../auth';
import {
  completeOnboarding,
  fetchOnboardingPreferences,
  resetOnboardingPreferences,
  resetOnboardingWithCleanSlate,
  saveDismissedTooltips,
} from '../api/onboarding.api';
import type { OnboardingPreferences } from '../types/onboarding.types';

const LOCAL_TOOLTIP_KEY = 'bb_dismissed_tooltips';

export const onboardingKeys = {
  all: ['onboarding'] as const,
  preferences: (userId: string) => [...onboardingKeys.all, 'preferences', userId] as const,
};

function readLocalDismissedTooltips(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_TOOLTIP_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function writeLocalDismissedTooltips(ids: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_TOOLTIP_KEY, JSON.stringify(Array.from(new Set(ids))));
}

function mergeWithLocal(preferences: OnboardingPreferences): OnboardingPreferences {
  return {
    ...preferences,
    dismissed_tooltips: Array.from(
      new Set([...preferences.dismissed_tooltips, ...readLocalDismissedTooltips()]),
    ),
  };
}

function getCachedPreferences(userId: string): OnboardingPreferences | undefined {
  return queryClient.getQueryData<OnboardingPreferences>(onboardingKeys.preferences(userId));
}

function workspaceQueryKeys(userId: string) {
  return [
    onboardingKeys.preferences(userId), ['dashboard'], ['transactions'], ['analytics'],
    ['goals'], ['debts'], ['calculator'], ['goal-packs'],
  ];
}

export function useOnboardingPreferences() {
  const userId = useAuth().user?.id ?? null;

  return useQuery({
    queryKey: userId ? onboardingKeys.preferences(userId) : onboardingKeys.all,
    queryFn: () => fetchOnboardingPreferences(userId ?? '').then(mergeWithLocal),
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
  });
}

export function useCompleteOnboarding() {
  const userId = useAuth().user?.id ?? null;

  return useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('You must be signed in to complete onboarding.');
      return completeOnboarding(userId);
    },
    onSuccess: (preferences) => {
      queryClient.setQueryData(onboardingKeys.preferences(preferences.user_id), mergeWithLocal(preferences));
    },
  });
}

export function useResetOnboarding() {
  const userId = useAuth().user?.id ?? null;

  return useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('You must be signed in to reset onboarding.');
      writeLocalDismissedTooltips([]);
      return resetOnboardingPreferences(userId);
    },
    onSuccess: (preferences) => {
      queryClient.setQueryData(onboardingKeys.preferences(preferences.user_id), preferences);
    },
  });
}

export function useResetOnboardingWithCleanSlate() {
  const userId = useAuth().user?.id ?? null;

  return useMutation({
    // Retrying an unconfirmed commit could erase newly entered data.
    retry: false,
    onMutate: async () => {
      if (userId) {
        await Promise.all(workspaceQueryKeys(userId).map((queryKey) =>
          queryClient.cancelQueries({ queryKey })));
      }
    },
    mutationFn: () => {
      if (!userId) throw new Error('You must be signed in to reset onboarding.');
      return resetOnboardingWithCleanSlate(userId);
    },
    onSuccess: (preferences) => {
      writeLocalDismissedTooltips([]);
      queryClient.setQueryData(onboardingKeys.preferences(preferences.user_id), preferences);
    },
    onSettled: async () => {
      // Also reconcile an error whose HTTP response was lost after a commit.
      if (userId) {
        await Promise.all(workspaceQueryKeys(userId).map((queryKey) =>
          queryClient.invalidateQueries({ queryKey })));
      }
    },
  });
}

export function useDismissTooltip() {
  const userId = useAuth().user?.id ?? null;
  const timerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const mutation = useMutation({
    mutationFn: (tooltipIds: string[]) => {
      if (!userId) throw new Error('You must be signed in to dismiss tooltips.');
      return saveDismissedTooltips(userId, tooltipIds);
    },
    onSuccess: (preferences) => {
      queryClient.setQueryData(onboardingKeys.preferences(preferences.user_id), mergeWithLocal(preferences));
    },
  });
  const { isPending, mutate } = mutation;

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const dismissTooltip = useCallback(
    (tooltipId: string) => {
      if (!userId) return;

      const current = getCachedPreferences(userId);
      const dismissed = Array.from(
        new Set([...(current?.dismissed_tooltips ?? []), ...readLocalDismissedTooltips(), tooltipId]),
      );

      writeLocalDismissedTooltips(dismissed);
      queryClient.setQueryData<OnboardingPreferences>(onboardingKeys.preferences(userId), {
        user_id: userId,
        onboarding_completed_at: current?.onboarding_completed_at ?? null,
        dismissed_tooltips: dismissed,
      });

      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        mutate(dismissed);
      }, 500);
    },
    [mutate, userId],
  );

  return {
    dismissTooltip,
    isSaving: isPending,
  };
}
