import { AppError, normalizeError } from '../../../shared/api/errors';
import { supabase } from '../../../shared/lib/supabase';
import type { Json } from '../../../types/database.types';
import type { OnboardingPreferences } from '../types/onboarding.types';

function raise(error: unknown, fallback = 'Onboarding request failed'): never {
  const normalized = normalizeError(error);
  throw new AppError(normalized.message || fallback, normalized.code, normalized.status);
}

function normalizeDismissedTooltips(value: string[] | null | undefined): string[] {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

export async function fetchOnboardingPreferences(
  userId: string,
): Promise<OnboardingPreferences> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('user_id,onboarding_completed_at,dismissed_tooltips')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) raise(error, 'Unable to load onboarding preferences');

  return {
    user_id: userId,
    onboarding_completed_at: data?.onboarding_completed_at ?? null,
    dismissed_tooltips: normalizeDismissedTooltips(data?.dismissed_tooltips),
  };
}

export async function completeOnboarding(
  userId: string,
  completedAt = new Date().toISOString(),
): Promise<OnboardingPreferences> {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        onboarding_completed_at: completedAt,
      },
      { onConflict: 'user_id' },
    )
    .select('user_id,onboarding_completed_at,dismissed_tooltips')
    .single();

  if (error) raise(error, 'Unable to save onboarding status');

  return {
    user_id: userId,
    onboarding_completed_at: data.onboarding_completed_at,
    dismissed_tooltips: normalizeDismissedTooltips(data.dismissed_tooltips),
  };
}

export async function saveDismissedTooltips(
  userId: string,
  tooltipIds: string[],
): Promise<OnboardingPreferences> {
  const dismissed = Array.from(new Set(tooltipIds.filter(Boolean)));
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        dismissed_tooltips: dismissed,
      },
      { onConflict: 'user_id' },
    )
    .select('user_id,onboarding_completed_at,dismissed_tooltips')
    .single();

  if (error) raise(error, 'Unable to save tooltip preferences');

  return {
    user_id: userId,
    onboarding_completed_at: data.onboarding_completed_at,
    dismissed_tooltips: normalizeDismissedTooltips(data.dismissed_tooltips),
  };
}

export async function resetOnboardingPreferences(userId: string): Promise<OnboardingPreferences> {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        onboarding_completed_at: null,
        dismissed_tooltips: [],
      },
      { onConflict: 'user_id' },
    )
    .select('user_id,onboarding_completed_at,dismissed_tooltips')
    .single();

  if (error) raise(error, 'Unable to reset onboarding');

  return {
    user_id: userId,
    onboarding_completed_at: data.onboarding_completed_at,
    dismissed_tooltips: normalizeDismissedTooltips(data.dismissed_tooltips),
  };
}

type WorkspaceResetTable =
  | 'debts'
  | 'financial_priorities'
  | 'goal_actions'
  | 'goal_plan_snapshots'
  | 'goals'
  | 'recurring_rules'
  | 'transactions';

async function deleteOwnedRows(
  table: WorkspaceResetTable,
  userId: string,
  fallback: string,
) {
  const { error } = await supabase.from(table).delete().eq('user_id', userId);

  if (error) raise(error, fallback);
}

export async function resetOnboardingWithCleanSlate(
  userId: string,
): Promise<OnboardingPreferences> {
  await deleteOwnedRows('goal_actions', userId, 'Unable to clear Goal Pack actions');
  await deleteOwnedRows('goal_plan_snapshots', userId, 'Unable to clear Goal Pack snapshots');
  await deleteOwnedRows('financial_priorities', userId, 'Unable to clear active priority');
  await deleteOwnedRows('transactions', userId, 'Unable to clear transactions');
  await deleteOwnedRows('recurring_rules', userId, 'Unable to clear recurring rules');
  await deleteOwnedRows('goals', userId, 'Unable to clear goals');
  await deleteOwnedRows('debts', userId, 'Unable to clear debts');

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        onboarding_completed_at: null,
        dismissed_tooltips: [],
        quick_add_chips: [] as Json,
      },
      { onConflict: 'user_id' },
    )
    .select('user_id,onboarding_completed_at,dismissed_tooltips')
    .single();

  if (error) raise(error, 'Unable to reset onboarding with a clean slate');

  return {
    user_id: userId,
    onboarding_completed_at: data.onboarding_completed_at,
    dismissed_tooltips: normalizeDismissedTooltips(data.dismissed_tooltips),
  };
}
